/**
 * 扩展 business_types 表为通用系统字典
 * 新增 group_code（字典分组）和 tag_type（标签颜色）字段
 */

exports.up = function(knex) {
  return knex.schema.alterTable('business_types', (table) => {
    table.string('group_code', 50).defaultTo('inventory_transaction').after('category')
      .comment('字典分组标识，如 warehouse_type, order_status 等');
    table.string('tag_type', 20).nullable().after('color')
      .comment('Element Plus 标签颜色类型（success/danger/warning/info/primary）');
    table.index('group_code', 'idx_group_code');
  }).then(() => {
    // 回填已有库存业务类型记录的 group_code
    return knex('business_types')
      .whereNull('group_code')
      .orWhere('group_code', 'inventory_transaction')
      .update({ group_code: 'inventory_transaction' });
  });
};

exports.down = function(knex) {
  return knex.schema.alterTable('business_types', (table) => {
    table.dropIndex('group_code', 'idx_group_code');
    table.dropColumn('tag_type');
    table.dropColumn('group_code');
  });
};
