-- 增加列 (使用存储过程以避免重复添加错误，或者直接使用 ADD COLUMN IF NOT EXISTS 如果版本支持)
-- MySQL 5.7+ 不支持 ADD COLUMN IF NOT EXISTS，所以使用标准 ALTER 可能会报错如果列已存在。
-- 这里我们假设是 MySQL 8.0，尝试使用 IF NOT EXISTS，如果失败则忽略错误（因为用户环境未知，我们会尝试直接ALTER，如果报错说明已存在）

-- 1. 扩展 inventory_ledger 表
ALTER TABLE inventory_ledger ADD COLUMN IF NOT EXISTS batch_number VARCHAR(50) COMMENT '批次号';
ALTER TABLE inventory_ledger ADD COLUMN IF NOT EXISTS supplier_id INT COMMENT '供应商ID';
ALTER TABLE inventory_ledger ADD COLUMN IF NOT EXISTS supplier_name VARCHAR(100) COMMENT '供应商名称';
ALTER TABLE inventory_ledger ADD COLUMN IF NOT EXISTS production_date DATE COMMENT '生产日期';
ALTER TABLE inventory_ledger ADD COLUMN IF NOT EXISTS expiry_date DATE COMMENT '过期日期';
ALTER TABLE inventory_ledger ADD COLUMN IF NOT EXISTS warehouse_name VARCHAR(100) COMMENT '仓库名称';
-- unit_cost 已存在，这里忽略

-- 2. 添加索引
CREATE INDEX IF NOT EXISTS idx_inventory_ledger_batch ON inventory_ledger(batch_number);
CREATE INDEX IF NOT EXISTS idx_inventory_ledger_mat_batch ON inventory_ledger(material_id, batch_number);

-- 3. 创建批次库存视图
CREATE OR REPLACE VIEW v_batch_stock AS
SELECT 
  material_id,
  location_id,
  batch_number,
  SUM(quantity) as current_quantity,
  MIN(created_at) as receipt_date,
  MAX(expiry_date) as expiry_date,
  AVG(unit_cost) as unit_cost, -- 使用平均成本
  MAX(supplier_name) as supplier_name,
  MAX(warehouse_name) as warehouse_name
FROM inventory_ledger
WHERE batch_number IS NOT NULL
GROUP BY material_id, location_id, batch_number
HAVING SUM(quantity) > 0;
