/**
 * 数据库迁移脚本模板
 * 
 * 复制此文件创建新迁移，命名格式：NNN_描述.js
 * 例如：002_add_invoice_audit_fields.js
 * 
 * @version 1.0.0
 */

const db = require('../src/config/db');
const { logger } = require('../src/utils/logger');

// 迁移信息
const MIGRATION_NAME = 'template';
const MIGRATION_DESCRIPTION = '迁移描述（请修改）';

/**
 * 执行迁移 - 应用变更
 */
async function up() {
    const connection = await db.pool.getConnection();
    try {
        await connection.beginTransaction();

        logger.info(`[Migration] 开始执行迁移: ${MIGRATION_NAME}`);

        // ========== 在此添加迁移逻辑 ==========
        // 示例：添加新字段
        // await connection.execute(`
        //   ALTER TABLE gl_entries 
        //   ADD COLUMN audit_status VARCHAR(20) DEFAULT 'pending' AFTER is_posted
        // `);

        // 示例：创建新表
        // await connection.execute(`
        //   CREATE TABLE IF NOT EXISTS migration_history (
        //     id INT AUTO_INCREMENT PRIMARY KEY,
        //     name VARCHAR(100) NOT NULL,
        //     applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        //   )
        // `);

        // ======================================

        await connection.commit();
        logger.info(`[Migration] 迁移完成: ${MIGRATION_NAME}`);
        return true;
    } catch (error) {
        await connection.rollback();
        logger.error(`[Migration] 迁移失败: ${MIGRATION_NAME}`, error);
        throw error;
    } finally {
        connection.release();
    }
}

/**
 * 回滚迁移 - 撤销变更
 */
async function down() {
    const connection = await db.pool.getConnection();
    try {
        await connection.beginTransaction();

        logger.info(`[Migration] 开始回滚迁移: ${MIGRATION_NAME}`);

        // ========== 在此添加回滚逻辑 ==========
        // 示例：删除添加的字段
        // await connection.execute(`
        //   ALTER TABLE gl_entries 
        //   DROP COLUMN audit_status
        // `);

        // ======================================

        await connection.commit();
        logger.info(`[Migration] 回滚完成: ${MIGRATION_NAME}`);
        return true;
    } catch (error) {
        await connection.rollback();
        logger.error(`[Migration] 回滚失败: ${MIGRATION_NAME}`, error);
        throw error;
    } finally {
        connection.release();
    }
}

module.exports = {
    name: MIGRATION_NAME,
    description: MIGRATION_DESCRIPTION,
    up,
    down
};
