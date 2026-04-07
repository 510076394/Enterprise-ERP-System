/**
 * 基线迁移 - 业务表
 * @description 采购、销售、库存、生产业务表
 */

exports.up = async function(knex) {
  // ===== 采购模块 =====
  await knex.raw(`
    CREATE TABLE IF NOT EXISTS purchase_orders (
      id INT AUTO_INCREMENT PRIMARY KEY,
      order_no VARCHAR(50) NOT NULL UNIQUE COMMENT '订单编号',
      supplier_id INT NOT NULL COMMENT '供应商ID',
      order_date DATE NOT NULL COMMENT '订单日期',
      delivery_date DATE COMMENT '预计交货日期',
      total_amount DECIMAL(15,2) NOT NULL DEFAULT 0 COMMENT '总金额',
      payment_terms VARCHAR(100) COMMENT '付款条件',
      delivery_method VARCHAR(100) COMMENT '交货方式',
      status ENUM('draft', 'approved', 'processing', 'completed', 'cancelled') DEFAULT 'draft',
      approver VARCHAR(50) COMMENT '审批人',
      approval_date DATETIME COMMENT '审批日期',
      creator VARCHAR(50) COMMENT '创建人',
      remarks TEXT COMMENT '备注',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX (supplier_id),
      INDEX (status)
    )
  `);

  await knex.raw(`
    CREATE TABLE IF NOT EXISTS purchase_order_items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      order_id INT NOT NULL COMMENT '订单ID',
      material_id INT NOT NULL COMMENT '物料ID',
      quantity DECIMAL(10,2) NOT NULL COMMENT '数量',
      unit_price DECIMAL(10,2) NOT NULL COMMENT '单价',
      tax_rate DECIMAL(5,2) DEFAULT 0 COMMENT '税率',
      amount DECIMAL(15,2) NOT NULL COMMENT '金额',
      delivery_date DATE COMMENT '交货日期',
      remarks TEXT COMMENT '备注',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (order_id) REFERENCES purchase_orders(id),
      INDEX (material_id)
    )
  `);

  // ===== 销售模块 =====
  await knex.raw(`
    CREATE TABLE IF NOT EXISTS sales_quotations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      quotation_no VARCHAR(50) NOT NULL UNIQUE,
      customer_id INT NOT NULL,
      total_amount DECIMAL(15,2) NOT NULL,
      validity_date DATE NOT NULL,
      status ENUM('draft', 'sent', 'accepted', 'rejected', 'expired') DEFAULT 'draft',
      remarks TEXT,
      created_by INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (customer_id) REFERENCES customers(id),
      FOREIGN KEY (created_by) REFERENCES users(id)
    )
  `);

  await knex.raw(`
    CREATE TABLE IF NOT EXISTS sales_quotation_items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      quotation_id INT NOT NULL,
      product_id INT NOT NULL,
      quantity INT NOT NULL,
      unit_price DECIMAL(15,2) NOT NULL,
      discount_percent DECIMAL(5,2) DEFAULT 0,
      tax_percent DECIMAL(5,2) DEFAULT 0,
      total_price DECIMAL(15,2) NOT NULL,
      FOREIGN KEY (quotation_id) REFERENCES sales_quotations(id)
    )
  `);

  await knex.raw(`
    CREATE TABLE IF NOT EXISTS sales_orders (
      id INT AUTO_INCREMENT PRIMARY KEY,
      order_no VARCHAR(50) NOT NULL UNIQUE,
      customer_id INT NOT NULL,
      quotation_id INT,
      contract_code VARCHAR(100) COMMENT '合同编码',
      total_amount DECIMAL(15,2) NOT NULL,
      payment_terms VARCHAR(100),
      delivery_date DATE,
      status ENUM('draft', 'pending', 'confirmed', 'processing', 'in_production', 'in_procurement', 'ready_to_ship', 'partial_shipped', 'shipped', 'delivered', 'completed', 'cancelled') DEFAULT 'draft',
      remarks TEXT,
      created_by INT NOT NULL,
      is_locked BOOLEAN DEFAULT FALSE COMMENT '是否锁定库存',
      locked_at TIMESTAMP NULL,
      locked_by INT NULL,
      lock_reason VARCHAR(500) NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (customer_id) REFERENCES customers(id),
      FOREIGN KEY (created_by) REFERENCES users(id)
    )
  `);

  await knex.raw(`
    CREATE TABLE IF NOT EXISTS sales_order_items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      order_id INT NOT NULL,
      material_id INT NOT NULL,
      quantity INT NOT NULL,
      unit_price DECIMAL(15,2) NOT NULL,
      discount_percent DECIMAL(5,2) DEFAULT 0,
      tax_percent DECIMAL(5,2) DEFAULT 0,
      total_price DECIMAL(15,2) NOT NULL,
      FOREIGN KEY (order_id) REFERENCES sales_orders(id),
      FOREIGN KEY (material_id) REFERENCES materials(id)
    )
  `);

  await knex.raw(`
    CREATE TABLE IF NOT EXISTS sales_outbound (
      id INT AUTO_INCREMENT PRIMARY KEY,
      outbound_no VARCHAR(50) NOT NULL UNIQUE,
      order_id INT NULL COMMENT '主订单ID',
      is_multi_order BOOLEAN DEFAULT FALSE,
      related_orders JSON COMMENT '关联订单ID列表',
      delivery_date DATE NOT NULL,
      status ENUM('draft', 'processing', 'completed', 'cancelled') DEFAULT 'draft',
      remarks TEXT,
      created_by INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (created_by) REFERENCES users(id)
    )
  `);

  await knex.raw(`
    CREATE TABLE IF NOT EXISTS sales_outbound_items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      outbound_id INT NOT NULL,
      product_id INT NOT NULL,
      quantity INT NOT NULL,
      source_order_id INT COMMENT '来源订单ID',
      source_order_no VARCHAR(50),
      FOREIGN KEY (outbound_id) REFERENCES sales_outbound(id),
      FOREIGN KEY (product_id) REFERENCES materials(id),
      INDEX idx_source_order_id (source_order_id)
    )
  `);

  await knex.raw(`
    CREATE TABLE IF NOT EXISTS sales_returns (
      id INT AUTO_INCREMENT PRIMARY KEY,
      return_no VARCHAR(50) NOT NULL UNIQUE,
      order_id INT NOT NULL,
      return_date DATE NOT NULL,
      return_reason TEXT NOT NULL,
      status ENUM('draft', 'pending', 'approved', 'completed', 'rejected') DEFAULT 'draft',
      remarks TEXT,
      created_by INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (order_id) REFERENCES sales_orders(id),
      FOREIGN KEY (created_by) REFERENCES users(id)
    )
  `);

  await knex.raw(`
    CREATE TABLE IF NOT EXISTS sales_return_items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      return_id INT NOT NULL,
      product_id INT NOT NULL,
      quantity INT NOT NULL,
      reason TEXT,
      FOREIGN KEY (return_id) REFERENCES sales_returns(id),
      FOREIGN KEY (product_id) REFERENCES materials(id)
    )
  `);

  await knex.raw(`
    CREATE TABLE IF NOT EXISTS sales_exchanges (
      id INT AUTO_INCREMENT PRIMARY KEY,
      exchange_no VARCHAR(50) NOT NULL UNIQUE,
      order_id INT NOT NULL,
      exchange_date DATE NOT NULL,
      exchange_reason TEXT NOT NULL,
      status ENUM('draft', 'pending', 'approved', 'completed', 'rejected') DEFAULT 'draft',
      remarks TEXT,
      created_by INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (order_id) REFERENCES sales_orders(id),
      FOREIGN KEY (created_by) REFERENCES users(id)
    )
  `);

  await knex.raw(`
    CREATE TABLE IF NOT EXISTS sales_exchange_items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      exchange_id INT NOT NULL,
      old_product_id INT NOT NULL,
      new_product_id INT NOT NULL,
      quantity INT NOT NULL,
      reason TEXT,
      FOREIGN KEY (exchange_id) REFERENCES sales_exchanges(id),
      FOREIGN KEY (old_product_id) REFERENCES materials(id),
      FOREIGN KEY (new_product_id) REFERENCES materials(id)
    )
  `);

  // ===== 库存模块 =====
  await knex.raw(`
    CREATE TABLE IF NOT EXISTS inventory_reservations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      order_id INT NOT NULL COMMENT '销售订单ID',
      order_no VARCHAR(50) NOT NULL,
      material_id INT NOT NULL,
      material_code VARCHAR(50) NOT NULL,
      material_name VARCHAR(200) NOT NULL,
      location_id INT NOT NULL,
      reserved_quantity DECIMAL(10,2) NOT NULL,
      status ENUM('active', 'released', 'consumed') DEFAULT 'active',
      reserved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      released_at TIMESTAMP NULL,
      created_by INT NOT NULL,
      remarks VARCHAR(500),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_order_material (order_id, material_id),
      INDEX idx_material_location (material_id, location_id),
      INDEX idx_status (status)
    )
  `);

  await knex.raw(`
    CREATE TABLE IF NOT EXISTS inventory_outbound (
      id INT AUTO_INCREMENT PRIMARY KEY,
      outbound_no VARCHAR(50) NOT NULL UNIQUE,
      outbound_date DATE NOT NULL,
      status ENUM('draft', 'confirmed', 'completed', 'cancelled') DEFAULT 'draft',
      remark TEXT,
      operator VARCHAR(50) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX (outbound_no),
      INDEX (outbound_date),
      INDEX (status)
    )
  `);

  await knex.raw(`
    CREATE TABLE IF NOT EXISTS inventory_outbound_items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      outbound_id INT NOT NULL,
      material_id INT NOT NULL,
      quantity DECIMAL(10,2) NOT NULL,
      unit_id INT NOT NULL,
      location_id INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (outbound_id) REFERENCES inventory_outbound(id),
      FOREIGN KEY (material_id) REFERENCES materials(id),
      FOREIGN KEY (unit_id) REFERENCES units(id),
      FOREIGN KEY (location_id) REFERENCES locations(id)
    )
  `);

  // ===== 生产模块 =====
  await knex.raw(`
    CREATE TABLE IF NOT EXISTS work_orders (
      id INT AUTO_INCREMENT PRIMARY KEY,
      code VARCHAR(50) NOT NULL UNIQUE COMMENT '工单编号',
      production_task_id INT COMMENT '关联生产任务ID',
      product_id INT NOT NULL COMMENT '产品ID',
      quantity DECIMAL(10,2) NOT NULL COMMENT '计划数量',
      completed_quantity DECIMAL(10,2) DEFAULT 0 COMMENT '完成数量',
      status ENUM('pending','in_progress','completed','cancelled') DEFAULT 'pending',
      priority INT DEFAULT 0 COMMENT '优先级',
      planned_start DATE COMMENT '计划开始日期',
      planned_end DATE COMMENT '计划结束日期',
      actual_start DATE COMMENT '实际开始日期',
      actual_end DATE COMMENT '实际结束日期',
      remark TEXT COMMENT '备注',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX (production_task_id),
      INDEX (product_id),
      INDEX (status)
    )
  `);

  await knex.raw(`
    CREATE TABLE IF NOT EXISTS work_order_materials (
      id INT AUTO_INCREMENT PRIMARY KEY,
      work_order_id INT NOT NULL,
      material_id INT NOT NULL,
      required_quantity DECIMAL(10,2) NOT NULL COMMENT '需求量',
      issued_quantity DECIMAL(10,2) DEFAULT 0 COMMENT '已发料量',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (work_order_id) REFERENCES work_orders(id),
      FOREIGN KEY (material_id) REFERENCES materials(id)
    )
  `);

  await knex.raw(`
    CREATE TABLE IF NOT EXISTS work_order_processes (
      id INT AUTO_INCREMENT PRIMARY KEY,
      work_order_id INT NOT NULL,
      process_name VARCHAR(100) NOT NULL COMMENT '工序名称',
      sequence INT DEFAULT 0 COMMENT '工序顺序',
      status ENUM('pending','in_progress','completed') DEFAULT 'pending',
      start_time DATETIME,
      end_time DATETIME,
      operator VARCHAR(50) COMMENT '操作员',
      remark TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (work_order_id) REFERENCES work_orders(id)
    )
  `);
};

exports.down = async function(knex) {
  const tables = [
    'work_order_processes', 'work_order_materials', 'work_orders',
    'inventory_outbound_items', 'inventory_outbound', 'inventory_reservations',
    'sales_exchange_items', 'sales_exchanges', 'sales_return_items', 'sales_returns',
    'sales_outbound_items', 'sales_outbound', 'sales_order_items', 'sales_orders',
    'sales_quotation_items', 'sales_quotations',
    'purchase_order_items', 'purchase_orders'
  ];
  for (const table of tables) {
    await knex.raw(`DROP TABLE IF EXISTS \`${table}\``);
  }
};
