-- ==================== 安全增强数据库迁移回滚脚本 ====================
-- @date 2025-11-21
-- @description 回滚20251121_add_security_enhancements.sql的所有更改
-- @author AI Assistant
-- ⚠️ 警告：此脚本会删除refresh_tokens、security_logs和sessions表，以及相关的存储过程和事件
-- 请确保在执行前备份数据！

-- ==================== 删除定时任务事件 ====================

DROP EVENT IF EXISTS `daily_cleanup_expired_tokens`;
DROP EVENT IF EXISTS `daily_cleanup_expired_sessions`;
DROP EVENT IF EXISTS `weekly_cleanup_old_security_logs`;

-- ==================== 删除存储过程 ====================

DROP PROCEDURE IF EXISTS `cleanup_expired_refresh_tokens`;
DROP PROCEDURE IF EXISTS `cleanup_expired_sessions`;
DROP PROCEDURE IF EXISTS `cleanup_old_security_logs`;

-- ==================== 删除表 ====================

-- 注意：这会永久删除所有数据！
DROP TABLE IF EXISTS `refresh_tokens`;
DROP TABLE IF EXISTS `security_logs`;
DROP TABLE IF EXISTS `sessions`;

-- ==================== 删除users表的token_version字段 ====================

-- 检查字段是否存在
SET @column_exists = (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'users' 
    AND COLUMN_NAME = 'token_version'
);

-- 如果字段存在，则删除
SET @sql = IF(
  @column_exists > 0,
  'ALTER TABLE `users` DROP COLUMN `token_version`;',
  'SELECT ''Column token_version does not exist'' AS result;'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ==================== 删除users表的索引 ====================

-- 检查索引是否存在
SET @index_exists = (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.STATISTICS 
  WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'users' 
    AND INDEX_NAME = 'idx_token_version'
);

-- 如果索引存在，则删除
SET @sql = IF(
  @index_exists > 0,
  'DROP INDEX `idx_token_version` ON `users`;',
  'SELECT ''Index idx_token_version does not exist'' AS result;'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ==================== 完成提示 ====================

SELECT '✅ 安全增强数据库迁移已回滚！' AS status,
       '已删除以下内容：' AS message,
       '1. users表的token_version字段和索引' AS rollback1,
       '2. refresh_tokens表' AS rollback2,
       '3. security_logs表' AS rollback3,
       '4. sessions表' AS rollback4,
       '5. 所有相关的存储过程和定时任务' AS rollback5,
       '⚠️ 所有相关数据已被永久删除！' AS warning;

