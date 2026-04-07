/**
 * 种子文件 - 默认管理员、角色、菜单
 * @description 初始化系统必需的基础数据
 */

exports.seed = async function(knex) {
  // ===== 1. 角色 =====
  const [existingRoles] = await knex.raw('SELECT COUNT(*) as count FROM roles');
  if (existingRoles[0].count === 0) {
    await knex.raw(`
      INSERT INTO roles (id, name, description, created_at) VALUES
      (1, '超级管理员', '系统超级管理员，拥有全部权限', NOW()),
      (2, '管理员', '系统管理员', NOW()),
      (3, '普通用户', '普通用户角色', NOW()),
      (4, '财务主管', '财务模块管理角色', NOW()),
      (5, '仓库管理员', '仓库和库存管理角色', NOW()),
      (6, '采购员', '采购模块角色', NOW()),
      (7, '销售员', '销售模块角色', NOW()),
      (8, '生产主管', '生产管理角色', NOW()),
      (9, '质检员', '质量检验角色', NOW())
    `);
    console.log('[Seed] 角色数据已初始化');
  }

  // ===== 2. 管理员用户 =====
  const [existingAdmin] = await knex.raw("SELECT COUNT(*) as count FROM users WHERE username = 'admin'");
  if (existingAdmin[0].count === 0) {
    // 密码为 123456 的 bcrypt 哈希
    const bcryptHash = '$2b$10$CXz1l.5niKWLFe.P.REJJuJbHd6POemphJn0RSXqx0OuFLpqh3s92';
    await knex.raw(`
      INSERT INTO users (username, password, real_name, email, role_id, status, created_at)
      VALUES ('admin', ?, '系统管理员', 'admin@erp.local', 1, 1, NOW())
    `, [bcryptHash]);
    console.log('[Seed] 管理员账号已创建 (admin / 123456)');
  }

  // ===== 3. 菜单结构 =====
  const [existingMenus] = await knex.raw('SELECT COUNT(*) as count FROM menus');
  if (existingMenus[0].count === 0) {
    await knex.raw(`
      INSERT INTO menus (id, name, path, icon, parent_id, sort_order, status, created_at) VALUES
      (1,  '仪表盘',     '/dashboard',             'Dashboard',       NULL, 1,  1, NOW()),
      (2,  '采购管理',    '/purchase',               'ShoppingCart',    NULL, 10, 1, NOW()),
      (3,  '销售管理',    '/sales',                  'TrendCharts',     NULL, 20, 1, NOW()),
      (4,  '库存管理',    '/inventory',              'Box',             NULL, 30, 1, NOW()),
      (5,  '生产管理',    '/production',             'SetUp',           NULL, 40, 1, NOW()),
      (6,  '财务管理',    '/finance',                'Money',           NULL, 50, 1, NOW()),
      (7,  '质量管理',    '/quality',                'CircleCheck',     NULL, 60, 1, NOW()),
      (8,  '系统管理',    '/system',                 'Setting',         NULL, 90, 1, NOW()),
      -- 二级菜单：采购
      (21, '采购订单',    '/purchase/orders',         NULL, 2, 1, 1, NOW()),
      (22, '采购入库',    '/purchase/receipts',       NULL, 2, 2, 1, NOW()),
      (23, '采购退货',    '/purchase/returns',        NULL, 2, 3, 1, NOW()),
      (24, '供应商管理',  '/purchase/suppliers',      NULL, 2, 4, 1, NOW()),
      -- 二级菜单：销售
      (31, '销售订单',    '/sales/orders',            NULL, 3, 1, 1, NOW()),
      (32, '销售出库',    '/sales/outbound',          NULL, 3, 2, 1, NOW()),
      (33, '销售退货',    '/sales/returns',           NULL, 3, 3, 1, NOW()),
      (34, '客户管理',    '/sales/customers',         NULL, 3, 4, 1, NOW()),
      -- 二级菜单：库存
      (41, '库存查询',    '/inventory/stock',         NULL, 4, 1, 1, NOW()),
      (42, '出库管理',    '/inventory/outbound',      NULL, 4, 2, 1, NOW()),
      -- 二级菜单：生产
      (51, '生产计划',    '/production/plan',         NULL, 5, 1, 1, NOW()),
      (52, '生产任务',    '/production/tasks',        NULL, 5, 2, 1, NOW()),
      (53, 'BOM管理',     '/production/bom',          NULL, 5, 3, 1, NOW()),
      -- 二级菜单：财务
      (61, '总账管理',    '/finance/gl',              NULL, 6, 1, 1, NOW()),
      (62, '应收管理',    '/finance/ar',              NULL, 6, 2, 1, NOW()),
      (63, '应付管理',    '/finance/ap',              NULL, 6, 3, 1, NOW()),
      -- 二级菜单：质量
      (71, '来料检验',    '/quality/iqc',             NULL, 7, 1, 1, NOW()),
      (72, '不合格品',    '/quality/nonconforming',   NULL, 7, 2, 1, NOW()),
      -- 二级菜单：系统
      (81, '用户管理',    '/system/users',            NULL, 8, 1, 1, NOW()),
      (82, '角色管理',    '/system/roles',            NULL, 8, 2, 1, NOW()),
      (83, '菜单管理',    '/system/menus',            NULL, 8, 3, 1, NOW()),
      (84, '操作日志',    '/system/logs',             NULL, 8, 4, 1, NOW())
    `);
    console.log('[Seed] 菜单数据已初始化');
  }

  // ===== 4. 默认成本配置 =====
  const [existingCostSettings] = await knex.raw('SELECT COUNT(*) as count FROM cost_settings WHERE is_active = true');
  if (existingCostSettings[0].count === 0) {
    await knex.raw(`
      INSERT INTO cost_settings (setting_name, overhead_rate, labor_rate, costing_method, is_active, description)
      VALUES ('默认成本配置', 0.5, 50.00, 'weighted_average', true, '系统默认成本核算配置')
    `);
    console.log('[Seed] 默认成本配置已创建');
  }
};
