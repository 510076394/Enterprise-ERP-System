-- 创建BOM变更日志表
-- 用于记录BOM的修改和删除操作，以及影响的生产计划

CREATE TABLE IF NOT EXISTS bom_change_logs (
  id INT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
  bom_id INT NOT NULL COMMENT 'BOM ID',
  change_type VARCHAR(20) NOT NULL COMMENT '变更类型：update-修改, delete-删除',
  changed_by INT COMMENT '变更人ID',
  changed_by_name VARCHAR(100) COMMENT '变更人姓名',
  affected_plans_count INT DEFAULT 0 COMMENT '影响的生产计划数量',
  remark TEXT COMMENT '备注说明',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  INDEX idx_bom_id (bom_id),
  INDEX idx_changed_by (changed_by),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='BOM变更日志表';

-- 为生产计划表添加BOM版本锁定字段
ALTER TABLE production_plans 
ADD COLUMN IF NOT EXISTS bom_id INT COMMENT '创建时使用的BOM ID',
ADD COLUMN IF NOT EXISTS bom_version VARCHAR(50) COMMENT '创建时锁定的BOM版本号',
ADD COLUMN IF NOT EXISTS bom_changed TINYINT DEFAULT 0 COMMENT '0-BOM未变更, 1-BOM已变更',
ADD INDEX idx_bom_id (bom_id);

