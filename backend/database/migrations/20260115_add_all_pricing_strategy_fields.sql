-- 批量添加定价策略字段
-- 创建日期: 2026-01-15
-- 说明: 添加完整的产品定价策略字段

-- 使用INSERT IGNORE避免重复插入
-- 插入完整的策略字段
INSERT IGNORE INTO `pricing_strategy_fields` 
  (`field_name`, `field_label`, `field_type`, `unit`, `sort_order`, `description`, `is_active`) 
VALUES
  -- 基础成本字段
  ('product_lifetime', '成品使用寿命', 'amount', '次', 10, '产品的预期使用次数', 1),
  ('material_amount', '材料金额', 'amount', '元', 20, '原材料总金额', 1),
  ('material_loss_rate', '材料损耗率', 'percentage', '%', 30, '生产过程中材料损耗的百分比', 1),
  ('labor_cost', '工资', 'amount', '元/件', 40, '单件产品的人工成本', 1),
  ('mold_amortization', '模具摊销费', 'amount', '元/件', 50, '模具成本分摊到每个产品', 1),
  ('fixed_cost', '固定费用', 'amount', '元', 60, '固定成本费用', 1),
  ('fixed_cost_rate', '固定费用比例', 'percentage', '%', 70, '固定费用占比', 1),
  ('mold_opening_cost', '开模费用', 'amount', '元', 80, '模具开发费用', 1),
  ('tax_rate', '税率', 'percentage', '%', 90, '适用税率', 1),
  ('tax_amount', '税额', 'amount', '元', 100, '应缴税额', 1),
  
  -- 定价相关字段
  ('cost_price', '成本价', 'amount', '元', 110, '产品总成本价格', 1),
  ('gross_profit', '毛利额', 'amount', '元', 120, '毛利润金额', 1),
  ('gross_profit_rate', '毛利率', 'percentage', '%', 130, '毛利润率', 1),
  ('planned_factory_price', '计划出厂价', 'amount', '元', 140, '计划的出厂价格', 1),
  ('final_selling_price', '决定售价', 'amount', '元', 150, '最终确定的销售价格', 1),
  ('final_selling_price_usd', '决定售价(USD)', 'amount', 'USD', 160, '最终售价(美元)', 1),
  ('exchange_rate', '汇率', 'amount', '', 170, '货币兑换汇率', 1),
  ('price_difference', '差价', 'amount', '元', 180, '价格差异', 1),
  ('price_difference_rate', '差价率', 'percentage', '%', 190, '价格差异比率', 1),
  
  -- 原始数据字段(用于对比)
  ('original_material_amount', '原材料金额', 'amount', '元', 200, '原始材料金额', 1),
  ('original_material_loss_rate', '原材料损耗率', 'percentage', '%', 210, '原始材料损耗率', 1),
  ('original_labor_cost', '原工资', 'amount', '元/件', 220, '原始人工成本', 1),
  ('original_mold_opening_cost', '原开模费用', 'amount', '元', 230, '原始开模费用', 1),
  ('original_mold_amortization', '原模具摊销费', 'amount', '元/件', 240, '原始模具摊销费', 1),
  ('original_fixed_cost_rate', '原固定费用比例', 'percentage', '%', 250, '原始固定费用比例', 1),
  ('original_fixed_cost', '原固定费用', 'amount', '元', 260, '原始固定费用', 1),
  ('original_tax_rate', '原税率', 'percentage', '%', 270, '原始税率', 1),
  ('original_tax_amount', '原税额', 'amount', '元', 280, '原始税额', 1),
  ('original_cost_price', '原成本价', 'amount', '元', 290, '原始成本价', 1),
  ('original_gross_profit', '原毛利额', 'amount', '元', 300, '原始毛利额', 1),
  ('original_gross_profit_rate', '原毛利率', 'percentage', '%', 310, '原始毛利率', 1),
  ('original_planned_factory_price', '原计划出厂价', 'amount', '元', 320, '原始计划出厂价', 1),
  ('original_final_selling_price', '原决定售价', 'amount', '元', 330, '原始决定售价', 1),
  ('original_final_selling_price_usd', '原决定售价(USD)', 'amount', 'USD', 340, '原始决定售价(美元)', 1),
  ('original_exchange_rate', '原汇率', 'amount', '', 350, '原始汇率', 1),
  ('original_product_lifetime', '原成品使用寿命', 'amount', '次', 360, '原始产品使用寿命', 1),
  
  -- 预警字段
  ('warning_price_difference', '预警差价', 'amount', '元', 370, '价格差异预警值', 1),
  ('warning_price_difference_rate', '预警差价率', 'percentage', '%', 380, '价格差异率预警值', 1);

-- 查看插入结果
SELECT COUNT(*) as '已添加字段数' FROM pricing_strategy_fields WHERE is_active = 1;
SELECT field_name, field_label, field_type, unit FROM pricing_strategy_fields ORDER BY sort_order;
