-- 技术通讯系统性能优化
-- 执行时间: 2025-11-04
-- 说明: 添加索引、优化查询性能

-- 1. 添加全文索引（提升搜索性能）
SET @index_exists = (
  SELECT COUNT(*) FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = 'mes'
    AND TABLE_NAME = 'technical_communications'
    AND INDEX_NAME = 'ft_search'
);

SET @sql = IF(@index_exists = 0,
  'ALTER TABLE technical_communications ADD FULLTEXT INDEX ft_search (title, summary, content)',
  'SELECT ''Index ft_search already exists'' AS message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 2. 添加复合索引（提升筛选性能）
SET @index_exists = (
  SELECT COUNT(*) FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = 'mes'
    AND TABLE_NAME = 'technical_communications'
    AND INDEX_NAME = 'idx_status_published'
);

SET @sql = IF(@index_exists = 0,
  'CREATE INDEX idx_status_published ON technical_communications(status, published_at DESC)',
  'SELECT ''Index idx_status_published already exists'' AS message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @index_exists = (
  SELECT COUNT(*) FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = 'mes'
    AND TABLE_NAME = 'technical_communications'
    AND INDEX_NAME = 'idx_category_status'
);

SET @sql = IF(@index_exists = 0,
  'CREATE INDEX idx_category_status ON technical_communications(category, status)',
  'SELECT ''Index idx_category_status already exists'' AS message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @index_exists = (
  SELECT COUNT(*) FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = 'mes'
    AND TABLE_NAME = 'technical_communications'
    AND INDEX_NAME = 'idx_pinned_published'
);

SET @sql = IF(@index_exists = 0,
  'CREATE INDEX idx_pinned_published ON technical_communications(is_pinned DESC, published_at DESC)',
  'SELECT ''Index idx_pinned_published already exists'' AS message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 3. 优化评论查询索引
SET @index_exists = (
  SELECT COUNT(*) FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = 'mes'
    AND TABLE_NAME = 'technical_communication_comments'
    AND INDEX_NAME = 'idx_comm_created'
);

SET @sql = IF(@index_exists = 0,
  'CREATE INDEX idx_comm_created ON technical_communication_comments(communication_id, created_at DESC)',
  'SELECT ''Index idx_comm_created already exists'' AS message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 4. 优化阅读记录查询
SET @index_exists = (
  SELECT COUNT(*) FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = 'mes'
    AND TABLE_NAME = 'technical_communication_reads'
    AND INDEX_NAME = 'idx_user_read'
);

SET @sql = IF(@index_exists = 0,
  'CREATE INDEX idx_user_read ON technical_communication_reads(user_id, read_at DESC)',
  'SELECT ''Index idx_user_read already exists'' AS message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 5. 添加点赞表和收藏表
CREATE TABLE IF NOT EXISTS technical_communication_likes (
  id INT PRIMARY KEY AUTO_INCREMENT COMMENT '点赞ID',
  communication_id INT NOT NULL COMMENT '通讯ID',
  user_id INT NOT NULL COMMENT '用户ID',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '点赞时间',
  UNIQUE KEY uk_comm_user (communication_id, user_id),
  INDEX idx_communication_id (communication_id),
  INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='技术通讯点赞表';

CREATE TABLE IF NOT EXISTS technical_communication_favorites (
  id INT PRIMARY KEY AUTO_INCREMENT COMMENT '收藏ID',
  communication_id INT NOT NULL COMMENT '通讯ID',
  user_id INT NOT NULL COMMENT '用户ID',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '收藏时间',
  UNIQUE KEY uk_comm_user (communication_id, user_id),
  INDEX idx_communication_id (communication_id),
  INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='技术通讯收藏表';

-- 6. 修改主表，添加统计字段（检查字段是否存在）
-- 添加 like_count 字段
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = 'mes'
  AND TABLE_NAME = 'technical_communications'
  AND COLUMN_NAME = 'like_count';

SET @sql = IF(@col_exists = 0,
  'ALTER TABLE technical_communications ADD COLUMN like_count INT DEFAULT 0 COMMENT ''点赞数''',
  'SELECT ''Column like_count already exists'' AS message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 添加 favorite_count 字段
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = 'mes'
  AND TABLE_NAME = 'technical_communications'
  AND COLUMN_NAME = 'favorite_count';

SET @sql = IF(@col_exists = 0,
  'ALTER TABLE technical_communications ADD COLUMN favorite_count INT DEFAULT 0 COMMENT ''收藏数''',
  'SELECT ''Column favorite_count already exists'' AS message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 7. 添加索引到统计字段
CREATE INDEX idx_like_count ON technical_communications(like_count DESC);
CREATE INDEX idx_view_count ON technical_communications(view_count DESC);

