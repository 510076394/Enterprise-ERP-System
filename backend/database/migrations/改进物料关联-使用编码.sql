-- ========================================
-- 改进物料关联 - 使用编码而不是ID
-- ========================================
-- 创建时间: 2025-12-16
-- 说明: 将销售订单、采购订单等表的物料关联从ID改为编码
-- 优点: 
--   1. 物料删除重建后，编码不变，关联不会断
--   2. 更符合业务逻辑
--   3. 数据更稳定
-- ========================================

-- ========================================
-- 1. 修改 sales_order_items 表
-- ========================================

-- 1.1 确保 product_code 字段存在且有数据
-- 如果 product_code 为空，从 materials 表填充
UPDATE sales_order_items soi
JOIN materials m ON soi.material_id = m.id
SET soi.product_code = m.code
WHERE soi.product_code IS NULL OR soi.product_code = '';

-- 1.2 确保 product_specs 字段存在且有数据
-- 如果 product_specs 为空，从 materials 表填充
UPDATE sales_order_items soi
JOIN materials m ON soi.material_id = m.id
SET soi.product_specs = m.specs
WHERE soi.product_specs IS NULL OR soi.product_specs = '';

-- 1.3 修改字段约束
-- 将 material_id 改为可空（允许物料被删除）
ALTER TABLE sales_order_items 
MODIFY COLUMN material_id INT NULL COMMENT '物料ID（可为空，优先使用product_code关联）';

-- 将 product_code 改为必填
ALTER TABLE sales_order_items 
MODIFY COLUMN product_code VARCHAR(100) NOT NULL COMMENT '产品编码（业务主键）';

-- 添加索引以提高查询性能
ALTER TABLE sales_order_items 
ADD INDEX idx_product_code (product_code);

-- ========================================
-- 2. 修改 purchase_order_items 表
-- ========================================

-- 2.1 确保 material_code 字段存在且有数据
UPDATE purchase_order_items poi
JOIN materials m ON poi.material_id = m.id
SET poi.material_code = m.code
WHERE poi.material_code IS NULL OR poi.material_code = '';

-- 2.2 修改字段约束
ALTER TABLE purchase_order_items 
MODIFY COLUMN material_id INT NULL COMMENT '物料ID（可为空，优先使用material_code关联）';

ALTER TABLE purchase_order_items 
MODIFY COLUMN material_code VARCHAR(50) NOT NULL COMMENT '物料编码（业务主键）';

-- 添加索引
ALTER TABLE purchase_order_items 
ADD INDEX idx_material_code (material_code);

-- ========================================
-- 3. 创建视图 - 方便查询
-- ========================================

-- 3.1 销售订单明细视图（自动关联物料信息）
CREATE OR REPLACE VIEW v_sales_order_items AS
SELECT 
    soi.id,
    soi.order_id,
    soi.material_id,
    soi.product_code,
    soi.product_specs,
    soi.quantity,
    soi.unit_price,
    soi.amount,
    soi.remark,
    -- 从 materials 表关联的信息（使用 product_code）
    m.id as current_material_id,
    m.name as material_name,
    m.specs as current_specs,
    m.price as current_price,
    u.name as unit_name,
    c.name as category_name,
    -- 标记物料是否存在
    CASE WHEN m.id IS NULL THEN 0 ELSE 1 END as material_exists
FROM sales_order_items soi
LEFT JOIN materials m ON soi.product_code = m.code
LEFT JOIN units u ON m.unit_id = u.id
LEFT JOIN categories c ON m.category_id = c.id;

-- 3.2 采购订单明细视图
CREATE OR REPLACE VIEW v_purchase_order_items AS
SELECT 
    poi.id,
    poi.order_id,
    poi.material_id,
    poi.material_code,
    poi.material_name,
    poi.specification,
    poi.quantity,
    poi.price,
    poi.total,
    poi.unit,
    -- 从 materials 表关联的信息（使用 material_code）
    m.id as current_material_id,
    m.name as current_material_name,
    m.specs as current_specs,
    m.price as current_price,
    u.name as current_unit_name,
    -- 标记物料是否存在
    CASE WHEN m.id IS NULL THEN 0 ELSE 1 END as material_exists
FROM purchase_order_items poi
LEFT JOIN materials m ON poi.material_code = m.code
LEFT JOIN units u ON m.unit_id = u.id;

-- ========================================
-- 4. 验证数据
-- ========================================

-- 4.1 检查 sales_order_items 中是否有 product_code 为空的记录
SELECT COUNT(*) as empty_product_code_count
FROM sales_order_items
WHERE product_code IS NULL OR product_code = '';

-- 4.2 检查 purchase_order_items 中是否有 material_code 为空的记录
SELECT COUNT(*) as empty_material_code_count
FROM purchase_order_items
WHERE material_code IS NULL OR material_code = '';

-- 4.3 检查有多少订单明细的物料已被删除
SELECT 
    COUNT(*) as items_with_deleted_materials,
    SUM(soi.amount) as total_amount
FROM sales_order_items soi
LEFT JOIN materials m ON soi.product_code = m.code
WHERE m.id IS NULL;

