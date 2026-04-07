const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

const frontendConstantsPath = path.join(__dirname, '../../frontend/src/constants/systemConstants.js');
const tempPath = path.join(__dirname, 'tempConstants.js');

// 1. 读取并转换前端 ES Module 为 CommonJS
if (!fs.existsSync(frontendConstantsPath)) {
  console.error(`未找到前端常量文件: ${frontendConstantsPath}`);
  process.exit(1);
}

let content = fs.readFileSync(frontendConstantsPath, 'utf8');
content = content.replace(/export const /g, 'const ');
content = content.replace(/export default /g, 'module.exports = ');

fs.writeFileSync(tempPath, content);

let constants;
try {
  constants = require('./tempConstants.js');
} catch (e) {
  console.error('解析 constants 文件失败', e);
  process.exit(1);
}

const dbConfig = {
  host: process.env.DB_HOST || '192.168.1.251',
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'mes'
};

const mapGroup = (groupCode, mapObj, colorObj = {}) => {
  if (!mapObj) return [];
  return Object.keys(mapObj).map((key, index) => {
    // 过滤掉中文 Key（这些通常是为了兼容后端的副本）
    if (/[\u4e00-\u9fa5]/.test(key)) {
      return null;
    }
    return {
      group_code: groupCode,
      code: key,
      name: mapObj[key],
      tag_type: colorObj[key] || 'info', // 默认颜色 info
      category: null, // 全局字典其他类型不使用 category
      sort_order: index + 1
    };
  }).filter(Boolean);
};

async function run() {
  console.log('正在连接数据库迁移数据...');
  const connection = await mysql.createConnection(dbConfig);
  try {
    const allData = [
      ...mapGroup('warehouse_type', constants.WAREHOUSE_TYPES, constants.WAREHOUSE_TYPE_COLORS),
      ...mapGroup('inventory_status', constants.INVENTORY_STATUS, constants.INVENTORY_STATUS_COLORS),
      ...mapGroup('inventory_check_status', constants.INVENTORY_CHECK_STATUS, constants.INVENTORY_CHECK_STATUS_COLORS),
      ...mapGroup('inbound_outbound_status', constants.INBOUND_OUTBOUND_STATUS, constants.INBOUND_OUTBOUND_STATUS_COLORS),
      ...mapGroup('transfer_status', constants.TRANSFER_STATUS, constants.TRANSFER_STATUS_COLORS),
      ...mapGroup('order_status', constants.ORDER_STATUS, constants.ORDER_STATUS_COLORS),
      ...mapGroup('purchase_status', constants.PURCHASE_STATUS, constants.PURCHASE_STATUS_COLORS),
      ...mapGroup('purchase_receipt_status', constants.PURCHASE_RECEIPT_STATUS, constants.PURCHASE_RECEIPT_STATUS_COLORS),
      ...mapGroup('purchase_return_status', constants.PURCHASE_RETURN_STATUS, constants.PURCHASE_RETURN_STATUS_COLORS),
      ...mapGroup('sales_status', constants.SALES_STATUS, constants.SALES_STATUS_COLORS),
      ...mapGroup('sales_quotation_status', constants.SALES_QUOTATION_STATUS, constants.SALES_QUOTATION_STATUS_COLORS),
      ...mapGroup('outsourced_status', constants.OUTSOURCED_STATUS, constants.OUTSOURCED_STATUS_COLORS),
      ...mapGroup('quality_status', constants.QUALITY_STATUS, constants.QUALITY_STATUS_COLORS),
      ...mapGroup('quality_inspection_type', constants.QUALITY_INSPECTION_TYPES, {}),
      ...mapGroup('first_article_result', constants.FIRST_ARTICLE_RESULT, constants.FIRST_ARTICLE_RESULT_COLORS),
      ...mapGroup('production_status', constants.PRODUCTION_STATUS, constants.PRODUCTION_STATUS_COLORS),
      ...mapGroup('equipment_status', constants.EQUIPMENT_STATUS, constants.EQUIPMENT_STATUS_COLORS),
      ...mapGroup('common_status', constants.COMMON_STATUS, constants.COMMON_STATUS_COLORS),
      ...mapGroup('finance_transaction_type', constants.FINANCE_TRANSACTION_TYPES, constants.FINANCE_TRANSACTION_COLORS),
      ...mapGroup('costing_method', constants.COSTING_METHOD, {}),
      ...mapGroup('gl_transaction_type', constants.GL_TRANSACTION_TYPES, constants.GL_TRANSACTION_COLORS),
      ...mapGroup('priority_level', constants.PRIORITY_LEVELS, constants.PRIORITY_COLORS),
      ...mapGroup('approval_status', constants.APPROVAL_STATUS, constants.APPROVAL_STATUS_COLORS),
      ...mapGroup('user_status', constants.USER_STATUS, constants.USER_STATUS_COLORS),
      ...mapGroup('asset_status', constants.ASSET_STATUS, constants.ASSET_STATUS_COLORS),
      ...mapGroup('asset_type', constants.ASSET_TYPES, {})
    ];

    console.log(`准备插入 ${allData.length} 条业务常量数据`);

    // 1. 先更新已经存在的 `inventory_transaction` 分组的 tag_type
    const inventoryColors = constants.INVENTORY_TRANSACTION_COLORS || {};
    for (const [code, color] of Object.entries(inventoryColors)) {
      if (!/[\u4e00-\u9fa5]/.test(code)) {
        await connection.execute(
          'UPDATE business_types SET tag_type = ? WHERE code = ? AND group_code = "inventory_transaction"',
          [color, code]
        );
      }
    }

    let inserted = 0;
    let updated = 0;

    // 2. 插入或更新所有的字典数据
    for (const item of allData) {
      const [rows] = await connection.execute(
        'SELECT id FROM business_types WHERE group_code = ? AND code = ?',
        [item.group_code, item.code]
      );

      if (rows.length === 0) {
        await connection.execute(
          'INSERT INTO business_types (group_code, code, name, category, tag_type, sort_order, is_system, status) VALUES (?, ?, ?, ?, ?, ?, 1, 1)',
          [item.group_code, item.code, item.name, item.category, item.tag_type, item.sort_order]
        );
        inserted++;
      } else {
        await connection.execute(
           'UPDATE business_types SET name = ?, tag_type = ? WHERE id = ?',
           [item.name, item.tag_type, rows[0].id]
        );
        updated++;
      }
    }

    console.log(`✅ 数据迁移完成！`);
    console.log(`- 新增记录: ${inserted} 条`);
    console.log(`- 更新记录: ${updated} 条`);
  } catch (err) {
    console.error('❌ 迁移失败:', err);
  } finally {
    await connection.end();
    if (fs.existsSync(tempPath)) {
      fs.unlinkSync(tempPath);
    }
  }
}
run();
