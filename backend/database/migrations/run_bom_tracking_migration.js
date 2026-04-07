/**
 * BOM变更追踪功能数据库迁移脚本
 * 执行方式: node backend/database/migrations/run_bom_tracking_migration.js
 */

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// 数据库配置 - 请根据实际情况修改
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'erp_database',
  multipleStatements: true
};

async function runMigration() {
  let connection;
  
  try {
    console.log('🔗 连接数据库...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 数据库连接成功');
    
    // 读取SQL文件
    const sqlFilePath = path.join(__dirname, 'create_bom_change_logs.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    
    console.log('\n📝 执行迁移SQL...');
    console.log('=' .repeat(60));
    
    // 执行SQL
    await connection.query(sqlContent);
    
    console.log('✅ 迁移执行成功！');
    console.log('=' .repeat(60));
    
    // 验证表和字段
    console.log('\n🔍 验证迁移结果...');
    
    // 检查 bom_change_logs 表
    const [tables] = await connection.query(
      "SHOW TABLES LIKE 'bom_change_logs'"
    );
    
    if (tables.length > 0) {
      console.log('✅ bom_change_logs 表创建成功');
      
      // 显示表结构
      const [columns] = await connection.query(
        'DESCRIBE bom_change_logs'
      );
      console.log('\n📊 bom_change_logs 表结构：');
      columns.forEach(col => {
        console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'} ${col.Default ? `DEFAULT ${col.Default}` : ''}`);
      });
    } else {
      console.log('❌ bom_change_logs 表创建失败');
    }
    
    // 检查 production_plans 新增字段
    const [planColumns] = await connection.query(
      "SHOW COLUMNS FROM production_plans WHERE Field IN ('bom_id', 'bom_version', 'bom_changed')"
    );
    
    if (planColumns.length === 3) {
      console.log('\n✅ production_plans 表字段扩展成功');
      planColumns.forEach(col => {
        console.log(`  - ${col.Field}: ${col.Type}`);
      });
    } else {
      console.log('\n⚠️ production_plans 表部分字段可能已存在或创建失败');
      console.log(`  已找到 ${planColumns.length} 个字段（预期3个）`);
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('🎉 BOM变更追踪功能迁移完成！');
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('\n❌ 迁移失败:', error.message);
    console.error('\n详细错误信息:');
    console.error(error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 数据库连接已关闭');
    }
  }
}

// 运行迁移
runMigration();

