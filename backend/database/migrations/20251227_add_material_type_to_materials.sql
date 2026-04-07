-- 在materials表中添加material_type字段
-- 用于记录物料的材质信息
-- 2025-12-27

-- 添加material_type字段
ALTER TABLE materials 
ADD COLUMN material_type VARCHAR(100) NULL COMMENT '材质（如：304不锈钢、Q235钢板等）' AFTER color_code;

-- 添加索引以提高查询性能
ALTER TABLE materials 
ADD INDEX idx_material_type (material_type);

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
  AND COLUMN_NAME = 'material_type';

