-- Add invoice relation fields to bank_transactions
-- Date: 2026-01-14

ALTER TABLE bank_transactions 
ADD COLUMN related_invoice_id INT DEFAULT NULL,
ADD COLUMN related_invoice_type ENUM('AR', 'AP') DEFAULT NULL;

ALTER TABLE bank_transactions 
ADD INDEX idx_related_invoice (related_invoice_type, related_invoice_id);
