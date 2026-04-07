-- 迁移文件：添加待办事项协同办公功能
-- 创建日期：2025-10-16
-- 版本：1.0.0

-- 1. 修改 todos 表，添加协同相关字段
ALTER TABLE todos
ADD COLUMN creator_id INT COMMENT '创建者用户ID' AFTER userId,
ADD COLUMN is_shared TINYINT(1) DEFAULT 0 COMMENT '是否为协同任务：0否，1是',
ADD COLUMN parent_todo_id INT NULL COMMENT '父任务ID（协同任务的主任务ID）',
ADD INDEX idx_creator_id (creator_id),
ADD INDEX idx_parent_todo_id (parent_todo_id);

-- 更新现有数据：将 userId 复制到 creator_id
UPDATE todos SET creator_id = userId WHERE creator_id IS NULL;

-- 2. 创建任务参与者表
CREATE TABLE IF NOT EXISTS todo_participants (
  id INT AUTO_INCREMENT PRIMARY KEY COMMENT '参与者记录ID',
  todo_id INT NOT NULL COMMENT '任务ID',
  user_id INT NOT NULL COMMENT '参与者用户ID',
  role ENUM('creator', 'participant') DEFAULT 'participant' COMMENT '角色：creator创建者，participant参与者',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '添加时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  
  UNIQUE KEY uk_todo_user (todo_id, user_id) COMMENT '同一个任务不能重复添加相同用户',
  INDEX idx_todo_id (todo_id),
  INDEX idx_user_id (user_id),
  
  FOREIGN KEY (todo_id) REFERENCES todos(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='待办事项参与者表';

-- 3. 创建任务通知表（可选，用于记录协同任务的通知）
CREATE TABLE IF NOT EXISTS todo_notifications (
  id INT AUTO_INCREMENT PRIMARY KEY COMMENT '通知ID',
  todo_id INT NOT NULL COMMENT '任务ID',
  user_id INT NOT NULL COMMENT '接收通知的用户ID',
  type ENUM('created', 'updated', 'completed', 'deleted') DEFAULT 'created' COMMENT '通知类型',
  is_read TINYINT(1) DEFAULT 0 COMMENT '是否已读：0未读，1已读',
  message TEXT COMMENT '通知消息',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  
  INDEX idx_todo_id (todo_id),
  INDEX idx_user_id (user_id),
  INDEX idx_is_read (is_read),
  
  FOREIGN KEY (todo_id) REFERENCES todos(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='待办事项通知表';

