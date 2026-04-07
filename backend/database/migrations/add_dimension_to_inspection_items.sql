-- 为检验项添加尺寸和公差字段
-- 创建时间: 2025-10-18
-- 描述: 添加标准尺寸值、上公差、下公差字段，用于尺寸检验的自动判定

ALTER TABLE inspection_items 
ADD COLUMN dimension_value DECIMAL(10, 3) NULL COMMENT '标准尺寸值' AFTER is_critical,
ADD COLUMN tolerance_upper DECIMAL(10, 3) NULL COMMENT '上公差' AFTER dimension_value,
ADD COLUMN tolerance_lower DECIMAL(10, 3) NULL COMMENT '下公差' AFTER tolerance_upper;

-- 添加索引以提高查询性能
CREATE INDEX idx_dimension ON inspection_items(dimension_value);

