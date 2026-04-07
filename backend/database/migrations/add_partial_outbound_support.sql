-- 添加部分发料支持
-- 创建时间: 2025-11-05
-- 描述: 支持出库单部分发料功能,允许库存不足时先发部分物料,后续补发

-- ==================== 1. 修改出库单主表 ====================

-- 1.1 添加 partial_completed 状态
ALTER TABLE inventory_outbound 
MODIFY COLUMN status ENUM(
  'draft',              -- 草稿
  'confirmed',          -- 已确认
  'partial_completed',  -- 部分完成 (新增)
  'completed',          -- 已完成
  'cancelled'           -- 已取消
) DEFAULT 'draft' COMMENT '出库单状态';

-- ==================== 2. 修改出库单明细表 ====================

-- 2.1 添加计划数量、实际数量、缺料数量字段
ALTER TABLE inventory_outbound_items 
ADD COLUMN planned_quantity DECIMAL(10,2) NOT NULL DEFAULT 0 COMMENT '计划数量' AFTER quantity,
ADD COLUMN actual_quantity DECIMAL(10,2) NOT NULL DEFAULT 0 COMMENT '实际发料数量' AFTER planned_quantity,
ADD COLUMN shortage_quantity DECIMAL(10,2) NOT NULL DEFAULT 0 COMMENT '缺料数量(计划-实际)' AFTER actual_quantity,
ADD COLUMN is_shortage TINYINT(1) DEFAULT 0 COMMENT '是否缺料(0-否,1-是)' AFTER shortage_quantity;

-- 2.2 数据迁移: 将现有的quantity字段数据迁移到新字段
-- 对于已有的出库单,假设都是全部发料完成的
UPDATE inventory_outbound_items 
SET 
  planned_quantity = quantity,
  actual_quantity = quantity,
  shortage_quantity = 0,
  is_shortage = 0
WHERE planned_quantity = 0;

-- 2.3 添加索引以提高查询性能
CREATE INDEX idx_is_shortage ON inventory_outbound_items(is_shortage);
CREATE INDEX idx_shortage_quantity ON inventory_outbound_items(shortage_quantity);

-- ==================== 3. 创建缺料记录表 ====================

