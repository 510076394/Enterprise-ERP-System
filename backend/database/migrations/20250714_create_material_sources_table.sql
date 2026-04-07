-- 创建物料来源表
CREATE TABLE IF NOT EXISTS material_sources (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL COMMENT '来源名称',
    code VARCHAR(50) NOT NULL UNIQUE COMMENT '来源编码',
    type ENUM('internal', 'external') NOT NULL DEFAULT 'external' COMMENT '来源类型：internal-内部，external-外部',
    sort INT NOT NULL DEFAULT 0 COMMENT '排序',
    status TINYINT NOT NULL DEFAULT 1 COMMENT '状态：0-禁用，1-启用',
    description TEXT COMMENT '描述',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_type (type),
    INDEX idx_status (status),
    INDEX idx_sort (sort)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='物料来源表';

-- 插入初始数据
INSERT INTO material_sources (name, code, type, sort, status, description) VALUES
('自产', 'INTERNAL_01', 'internal', 1, 1, '公司内部生产'),
('外购', 'EXTERNAL_01', 'external', 2, 1, '外部采购'),
('委外加工', 'EXTERNAL_02', 'external', 3, 1, '委托外部加工'),
('代理采购', 'EXTERNAL_03', 'external', 4, 1, '代理商采购'),
('直接进口', 'EXTERNAL_04', 'external', 5, 1, '直接从国外进口'),
('库存调拨', 'INTERNAL_02', 'internal', 6, 1, '内部库存调拨'),
('返修品', 'INTERNAL_03', 'internal', 7, 0, '返修后的产品'),
('样品', 'EXTERNAL_05', 'external', 8, 1, '供应商提供样品');
