-- GL（总账）表结构初始化脚本
-- 创建时间：2026-01-26
-- 说明：财务集成和成本核算功能所需的GL表

-- 1. 会计分录主表
CREATE TABLE IF NOT EXISTS `gl_entries` (
  `id` INT unsigned NOT NULL AUTO_INCREMENT COMMENT '分录ID',
  `entry_number` VARCHAR(50) NOT NULL COMMENT '分录编号',
  `entry_date` DATE NOT NULL COMMENT '分录日期',
  `period_id` INT unsigned DEFAULT NULL COMMENT '会计期间ID',
  `document_type` VARCHAR(50) DEFAULT NULL COMMENT '单据类型（sales_order, purchase_receipt, production_completion等）',
  `document_id` INT DEFAULT NULL COMMENT '业务单据ID',
  `document_number` VARCHAR(100) DEFAULT NULL COMMENT '业务单据编号',
  `description` TEXT COMMENT '摘要说明',
  `total_debit` DECIMAL(15,2) NOT NULL DEFAULT 0.00 COMMENT '借方合计',
  `total_credit` DECIMAL(15,2) NOT NULL DEFAULT 0.00 COMMENT '贷方合计',
  `status` ENUM('draft', 'posted', 'cancelled') NOT NULL DEFAULT 'draft' COMMENT '状态：草稿、已过账、已作废',
  `created_by` VARCHAR(100) DEFAULT NULL COMMENT '创建人',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `posted_at` TIMESTAMP NULL DEFAULT NULL COMMENT '过账时间',
  `posted_by` VARCHAR(100) DEFAULT NULL COMMENT '过账人',
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_entry_number` (`entry_number`),
  KEY `idx_entry_date` (`entry_date`),
  KEY `idx_period_id` (`period_id`),
  KEY `idx_document` (`document_type`, `document_id`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='会计分录主表';

-- 2. 会计分录明细表
CREATE TABLE IF NOT EXISTS `gl_entry_items` (
  `id` INT unsigned NOT NULL AUTO_INCREMENT COMMENT '分录明细ID',
  `entry_id` INT unsigned NOT NULL COMMENT '分录主表ID',
  `line_number` INT NOT NULL DEFAULT 1 COMMENT '行号',
  `account_id` INT unsigned NOT NULL COMMENT '会计科目ID',
  `debit` DECIMAL(15,2) NOT NULL DEFAULT 0.00 COMMENT '借方金额',
  `credit` DECIMAL(15,2) NOT NULL DEFAULT 0.00 COMMENT '贷方金额',
  `description` VARCHAR(500) DEFAULT NULL COMMENT '摘要',
  `cost_center_id` INT DEFAULT NULL COMMENT '成本中心ID',
  `project_id` INT DEFAULT NULL COMMENT '项目ID',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_entry_id` (`entry_id`),
  KEY `idx_account_id` (`account_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='会计分录明细表';

-- 3. 会计科目表（如果不存在）
CREATE TABLE IF NOT EXISTS `gl_accounts` (
  `id` INT unsigned NOT NULL AUTO_INCREMENT COMMENT '科目ID',
  `account_code` VARCHAR(20) NOT NULL COMMENT '科目编码',
  `account_name` VARCHAR(100) NOT NULL COMMENT '科目名称',
  `account_type` ENUM('asset', 'liability', 'equity', 'revenue', 'expense', 'cost') NOT NULL COMMENT '科目类型',
  `parent_id` INT unsigned DEFAULT NULL COMMENT '父科目ID',
  `level` INT NOT NULL DEFAULT 1 COMMENT '科目级别',
  `is_leaf` TINYINT(1) NOT NULL DEFAULT 1 COMMENT '是否末级科目',
  `is_active` TINYINT(1) NOT NULL DEFAULT 1 COMMENT '是否启用',
  `balance_direction` ENUM('debit', 'credit') DEFAULT NULL COMMENT '余额方向',
  `description` TEXT COMMENT '科目说明',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_account_code` (`account_code`),
  KEY `idx_parent_id` (`parent_id`),
  KEY `idx_account_type` (`account_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='会计科目表';

-- 4. 会计期间表（如果不存在）
CREATE TABLE IF NOT EXISTS `accounting_periods` (
  `id` INT unsigned NOT NULL AUTO_INCREMENT COMMENT '期间ID',
  `period_code` VARCHAR(20) NOT NULL COMMENT '期间编码（如：2026-01）',
  `year` INT NOT NULL COMMENT '年份',
  `month` INT NOT NULL COMMENT '月份',
  `start_date` DATE NOT NULL COMMENT '期间开始日期',
  `end_date` DATE NOT NULL COMMENT '期间结束日期',
  `status` ENUM('open', 'closed') NOT NULL DEFAULT 'open' COMMENT '期间状态',
  `closed_at` TIMESTAMP NULL DEFAULT NULL COMMENT '关闭时间',
  `closed_by` VARCHAR(100) DEFAULT NULL COMMENT '关闭人',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_period_code` (`period_code`),
  KEY `idx_year_month` (`year`, `month`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='会计期间表';

-- 插入基础会计科目数据（如果表为空）
INSERT IGNORE INTO `gl_accounts` (`account_code`, `account_name`, `account_type`, `parent_id`, `level`, `balance_direction`) VALUES
('1001', '库存现金', 'asset', NULL, 1, 'debit'),
('1002', '银行存款', 'asset', NULL, 1, 'debit'),
('1003', '其他货币资金', 'asset', NULL, 1, 'debit'),
('1122', '应收账款', 'asset', NULL, 1, 'debit'),
('1123', '预付账款', 'asset', NULL, 1, 'debit'),
('1401', '材料采购', 'asset', NULL, 1, 'debit'),
('1403', '原材料', 'asset', NULL, 1, 'debit'),
('1405', '库存商品', 'asset', NULL, 1, 'debit'),
('1406', '产成品', 'asset', NULL, 1, 'debit'),
('1408', '委托加工物资', 'asset', NULL, 1, 'debit'),
('1601', '固定资产', 'asset', NULL, 1, 'debit'),
('1602', '累计折旧', 'asset', NULL, 1, 'credit'),
('2202', '应付账款', 'liability', NULL, 1, 'credit'),
('2131', '预收账款', 'liability', NULL, 1, 'credit'),
('2201', '应付职工薪酬', 'liability', NULL, 1, 'credit'),
('2221', '应交税费', 'liability', NULL, 1, 'credit'),
('3001', '实收资本', 'equity', NULL, 1, 'credit'),
('3002', '资本公积', 'equity', NULL, 1, 'credit'),
('3101', '盈余公积', 'equity', NULL, 1, 'credit'),
('3103', '本年利润', 'equity', NULL, 1, 'credit'),
('3104', '利润分配', 'equity', NULL, 1, 'credit'),
('4001', '生产成本', 'cost', NULL, 1, 'debit'),
('5101', '制造费用', 'cost', NULL, 1, 'debit'),
('5001', '主营业务收入', 'revenue', NULL, 1, 'credit'),
('5051', '其他业务收入', 'revenue', NULL, 1, 'credit'),
('6401', '主营业务成本', 'expense', NULL, 1, 'debit'),
('6051', '其他业务成本', 'expense', NULL, 1, 'debit'),
('6601', '销售费用', 'expense', NULL, 1, 'debit'),
('6201', '管理费用', 'expense', NULL, 1, 'debit'),
('6603', '财务费用', 'expense', NULL, 1, 'debit'),
('6602', '折旧费用', 'expense', NULL, 1, 'debit');
