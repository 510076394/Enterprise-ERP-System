# 安全增强数据库迁移指南

## 📋 概述

此迁移脚本为ERP系统添加了增强的安全功能，包括：
- 刷新Token管理
- 安全审计日志
- 会话和CSRF管理
- 自动清理过期数据

## 📂 相关文件

- `20251121_add_security_enhancements.sql` - 主迁移脚本
- `20251121_add_security_enhancements_rollback.sql` - 回滚脚本
- `README_SECURITY_MIGRATION.md` - 本文档

## 🚀 执行迁移

### 方法1：使用MySQL命令行

```bash
# 进入MySQL
mysql -u your_username -p your_database_name

# 执行迁移脚本
source backend/database/migrations/20251121_add_security_enhancements.sql;

# 查看结果
```

### 方法2：使用MySQL Workbench

1. 打开MySQL Workbench
2. 连接到数据库
3. 打开 `20251121_add_security_enhancements.sql` 文件
4. 点击 ⚡ 图标执行脚本

### 方法3：使用命令行直接执行

```bash
mysql -u your_username -p your_database_name < backend/database/migrations/20251121_add_security_enhancements.sql
```

## 📊 迁移内容详解

### 1. users表修改

添加 `token_version` 字段，用于实现Refresh Token撤销机制：

```sql
ALTER TABLE `users` ADD COLUMN `token_version` INT NOT NULL DEFAULT 0;
```

**作用：** 当用户修改密码或需要强制登出时，递增此版本号，所有旧的refresh token将自动失效。

### 2. refresh_tokens表

跟踪所有活跃的refresh token：

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT | 主键 |
| user_id | INT | 用户ID |
| token | VARCHAR(500) | Token（加密存储） |
| token_family | VARCHAR(100) | Token家族ID（检测重用） |
| expires_at | DATETIME | 过期时间 |
| ip_address | VARCHAR(45) | 客户端IP |
| user_agent | VARCHAR(500) | 客户端信息 |
| is_revoked | TINYINT(1) | 是否已撤销 |

**作用：** 
- 检测Token重用攻击
- 允许用户查看和管理所有活跃会话
- 支持单点登出和全局登出

### 3. security_logs表

记录所有安全相关事件：

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT | 主键 |
| user_id | INT | 用户ID |
| event_type | VARCHAR(50) | 事件类型（login, logout等） |
| event_status | ENUM | 事件状态（success/failure/warning） |
| ip_address | VARCHAR(45) | IP地址 |
| details | TEXT | 详细信息（JSON格式） |

**作用：**
- 审计追踪
- 异常检测
- 合规要求
- 安全分析

### 4. sessions表

管理用户会话和CSRF token：

| 字段 | 类型 | 说明 |
|------|------|------|
| id | VARCHAR(128) | 会话ID（主键） |
| user_id | INT | 用户ID |
| csrf_token | VARCHAR(128) | CSRF Token |
| csrf_token_expires_at | DATETIME | CSRF Token过期时间 |
| data | TEXT | 会话数据（JSON） |
| expires_at | DATETIME | 会话过期时间 |

**作用：**
- CSRF保护
- 会话管理
- 多设备登录控制

### 5. 存储过程

脚本创建了3个存储过程用于自动清理：

- `cleanup_expired_refresh_tokens()` - 清理过期的refresh tokens
- `cleanup_expired_sessions()` - 清理过期的sessions
- `cleanup_old_security_logs()` - 清理旧的安全日志（保留90天）

### 6. 定时任务

创建了3个定时事件：

- `daily_cleanup_expired_tokens` - 每日清理过期tokens
- `daily_cleanup_expired_sessions` - 每日清理过期sessions
- `weekly_cleanup_old_security_logs` - 每周清理旧日志

## 🔄 回滚迁移

如果需要回滚此迁移（⚠️ 会删除所有相关数据）：

