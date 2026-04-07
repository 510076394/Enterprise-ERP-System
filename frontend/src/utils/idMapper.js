/**
 * ID映射工具
 * @description 提供通用的ID到名称/代码的映射功能
 */

/**
 * 创建ID映射获取器
 * @param {Object} config - 配置对象
 * @param {Ref} config.mapRef - 映射数据的响应式引用
 * @param {Ref} config.requestedRef - 是否已请求数据的标记
 * @param {Function} config.fetchFunc - 获取数据的函数
 * @param {Object} config.fieldMap - 字段映射配置
 * @param {Function} config.defaultValue - 默认值生成函数
 * @returns {Function} 映射获取函数
 */
export const createIdMapper = (config) => {
  const { 
    mapRef, 
    requestedRef, 
    fetchFunc, 
    fieldMap = {}, 
    defaultValue = (id) => id 
  } = config
  
  return (id, field = 'default') => {
    if (!id) {
      return defaultValue(id)
    }
    
    // 从映射中查找
    if (mapRef.value && mapRef.value[id]) {
      const item = mapRef.value[id]
      
      // 获取字段查找顺序
      const fields = fieldMap[field] || fieldMap.default || []
      
      // 按优先级查找字段值
      for (const fieldName of fields) {
        if (item[fieldName] !== undefined && item[fieldName] !== null && item[fieldName] !== '') {
          return item[fieldName]
        }
      }
      
      // 如果都没找到，返回默认值
      return defaultValue(id)
    }
    
    // 如果还没请求过数据，触发请求
    if (requestedRef && !requestedRef.value) {
      requestedRef.value = true
      // 延迟执行，避免阻塞
      setTimeout(() => {
        if (typeof fetchFunc === 'function') {
          fetchFunc()
        }
      }, 100)
    }
    
    return defaultValue(id)
  }
}

/**
 * 批量获取ID对应的值
 * @param {Array} ids - ID数组
 * @param {Function} mapperFunc - 映射函数
 * @param {string} separator - 分隔符
 * @returns {string} 拼接后的字符串
 */
export const batchMapIds = (ids, mapperFunc, separator = ', ') => {
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return '-'
  }
  
  const values = ids.map(id => mapperFunc(id)).filter(v => v)
  return values.length > 0 ? values.join(separator) : '-'
}

/**
 * 创建简单的键值映射
 * @param {Array} items - 数据数组
 * @param {string} keyField - 作为key的字段名
 * @param {string|Array} valueFields - 作为value的字段名或字段名数组
 * @returns {Object} 映射对象
 */
export const createSimpleMap = (items, keyField = 'id', valueFields = 'name') => {
  const map = {}
  
  if (!items || !Array.isArray(items)) {
    return map
  }
  
  items.forEach(item => {
    const key = item[keyField]
    if (key !== undefined && key !== null) {
      if (Array.isArray(valueFields)) {
        // 多个字段，按优先级选择第一个有值的
        for (const field of valueFields) {
          if (item[field] !== undefined && item[field] !== null && item[field] !== '') {
            map[key] = item[field]
            break
          }
        }
      } else {
        // 单个字段
        map[key] = item[valueFields]
      }
    }
  })
  
  return map
}

