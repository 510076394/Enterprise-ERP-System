-- 添加is_general字段到inspection_templates表
ALTER TABLE inspection_templates 
ADD COLUMN is_general BOOLEAN NOT NULL DEFAULT FALSE COMMENT '是否通用模板' AFTER material_type;

-- 修改material_type字段类型
ALTER TABLE inspection_templates 
MODIFY COLUMN material_type BIGINT NULL COMMENT '适用物料类型ID'; 