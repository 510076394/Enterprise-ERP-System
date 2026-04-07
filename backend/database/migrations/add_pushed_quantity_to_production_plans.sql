-- 添加已下推数量字段到生产计划表
-- 用于追踪计划已下推到任务的数量

-- 添加字段
ALTER TABLE production_plans 
ADD COLUMN IF NOT EXISTS pushed_quantity INT DEFAULT 0 COMMENT '已下推数量';

-- 初始化现有数据
UPDATE production_plans 
SET pushed_quantity = 0 
WHERE pushed_quantity IS NULL OR pushed_quantity < 0;

-- 验证添加
SELECT 
  id,
  code,
  product_name,
  quantity as plan_quantity,
  pushed_quantity,
  (quantity - IFNULL(pushed_quantity, 0)) as remaining_quantity
FROM production_plans
LIMIT 5;

