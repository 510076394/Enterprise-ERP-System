/**
 * 添加生产相关的进度字段 
 */

exports.up = async function (knex) {
  const hasTaskProgress = await knex.schema.hasColumn('production_tasks', 'progress');
  if (!hasTaskProgress) {
    await knex.schema.alterTable('production_tasks', (table) => {
      table.integer('progress').defaultTo(0).comment('生产任务进度百分比(0-100)');
    });
  }

  const hasProcessProgress = await knex.schema.hasColumn('production_processes', 'progress');
  if (!hasProcessProgress) {
    await knex.schema.alterTable('production_processes', (table) => {
      table.integer('progress').defaultTo(0).comment('工序进度百分比(0-100)');
    });
  }
};

exports.down = async function (knex) {
  const hasTaskProgress = await knex.schema.hasColumn('production_tasks', 'progress');
  if (hasTaskProgress) {
    await knex.schema.alterTable('production_tasks', (table) => {
      table.dropColumn('progress');
    });
  }

  const hasProcessProgress = await knex.schema.hasColumn('production_processes', 'progress');
  if (hasProcessProgress) {
    await knex.schema.alterTable('production_processes', (table) => {
      table.dropColumn('progress');
    });
  }
};
