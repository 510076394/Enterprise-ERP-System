-- 在materials表中添加production_group_id字段
-- 用于关联物料的生产组信息

-- 添加production_group_id字段
ALTER TABLE materials 
ADD COLUMN production_group_id INT NULL COMMENT '生产组ID（关联departments表）' AFTER supplier_id;

-- 添加索引以提高查询性能
ALTER TABLE materials 
ADD INDEX idx_production_group_id (production_group_id);

-- 添加外键约束（可选，如果需要强制数据完整性）
-- ALTER TABLE materials 
-- ADD CONSTRAINT fk_materials_production_group 
-- FOREIGN KEY (production_group_id) REFERENCES departments(id) 
-- ON DELETE SET NULL 
-- ON UPDATE CASCADE;

-- 验证修改
SELECT
    COLUMN_NAME,
    COLUMN_TYPE,
    IS_NULLABLE,
    COLUMN_DEFAULT,
    COLUMN_COMMENT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'mes'
  AND TABLE_NAME = 'materials'
  AND COLUMN_NAME = 'production_group_id';

