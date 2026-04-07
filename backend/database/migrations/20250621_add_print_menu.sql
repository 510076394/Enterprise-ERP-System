-- 添加打印设置菜单
INSERT INTO `menus` (`parent_id`, `name`, `path`, `component`, `permission`, `type`, `icon`, `sort_order`, `status`, `created_at`, `updated_at`)
SELECT 
  (SELECT id FROM `menus` WHERE `name` = '系统管理' AND `type` = 0 LIMIT 1),
  '打印设置',
  'print',
  'system/Print',
  'system:print',
  1,  -- 1表示菜单
  'Printer',
  50,
  1,
  NOW(),
  NOW();

-- 获取打印设置菜单ID
SET @print_menu_id = LAST_INSERT_ID();

-- 添加打印设置按钮权限
INSERT INTO `menus` (`parent_id`, `name`, `path`, `component`, `permission`, `type`, `icon`, `sort_order`, `status`, `created_at`, `updated_at`)
VALUES 
(@print_menu_id, '查看打印设置', '', '', 'system:print:view', 2, '', 1, 1, NOW(), NOW()),  -- 2表示按钮
(@print_menu_id, '添加打印设置', '', '', 'system:print:add', 2, '', 2, 1, NOW(), NOW()),
(@print_menu_id, '编辑打印设置', '', '', 'system:print:edit', 2, '', 3, 1, NOW(), NOW()),
(@print_menu_id, '删除打印设置', '', '', 'system:print:delete', 2, '', 4, 1, NOW(), NOW()),
(@print_menu_id, '查看打印模板', '', '', 'system:print:template:view', 2, '', 5, 1, NOW(), NOW()),
(@print_menu_id, '添加打印模板', '', '', 'system:print:template:add', 2, '', 6, 1, NOW(), NOW()),
(@print_menu_id, '编辑打印模板', '', '', 'system:print:template:edit', 2, '', 7, 1, NOW(), NOW()),
(@print_menu_id, '删除打印模板', '', '', 'system:print:template:delete', 2, '', 8, 1, NOW(), NOW()); 