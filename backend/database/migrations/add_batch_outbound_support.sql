-- 添加批量发料支持
-- 修改出库单表和明细表，支持多个生产任务合并发料

-- 1. 修改 inventory_outbound 表
-- 添加 source_task_ids 字段，存储多个生产任务ID（JSON格式）
-- 添加 is_batch_outbound 字段，标识是否为批量发料
ALTER TABLE inventory_outbound
ADD COLUMN source_task_ids JSON COMMENT '来源生产任务ID列表（批量发料时使用）' AFTER reference_type,
ADD COLUMN is_batch_outbound TINYINT(1) DEFAULT 0 COMMENT '是否为批量发料（0-否，1-是）' AFTER source_task_ids;

-- 2. 修改 inventory_outbound_items 表
-- 添加 source_tasks 字段，记录每个物料的来源任务信息（JSON格式）
ALTER TABLE inventory_outbound_items
ADD COLUMN source_tasks JSON COMMENT '物料来源任务信息（批量发料时使用）' AFTER quantity;

-- 3. 添加索引以提高查询性能
CREATE INDEX idx_is_batch_outbound ON inventory_outbound(is_batch_outbound);

-- 4. 查看修改结果
SHOW COLUMNS FROM inventory_outbound LIKE '%source%';
SHOW COLUMNS FROM inventory_outbound_items LIKE 'source_tasks';

