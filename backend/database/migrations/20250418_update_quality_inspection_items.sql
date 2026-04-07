-- 更新质量检验项表，增加类型和是否关键项等必要字段
ALTER TABLE quality_inspection_items 
ADD COLUMN type ENUM('visual', 'dimension', 'function', 'performance', 'safety', 'other') COMMENT '检验类型' AFTER standard,
ADD COLUMN is_critical BOOLEAN DEFAULT FALSE COMMENT '是否关键项' AFTER type,
ADD COLUMN actual_value VARCHAR(200) COMMENT '实际值' AFTER is_critical;

-- 为检验单表增加模板ID关联
ALTER TABLE quality_inspections
ADD COLUMN template_id INT COMMENT '检验模板ID' AFTER standard_no; 