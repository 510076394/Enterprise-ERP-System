-- BOM物料价格调整功能数据库迁移脚本
-- 创建日期: 2026-01-15
-- 说明: 创建bom_material_price_adjustments表,用于记录BOM物料价格调整历史

-- 创建BOM物料价格调整记录表
CREATE TABLE IF NOT EXISTS `bom_material_price_adjustments` (
  `id` INT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
  `product_id` INT NOT NULL COMMENT '产品ID',
  `bom_id` INT NOT NULL COMMENT 'BOM ID',
  `material_id` INT NOT NULL COMMENT '物料ID',
  `original_price` DECIMAL(10,2) NOT NULL COMMENT '原始采购价格',
  `adjusted_price` DECIMAL(10,2) NOT NULL COMMENT '调整后价格',
  `adjustment_reason` VARCHAR(500) COMMENT '调整原因',
  `version` INT DEFAULT 1 COMMENT '调整版本号',
  `is_active` TINYINT(1) DEFAULT 1 COMMENT '是否当前生效: 1=生效, 0=历史',
  `created_by` INT COMMENT '创建人ID',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX `idx_product_material` (`product_id`, `material_id`),
  INDEX `idx_bom_material` (`bom_id`, `material_id`),
  INDEX `idx_is_active` (`is_active`),
  INDEX `idx_created_at` (`created_at`),
  CONSTRAINT `fk_adjustment_product` FOREIGN KEY (`product_id`) REFERENCES `materials`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_adjustment_bom` FOREIGN KEY (`bom_id`) REFERENCES `bom_masters`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_adjustment_material` FOREIGN KEY (`material_id`) REFERENCES `materials`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_adjustment_user` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='BOM物料价格调整记录表';

-- 查看表结构
DESCRIBE bom_material_price_adjustments;

-- 验证表创建
SELECT 
    TABLE_NAME,
    TABLE_COMMENT,
    TABLE_ROWS,
    CREATE_TIME
FROM information_schema.TABLES 
WHERE TABLE_SCHEMA = DATABASE() 
AND TABLE_NAME = 'bom_material_price_adjustments';
