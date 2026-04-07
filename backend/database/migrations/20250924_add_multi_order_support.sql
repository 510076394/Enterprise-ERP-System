-- 添加多订单合并出库支持
-- 2025-09-24

-- 修改销售出库主表，添加多订单支持字段
ALTER TABLE sales_outbound 
ADD COLUMN is_multi_order BOOLEAN DEFAULT FALSE COMMENT '是否多订单发货',
ADD COLUMN related_orders JSON COMMENT '关联订单ID列表（JSON格式）';

-- 修改order_id字段为可空，多订单时为空
ALTER TABLE sales_outbound 
MODIFY COLUMN order_id INT NULL COMMENT '主订单ID（多订单时为空）';

-- 修改销售出库明细表，添加物料来源订单信息
ALTER TABLE sales_outbound_items 
ADD COLUMN source_order_id INT COMMENT '物料来源订单ID',
ADD COLUMN source_order_no VARCHAR(50) COMMENT '物料来源订单号';

-- 添加索引以提高查询性能
ALTER TABLE sales_outbound_items 
ADD INDEX idx_source_order_id (source_order_id);

-- 添加外键约束（可选，如果需要严格的数据完整性）
-- ALTER TABLE sales_outbound_items 
-- ADD CONSTRAINT fk_sales_outbound_items_source_order 
-- FOREIGN KEY (source_order_id) REFERENCES sales_orders(id);

-- 更新现有记录的默认值
UPDATE sales_outbound 
SET is_multi_order = FALSE, related_orders = JSON_ARRAY(order_id)
WHERE is_multi_order IS NULL AND order_id IS NOT NULL;

-- 为现有的出库明细添加来源订单信息
UPDATE sales_outbound_items soi
JOIN sales_outbound so ON soi.outbound_id = so.id
SET soi.source_order_id = so.order_id
WHERE soi.source_order_id IS NULL AND so.order_id IS NOT NULL;

-- 添加来源订单号信息
UPDATE sales_outbound_items soi
JOIN sales_outbound so ON soi.outbound_id = so.id
JOIN sales_orders ord ON so.order_id = ord.id
SET soi.source_order_no = ord.order_no
WHERE soi.source_order_no IS NULL AND so.order_id IS NOT NULL;
