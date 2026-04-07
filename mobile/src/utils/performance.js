/**
 * 性能监控工具
 */

class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.observers = [];
    this.isSupported = 'performance' in window;
    
    if (this.isSupported) {
      this.init();
    }
  }

  init() {
    // 监听页面加载性能
    this.observePageLoad();
    
    // 监听资源加载性能
    this.observeResourceLoad();
    
    // 监听长任务
    this.observeLongTasks();
    
    // 监听内存使用
    this.observeMemoryUsage();
    
    // 监听网络状态
    this.observeNetworkStatus();
  }

  // 监听页面加载性能
  observePageLoad() {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'navigation') {
            this.recordPageLoadMetrics(entry);
          }
        }
      });
      
      observer.observe({ entryTypes: ['navigation'] });
      this.observers.push(observer);
    }
  }

  // 记录页面加载指标
  recordPageLoadMetrics(entry) {
    const metrics = {
      // DNS查询时间
      dnsLookup: entry.domainLookupEnd - entry.domainLookupStart,
      // TCP连接时间
      tcpConnect: entry.connectEnd - entry.connectStart,
      // SSL握手时间
      sslConnect: entry.secureConnectionStart > 0 ? entry.connectEnd - entry.secureConnectionStart : 0,
      // 请求响应时间
      requestResponse: entry.responseEnd - entry.requestStart,
      // DOM解析时间
      domParse: entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart,
      // 资源加载时间
      resourceLoad: entry.loadEventEnd - entry.loadEventStart,
      // 首次内容绘制
      fcp: this.getFCP(),
      // 最大内容绘制
      lcp: this.getLCP(),
      // 首次输入延迟
      fid: this.getFID(),
      // 累积布局偏移
      cls: this.getCLS()
    };

    this.metrics.set('pageLoad', metrics);
    this.reportMetrics('pageLoad', metrics);
  }

  // 监听资源加载性能
  observeResourceLoad() {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'resource') {
            this.recordResourceMetrics(entry);
          }
        }
      });
      
      observer.observe({ entryTypes: ['resource'] });
      this.observers.push(observer);
    }
  }

  // 记录资源加载指标
  recordResourceMetrics(entry) {
    const metrics = {
      name: entry.name,
      type: this.getResourceType(entry.name),
      duration: entry.duration,
      size: entry.transferSize || 0,
      cached: entry.transferSize === 0 && entry.decodedBodySize > 0
    };

    // 记录慢资源
    if (metrics.duration > 1000) {
      this.recordSlowResource(metrics);
    }
  }

  // 获取资源类型
  getResourceType(url) {
    if (url.includes('.js')) return 'script';
    if (url.includes('.css')) return 'stylesheet';
    if (url.match(/\.(png|jpg|jpeg|gif|webp|svg)$/)) return 'image';
    if (url.includes('.woff') || url.includes('.ttf')) return 'font';
    return 'other';
  }

  // 记录慢资源
  recordSlowResource(metrics) {
    const slowResources = this.metrics.get('slowResources') || [];
    slowResources.push({
      ...metrics,
      timestamp: Date.now()
    });
    
    this.metrics.set('slowResources', slowResources);
    
    // 只保留最近的50个慢资源记录
    if (slowResources.length > 50) {
      slowResources.splice(0, slowResources.length - 50);
    }
  }

  // 监听长任务
  observeLongTasks() {
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            this.recordLongTask(entry);
          }
        });
        
        observer.observe({ entryTypes: ['longtask'] });
        this.observers.push(observer);
      } catch (e) {
        // longtask 可能不被支持
        console.warn('Long task monitoring not supported');
      }
    }
  }

  // 记录长任务
  recordLongTask(entry) {
    const longTasks = this.metrics.get('longTasks') || [];
    longTasks.push({
      duration: entry.duration,
      startTime: entry.startTime,
      timestamp: Date.now()
    });
    
    this.metrics.set('longTasks', longTasks);
    
    // 只保留最近的20个长任务记录
    if (longTasks.length > 20) {
      longTasks.splice(0, longTasks.length - 20);
    }
  }

  // 监听内存使用
  observeMemoryUsage() {
    if ('memory' in window.performance) {
      setInterval(() => {
        const memory = window.performance.memory;
        this.metrics.set('memory', {
          used: memory.usedJSHeapSize,
          total: memory.totalJSHeapSize,
          limit: memory.jsHeapSizeLimit,
          timestamp: Date.now()
        });
      }, 30000); // 每30秒记录一次
    }
  }

  // 监听网络状态
  observeNetworkStatus() {
    if ('connection' in navigator) {
      const connection = navigator.connection;
      const updateNetworkInfo = () => {
        this.metrics.set('network', {
          effectiveType: connection.effectiveType,
          downlink: connection.downlink,
          rtt: connection.rtt,
          saveData: connection.saveData,
          timestamp: Date.now()
        });
      };

      updateNetworkInfo();
      connection.addEventListener('change', updateNetworkInfo);
    }
  }

  // 获取首次内容绘制时间
  getFCP() {
    const entries = window.performance.getEntriesByName('first-contentful-paint');
    return entries.length > 0 ? entries[0].startTime : 0;
  }

  // 获取最大内容绘制时间
  getLCP() {
    return new Promise((resolve) => {
      if ('PerformanceObserver' in window) {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          resolve(lastEntry.startTime);
          observer.disconnect();
        });
        
        observer.observe({ entryTypes: ['largest-contentful-paint'] });
        
        // 5秒后超时
        setTimeout(() => {
          observer.disconnect();
          resolve(0);
        }, 5000);
      } else {
        resolve(0);
      }
    });
  }

  // 获取首次输入延迟
  getFID() {
    return new Promise((resolve) => {
      if ('PerformanceObserver' in window) {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const firstEntry = entries[0];
          resolve(firstEntry.processingStart - firstEntry.startTime);
          observer.disconnect();
        });
        
        observer.observe({ entryTypes: ['first-input'] });
        
        // 10秒后超时
        setTimeout(() => {
          observer.disconnect();
          resolve(0);
        }, 10000);
      } else {
        resolve(0);
      }
    });
  }

  // 获取累积布局偏移
  getCLS() {
    return new Promise((resolve) => {
      if ('PerformanceObserver' in window) {
        let clsValue = 0;
        
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          }
        });
        
        observer.observe({ entryTypes: ['layout-shift'] });
        
        // 5秒后返回结果
        setTimeout(() => {
          observer.disconnect();
          resolve(clsValue);
        }, 5000);
      } else {
        resolve(0);
      }
    });
  }

  // 手动记录性能指标
  mark(name) {
    if (this.isSupported) {
      window.performance.mark(name);
    }
  }

  // 测量两个标记之间的时间
  measure(name, startMark, endMark) {
    if (this.isSupported) {
      window.performance.measure(name, startMark, endMark);
      const entries = window.performance.getEntriesByName(name);
      return entries.length > 0 ? entries[entries.length - 1].duration : 0;
    }
    return 0;
  }

  // 记录用户交互性能
  recordInteraction(type, duration) {
    const interactions = this.metrics.get('interactions') || [];
    interactions.push({
      type,
      duration,
      timestamp: Date.now()
    });
    
    this.metrics.set('interactions', interactions);
    
    // 只保留最近的100个交互记录
    if (interactions.length > 100) {
      interactions.splice(0, interactions.length - 100);
    }
  }

  // 获取性能报告
  getReport() {
    const report = {
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      metrics: Object.fromEntries(this.metrics)
    };

    return report;
  }

  // 上报性能数据
  reportMetrics(type, data) {
    // 这里可以发送到分析服务
    if (process.env.NODE_ENV === 'development') {
      }
    
    // 可以集成第三方分析服务
    // analytics.track('performance', { type, ...data });
  }

  // 清理资源
  destroy() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    this.metrics.clear();
  }
}

// 创建全局实例
const performanceMonitor = new PerformanceMonitor();

// 导出工具函数
export const performance = {
  // 标记开始
  markStart: (name) => performanceMonitor.mark(`${name}-start`),
  
  // 标记结束并测量
  markEnd: (name) => {
    performanceMonitor.mark(`${name}-end`);
    return performanceMonitor.measure(name, `${name}-start`, `${name}-end`);
  },
  
  // 记录交互
  recordInteraction: (type, duration) => performanceMonitor.recordInteraction(type, duration),
  
  // 获取报告
  getReport: () => performanceMonitor.getReport(),
  
  // 获取指标
  getMetric: (name) => performanceMonitor.metrics.get(name),
  
  // 清理
  destroy: () => performanceMonitor.destroy()
};

export default performanceMonitor;
