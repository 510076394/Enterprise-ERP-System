-- 创建打印模板表
CREATE TABLE IF NOT EXISTS `print_templates` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL COMMENT '模板名称',
  `module` VARCHAR(50) NOT NULL COMMENT '所属模块',
  `template_type` VARCHAR(50) NOT NULL COMMENT '模板类型',
  `content` TEXT NOT NULL COMMENT '模板内容',
  `paper_size` VARCHAR(20) NOT NULL DEFAULT 'A4' COMMENT '纸张大小',
  `orientation` VARCHAR(20) NOT NULL DEFAULT 'portrait' COMMENT '打印方向',
  `margin_top` INT NOT NULL DEFAULT 10 COMMENT '上边距(mm)',
  `margin_right` INT NOT NULL DEFAULT 10 COMMENT '右边距(mm)',
  `margin_bottom` INT NOT NULL DEFAULT 10 COMMENT '下边距(mm)',
  `margin_left` INT NOT NULL DEFAULT 10 COMMENT '左边距(mm)',
  `is_default` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否默认模板',
  `status` TINYINT(1) NOT NULL DEFAULT 1 COMMENT '状态：1-启用，0-禁用',
  `created_by` INT COMMENT '创建人ID',
  `updated_by` INT COMMENT '更新人ID',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  INDEX `idx_module_type` (`module`, `template_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='打印模板表';

-- 创建打印设置表
CREATE TABLE IF NOT EXISTS `print_settings` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL COMMENT '设置名称',
  `default_paper_size` VARCHAR(20) NOT NULL DEFAULT 'A4' COMMENT '默认纸张大小',
  `default_orientation` VARCHAR(20) NOT NULL DEFAULT 'portrait' COMMENT '默认打印方向',
  `default_margin_top` INT NOT NULL DEFAULT 10 COMMENT '默认上边距(mm)',
  `default_margin_right` INT NOT NULL DEFAULT 10 COMMENT '默认右边距(mm)',
  `default_margin_bottom` INT NOT NULL DEFAULT 10 COMMENT '默认下边距(mm)',
  `default_margin_left` INT NOT NULL DEFAULT 10 COMMENT '默认左边距(mm)',
  `header_content` TEXT COMMENT '页眉内容',
  `footer_content` TEXT COMMENT '页脚内容',
  `company_logo` VARCHAR(255) COMMENT '公司Logo路径',
  `status` TINYINT(1) NOT NULL DEFAULT 1 COMMENT '状态：1-启用，0-禁用',
  `created_by` INT COMMENT '创建人ID',
  `updated_by` INT COMMENT '更新人ID',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='打印设置表';

-- 初始化默认打印设置
INSERT INTO `print_settings` (`name`, `default_paper_size`, `default_orientation`) 
VALUES ('默认打印设置', 'A4', 'portrait'); 