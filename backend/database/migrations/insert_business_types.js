/**
 * 插入业务类型数据
 */
const { DATABASE_CONFIG } = require('../../src/config/database-config');
const mysql = require('mysql2/promise');

const businessTypes = [
  { code: 'in', name: '入库', category: 'in', description: '通用入库', icon: 'icon-download', color: '#67C23A', sort_order: 1, is_system: 1, status: 1 },
  { code: 'purchase_inbound', name: '采购入库', category: 'in', description: '采购订单入库', icon: 'icon-shopping-cart', color: '#409EFF', sort_order: 2, is_system: 1, status: 1 },
  { code: 'production_inbound', name: '生产入库', category: 'in', description: '生产完工入库', icon: 'icon-data-line', color: '#E6A23C', sort_order: 3, is_system: 1, status: 1 },
  { code: 'outsourced_inbound', name: '委外入库', category: 'in', description: '委外加工入库', icon: 'icon-truck', color: '#909399', sort_order: 4, is_system: 1, status: 1 },
  { code: 'sales_return', name: '销售退货', category: 'in', description: '销售退货入库', icon: 'icon-refresh-left', color: '#F56C6C', sort_order: 5, is_system: 1, status: 1 },
  { code: 'manual_in', name: '手工入库', category: 'in', description: '手工调整入库', icon: 'icon-edit', color: '#67C23A', sort_order: 6, is_system: 1, status: 1 },
  { code: 'out', name: '出库', category: 'out', description: '通用出库', icon: 'icon-upload', color: '#E6A23C', sort_order: 11, is_system: 1, status: 1 },
  { code: 'sales_outbound', name: '销售出库', category: 'out', description: '销售订单出库', icon: 'icon-sell', color: '#409EFF', sort_order: 12, is_system: 1, status: 1 },
  { code: 'production_outbound', name: '生产出库', category: 'out', description: '生产领料出库', icon: 'icon-data-line', color: '#E6A23C', sort_order: 13, is_system: 1, status: 1 },
  { code: 'outsourced_outbound', name: '委外出库', category: 'out', description: '委外发料出库', icon: 'icon-truck', color: '#909399', sort_order: 14, is_system: 1, status: 1 },
  { code: 'purchase_return', name: '采购退货', category: 'out', description: '采购退货出库', icon: 'icon-refresh-right', color: '#F56C6C', sort_order: 15, is_system: 1, status: 1 },
  { code: 'manual_out', name: '手工出库', category: 'out', description: '手工调整出库', icon: 'icon-edit', color: '#E6A23C', sort_order: 16, is_system: 1, status: 1 },
  { code: 'transfer', name: '调拨', category: 'transfer', description: '仓库间调拨', icon: 'icon-sort', color: '#409EFF', sort_order: 21, is_system: 1, status: 1 },
  { code: 'transfer_in', name: '调拨入库', category: 'transfer', description: '调拨入库', icon: 'icon-bottom', color: '#67C23A', sort_order: 22, is_system: 1, status: 1 },
  { code: 'transfer_out', name: '调拨出库', category: 'transfer', description: '调拨出库', icon: 'icon-top', color: '#E6A23C', sort_order: 23, is_system: 1, status: 1 },
  { code: 'adjust', name: '调整', category: 'adjust', description: '库存调整', icon: 'icon-setting', color: '#909399', sort_order: 31, is_system: 1, status: 1 },
  { code: 'check', name: '盘点', category: 'adjust', description: '库存盘点', icon: 'icon-document-checked', color: '#409EFF', sort_order: 32, is_system: 1, status: 1 },
  { code: 'adjustment_in', name: '调整入库', category: 'adjust', description: '盘盈入库', icon: 'icon-circle-plus', color: '#67C23A', sort_order: 33, is_system: 1, status: 1 },
  { code: 'adjustment_out', name: '调整出库', category: 'adjust', description: '盘亏出库', icon: 'icon-circle-close', color: '#F56C6C', sort_order: 34, is_system: 1, status: 1 },
  { code: 'initial_import', name: '初始导入', category: 'adjust', description: '期初库存导入', icon: 'icon-upload-filled', color: '#909399', sort_order: 35, is_system: 1, status: 1 },
  { code: 'correction', name: '纠正', category: 'adjust', description: '错误纠正', icon: 'icon-warning', color: '#E6A23C', sort_order: 36, is_system: 1, status: 1 },
  { code: 'other', name: '其他', category: 'adjust', description: '其他调整', icon: 'icon-more', color: '#909399', sort_order: 37, is_system: 1, status: 1 }
];

async function insertBusinessTypes() {
  const connection = await mysql.createConnection({
    ...DATABASE_CONFIG,
    charset: 'utf8mb4'
  });

  try {
    // 清空现有数据
    await connection.execute('DELETE FROM business_types');
    console.log('已清空现有数据');

    // 插入新数据
    const sql = `INSERT INTO business_types (code, name, category, description, icon, color, sort_order, is_system, status) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    
    for (const type of businessTypes) {
      await connection.execute(sql, [
        type.code, type.name, type.category, type.description, 
        type.icon, type.color, type.sort_order, type.is_system, type.status
      ]);
      console.log(`已插入: ${type.name} (${type.code})`);
    }

    console.log(`\n✅ 成功插入 ${businessTypes.length} 条业务类型数据`);

    // 验证数据
    const [rows] = await connection.execute('SELECT id, code, name, category FROM business_types ORDER BY category, sort_order');
    console.log('\n📊 数据验证:');
    rows.forEach(row => {
      console.log(`  ${row.id}. [${row.category}] ${row.name} (${row.code})`);
    });

  } catch (error) {
    console.error('❌ 插入失败:', error);
  } finally {
    await connection.end();
  }
}

insertBusinessTypes();
