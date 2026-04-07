/**
 * performanceOptimizer.js
 * @description 前端性能优化工具
  * @date 2025-08-27
 * @version 1.0.0
 */

import { nextTick } from 'vue'

/**
 * 前端性能优化器类
  */
class PerformanceOptimizer {
  /**
   * 构造函数
      */
  constructor() {
    this.observers = new Map()
    this.lazyComponents = new Map()
    this.performanceMetrics = {
      componentRenderTimes: new Map(),
      apiCallTimes: new Map(),
      routeChangeTimes: new Map()
    }
  }

  /**
   * 创建组件懒加载
   * @param {Function} loader - 组件加载函数
   * @param {Object} options - 配置选项
   * @returns {Object} 异步组件定义
      */
  createLazyComponent(loader, options = {}) {
    const {
      loadingComponent = null,
      errorComponent = null,
      delay = 200,
      timeout = 3000
    } = options

    return {
      loader,
      loadingComponent,
      errorComponent,
      delay,
      timeout,
      onError: (error, retry, fail, attempts) => {
        console.error(`组件加载失败 (尝试 ${attempts} 次):`, error)
        if (attempts <= 3) {
          retry()
        } else {
          fail()
        }
      }
    }
  }

  /**
   * 创建Intersection Observer用于懒加载
   * @param {Function} callback - 回调函数
   * @param {Object} options - 观察器选项
   * @returns {IntersectionObserver} 观察器实例
      */
  createIntersectionObserver(callback, options = {}) {
    const {
      threshold = 0.1,
      rootMargin = '50px',
      root = null
    } = options

    if (!window.IntersectionObserver) {
      // 不支持IntersectionObserver时的降级处理
      console.warn('IntersectionObserver not supported, using fallback')
      return {
        observe: () => callback([{ isIntersecting: true }]),
        unobserve: () => {},
        disconnect: () => {}
      }
    }

    const observer = new IntersectionObserver(callback, {
      threshold,
      rootMargin,
      root
    })

    return observer
  }

