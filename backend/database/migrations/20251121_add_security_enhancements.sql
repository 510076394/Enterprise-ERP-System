-- ==================== 安全增强数据库迁移 ====================
-- @date 2025-11-21
-- @description 添加对新认证和安全功能的支持
-- @author AI Assistant
-- ==================== 用于支持刷新Token的版本控制 ====================

-- 1. 添加token_version字段到users表（用于refresh token revocation）
-- 检查字段是否已存在
SET @column_exists = (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'users' 
    AND COLUMN_NAME = 'token_version'
);

-- 如果字段不存在，则添加
SET @sql = IF(
  @column_exists = 0,
  'ALTER TABLE `users` ADD COLUMN `token_version` INT NOT NULL DEFAULT 0 COMMENT ''Token版本号，用于撤销刷新令牌'' AFTER `password`;',
  'SELECT ''Column token_version already exists'' AS result;'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ==================== 创建刷新Token跟踪表 ====================

-- 2. 创建refresh_tokens表（可选，用于更细粒度的token管理）
CREATE TABLE IF NOT EXISTS `refresh_tokens` (
  `id` INT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `user_id` INT NOT NULL COMMENT '用户ID',
  `token` VARCHAR(500) NOT NULL COMMENT 'Refresh Token（加密存储）',
  `token_family` VARCHAR(100) NULL COMMENT 'Token家族ID（用于检测Token重用）',
  `expires_at` DATETIME NOT NULL COMMENT '过期时间',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `last_used_at` DATETIME NULL COMMENT '最后使用时间',
  `ip_address` VARCHAR(45) NULL COMMENT '客户端IP地址',
  `user_agent` VARCHAR(500) NULL COMMENT '客户端User-Agent',
  `is_revoked` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否已撤销',
  `revoked_at` DATETIME NULL COMMENT '撤销时间',
  `revoked_reason` VARCHAR(255) NULL COMMENT '撤销原因',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_token` (`token`(255)),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_expires_at` (`expires_at`),
  KEY `idx_token_family` (`token_family`),
  KEY `idx_is_revoked` (`is_revoked`),
  CONSTRAINT `fk_refresh_tokens_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='刷新Token跟踪表';

-- ==================== 创建安全审计日志表（如果不存在） ====================

-- 3. 创建security_logs表（用于记录安全事件）
CREATE TABLE IF NOT EXISTS `security_logs` (
  `id` INT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `user_id` INT NULL COMMENT '用户ID',
  `event_type` VARCHAR(50) NOT NULL COMMENT '事件类型（login, logout, token_refresh, failed_login等）',
  `event_status` ENUM('success', 'failure', 'warning') NOT NULL DEFAULT 'success' COMMENT '事件状态',
  `ip_address` VARCHAR(45) NULL COMMENT 'IP地址',
  `user_agent` VARCHAR(500) NULL COMMENT 'User-Agent',
  `details` TEXT NULL COMMENT '详细信息（JSON格式）',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_event_type` (`event_type`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_event_status` (`event_status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='安全审计日志表';

-- ==================== 创建会话管理表（可选） ====================

-- 4. 创建sessions表（用于CSRF token和会话管理）
CREATE TABLE IF NOT EXISTS `sessions` (
  `id` VARCHAR(128) NOT NULL COMMENT '会话ID',
  `user_id` INT NULL COMMENT '用户ID',
  `csrf_token` VARCHAR(128) NULL COMMENT 'CSRF Token',
  `csrf_token_expires_at` DATETIME NULL COMMENT 'CSRF Token过期时间',
  `data` TEXT NULL COMMENT '会话数据（JSON格式）',
  `ip_address` VARCHAR(45) NULL COMMENT 'IP地址',
  `user_agent` VARCHAR(500) NULL COMMENT 'User-Agent',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `expires_at` DATETIME NOT NULL COMMENT '过期时间',
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_expires_at` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='会话管理表';

-- ==================== 创建索引优化 ====================

-- 5. 为users表添加索引（如果不存在）
-- 检查索引是否存在
SET @index_exists = (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.STATISTICS 
  WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'users' 
    AND INDEX_NAME = 'idx_token_version'
);

-- 如果索引不存在，则创建
SET @sql = IF(
  @index_exists = 0,
  'CREATE INDEX `idx_token_version` ON `users` (`token_version`);',
  'SELECT ''Index idx_token_version already exists'' AS result;'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ==================== 清理过期数据的存储过程 ====================

-- 6. 创建清理过期refresh_tokens的存储过程
DELIMITER //

DROP PROCEDURE IF EXISTS `cleanup_expired_refresh_tokens`//

CREATE PROCEDURE `cleanup_expired_refresh_tokens`()
BEGIN
  DECLARE deleted_count INT DEFAULT 0;
  
  -- 删除过期的refresh tokens（保留30天的历史记录）
  DELETE FROM `refresh_tokens` 
  WHERE `expires_at` < DATE_SUB(NOW(), INTERVAL 30 DAY);
  
  SET deleted_count = ROW_COUNT();
  
  -- 记录清理结果
  SELECT CONCAT('Cleaned up ', deleted_count, ' expired refresh tokens') AS result;
END//

DELIMITER ;

-- 7. 创建清理过期sessions的存储过程
DELIMITER //

DROP PROCEDURE IF EXISTS `cleanup_expired_sessions`//

CREATE PROCEDURE `cleanup_expired_sessions`()
BEGIN
  DECLARE deleted_count INT DEFAULT 0;
  
  -- 删除过期的sessions
  DELETE FROM `sessions` 
  WHERE `expires_at` < NOW();
  
  SET deleted_count = ROW_COUNT();
  
  -- 记录清理结果
  SELECT CONCAT('Cleaned up ', deleted_count, ' expired sessions') AS result;
END//

DELIMITER ;

-- 8. 创建清理旧安全日志的存储过程
DELIMITER //

DROP PROCEDURE IF EXISTS `cleanup_old_security_logs`//

CREATE PROCEDURE `cleanup_old_security_logs`()
BEGIN
  DECLARE deleted_count INT DEFAULT 0;
  
  -- 删除90天前的安全日志（根据需求调整保留时间）
  DELETE FROM `security_logs` 
  WHERE `created_at` < DATE_SUB(NOW(), INTERVAL 90 DAY);
  
  SET deleted_count = ROW_COUNT();
  
  -- 记录清理结果
  SELECT CONCAT('Cleaned up ', deleted_count, ' old security logs') AS result;
END//

DELIMITER ;

-- ==================== 创建定时任务事件（可选） ====================

-- 启用事件调度器
SET GLOBAL event_scheduler = ON;

-- 9. 创建每日清理事件
DROP EVENT IF EXISTS `daily_cleanup_expired_tokens`;
CREATE EVENT `daily_cleanup_expired_tokens`
  ON SCHEDULE EVERY 1 DAY
  STARTS CURRENT_TIMESTAMP
  DO
    CALL cleanup_expired_refresh_tokens();

DROP EVENT IF EXISTS `daily_cleanup_expired_sessions`;
CREATE EVENT `daily_cleanup_expired_sessions`
  ON SCHEDULE EVERY 1 DAY
  STARTS CURRENT_TIMESTAMP
  DO
    CALL cleanup_expired_sessions();

DROP EVENT IF EXISTS `weekly_cleanup_old_security_logs`;
CREATE EVENT `weekly_cleanup_old_security_logs`
  ON SCHEDULE EVERY 1 WEEK
  STARTS CURRENT_TIMESTAMP
  DO
    CALL cleanup_old_security_logs();

-- ==================== 完成提示 ====================

SELECT '✅ 安全增强数据库迁移完成！' AS status,
       '已添加以下功能：' AS message,
       '1. users表的token_version字段（用于refresh token撤销）' AS feature1,
       '2. refresh_tokens表（用于跟踪刷新令牌）' AS feature2,
       '3. security_logs表（用于安全审计）' AS feature3,
       '4. sessions表（用于CSRF和会话管理）' AS feature4,
       '5. 自动清理过期数据的存储过程和定时任务' AS feature5;

