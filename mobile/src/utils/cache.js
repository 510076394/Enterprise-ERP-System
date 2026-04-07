/**
 * 缓存管理工具
 */

class CacheManager {
  constructor() {
    this.memoryCache = new Map();
    this.storagePrefix = 'erp_mobile_';
    this.defaultTTL = 5 * 60 * 1000; // 5分钟默认过期时间
  }

  /**
   * 内存缓存
   */
  
  // 设置内存缓存
  setMemory(key, value, ttl = this.defaultTTL) {
    const expireTime = Date.now() + ttl;
    this.memoryCache.set(key, {
      value,
      expireTime,
      accessCount: 0,
      lastAccess: Date.now()
    });
    
    // 定期清理过期缓存
    this.scheduleCleanup();
  }

  // 获取内存缓存
  getMemory(key) {
    const item = this.memoryCache.get(key);
    
    if (!item) {
      return null;
    }
    
    // 检查是否过期
    if (Date.now() > item.expireTime) {
      this.memoryCache.delete(key);
      return null;
    }
    
    // 更新访问信息
    item.accessCount++;
    item.lastAccess = Date.now();
    
    return item.value;
  }

  // 删除内存缓存
  deleteMemory(key) {
    return this.memoryCache.delete(key);
  }

  // 清空内存缓存
  clearMemory() {
    this.memoryCache.clear();
  }

  /**
   * 本地存储缓存
   */
  
  // 设置本地存储缓存
  setStorage(key, value, ttl = this.defaultTTL) {
    try {
      const item = {
        value,
        expireTime: Date.now() + ttl,
        timestamp: Date.now()
      };
      
      localStorage.setItem(
        this.storagePrefix + key, 
        JSON.stringify(item)
      );
      
      return true;
    } catch (error) {
      console.error('Failed to set storage cache:', error);
      return false;
    }
  }

  // 获取本地存储缓存
  getStorage(key) {
    try {
      const itemStr = localStorage.getItem(this.storagePrefix + key);
      
      if (!itemStr) {
        return null;
      }
      
      const item = JSON.parse(itemStr);
      
      // 检查是否过期
      if (Date.now() > item.expireTime) {
        this.deleteStorage(key);
        return null;
      }
      
      return item.value;
    } catch (error) {
      console.error('Failed to get storage cache:', error);
      return null;
    }
  }

  // 删除本地存储缓存
  deleteStorage(key) {
    try {
      localStorage.removeItem(this.storagePrefix + key);
      return true;
    } catch (error) {
      console.error('Failed to delete storage cache:', error);
      return false;
    }
  }

