-- 修改 gl_entries 表的 created_by 字段类型
-- 从 VARCHAR(50) 改为 INT，以便关联 users 表

-- 1. 备份现有数据（可选，但建议）
-- CREATE TABLE gl_entries_backup AS SELECT * FROM gl_entries;

-- 2. 更新现有数据：将用户名转换为用户ID
-- 对于 'system' 保持不变，对于用户名尝试查找对应的用户ID
UPDATE gl_entries e
LEFT JOIN users u ON e.created_by = u.username
SET e.created_by = CASE
  WHEN e.created_by = 'system' THEN '0'  -- system 用户ID设为0
  WHEN u.id IS NOT NULL THEN CAST(u.id AS CHAR)  -- 找到用户，使用用户ID
  ELSE e.created_by  -- 找不到用户，保持原值
END
WHERE e.created_by IS NOT NULL;

-- 3. 修改字段类型为 INT
ALTER TABLE gl_entries 
MODIFY COLUMN created_by INT DEFAULT NULL COMMENT '创建人ID（关联users表）';

-- 4. 添加外键约束（可选，如果需要强制引用完整性）
-- 注意：如果有 created_by = 0 (system) 的记录，需要先处理
-- ALTER TABLE gl_entries 
-- ADD CONSTRAINT fk_gl_entries_created_by 
-- FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;

-- 5. 添加索引以提高查询性能
CREATE INDEX idx_gl_entries_created_by ON gl_entries(created_by);

