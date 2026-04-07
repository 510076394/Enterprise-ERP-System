-- 添加生产计划缺料统计菜单
-- 创建时间: 2025-10-15
-- 描述: 在生产管理模块下添加缺料统计菜单项

-- 插入缺料统计菜单项
INSERT INTO menus (id, parent_id, name, path, component, permission, type, icon, sort_order, status, created_at, updated_at)
VALUES (47, 4, '缺料统计', '/production/material-shortage', 'production/MaterialShortage', 'production:plans:view', 1, 'icon-warning', 5, 1, NOW(), NOW())
ON DUPLICATE KEY UPDATE
  parent_id = 4,
  name = '缺料统计',
  path = '/production/material-shortage',
  component = 'production/MaterialShortage',
  permission = 'production:plans:view',
  type = 1,
  icon = 'icon-warning',
  sort_order = 5,
  status = 1,
  updated_at = NOW();

-- 更新其他菜单的排序（将设备监控和生产数据查看的顺序后移）
UPDATE menus SET sort_order = 6 WHERE id = 45 AND parent_id = 4;  -- 设备监控
UPDATE menus SET sort_order = 7 WHERE id = 46 AND parent_id = 4;  -- 生产数据查看

-- 为admin角色分配该菜单权限
INSERT IGNORE INTO role_menus (role_id, menu_id)
SELECT r.id, 47
FROM roles r
WHERE r.code = 'admin';

-- 验证插入结果
SELECT id, parent_id, name, path, permission, sort_order, status
FROM menus
WHERE parent_id = 4
ORDER BY sort_order;

