-- Technical Communication CC Recipients Feature
-- Date: 2025-11-04
-- Description: Add CC recipients feature for technical communications

-- 1. Create recipients table
CREATE TABLE IF NOT EXISTS technical_communication_recipients (
  id INT PRIMARY KEY AUTO_INCREMENT,
  communication_id INT NOT NULL,
  user_id INT NOT NULL,
  recipient_type ENUM('to', 'cc') DEFAULT 'cc',
  is_read TINYINT(1) DEFAULT 0,
  read_at DATETIME NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_comm_user (communication_id, user_id),
  INDEX idx_communication_id (communication_id),
  INDEX idx_user_id (user_id),
  INDEX idx_is_read (is_read),
  INDEX idx_type (recipient_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Add visibility column
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = 'mes'
  AND TABLE_NAME = 'technical_communications'
  AND COLUMN_NAME = 'visibility';

SET @sql = IF(@col_exists = 0,
  'ALTER TABLE technical_communications ADD COLUMN visibility ENUM(''public'', ''private'') DEFAULT ''public''',
  'SELECT ''Column visibility already exists'' AS message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 3. Add recipient count column
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = 'mes'
  AND TABLE_NAME = 'technical_communications'
  AND COLUMN_NAME = 'recipient_count';

SET @sql = IF(@col_exists = 0,
  'ALTER TABLE technical_communications ADD COLUMN recipient_count INT DEFAULT 0',
  'SELECT ''Column recipient_count already exists'' AS message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 4. Add read count column
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = 'mes'
  AND TABLE_NAME = 'technical_communications'
  AND COLUMN_NAME = 'read_count';

SET @sql = IF(@col_exists = 0,
  'ALTER TABLE technical_communications ADD COLUMN read_count INT DEFAULT 0',
  'SELECT ''Column read_count already exists'' AS message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 5. Create department recipients table
CREATE TABLE IF NOT EXISTS technical_communication_department_recipients (
  id INT PRIMARY KEY AUTO_INCREMENT,
  communication_id INT NOT NULL,
  department_id INT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_comm_dept (communication_id, department_id),
  INDEX idx_communication_id (communication_id),
  INDEX idx_department_id (department_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Add visibility index
SET @index_exists = (
  SELECT COUNT(*) FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = 'mes'
    AND TABLE_NAME = 'technical_communications'
    AND INDEX_NAME = 'idx_visibility'
);

SET @sql = IF(@index_exists = 0,
  'CREATE INDEX idx_visibility ON technical_communications(visibility)',
  'SELECT ''Index idx_visibility already exists'' AS message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

