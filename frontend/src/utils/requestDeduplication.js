/**
 * 请求去重工具
 * @description 防止重复提交的通用解决方案
 * @date 2025-12-30
 * @version 1.0.0
 */

/**
 * 请求去重管理器
 * 使用 Map 存储正在进行的请求，防止重复提交
 */
class RequestDeduplicationManager {
  constructor() {
    // 存储正在进行的请求：key -> Promise
    this.pendingRequests = new Map()
  }

  /**
   * 生成请求的唯一键
   * @param {string} url - 请求URL
   * @param {Object} params - 请求参数
   * @returns {string} 唯一键
   */
  generateKey(url, params = {}) {
    // 将参数排序后序列化，确保相同参数生成相同的键
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((acc, key) => {
        acc[key] = params[key]
        return acc
      }, {})
    
    return `${url}:${JSON.stringify(sortedParams)}`
  }

  /**
   * 执行去重请求
   * @param {string} key - 请求唯一键
   * @param {Function} requestFn - 请求函数
   * @returns {Promise} 请求结果
   */
  async execute(key, requestFn) {
    // 如果已有相同的请求正在进行，直接返回该请求的 Promise
    if (this.pendingRequests.has(key)) {
      return this.pendingRequests.get(key)
    }

    // 创建新的请求 Promise
    const requestPromise = requestFn()
      .finally(() => {
        // 请求完成后，从 Map 中移除
        this.pendingRequests.delete(key)
      })

    // 将请求 Promise 存入 Map
    this.pendingRequests.set(key, requestPromise)

    return requestPromise
  }

  /**
   * 清除指定的请求
   * @param {string} key - 请求唯一键
   */
  clear(key) {
    this.pendingRequests.delete(key)
  }

  /**
   * 清除所有请求
   */
  clearAll() {
    this.pendingRequests.clear()
  }

  /**
   * 获取正在进行的请求数量
   * @returns {number} 请求数量
   */
  getPendingCount() {
    return this.pendingRequests.size
  }
}

// 创建全局单例
const requestDeduplicationManager = new RequestDeduplicationManager()

/**
 * 防重复提交装饰器（用于 async 函数）
 * @param {Function} fn - 要包装的异步函数
 * @param {Object} options - 配置选项
 * @returns {Function} 包装后的函数
 * 
 * @example
 * const submitForm = preventDuplicateSubmit(async (formData) => {
 *   return await api.post('/api/submit', formData)
 * })
 */
export function preventDuplicateSubmit(fn, options = {}) {
  const {
    generateKey = (args) => JSON.stringify(args),
    onDuplicate = () => {
      console.warn('🔒 检测到重复提交，已忽略')
    }
  } = options

  let pending = false

  return async function (...args) {
    if (pending) {
      onDuplicate(args)
      return Promise.reject(new Error('DUPLICATE_SUBMISSION'))
    }

    pending = true
    try {
      return await fn.apply(this, args)
    } finally {
      pending = false
    }
  }
}

/**
 * 创建带去重功能的请求函数
 * @param {Function} requestFn - 原始请求函数
 * @param {Object} options - 配置选项
 * @returns {Function} 带去重功能的请求函数
 * 
 * @example
 * const createOutbound = createDedupedRequest(
 *   (data) => api.post('/api/outbound', data),
 *   { keyGenerator: (data) => `outbound:${data.order_id}` }
 * )
 */
export function createDedupedRequest(requestFn, options = {}) {
  const {
    keyGenerator = (args) => JSON.stringify(args),
    manager = requestDeduplicationManager
  } = options

  return async function (...args) {
    const key = keyGenerator(...args)
    return manager.execute(key, () => requestFn(...args))
  }
}

export default requestDeduplicationManager