```bash
mysql -u your_username -p your_database_name < backend/database/migrations/20251121_add_security_enhancements_rollback.sql
```

## ✅ 验证迁移

执行迁移后，运行以下SQL验证：

```sql
-- 检查users表的token_version字段
DESCRIBE users;

-- 检查新表是否存在
SHOW TABLES LIKE 'refresh_tokens';
SHOW TABLES LIKE 'security_logs';
SHOW TABLES LIKE 'sessions';

-- 检查存储过程
SHOW PROCEDURE STATUS WHERE Db = DATABASE();

-- 检查定时事件
SHOW EVENTS;
```

## 📝 使用示例

### 手动清理过期数据

```sql
-- 清理过期的refresh tokens
CALL cleanup_expired_refresh_tokens();

-- 清理过期的sessions
CALL cleanup_expired_sessions();

-- 清理旧的安全日志
CALL cleanup_old_security_logs();
```

### 查询安全日志

```sql
-- 查看最近的登录失败记录
SELECT * FROM security_logs 
WHERE event_type = 'failed_login' 
  AND event_status = 'failure'
ORDER BY created_at DESC 
LIMIT 10;

-- 查看特定用户的安全事件
SELECT * FROM security_logs 
WHERE user_id = 1
ORDER BY created_at DESC;
```

### 管理Refresh Tokens

```sql
-- 查看用户的所有活跃tokens
SELECT * FROM refresh_tokens 
WHERE user_id = 1 
  AND is_revoked = 0 
  AND expires_at > NOW();

-- 撤销用户的所有tokens（强制登出）
UPDATE refresh_tokens 
SET is_revoked = 1, 
    revoked_at = NOW(),
    revoked_reason = 'User requested logout'
WHERE user_id = 1;

-- 递增用户的token版本（使所有tokens失效）
UPDATE users 
SET token_version = token_version + 1 
WHERE id = 1;
```

## 🔒 安全建议

1. **备份数据库**
   ```bash
   mysqldump -u username -p database_name > backup_before_migration.sql
   ```

2. **在测试环境先执行**
   - 确保迁移脚本正常工作
   - 验证所有功能正常

3. **监控性能**
   - 定时任务可能影响数据库性能
   - 根据需要调整清理周期

4. **配置环境变量**
   确保以下环境变量已设置：
   ```env
   JWT_SECRET=your-strong-secret
   JWT_REFRESH_SECRET=your-refresh-secret
   JWT_ACCESS_TOKEN_EXPIRY=15m
   JWT_REFRESH_TOKEN_EXPIRY=7d
   ```

5. **定期审计**
   - 定期检查security_logs表
   - 监控异常登录模式
   - 及时撤销可疑的tokens

## 🛠️ 故障排除

### 问题1：事件调度器未启动

```sql
-- 检查事件调度器状态
SHOW VARIABLES LIKE 'event_scheduler';

-- 启用事件调度器
SET GLOBAL event_scheduler = ON;

-- 在my.cnf中永久启用
[mysqld]
event_scheduler=ON
```

### 问题2：权限不足

确保数据库用户有以下权限：
```sql
GRANT CREATE, ALTER, INDEX, DROP, EXECUTE, EVENT ON database_name.* TO 'username'@'host';
FLUSH PRIVILEGES;
```

### 问题3：外键约束错误

如果users表不存在或结构不同，可能导致外键创建失败。解决方法：
1. 检查users表是否存在
2. 确保users表有id主键
3. 修改迁移脚本中的外键定义

## 📞 支持

如有问题，请查看：
- 项目文档：`docs/安全修复完成报告.md`
- 环境配置：`docs/环境变量配置说明.md`
- 快速启动：`docs/快速启动指南.md`

## 📅 更新日志

- **2025-11-21** - 初始版本
  - 添加token_version字段
  - 创建refresh_tokens表
  - 创建security_logs表
  - 创建sessions表
  - 添加自动清理机制

