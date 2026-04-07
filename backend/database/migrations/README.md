# 数据库迁移脚本

本目录用于管理数据库表结构的版本控制和迁移。

## 目录结构

```
migrations/
├── README.md                 # 本说明文件
├── template.js              # 迁移脚本模板
├── run-migration.js         # 迁移执行脚本
└── 001_initial_schema.js    # 示例迁移（已应用）
```

## 使用方法

### 创建新迁移

1. 复制 `template.js` 为新文件，命名格式：`NNN_描述.js`
   - 例如：`002_add_audit_fields.js`

2. 编辑迁移文件的 `up()` 和 `down()` 方法

3. 运行迁移：
   ```powershell
   cd backend
   node migrations/run-migration.js
   ```

## 注意事项

> ⚠️ **重要提醒**
> 
> 修改财务核心表（gl_accounts, gl_entries, gl_entry_items）前，请务必：
> 1. 备份数据库
> 2. 在测试环境验证
> 3. 评估对依赖模块的影响（参见审计报告）
