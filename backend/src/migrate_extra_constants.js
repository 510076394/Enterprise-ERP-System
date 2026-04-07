require('dotenv').config();
const mysql = require('mysql2/promise');

const dbConfig = {
  host: process.env.DB_HOST || '192.168.1.251',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'mes',
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306
};

// 漏掉的其他常量字典
const extraGroups = [
  // =========== purchaseConstants.js ===========
  {
    group_code: 'requisition_status',
    options: { 'draft': '草稿', 'submitted': '已提交', 'approved': '已批准', 'rejected': '已拒绝', 'completed': '已完成' },
    tags: { 'draft': 'info', 'submitted': 'primary', 'approved': 'success', 'rejected': 'danger', 'completed': 'success' }
  },
  {
    group_code: 'receipt_status', // 对应 RECEIPT_STATUS
    options: { 'draft': '草稿', 'confirmed': '已确认', 'completed': '已完成', 'cancelled': '已取消' },
    tags: { 'draft': 'info', 'confirmed': 'primary', 'completed': 'success', 'cancelled': 'info' }
  },
  // =========== communication.js ===========
  {
    group_code: 'communication_category',
    options: { 'update': '更新日志', 'guide': '操作指南', 'specification': '技术规范', 'announcement': '公告' },
    tags: { 'update': 'primary', 'guide': 'success', 'specification': 'warning', 'announcement': 'danger' }
  },
  {
    group_code: 'communication_status',
    options: { 'published': '已发布', 'draft': '草稿', 'archived': '已归档' },
    tags: { 'published': 'success', 'draft': 'info', 'archived': 'warning' }
  },
  {
    group_code: 'visibility_option',
    options: { 'public': '公开（所有人可见）', 'private': '私有（仅抄送人可见）' },
    tags: { 'public': 'success', 'private': 'warning' }
  },
  // =========== printConstants.js ===========
  {
    group_code: 'print_paper_size',
    options: { 'A4': 'A4', 'A5': 'A5', 'A3': 'A3', 'Letter': 'Letter', 'Legal': 'Legal' }
  },
  {
    group_code: 'print_orientation',
    options: { 'portrait': '纵向', 'landscape': '横向' }
  },
  {
    group_code: 'print_module',
    options: { 'sales': '销售管理', 'purchase': '采购管理', 'inventory': '库存管理', 'production': '生产管理', 'quality': '质量管理', 'finance': '财务管理' }
  },
  {
    group_code: 'print_template_type',
    options: { 'sales_order': '销售订单', 'purchase_order': '采购订单', 'inbound': '入库单', 'outbound': '出库单', 'invoice': '销售发票' } // 简略处理，部分代表即可
  },
  // =========== Vue 组件内的硬编码 ===========
  {
    group_code: 'delivery_status',
    options: { 'shipped': '已发货', 'partial': '部分发货', 'unshipped': '未发货' },
    tags: { 'shipped': 'success', 'partial': 'warning', 'unshipped': 'info' }
  },
  {
    group_code: 'rework_status',
    options: { 'pending': '待处理', 'in_progress': '进行中', 'completed': '已完成', 'cancelled': '已取消' },
    tags: { 'pending': 'info', 'in_progress': 'warning', 'completed': 'success', 'cancelled': 'danger' }
  },
  {
    group_code: 'replacement_status',
    options: { 'pending': '待收货', 'partial': '部分收货', 'completed': '已完成', 'cancelled': '已取消' },
    tags: { 'pending': 'info', 'partial': 'warning', 'completed': 'success', 'cancelled': 'danger' }
  },
  {
    group_code: 'supplier_quality_grade',
    options: { 'A': 'A 级 (优秀)', 'B': 'B 级 (良好)', 'C': 'C 级 (一般)', 'D': 'D 级 (不合格)' },
    tags: { 'A': 'success', 'B': 'primary', 'C': 'warning', 'D': 'danger' }
  },
  {
    group_code: 'scrap_status',
    options: { 'pending': '待审批', 'approved': '已审批', 'completed': '已完成' },
    tags: { 'pending': 'warning', 'approved': 'primary', 'completed': 'success' }
  },
  {
    group_code: 'budget_type',
    options: { '年度预算': '年度预算', '季度预算': '季度预算', '月度预算': '月度预算', '项目预算': '项目预算' }
  },
  {
    group_code: 'budget_status',
    options: { 'draft': '草稿', 'pending_approval': '待审批', 'approved': '已审批', 'executing': '执行中', 'completed': '已完成', 'closed': '已关闭' },
    tags: { 'draft': 'info', 'pending_approval': 'warning', 'approved': 'primary', 'executing': 'success', 'completed': 'success', 'closed': 'info' }
  },
  {
    group_code: 'bank_account_status',
    options: { 'normal': '正常', 'frozen': '冻结', 'closed': '已注销' },
    tags: { 'normal': 'success', 'frozen': 'warning', 'closed': 'danger' }
  },
  {
    group_code: 'currency_type',
    options: { 'CNY': '人民币', 'USD': '美元', 'EUR': '欧元', 'JPY': '日元', 'GBP': '英镑' }
  },
  {
    group_code: 'cash_transaction_category',
    options: { 'income': '收入', 'expense': '支出' }
  },
  {
    group_code: 'tax_invoice_type',
    options: { 'input': '进项', 'output': '销项' }
  },
  {
    group_code: 'tax_invoice_status',
    options: { 'uncertified': '未认证', 'certified': '已认证', 'deducted': '已抵扣', 'void': '已作废' }
  }
];

async function run() {
  const connection = await mysql.createConnection(dbConfig);
  try {
    console.log('开始插入额外字典项...');
    for (const group of extraGroups) {
      let sortOrder = 10;
      for (const [code, name] of Object.entries(group.options)) {
        if (!code) continue;
        const tagType = (group.tags && group.tags[code]) ? group.tags[code] : 'info';
        
        try {
          await connection.query(
            `INSERT INTO business_types (code, name, description, is_system, status, sort_order, group_code, tag_type)
             VALUES (?, ?, ?, 1, 1, ?, ?, ?)
             ON DUPLICATE KEY UPDATE name=VALUES(name), tag_type=VALUES(tag_type), sort_order=VALUES(sort_order)`,
            [code, name, '由系统自动注入', sortOrder, group.group_code, tagType]
          );
          sortOrder += 10;
        } catch(err) {
          console.error(`插入失败 ${group.group_code} - ${code}: `, err.message);
        }
      }
      console.log(`✅ ${group.group_code} 项数: ${Object.keys(group.options).length}`);
    }
    console.log('🎉 所有额外遗漏的字典入库完毕！');
  } finally {
    await connection.end();
  }
}

run();
