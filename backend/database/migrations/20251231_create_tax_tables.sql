-- =====================================================
-- 税务管理模块数据库表
-- 创建日期: 2025-12-31
-- 说明: 包括税务发票、税务申报、税务科目等表
-- =====================================================

-- 1. 税务发票表 (tax_invoices)
CREATE TABLE IF NOT EXISTS tax_invoices (
  id INT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
  invoice_type ENUM('进项', '销项') NOT NULL COMMENT '发票类型：进项/销项',
  invoice_number VARCHAR(50) NOT NULL UNIQUE COMMENT '发票号码',
  invoice_code VARCHAR(20) COMMENT '发票代码',
  invoice_date DATE NOT NULL COMMENT '开票日期',
  
  -- 关联信息
  supplier_id INT COMMENT '供应商ID（进项发票）',
  customer_id INT COMMENT '客户ID（销项发票）',
  supplier_or_customer_name VARCHAR(100) COMMENT '供应商/客户名称',
  supplier_tax_number VARCHAR(50) COMMENT '供应商/客户税号',
  
  -- 金额信息
  amount_excluding_tax DECIMAL(15,2) NOT NULL COMMENT '不含税金额',
  tax_rate DECIMAL(5,2) NOT NULL COMMENT '税率（%）',
  tax_amount DECIMAL(15,2) NOT NULL COMMENT '税额',
  total_amount DECIMAL(15,2) NOT NULL COMMENT '价税合计',
  
  -- 状态信息
  status ENUM('未认证', '已认证', '已抵扣', '已作废') DEFAULT '未认证' COMMENT '发票状态',
  certification_date DATE COMMENT '认证日期',
  deduction_date DATE COMMENT '抵扣日期',
  
  -- 关联单据
  related_document_type VARCHAR(50) COMMENT '关联单据类型（采购入库单、销售出库单等）',
  related_document_id INT COMMENT '关联单据ID',
  gl_entry_id INT COMMENT '关联会计分录ID',
  
  -- 备注
  remark TEXT COMMENT '备注',
  
  -- 审计字段
  created_by INT COMMENT '创建人ID',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  
  -- 索引
  INDEX idx_invoice_number (invoice_number),
  INDEX idx_invoice_date (invoice_date),
  INDEX idx_invoice_type (invoice_type),
  INDEX idx_status (status),
  INDEX idx_supplier_id (supplier_id),
  INDEX idx_customer_id (customer_id),
  INDEX idx_created_by (created_by),
  
  -- 外键
  FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL,
  FOREIGN KEY (gl_entry_id) REFERENCES gl_entries(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='税务发票表';

-- 2. 税务申报表 (tax_returns)
CREATE TABLE IF NOT EXISTS tax_returns (
  id INT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
  return_period VARCHAR(20) NOT NULL COMMENT '申报期间（如：2025-12）',
  return_type ENUM('增值税', '企业所得税', '个人所得税') NOT NULL COMMENT '申报类型',
  
  -- 增值税申报数据
  sales_amount DECIMAL(15,2) DEFAULT 0 COMMENT '销售额',
  sales_output_tax DECIMAL(15,2) DEFAULT 0 COMMENT '销项税额',
  purchase_amount DECIMAL(15,2) DEFAULT 0 COMMENT '进项金额',
  purchase_input_tax DECIMAL(15,2) DEFAULT 0 COMMENT '进项税额',
  input_tax_deduction DECIMAL(15,2) DEFAULT 0 COMMENT '进项税额转出',
  tax_payable DECIMAL(15,2) DEFAULT 0 COMMENT '应纳税额',
  tax_paid DECIMAL(15,2) DEFAULT 0 COMMENT '已缴税额',
  tax_balance DECIMAL(15,2) DEFAULT 0 COMMENT '应补（退）税额',
  
  -- 企业所得税申报数据
  total_revenue DECIMAL(15,2) DEFAULT 0 COMMENT '营业收入',
  total_cost DECIMAL(15,2) DEFAULT 0 COMMENT '营业成本',
  total_expense DECIMAL(15,2) DEFAULT 0 COMMENT '期间费用',
  taxable_income DECIMAL(15,2) DEFAULT 0 COMMENT '应纳税所得额',
  income_tax_rate DECIMAL(5,2) DEFAULT 25.00 COMMENT '企业所得税税率（%）',
  income_tax_payable DECIMAL(15,2) DEFAULT 0 COMMENT '应纳所得税额',
  
  -- 状态信息
  status ENUM('草稿', '已申报', '已缴纳', '已作废') DEFAULT '草稿' COMMENT '申报状态',
  declaration_date DATE COMMENT '申报日期',
  payment_date DATE COMMENT '缴纳日期',
  
  -- 关联会计分录
  gl_entry_id INT COMMENT '关联会计分录ID',
  
  -- 备注
  remark TEXT COMMENT '备注',
  
  -- 审计字段
  created_by INT COMMENT '创建人ID',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  
  -- 索引
  INDEX idx_return_period (return_period),
  INDEX idx_return_type (return_type),
  INDEX idx_status (status),
  INDEX idx_created_by (created_by),
  UNIQUE KEY uk_period_type (return_period, return_type),
  
  -- 外键
  FOREIGN KEY (gl_entry_id) REFERENCES gl_entries(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='税务申报表';

-- 3. 税务科目配置表 (tax_account_config)
CREATE TABLE IF NOT EXISTS tax_account_config (
  id INT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
  config_key VARCHAR(50) NOT NULL UNIQUE COMMENT '配置键',
  config_name VARCHAR(100) NOT NULL COMMENT '配置名称',
  account_id INT NOT NULL COMMENT '会计科目ID',
  description TEXT COMMENT '说明',
  is_active BOOLEAN DEFAULT true COMMENT '是否启用',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  
  -- 外键
  FOREIGN KEY (account_id) REFERENCES gl_accounts(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='税务科目配置表';

-- 注意：默认税务科目配置需要在会计科目创建后手动插入
-- 请根据实际的会计科目ID进行配置

