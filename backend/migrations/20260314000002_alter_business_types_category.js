/**
 * 更新 business_types 表的 category 字段
 * 原来是 ENUM('in', 'out', 'transfer', 'adjust') 且 NOT NULL，
 * 现因为用于存储其他所有字典类型，需改为 VARCHAR(50) 并且允许为空
 */

exports.up = function(knex) {
  return knex.schema.alterTable('business_types', (table) => {
    table.string('category', 50).nullable().alter();
  });
};

exports.down = function(knex) {
  return knex.schema.alterTable('business_types', (table) => {
    // 降级可能会报截断错误，忽略
    table.specificType('category', "enum('in','out','transfer','adjust')").notNullable().alter();
  });
};
