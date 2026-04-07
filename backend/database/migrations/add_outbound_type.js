/**
 * 数据库迁移：为 inventory_outbound 表新增 outbound_type 字段
 * 
 * @description 明确标记出库单的业务类型，消除前端的推断逻辑
 * @date 2026-03-24
 * 
 * outbound_type 枚举值：
 *   - bom_issue:        BOM展开发料（生产出库）
 *   - supplement:       补料申请（产线补料）
 *   - supplement_issue: 补发出库（部分完成后补发）
 *   - batch_issue:      批量合并发料
 *   - manual:           手动出库
 */

// 使用全局数据库配置（DRY原则）
const { getPoolConfig } = require('../../src/config/database-config');
const mysql = require('mysql2/promise');

async function migrate() {
  let connection;
  try {
    const pool = mysql.createPool(getPoolConfig());
    connection = await pool.getConnection();

    console.log('=== 开始迁移：新增 outbound_type 字段 ===');

    // 第一步：检查字段是否已存在
    const [columns] = await connection.execute(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_SCHEMA = DATABASE() 
       AND TABLE_NAME = 'inventory_outbound' 
       AND COLUMN_NAME = 'outbound_type'`
    );

    if (columns.length > 0) {
      console.log('outbound_type 字段已存在，跳过 DDL 变更');
    } else {
      // 新增字段，默认值为 manual
      await connection.execute(`
        ALTER TABLE inventory_outbound 
        ADD COLUMN outbound_type VARCHAR(30) NOT NULL DEFAULT 'manual' 
        COMMENT '出库类型: bom_issue=BOM发料, supplement=补料, supplement_issue=补发, batch_issue=批量发料, manual=手动出库'
        AFTER status
      `);
      console.log('✅ 字段 outbound_type 已创建');
    }

    // 第二步：回填历史数据
    // 规则1：关联了生产任务（reference_type='production_task'）且明细行数 > 1 → bom_issue
    const [bomResult] = await connection.execute(`
      UPDATE inventory_outbound o
      SET o.outbound_type = 'bom_issue'
      WHERE o.outbound_type = 'manual'
        AND o.reference_type = 'production_task'
        AND (SELECT COUNT(*) FROM inventory_outbound_items oi WHERE oi.outbound_id = o.id) > 1
    `);
    console.log(`✅ 回填 bom_issue: ${bomResult.affectedRows} 条`);

    // 规则2：批量发料（is_batch_outbound = 1 或 reference_type = 'batch_production_tasks'）
    const [batchResult] = await connection.execute(`
      UPDATE inventory_outbound o
      SET o.outbound_type = 'batch_issue'
      WHERE o.outbound_type = 'manual'
        AND (o.is_batch_outbound = 1 OR o.reference_type = 'batch_production_tasks')
    `);
    console.log(`✅ 回填 batch_issue: ${batchResult.affectedRows} 条`);

    // 规则3：关联了生产任务但只有单个明细项 → 大概率是补料/补发
    // 进一步细分：有 issue_reason 或 is_excess=1 的是补料/补发
    const [supplementResult] = await connection.execute(`
      UPDATE inventory_outbound o
      SET o.outbound_type = 'supplement'
      WHERE o.outbound_type = 'manual'
        AND o.reference_type = 'production_task'
        AND (SELECT COUNT(*) FROM inventory_outbound_items oi WHERE oi.outbound_id = o.id) <= 1
    `);
    console.log(`✅ 回填 supplement: ${supplementResult.affectedRows} 条`);

    // 规则4：没有关联生产任务的保持 manual 默认值

    // 验证结果
    const [stats] = await connection.execute(`
      SELECT outbound_type, COUNT(*) as count 
      FROM inventory_outbound 
      GROUP BY outbound_type 
      ORDER BY count DESC
    `);
    console.log('\n=== 迁移完成，各类型统计 ===');
    stats.forEach(row => {
      console.log(`  ${row.outbound_type}: ${row.count} 条`);
    });

    connection.release();
    console.log('\n✅ 迁移成功完成');
    process.exit(0);
  } catch (error) {
    console.error('❌ 迁移失败:', error.message);
    if (connection) connection.release();
    process.exit(1);
  }
}

migrate();
