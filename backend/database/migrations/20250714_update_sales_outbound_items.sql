-- 更新销售出库单明细表，添加缺失的字段
-- 2025-07-14

-- 添加缺失的字段
ALTER TABLE sales_outbound_items 
ADD COLUMN unit_id INT COMMENT '单位ID' AFTER product_id,
ADD COLUMN price DECIMAL(15,2) DEFAULT 0 COMMENT '单价' AFTER quantity,
ADD COLUMN amount DECIMAL(15,2) DEFAULT 0 COMMENT '金额' AFTER price,
ADD COLUMN remarks TEXT COMMENT '备注' AFTER amount;

-- 添加外键约束
ALTER TABLE sales_outbound_items 
ADD CONSTRAINT fk_sales_outbound_items_unit_id 
FOREIGN KEY (unit_id) REFERENCES units(id);

-- 更新现有记录的默认值
UPDATE sales_outbound_items 
SET unit_id = 1, price = 0, amount = 0 
WHERE unit_id IS NULL;
