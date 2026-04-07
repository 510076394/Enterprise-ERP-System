-- Bank transaction audit fields migration
-- Add audit related fields to bank_transactions table

ALTER TABLE bank_transactions
ADD COLUMN audit_status VARCHAR(20) DEFAULT 'draft' COMMENT 'Audit status: draft, pending, reviewed, approved, rejected';

ALTER TABLE bank_transactions
ADD COLUMN auditor_id INT NULL COMMENT 'Auditor user ID';

ALTER TABLE bank_transactions
ADD COLUMN audit_time DATETIME NULL COMMENT 'Audit time';

ALTER TABLE bank_transactions
ADD COLUMN audit_remark TEXT NULL COMMENT 'Audit remark';

ALTER TABLE bank_transactions
ADD COLUMN submitted_by INT NULL COMMENT 'Submitted by user ID';

ALTER TABLE bank_transactions
ADD COLUMN submitted_at DATETIME NULL COMMENT 'Submitted time';

-- Add index
CREATE INDEX idx_bank_transactions_audit_status ON bank_transactions(audit_status);

-- Add reconcile confirm fields
ALTER TABLE bank_transactions
ADD COLUMN reconcile_confirmed_by INT NULL COMMENT 'Reconcile confirmed by user ID';

ALTER TABLE bank_transactions
ADD COLUMN reconcile_confirmed_at DATETIME NULL COMMENT 'Reconcile confirmed time';