CREATE TABLE IF NOT EXISTS material_shortage_records (
  id INT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
  
  -- 出库单信息
  outbound_id INT NOT NULL COMMENT '出库单ID',
  outbound_no VARCHAR(50) NOT NULL COMMENT '出库单号',
  outbound_item_id INT NOT NULL COMMENT '出库单明细ID',
  
  -- 物料信息
  material_id INT NOT NULL COMMENT '物料ID',
  material_code VARCHAR(50) COMMENT '物料编码',
  material_name VARCHAR(200) COMMENT '物料名称',
  material_specs VARCHAR(200) COMMENT '物料规格',
  unit_id INT COMMENT '单位ID',
  unit_name VARCHAR(20) COMMENT '单位名称',
  
  -- 数量信息
  planned_quantity DECIMAL(10,2) NOT NULL COMMENT '计划数量',
  actual_quantity DECIMAL(10,2) NOT NULL DEFAULT 0 COMMENT '实际已发数量',
  shortage_quantity DECIMAL(10,2) NOT NULL COMMENT '缺料数量',
  supplied_quantity DECIMAL(10,2) NOT NULL DEFAULT 0 COMMENT '已补发数量',
  remaining_quantity DECIMAL(10,2) NOT NULL COMMENT '剩余缺料数量',
  
  -- 库存信息
  current_stock DECIMAL(10,2) DEFAULT 0 COMMENT '创建时的当前库存',
  
  -- 状态信息
  status ENUM('pending', 'partial_supplied', 'completed', 'cancelled') DEFAULT 'pending' COMMENT '缺料状态',
  
  -- 关联信息
  reference_type VARCHAR(50) COMMENT '关联类型(production_task/production_plan等)',
  reference_id INT COMMENT '关联ID',
  reference_no VARCHAR(50) COMMENT '关联单号',
  
  -- 补发记录
  supply_count INT DEFAULT 0 COMMENT '补发次数',
  last_supply_date DATETIME COMMENT '最后补发时间',
  last_supply_quantity DECIMAL(10,2) COMMENT '最后补发数量',
  
  -- 备注信息
  remark TEXT COMMENT '备注',
  
  -- 时间戳
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  completed_at DATETIME COMMENT '完成时间',
  
  -- 外键约束
  FOREIGN KEY (outbound_id) REFERENCES inventory_outbound(id) ON DELETE CASCADE,
  FOREIGN KEY (outbound_item_id) REFERENCES inventory_outbound_items(id) ON DELETE CASCADE,
  FOREIGN KEY (material_id) REFERENCES materials(id),
  
  -- 索引
  INDEX idx_status (status),
  INDEX idx_material (material_id),
  INDEX idx_outbound (outbound_id),
  INDEX idx_reference (reference_type, reference_id),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='缺料记录表';

-- ==================== 4. 创建补发记录表 ====================

CREATE TABLE IF NOT EXISTS material_supply_records (
  id INT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
  
  -- 关联信息
  shortage_record_id INT NOT NULL COMMENT '缺料记录ID',
  outbound_id INT NOT NULL COMMENT '出库单ID',
  outbound_no VARCHAR(50) NOT NULL COMMENT '出库单号',
  material_id INT NOT NULL COMMENT '物料ID',
  
  -- 补发信息
  supply_quantity DECIMAL(10,2) NOT NULL COMMENT '本次补发数量',
  before_actual_quantity DECIMAL(10,2) NOT NULL COMMENT '补发前已发数量',
  after_actual_quantity DECIMAL(10,2) NOT NULL COMMENT '补发后已发数量',
  remaining_shortage DECIMAL(10,2) NOT NULL COMMENT '补发后剩余缺料',
  
  -- 库存信息
  stock_before_supply DECIMAL(10,2) COMMENT '补发前库存',
  stock_after_supply DECIMAL(10,2) COMMENT '补发后库存',
  
  -- 操作信息
  operator VARCHAR(50) COMMENT '操作人',
  operator_id INT COMMENT '操作人ID',
  supply_date DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '补发时间',
  remark TEXT COMMENT '备注',
  
  -- 时间戳
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  
  -- 外键约束
  FOREIGN KEY (shortage_record_id) REFERENCES material_shortage_records(id) ON DELETE CASCADE,
  FOREIGN KEY (outbound_id) REFERENCES inventory_outbound(id),
  FOREIGN KEY (material_id) REFERENCES materials(id),
  
  -- 索引
  INDEX idx_shortage_record (shortage_record_id),
  INDEX idx_outbound (outbound_id),
  INDEX idx_supply_date (supply_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='补发记录表';

-- ==================== 5. 修改生产任务状态 ====================

-- 5.1 修正现有数据中的状态值(inProgress -> in_progress)
UPDATE production_tasks SET status = 'in_progress' WHERE status = 'inProgress';

-- 5.2 添加 material_partial_issued 状态
ALTER TABLE production_tasks
MODIFY COLUMN status ENUM(
  'pending',                  -- 未开始
  'allocated',                -- 分配中
  'preparing',                -- 配料中
  'material_issuing',         -- 发料中
  'material_partial_issued',  -- 部分发料 (新增)
  'material_issued',          -- 已发料
  'in_progress',              -- 生产中
  'inspection',               -- 待检验
  'warehousing',              -- 入库中
  'completed',                -- 已完成
  'cancelled'                 -- 已取消
) DEFAULT 'pending' COMMENT '任务状态';

-- ==================== 6. 添加配置表 ====================

-- 6.1 创建部分发料配置表
CREATE TABLE IF NOT EXISTS partial_outbound_config (
  id INT AUTO_INCREMENT PRIMARY KEY,
  config_key VARCHAR(50) NOT NULL UNIQUE COMMENT '配置键',
  config_value TEXT COMMENT '配置值',
  description VARCHAR(200) COMMENT '配置说明',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='部分发料配置表';

-- 6.2 插入默认配置
INSERT INTO partial_outbound_config (config_key, config_value, description) VALUES
('auto_create_shortage_record', '1', '是否自动创建缺料记录(1-是,0-否)'),
('auto_send_shortage_notification', '1', '是否自动发送缺料通知(1-是,0-否)'),
('allow_manual_adjust_quantity', '1', '是否允许手动调整实际发料数量(1-是,0-否)'),
('shortage_notification_users', 'purchaser,warehouse_manager', '缺料通知接收人角色(逗号分隔)');

-- ==================== 7. 数据完整性检查 ====================

-- 7.1 检查是否有异常数据
SELECT 
  'inventory_outbound_items异常数据检查' as check_name,
  COUNT(*) as count
FROM inventory_outbound_items
WHERE actual_quantity > planned_quantity;

-- 7.2 检查是否有负数
SELECT 
  'inventory_outbound_items负数检查' as check_name,
  COUNT(*) as count
FROM inventory_outbound_items
WHERE planned_quantity < 0 OR actual_quantity < 0 OR shortage_quantity < 0;

-- ==================== 完成 ====================

-- 迁移完成提示
SELECT '部分发料功能数据库迁移完成!' as message;

