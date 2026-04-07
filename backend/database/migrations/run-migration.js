/**
 * 数据库迁移执行脚本
 * 
 * 运行方式：node database/migrations/run-migration.js [迁移文件名]
 * 
 * @version 1.0.0
 */

const fs = require('fs');
const path = require('path');

// 初始化数据库连接
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });
const db = require('../../src/config/db');
const { logger } = require('../../src/utils/logger');

const MIGRATIONS_DIR = __dirname;

/**
 * 获取所有迁移文件
 */
function getMigrationFiles() {
    return fs.readdirSync(MIGRATIONS_DIR)
        .filter(file => file.endsWith('.js') && !['template.js', 'run-migration.js'].includes(file))
        .sort();
}

/**
 * 运行单个迁移
 */
async function runMigration(filename, direction = 'up') {
    const migrationPath = path.join(MIGRATIONS_DIR, filename);

    if (!fs.existsSync(migrationPath)) {
        console.error(`迁移文件不存在: ${filename}`);
        process.exit(1);
    }

    const migration = require(migrationPath);

    console.log(`\n========================================`);
    console.log(`迁移: ${migration.name}`);
    console.log(`描述: ${migration.description}`);
    console.log(`操作: ${direction === 'up' ? '执行' : '回滚'}`);
    console.log(`========================================\n`);

    try {
        if (direction === 'up') {
            await migration.up();
        } else {
            await migration.down();
        }
        console.log(`\n✅ 迁移${direction === 'up' ? '执行' : '回滚'}成功！\n`);
    } catch (error) {
        console.error(`\n❌ 迁移${direction === 'up' ? '执行' : '回滚'}失败:`, error.message);
        process.exit(1);
    }
}

/**
 * 主函数
 */
async function main() {
    const args = process.argv.slice(2);

    if (args.length === 0) {
        // 列出所有迁移
        console.log('\n可用的迁移文件:\n');
        const files = getMigrationFiles();
        if (files.length === 0) {
            console.log('  (无迁移文件)\n');
        } else {
            files.forEach((file, index) => {
                console.log(`  ${index + 1}. ${file}`);
            });
        }
        console.log('\n用法: node run-migration.js <迁移文件名> [up|down]\n');
        process.exit(0);
    }

    const filename = args[0];
    const direction = args[1] || 'up';

    if (!['up', 'down'].includes(direction)) {
        console.error('无效的方向，请使用 "up" 或 "down"');
        process.exit(1);
    }

    await runMigration(filename, direction);
    process.exit(0);
}

main().catch(err => {
    console.error('迁移脚本执行失败:', err);
    process.exit(1);
});
