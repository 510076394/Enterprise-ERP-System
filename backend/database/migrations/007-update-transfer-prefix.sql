-- 更新库存调拨单前缀从 TR 改为 DB
-- 创建日期: 2025-10-20
-- 说明: 解决库存调拨单 (TR) 和库存交易流水 (TR) 的前缀冲突问题

-- ====================================
-- 第一步：备份当前数据（可选）
-- ====================================
-- 如需备份，请在执行前取消下面的注释
-- CREATE TABLE IF NOT EXISTS inventory_transfers_backup_20251020 
-- SELECT * FROM inventory_transfers WHERE transfer_no LIKE 'TR20%';

-- ====================================
-- 第二步：更新调拨单编号前缀
-- ====================================
-- 只更新日期格式为 YYYYMMDD 的记录（调拨单）
-- TR + 8位日期 + 3位序号 = 14位总长度

UPDATE inventory_transfers
SET transfer_no = CONCAT('DB', SUBSTRING(transfer_no, 3))
WHERE transfer_no LIKE 'TR20%'    -- 只更新 TR20XXXXXX 格式的（8位日期）
  AND LENGTH(transfer_no) = 14     -- 确保是 TR + 8位日期 + 3位序号
  AND transfer_no NOT LIKE 'DB%';  -- 避免重复更新

-- ====================================
-- 第三步：验证更新结果
-- ====================================
-- 查询更新后的调拨单数量和范围
SELECT 
  COUNT(*) as updated_count,
  MIN(transfer_no) as min_no,
  MAX(transfer_no) as max_no
FROM inventory_transfers
WHERE transfer_no LIKE 'DB20%';

-- 验证是否还有旧格式的调拨单（应该返回0）
SELECT 
  COUNT(*) as remaining_old_format
FROM inventory_transfers
WHERE transfer_no LIKE 'TR20%'
  AND LENGTH(transfer_no) = 14;

-- ====================================
-- 第四步：更新调拨单明细表的关联（如果需要）
-- ====================================
-- 如果 inventory_transfer_items 表中有 transfer_no 字段，需要同步更新
-- 请根据实际表结构执行以下语句

-- UPDATE inventory_transfer_items iti
-- INNER JOIN inventory_transfers it ON iti.transfer_id = it.id
-- SET iti.transfer_no = it.transfer_no
-- WHERE it.transfer_no LIKE 'DB20%';

-- ====================================
-- 注意事项
-- ====================================
-- 1. 此脚本只影响库存调拨单（TR20XXXXXXXX格式，14位长度）
-- 2. 库存交易流水（TR + 6位日期，格式：TR251020XXX，11位长度）不受影响
-- 3. 执行前请务必备份数据库！
-- 4. 执行后请验证前端显示和报表是否需要相应调整
-- 5. 如果有其他表引用了 transfer_no，需要相应更新

-- ====================================
-- 回滚方案（如需回滚）
-- ====================================
-- 如果需要回滚，执行以下语句：
-- UPDATE inventory_transfers
-- SET transfer_no = CONCAT('TR', SUBSTRING(transfer_no, 3))
-- WHERE transfer_no LIKE 'DB20%'
--   AND LENGTH(transfer_no) = 14;

