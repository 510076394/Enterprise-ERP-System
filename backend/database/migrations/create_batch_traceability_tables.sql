-- 零部件追溯系统数据库表创建脚本
-- 支持批次管理、FIFO逻辑和全流程追溯

-- 1. 批次库存表 (支持FIFO逻辑)
CREATE TABLE IF NOT EXISTS batch_inventory (
  id INT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
  material_id INT NOT NULL COMMENT '物料ID',
  material_code VARCHAR(50) NOT NULL COMMENT '物料编码',
  material_name VARCHAR(200) COMMENT '物料名称',
  batch_number VARCHAR(50) NOT NULL COMMENT '批次号',
  supplier_id INT COMMENT '供应商ID',
  supplier_name VARCHAR(200) COMMENT '供应商名称',
  
  -- 数量信息
  original_quantity DECIMAL(12,4) NOT NULL DEFAULT 0 COMMENT '原始数量',
  current_quantity DECIMAL(12,4) NOT NULL DEFAULT 0 COMMENT '当前库存数量',
  reserved_quantity DECIMAL(12,4) NOT NULL DEFAULT 0 COMMENT '预留数量',
  available_quantity DECIMAL(12,4) NOT NULL DEFAULT 0 COMMENT '可用数量',
  unit VARCHAR(20) COMMENT '单位',
  
  -- 时间信息 (FIFO关键字段)
  production_date DATE COMMENT '生产日期',
  receipt_date DATETIME NOT NULL COMMENT '入库时间',
  expiry_date DATE COMMENT '有效期',
  
  -- 位置信息
  warehouse_id INT COMMENT '仓库ID',
  warehouse_name VARCHAR(100) COMMENT '仓库名称',
  location VARCHAR(100) COMMENT '库位',
  
  -- 状态信息
  status ENUM('active', 'reserved', 'locked', 'expired', 'consumed') NOT NULL DEFAULT 'active' COMMENT '状态',
  quality_status ENUM('pending', 'passed', 'failed', 'exempted') DEFAULT 'pending' COMMENT '质量状态',
  
  -- 成本信息
  unit_cost DECIMAL(10,4) COMMENT '单位成本',
  total_cost DECIMAL(15,4) COMMENT '总成本',
  
  -- 追溯信息
  purchase_order_id INT COMMENT '采购订单ID',
  purchase_order_no VARCHAR(50) COMMENT '采购订单号',
  receipt_id INT COMMENT '入库单ID',
  receipt_no VARCHAR(50) COMMENT '入库单号',
  inspection_id INT COMMENT '检验单ID',
  
  -- 审计字段
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  created_by VARCHAR(50) COMMENT '创建人',
  updated_by VARCHAR(50) COMMENT '更新人',
  
  -- 索引
  INDEX idx_material_batch (material_id, batch_number),
  INDEX idx_material_code (material_code),
  INDEX idx_batch_number (batch_number),
  INDEX idx_receipt_date (receipt_date),
  INDEX idx_status (status),
  INDEX idx_quality_status (quality_status),
  INDEX idx_warehouse (warehouse_id),
  INDEX idx_supplier (supplier_id),
  INDEX idx_purchase_order (purchase_order_id),
  INDEX idx_available_qty (available_quantity),
  
  -- 唯一约束
  UNIQUE KEY uk_material_batch_receipt (material_id, batch_number, receipt_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='批次库存表-支持FIFO逻辑';

-- 2. 批次流转记录表 (记录每个批次的所有流转)
CREATE TABLE IF NOT EXISTS batch_transactions (
  id INT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
  batch_inventory_id INT NOT NULL COMMENT '批次库存ID',
  material_id INT NOT NULL COMMENT '物料ID',
  material_code VARCHAR(50) NOT NULL COMMENT '物料编码',
  batch_number VARCHAR(50) NOT NULL COMMENT '批次号',
  
  -- 交易信息
  transaction_type ENUM('in', 'out', 'transfer', 'adjust', 'reserve', 'unreserve') NOT NULL COMMENT '交易类型',
  transaction_no VARCHAR(50) COMMENT '交易单号',
  quantity DECIMAL(12,4) NOT NULL COMMENT '数量',
  unit VARCHAR(20) COMMENT '单位',
  
  -- 数量变化
  before_quantity DECIMAL(12,4) NOT NULL DEFAULT 0 COMMENT '变更前数量',
  after_quantity DECIMAL(12,4) NOT NULL DEFAULT 0 COMMENT '变更后数量',
  
  -- 位置信息
  from_warehouse_id INT COMMENT '源仓库ID',
  from_location VARCHAR(100) COMMENT '源库位',
  to_warehouse_id INT COMMENT '目标仓库ID',
  to_location VARCHAR(100) COMMENT '目标库位',
  
  -- 关联信息
  reference_type VARCHAR(50) COMMENT '关联单据类型',
  reference_id INT COMMENT '关联单据ID',
  reference_no VARCHAR(50) COMMENT '关联单据号',
  
  -- 成本信息
  unit_cost DECIMAL(10,4) COMMENT '单位成本',
  total_cost DECIMAL(15,4) COMMENT '总成本',
  
  -- 审计字段
  transaction_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '交易时间',
  operator VARCHAR(50) COMMENT '操作员',
  remarks TEXT COMMENT '备注',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  
  -- 索引
  INDEX idx_batch_inventory (batch_inventory_id),
  INDEX idx_material_batch (material_id, batch_number),
  INDEX idx_transaction_type (transaction_type),
  INDEX idx_transaction_date (transaction_date),
  INDEX idx_reference (reference_type, reference_id),
  INDEX idx_operator (operator),
  
  -- 外键约束
  FOREIGN KEY (batch_inventory_id) REFERENCES batch_inventory(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='批次流转记录表';

-- 3. FIFO出库队列表
CREATE TABLE IF NOT EXISTS fifo_outbound_queue (
  id INT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
  material_id INT NOT NULL COMMENT '物料ID',
  material_code VARCHAR(50) NOT NULL COMMENT '物料编码',
  batch_inventory_id INT NOT NULL COMMENT '批次库存ID',
  batch_number VARCHAR(50) NOT NULL COMMENT '批次号',
  
  -- 队列信息
  queue_priority INT NOT NULL DEFAULT 0 COMMENT '队列优先级(基于入库时间)',
  available_quantity DECIMAL(12,4) NOT NULL DEFAULT 0 COMMENT '可用数量',
  reserved_quantity DECIMAL(12,4) NOT NULL DEFAULT 0 COMMENT '预留数量',
  
  -- 时间信息
  receipt_date DATETIME NOT NULL COMMENT '入库时间',
  expiry_date DATE COMMENT '有效期',
  
  -- 状态
  status ENUM('active', 'exhausted', 'expired', 'locked') NOT NULL DEFAULT 'active' COMMENT '状态',
  
  -- 审计字段
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  
  -- 索引
  INDEX idx_material_priority (material_id, queue_priority),
  INDEX idx_material_code (material_code),
  INDEX idx_batch_inventory (batch_inventory_id),
  INDEX idx_status (status),
  INDEX idx_receipt_date (receipt_date),
  
  -- 外键约束
  FOREIGN KEY (batch_inventory_id) REFERENCES batch_inventory(id) ON DELETE CASCADE,
  
  -- 唯一约束
  UNIQUE KEY uk_material_batch (material_id, batch_inventory_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='FIFO出库队列表';

-- 4. 追溯链路主表 (优化版本)
CREATE TABLE IF NOT EXISTS traceability_chains (
  id INT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
  chain_no VARCHAR(50) UNIQUE NOT NULL COMMENT '追溯链路编号',
  
  -- 产品信息
  product_type ENUM('material', 'product', 'component') NOT NULL COMMENT '产品类型',
  product_id INT COMMENT '产品ID',
  product_code VARCHAR(50) NOT NULL COMMENT '产品编码',
  product_name VARCHAR(200) COMMENT '产品名称',
  batch_number VARCHAR(50) NOT NULL COMMENT '批次号',
  
  -- 数量信息
  total_quantity DECIMAL(12,4) NOT NULL DEFAULT 0 COMMENT '总数量',
  consumed_quantity DECIMAL(12,4) NOT NULL DEFAULT 0 COMMENT '已消耗数量',
  remaining_quantity DECIMAL(12,4) NOT NULL DEFAULT 0 COMMENT '剩余数量',
  unit VARCHAR(20) COMMENT '单位',
  
  -- 时间信息
  start_date DATETIME COMMENT '开始时间',
  end_date DATETIME COMMENT '结束时间',
  production_date DATE COMMENT '生产日期',
  
  -- 状态信息
  status ENUM('active', 'completed', 'cancelled', 'expired') NOT NULL DEFAULT 'active' COMMENT '状态',
  quality_status ENUM('pending', 'passed', 'failed', 'exempted') DEFAULT 'pending' COMMENT '质量状态',
  
  -- 关联信息
  parent_chain_id INT COMMENT '父链路ID',
  root_chain_id INT COMMENT '根链路ID',
  chain_level INT NOT NULL DEFAULT 1 COMMENT '链路层级',
  
  -- 审计字段
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  created_by VARCHAR(50) COMMENT '创建人',
  
  -- 索引
  INDEX idx_product_batch (product_code, batch_number),
  INDEX idx_product_type (product_type),
  INDEX idx_status (status),
  INDEX idx_parent_chain (parent_chain_id),
  INDEX idx_root_chain (root_chain_id),
  INDEX idx_chain_level (chain_level),
  INDEX idx_start_date (start_date),
  
  -- 外键约束
  FOREIGN KEY (parent_chain_id) REFERENCES traceability_chains(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='追溯链路主表';

-- 5. 追溯链路步骤表
CREATE TABLE IF NOT EXISTS traceability_chain_steps (
  id INT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
  chain_id INT NOT NULL COMMENT '链路ID',
  step_type VARCHAR(50) NOT NULL COMMENT '步骤类型',
  step_name VARCHAR(100) NOT NULL COMMENT '步骤名称',
  step_order INT NOT NULL COMMENT '步骤顺序',

  -- 步骤状态
  status ENUM('pending', 'in_progress', 'completed', 'skipped', 'failed') NOT NULL DEFAULT 'pending' COMMENT '状态',
  start_time DATETIME COMMENT '开始时间',
  end_time DATETIME COMMENT '结束时间',
  duration INT COMMENT '持续时间(秒)',

  -- 操作信息
  operator VARCHAR(50) COMMENT '操作员',
  equipment VARCHAR(100) COMMENT '设备',
  location VARCHAR(100) COMMENT '位置',

  -- 数量信息
  input_quantity DECIMAL(12,4) COMMENT '输入数量',
  output_quantity DECIMAL(12,4) COMMENT '输出数量',
  waste_quantity DECIMAL(12,4) COMMENT '损耗数量',
  unit VARCHAR(20) COMMENT '单位',

  -- 质量信息
  quality_result ENUM('pending', 'passed', 'failed', 'exempted') DEFAULT 'pending' COMMENT '质量结果',
  inspection_id INT COMMENT '检验单ID',

  -- 关联信息
  reference_type VARCHAR(50) COMMENT '关联单据类型',
  reference_id INT COMMENT '关联单据ID',
  reference_no VARCHAR(50) COMMENT '关联单据号',

  -- 参数和备注
  parameters JSON COMMENT '步骤参数',
  remarks TEXT COMMENT '备注',

  -- 审计字段
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',

  -- 索引
  INDEX idx_chain_order (chain_id, step_order),
  INDEX idx_step_type (step_type),
  INDEX idx_status (status),
  INDEX idx_reference (reference_type, reference_id),
  INDEX idx_operator (operator),
  INDEX idx_start_time (start_time),

  -- 外键约束
  FOREIGN KEY (chain_id) REFERENCES traceability_chains(id) ON DELETE CASCADE,

  -- 唯一约束
  UNIQUE KEY uk_chain_step_order (chain_id, step_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='追溯链路步骤表';

-- 6. 批次关联关系表 (记录批次之间的父子关系)
CREATE TABLE IF NOT EXISTS batch_relationships (
  id INT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
  parent_batch_id INT NOT NULL COMMENT '父批次ID',
  child_batch_id INT NOT NULL COMMENT '子批次ID',
  parent_material_code VARCHAR(50) NOT NULL COMMENT '父物料编码',
  child_material_code VARCHAR(50) NOT NULL COMMENT '子物料编码',
  parent_batch_number VARCHAR(50) NOT NULL COMMENT '父批次号',
  child_batch_number VARCHAR(50) NOT NULL COMMENT '子批次号',

  -- 关系信息
  relationship_type ENUM('consume', 'produce', 'transform', 'assemble') NOT NULL COMMENT '关系类型',
  consumed_quantity DECIMAL(12,4) NOT NULL DEFAULT 0 COMMENT '消耗数量',
  produced_quantity DECIMAL(12,4) NOT NULL DEFAULT 0 COMMENT '产出数量',
  conversion_ratio DECIMAL(10,6) DEFAULT 1.000000 COMMENT '转换比例',

  -- 关联信息
  process_type VARCHAR(50) COMMENT '工艺类型',
  reference_type VARCHAR(50) COMMENT '关联单据类型',
  reference_id INT COMMENT '关联单据ID',
  reference_no VARCHAR(50) COMMENT '关联单据号',

  -- 审计字段
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  operator VARCHAR(50) COMMENT '操作员',
  remarks TEXT COMMENT '备注',

  -- 索引
  INDEX idx_parent_batch (parent_batch_id),
  INDEX idx_child_batch (child_batch_id),
  INDEX idx_parent_material (parent_material_code),
  INDEX idx_child_material (child_material_code),
  INDEX idx_relationship_type (relationship_type),
  INDEX idx_reference (reference_type, reference_id),

  -- 外键约束
  FOREIGN KEY (parent_batch_id) REFERENCES batch_inventory(id) ON DELETE CASCADE,
  FOREIGN KEY (child_batch_id) REFERENCES batch_inventory(id) ON DELETE CASCADE,

  -- 唯一约束
  UNIQUE KEY uk_parent_child_ref (parent_batch_id, child_batch_id, reference_type, reference_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='批次关联关系表';

-- 7. 创建视图：批次库存汇总视图
CREATE OR REPLACE VIEW v_batch_inventory_summary AS
SELECT
  bi.material_id,
  bi.material_code,
  bi.material_name,
  bi.warehouse_id,
  bi.warehouse_name,
  COUNT(DISTINCT bi.batch_number) as batch_count,
  SUM(bi.current_quantity) as total_quantity,
  SUM(bi.available_quantity) as available_quantity,
  SUM(bi.reserved_quantity) as reserved_quantity,
  MIN(bi.receipt_date) as earliest_receipt_date,
  MAX(bi.receipt_date) as latest_receipt_date,
  MIN(bi.expiry_date) as earliest_expiry_date,
  bi.unit,
  AVG(bi.unit_cost) as avg_unit_cost,
  SUM(bi.total_cost) as total_cost
FROM batch_inventory bi
WHERE bi.status = 'active' AND bi.current_quantity > 0
GROUP BY bi.material_id, bi.material_code, bi.warehouse_id;

-- 8. 创建视图：FIFO出库顺序视图
CREATE OR REPLACE VIEW v_fifo_outbound_order AS
SELECT
  fq.material_id,
  fq.material_code,
  bi.material_name,
  fq.batch_number,
  fq.batch_inventory_id,
  fq.available_quantity,
  fq.queue_priority,
  bi.receipt_date,
  bi.expiry_date,
  bi.unit_cost,
  bi.warehouse_id,
  bi.warehouse_name,
  bi.location,
  ROW_NUMBER() OVER (PARTITION BY fq.material_id ORDER BY fq.queue_priority ASC, fq.receipt_date ASC) as fifo_order
FROM fifo_outbound_queue fq
JOIN batch_inventory bi ON fq.batch_inventory_id = bi.id
WHERE fq.status = 'active' AND fq.available_quantity > 0
ORDER BY fq.material_id, fq.queue_priority ASC, fq.receipt_date ASC;
