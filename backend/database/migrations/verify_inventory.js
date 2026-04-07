const { DATABASE_CONFIG } = require('../../src/config/database-config');
const mysql = require('mysql2/promise');

async function verifyInventory() {
    const connection = await mysql.createConnection(DATABASE_CONFIG);
    console.log('Connected to database\n');

    try {
        // 1. 从 inventory_ledger 计算库存
        console.log('=== inventory_ledger 库存 (SUM) ===');
        const [ledgerStock] = await connection.execute(`
            SELECT material_id, SUM(quantity) as ledger_qty
            FROM inventory_ledger
            GROUP BY material_id
            HAVING SUM(quantity) != 0
            ORDER BY material_id
            LIMIT 15
        `);
        ledgerStock.forEach(row => {
            console.log(`  物料 ${row.material_id}: ${parseFloat(row.ledger_qty).toFixed(2)}`);
        });

        // 2. 从 batch_inventory 获取库存
        console.log('\n=== batch_inventory 库存 (current_quantity) ===');
        const [batchStock] = await connection.execute(`
            SELECT material_id, SUM(current_quantity) as batch_qty
            FROM batch_inventory
            GROUP BY material_id
            HAVING SUM(current_quantity) != 0
            ORDER BY material_id
            LIMIT 15
        `);
        batchStock.forEach(row => {
            console.log(`  物料 ${row.material_id}: ${parseFloat(row.batch_qty).toFixed(2)}`);
        });

        // 3. 从 v_batch_stock 视图获取库存
        console.log('\n=== v_batch_stock 视图库存 ===');
        const [viewStock] = await connection.execute(`
            SELECT material_id, SUM(current_quantity) as view_qty
            FROM v_batch_stock
            GROUP BY material_id
            ORDER BY material_id
            LIMIT 15
        `);
        viewStock.forEach(row => {
            console.log(`  物料 ${row.material_id}: ${parseFloat(row.view_qty).toFixed(2)}`);
        });

        // 4. 差异对比
        console.log('\n=== 差异分析 ===');
        const [diff] = await connection.execute(`
            SELECT 
                COALESCE(l.material_id, b.material_id) as material_id,
                COALESCE(l.ledger_qty, 0) as ledger_qty,
                COALESCE(b.batch_qty, 0) as batch_qty,
                COALESCE(l.ledger_qty, 0) - COALESCE(b.batch_qty, 0) as difference
            FROM (
                SELECT material_id, SUM(quantity) as ledger_qty
                FROM inventory_ledger
                GROUP BY material_id
            ) l
            LEFT JOIN (
                SELECT material_id, SUM(current_quantity) as batch_qty
                FROM batch_inventory
                GROUP BY material_id
            ) b ON l.material_id = b.material_id
            WHERE ABS(COALESCE(l.ledger_qty, 0) - COALESCE(b.batch_qty, 0)) > 0.01
            ORDER BY ABS(COALESCE(l.ledger_qty, 0) - COALESCE(b.batch_qty, 0)) DESC
            LIMIT 10
        `);

        if (diff.length === 0) {
            console.log('  ✅ 无差异！两个表数据一致。');
        } else {
            console.log('  ⚠️ 发现差异:');
            diff.forEach(row => {
                console.log(`  物料 ${row.material_id}: ledger=${parseFloat(row.ledger_qty).toFixed(2)}, batch=${parseFloat(row.batch_qty).toFixed(2)}, 差=${parseFloat(row.difference).toFixed(2)}`);
            });
        }

        console.log('\n验证完成。');

    } catch (error) {
        console.error('验证失败:', error);
    } finally {
        connection.end();
    }
}

verifyInventory();
