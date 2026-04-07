-- Create new batch views based on batch_inventory table

-- 1. Batch inventory summary view
CREATE OR REPLACE VIEW v_batch_inventory_summary AS
SELECT
  bi.material_id,
  bi.material_code,
  bi.material_name,
  bi.warehouse_id,
  bi.warehouse_name,
  COUNT(DISTINCT bi.batch_number) as batch_count,
  SUM(bi.current_quantity) as total_quantity,
  SUM(bi.available_quantity) as available_quantity,
  SUM(bi.reserved_quantity) as reserved_quantity,
  MIN(bi.receipt_date) as earliest_receipt_date,
  MAX(bi.receipt_date) as latest_receipt_date,
  MIN(bi.expiry_date) as earliest_expiry_date,
  bi.unit,
  AVG(bi.unit_cost) as avg_unit_cost,
  SUM(bi.total_cost) as total_cost
FROM batch_inventory bi
WHERE bi.status = 'active' AND bi.current_quantity > 0
GROUP BY bi.material_id, bi.material_code, bi.material_name, bi.warehouse_id, bi.warehouse_name, bi.unit;

-- 2. Batch traceability view
CREATE OR REPLACE VIEW v_batch_traceability AS
SELECT
  bt.id,
  bt.batch_inventory_id,
  bi.batch_number,
  bi.material_id,
  bi.material_code,
  bi.material_name,
  bt.transaction_type,
  bt.quantity,
  bt.before_quantity,
  bt.after_quantity,
  bt.from_warehouse_id,
  bt.to_warehouse_id,
  bt.reference_no,
  bt.reference_type,
  bt.operator,
  bt.remarks,
  bt.created_at,
  qi.inspection_no,
  qi.supplier_id,
  s.name AS supplier_name,
  qi.qualified_quantity,
  qi.status AS inspection_status
FROM batch_transactions bt
INNER JOIN batch_inventory bi ON bt.batch_inventory_id = bi.id
LEFT JOIN quality_inspections qi ON bi.batch_number = qi.batch_no
LEFT JOIN suppliers s ON qi.supplier_id = s.id
ORDER BY bt.created_at DESC;

