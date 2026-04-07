-- 自定义定价策略字段功能 - 数据库迁移
-- 创建日期: 2026-01-15
-- 说明: 支持产品定价时使用自定义策略字段(如模具摊销费、材料损耗率等)

-- 1. 创建定价策略字段定义表
CREATE TABLE IF NOT EXISTS `pricing_strategy_fields` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `field_name` VARCHAR(50) NOT NULL UNIQUE COMMENT '字段名(英文,用于代码标识)',
  `field_label` VARCHAR(100) NOT NULL COMMENT '字段显示标签(中文)',
  `field_type` ENUM('percentage', 'amount') DEFAULT 'amount' COMMENT '字段类型: percentage=百分比, amount=金额',
  `unit` VARCHAR(20) COMMENT '单位(如:元、%、元/件)',
  `is_active` TINYINT(1) DEFAULT 1 COMMENT '是否启用: 1=启用, 0=禁用',
  `sort_order` INT DEFAULT 0 COMMENT '排序序号,越小越靠前',
  `description` VARCHAR(255) DEFAULT NULL COMMENT '字段描述',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_is_active` (`is_active`),
  INDEX `idx_sort_order` (`sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='定价策略字段定义表';

-- 2. 创建产品定价策略值表
CREATE TABLE IF NOT EXISTS `product_pricing_strategies` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `pricing_id` INT NOT NULL COMMENT '关联product_pricing表的定价记录ID',
  `field_id` INT NOT NULL COMMENT '关联pricing_strategy_fields表的字段ID',
  `field_value` DECIMAL(15,4) NOT NULL COMMENT '字段值',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`pricing_id`) REFERENCES `product_pricing`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`field_id`) REFERENCES `pricing_strategy_fields`(`id`) ON DELETE RESTRICT,
  UNIQUE KEY `uk_pricing_field` (`pricing_id`, `field_id`),
  INDEX `idx_pricing_id` (`pricing_id`),
  INDEX `idx_field_id` (`field_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='产品定价策略值表';

-- 3. 插入默认策略字段数据
INSERT INTO `pricing_strategy_fields` 
  (`field_name`, `field_label`, `field_type`, `unit`, `sort_order`, `description`) 
VALUES
  ('mold_amortization', '模具摊销费', 'amount', '元/件', 1, '模具成本分摊'),
  ('material_loss_rate', '材料损耗率', 'percentage', '%', 2, '生产材料损耗百分比'),
  ('price_difference', '差价', 'amount', '元', 3, '市场价与成本价差额'),
  ('labor_cost', '工资', 'amount', '元/件', 4, '单件人工成本'),
  ('original_factory_price', '原计划出厂价', 'amount', '元', 5, '最初计划出厂价');