  /**
   * 图片懒加载
   * @param {HTMLElement} element - 图片元素
   * @param {string} src - 图片源地址
   * @param {Object} options - 配置选项
      */
  lazyLoadImage(element, src, options = {}) {
    const {
      placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB2aWV3Qm94PSIwIDAgMSAxIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiNGNUY1RjUiLz48L3N2Zz4=',
      errorSrc = null,
      fadeIn = true
    } = options

    // 设置占位符
    element.src = placeholder

    const observer = this.createIntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target
          const tempImg = new Image()

          tempImg.onload = () => {
            img.src = src
            if (fadeIn) {
              img.style.opacity = '0'
              img.style.transition = 'opacity 0.3s ease'
              setTimeout(() => {
                img.style.opacity = '1'
              }, 10)
            }
            observer.unobserve(img)
          }

          tempImg.onerror = () => {
            if (errorSrc) {
              img.src = errorSrc
            }
            observer.unobserve(img)
          }

          tempImg.src = src
        }
      })
    })

    observer.observe(element)
    return observer
  }

  /**
   * 防抖函数
   * @param {Function} func - 要防抖的函数
   * @param {number} wait - 等待时间
   * @param {boolean} immediate - 是否立即执行
   * @returns {Function} 防抖后的函数
      */
  debounce(func, wait, immediate = false) {
    let timeout
    return function executedFunction(...args) {
      const later = () => {
        timeout = null
        if (!immediate) func.apply(this, args)
      }
      const callNow = immediate && !timeout
      clearTimeout(timeout)
      timeout = setTimeout(later, wait)
      if (callNow) func.apply(this, args)
    }
  }

  /**
   * 节流函数
   * @param {Function} func - 要节流的函数
   * @param {number} limit - 时间限制
   * @returns {Function} 节流后的函数
      */
  throttle(func, limit) {
    let inThrottle
    return function executedFunction(...args) {
      if (!inThrottle) {
        func.apply(this, args)
        inThrottle = true
        setTimeout(() => inThrottle = false, limit)
      }
    }
  }

  /**
   * 虚拟滚动优化
   * @param {Array} items - 数据项
   * @param {number} itemHeight - 项目高度
   * @param {number} containerHeight - 容器高度
   * @param {number} scrollTop - 滚动位置
   * @returns {Object} 虚拟滚动数据
      */
  calculateVirtualScroll(items, itemHeight, containerHeight, scrollTop) {
    const totalHeight = items.length * itemHeight
    const visibleCount = Math.ceil(containerHeight / itemHeight)
    const startIndex = Math.floor(scrollTop / itemHeight)
    const endIndex = Math.min(startIndex + visibleCount + 1, items.length)
    const offsetY = startIndex * itemHeight

    return {
      visibleItems: items.slice(startIndex, endIndex),
      startIndex,
      endIndex,
      offsetY,
      totalHeight,
      visibleCount
    }
  }

  /**
   * 记录组件渲染时间
   * @param {string} componentName - 组件名称
   * @param {Function} renderFunction - 渲染函数
   * @returns {any} 渲染结果
      */
  async measureComponentRender(componentName, renderFunction) {
    const startTime = performance.now()
    
    try {
      const result = await renderFunction()
      await nextTick()
      
      const endTime = performance.now()
      const renderTime = endTime - startTime
      
      // 记录渲染时间
      if (!this.performanceMetrics.componentRenderTimes.has(componentName)) {
        this.performanceMetrics.componentRenderTimes.set(componentName, [])
      }
      
      const times = this.performanceMetrics.componentRenderTimes.get(componentName)
      times.push(renderTime)
      
      // 只保留最近10次记录
      if (times.length > 10) {
        times.shift()
      }
      
      // 开发环境下输出慢渲染警告
      if (process.env.NODE_ENV === 'development' && renderTime > 100) {
        console.warn(`🐌 组件渲染较慢: ${componentName} - ${renderTime.toFixed(2)}ms`)
      }
      
      return result
    } catch (error) {
      console.error(`组件渲染错误: ${componentName}`, error)
      throw error
    }
  }

  /**
   * 记录API调用时间
   * @param {string} apiName - API名称
   * @param {Function} apiCall - API调用函数
   * @returns {any} API调用结果
      */
  async measureApiCall(apiName, apiCall) {
    const startTime = performance.now()
    
    try {
      const result = await apiCall()
      const endTime = performance.now()
      const callTime = endTime - startTime
      
      // 记录API调用时间
      if (!this.performanceMetrics.apiCallTimes.has(apiName)) {
        this.performanceMetrics.apiCallTimes.set(apiName, [])
      }
      
      const times = this.performanceMetrics.apiCallTimes.get(apiName)
      times.push(callTime)
      
      // 只保留最近10次记录
      if (times.length > 10) {
        times.shift()
      }
      
      // 开发环境下输出慢API警告
      if (process.env.NODE_ENV === 'development' && callTime > 2000) {
        console.warn(`🐌 API调用较慢: ${apiName} - ${callTime.toFixed(2)}ms`)
      }
      
      return result
    } catch (error) {
      console.error(`API调用错误: ${apiName}`, error)
      throw error
    }
  }

  /**
   * 获取性能统计信息
   * @returns {Object} 性能统计数据
      */
  getPerformanceStats() {
    const stats = {
      components: {},
      apis: {},
      memory: {},
      timing: {}
    }

    // 组件渲染统计
    for (const [name, times] of this.performanceMetrics.componentRenderTimes) {
      const avgTime = times.reduce((sum, time) => sum + time, 0) / times.length
      stats.components[name] = {
        averageRenderTime: Math.round(avgTime * 100) / 100,
        renderCount: times.length,
        maxRenderTime: Math.max(...times),
        minRenderTime: Math.min(...times)
      }
    }

    // API调用统计
    for (const [name, times] of this.performanceMetrics.apiCallTimes) {
      const avgTime = times.reduce((sum, time) => sum + time, 0) / times.length
      stats.apis[name] = {
        averageCallTime: Math.round(avgTime * 100) / 100,
        callCount: times.length,
        maxCallTime: Math.max(...times),
        minCallTime: Math.min(...times)
      }
    }

    // 内存使用情况
    if (performance.memory) {
      stats.memory = {
        usedJSHeapSize: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024 * 100) / 100,
        totalJSHeapSize: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024 * 100) / 100,
        jsHeapSizeLimit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024 * 100) / 100
      }
    }

    // 页面加载时间
    if (performance.timing) {
      const timing = performance.timing
      stats.timing = {
        domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
        loadComplete: timing.loadEventEnd - timing.navigationStart,
        domReady: timing.domComplete - timing.navigationStart
      }
    }

    return stats
  }

  /**
   * 清理资源
      */
  cleanup() {
    // 断开所有观察器
    for (const observer of this.observers.values()) {
      if (observer && observer.disconnect) {
        observer.disconnect()
      }
    }
    this.observers.clear()
    
    // 清理性能指标
    this.performanceMetrics.componentRenderTimes.clear()
    this.performanceMetrics.apiCallTimes.clear()
    this.performanceMetrics.routeChangeTimes.clear()
  }
}

// 创建全局实例
const performanceOptimizer = new PerformanceOptimizer()

export default performanceOptimizer
