-- 通知表
CREATE TABLE IF NOT EXISTS `notifications` (
  `id` INT PRIMARY KEY AUTO_INCREMENT COMMENT '通知ID',
  `user_id` INT NOT NULL COMMENT '接收用户ID',
  `type` VARCHAR(50) NOT NULL COMMENT '通知类型：system-系统通知, business-业务通知, warning-预警通知, info-信息通知',
  `title` VARCHAR(200) NOT NULL COMMENT '通知标题',
  `content` TEXT COMMENT '通知内容',
  `link` VARCHAR(500) COMMENT '关联链接',
  `link_params` JSON COMMENT '链接参数',
  `is_read` TINYINT(1) DEFAULT 0 COMMENT '是否已读：0-未读，1-已读',
  `read_at` DATETIME COMMENT '阅读时间',
  `priority` TINYINT DEFAULT 0 COMMENT '优先级：0-普通，1-重要，2-紧急',
  `source_type` VARCHAR(50) COMMENT '来源类型：order-订单, inventory-库存, production-生产等',
  `source_id` INT COMMENT '来源ID',
  `created_by` INT COMMENT '创建人ID',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_is_read` (`is_read`),
  INDEX `idx_type` (`type`),
  INDEX `idx_created_at` (`created_at`),
  INDEX `idx_source` (`source_type`, `source_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统通知表';

-- 技术通讯表
CREATE TABLE IF NOT EXISTS `technical_communications` (
  `id` INT PRIMARY KEY AUTO_INCREMENT COMMENT '通讯ID',
  `title` VARCHAR(200) NOT NULL COMMENT '标题',
  `category` VARCHAR(50) NOT NULL COMMENT '分类：update-更新日志, guide-操作指南, specification-技术规范, announcement-公告',
  `tags` JSON COMMENT '标签数组',
  `summary` VARCHAR(500) COMMENT '摘要',
  `content` LONGTEXT NOT NULL COMMENT '内容（富文本HTML）',
  `author_id` INT NOT NULL COMMENT '作者ID',
  `author_name` VARCHAR(100) COMMENT '作者姓名',
  `status` VARCHAR(20) DEFAULT 'draft' COMMENT '状态：draft-草稿, published-已发布, archived-已归档',
  `published_at` DATETIME COMMENT '发布时间',
  `view_count` INT DEFAULT 0 COMMENT '浏览次数',
  `is_pinned` TINYINT(1) DEFAULT 0 COMMENT '是否置顶',
  `attachments` JSON COMMENT '附件列表',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX `idx_category` (`category`),
  INDEX `idx_status` (`status`),
  INDEX `idx_published_at` (`published_at`),
  INDEX `idx_author_id` (`author_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='技术通讯表';

-- 技术通讯阅读记录表
CREATE TABLE IF NOT EXISTS `technical_communication_reads` (
  `id` INT PRIMARY KEY AUTO_INCREMENT COMMENT '记录ID',
  `communication_id` INT NOT NULL COMMENT '通讯ID',
  `user_id` INT NOT NULL COMMENT '用户ID',
  `read_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '阅读时间',
  `read_duration` INT COMMENT '阅读时长（秒）',
  UNIQUE KEY `uk_communication_user` (`communication_id`, `user_id`),
  INDEX `idx_communication_id` (`communication_id`),
  INDEX `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='技术通讯阅读记录表';

-- 技术通讯评论表
CREATE TABLE IF NOT EXISTS `technical_communication_comments` (
  `id` INT PRIMARY KEY AUTO_INCREMENT COMMENT '评论ID',
  `communication_id` INT NOT NULL COMMENT '通讯ID',
  `user_id` INT NOT NULL COMMENT '用户ID',
  `user_name` VARCHAR(100) COMMENT '用户姓名',
  `content` TEXT NOT NULL COMMENT '评论内容',
  `parent_id` INT COMMENT '父评论ID（用于回复）',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  INDEX `idx_communication_id` (`communication_id`),
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_parent_id` (`parent_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='技术通讯评论表';

