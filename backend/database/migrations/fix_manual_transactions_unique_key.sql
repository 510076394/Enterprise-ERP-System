-- 修复 manual_transactions 表的唯一索引问题
-- 问题：uk_transaction_no 唯一索引导致同一单据不能有多条明细
-- 解决：删除唯一索引，改为普通索引

-- 删除唯一索引
ALTER TABLE manual_transactions DROP INDEX uk_transaction_no;

-- 添加普通索引（用于查询优化）
ALTER TABLE manual_transactions ADD INDEX idx_transaction_no (transaction_no);

