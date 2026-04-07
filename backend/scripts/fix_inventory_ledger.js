const db = require('../src/config/db');

async function fixInventoryLedger() {
    console.log('开始修复库存账本的历史数据不一致...');

    try {
        // 1. 获取所有需要修复的物料和库位组合
        const [combinations] = await db.pool.execute(`
      SELECT DISTINCT material_id, location_id 
      FROM inventory_ledger 
      ORDER BY material_id, location_id
    `);

        console.log(`找到 ${combinations.length} 个物料/库位组合需要检查。`);

        let totalUpdated = 0;

        // 2. 逐个组合重新计算账本
        for (let i = 0; i < combinations.length; i++) {
            const { material_id, location_id } = combinations[i];

            // 按时间顺序获取该组合的所有流水
            const [records] = await db.pool.execute(`
        SELECT id, quantity, before_quantity, after_quantity 
        FROM inventory_ledger 
        WHERE material_id = ? AND location_id = ?
        ORDER BY created_at ASC, id ASC
      `, [material_id, location_id]);

            let runningBalance = 0;

            for (const record of records) {
                const currentBefore = runningBalance;
                const currentAfter = currentBefore + parseFloat(record.quantity);

                // 检查数据库中记录的 before 和 after 是否与基于真实变动量的重算结果一致
                // 由于浮点数精度问题，比较时允许微小的误差
                const diffBefore = Math.abs(currentBefore - parseFloat(record.before_quantity || 0));
                const diffAfter = Math.abs(currentAfter - parseFloat(record.after_quantity || 0));

                if (diffBefore > 0.001 || diffAfter > 0.001) {
                    // 需要更新
                    await db.pool.execute(`
            UPDATE inventory_ledger 
            SET before_quantity = ?, after_quantity = ? 
            WHERE id = ?
          `, [currentBefore, currentAfter, record.id]);
                    totalUpdated++;
                }

                runningBalance = currentAfter;
            }

            if ((i + 1) % 100 === 0) {
                console.log(`已处理 ${i + 1}/${combinations.length} 个组合...`);
            }
        }

        console.log(`\n修复完成！共修复了 ${totalUpdated} 条错误的流水记录。`);
        console.log(`因为之前负库存截断BUG产生的错误的 after_quantity 现已根据实际的变动量 (quantity) 重算完毕。`);

    } catch (error) {
        console.error('修复过程中出错:', error);
    } finally {
        process.exit(0);
    }
}

fixInventoryLedger();
