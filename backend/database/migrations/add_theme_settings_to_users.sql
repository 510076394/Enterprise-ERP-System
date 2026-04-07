-- 添加主题设置字段到users表
-- 执行时间: 2025-10-23

ALTER TABLE users 
ADD COLUMN theme_settings JSON DEFAULT NULL COMMENT '用户主题设置(JSON格式)';

-- 示例数据格式:
-- {
--   "theme": "dark",
--   "preset": "tech",
--   "primaryColor": "#00C3FF",
--   "fontSize": 14
-- }

