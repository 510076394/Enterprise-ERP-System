/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  // 建立全系统级操作日志操作台
  await knex.schema.createTable('sys_audit_logs', (table) => {
    table.increments('id').primary();
    
    // 操作信息
    table.string('operator_id', 50).notNullable().comment('操作员ID');
    table.string('operator_name', 100).notNullable().comment('操作员姓名');
    
    // 动作信息
    table.string('action', 50).notNullable().comment('操作行为(CREATE/UPDATE/DELETE/APPROVE等)');
    table.string('module', 50).notNullable().comment('模块名称(如 purchase, sales, inventory)');
    table.string('target_table', 100).notNullable().comment('目标表名');
    table.string('target_id', 100).notNullable().comment('目标主键ID');
    table.string('target_no', 100).nullable().comment('目标业务单号(可选)');
    
    // 负荷数据 (用于倒查和比对)
    table.json('old_payload').nullable().comment('变更前的原始数据');
    table.json('new_payload').nullable().comment('变更后的新数据');
    
    // 环境上下文
    table.string('ip_address', 50).nullable();
    table.text('user_agent').nullable();
    table.text('remarks').nullable().comment('操作说明或原因');
    
    table.timestamp('created_at').defaultTo(knex.fn.now());
    
    // 建立索引有助于日志追踪查询
    table.index(['action']);
    table.index(['module']);
    table.index(['target_table', 'target_id']);
    table.index(['operator_id']);
    table.index(['created_at']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  await knex.schema.dropTableIfExists('sys_audit_logs');
};
