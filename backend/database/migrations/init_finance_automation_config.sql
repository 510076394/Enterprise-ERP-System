-- 初始化财务自动化配置
-- 将会计科目配置插入到 system_settings 表

-- 插入或更新会计科目配置
INSERT INTO system_settings (`key`, `value`, description)
VALUES (
  'accounting.account_codes',
  '{
    "CASH": "1001",
    "BANK_DEPOSIT": "1002",
    "OTHER_MONETARY_ASSETS": "1003",
    "ACCOUNTS_RECEIVABLE": "1122",
    "PREPAYMENTS": "1123",
    "MATERIAL_PURCHASE": "1401",
    "RAW_MATERIALS": "1403",
    "INVENTORY_GOODS": "1405",
    "FINISHED_GOODS": "1406",
    "FIXED_ASSETS": "1601",
    "ACCUMULATED_DEPRECIATION": "1602",
    "ACCOUNTS_PAYABLE": "2202",
    "ADVANCE_RECEIPTS": "2131",
    "EMPLOYEE_PAYABLE": "2201",
    "TAX_PAYABLE": "2211",
    "PAID_IN_CAPITAL": "3001",
    "CAPITAL_RESERVE": "3002",
    "SURPLUS_RESERVE": "3101",
    "CURRENT_YEAR_PROFIT": "3103",
    "RETAINED_EARNINGS": "3104",
    "PRODUCTION_COST": "4001",
    "MANUFACTURING_EXPENSE": "4101",
    "SALES_REVENUE": "5001",
    "OTHER_REVENUE": "5051",
    "SALES_COST": "6001",
    "COST_OF_GOODS_SOLD": "6001",
    "OTHER_COST": "6051",
    "SALES_EXPENSE": "6101",
    "ADMIN_EXPENSE": "6201",
    "FINANCE_EXPENSE": "6301",
    "DEPRECIATION_EXPENSE": "6602",
    "INVENTORY": "1405",
    "PURCHASE_COST": "1401"
  }',
  '会计科目编码映射配置'
)
ON DUPLICATE KEY UPDATE
  `value` = VALUES(`value`),
  updated_at = CURRENT_TIMESTAMP;

-- 验证配置
SELECT 
  `key`,
  JSON_PRETTY(`value`) as config_value,
  description,
  created_at
FROM system_settings 
WHERE `key` = 'accounting.account_codes';

-- 显示成功消息
SELECT '✅ 财务自动化配置初始化成功！' as message;

