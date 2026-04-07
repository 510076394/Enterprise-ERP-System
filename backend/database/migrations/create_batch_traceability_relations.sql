-- 创建批次追溯关系表
-- 用于记录原材料批次到成品批次的追溯关系

CREATE TABLE IF NOT EXISTS `batch_traceability_relations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `source_batch_id` int(11) NOT NULL COMMENT '源批次ID（原材料批次）',
  `target_batch_id` int(11) NOT NULL COMMENT '目标批次ID（成品批次）',
  `relation_type` enum('material_to_product','product_to_material','product_to_product') NOT NULL DEFAULT 'material_to_product' COMMENT '关系类型',
  `source_quantity` decimal(15,4) NOT NULL DEFAULT '0.0000' COMMENT '源批次消耗数量',
  `target_quantity` decimal(15,4) NOT NULL DEFAULT '0.0000' COMMENT '目标批次产出数量',
  `conversion_ratio` decimal(10,6) DEFAULT NULL COMMENT '转换比例',
  `production_task_id` int(11) DEFAULT NULL COMMENT '生产任务ID',
  `production_task_code` varchar(50) DEFAULT NULL COMMENT '生产任务编号',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_by` varchar(50) DEFAULT NULL COMMENT '创建人',
  `remarks` text COMMENT '备注',
  PRIMARY KEY (`id`),
  KEY `idx_source_batch` (`source_batch_id`),
  KEY `idx_target_batch` (`target_batch_id`),
  KEY `idx_relation_type` (`relation_type`),
  KEY `idx_production_task` (`production_task_id`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `fk_btr_source_batch` FOREIGN KEY (`source_batch_id`) REFERENCES `batch_inventory` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_btr_target_batch` FOREIGN KEY (`target_batch_id`) REFERENCES `batch_inventory` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='批次追溯关系表';

-- 添加batch_inventory表的生产任务字段（如果不存在）
ALTER TABLE `batch_inventory` 
ADD COLUMN IF NOT EXISTS `production_task_id` int(11) DEFAULT NULL COMMENT '生产任务ID',
ADD COLUMN IF NOT EXISTS `production_task_code` varchar(50) DEFAULT NULL COMMENT '生产任务编号',
ADD COLUMN IF NOT EXISTS `production_date` date DEFAULT NULL COMMENT '生产日期';

-- 添加索引
ALTER TABLE `batch_inventory` 
ADD INDEX IF NOT EXISTS `idx_production_task` (`production_task_id`),
ADD INDEX IF NOT EXISTS `idx_production_date` (`production_date`);
