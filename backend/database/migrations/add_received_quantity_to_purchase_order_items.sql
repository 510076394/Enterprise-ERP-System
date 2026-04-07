-- 为采购订单项目表添加已收货数量字段
-- 解决采购1000个，质检800个合格，但订单状态不更新的问题

-- 添加已收货数量字段
ALTER TABLE purchase_order_items 
ADD COLUMN received_quantity DECIMAL(10,2) DEFAULT 0 COMMENT '已收货数量' AFTER quantity;

-- 添加已入库数量字段
ALTER TABLE purchase_order_items 
ADD COLUMN warehoused_quantity DECIMAL(10,2) DEFAULT 0 COMMENT '已入库数量' AFTER received_quantity;

-- 添加索引以提高查询性能
ALTER TABLE purchase_order_items 
ADD INDEX idx_order_received (order_id, received_quantity);

-- 更新现有数据：根据采购入库记录计算已收货数量
UPDATE purchase_order_items poi 
SET received_quantity = (
    SELECT COALESCE(SUM(pri.received_quantity), 0)
    FROM purchase_receipt_items pri 
    JOIN purchase_receipts pr ON pri.receipt_id = pr.id 
    WHERE pr.order_id = poi.order_id 
    AND pri.material_id = poi.material_id
    AND pr.status = 'completed'
);

-- 更新现有数据：根据采购入库记录计算已入库数量
UPDATE purchase_order_items poi 
SET warehoused_quantity = (
    SELECT COALESCE(SUM(pri.qualified_quantity), 0)
    FROM purchase_receipt_items pri 
    JOIN purchase_receipts pr ON pri.receipt_id = pr.id 
    WHERE pr.order_id = poi.order_id 
    AND pri.material_id = poi.material_id
    AND pr.status = 'completed'
);

-- 为采购订单表添加完成百分比字段
ALTER TABLE purchase_orders 
ADD COLUMN completion_percentage DECIMAL(5,2) DEFAULT 0 COMMENT '完成百分比' AFTER status;

-- 添加索引
ALTER TABLE purchase_orders 
ADD INDEX idx_status_completion (status, completion_percentage);
