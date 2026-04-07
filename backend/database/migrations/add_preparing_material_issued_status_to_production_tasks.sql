-- 为生产任务表添加 'preparing' 和 'material_issued' 状态
-- 执行时间: 2025-10-22
-- 说明: 添加配料中和已发料两个状态，使生产任务状态与生产计划保持一致

-- 修改 production_tasks 表的 status 字段，添加新的状态值
ALTER TABLE production_tasks 
MODIFY COLUMN status ENUM(
  'pending',           -- 未开始
  'preparing',         -- 配料中（新增）
  'material_issued',   -- 已发料（新增）
  'inProgress',        -- 生产中
  'completed',         -- 已完成
  'cancelled'          -- 已取消
) NOT NULL DEFAULT 'pending' COMMENT '任务状态';

-- 添加索引以优化状态查询
CREATE INDEX IF NOT EXISTS idx_production_tasks_status ON production_tasks(status);

-- 说明：
-- 1. 'preparing' 状态：当出库单引用生产任务时自动设置
-- 2. 'material_issued' 状态：当出库单完成时自动设置
-- 3. 状态流转：pending → preparing → material_issued → inProgress → completed

