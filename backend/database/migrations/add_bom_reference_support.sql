-- =====================================================
-- 引用式BOM支持
-- 添加字段和表以支持BOM引用和展BOM功能
-- =====================================================

-- 1. 为bom_details表添加引用字段
-- has_sub_bom: 标记该物料是否有自己的BOM（作为子组件）
-- ref_bom_id: 引用的子组件BOM ID（可选，用于锁定特定版本）
ALTER TABLE bom_details
ADD COLUMN has_sub_bom TINYINT(1) DEFAULT 0 COMMENT '是否有子BOM（0-无，1-有）' AFTER parent_id,
ADD COLUMN ref_bom_id INT DEFAULT NULL COMMENT '引用的子BOM ID（用于版本锁定）' AFTER has_sub_bom;

-- 2. 添加索引
CREATE INDEX idx_bom_details_has_sub_bom ON bom_details(has_sub_bom);
CREATE INDEX idx_bom_details_ref_bom_id ON bom_details(ref_bom_id);

-- 3. 创建展BOM缓存表（用于生产发料时快速获取所有层级物料）
CREATE TABLE IF NOT EXISTS bom_explosion_cache (
  id INT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
  product_id INT NOT NULL COMMENT '顶层产品ID',
  bom_id INT NOT NULL COMMENT '顶层BOM ID',
  bom_version VARCHAR(50) COMMENT 'BOM版本',
  material_id INT NOT NULL COMMENT '物料ID',
  material_code VARCHAR(50) COMMENT '物料编码',
  material_name VARCHAR(200) COMMENT '物料名称',
  level INT NOT NULL DEFAULT 1 COMMENT '展开后的层级（1-N）',
  quantity_per DECIMAL(10,4) NOT NULL DEFAULT 1 COMMENT '单位用量（考虑各级系数）',
  parent_material_id INT DEFAULT NULL COMMENT '直接父级物料ID',
  bom_path VARCHAR(500) COMMENT 'BOM路径，如 "产品A/组件B/零件C"',
  source_bom_id INT COMMENT '来源BOM ID（该物料所属的BOM）',
  unit_id INT COMMENT '单位ID',
  unit_name VARCHAR(50) COMMENT '单位名称',
  cached_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '缓存时间',
  is_valid TINYINT(1) DEFAULT 1 COMMENT '是否有效（BOM变更时置为无效）',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_product_id (product_id),
  INDEX idx_bom_id (bom_id),
  INDEX idx_material_id (material_id),
  INDEX idx_level (level),
  INDEX idx_is_valid (is_valid)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='BOM展开缓存表';

-- 4. 创建BOM引用关系表（记录哪些BOM引用了哪些子BOM）
CREATE TABLE IF NOT EXISTS bom_references (
  id INT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
  parent_bom_id INT NOT NULL COMMENT '父级BOM ID',
  child_bom_id INT NOT NULL COMMENT '子级BOM ID（被引用的BOM）',
  child_material_id INT NOT NULL COMMENT '子级物料ID',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  UNIQUE KEY uk_parent_child (parent_bom_id, child_bom_id),
  INDEX idx_parent_bom_id (parent_bom_id),
  INDEX idx_child_bom_id (child_bom_id),
  INDEX idx_child_material_id (child_material_id),
  FOREIGN KEY (parent_bom_id) REFERENCES bom_masters(id) ON DELETE CASCADE,
  FOREIGN KEY (child_bom_id) REFERENCES bom_masters(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='BOM引用关系表';

-- 5. 更新现有bom_details数据，标记有子BOM的物料
-- 这个UPDATE需要在应用迁移后运行
UPDATE bom_details bd
SET has_sub_bom = 1
WHERE EXISTS (
  SELECT 1 FROM bom_masters bm 
  WHERE bm.product_id = bd.material_id 
  AND bm.approved_by IS NOT NULL
);

