-- =====================================================
-- 强制删除生产计划 ID: 1243-1262
-- 创建日期: 2025-10-31
-- 警告: 此操作不可逆，请在执行前确认
-- =====================================================

-- 使用事务确保数据一致性
START TRANSACTION;

-- 1. 先查看要删除的生产计划信息（可选，用于确认）
SELECT 
    id,
    code AS '计划编号',
    name AS '计划名称',
    status AS '状态',
    quantity AS '数量',
    created_at AS '创建时间'
FROM production_plans
WHERE id BETWEEN 1243 AND 1262
ORDER BY id;

-- 2. 删除关联的生产任务物料明细
DELETE FROM production_task_materials 
WHERE task_id IN (
    SELECT id FROM production_tasks WHERE plan_id BETWEEN 1243 AND 1262
);

-- 3. 删除关联的生产任务工序
DELETE FROM production_task_processes 
WHERE task_id IN (
    SELECT id FROM production_tasks WHERE plan_id BETWEEN 1243 AND 1262
);

-- 4. 删除关联的生产任务
DELETE FROM production_tasks 
WHERE plan_id BETWEEN 1243 AND 1262;

-- 5. 删除生产计划物料需求
DELETE FROM production_plan_materials 
WHERE plan_id BETWEEN 1243 AND 1262;

-- 6. 删除生产计划主表
DELETE FROM production_plans 
WHERE id BETWEEN 1243 AND 1262;

-- 7. 显示删除结果
SELECT 
    '删除完成' AS status,
    ROW_COUNT() AS '最后操作影响行数';

-- 提交事务（取消注释以执行删除）
-- COMMIT;

-- 如果需要回滚（默认）
ROLLBACK;

-- =====================================================
-- 使用说明:
-- 1. 在MySQL客户端或Navicat等工具中执行此脚本
-- 2. 首先查看第一个SELECT的结果，确认要删除的计划
-- 3. 如果确认删除，将最后的 COMMIT; 前的注释去掉
-- 4. 将 ROLLBACK; 行注释掉或删除
-- 5. 重新执行脚本
-- =====================================================

