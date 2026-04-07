-- 插入业务类型数据
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

INSERT INTO `business_types` (`code`, `name`, `category`, `description`, `icon`, `color`, `sort_order`, `is_system`, `status`) VALUES
('in', '入库', 'in', '通用入库', 'icon-download', '#67C23A', 1, 1, 1),
('purchase_inbound', '采购入库', 'in', '采购订单入库', 'icon-shopping-cart', '#409EFF', 2, 1, 1),
('production_inbound', '生产入库', 'in', '生产完工入库', 'icon-data-line', '#E6A23C', 3, 1, 1),
('outsourced_inbound', '委外入库', 'in', '委外加工入库', 'icon-truck', '#909399', 4, 1, 1),
('sales_return', '销售退货', 'in', '销售退货入库', 'icon-refresh-left', '#F56C6C', 5, 1, 1),
('manual_in', '手工入库', 'in', '手工调整入库', 'icon-edit', '#67C23A', 6, 1, 1),
('out', '出库', 'out', '通用出库', 'icon-upload', '#E6A23C', 11, 1, 1),
('sales_outbound', '销售出库', 'out', '销售订单出库', 'icon-sell', '#409EFF', 12, 1, 1),
('production_outbound', '生产出库', 'out', '生产领料出库', 'icon-data-line', '#E6A23C', 13, 1, 1),
('outsourced_outbound', '委外出库', 'out', '委外发料出库', 'icon-truck', '#909399', 14, 1, 1),
('purchase_return', '采购退货', 'out', '采购退货出库', 'icon-refresh-right', '#F56C6C', 15, 1, 1),
('manual_out', '手工出库', 'out', '手工调整出库', 'icon-edit', '#E6A23C', 16, 1, 1),
('transfer', '调拨', 'transfer', '仓库间调拨', 'icon-sort', '#409EFF', 21, 1, 1),
('transfer_in', '调拨入库', 'transfer', '调拨入库', 'icon-bottom', '#67C23A', 22, 1, 1),
('transfer_out', '调拨出库', 'transfer', '调拨出库', 'icon-top', '#E6A23C', 23, 1, 1),
('adjust', '调整', 'adjust', '库存调整', 'icon-setting', '#909399', 31, 1, 1),
('check', '盘点', 'adjust', '库存盘点', 'icon-document-checked', '#409EFF', 32, 1, 1),
('adjustment_in', '调整入库', 'adjust', '盘盈入库', 'icon-circle-plus', '#67C23A', 33, 1, 1),
('adjustment_out', '调整出库', 'adjust', '盘亏出库', 'icon-circle-close', '#F56C6C', 34, 1, 1),
('initial_import', '初始导入', 'adjust', '期初库存导入', 'icon-upload-filled', '#909399', 35, 1, 1),
('correction', '纠正', 'adjust', '错误纠正', 'icon-warning', '#E6A23C', 36, 1, 1),
('other', '其他', 'adjust', '其他调整', 'icon-more', '#909399', 37, 1, 1);

