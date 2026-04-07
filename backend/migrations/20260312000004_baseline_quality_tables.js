/**
 * 基线迁移 - 质量管理表
 * @description 不合格品处理相关表：报废记录、返工任务、换货订单、质量成本
 */

exports.up = async function(knex) {
  // 报废记录表
  await knex.raw(`
    CREATE TABLE IF NOT EXISTS scrap_records (
      id INT AUTO_INCREMENT PRIMARY KEY,
      scrap_no VARCHAR(50) UNIQUE NOT NULL,
      ncp_id INT,
      ncp_no VARCHAR(50),
      material_id INT,
      material_code VARCHAR(50),
      material_name VARCHAR(200),
      quantity DECIMAL(10,2) NOT NULL,
      scrap_reason TEXT,
      scrap_cost DECIMAL(10,2) DEFAULT 0,
      disposal_method TEXT,
      status ENUM('pending', 'completed', 'cancelled') DEFAULT 'pending',
      created_by VARCHAR(50),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (ncp_id) REFERENCES nonconforming_products(id)
    )
  `);

  // 返工任务表
  await knex.raw(`
    CREATE TABLE IF NOT EXISTS rework_tasks (
      id INT AUTO_INCREMENT PRIMARY KEY,
      rework_no VARCHAR(50) UNIQUE NOT NULL,
      ncp_id INT,
      ncp_no VARCHAR(50),
      material_id INT,
      material_code VARCHAR(50),
      material_name VARCHAR(200),
      quantity DECIMAL(10,2) NOT NULL,
      rework_reason TEXT,
      rework_instructions TEXT,
      planned_date DATE,
      actual_date DATE,
      rework_cost DECIMAL(10,2) DEFAULT 0,
      status ENUM('pending', 'in_progress', 'completed', 'cancelled') DEFAULT 'pending',
      assigned_to VARCHAR(50),
      created_by VARCHAR(50),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (ncp_id) REFERENCES nonconforming_products(id)
    )
  `);

  // 换货订单表
  await knex.raw(`
    CREATE TABLE IF NOT EXISTS replacement_orders (
      id INT AUTO_INCREMENT PRIMARY KEY,
      replacement_no VARCHAR(50) UNIQUE NOT NULL,
      ncp_id INT,
      ncp_no VARCHAR(50),
      supplier_id INT,
      supplier_name VARCHAR(200),
      material_id INT,
      material_code VARCHAR(50),
      material_name VARCHAR(200),
      quantity DECIMAL(10,2) NOT NULL,
      replacement_reason TEXT,
      expected_date DATE,
      actual_date DATE,
      status ENUM('pending', 'shipped', 'received', 'completed', 'cancelled') DEFAULT 'pending',
      created_by VARCHAR(50),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (ncp_id) REFERENCES nonconforming_products(id)
    )
  `);

  // 质量成本表
  await knex.raw(`
    CREATE TABLE IF NOT EXISTS quality_costs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      cost_type ENUM('rework', 'scrap', 'return', 'replacement') NOT NULL COMMENT '成本类型',
      reference_no VARCHAR(50) NOT NULL COMMENT '参考单号',
      material_code VARCHAR(50) COMMENT '物料编码',
      quantity DECIMAL(10,2) COMMENT '数量',
      cost DECIMAL(10,2) NOT NULL COMMENT '成本金额',
      operator VARCHAR(50) COMMENT '操作员',
      cost_date DATE NOT NULL COMMENT '成本日期',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX (cost_type),
      INDEX (reference_no),
      INDEX (cost_date)
    )
  `);
};

exports.down = async function(knex) {
  const tables = ['quality_costs', 'replacement_orders', 'rework_tasks', 'scrap_records'];
  for (const table of tables) {
    await knex.raw(`DROP TABLE IF EXISTS \`${table}\``);
  }
};
