-- 补充生产状态 (production_status) 丢失的字典数据
-- 这些字段在前面的迁移（如 migrate_constants.js 或 20251122_insert_business_types.sql）可能由于别名覆盖或异常中止而丢失
-- 为了防止 group_code + code 唯一索引冲突，且部分状态如 'allocated' 和 'wip' 可能已存在，统一使用 INSERT IGNORE

INSERT IGNORE INTO `business_types` (`group_code`, `code`, `name`, `category`, `tag_type`, `sort_order`, `is_system`, `status`) VALUES
('production_status', 'pending', '未开始', NULL, 'info', 1, 1, 1),
('production_status', 'allocated', '分配中', NULL, 'info', 2, 1, 1),
('production_status', 'material_issuing', '发料中', NULL, 'warning', 3, 1, 1),
('production_status', 'preparing', '配料中', NULL, 'warning', 4, 1, 1),
('production_status', 'material_issued', '已发料', NULL, 'primary', 5, 1, 1),
('production_status', 'material_partial_issued', '部分发料', NULL, 'primary', 6, 1, 1),
('production_status', 'in_progress', '生产中', NULL, 'success', 7, 1, 1),
('production_status', 'wip', '生产中', NULL, 'success', 8, 1, 1),
('production_status', 'processing', '生产中', NULL, 'success', 9, 1, 1),
('production_status', 'inspection', '待检验', NULL, 'warning', 10, 1, 1),
('production_status', 'warehousing', '入库中', NULL, 'primary', 11, 1, 1),
('production_status', 'completed', '已完成', NULL, 'success', 12, 1, 1),
('production_status', 'cancelled', '已取消', NULL, 'danger', 13, 1, 1);

-- 可选：更新老系统或残留的 wip 状态标签颜色同步到规范（success）
UPDATE `business_types` SET `tag_type` = 'success' WHERE `group_code` = 'production_status' AND `code` = 'wip';
