/**
 * 出库单物料合并辅助工具
 * 统一处理物料合并逻辑，避免不一致的行为
 */

/**
 * 智能合并相同物料
 * @param {Array} existingItems - 现有物料列表
 * @param {Array} newItems - 新增物料列表
 * @param {String} mergeMode - 合并模式：'merge'(合并数量) | 'replace'(替换数量) | 'ask'(询问用户)
 * @returns {Object} 合并结果
 */
export function smartMergeMaterials(existingItems, newItems, mergeMode = 'ask') {
  const duplicates = []
  const newProducts = []
  
  newItems.forEach(newItem => {
    const existingIndex = existingItems.findIndex(
      existing => existing.material_id === newItem.material_id
    )
    
    if (existingIndex === -1) {
      newProducts.push(newItem)
    } else {
      duplicates.push({
        newItem,
        existingItem: existingItems[existingIndex],
        existingIndex
      })
    }
  })
  
  return {
    duplicates,
    newProducts,
    hasDuplicates: duplicates.length > 0
  }
}

/**
 * 合并物料数量
 * @param {Object} existingItem - 现有物料项
 * @param {Object} newItem - 新物料项
 * @param {String} mode - 合并模式
 */
export function mergeMaterialQuantity(existingItem, newItem, mode = 'merge') {
  if (mode === 'merge') {
    // 合并数量
    existingItem.order_quantity = (existingItem.order_quantity || 0) + (newItem.quantity || 0)
    existingItem.quantity = (existingItem.quantity || 0) + (newItem.quantity || 0)
    
    // 合并来源订单信息
    if (!existingItem.source_orders) {
      existingItem.source_orders = []
    }
    
    if (newItem.source_orders) {
      newItem.source_orders.forEach(source => {
        const existingSource = existingItem.source_orders.find(s => s.id === source.id)
        if (existingSource) {
          existingSource.quantity = (existingSource.quantity || 0) + (source.quantity || 0)
        } else {
          existingItem.source_orders.push({ ...source })
        }
      })
    }
  } else if (mode === 'replace') {
    // 替换数量
    existingItem.order_quantity = newItem.quantity || 0
    existingItem.quantity = newItem.quantity || 0
    existingItem.source_orders = newItem.source_orders ? [...newItem.source_orders] : []
  }
}

/**
 * 创建物料明细项
 * @param {Object} product - 产品信息
 * @param {Object} options - 选项
 * @returns {Object} 物料明细项
 */
export function createMaterialItem(product, options = {}) {
  const {
    quantity = product.selected_quantity || product.quantity || 0,
    orderNo = product.order_no || '',
    orderId = product.order_id || null,
    sourceOrders = null
  } = options
  
  return {
    material_id: product.material_id,
    product_name: product.material_name || product.product_name,
    material_code: product.material_code,
    specification: product.specification,
    order_quantity: quantity,
    quantity: quantity,
    unit_name: product.unit_name,
    unit_id: product.unit_id,
    unit_price: product.unit_price || 0,
    stock_quantity: product.stock_quantity || 0,
    order_no: orderNo,
    order_id: orderId,
    source_orders: sourceOrders || (orderId ? [{
      id: orderId,
      order_no: orderNo,
      quantity: quantity
    }] : [])
  }
}

/**
 * 处理多订单产品拆分
 * @param {Object} product - 产品信息
 * @param {Boolean} shouldSplit - 是否拆分
 * @returns {Array} 物料明细项数组
 */
export function handleMultiOrderProduct(product, shouldSplit = false) {
  if (!product.order_details || product.order_details.length <= 1) {
    // 单订单产品，直接创建
    return [createMaterialItem(product, {
      orderNo: product.order_nos || product.order_no || '',
      orderId: parseInt(product.order_ids) || product.order_id || null
    })]
  }
  
  if (shouldSplit) {
    // 拆分成多个明细项
    const totalRemaining = product.order_details.reduce(
      (sum, order) => sum + parseFloat(order.remaining_quantity), 0
    )
    
    return product.order_details
      .filter(orderDetail => parseFloat(orderDetail.remaining_quantity) > 0)
      .map(orderDetail => {
        const proportion = parseFloat(orderDetail.remaining_quantity) / totalRemaining
        const allocatedQuantity = Math.round(product.selected_quantity * proportion * 100) / 100
        
        return createMaterialItem(product, {
          quantity: allocatedQuantity,
          orderNo: orderDetail.order_no,
          orderId: orderDetail.order_id,
          sourceOrders: [{
            id: orderDetail.order_id,
            order_no: orderDetail.order_no,
            quantity: allocatedQuantity
          }]
        })
      })
  } else {
    // 合并成一个明细项
    const orderIds = product.order_ids.split(',')
    const orderNos = product.order_nos.split(', ')
    
    return [createMaterialItem(product, {
      orderNo: orderNos.join(', '),
      orderId: parseInt(orderIds[0].trim()),
      sourceOrders: orderIds.map((id, index) => ({
        id: parseInt(id.trim()),
        order_no: orderNos[index] ? orderNos[index].trim() : '',
        quantity: Math.round(product.selected_quantity / orderIds.length * 100) / 100
      }))
    })]
  }
}
