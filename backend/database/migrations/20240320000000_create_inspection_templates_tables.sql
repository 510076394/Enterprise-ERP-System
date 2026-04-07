-- 检验模板表
CREATE TABLE inspection_templates (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    template_code VARCHAR(50) NOT NULL COMMENT '模板编号',
    template_name VARCHAR(100) NOT NULL COMMENT '模板名称',
    inspection_type ENUM('incoming', 'process', 'final') NOT NULL COMMENT '检验类型：来料/过程/成品',
    material_type VARCHAR(100) COMMENT '适用物料类型',
    version VARCHAR(20) NOT NULL COMMENT '版本号',
    description TEXT COMMENT '模板描述',
    status ENUM('active', 'inactive', 'draft') NOT NULL DEFAULT 'draft' COMMENT '状态：启用/停用/草稿',
    created_by BIGINT NOT NULL COMMENT '创建人ID',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_template_code (template_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='检验模板表';

-- 检验项目表
CREATE TABLE inspection_items (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    item_name VARCHAR(100) NOT NULL COMMENT '检验项目名称',
    standard TEXT NOT NULL COMMENT '检验标准',
    type ENUM('visual', 'dimension', 'function', 'performance', 'safety', 'other') NOT NULL COMMENT '检验类型',
    is_critical BOOLEAN NOT NULL DEFAULT FALSE COMMENT '是否关键项',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='检验项目表';

-- 模板-项目关联表
CREATE TABLE template_item_mappings (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    template_id BIGINT NOT NULL COMMENT '模板ID',
    item_id BIGINT NOT NULL COMMENT '项目ID',
    sort_order INT NOT NULL DEFAULT 0 COMMENT '排序顺序',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (template_id) REFERENCES inspection_templates(id) ON DELETE CASCADE,
    FOREIGN KEY (item_id) REFERENCES inspection_items(id) ON DELETE CASCADE,
    UNIQUE KEY uk_template_item (template_id, item_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='模板-项目关联表';

-- 物料-模板关联表
CREATE TABLE material_template_mappings (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    material_id BIGINT NOT NULL COMMENT '物料ID',
    template_id BIGINT NOT NULL COMMENT '模板ID',
    is_default BOOLEAN NOT NULL DEFAULT FALSE COMMENT '是否默认模板',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (template_id) REFERENCES inspection_templates(id) ON DELETE CASCADE,
    UNIQUE KEY uk_material_template (material_id, template_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='物料-模板关联表'; 