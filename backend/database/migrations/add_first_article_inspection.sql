-- 首检模块数据库迁移脚本
-- 执行时间: 2025-12-04
-- 说明: 添加首检相关字段和首检规则配置表

-- ==================== 1. 修改 quality_inspections 表 ====================

-- 1.1 修改检验类型枚举，增加首检类型
ALTER TABLE quality_inspections
MODIFY COLUMN inspection_type ENUM('incoming','process','final','first_article') NOT NULL;

-- 1.2 添加首检相关字段（使用存储过程安全添加列）
DROP PROCEDURE IF EXISTS add_first_article_columns;
DELIMITER //
CREATE PROCEDURE add_first_article_columns()
BEGIN
    -- is_first_article
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'mes' AND table_name = 'quality_inspections' AND column_name = 'is_first_article') THEN
        ALTER TABLE quality_inspections ADD COLUMN is_first_article BOOLEAN DEFAULT FALSE COMMENT '是否首检';
    END IF;
    -- first_article_qty
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'mes' AND table_name = 'quality_inspections' AND column_name = 'first_article_qty') THEN
        ALTER TABLE quality_inspections ADD COLUMN first_article_qty INT DEFAULT 5 COMMENT '首检数量';
    END IF;
    -- is_full_inspection
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'mes' AND table_name = 'quality_inspections' AND column_name = 'is_full_inspection') THEN
        ALTER TABLE quality_inspections ADD COLUMN is_full_inspection BOOLEAN DEFAULT FALSE COMMENT '是否全检';
    END IF;
    -- first_article_result
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'mes' AND table_name = 'quality_inspections' AND column_name = 'first_article_result') THEN
        ALTER TABLE quality_inspections ADD COLUMN first_article_result ENUM('pending','passed','failed','conditional') DEFAULT 'pending' COMMENT '首检结果';
    END IF;
    -- production_can_continue
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'mes' AND table_name = 'quality_inspections' AND column_name = 'production_can_continue') THEN
        ALTER TABLE quality_inspections ADD COLUMN production_can_continue BOOLEAN DEFAULT FALSE COMMENT '是否允许继续生产';
    END IF;
    -- task_id
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'mes' AND table_name = 'quality_inspections' AND column_name = 'task_id') THEN
        ALTER TABLE quality_inspections ADD COLUMN task_id INT NULL COMMENT '关联生产任务ID';
    END IF;
END //
DELIMITER ;
CALL add_first_article_columns();
DROP PROCEDURE IF EXISTS add_first_article_columns;

-- ==================== 2. 创建首检规则配置表 ====================

CREATE TABLE IF NOT EXISTS first_article_rules (
    id INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT NOT NULL COMMENT '产品ID',
    first_article_qty INT DEFAULT 5 COMMENT '首检数量（默认5只）',
    full_inspection_threshold INT DEFAULT 5 COMMENT '全检阈值（生产数量小于此值则全检）',
    template_id INT NULL COMMENT '检验模板ID',
    is_mandatory BOOLEAN DEFAULT TRUE COMMENT '是否强制首检',
    inspection_items TEXT COMMENT '检验项目JSON配置',
    note VARCHAR(500) COMMENT '备注',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_first_article_rules_product (product_id),
    FOREIGN KEY (product_id) REFERENCES materials(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='首检规则配置表';

-- ==================== 3. 插入默认配置 ====================

-- 创建默认的首检检验模板（如果不存在）
INSERT INTO inspection_templates (name, type, description, is_default, created_at)
SELECT '默认首检模板', 'first_article', '生产首检默认检验模板', 1, NOW()
WHERE NOT EXISTS (SELECT 1 FROM inspection_templates WHERE type = 'first_article' AND is_default = 1);

-- ==================== 4. 说明 ====================
-- 
-- 首检逻辑：
-- 1. 生产任务开始时，检查产品是否配置了首检规则
-- 2. 如果配置了首检规则或全局默认启用首检，则创建首检单
-- 3. 首检数量计算：
--    - 生产数量 >= full_inspection_threshold: 抽检 first_article_qty 只
--    - 生产数量 < full_inspection_threshold: 全检（检验全部生产数量）
-- 4. 首检通过后，生产任务才能继续进行
-- 5. 首检不通过，需要调整工艺参数后重新首检
--

