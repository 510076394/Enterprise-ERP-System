-- 为采购订单项目表添加检验相关字段
-- 优化采购订单业务逻辑,增加检验数量追踪
-- 创建时间: 2025-01-11

-- 添加已检验数量字段 (如果已存在会报错,可以忽略)
ALTER TABLE purchase_order_items
ADD COLUMN inspected_quantity DECIMAL(10,2) DEFAULT 0 COMMENT '已检验数量' AFTER warehoused_quantity;

-- 添加合格数量字段
ALTER TABLE purchase_order_items
ADD COLUMN qualified_quantity DECIMAL(10,2) DEFAULT 0 COMMENT '合格数量' AFTER inspected_quantity;

-- 添加不合格数量字段
ALTER TABLE purchase_order_items
ADD COLUMN unqualified_quantity DECIMAL(10,2) DEFAULT 0 COMMENT '不合格数量' AFTER qualified_quantity;

-- 添加索引以提高查询性能
ALTER TABLE purchase_order_items
ADD INDEX idx_order_inspection (order_id, inspected_quantity);

-- 更新现有数据：根据检验记录计算已检验数量
UPDATE purchase_order_items poi 
SET inspected_quantity = (
    SELECT COALESCE(SUM(qi.quantity), 0)
    FROM quality_inspections qi 
    WHERE qi.reference_type = 'purchase_order'
    AND qi.reference_id = poi.order_id 
    AND qi.material_id = poi.material_id
    AND qi.status IN ('passed', 'failed', 'partial', 'completed')
);

-- 更新现有数据：根据检验记录计算合格数量
UPDATE purchase_order_items poi 
SET qualified_quantity = (
    SELECT COALESCE(SUM(qi.qualified_quantity), 0)
    FROM quality_inspections qi 
    WHERE qi.reference_type = 'purchase_order'
    AND qi.reference_id = poi.order_id 
    AND qi.material_id = poi.material_id
    AND qi.status IN ('passed', 'partial', 'completed')
);

-- 更新现有数据：根据检验记录计算不合格数量
UPDATE purchase_order_items poi 
SET unqualified_quantity = (
    SELECT COALESCE(SUM(qi.unqualified_quantity), 0)
    FROM quality_inspections qi 
    WHERE qi.reference_type = 'purchase_order'
    AND qi.reference_id = poi.order_id 
    AND qi.material_id = poi.material_id
    AND qi.status IN ('failed', 'partial', 'completed')
);

-- 为采购订单表添加新的状态支持
-- 注意: 这个修改需要谨慎,因为可能影响现有数据
-- 建议先备份数据库

-- 添加状态说明注释
ALTER TABLE purchase_orders 
MODIFY COLUMN status VARCHAR(20) DEFAULT 'draft' NOT NULL 
COMMENT '状态: draft-草稿, pending-待审批, approved-已批准, received-已收货, inspecting-检验中, inspected-检验完成, warehousing-入库中, partial_received-部分收货, completed-已完成, cancelled-已取消';

