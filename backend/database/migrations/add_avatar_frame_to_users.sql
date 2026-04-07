-- 添加头像特效字段到用户表
-- 创建时间: 2025-10-14
-- 描述: 为用户表添加avatar_frame字段，用于存储用户选择的头像特效

ALTER TABLE users ADD COLUMN avatar_frame VARCHAR(20) DEFAULT 'frame1' COMMENT '用户选择的头像特效ID';

-- 为现有用户设置默认特效
UPDATE users SET avatar_frame = 'frame1' WHERE avatar_frame IS NULL;
