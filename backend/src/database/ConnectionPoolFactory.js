/**
 * ConnectionPoolFactory.js
 * @description 连接池工厂 - 管理所有 mysql2 连接池的创建和生命周期
 */

const mysql = require('mysql2/promise');
const { logger } = require('../utils/logger');
const EventEmitter = require('events');

/**
 * 连接池管理器
 */
class PoolManager extends EventEmitter {
  constructor(name, pool, options = {}) {
    super();
    this.name = name;
    this.pool = pool;
    this.options = options;
    this.healthCheckTimer = null;
    this.failedChecks = 0;
    this.started = false;
  }

  async start() {
    if (this.started) return;
    this.started = true;

    // 启动健康检查
    if (this.options.healthCheckInterval) {
      this.healthCheckTimer = setInterval(
        () => this._healthCheck(),
        this.options.healthCheckInterval
      );
      // 不阻塞启动的首次健康检查
      this._healthCheck().catch(() => {});
    }

    // 预热连接
    if (this.options.warmupEnabled && this.options.warmupConnections > 0) {
      await this._warmup();
    }

    logger.info(`[PoolManager] 连接池 "${this.name}" 管理器已启动`);
  }

  async _healthCheck() {
    try {
      const conn = await this.pool.getConnection();
      await conn.ping();
      conn.release();
      this.failedChecks = 0;
    } catch (error) {
      this.failedChecks++;
      if (this.failedChecks >= 3) {
        this.emit('health:critical', { failedCount: this.failedChecks });
      }
    }
  }

  async _warmup() {
    const count = this.options.warmupConnections || 2;
    const conns = [];
    try {
      for (let i = 0; i < count; i++) {
        const conn = await this.pool.getConnection();
        conns.push(conn);
      }
    } catch (error) {
      logger.warn(`[PoolManager] 预热连接失败: ${error.message}`);
    } finally {
      for (const conn of conns) {
        try { conn.release(); } catch (_) {}
      }
    }
  }

  async close() {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
      this.healthCheckTimer = null;
    }
    this.started = false;
    await this.pool.end();
    logger.info(`[PoolManager] 连接池 "${this.name}" 已关闭`);
  }
}

/**
 * 连接池工厂
 */
class ConnectionPoolFactory {
  constructor() {
    this.pools = new Map();
  }

  /**
   * 创建连接池
   * @param {string} name - 连接池名称
   * @param {object} poolConfig - mysql2 连接池配置
   * @param {object} managerOptions - 管理器配置
   */
  createPool(name, poolConfig, managerOptions = {}) {
    if (this.pools.has(name)) {
      const existing = this.pools.get(name);
      return { pool: existing.pool, manager: existing.manager };
    }

    const pool = mysql.createPool(poolConfig);

    pool.on('connection', (connection) => {
      if (process.env.NODE_ENV === 'development') {
        logger.debug(`[DB] 新连接已建立 (池: ${name}, ID: ${connection.threadId})`);
      }
    });

    const manager = new PoolManager(name, pool, managerOptions);
    this.pools.set(name, { pool, manager });

    return { pool, manager };
  }

  /**
   * 关闭所有连接池
   */
  async closeAll() {
    const closePromises = [];
    for (const [, { manager }] of this.pools) {
      closePromises.push(manager.close());
    }
    await Promise.allSettled(closePromises);
    this.pools.clear();
  }

  /**
   * 获取指定连接池
   */
  getPool(name) {
    const entry = this.pools.get(name);
    return entry ? entry.pool : null;
  }
}

// 导出单例工厂
module.exports = new ConnectionPoolFactory();
