-- ==================== 预算管理模块数据库表 ====================
-- 创建时间: 2025-12-31
-- 说明: 预算管理模块的数据库表结构

-- 删除已存在的表（如果存在）
-- 注意：必须先删除有外键约束的子表，再删除父表
DROP TABLE IF EXISTS budget_warnings;
DROP TABLE IF EXISTS budget_execution;
DROP TABLE IF EXISTS budget_details;
DROP TABLE IF EXISTS budget_items;  -- 旧表名
DROP TABLE IF EXISTS budgets;

-- 1. 预算表 (budgets)
CREATE TABLE IF NOT EXISTS budgets (
  id INT PRIMARY KEY AUTO_INCREMENT COMMENT '预算ID',
  budget_no VARCHAR(50) NOT NULL UNIQUE COMMENT '预算编号',
  budget_name VARCHAR(200) NOT NULL COMMENT '预算名称',
  budget_year INT NOT NULL COMMENT '预算年度',
  budget_type ENUM('年度预算', '季度预算', '月度预算', '项目预算') NOT NULL DEFAULT '年度预算' COMMENT '预算类型',
  department_id INT DEFAULT NULL COMMENT '部门ID',
  start_date DATE NOT NULL COMMENT '开始日期',
  end_date DATE NOT NULL COMMENT '结束日期',
  total_amount DECIMAL(15,2) NOT NULL DEFAULT 0.00 COMMENT '预算总金额',
  used_amount DECIMAL(15,2) NOT NULL DEFAULT 0.00 COMMENT '已使用金额',
  remaining_amount DECIMAL(15,2) NOT NULL DEFAULT 0.00 COMMENT '剩余金额',
  status ENUM('草稿', '待审批', '已审批', '执行中', '已完成', '已关闭') NOT NULL DEFAULT '草稿' COMMENT '预算状态',
  approval_status ENUM('未提交', '审批中', '已通过', '已驳回') NOT NULL DEFAULT '未提交' COMMENT '审批状态',
  description TEXT COMMENT '预算说明',
  created_by INT DEFAULT NULL COMMENT '创建人ID',
  approved_by INT DEFAULT NULL COMMENT '审批人ID',
  approved_at DATETIME DEFAULT NULL COMMENT '审批时间',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_budget_no (budget_no),
  INDEX idx_budget_year (budget_year),
  INDEX idx_department_id (department_id),
  INDEX idx_status (status),
  INDEX idx_created_by (created_by)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='预算表';

-- 2. 预算明细表 (budget_details)
CREATE TABLE IF NOT EXISTS budget_details (
  id INT PRIMARY KEY AUTO_INCREMENT COMMENT '明细ID',
  budget_id INT NOT NULL COMMENT '预算ID',
  account_id INT NOT NULL COMMENT '会计科目ID',
  department_id INT DEFAULT NULL COMMENT '部门ID',
  budget_amount DECIMAL(15,2) NOT NULL DEFAULT 0.00 COMMENT '预算金额',
  used_amount DECIMAL(15,2) NOT NULL DEFAULT 0.00 COMMENT '已使用金额',
  remaining_amount DECIMAL(15,2) NOT NULL DEFAULT 0.00 COMMENT '剩余金额',
  warning_threshold DECIMAL(5,2) DEFAULT 80.00 COMMENT '预警阈值(%)',
  description TEXT COMMENT '说明',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_budget_id (budget_id),
  INDEX idx_account_id (account_id),
  INDEX idx_department_id (department_id),
  FOREIGN KEY (budget_id) REFERENCES budgets(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='预算明细表';

-- 3. 预算执行表 (budget_execution)
CREATE TABLE IF NOT EXISTS budget_execution (
  id INT PRIMARY KEY AUTO_INCREMENT COMMENT '执行ID',
  budget_id INT NOT NULL COMMENT '预算ID',
  budget_detail_id INT NOT NULL COMMENT '预算明细ID',
  execution_date DATE NOT NULL COMMENT '执行日期',
  execution_amount DECIMAL(15,2) NOT NULL COMMENT '执行金额',
  document_type VARCHAR(50) COMMENT '关联单据类型',
  document_id INT COMMENT '关联单据ID',
  document_no VARCHAR(50) COMMENT '关联单据号',
  gl_entry_id INT COMMENT '关联会计分录ID',
  description TEXT COMMENT '说明',
  created_by INT DEFAULT NULL COMMENT '创建人ID',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  INDEX idx_budget_id (budget_id),
  INDEX idx_budget_detail_id (budget_detail_id),
  INDEX idx_execution_date (execution_date),
  INDEX idx_document (document_type, document_id),
  INDEX idx_gl_entry_id (gl_entry_id),
  FOREIGN KEY (budget_id) REFERENCES budgets(id) ON DELETE CASCADE,
  FOREIGN KEY (budget_detail_id) REFERENCES budget_details(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='预算执行表';

-- 4. 预算预警表 (budget_warnings)
CREATE TABLE IF NOT EXISTS budget_warnings (
  id INT PRIMARY KEY AUTO_INCREMENT COMMENT '预警ID',
  budget_id INT NOT NULL COMMENT '预算ID',
  budget_detail_id INT DEFAULT NULL COMMENT '预算明细ID',
  warning_type ENUM('超预算', '接近预算', '预算不足') NOT NULL COMMENT '预警类型',
  warning_level ENUM('低', '中', '高') NOT NULL DEFAULT '中' COMMENT '预警级别',
  warning_message TEXT NOT NULL COMMENT '预警信息',
  is_read BOOLEAN NOT NULL DEFAULT FALSE COMMENT '是否已读',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  INDEX idx_budget_id (budget_id),
  INDEX idx_budget_detail_id (budget_detail_id),
  INDEX idx_is_read (is_read),
  INDEX idx_created_at (created_at),
  FOREIGN KEY (budget_id) REFERENCES budgets(id) ON DELETE CASCADE,
  FOREIGN KEY (budget_detail_id) REFERENCES budget_details(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='预算预警表';

-- 插入初始数据（可选）
-- 示例：创建一个2025年度预算（如果不存在）
INSERT IGNORE INTO budgets (budget_no, budget_name, budget_year, budget_type, start_date, end_date, total_amount, status, description, created_by)
VALUES ('BG2025001', '2025年度总预算', 2025, '年度预算', '2025-01-01', '2025-12-31', 10000000.00, '草稿', '2025年度公司总预算', 1);

-- 完成
SELECT '预算管理模块数据库表创建完成！' AS message;

