-- ==========================================
-- 财务管理模块数据库索引优化 (兼容版本)
-- 创建日期: 2025-11-17
-- 说明: 为常用查询字段添加索引,提升查询性能
-- 注意: 如果索引已存在会报错,属于正常情况,可以忽略
-- ==========================================

-- ==========================================
-- 应收账款表索引
-- ==========================================

-- ar_invoices 表索引
CREATE INDEX idx_ar_invoices_invoice_date ON ar_invoices(invoice_date);
CREATE INDEX idx_ar_invoices_due_date ON ar_invoices(due_date);
CREATE INDEX idx_ar_invoices_status ON ar_invoices(status);
CREATE INDEX idx_ar_invoices_customer_id ON ar_invoices(customer_id);
CREATE INDEX idx_ar_invoices_balance ON ar_invoices(balance_amount);
CREATE INDEX idx_ar_invoices_created_at ON ar_invoices(created_at);
CREATE INDEX idx_ar_invoices_invoice_number ON ar_invoices(invoice_number);

-- ar_receipts 表索引
CREATE INDEX idx_ar_receipts_receipt_date ON ar_receipts(receipt_date);
CREATE INDEX idx_ar_receipts_customer_id ON ar_receipts(customer_id);
CREATE INDEX idx_ar_receipts_payment_method ON ar_receipts(payment_method);
CREATE INDEX idx_ar_receipts_created_at ON ar_receipts(created_at);

-- ==========================================
-- 应付账款表索引
-- ==========================================

-- ap_invoices 表索引
CREATE INDEX idx_ap_invoices_invoice_date ON ap_invoices(invoice_date);
CREATE INDEX idx_ap_invoices_due_date ON ap_invoices(due_date);
CREATE INDEX idx_ap_invoices_status ON ap_invoices(status);
CREATE INDEX idx_ap_invoices_supplier_id ON ap_invoices(supplier_id);
CREATE INDEX idx_ap_invoices_balance ON ap_invoices(balance_amount);
CREATE INDEX idx_ap_invoices_created_at ON ap_invoices(created_at);
CREATE INDEX idx_ap_invoices_invoice_number ON ap_invoices(invoice_number);

-- ap_payments 表索引
CREATE INDEX idx_ap_payments_payment_date ON ap_payments(payment_date);
CREATE INDEX idx_ap_payments_supplier_id ON ap_payments(supplier_id);
CREATE INDEX idx_ap_payments_payment_method ON ap_payments(payment_method);
CREATE INDEX idx_ap_payments_created_at ON ap_payments(created_at);

-- ==========================================
-- 总账表索引
-- ==========================================

-- gl_entries 表索引
CREATE INDEX idx_gl_entries_entry_date ON gl_entries(entry_date);
CREATE INDEX idx_gl_entries_posting_date ON gl_entries(posting_date);
CREATE INDEX idx_gl_entries_period_id ON gl_entries(period_id);
CREATE INDEX idx_gl_entries_is_posted ON gl_entries(is_posted);
CREATE INDEX idx_gl_entries_document_type ON gl_entries(document_type);
CREATE INDEX idx_gl_entries_entry_number ON gl_entries(entry_number);

-- gl_entry_items 表索引
CREATE INDEX idx_gl_entry_items_entry_id ON gl_entry_items(entry_id);
CREATE INDEX idx_gl_entry_items_account_id ON gl_entry_items(account_id);

-- gl_accounts 表索引
CREATE INDEX idx_gl_accounts_account_code ON gl_accounts(account_code);
CREATE INDEX idx_gl_accounts_account_type ON gl_accounts(account_type);
CREATE INDEX idx_gl_accounts_parent_id ON gl_accounts(parent_id);
CREATE INDEX idx_gl_accounts_is_active ON gl_accounts(is_active);

-- gl_periods 表索引
CREATE INDEX idx_gl_periods_start_date ON gl_periods(start_date);
CREATE INDEX idx_gl_periods_end_date ON gl_periods(end_date);
CREATE INDEX idx_gl_periods_is_closed ON gl_periods(is_closed);

-- ==========================================
-- 现金管理表索引
-- ==========================================

-- bank_accounts 表索引
CREATE INDEX idx_bank_accounts_account_number ON bank_accounts(account_number);
CREATE INDEX idx_bank_accounts_is_active ON bank_accounts(is_active);

-- bank_transactions 表索引
CREATE INDEX idx_bank_transactions_account_id ON bank_transactions(bank_account_id);
CREATE INDEX idx_bank_transactions_transaction_date ON bank_transactions(transaction_date);
CREATE INDEX idx_bank_transactions_transaction_type ON bank_transactions(transaction_type);
CREATE INDEX idx_bank_transactions_is_reconciled ON bank_transactions(is_reconciled);
CREATE INDEX idx_bank_transactions_created_at ON bank_transactions(created_at);

-- cash_transactions 表索引
CREATE INDEX idx_cash_transactions_transaction_date ON cash_transactions(transaction_date);
CREATE INDEX idx_cash_transactions_transaction_type ON cash_transactions(transaction_type);
CREATE INDEX idx_cash_transactions_category ON cash_transactions(category);
CREATE INDEX idx_cash_transactions_created_at ON cash_transactions(created_at);

-- ==========================================
-- 固定资产表索引
-- ==========================================

-- fixed_assets 表索引
CREATE INDEX idx_fixed_assets_asset_code ON fixed_assets(asset_code);
CREATE INDEX idx_fixed_assets_category_id ON fixed_assets(category_id);
CREATE INDEX idx_fixed_assets_status ON fixed_assets(status);
CREATE INDEX idx_fixed_assets_acquisition_date ON fixed_assets(acquisition_date);
CREATE INDEX idx_fixed_assets_department_id ON fixed_assets(department_id);

-- asset_depreciation 表索引
CREATE INDEX idx_asset_depreciation_asset_id ON asset_depreciation(asset_id);
CREATE INDEX idx_asset_depreciation_period_id ON asset_depreciation(period_id);
CREATE INDEX idx_asset_depreciation_depreciation_date ON asset_depreciation(depreciation_date);
CREATE INDEX idx_asset_depreciation_is_posted ON asset_depreciation(is_posted);

-- ==========================================
-- 复合索引 (针对常见查询组合)
-- ==========================================

-- AR发票: 客户+状态+日期
CREATE INDEX idx_ar_invoices_customer_status_date ON ar_invoices(customer_id, status, invoice_date);

-- AP发票: 供应商+状态+日期
CREATE INDEX idx_ap_invoices_supplier_status_date ON ap_invoices(supplier_id, status, invoice_date);

-- 总账分录: 期间+过账状态
CREATE INDEX idx_gl_entries_period_posted ON gl_entries(period_id, is_posted);

-- 银行交易: 账户+日期+对账状态
CREATE INDEX idx_bank_transactions_account_date_reconciled ON bank_transactions(bank_account_id, transaction_date, is_reconciled);

-- ==========================================
-- 索引创建完成
-- ==========================================

SELECT '财务管理模块索引优化完成!' AS message;

