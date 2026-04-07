/**
 * 应用启动检查工具
 * 在应用启动时进行各种环境检查和初始化
 */

import { configManager } from '@/config/app';

// 启动检查结果
export const STARTUP_STATUS = {
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error'
};

// 检查项目类型
export const CHECK_TYPES = {
  BROWSER_SUPPORT: 'browserSupport',
  NETWORK_STATUS: 'networkStatus',
  STORAGE_AVAILABLE: 'storageAvailable',
  API_CONNECTIVITY: 'apiConnectivity'
};

class StartupChecker {
  constructor() {
    this.checks = new Map();
    this.results = new Map();
    this.callbacks = [];
    
    // 注册默认检查项
    this.registerDefaultChecks();
  }

  // 注册默认检查项
  registerDefaultChecks() {
    this.registerCheck(CHECK_TYPES.BROWSER_SUPPORT, this.checkBrowserSupport);
    this.registerCheck(CHECK_TYPES.NETWORK_STATUS, this.checkNetworkStatus);
    this.registerCheck(CHECK_TYPES.STORAGE_AVAILABLE, this.checkStorageAvailable);
    this.registerCheck(CHECK_TYPES.API_CONNECTIVITY, this.checkApiConnectivity);
  }

  // 注册检查项
  registerCheck(type, checkFunction) {
    this.checks.set(type, checkFunction.bind(this));
  }

  // 执行所有检查
  async runAllChecks() {
    const results = {};
    const errors = [];
    const warnings = [];

    for (const [type, checkFunction] of this.checks) {
      try {
        const result = await checkFunction();
        results[type] = result;
        this.results.set(type, result);

        if (result.status === STARTUP_STATUS.ERROR) {
          errors.push({ type, ...result });
        } else if (result.status === STARTUP_STATUS.WARNING) {
          warnings.push({ type, ...result });
        }
      } catch (error) {
        console.error(`检查失败: ${type}`, error);
        const errorResult = {
          status: STARTUP_STATUS.ERROR,
          message: `检查执行失败: ${error.message}`,
          details: error
        };
        results[type] = errorResult;
        this.results.set(type, errorResult);
        errors.push({ type, ...errorResult });
      }
    }

    const summary = {
      timestamp: Date.now(),
      totalChecks: this.checks.size,
      passed: Object.values(results).filter(r => r.status === STARTUP_STATUS.SUCCESS).length,
      warnings: warnings.length,
      errors: errors.length,
      results,
      errors,
      warnings
    };

    this.notifyCallbacks(summary);

    return summary;
  }

  // 检查浏览器支持
  async checkBrowserSupport() {
    const requiredFeatures = [
      'localStorage',
      'fetch',
      'Promise'
    ];

    const unsupported = [];

    // 检查必需功能
    requiredFeatures.forEach(feature => {
      switch (feature) {
        case 'localStorage':
          if (!window.localStorage) unsupported.push(feature);
          break;
        case 'fetch':
          if (!window.fetch) unsupported.push(feature);
          break;
        case 'Promise':
          if (!window.Promise) unsupported.push(feature);
          break;
      }
    });

    if (unsupported.length > 0) {
      return {
        status: STARTUP_STATUS.ERROR,
        message: `浏览器不支持必需功能: ${unsupported.join(', ')}`,
        details: { unsupported }
      };
    }

    return {
      status: STARTUP_STATUS.SUCCESS,
      message: '浏览器支持检查通过',
      details: { userAgent: navigator.userAgent }
    };
  }

  // 检查网络状态
  async checkNetworkStatus() {
    const isOnline = navigator.onLine;
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;

    const result = {
      isOnline,
      connection: connection ? {
        effectiveType: connection.effectiveType,
        downlink: connection.downlink,
        rtt: connection.rtt,
        saveData: connection.saveData
      } : null
    };

    if (!isOnline) {
      return {
        status: STARTUP_STATUS.WARNING,
        message: '当前处于离线状态',
        details: result
      };
    }

    // 检查网络质量
    if (connection && connection.effectiveType === 'slow-2g') {
      return {
        status: STARTUP_STATUS.WARNING,
        message: '网络连接较慢',
        details: result
      };
    }

    return {
      status: STARTUP_STATUS.SUCCESS,
      message: '网络状态正常',
      details: result
    };
  }

  // 检查存储可用性
  async checkStorageAvailable() {
    const results = {};

    // 检查 localStorage
    try {
      const testKey = '__storage_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      results.localStorage = true;
    } catch (error) {
      results.localStorage = false;
      results.localStorageError = error.message;
    }

    // 检查 sessionStorage
    try {
      const testKey = '__session_test__';
      sessionStorage.setItem(testKey, 'test');
      sessionStorage.removeItem(testKey);
      results.sessionStorage = true;
    } catch (error) {
      results.sessionStorage = false;
      results.sessionStorageError = error.message;
    }

    // 检查 IndexedDB
    try {
      results.indexedDB = 'indexedDB' in window;
    } catch (error) {
      results.indexedDB = false;
    }

    // 检查存储配额
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      try {
        const estimate = await navigator.storage.estimate();
        results.quota = estimate;
      } catch (error) {
        results.quotaError = error.message;
      }
    }

    if (!results.localStorage) {
      return {
        status: STARTUP_STATUS.ERROR,
        message: 'localStorage 不可用',
        details: results
      };
    }

    return {
      status: STARTUP_STATUS.SUCCESS,
      message: '存储检查通过',
      details: results
    };
  }

  // 检查API连接
  async checkApiConnectivity() {
    const apiBaseUrl = configManager.get('api.baseURL');

    // 简化检查：只验证配置是否存在
    // 实际的API连接会在登录时验证
    if (apiBaseUrl) {
      return {
        status: STARTUP_STATUS.SUCCESS,
        message: 'API配置正常',
        details: { url: apiBaseUrl }
      };
    } else {
      return {
        status: STARTUP_STATUS.WARNING,
        message: 'API地址未配置',
        details: null
      };
    }
  }

  // 添加回调
  onComplete(callback) {
    this.callbacks.push(callback);
  }

  // 通知回调
  notifyCallbacks(summary) {
    this.callbacks.forEach(callback => {
      try {
        callback(summary);
      } catch (error) {
        console.error('Startup callback error:', error);
      }
    });
  }

  // 获取检查结果
  getResult(type) {
    return this.results.get(type);
  }

  // 获取所有结果
  getAllResults() {
    return Object.fromEntries(this.results);
  }
}

// 创建全局启动检查器实例
export const startupChecker = new StartupChecker();

// 便捷方法
export async function runStartupChecks() {
  return await startupChecker.runAllChecks();
}

export default startupChecker;
