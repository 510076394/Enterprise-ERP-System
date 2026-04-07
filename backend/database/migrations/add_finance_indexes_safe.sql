-- ==========================================
-- 财务管理模块数据库索引优化 (安全版本)
-- 创建日期: 2025-11-17
-- 说明: 使用存储过程安全创建索引,如果索引已存在则跳过
-- ==========================================

DELIMITER $$

-- 创建安全添加索引的存储过程
DROP PROCEDURE IF EXISTS add_index_if_not_exists$$
CREATE PROCEDURE add_index_if_not_exists(
    IN tableName VARCHAR(128),
    IN indexName VARCHAR(128),
    IN indexColumns VARCHAR(255)
)
BEGIN
    DECLARE index_exists INT DEFAULT 0;
    
    -- 检查索引是否存在
    SELECT COUNT(*) INTO index_exists
    FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = tableName
      AND INDEX_NAME = indexName;
    
    -- 如果索引不存在,则创建
    IF index_exists = 0 THEN
        SET @sql = CONCAT('CREATE INDEX ', indexName, ' ON ', tableName, '(', indexColumns, ')');
        PREPARE stmt FROM @sql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
        SELECT CONCAT('✓ 创建索引: ', indexName, ' ON ', tableName) AS result;
    ELSE
        SELECT CONCAT('- 索引已存在: ', indexName, ' ON ', tableName) AS result;
    END IF;
END$$

DELIMITER ;

-- ==========================================
-- 应收账款表索引
-- ==========================================

CALL add_index_if_not_exists('ar_invoices', 'idx_ar_invoices_invoice_date', 'invoice_date');
CALL add_index_if_not_exists('ar_invoices', 'idx_ar_invoices_due_date', 'due_date');
CALL add_index_if_not_exists('ar_invoices', 'idx_ar_invoices_status', 'status');
CALL add_index_if_not_exists('ar_invoices', 'idx_ar_invoices_customer_id', 'customer_id');
CALL add_index_if_not_exists('ar_invoices', 'idx_ar_invoices_balance', 'balance_amount');
CALL add_index_if_not_exists('ar_invoices', 'idx_ar_invoices_created_at', 'created_at');
CALL add_index_if_not_exists('ar_invoices', 'idx_ar_invoices_invoice_number', 'invoice_number');

CALL add_index_if_not_exists('ar_receipts', 'idx_ar_receipts_receipt_date', 'receipt_date');
CALL add_index_if_not_exists('ar_receipts', 'idx_ar_receipts_customer_id', 'customer_id');
CALL add_index_if_not_exists('ar_receipts', 'idx_ar_receipts_payment_method', 'payment_method');
CALL add_index_if_not_exists('ar_receipts', 'idx_ar_receipts_created_at', 'created_at');

-- ==========================================
-- 应付账款表索引
-- ==========================================

CALL add_index_if_not_exists('ap_invoices', 'idx_ap_invoices_invoice_date', 'invoice_date');
CALL add_index_if_not_exists('ap_invoices', 'idx_ap_invoices_due_date', 'due_date');
CALL add_index_if_not_exists('ap_invoices', 'idx_ap_invoices_status', 'status');
CALL add_index_if_not_exists('ap_invoices', 'idx_ap_invoices_supplier_id', 'supplier_id');
CALL add_index_if_not_exists('ap_invoices', 'idx_ap_invoices_balance', 'balance_amount');
CALL add_index_if_not_exists('ap_invoices', 'idx_ap_invoices_created_at', 'created_at');
CALL add_index_if_not_exists('ap_invoices', 'idx_ap_invoices_invoice_number', 'invoice_number');

CALL add_index_if_not_exists('ap_payments', 'idx_ap_payments_payment_date', 'payment_date');
CALL add_index_if_not_exists('ap_payments', 'idx_ap_payments_supplier_id', 'supplier_id');
CALL add_index_if_not_exists('ap_payments', 'idx_ap_payments_payment_method', 'payment_method');
CALL add_index_if_not_exists('ap_payments', 'idx_ap_payments_created_at', 'created_at');

-- ==========================================
-- 总账表索引
-- ==========================================

CALL add_index_if_not_exists('gl_entries', 'idx_gl_entries_entry_date', 'entry_date');
CALL add_index_if_not_exists('gl_entries', 'idx_gl_entries_posting_date', 'posting_date');
CALL add_index_if_not_exists('gl_entries', 'idx_gl_entries_period_id', 'period_id');
CALL add_index_if_not_exists('gl_entries', 'idx_gl_entries_is_posted', 'is_posted');
CALL add_index_if_not_exists('gl_entries', 'idx_gl_entries_document_type', 'document_type');
CALL add_index_if_not_exists('gl_entries', 'idx_gl_entries_entry_number', 'entry_number');

