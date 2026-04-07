-- 修改traceability_quality表，添加inspection_id字段以支持自动关联质检功能
ALTER TABLE traceability_quality 
ADD COLUMN inspection_id INT NULL COMMENT '关联的检验单ID' AFTER traceability_id,
ADD INDEX idx_inspection_id (inspection_id);

-- 为表添加注释
ALTER TABLE traceability_quality COMMENT '追溯质检记录表 - 支持自动关联';

-- 添加完整性检查函数
DELIMITER //
CREATE PROCEDURE check_traceability_quality_inspection_id()
BEGIN
    DECLARE column_exists INT;
    
    -- 检查inspection_id字段是否存在
    SELECT COUNT(*) INTO column_exists 
    FROM information_schema.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'traceability_quality' 
      AND COLUMN_NAME = 'inspection_id';
    
    -- 如果字段不存在，则添加
    IF column_exists = 0 THEN
        ALTER TABLE traceability_quality 
        ADD COLUMN inspection_id INT NULL COMMENT '关联的检验单ID' AFTER traceability_id,
        ADD INDEX idx_inspection_id (inspection_id);
    END IF;
END //
DELIMITER ;

-- 调用检查程序
CALL check_traceability_quality_inspection_id();

-- 删除临时存储过程
DROP PROCEDURE IF EXISTS check_traceability_quality_inspection_id; 