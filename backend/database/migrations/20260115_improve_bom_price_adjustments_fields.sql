-- 优化bom_material_price_adjustments表字段
USE mes;

-- 1. 将adjustment_reason从VARCHAR(255)改为TEXT以支持更长的调整原因
ALTER TABLE bom_material_price_adjustments 
MODIFY COLUMN adjustment_reason TEXT NOT NULL COMMENT '调整原因';

-- 验证修改
SELECT 
    COLUMN_NAME,
    COLUMN_TYPE,
    IS_NULLABLE,
    COLUMN_COMMENT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'mes' 
    AND TABLE_NAME = 'bom_material_price_adjustments'
    AND COLUMN_NAME IN ('adjustment_reason', 'updated_at');