CALL add_index_if_not_exists('gl_entry_items', 'idx_gl_entry_items_entry_id', 'entry_id');
CALL add_index_if_not_exists('gl_entry_items', 'idx_gl_entry_items_account_id', 'account_id');

CALL add_index_if_not_exists('gl_accounts', 'idx_gl_accounts_account_code', 'account_code');
CALL add_index_if_not_exists('gl_accounts', 'idx_gl_accounts_account_type', 'account_type');
CALL add_index_if_not_exists('gl_accounts', 'idx_gl_accounts_parent_id', 'parent_id');
CALL add_index_if_not_exists('gl_accounts', 'idx_gl_accounts_is_active', 'is_active');

CALL add_index_if_not_exists('gl_periods', 'idx_gl_periods_start_date', 'start_date');
CALL add_index_if_not_exists('gl_periods', 'idx_gl_periods_end_date', 'end_date');
CALL add_index_if_not_exists('gl_periods', 'idx_gl_periods_is_closed', 'is_closed');

-- ==========================================
-- 现金管理表索引
-- ==========================================

CALL add_index_if_not_exists('bank_accounts', 'idx_bank_accounts_account_number', 'account_number');
CALL add_index_if_not_exists('bank_accounts', 'idx_bank_accounts_is_active', 'is_active');

CALL add_index_if_not_exists('bank_transactions', 'idx_bank_transactions_account_id', 'bank_account_id');
CALL add_index_if_not_exists('bank_transactions', 'idx_bank_transactions_transaction_date', 'transaction_date');
CALL add_index_if_not_exists('bank_transactions', 'idx_bank_transactions_transaction_type', 'transaction_type');
CALL add_index_if_not_exists('bank_transactions', 'idx_bank_transactions_is_reconciled', 'is_reconciled');
CALL add_index_if_not_exists('bank_transactions', 'idx_bank_transactions_created_at', 'created_at');

CALL add_index_if_not_exists('cash_transactions', 'idx_cash_transactions_transaction_date', 'transaction_date');
CALL add_index_if_not_exists('cash_transactions', 'idx_cash_transactions_transaction_type', 'transaction_type');
CALL add_index_if_not_exists('cash_transactions', 'idx_cash_transactions_category', 'category');
CALL add_index_if_not_exists('cash_transactions', 'idx_cash_transactions_created_at', 'created_at');

-- ==========================================
-- 固定资产表索引
-- ==========================================

CALL add_index_if_not_exists('fixed_assets', 'idx_fixed_assets_asset_code', 'asset_code');
CALL add_index_if_not_exists('fixed_assets', 'idx_fixed_assets_category_id', 'category_id');
CALL add_index_if_not_exists('fixed_assets', 'idx_fixed_assets_status', 'status');
CALL add_index_if_not_exists('fixed_assets', 'idx_fixed_assets_purchase_date', 'purchase_date');
CALL add_index_if_not_exists('fixed_assets', 'idx_fixed_assets_department_id', 'department_id');

CALL add_index_if_not_exists('asset_depreciation', 'idx_asset_depreciation_asset_id', 'asset_id');
CALL add_index_if_not_exists('asset_depreciation', 'idx_asset_depreciation_period_id', 'period_id');
CALL add_index_if_not_exists('asset_depreciation', 'idx_asset_depreciation_depreciation_date', 'depreciation_date');
CALL add_index_if_not_exists('asset_depreciation', 'idx_asset_depreciation_is_posted', 'is_posted');

-- ==========================================
-- 复合索引 (针对常见查询组合)
-- ==========================================

CALL add_index_if_not_exists('ar_invoices', 'idx_ar_invoices_customer_status_date', 'customer_id, status, invoice_date');
CALL add_index_if_not_exists('ap_invoices', 'idx_ap_invoices_supplier_status_date', 'supplier_id, status, invoice_date');
CALL add_index_if_not_exists('gl_entries', 'idx_gl_entries_period_posted', 'period_id, is_posted');
CALL add_index_if_not_exists('bank_transactions', 'idx_bank_transactions_account_date_reconciled', 'bank_account_id, transaction_date, is_reconciled');

-- ==========================================
-- 清理存储过程
-- ==========================================

DROP PROCEDURE IF EXISTS add_index_if_not_exists;

-- ==========================================
-- 完成
-- ==========================================

SELECT '✓ 财务管理模块索引优化完成!' AS message;

