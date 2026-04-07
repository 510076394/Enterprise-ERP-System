const { DATABASE_CONFIG } = require('../../src/config/database-config');
const mysql = require('mysql2/promise');

async function addInitBatchNumbers() {
    const connection = await mysql.createConnection(DATABASE_CONFIG);
    console.log('Connected to database\n');

    try {
        // 1. 查找没有批次号的记录数量
        const [countResult] = await connection.execute(`
            SELECT COUNT(*) as cnt FROM inventory_ledger WHERE batch_number IS NULL OR batch_number = ''
        `);
        const unbatchedCount = countResult[0].cnt;
        console.log(`发现 ${unbatchedCount} 条无批次号的记录\n`);

        if (unbatchedCount === 0) {
            console.log('✅ 所有记录都有批次号，无需处理。');
            return;
        }

        // 2. 按物料分组，为每个物料生成初始批次号
        const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');

        const [materials] = await connection.execute(`
            SELECT DISTINCT material_id 
            FROM inventory_ledger 
            WHERE batch_number IS NULL OR batch_number = ''
        `);

        console.log(`涉及 ${materials.length} 个物料\n`);

        let updatedCount = 0;
        for (const mat of materials) {
            const batchNumber = `INIT-${mat.material_id}-${today}`;

            const [updateResult] = await connection.execute(`
                UPDATE inventory_ledger 
                SET batch_number = ?
                WHERE material_id = ? AND (batch_number IS NULL OR batch_number = '')
            `, [batchNumber, mat.material_id]);

            updatedCount += updateResult.affectedRows;
            console.log(`物料 ${mat.material_id}: 批次号 ${batchNumber}, 更新 ${updateResult.affectedRows} 条`);
        }

        console.log(`\n✅ 总计更新 ${updatedCount} 条记录`);

        // 3. 验证 v_batch_stock 视图数据
        const [viewCount] = await connection.execute(`
            SELECT COUNT(*) as cnt FROM v_batch_stock
        `);
        console.log(`\nv_batch_stock 视图现在有 ${viewCount[0].cnt} 条批次库存记录`);

    } catch (error) {
        console.error('迁移失败:', error);
    } finally {
        connection.end();
    }
}

addInitBatchNumbers();
