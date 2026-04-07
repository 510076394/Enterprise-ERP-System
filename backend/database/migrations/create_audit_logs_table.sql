-- 创建审计日志表
CREATE TABLE IF NOT EXISTS audit_logs (
  id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
  request_id VARCHAR(50) COMMENT '请求ID',
  user_id INT COMMENT '用户ID',
  username VARCHAR(100) COMMENT '用户名',
  action VARCHAR(50) COMMENT '操作类型: LOGIN, LOGOUT, CREATE, UPDATE, DELETE, READ',
  resource_type VARCHAR(100) COMMENT '资源类型',
  resource_id VARCHAR(100) COMMENT '资源ID',
  method VARCHAR(10) COMMENT 'HTTP方法',
  path VARCHAR(255) COMMENT '请求路径',
  query_params TEXT COMMENT '查询参数',
  request_body TEXT COMMENT '请求体',
  response_status INT COMMENT '响应状态码',
  response_body TEXT COMMENT '响应体',
  ip_address VARCHAR(50) COMMENT 'IP地址',
  user_agent TEXT COMMENT '用户代理',
  duration_ms INT COMMENT '请求耗时(毫秒)',
  old_values TEXT COMMENT '旧值（用于UPDATE操作）',
  new_values TEXT COMMENT '新值（用于UPDATE操作）',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  
  -- 索引优化
  INDEX idx_user_id (user_id),
  INDEX idx_username (username),
  INDEX idx_action (action),
  INDEX idx_created_at (created_at),
  INDEX idx_user_created (user_id, created_at),
  INDEX idx_action_created (action, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='审计日志表';

-- 插入一些示例数据（用于测试）
INSERT INTO audit_logs (user_id, username, action, resource_type, method, path, response_status, ip_address, duration_ms, created_at) 
SELECT 1, 'admin', 'LOGIN', 'auth', 'POST', '/api/auth/login', 200, '127.0.0.1', 150, DATE_SUB(NOW(), INTERVAL FLOOR(RAND() * 30) DAY)
FROM (SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5) t1
CROSS JOIN (SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5) t2
LIMIT 50;

-- 插入更多不同时间的活动记录
INSERT INTO audit_logs (user_id, username, action, resource_type, method, path, response_status, ip_address, duration_ms, created_at)
VALUES
  (1, 'admin', 'READ', 'dashboard', 'GET', '/api/dashboard', 200, '127.0.0.1', 50, NOW()),
  (1, 'admin', 'READ', 'profile', 'GET', '/api/profile', 200, '127.0.0.1', 30, DATE_SUB(NOW(), INTERVAL 5 MINUTE)),
  (1, 'admin', 'UPDATE', 'profile', 'PUT', '/api/profile', 200, '127.0.0.1', 100, DATE_SUB(NOW(), INTERVAL 10 MINUTE)),
  (1, 'admin', 'READ', 'production', 'GET', '/api/production/plans', 200, '127.0.0.1', 80, DATE_SUB(NOW(), INTERVAL 15 MINUTE)),
  (1, 'admin', 'CREATE', 'todo', 'POST', '/api/todos', 201, '127.0.0.1', 120, DATE_SUB(NOW(), INTERVAL 20 MINUTE)),
  (1, 'admin', 'LOGIN', 'auth', 'POST', '/api/auth/login', 200, '127.0.0.1', 150, DATE_SUB(NOW(), INTERVAL 1 DAY)),
  (1, 'admin', 'READ', 'materials', 'GET', '/api/materials', 200, '127.0.0.1', 60, DATE_SUB(NOW(), INTERVAL 1 DAY)),
  (1, 'admin', 'UPDATE', 'production', 'PUT', '/api/production/plans/1', 200, '127.0.0.1', 110, DATE_SUB(NOW(), INTERVAL 2 DAY)),
  (1, 'admin', 'LOGIN', 'auth', 'POST', '/api/auth/login', 200, '127.0.0.1', 140, DATE_SUB(NOW(), INTERVAL 3 DAY));

