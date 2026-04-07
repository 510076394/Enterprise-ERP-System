/**
 * 基线迁移 - 核心基础表
 * @description 系统基础架构表：用户、角色、菜单、部门、仓库、分类、单位、供应商、客户、物料
 * 
 * 注意：使用 knex.raw('CREATE TABLE IF NOT EXISTS ...') 确保对已有数据库无副作用
 */

exports.up = async function(knex) {
  // 仓库/库位表
  await knex.raw(`
    CREATE TABLE IF NOT EXISTS locations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      code VARCHAR(50) NOT NULL UNIQUE,
      name VARCHAR(100) NOT NULL,
      warehouse_name VARCHAR(100) NOT NULL,
      status TINYINT NOT NULL DEFAULT 1,
      remark TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX (code),
      INDEX (status)
    )
  `);

  // 用户表
  await knex.raw(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(50) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      real_name VARCHAR(100),
      name VARCHAR(100),
      email VARCHAR(100),
      phone VARCHAR(20),
      department_id INT,
      position VARCHAR(100),
      role VARCHAR(20) NOT NULL DEFAULT 'user',
      avatar LONGTEXT COMMENT '用户头像(Base64)',
      bio VARCHAR(255) COMMENT '个性签名',
      status TINYINT NOT NULL DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX (department_id),
      INDEX (status)
    )
  `);

  // 部门表
  await knex.raw(`
    CREATE TABLE IF NOT EXISTS departments (
      id INT AUTO_INCREMENT PRIMARY KEY,
      parent_id INT,
      name VARCHAR(100) NOT NULL,
      code VARCHAR(50) NOT NULL,
      manager VARCHAR(50),
      phone VARCHAR(20),
      sort_order INT DEFAULT 0,
      status TINYINT NOT NULL DEFAULT 1,
      remark TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX (parent_id),
      INDEX (status)
    )
  `);

  // 角色表
  await knex.raw(`
    CREATE TABLE IF NOT EXISTS roles (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(50) NOT NULL,
      code VARCHAR(50) NOT NULL,
      description VARCHAR(200),
      status TINYINT NOT NULL DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX (status)
    )
  `);

  // 用户角色关联表
  await knex.raw(`
    CREATE TABLE IF NOT EXISTS user_roles (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      role_id INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX (user_id),
      INDEX (role_id),
      UNIQUE KEY unique_user_role (user_id, role_id)
    )
  `);

  // 菜单表
  await knex.raw(`
    CREATE TABLE IF NOT EXISTS menus (
      id INT AUTO_INCREMENT PRIMARY KEY,
      parent_id INT,
      name VARCHAR(50) NOT NULL,
      path VARCHAR(100),
      component VARCHAR(100),
      redirect VARCHAR(100),
      icon VARCHAR(50),
      permission VARCHAR(100),
      type TINYINT NOT NULL DEFAULT 0 COMMENT '0-目录 1-菜单 2-按钮',
      visible TINYINT NOT NULL DEFAULT 1,
      status TINYINT NOT NULL DEFAULT 1,
      sort_order INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX (parent_id),
      INDEX (status)
    )
  `);

  // 角色菜单关联表
  await knex.raw(`
    CREATE TABLE IF NOT EXISTS role_menus (
      id INT AUTO_INCREMENT PRIMARY KEY,
      role_id INT NOT NULL,
      menu_id INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX (role_id),
      INDEX (menu_id),
      UNIQUE KEY unique_role_menu (role_id, menu_id)
    )
  `);

  // 分类表
  await knex.raw(`
    CREATE TABLE IF NOT EXISTS categories (
      id INT AUTO_INCREMENT PRIMARY KEY,
      parent_id INT NULL,
      name VARCHAR(100) NOT NULL,
      code VARCHAR(50) NOT NULL,
      level INT NOT NULL DEFAULT 1,
      sort INT NOT NULL DEFAULT 0,
      status TINYINT NOT NULL DEFAULT 1,
      remark TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX (parent_id),
      INDEX (code),
      INDEX (status)
    )
  `);

  // 单位表
  await knex.raw(`
    CREATE TABLE IF NOT EXISTS units (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(50) NOT NULL,
      code VARCHAR(20) NOT NULL,
      status TINYINT NOT NULL DEFAULT 1,
      remark TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX (code),
      INDEX (status)
    )
  `);

  // 供应商表
  await knex.raw(`
    CREATE TABLE IF NOT EXISTS suppliers (
      id INT AUTO_INCREMENT PRIMARY KEY,
      code VARCHAR(50) NOT NULL UNIQUE,
      name VARCHAR(100) NOT NULL,
      contact_person VARCHAR(50),
      phone VARCHAR(20),
      email VARCHAR(100),
      address TEXT,
      status TINYINT NOT NULL DEFAULT 1,
      remark TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  // 客户表
  await knex.raw(`
    CREATE TABLE IF NOT EXISTS customers (
      id INT AUTO_INCREMENT PRIMARY KEY,
      code VARCHAR(50) NOT NULL UNIQUE COMMENT '客户编码',
      name VARCHAR(100) NOT NULL,
      contact_person VARCHAR(50),
      contact_phone VARCHAR(20),
      email VARCHAR(100),
      address TEXT,
      status TINYINT DEFAULT 1 COMMENT '状态：0-禁用 1-启用',
      remark TEXT COMMENT '备注',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  // 物料主数据表
  await knex.raw(`
    CREATE TABLE IF NOT EXISTS materials (
      id INT AUTO_INCREMENT PRIMARY KEY,
      code VARCHAR(50) NOT NULL UNIQUE COMMENT '物料编码',
      name VARCHAR(100) NOT NULL COMMENT '物料名称',
      category_id INT COMMENT '分类ID',
      unit_id INT COMMENT '主单位ID',
      specs VARCHAR(200) COMMENT '规格',
      model VARCHAR(100) COMMENT '型号',
      brand VARCHAR(100) COMMENT '品牌',
      min_stock DECIMAL(10,2) DEFAULT 0 COMMENT '最小库存',
      max_stock DECIMAL(10,2) DEFAULT 0 COMMENT '最大库存',
      safety_stock DECIMAL(10,2) DEFAULT 0 COMMENT '安全库存',
      status TINYINT NOT NULL DEFAULT 1 COMMENT '状态: 0-禁用 1-启用',
      remarks TEXT COMMENT '备注',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX (category_id),
      INDEX (status)
    )
  `);

  // 系统设置表
  await knex.raw(`
    CREATE TABLE IF NOT EXISTS system_settings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      \`key\` VARCHAR(100) NOT NULL UNIQUE COMMENT '设置键',
      \`value\` LONGTEXT COMMENT '设置值',
      description VARCHAR(500) COMMENT '描述',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_key (\`key\`)
    ) COMMENT='系统设置表'
  `);

  // 打印模板表
  await knex.raw(`
    CREATE TABLE IF NOT EXISTS print_templates (
      id INT NOT NULL AUTO_INCREMENT,
      name VARCHAR(100) NOT NULL COMMENT '模板名称',
      module VARCHAR(50) NOT NULL COMMENT '所属模块',
      template_type VARCHAR(50) NOT NULL COMMENT '模板类型',
      content TEXT NOT NULL COMMENT '模板内容',
      paper_size VARCHAR(20) NOT NULL DEFAULT 'A4' COMMENT '纸张大小',
      orientation VARCHAR(20) NOT NULL DEFAULT 'portrait' COMMENT '打印方向',
      margin_top INT NOT NULL DEFAULT 10 COMMENT '上边距(mm)',
      margin_right INT NOT NULL DEFAULT 10 COMMENT '右边距(mm)',
      margin_bottom INT NOT NULL DEFAULT 10 COMMENT '下边距(mm)',
      margin_left INT NOT NULL DEFAULT 10 COMMENT '左边距(mm)',
      is_default TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否默认模板',
      status TINYINT(1) NOT NULL DEFAULT 1 COMMENT '状态：1-启用，0-禁用',
      created_by INT COMMENT '创建人ID',
      updated_by INT COMMENT '更新人ID',
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
      PRIMARY KEY (id),
      INDEX idx_module_type (module, template_type)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='打印模板表'
  `);
};

exports.down = async function(knex) {
  // 基线迁移回滚：按依赖逆序删除
  const tables = [
    'print_templates', 'system_settings',
    'role_menus', 'menus', 'user_roles', 'roles',
    'materials', 'customers', 'suppliers',
    'units', 'categories', 'departments', 'users', 'locations'
  ];
  for (const table of tables) {
    await knex.raw(`DROP TABLE IF EXISTS \`${table}\``);
  }
};
