-- 修改 materials 表的字段，允许为 NULL
-- 这样在导入订单时，如果没有物料编码，可以自动创建物料记录

-- 1. 修改 code 字段，允许为 NULL
ALTER TABLE materials
MODIFY COLUMN code VARCHAR(50) NULL COMMENT '物料编码';

-- 2. 修改 category_id 字段，允许为 NULL
ALTER TABLE materials
MODIFY COLUMN category_id INT NULL COMMENT '物料分类ID';

-- 3. 修改 unit_id 字段，允许为 NULL
ALTER TABLE materials
MODIFY COLUMN unit_id INT NULL COMMENT '单位ID';

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
  AND COLUMN_NAME IN ('code', 'category_id', 'unit_id');

