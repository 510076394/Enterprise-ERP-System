/**
 * 更新 business_types 表的唯一键约束
 * 原表对 code 设置了唯一键（uk_code）
 * 现在作为全局字典表，不同分组（group_code）下可能会有相同的 code
 * 如 draft, completed, other 等，因此将唯一键修改为 (group_code, code)
 */

exports.up = function(knex) {
  return knex.schema.alterTable('business_types', (table) => {
    // 移除原有唯一键
    table.dropUnique('code', 'uk_code');
    // 增加新的联合唯一键
    table.unique(['group_code', 'code'], 'uk_group_code');
  });
};

exports.down = function(knex) {
  return knex.schema.alterTable('business_types', (table) => {
    table.dropUnique(['group_code', 'code'], 'uk_group_code');
    // 注意：如果有重复由于数据存在，这一步可能会失败
    table.unique('code', 'uk_code');
  });
};
