-- 在materials表中添加supplier_id字段
-- 用于关联物料的供应商信息

-- 添加supplier_id字段
ALTER TABLE materials 
ADD COLUMN supplier_id INT NULL COMMENT '供应商ID' AFTER material_source_id;

-- 添加索引以提高查询性能
ALTER TABLE materials 
ADD INDEX idx_supplier_id (supplier_id);

-- 添加外键约束（可选，如果需要强制数据完整性）
-- ALTER TABLE materials 
-- ADD CONSTRAINT fk_materials_supplier 
-- FOREIGN KEY (supplier_id) REFERENCES suppliers(id) 
-- ON DELETE SET NULL 
-- ON UPDATE CASCADE;

