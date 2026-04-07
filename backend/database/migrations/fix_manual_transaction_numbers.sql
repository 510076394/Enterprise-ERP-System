-- 修复手工出入库单据编号
-- 此脚本用于删除错误的单据编号并重新生成正确的编号

-- 方案1：删除所有手工出入库单据（如果您想重新开始）
-- 注意：此操作会删除所有数据，请谨慎使用！
-- DELETE FROM manual_transactions;

-- 方案2：只删除今天的单据（如果只想删除今天的测试数据）
-- DELETE FROM manual_transactions WHERE DATE(created_at) = CURDATE();

-- 方案3：查看当前所有单据编号，手动选择要删除的
SELECT 
    transaction_no,
    transaction_type,
    transaction_date,
    COUNT(*) as item_count,
    GROUP_CONCAT(material_id) as material_ids,
    created_at
FROM manual_transactions
GROUP BY transaction_no, transaction_type, transaction_date, created_at
ORDER BY created_at DESC;

-- 方案4：删除特定的单据编号（请根据上面的查询结果修改单据编号）
-- 示例：删除 MTIN251101001, MTIN251101011, MTIN251101111
-- DELETE FROM manual_transactions WHERE transaction_no IN ('MTIN251101001', 'MTIN251101011', 'MTIN251101111');

-- 方案5：删除编号不正确的单据（编号不是连续的）
-- 这个查询会找出所有编号异常的单据
SELECT 
    transaction_no,
    CAST(SUBSTRING(transaction_no, -3) AS UNSIGNED) as seq_no,
    transaction_type,
    created_at
FROM (
    SELECT DISTINCT transaction_no, transaction_type, created_at
    FROM manual_transactions
    WHERE DATE(created_at) = CURDATE()
) AS t
ORDER BY created_at;

-- 执行删除前，请先备份数据！
-- 建议：先执行查询，确认要删除的数据，然后再执行删除操作

