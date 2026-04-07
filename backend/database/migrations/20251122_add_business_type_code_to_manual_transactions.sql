-- 为 manual_transactions 表添加 business_type_code 字段
-- 用于保存完整的业务类型编码（如 manual_in, purchase_inbound 等）

SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- 添加 business_type_code 字段
ALTER TABLE `manual_transactions`
ADD COLUMN `business_type_code` VARCHAR(50) NULL COMMENT '业务类型编码' AFTER `transaction_type`,
ADD INDEX `idx_business_type_code` (`business_type_code`);

-- 更新现有数据：将 transaction_type 转换为 business_type_code
UPDATE `manual_transactions`
SET `business_type_code` = CASE
  WHEN `transaction_type` = 'in' THEN 'manual_in'
  WHEN `transaction_type` = 'out' THEN 'manual_out'
  ELSE NULL
END
WHERE `business_type_code` IS NULL;

-- 添加注释
ALTER TABLE `manual_transactions`
MODIFY COLUMN `business_type_code` VARCHAR(50) NULL COMMENT '业务类型编码（如 manual_in, purchase_inbound 等）';

