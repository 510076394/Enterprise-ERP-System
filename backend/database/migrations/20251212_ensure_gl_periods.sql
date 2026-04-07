-- 确保会计期间表存在并初始化数据
-- 创建日期: 2025-12-12

-- 检查并创建会计期间表
CREATE TABLE IF NOT EXISTS `gl_periods` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `period_code` VARCHAR(20) NOT NULL COMMENT '期间编码 (如: 2025-01)',
  `period_name` VARCHAR(50) NOT NULL COMMENT '期间名称',
  `start_date` DATE NOT NULL COMMENT '开始日期',
  `end_date` DATE NOT NULL COMMENT '结束日期',
  `fiscal_year` INT NOT NULL COMMENT '会计年度',
  `period_number` INT NOT NULL COMMENT '期间序号 (1-12)',
  `is_closed` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否已关闭',
  `closed_by` VARCHAR(50) NULL COMMENT '关闭人',
  `closed_at` TIMESTAMP NULL COMMENT '关闭时间',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_period_code` (`period_code`),
  KEY `idx_start_date` (`start_date`),
  KEY `idx_end_date` (`end_date`),
  KEY `idx_fiscal_year` (`fiscal_year`),
  KEY `idx_is_closed` (`is_closed`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='会计期间表';

-- 初始化2025年会计期间数据（如果不存在）
INSERT IGNORE INTO `gl_periods` (`period_code`, `period_name`, `start_date`, `end_date`, `fiscal_year`, `period_number`, `is_closed`)
VALUES
  ('2025-01', '2025年1月', '2025-01-01', '2025-01-31', 2025, 1, 0),
  ('2025-02', '2025年2月', '2025-02-01', '2025-02-28', 2025, 2, 0),
  ('2025-03', '2025年3月', '2025-03-01', '2025-03-31', 2025, 3, 0),
  ('2025-04', '2025年4月', '2025-04-01', '2025-04-30', 2025, 4, 0),
  ('2025-05', '2025年5月', '2025-05-01', '2025-05-31', 2025, 5, 0),
  ('2025-06', '2025年6月', '2025-06-01', '2025-06-30', 2025, 6, 0),
  ('2025-07', '2025年7月', '2025-07-01', '2025-07-31', 2025, 7, 0),
  ('2025-08', '2025年8月', '2025-08-01', '2025-08-31', 2025, 8, 0),
  ('2025-09', '2025年9月', '2025-09-01', '2025-09-30', 2025, 9, 0),
  ('2025-10', '2025年10月', '2025-10-01', '2025-10-31', 2025, 10, 0),
  ('2025-11', '2025年11月', '2025-11-01', '2025-11-30', 2025, 11, 0),
  ('2025-12', '2025年12月', '2025-12-01', '2025-12-31', 2025, 12, 0);

-- 初始化2026年会计期间数据（如果不存在）
INSERT IGNORE INTO `gl_periods` (`period_code`, `period_name`, `start_date`, `end_date`, `fiscal_year`, `period_number`, `is_closed`)
VALUES
  ('2026-01', '2026年1月', '2026-01-01', '2026-01-31', 2026, 1, 0),
  ('2026-02', '2026年2月', '2026-02-01', '2026-02-28', 2026, 2, 0),
  ('2026-03', '2026年3月', '2026-03-01', '2026-03-31', 2026, 3, 0),
  ('2026-04', '2026年4月', '2026-04-01', '2026-04-30', 2026, 4, 0),
  ('2026-05', '2026年5月', '2026-05-01', '2026-05-31', 2026, 5, 0),
  ('2026-06', '2026年6月', '2026-06-01', '2026-06-30', 2026, 6, 0),
  ('2026-07', '2026年7月', '2026-07-01', '2026-07-31', 2026, 7, 0),
  ('2026-08', '2026年8月', '2026-08-01', '2026-08-31', 2026, 8, 0),
  ('2026-09', '2026年9月', '2026-09-01', '2026-09-30', 2026, 9, 0),
  ('2026-10', '2026年10月', '2026-10-01', '2026-10-31', 2026, 10, 0),
  ('2026-11', '2026年11月', '2026-11-01', '2026-11-30', 2026, 11, 0),
  ('2026-12', '2026年12月', '2026-12-01', '2026-12-31', 2026, 12, 0);

