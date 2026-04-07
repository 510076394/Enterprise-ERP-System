/**
 * DBManager.js
 * @description 数据库管理器 - 提供统一的数据库健康监控和指标收集
 */

const { logger } = require('../utils/logger');

class DBManager {
  constructor(poolName) {
    this.poolName = poolName;
    this.initialized = false;
  }

  /**
   * 初始化数据库管理器
   */
  initialize() {
    if (this.initialized) return;
    this.initialized = true;
    logger.info(`[DBManager] 数据库管理器 "${this.poolName}" 已初始化`);
  }

  /**
   * 获取管理器状态
   */
  getStatus() {
    return {
      poolName: this.poolName,
      initialized: this.initialized,
    };
  }
}

module.exports = { DBManager };
