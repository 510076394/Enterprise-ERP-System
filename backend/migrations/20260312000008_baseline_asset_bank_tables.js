/**
 * 基线迁移（二期补充）- 固定资产与银行账户表
 * @description 固定资产、资产类别、折旧、调拨、银行账户与交易
 * 注意：使用 CREATE TABLE IF NOT EXISTS 确保幂等性
 */

exports.up = async function(knex) {
  // ===== 固定资产模块 =====
  await knex.raw(`
    CREATE TABLE IF NOT EXISTS asset_categories (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL COMMENT '类别名称',
      code VARCHAR(50) NOT NULL COMMENT '类别编码',
      default_useful_life INT NOT NULL DEFAULT 5 COMMENT '默认使用年限',
      default_depreciation_method ENUM('直线法', '双倍余额递减法', '年数总和法', '工作量法', '不计提')
        NOT NULL DEFAULT '直线法' COMMENT '默认折旧方法',
      default_salvage_rate DECIMAL(5,2) NOT NULL DEFAULT 5.00 COMMENT '默认残值率(%)',
      description TEXT COMMENT '描述',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY (code),
      INDEX idx_name (name)
    )
  `);

  await knex.raw(`
    CREATE TABLE IF NOT EXISTS fixed_assets (
      id INT AUTO_INCREMENT PRIMARY KEY,
      asset_code VARCHAR(50) NOT NULL UNIQUE COMMENT '资产编码',
      asset_name VARCHAR(200) NOT NULL COMMENT '资产名称',
      asset_type VARCHAR(50) DEFAULT '其他' COMMENT '资产类型',
      category_id INT COMMENT '类别ID',
      acquisition_date DATE COMMENT '购置日期',
      acquisition_cost DECIMAL(15,2) DEFAULT 0 COMMENT '原值',
      depreciation_method VARCHAR(50) DEFAULT '直线法' COMMENT '折旧方法',
      useful_life INT DEFAULT 60 COMMENT '使用年限(月)',
      salvage_value DECIMAL(15,2) DEFAULT 0 COMMENT '残值',
      current_value DECIMAL(15,2) DEFAULT 0 COMMENT '净值',
      accumulated_depreciation DECIMAL(15,2) DEFAULT 0 COMMENT '累计折旧',
      impairment_amount DECIMAL(15,2) DEFAULT 0 COMMENT '减值准备',
      net_value DECIMAL(15,2) DEFAULT 0 COMMENT '净值',
      last_depreciation_date DATE COMMENT '最后折旧日期',
      location_id VARCHAR(100) COMMENT '存放位置',
      department_id INT COMMENT '使用部门ID',
      custodian VARCHAR(100) COMMENT '保管人',
      status VARCHAR(20) DEFAULT '在用' COMMENT '状态',
      audit_status VARCHAR(20) DEFAULT 'draft' COMMENT '审核状态',
      audited_by INT COMMENT '审核人',
      audited_at DATETIME COMMENT '审核时间',
      notes TEXT COMMENT '备注',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_asset_code (asset_code),
      INDEX idx_status (status),
      INDEX idx_category_id (category_id),
      INDEX idx_department_id (department_id)
    )
  `);

  await knex.raw(`
    CREATE TABLE IF NOT EXISTS asset_depreciation (
      id INT AUTO_INCREMENT PRIMARY KEY,
      asset_id INT NOT NULL,
      period_id INT NOT NULL,
      depreciation_date DATE NOT NULL,
      depreciation_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
      book_value_before DECIMAL(15,2) NOT NULL,
      book_value_after DECIMAL(15,2) NOT NULL,
      is_posted BOOLEAN NOT NULL DEFAULT FALSE,
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (asset_id) REFERENCES fixed_assets(id),
      INDEX idx_asset_period (asset_id, period_id)
    )
  `);

  await knex.raw(`
    CREATE TABLE IF NOT EXISTS fixed_asset_depreciation_details (
      id INT AUTO_INCREMENT PRIMARY KEY,
      asset_id INT NOT NULL,
      depreciation_date DATE NOT NULL,
      depreciation_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
      book_value_before DECIMAL(15,2) COMMENT '折旧前净值',
      book_value_after DECIMAL(15,2) COMMENT '折旧后净值',
      voucher_no VARCHAR(50) COMMENT '关联凭证号',
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (asset_id) REFERENCES fixed_assets(id),
      INDEX idx_asset_id (asset_id),
      INDEX idx_depreciation_date (depreciation_date)
    )
  `);

  await knex.raw(`
    CREATE TABLE IF NOT EXISTS asset_transfers (
      id INT AUTO_INCREMENT PRIMARY KEY,
      asset_id INT NOT NULL,
      transfer_date DATE NOT NULL,
      from_department_id INT,
      to_department_id INT,
      from_responsible VARCHAR(100),
      to_responsible VARCHAR(100) NOT NULL,
      from_location VARCHAR(100),
      to_location VARCHAR(100) NOT NULL,
      reason VARCHAR(200),
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (asset_id) REFERENCES fixed_assets(id),
      INDEX idx_asset_id (asset_id)
    )
  `);

  // ===== 银行/现金模块 =====
  await knex.raw(`
    CREATE TABLE IF NOT EXISTS bank_accounts (
      id INT AUTO_INCREMENT PRIMARY KEY,
      account_number VARCHAR(50) NOT NULL,
      account_name VARCHAR(100) NOT NULL,
      bank_name VARCHAR(100) NOT NULL,
      branch_name VARCHAR(100),
      account_type VARCHAR(50) DEFAULT '活期',
      current_balance DECIMAL(15,2) DEFAULT 0,
      opening_balance DECIMAL(15,2) DEFAULT 0,
      currency_code VARCHAR(10) DEFAULT 'CNY',
      is_active BOOLEAN DEFAULT true,
      contact_person VARCHAR(50),
      contact_phone VARCHAR(20),
      notes TEXT,
      last_transaction_date DATE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      created_by INT,
      updated_by INT,
      INDEX (account_number),
      INDEX (bank_name)
    )
  `);

  await knex.raw(`
    CREATE TABLE IF NOT EXISTS bank_transactions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      transaction_number VARCHAR(50) NOT NULL,
      bank_account_id INT NOT NULL,
      transaction_date DATE NOT NULL,
      transaction_type VARCHAR(20) NOT NULL COMMENT '交易类型',
      amount DECIMAL(15,2) NOT NULL,
      description TEXT,
      reference_number VARCHAR(50),
      is_reconciled BOOLEAN DEFAULT false,
      reconciliation_date DATE,
      related_party VARCHAR(100),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      created_by INT,
      updated_by INT,
      INDEX (transaction_number),
      INDEX (bank_account_id),
      INDEX (transaction_date),
      INDEX (is_reconciled),
      FOREIGN KEY (bank_account_id) REFERENCES bank_accounts(id) ON DELETE RESTRICT
    )
  `);
};

exports.down = async function(knex) {
  const tables = [
    'bank_transactions', 'bank_accounts',
    'asset_transfers', 'fixed_asset_depreciation_details',
    'asset_depreciation', 'fixed_assets', 'asset_categories'
  ];
  for (const table of tables) {
    await knex.raw(`DROP TABLE IF EXISTS \`${table}\``);
  }
};
