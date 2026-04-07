-- 过程检验规则表添加打卡间隔字段
-- 用于配置巡检打卡的最小间隔时间（分钟）

ALTER TABLE `process_inspection_rules` 
ADD COLUMN `punch_interval` INT DEFAULT 10 COMMENT '巡检打卡间隔(分钟)' AFTER `sample_rate`;
