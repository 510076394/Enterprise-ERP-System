/**
 * 二期补充迁移 - 运行时 ALTER TABLE 列收归
 * @description 将散落在业务代码中运行时动态添加的列统一收归到迁移文件
 * 注意：使用 information_schema 检查幂等，对已有列无副作用
 */

// 辅助函数：检查列是否存在
async function columnExists(knex, tableName, columnName) {
  const [rows] = await knex.raw(
    `SELECT COUNT(*) as cnt FROM information_schema.columns
     WHERE table_schema = DATABASE() AND table_name = ? AND column_name = ?`,
    [tableName, columnName]
  );
  return rows[0].cnt > 0;
}

// 辅助函数：安全添加列
async function addColumnIfNotExists(knex, tableName, columnName, columnDef) {
  if (!(await columnExists(knex, tableName, columnName))) {
    await knex.raw(`ALTER TABLE \`${tableName}\` ADD COLUMN ${columnDef}`);
  }
}

// 辅助函数：安全添加索引
async function addIndexIfNotExists(knex, tableName, indexName, indexDef) {
  const [rows] = await knex.raw(
    `SELECT COUNT(*) as cnt FROM information_schema.statistics
     WHERE table_schema = DATABASE() AND table_name = ? AND index_name = ?`,
    [tableName, indexName]
  );
  if (rows[0].cnt === 0) {
    await knex.raw(`ALTER TABLE \`${tableName}\` ADD ${indexDef}`);
  }
}

exports.up = async function(knex) {
  // ===== expenses 表 - 钉钉审批字段（来源：expense.js addDingtalkFields） =====
  await addColumnIfNotExists(knex, 'expenses', 'dingtalk_instance_id',
    "dingtalk_instance_id VARCHAR(100) DEFAULT NULL COMMENT '钉钉审批实例ID'");
  await addColumnIfNotExists(knex, 'expenses', 'dingtalk_status',
    "dingtalk_status VARCHAR(50) DEFAULT NULL COMMENT '钉钉审批状态'");
  await addColumnIfNotExists(knex, 'expenses', 'dingtalk_result',
    "dingtalk_result VARCHAR(50) DEFAULT NULL COMMENT '钉钉审批结果'");
  await addColumnIfNotExists(knex, 'expenses', 'dingtalk_submit_time',
    "dingtalk_submit_time DATETIME DEFAULT NULL COMMENT '提交钉钉时间'");
  await addIndexIfNotExists(knex, 'expenses', 'idx_dingtalk_instance',
    "INDEX idx_dingtalk_instance (dingtalk_instance_id)");

  // ===== bank_transactions 表 - 审核字段（来源：Transaction.js submitForAudit） =====
  await addColumnIfNotExists(knex, 'bank_transactions', 'status',
    "status VARCHAR(20) DEFAULT 'draft' COMMENT '审核状态'");
  await addColumnIfNotExists(knex, 'bank_transactions', 'approved_by',
    "approved_by INT DEFAULT NULL COMMENT '审核人ID'");
  await addColumnIfNotExists(knex, 'bank_transactions', 'approved_at',
    "approved_at DATETIME DEFAULT NULL COMMENT '审核时间'");
  await addColumnIfNotExists(knex, 'bank_transactions', 'reject_reason',
    "reject_reason VARCHAR(255) DEFAULT NULL COMMENT '拒绝原因'");
  await addColumnIfNotExists(knex, 'bank_transactions', 'category',
    "category VARCHAR(50) DEFAULT NULL COMMENT '交易分类'");
  await addColumnIfNotExists(knex, 'bank_transactions', 'payment_method',
    "payment_method VARCHAR(50) DEFAULT NULL COMMENT '支付方式'");
  await addColumnIfNotExists(knex, 'bank_transactions', 'related_invoice_id',
    "related_invoice_id INT DEFAULT NULL COMMENT '关联发票ID'");
  await addColumnIfNotExists(knex, 'bank_transactions', 'related_invoice_type',
    "related_invoice_type VARCHAR(10) DEFAULT NULL COMMENT '关联发票类型(AR/AP)'");

  // ===== cash_transactions 表 - 状态字段（来源：CashTransaction.js submitForAudit） =====
  await addColumnIfNotExists(knex, 'cash_transactions', 'status',
    "status VARCHAR(20) DEFAULT 'draft' COMMENT '审核状态'");

  // ===== outsourced_processings 表 - 仓库字段（来源：processingController.js） =====
  await addColumnIfNotExists(knex, 'outsourced_processings', 'location_id',
    "location_id INT DEFAULT NULL COMMENT '仓库ID'");
  await addColumnIfNotExists(knex, 'outsourced_processings', 'warehouse_name',
    "warehouse_name VARCHAR(100) DEFAULT NULL COMMENT '仓库名称'");

  // ===== outsourced_processing_receipts 表 - location_id 字段 =====
  await addColumnIfNotExists(knex, 'outsourced_processing_receipts', 'location_id',
    "location_id INT DEFAULT NULL COMMENT '仓库位置ID'");

  // ===== sales_exchange_items 表 - 结构变更（来源：salesController.js） =====
  await addColumnIfNotExists(knex, 'sales_exchange_items', 'item_type',
    "item_type ENUM('return', 'new') NOT NULL DEFAULT 'return' COMMENT '商品类型：return=退回商品，new=换出商品' AFTER exchange_id");
};

exports.down = async function(knex) {
  // 仅删除本次新增的列，不影响已有数据
  const columnsToDrop = [
    ['expenses', 'dingtalk_instance_id'],
    ['expenses', 'dingtalk_status'],
    ['expenses', 'dingtalk_result'],
    ['expenses', 'dingtalk_submit_time'],
    ['bank_transactions', 'status'],
    ['bank_transactions', 'approved_by'],
    ['bank_transactions', 'approved_at'],
    ['bank_transactions', 'reject_reason'],
    ['bank_transactions', 'category'],
    ['bank_transactions', 'payment_method'],
    ['bank_transactions', 'related_invoice_id'],
    ['bank_transactions', 'related_invoice_type'],
    ['cash_transactions', 'status'],
    ['outsourced_processings', 'location_id'],
    ['outsourced_processings', 'warehouse_name'],
    ['outsourced_processing_receipts', 'location_id'],
    ['sales_exchange_items', 'item_type'],
  ];

  for (const [table, column] of columnsToDrop) {
    if (await columnExists(knex, table, column)) {
      await knex.raw(`ALTER TABLE \`${table}\` DROP COLUMN \`${column}\``);
    }
  }
};
