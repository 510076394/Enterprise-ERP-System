-- 允许销售订单明细表的material_id为NULL
-- 并添加product_code和product_specs字段用于保存产品信息
-- 这样可以先导入订单，后续再补充物料编码
-- 2025-10-28

-- 修改material_id字段为可空
ALTER TABLE sales_order_items
MODIFY COLUMN material_id INT NULL COMMENT '物料ID';

-- 添加product_code字段用于保存产品编码
ALTER TABLE sales_order_items
ADD COLUMN product_code VARCHAR(100) COMMENT '产品编码' AFTER remark;

-- 添加product_specs字段用于保存产品规格
ALTER TABLE sales_order_items
ADD COLUMN product_specs VARCHAR(200) COMMENT '产品规格' AFTER product_code;

