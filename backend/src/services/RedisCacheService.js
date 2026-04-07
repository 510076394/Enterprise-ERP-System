/**
 * Redis缓存服务
 * @description 提供统一的缓存接口，支持降级到内存缓存
 * @date 2025-11-21
 */

const { logger } = require('../utils/logger');

let redis = null;
let NodeCache = null;
let memoryCache = null;

// 是否启用Redis
const REDIS_ENABLED = process.env.REDIS_ENABLED === 'true';

// Redis配置
const REDIS_CONFIG = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  db: parseInt(process.env.REDIS_DB) || 0,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
};

/**
 * 初始化缓存服务
 */
const initializeCache = async () => {
  if (REDIS_ENABLED) {
    try {
      // 尝试加载Redis
      const Redis = require('redis');
      redis = Redis.createClient(REDIS_CONFIG);

      redis.on('error', (err) => {
        logger.error('Redis连接错误:', err);
        logger.info('降级到内存缓存');
        redis = null;
        initMemoryCache();
      });

      redis.on('connect', () => {
        logger.info('✅ Redis连接成功');
      });

      await redis.connect();
      return true;
    } catch (error) {
      logger.warn('Redis不可用，使用内存缓存:', error.message);
      initMemoryCache();
      return false;
    }
  } else {
    logger.info('Redis未启用，使用内存缓存');
    initMemoryCache();
    return false;
  }
};

/**
 * 初始化内存缓存（降级方案）
 */
const initMemoryCache = () => {
  try {
    if (!NodeCache) {
      NodeCache = require('node-cache');
      memoryCache = new NodeCache({
        stdTTL: 600, // 默认10分钟过期
        checkperiod: 120, // 每2分钟检查一次过期项
        useClones: false, // 性能优化
      });
      logger.info('✅ 内存缓存已初始化');
    }
  } catch (error) {
    logger.error('内存缓存初始化失败:', error);
  }
};

/**
 * 获取缓存
 * @param {string} key - 缓存键
 * @returns {Promise<*>} 缓存值
 */
const get = async (key) => {
  try {
    if (redis) {
      const value = await redis.get(key);
      return value ? JSON.parse(value) : null;
    } else if (memoryCache) {
      return memoryCache.get(key) || null;
    }
    return null;
  } catch (error) {
    logger.error(`获取缓存失败 [${key}]:`, error);
    return null;
  }
};

/**
 * 设置缓存
 * @param {string} key - 缓存键
 * @param {*} value - 缓存值
 * @param {number} ttl - 过期时间（秒），默认600秒
 * @returns {Promise<boolean>} 是否成功
 */
const set = async (key, value, ttl = 600) => {
  try {
    if (redis) {
      await redis.setEx(key, ttl, JSON.stringify(value));
      return true;
    } else if (memoryCache) {
      memoryCache.set(key, value, ttl);
      return true;
    }
    return false;
  } catch (error) {
    logger.error(`设置缓存失败 [${key}]:`, error);
    return false;
  }
};

/**
 * 删除缓存
 * @param {string} key - 缓存键
 * @returns {Promise<boolean>} 是否成功
 */
const del = async (key) => {
  try {
    if (redis) {
      await redis.del(key);
      return true;
    } else if (memoryCache) {
      memoryCache.del(key);
      return true;
    }
    return false;
  } catch (error) {
    logger.error(`删除缓存失败 [${key}]:`, error);
    return false;
  }
};

/**
 * 批量删除缓存（支持模式匹配）
 * @param {string} pattern - 缓存键模式（如 'user:*'）
 * @returns {Promise<number>} 删除的键数量
 */
const delPattern = async (pattern) => {
  try {
    if (redis) {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(keys);
        return keys.length;
      }
      return 0;
    } else if (memoryCache) {
      const keys = memoryCache.keys();
      const regex = new RegExp(pattern.replace('*', '.*'));
      let count = 0;

      for (const key of keys) {
        if (regex.test(key)) {
          memoryCache.del(key);
          count++;
        }
      }
      return count;
    }
    return 0;
  } catch (error) {
    logger.error(`批量删除缓存失败 [${pattern}]:`, error);
    return 0;
  }
};

/**
 * 检查缓存是否存在
 * @param {string} key - 缓存键
 * @returns {Promise<boolean>} 是否存在
 */
const exists = async (key) => {
  try {
    if (redis) {
      return (await redis.exists(key)) === 1;
    } else if (memoryCache) {
      return memoryCache.has(key);
    }
    return false;
  } catch (error) {
    logger.error(`检查缓存存在失败 [${key}]:`, error);
    return false;
  }
};

/**
 * 设置缓存过期时间
 * @param {string} key - 缓存键
 * @param {number} ttl - 过期时间（秒）
 * @returns {Promise<boolean>} 是否成功
 */
const expire = async (key, ttl) => {
  try {
    if (redis) {
      await redis.expire(key, ttl);
      return true;
    } else if (memoryCache) {
      memoryCache.ttl(key, ttl);
      return true;
    }
    return false;
  } catch (error) {
    logger.error(`设置缓存过期时间失败 [${key}]:`, error);
    return false;
  }
};

/**
 * 清空所有缓存
 * @returns {Promise<boolean>} 是否成功
 */
const flushAll = async () => {
  try {
    if (redis) {
      await redis.flushDb();
      return true;
    } else if (memoryCache) {
      memoryCache.flushAll();
      return true;
    }
    return false;
  } catch (error) {
    logger.error('清空缓存失败:', error);
    return false;
  }
};

/**
 * 获取缓存统计信息
 * @returns {Promise<Object>} 统计信息
 */
const getStats = async () => {
  try {
    if (redis) {
      const info = await redis.info('stats');
      return {
        type: 'redis',
        connected: redis.isReady,
        info,
      };
    } else if (memoryCache) {
      const stats = memoryCache.getStats();
      return {
        type: 'memory',
        keys: stats.keys,
        hits: stats.hits,
        misses: stats.misses,
        ksize: stats.ksize,
        vsize: stats.vsize,
      };
    }
    return { type: 'none' };
  } catch (error) {
    logger.error('获取缓存统计信息失败:', error);
    return { type: 'error', error: error.message };
  }
};

/**
 * 缓存装饰器 - 自动缓存函数结果
 * @param {string} keyPrefix - 缓存键前缀
 * @param {number} ttl - 过期时间（秒）
 * @returns {Function} 装饰器函数
 */
const cacheDecorator = (keyPrefix, ttl = 600) => {
  return (target, propertyKey, descriptor) => {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args) {
      const cacheKey = `${keyPrefix}:${JSON.stringify(args)}`;

      // 尝试从缓存获取
      const cached = await get(cacheKey);
      if (cached !== null) {
        logger.debug(`缓存命中: ${cacheKey}`);
        return cached;
      }

      // 执行原函数
      const result = await originalMethod.apply(this, args);

      // 保存到缓存
      await set(cacheKey, result, ttl);

      return result;
    };

    return descriptor;
  };
};

// 启动时初始化缓存
initializeCache().catch((error) => {
  logger.error('缓存初始化失败:', error);
});

module.exports = {
  get,
  set,
  del,
  delPattern,
  exists,
  expire,
  flushAll,
  getStats,
  cacheDecorator,

  // 工具方法
  isRedisEnabled: () => REDIS_ENABLED && redis !== null,
  getClient: () => redis || memoryCache,
};
