-- 更新基础数据模块菜单路径从中文改为英文
-- 创建时间: 2025-10-23
-- 描述: 将基础数据菜单及其子菜单的路径从中文改为英文，保持导航显示中文

-- 更新基础数据主菜单路径
UPDATE menus 
SET path = '/basedata' 
WHERE path = '/基础数据';

-- 更新物料管理路径
UPDATE menus 
SET path = '/basedata/materials' 
WHERE path = '/基础数据/物料管理';

-- 更新BOM管理路径
UPDATE menus 
SET path = '/basedata/boms' 
WHERE path = '/基础数据/BOM管理';

-- 更新客户管理路径
UPDATE menus 
SET path = '/basedata/customers' 
WHERE path = '/基础数据/客户管理';

-- 更新供应商管理路径
UPDATE menus 
SET path = '/basedata/suppliers' 
WHERE path = '/基础数据/供应商管理';

-- 更新物料分类路径
UPDATE menus 
SET path = '/basedata/categories' 
WHERE path = '/基础数据/物料分类';

-- 更新计量单位路径
UPDATE menus 
SET path = '/basedata/units' 
WHERE path = '/基础数据/计量单位';

-- 更新库位管理路径
UPDATE menus 
SET path = '/basedata/locations' 
WHERE path = '/基础数据/库位管理';

-- 更新工序模板路径
UPDATE menus 
SET path = '/basedata/process-templates' 
WHERE path = '/基础数据/工序模板';

-- 更新产品分类路径
UPDATE menus 
SET path = '/basedata/product-categories' 
WHERE path = '/基础数据/产品分类';

-- 验证更新结果
SELECT id, parent_id, name, path, component, sort_order, status
FROM menus
WHERE path LIKE '/basedata%'
ORDER BY parent_id, sort_order;

