-- ============================================
-- Add button level permissions
-- Date: 2025-12-17
-- ============================================

SET NAMES utf8mb4;

-- 1. Sales Orders Permissions
SET @sales_orders_menu_id = (SELECT id FROM menus WHERE permission = 'sales:orders' LIMIT 1);

INSERT INTO menus (parent_id, name, path, permission, type, sort_order, status, created_at, updated_at) VALUES
(@sales_orders_menu_id, 'View Order', '', 'sales:orders:view', 2, 1, 1, NOW(), NOW()),
(@sales_orders_menu_id, 'Create Order', '', 'sales:orders:create', 2, 2, 1, NOW(), NOW()),
(@sales_orders_menu_id, 'Update Order', '', 'sales:orders:update', 2, 3, 1, NOW(), NOW()),
(@sales_orders_menu_id, 'Confirm Order', '', 'sales:orders:confirm', 2, 4, 1, NOW(), NOW()),
(@sales_orders_menu_id, 'Lock Order', '', 'sales:orders:lock', 2, 5, 1, NOW(), NOW()),
(@sales_orders_menu_id, 'Unlock Order', '', 'sales:orders:unlock', 2, 6, 1, NOW(), NOW()),
(@sales_orders_menu_id, 'Cancel Order', '', 'sales:orders:cancel', 2, 7, 1, NOW(), NOW())
ON DUPLICATE KEY UPDATE updated_at = NOW();

-- 2. Production Tasks Permissions
SET @production_tasks_menu_id = (SELECT id FROM menus WHERE permission = 'production:tasks' LIMIT 1);

INSERT INTO menus (parent_id, name, path, permission, type, sort_order, status, created_at, updated_at) VALUES
(@production_tasks_menu_id, 'View Task', '', 'production:tasks:view', 2, 1, 1, NOW(), NOW()),
(@production_tasks_menu_id, 'Create Task', '', 'production:tasks:create', 2, 2, 1, NOW(), NOW()),
(@production_tasks_menu_id, 'Update Task', '', 'production:tasks:update', 2, 3, 1, NOW(), NOW()),
(@production_tasks_menu_id, 'Delete Task', '', 'production:tasks:delete', 2, 4, 1, NOW(), NOW()),
(@production_tasks_menu_id, 'Issue Material', '', 'production:tasks:issue', 2, 5, 1, NOW(), NOW())
ON DUPLICATE KEY UPDATE updated_at = NOW();

-- 3. AP Payments Permissions
SET @ap_payments_menu_id = (SELECT id FROM menus WHERE permission = 'finance:ap:payments' LIMIT 1);

INSERT INTO menus (parent_id, name, path, permission, type, sort_order, status, created_at, updated_at) VALUES
(@ap_payments_menu_id, 'Update Payment', '', 'finance:ap:payments:update', 2, 1, 1, NOW(), NOW()),
(@ap_payments_menu_id, 'Delete Payment', '', 'finance:ap:payments:delete', 2, 2, 1, NOW(), NOW()),
(@ap_payments_menu_id, 'Print Payment', '', 'finance:ap:payments:print', 2, 3, 1, NOW(), NOW())
ON DUPLICATE KEY UPDATE updated_at = NOW();

-- 4. Inventory Check Permissions
SET @inventory_check_menu_id = (SELECT id FROM menus WHERE permission = 'inventory:check' LIMIT 1);

INSERT INTO menus (parent_id, name, path, permission, type, sort_order, status, created_at, updated_at) VALUES
(@inventory_check_menu_id, 'View Check', '', 'inventory:check:view', 2, 1, 1, NOW(), NOW()),
(@inventory_check_menu_id, 'Create Check', '', 'inventory:check:create', 2, 2, 1, NOW(), NOW()),
(@inventory_check_menu_id, 'Update Check', '', 'inventory:check:update', 2, 3, 1, NOW(), NOW()),
(@inventory_check_menu_id, 'Delete Check', '', 'inventory:check:delete', 2, 4, 1, NOW(), NOW()),
(@inventory_check_menu_id, 'Adjust Inventory', '', 'inventory:check:adjust', 2, 5, 1, NOW(), NOW())
ON DUPLICATE KEY UPDATE updated_at = NOW();

-- 5. Purchase Orders Permissions
SET @purchase_orders_menu_id = (SELECT id FROM menus WHERE permission = 'purchase:orders' LIMIT 1);

INSERT INTO menus (parent_id, name, path, permission, type, sort_order, status, created_at, updated_at) VALUES
(@purchase_orders_menu_id, 'View Order', '', 'purchase:orders:view', 2, 1, 1, NOW(), NOW()),
(@purchase_orders_menu_id, 'Update Order', '', 'purchase:orders:update', 2, 2, 1, NOW(), NOW()),
(@purchase_orders_menu_id, 'Delete Order', '', 'purchase:orders:delete', 2, 3, 1, NOW(), NOW())
ON DUPLICATE KEY UPDATE updated_at = NOW();

-- Verify results
SELECT 'Sales Orders' AS module, COUNT(*) AS count FROM menus WHERE permission LIKE 'sales:orders:%';
SELECT 'Production Tasks' AS module, COUNT(*) AS count FROM menus WHERE permission LIKE 'production:tasks:%';
SELECT 'AP Payments' AS module, COUNT(*) AS count FROM menus WHERE permission LIKE 'finance:ap:payments:%';
SELECT 'Inventory Check' AS module, COUNT(*) AS count FROM menus WHERE permission LIKE 'inventory:check:%';
SELECT 'Purchase Orders' AS module, COUNT(*) AS count FROM menus WHERE permission LIKE 'purchase:orders:%';

-- Assign all new permissions to admin role
SET @admin_role_id = (SELECT id FROM roles WHERE code = 'admin' LIMIT 1);

INSERT IGNORE INTO role_menus (role_id, menu_id)
SELECT @admin_role_id, id
FROM menus
WHERE permission IN (
  'sales:orders:view', 'sales:orders:create', 'sales:orders:update', 'sales:orders:confirm',
  'sales:orders:lock', 'sales:orders:unlock', 'sales:orders:cancel',
  'production:tasks:view', 'production:tasks:create', 'production:tasks:update',
  'production:tasks:delete', 'production:tasks:issue',
  'finance:ap:payments:update', 'finance:ap:payments:delete', 'finance:ap:payments:print',
  'inventory:check:view', 'inventory:check:create', 'inventory:check:update',
  'inventory:check:delete', 'inventory:check:adjust',
  'purchase:orders:view', 'purchase:orders:update', 'purchase:orders:delete'
);

SELECT 'Admin permissions assigned' AS status, COUNT(*) AS assigned_count
FROM role_menus
WHERE role_id = @admin_role_id;

SELECT 'Button permissions added successfully!' AS message;

