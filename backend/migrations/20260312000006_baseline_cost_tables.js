/**
 * 基线迁移 - 成本核算与年结表
 * @description 标准成本、实际成本、成本设置、成本差异、期末余额、库存年结
 */

exports.up = async function(knex) {
  // 标准成本表
  await knex.raw(`
    CREATE TABLE IF NOT EXISTS standard_costs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      material_id INT,
      product_id INT,
      cost_element ENUM('material', 'labor', 'overhead') NOT NULL,
      standard_price DECIMAL(15,4) NOT NULL,
      effective_date DATE NOT NULL,
      expiry_date DATE,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX (material_id),
      INDEX (product_id),
      INDEX (effective_date),
      INDEX (is_active)
    )
  `);

  // 实际成本表
  await knex.raw(`
    CREATE TABLE IF NOT EXISTS actual_costs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      production_order_id INT NOT NULL,
      product_id INT NOT NULL,
      quantity DECIMAL(15,4) NOT NULL,
      material_cost DECIMAL(15,2) DEFAULT 0,
      labor_cost DECIMAL(15,2) DEFAULT 0,
      overhead_cost DECIMAL(15,2) DEFAULT 0,
      total_cost DECIMAL(15,2) DEFAULT 0,
      calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      calculated_by VARCHAR(100),
      UNIQUE KEY unique_production_order (production_order_id),
      INDEX (product_id),
      INDEX (calculated_at)
    )
  `);

  // 成本设置表
  await knex.raw(`
    CREATE TABLE IF NOT EXISTS cost_settings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      setting_name VARCHAR(100) NOT NULL COMMENT '设置名称',
      overhead_rate DECIMAL(10,4) DEFAULT 0.5 COMMENT '制造费用分摊率',
      labor_rate DECIMAL(10,2) DEFAULT 50.00 COMMENT '标准人工费率(元/小时)',
      costing_method ENUM('fifo', 'lifo', 'weighted_average', 'standard') DEFAULT 'weighted_average',
      wage_payment_method VARCHAR(50) DEFAULT 'hourly',
      piece_rate DECIMAL(10,2) DEFAULT 0,
      is_active BOOLEAN DEFAULT true,
      description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX (is_active)
    ) COMMENT='成本核算配置表'
  `);

  // 成本差异记录表
  await knex.raw(`
    CREATE TABLE IF NOT EXISTS cost_variance_records (
      id INT AUTO_INCREMENT PRIMARY KEY,
      task_id INT NOT NULL,
      product_id INT,
      quantity DECIMAL(15,2),
      standard_material_cost DECIMAL(15,2) DEFAULT 0,
      standard_labor_cost DECIMAL(15,2) DEFAULT 0,
      standard_overhead_cost DECIMAL(15,2) DEFAULT 0,
      standard_total_cost DECIMAL(15,2) DEFAULT 0,
      actual_material_cost DECIMAL(15,2) DEFAULT 0,
      actual_labor_cost DECIMAL(15,2) DEFAULT 0,
      actual_overhead_cost DECIMAL(15,2) DEFAULT 0,
      actual_total_cost DECIMAL(15,2) DEFAULT 0,
      material_variance DECIMAL(15,2) DEFAULT 0,
      labor_variance DECIMAL(15,2) DEFAULT 0,
      overhead_variance DECIMAL(15,2) DEFAULT 0,
      total_variance DECIMAL(15,2) DEFAULT 0,
      is_favorable TINYINT(1) DEFAULT 0,
      recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY uk_task (task_id),
      INDEX idx_product (product_id),
      INDEX idx_recorded (recorded_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='成本差异记录表'
  `);

  // 库存年度结存表
  await knex.raw(`
    CREATE TABLE IF NOT EXISTS inventory_year_end_balances (
      id INT AUTO_INCREMENT PRIMARY KEY,
      year INT NOT NULL COMMENT '会计年度',
      material_id INT NOT NULL COMMENT '物料ID',
      location_id INT NOT NULL COMMENT '仓库位置ID',
      opening_quantity DECIMAL(15,3) NOT NULL DEFAULT 0 COMMENT '期初数量',
      opening_value DECIMAL(15,2) NOT NULL DEFAULT 0 COMMENT '期初金额',
      inbound_quantity DECIMAL(15,3) NOT NULL DEFAULT 0 COMMENT '本年入库数量',
      inbound_value DECIMAL(15,2) NOT NULL DEFAULT 0 COMMENT '本年入库金额',
      outbound_quantity DECIMAL(15,3) NOT NULL DEFAULT 0 COMMENT '本年出库数量',
      outbound_value DECIMAL(15,2) NOT NULL DEFAULT 0 COMMENT '本年出库金额',
      adjust_quantity DECIMAL(15,3) NOT NULL DEFAULT 0 COMMENT '调整数量',
      closing_quantity DECIMAL(15,3) NOT NULL DEFAULT 0 COMMENT '期末数量',
      closing_value DECIMAL(15,2) NOT NULL DEFAULT 0 COMMENT '期末金额',
      is_frozen TINYINT(1) DEFAULT 0,
      frozen_at TIMESTAMP NULL,
      frozen_by VARCHAR(50) NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY uk_year_material_location (year, material_id, location_id),
      KEY idx_year (year),
      KEY idx_material (material_id),
      KEY idx_location (location_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='年度库存结存表'
  `);
};

exports.down = async function(knex) {
  const tables = [
    'inventory_year_end_balances', 'cost_variance_records',
    'cost_settings', 'actual_costs', 'standard_costs'
  ];
  for (const table of tables) {
    await knex.raw(`DROP TABLE IF EXISTS \`${table}\``);
  }
};
