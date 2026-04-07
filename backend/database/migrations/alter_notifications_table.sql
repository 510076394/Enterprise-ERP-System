-- 修改通知表结构，添加缺失的字段

-- 添加 priority 字段
ALTER TABLE `notifications` 
ADD COLUMN `priority` TINYINT DEFAULT 0 COMMENT '优先级：0-普通，1-重要，2-紧急' AFTER `is_read`;

-- 添加 read_at 字段
ALTER TABLE `notifications` 
ADD COLUMN `read_at` DATETIME COMMENT '阅读时间' AFTER `priority`;

-- 添加 link_params 字段
ALTER TABLE `notifications` 
ADD COLUMN `link_params` JSON COMMENT '链接参数' AFTER `link`;

-- 添加 source_type 字段（如果 source 字段存在，可以保留）
ALTER TABLE `notifications` 
ADD COLUMN `source_type` VARCHAR(50) COMMENT '来源类型：order-订单, inventory-库存, production-生产等' AFTER `link_params`;

-- 添加 source_id 字段
ALTER TABLE `notifications` 
ADD COLUMN `source_id` INT COMMENT '来源ID' AFTER `source_type`;

-- 添加 created_by 字段
ALTER TABLE `notifications` 
ADD COLUMN `created_by` INT COMMENT '创建人ID' AFTER `source_id`;

-- 添加索引
ALTER TABLE `notifications` 
ADD INDEX `idx_priority` (`priority`);

