-- =====================================================
-- 添加税务管理和预算管理菜单
-- 创建时间: 2025-12-31
-- 说明: 为财务模块添加税务管理和预算管理的菜单项
-- =====================================================

-- 查找财务管理的父菜单ID
SET @finance_parent_id = (SELECT id FROM menus WHERE path = '/finance' AND parent_id IS NULL LIMIT 1);

-- 如果财务管理父菜单不存在，则创建
INSERT IGNORE INTO menus (parent_id, name, path, component, icon, permission, type, visible, status, sort_order, created_at, updated_at)
VALUES (NULL, '财务管理', '/finance', 'Layout', 'icon-money', 'finance', 0, 1, 1, 7, NOW(), NOW());

-- 重新获取财务管理的父菜单ID
SET @finance_parent_id = (SELECT id FROM menus WHERE path = '/finance' AND parent_id IS NULL LIMIT 1);

-- =====================================================
-- 1. 税务管理菜单
-- =====================================================

-- 1.1 税务管理父菜单（目录）
INSERT IGNORE INTO menus (parent_id, name, path, component, icon, permission, type, visible, status, sort_order, created_at, updated_at)
VALUES (@finance_parent_id, '税务管理', '/finance/tax', '', 'icon-document', 'finance:tax', 0, 1, 1, 17, NOW(), NOW());

-- 获取税务管理父菜单ID
SET @tax_parent_id = (SELECT id FROM menus WHERE path = '/finance/tax' AND parent_id = @finance_parent_id LIMIT 1);

-- 1.2 税务发票菜单
INSERT IGNORE INTO menus (parent_id, name, path, component, icon, permission, type, visible, status, sort_order, created_at, updated_at)
VALUES (@tax_parent_id, '税务发票', '/finance/tax/invoices', 'finance/tax/TaxInvoices', 'icon-tickets', 'finance:tax:invoices', 1, 1, 1, 1, NOW(), NOW());

-- 1.3 税务申报菜单
INSERT IGNORE INTO menus (parent_id, name, path, component, icon, permission, type, visible, status, sort_order, created_at, updated_at)
VALUES (@tax_parent_id, '税务申报', '/finance/tax/returns', 'finance/tax/TaxReturns', 'icon-document', 'finance:tax:returns', 1, 1, 1, 2, NOW(), NOW());

-- 1.4 税务科目配置菜单
INSERT IGNORE INTO menus (parent_id, name, path, component, icon, permission, type, visible, status, sort_order, created_at, updated_at)
VALUES (@tax_parent_id, '税务科目配置', '/finance/tax/config', 'finance/tax/TaxAccountConfig', 'icon-setting', 'finance:tax:config', 1, 1, 1, 3, NOW(), NOW());

-- =====================================================
-- 2. 预算管理菜单
-- =====================================================

-- 2.1 预算管理父菜单（目录）
INSERT IGNORE INTO menus (parent_id, name, path, component, icon, permission, type, visible, status, sort_order, created_at, updated_at)
VALUES (@finance_parent_id, '预算管理', '/finance/budget', '', 'icon-data-analysis', 'finance:budget', 0, 1, 1, 18, NOW(), NOW());

-- 获取预算管理父菜单ID
SET @budget_parent_id = (SELECT id FROM menus WHERE path = '/finance/budget' AND parent_id = @finance_parent_id LIMIT 1);

-- 2.2 预算列表菜单
INSERT IGNORE INTO menus (parent_id, name, path, component, icon, permission, type, visible, status, sort_order, created_at, updated_at)
VALUES (@budget_parent_id, '预算列表', '/finance/budget/list', 'finance/budget/BudgetList', 'icon-document', 'finance:budget:list', 1, 1, 1, 1, NOW(), NOW());

-- 2.3 新增预算菜单
INSERT IGNORE INTO menus (parent_id, name, path, component, icon, permission, type, visible, status, sort_order, created_at, updated_at)
VALUES (@budget_parent_id, '新增预算', '/finance/budget/edit', 'finance/budget/BudgetEdit', 'icon-edit', 'finance:budget:edit', 1, 1, 1, 2, NOW(), NOW());

-- 2.4 预算详情菜单（隐藏，不在导航中显示）
INSERT IGNORE INTO menus (parent_id, name, path, component, icon, permission, type, visible, status, sort_order, created_at, updated_at)
VALUES (@budget_parent_id, '预算详情', '/finance/budget/detail/:id', 'finance/budget/BudgetDetail', 'icon-document', 'finance:budget:detail', 1, 0, 1, 3, NOW(), NOW());

-- 2.5 预算执行分析菜单（隐藏，不在导航中显示）
INSERT IGNORE INTO menus (parent_id, name, path, component, icon, permission, type, visible, status, sort_order, created_at, updated_at)
VALUES (@budget_parent_id, '预算执行分析', '/finance/budget/analysis/:id', 'finance/budget/BudgetAnalysis', 'icon-data-analysis', 'finance:budget:analysis', 1, 0, 1, 4, NOW(), NOW());

-- =====================================================
-- 3. 为管理员角色分配新菜单权限
-- =====================================================

-- 获取管理员角色ID
SET @admin_role_id = (SELECT id FROM roles WHERE code = 'admin' LIMIT 1);

-- 为管理员角色分配税务管理权限
INSERT IGNORE INTO role_menus (role_id, menu_id)
SELECT @admin_role_id, id
FROM menus
WHERE permission IN (
  'finance:tax',
  'finance:tax:invoices',
  'finance:tax:returns',
  'finance:tax:config'
);

-- 为管理员角色分配预算管理权限
INSERT IGNORE INTO role_menus (role_id, menu_id)
SELECT @admin_role_id, id
FROM menus
WHERE permission IN (
  'finance:budget',
  'finance:budget:list',
  'finance:budget:edit',
  'finance:budget:detail',
  'finance:budget:analysis'
);

-- =====================================================
-- 4. 验证结果
-- =====================================================

-- 查看新增的税务管理菜单
SELECT 
  m.id,
  m.parent_id,
  m.name,
  m.path,
  m.permission,
  m.type,
  m.visible,
  m.status,
  m.sort_order
FROM menus m
WHERE m.permission LIKE 'finance:tax%'
ORDER BY m.parent_id, m.sort_order;

-- 查看新增的预算管理菜单
SELECT 
  m.id,
  m.parent_id,
  m.name,
  m.path,
  m.permission,
  m.type,
  m.visible,
  m.status,
  m.sort_order
FROM menus m
WHERE m.permission LIKE 'finance:budget%'
ORDER BY m.parent_id, m.sort_order;

-- 查看管理员角色的新权限
SELECT 
  r.name AS role_name,
  m.name AS menu_name,
  m.path,
  m.permission
FROM role_menus rm
JOIN roles r ON rm.role_id = r.id
JOIN menus m ON rm.menu_id = m.id
WHERE r.code = 'admin'
  AND (m.permission LIKE 'finance:tax%' OR m.permission LIKE 'finance:budget%')
ORDER BY m.permission;

-- 显示完成信息
SELECT '✅ 税务管理和预算管理菜单已成功添加！' AS message;
SELECT '✅ 管理员角色权限已更新！' AS message;
SELECT '⚠️ 请刷新前端页面（Ctrl+F5）以查看新菜单' AS message;