  // 清空本地存储缓存
  clearStorage() {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.storagePrefix)) {
          localStorage.removeItem(key);
        }
      });
      return true;
    } catch (error) {
      console.error('Failed to clear storage cache:', error);
      return false;
    }
  }

  /**
   * 会话存储缓存
   */
  
  // 设置会话存储缓存
  setSession(key, value) {
    try {
      const item = {
        value,
        timestamp: Date.now()
      };
      
      sessionStorage.setItem(
        this.storagePrefix + key, 
        JSON.stringify(item)
      );
      
      return true;
    } catch (error) {
      console.error('Failed to set session cache:', error);
      return false;
    }
  }

  // 获取会话存储缓存
  getSession(key) {
    try {
      const itemStr = sessionStorage.getItem(this.storagePrefix + key);
      
      if (!itemStr) {
        return null;
      }
      
      const item = JSON.parse(itemStr);
      return item.value;
    } catch (error) {
      console.error('Failed to get session cache:', error);
      return null;
    }
  }

  // 删除会话存储缓存
  deleteSession(key) {
    try {
      sessionStorage.removeItem(this.storagePrefix + key);
      return true;
    } catch (error) {
      console.error('Failed to delete session cache:', error);
      return false;
    }
  }

  // 清空会话存储缓存
  clearSession() {
    try {
      const keys = Object.keys(sessionStorage);
      keys.forEach(key => {
        if (key.startsWith(this.storagePrefix)) {
          sessionStorage.removeItem(key);
        }
      });
      return true;
    } catch (error) {
      console.error('Failed to clear session cache:', error);
      return false;
    }
  }

  /**
   * 智能缓存策略
   */
  
  // 智能设置缓存（根据数据类型选择缓存方式）
  set(key, value, options = {}) {
    const {
      type = 'auto', // auto, memory, storage, session
      ttl = this.defaultTTL,
      priority = 'normal' // low, normal, high
    } = options;

    let cacheType = type;
    
    // 自动选择缓存类型
    if (type === 'auto') {
      const dataSize = JSON.stringify(value).length;
      
      if (dataSize < 1024) { // 小于1KB使用内存缓存
        cacheType = 'memory';
      } else if (dataSize < 1024 * 100) { // 小于100KB使用本地存储
        cacheType = 'storage';
      } else { // 大数据使用会话存储
        cacheType = 'session';
      }
    }
    
    // 根据优先级调整TTL
    let adjustedTTL = ttl;
    if (priority === 'high') {
      adjustedTTL = ttl * 2;
    } else if (priority === 'low') {
      adjustedTTL = ttl * 0.5;
    }
    
    switch (cacheType) {
      case 'memory':
        return this.setMemory(key, value, adjustedTTL);
      case 'storage':
        return this.setStorage(key, value, adjustedTTL);
      case 'session':
        return this.setSession(key, value);
      default:
        return false;
    }
  }

  // 智能获取缓存
  get(key) {
    // 按优先级查找：内存 -> 会话 -> 本地存储
    let value = this.getMemory(key);
    if (value !== null) {
      return value;
    }
    
    value = this.getSession(key);
    if (value !== null) {
      // 提升到内存缓存
      this.setMemory(key, value, this.defaultTTL);
      return value;
    }
    
    value = this.getStorage(key);
    if (value !== null) {
      // 提升到内存缓存
      this.setMemory(key, value, this.defaultTTL);
      return value;
    }
    
    return null;
  }

  // 删除所有类型的缓存
  delete(key) {
    this.deleteMemory(key);
    this.deleteSession(key);
    this.deleteStorage(key);
  }

  // 清空所有缓存
  clear() {
    this.clearMemory();
    this.clearSession();
    this.clearStorage();
  }

  /**
   * 缓存统计和管理
   */
  
  // 获取缓存统计信息
  getStats() {
    const memoryStats = {
      count: this.memoryCache.size,
      items: Array.from(this.memoryCache.entries()).map(([key, item]) => ({
        key,
        size: JSON.stringify(item.value).length,
        accessCount: item.accessCount,
        lastAccess: item.lastAccess,
        expireTime: item.expireTime
      }))
    };

    const storageStats = this.getStorageStats();
    const sessionStats = this.getSessionStats();

    return {
      memory: memoryStats,
      storage: storageStats,
      session: sessionStats,
      total: {
        count: memoryStats.count + storageStats.count + sessionStats.count,
        size: memoryStats.items.reduce((sum, item) => sum + item.size, 0) +
              storageStats.size + sessionStats.size
      }
    };
  }

  // 获取本地存储统计
  getStorageStats() {
    const keys = Object.keys(localStorage);
    const items = keys.filter(key => key.startsWith(this.storagePrefix));
    let totalSize = 0;

    items.forEach(key => {
      totalSize += localStorage.getItem(key).length;
    });

    return {
      count: items.length,
      size: totalSize
    };
  }

  // 获取会话存储统计
  getSessionStats() {
    const keys = Object.keys(sessionStorage);
    const items = keys.filter(key => key.startsWith(this.storagePrefix));
    let totalSize = 0;

    items.forEach(key => {
      totalSize += sessionStorage.getItem(key).length;
    });

    return {
      count: items.length,
      size: totalSize
    };
  }

  // 清理过期缓存
  cleanup() {
    // 清理内存缓存
    const now = Date.now();
    for (const [key, item] of this.memoryCache.entries()) {
      if (now > item.expireTime) {
        this.memoryCache.delete(key);
      }
    }

    // 清理本地存储缓存
    const storageKeys = Object.keys(localStorage);
    storageKeys.forEach(key => {
      if (key.startsWith(this.storagePrefix)) {
        try {
          const item = JSON.parse(localStorage.getItem(key));
          if (now > item.expireTime) {
            localStorage.removeItem(key);
          }
        } catch (error) {
          // 删除无效的缓存项
          localStorage.removeItem(key);
        }
      }
    });
  }

  // 定期清理
  scheduleCleanup() {
    if (!this.cleanupTimer) {
      this.cleanupTimer = setInterval(() => {
        this.cleanup();
      }, 60000); // 每分钟清理一次
    }
  }

  // 停止定期清理
  stopCleanup() {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
  }
}

