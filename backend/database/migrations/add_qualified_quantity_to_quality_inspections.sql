-- 添加不合格数量字段（qualified_quantity已存在，只添加unqualified_quantity）
ALTER TABLE quality_inspections ADD COLUMN unqualified_quantity DECIMAL(10,2) DEFAULT NULL COMMENT '不合格数量' AFTER qualified_quantity;

-- 添加索引以提高查询性能
CREATE INDEX idx_unqualified_quantity ON quality_inspections(unqualified_quantity);

-- 更新现有数据：对于已完成的检验单，设置不合格数量
-- 如果检验通过，不合格数量=0
UPDATE quality_inspections SET unqualified_quantity = 0 WHERE status = 'passed' AND unqualified_quantity IS NULL;

-- 如果检验不通过，不合格数量=检验数量
UPDATE quality_inspections SET unqualified_quantity = quantity WHERE status = 'failed' AND unqualified_quantity IS NULL;

-- 如果部分合格，不合格数量=检验数量-合格数量
UPDATE quality_inspections SET unqualified_quantity = GREATEST(0, quantity - COALESCE(qualified_quantity, 0)) WHERE status = 'partial' AND unqualified_quantity IS NULL;

