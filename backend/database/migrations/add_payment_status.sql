-- 为ap_payments表添加状态管理字段

-- 1. 添加状态字段
ALTER TABLE ap_payments 
ADD COLUMN status ENUM('normal', 'void') DEFAULT 'normal' COMMENT '状态: normal-正常, void-已作废' AFTER notes;

-- 2. 添加作废相关字段
ALTER TABLE ap_payments 
ADD COLUMN voided_at TIMESTAMP NULL COMMENT '作废时间' AFTER status,
ADD COLUMN voided_by INT NULL COMMENT '作废人ID' AFTER voided_at,
ADD COLUMN void_reason TEXT NULL COMMENT '作废原因' AFTER voided_by;

-- 3. 添加索引以优化查询
ALTER TABLE ap_payments 
ADD INDEX idx_status (status),
ADD INDEX idx_voided_at (voided_at);

-- 4. 添加外键约束（如果users表存在）
-- ALTER TABLE ap_payments 
-- ADD CONSTRAINT fk_payments_voided_by 
-- FOREIGN KEY (voided_by) REFERENCES users(id) ON DELETE SET NULL;
