/**
 * 为 purchase_returns 表增加 source_type 字段
 * @description 区分退货单来源，避免下游逻辑通过 receipt_id 是否为空来推测物料状态
 *   - manual: 手动从入库单创建的退货
 *   - ncp_return: NCP不合格品自动创建的退货
 *   - ncp_replacement: NCP换货自动创建的退货
 */

exports.up = async function(knex) {
  // 检查字段是否已存在（幂等性）
  const [columns] = await knex.raw(
    `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = DATABASE() 
       AND TABLE_NAME = 'purchase_returns' 
       AND COLUMN_NAME = 'source_type'`
  );

  if (columns.length === 0) {
    await knex.raw(`
      ALTER TABLE purchase_returns 
      ADD COLUMN source_type VARCHAR(30) DEFAULT 'manual' 
      COMMENT '退货单来源: manual=手动创建, ncp_return=NCP退货, ncp_replacement=NCP换货'
      AFTER receipt_no
    `);

    // 回填历史数据: receipt_id 为 NULL 的退货单大概率来自 NCP 自动创建
    await knex.raw(`
      UPDATE purchase_returns 
      SET source_type = 'ncp_return' 
      WHERE receipt_id IS NULL 
        AND remarks LIKE '%不合格品退货%'
    `);
  }
};

exports.down = async function(knex) {
  const [columns] = await knex.raw(
    `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = DATABASE() 
       AND TABLE_NAME = 'purchase_returns' 
       AND COLUMN_NAME = 'source_type'`
  );

  if (columns.length > 0) {
    await knex.raw('ALTER TABLE purchase_returns DROP COLUMN source_type');
  }
};