// 创建全局实例
const cacheManager = new CacheManager();

// 导出便捷方法
export const cache = {
  set: (key, value, options) => cacheManager.set(key, value, options),
  get: (key) => cacheManager.get(key),
  delete: (key) => cacheManager.delete(key),
  clear: () => cacheManager.clear(),
  stats: () => cacheManager.getStats(),
  cleanup: () => cacheManager.cleanup()
};

export default cacheManager;

/**
 * 离线支持工具
 */
class OfflineManager {
  constructor() {
    this.isOnline = navigator.onLine;
    this.offlineQueue = [];
    this.syncInProgress = false;

    this.init();
  }

  init() {
    // 监听网络状态变化
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.onOnline();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.onOffline();
    });

    // 页面加载时检查离线队列
    this.loadOfflineQueue();
  }

  // 网络恢复时的处理
  onOnline() {
    this.syncOfflineData();
  }

  // 网络断开时的处理
  onOffline() {
    }

  // 添加离线操作到队列
  addToOfflineQueue(operation) {
    const queueItem = {
      id: Date.now() + Math.random(),
      timestamp: Date.now(),
      ...operation
    };

    this.offlineQueue.push(queueItem);
    this.saveOfflineQueue();

    return queueItem.id;
  }

  // 从本地存储加载离线队列
  loadOfflineQueue() {
    try {
      const queueData = localStorage.getItem('erp_offline_queue');
      if (queueData) {
        this.offlineQueue = JSON.parse(queueData);
      }
    } catch (error) {
      console.error('Failed to load offline queue:', error);
      this.offlineQueue = [];
    }
  }

  // 保存离线队列到本地存储
  saveOfflineQueue() {
    try {
      localStorage.setItem('erp_offline_queue', JSON.stringify(this.offlineQueue));
    } catch (error) {
      console.error('Failed to save offline queue:', error);
    }
  }

  // 同步离线数据
  async syncOfflineData() {
    if (this.syncInProgress || !this.isOnline || this.offlineQueue.length === 0) {
      return;
    }

    this.syncInProgress = true;
    const failedItems = [];

    for (const item of this.offlineQueue) {
      try {
        await this.executeOfflineOperation(item);
        } catch (error) {
        console.error('Failed to sync offline operation:', error);
        failedItems.push(item);
      }
    }

    // 更新队列，保留失败的操作
    this.offlineQueue = failedItems;
    this.saveOfflineQueue();
    this.syncInProgress = false;

    if (failedItems.length === 0) {
      } else {
      }
  }

  // 执行离线操作
  async executeOfflineOperation(operation) {
    // 这里需要根据具体的API结构来实现
    // 示例实现
    const { type, method, url, data } = operation;

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: data ? JSON.stringify(data) : undefined
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  // 获取离线队列状态
  getOfflineStatus() {
    return {
      isOnline: this.isOnline,
      queueLength: this.offlineQueue.length,
      syncInProgress: this.syncInProgress,
      queue: this.offlineQueue.map(item => ({
        id: item.id,
        type: item.type,
        timestamp: item.timestamp
      }))
    };
  }

  // 清空离线队列
  clearOfflineQueue() {
    this.offlineQueue = [];
    this.saveOfflineQueue();
  }
}

// 创建离线管理器实例
const offlineManager = new OfflineManager();

// 导出离线支持工具
export const offline = {
  isOnline: () => offlineManager.isOnline,
  addToQueue: (operation) => offlineManager.addToOfflineQueue(operation),
  sync: () => offlineManager.syncOfflineData(),
  getStatus: () => offlineManager.getOfflineStatus(),
  clear: () => offlineManager.clearOfflineQueue()
};
