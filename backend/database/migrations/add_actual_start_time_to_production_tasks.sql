-- 为生产任务表添加 actual_start_time 字段
-- 执行时间: 2025-10-25
-- 说明: 添加实际开始时间（发料时间）字段

-- 添加 actual_start_time 字段
ALTER TABLE production_tasks 
ADD COLUMN IF NOT EXISTS actual_start_time DATETIME NULL COMMENT '实际开始时间（发料时间）' AFTER expected_end_date;

-- 添加索引以优化查询
CREATE INDEX IF NOT EXISTS idx_production_tasks_actual_start_time ON production_tasks(actual_start_time);

-- 说明：
-- 1. actual_start_time 字段记录生产任务的实际开始时间（即发料时间）
-- 2. 当创建出库单并关联生产任务时，自动设置此字段
-- 3. 此字段用于追踪任务的实际执行时间

