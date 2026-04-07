-- 创建成品销售追溯表
-- 记录成品销售给客户的完整追溯信息

CREATE TABLE IF NOT EXISTS `product_sales_traceability` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `outbound_id` int(11) NOT NULL COMMENT '销售出库单ID',
  `outbound_no` varchar(50) NOT NULL COMMENT '销售出库单号',
  `order_id` int(11) DEFAULT NULL COMMENT '销售订单ID',
  `customer_id` int(11) NOT NULL COMMENT '客户ID',
  `customer_name` varchar(100) NOT NULL COMMENT '客户名称',
  `product_id` int(11) NOT NULL COMMENT '产品ID',
  `product_code` varchar(50) NOT NULL COMMENT '产品编码',
  `product_name` varchar(100) NOT NULL COMMENT '产品名称',
  `product_batch_id` int(11) NOT NULL COMMENT '成品批次ID',
  `product_batch_number` varchar(50) NOT NULL COMMENT '成品批次号',
  `allocated_quantity` decimal(15,4) NOT NULL COMMENT '分配数量',
  `delivery_date` date NOT NULL COMMENT '交付日期',
  `operator` varchar(50) DEFAULT NULL COMMENT '操作员',
  `remarks` text COMMENT '备注',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_outbound_id` (`outbound_id`),
  KEY `idx_outbound_no` (`outbound_no`),
  KEY `idx_customer_id` (`customer_id`),
  KEY `idx_product_id` (`product_id`),
  KEY `idx_product_batch_id` (`product_batch_id`),
  KEY `idx_delivery_date` (`delivery_date`),
  KEY `idx_product_code_batch` (`product_code`, `product_batch_number`),
  CONSTRAINT `fk_pst_product_batch` FOREIGN KEY (`product_batch_id`) REFERENCES `batch_inventory` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='成品销售追溯表';

-- 创建索引以优化查询性能
CREATE INDEX `idx_customer_product` ON `product_sales_traceability` (`customer_id`, `product_code`);
CREATE INDEX `idx_batch_delivery` ON `product_sales_traceability` (`product_batch_number`, `delivery_date`);
