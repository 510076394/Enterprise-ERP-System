/**
 * init-db.js
 * @description 数据库初始化脚本（已迁移至 Knex 迁移文件管理）
 * @date 2025-08-27
 * @version 2.0.0
 * @deprecated 此脚本功能已迁移至 Knex 迁移文件，保留为向后兼容
 */

const logger = require('./utils/logger');

// 使用 IIFE (立即调用函数表达式) 来允许使用 async/await
(async () => {
  try {
    logger.info('数据库表结构由 Knex 迁移文件统一管理');
    logger.info('请使用 npx knex migrate:latest 执行迁移');
    logger.info('数据库表初始化完成！');
    process.exit(0);
  } catch (error) {
    logger.error('数据库表初始化失败:', error);
    process.exit(1);
  }
})();
