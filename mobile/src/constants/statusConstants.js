/**
 * 移动端状态常量配置
 * 统一管理移动端中使用的所有状态映射和颜色定义
 */

// ==================== 调拨单状态映射 ====================
export const TRANSFER_STATUS = {
  'draft': '草稿',
  'pending': '待审核',
  'confirmed': '已确认',
  'approved': '已审核',
  'in_progress': '调拨中',
  'in_transit': '运输中',
  'completed': '已完成',
  'cancelled': '已取消',
  'rejected': '已拒绝'
};

// 调拨单状态颜色映射（适配Vant的Tag组件）
export const TRANSFER_STATUS_COLORS = {
  'draft': 'default',
  'pending': 'warning',
  'confirmed': 'primary',
  'approved': 'primary',
  'in_progress': 'warning',
  'in_transit': 'warning',
  'completed': 'success',
  'cancelled': 'danger',
  'rejected': 'danger'
};

// ==================== 入库单状态映射 ====================
export const INBOUND_STATUS = {
  'draft': '草稿',
  'confirmed': '已确认',
  'completed': '已完成',
  'cancelled': '已取消'
};

// ==================== 库存盘点状态映射 ====================
export const INVENTORY_CHECK_STATUS = {
  'draft': '草稿',
  'in_progress': '进行中',
  'pending': '待审核',
  'completed': '已完成',
  'cancelled': '已取消'
};

// 入库单状态颜色映射
export const INBOUND_STATUS_COLORS = {
  'draft': 'default',
  'confirmed': 'primary',
  'completed': 'success',
  'cancelled': 'danger'
};

// 库存盘点状态颜色映射
export const INVENTORY_CHECK_STATUS_COLORS = {
  'draft': 'default',
  'in_progress': 'warning',
  'pending': 'primary',
  'completed': 'success',
  'cancelled': 'danger'
};

// ==================== 出库单状态映射 ====================
export const OUTBOUND_STATUS = {
  'draft': '草稿',
  'confirmed': '已确认',
  'completed': '已完成',
  'cancelled': '已取消'
};

// 出库单状态颜色映射
export const OUTBOUND_STATUS_COLORS = {
  'draft': 'default',
  'confirmed': 'primary',
  'completed': 'success',
  'cancelled': 'danger'
};

// ==================== 库存事务类型映射 ====================
export const INVENTORY_TRANSACTION_TYPES = {
  // 基础类型
  'inbound': '生产入库',
  'outbound': '生产出库',
  'in': '生产入库',
  'out': '生产出库',
  
  // 调拨类型
  'transfer': '调拨',
  'transfer_in': '调拨入库',
  'transfer_out': '调拨出库',
  
  // 业务类型
  'purchase_inbound': '采购入库',
  'production_inbound': '生产入库',
  'production_outbound': '生产出库',
  'outsourced_inbound': '委外入库',
  'outsourced_outbound': '委外出库',
  'sale': '销售出库',
  'sales_outbound': '销售出库',
  
  // 管理类型
  'check': '盘点',
  'adjust': '调整',
  'adjustment': '库存调整',
  'initial_import': '初始导入',
  'manual_adjustment': '手动调整',
  'other': '其他',
  
  // 中文类型（兼容后端已返回中文的情况）
  '入库': '生产入库',
  '出库': '生产出库',
  '调拨': '调拨',
  '调拨入库': '调拨入库',
  '调拨出库': '调拨出库',
  '采购入库': '采购入库',
  '生产入库': '生产入库',
  '生产出库': '生产出库',
  '委外入库': '委外入库',
  '委外出库': '委外出库',
  '销售出库': '销售出库',
  '盘点': '盘点',
  '调整': '调整',
  '库存调整': '库存调整',
  '其他': '其他'
};

// 库存事务类型颜色映射
export const INVENTORY_TRANSACTION_COLORS = {
  'inbound': 'success',
  'outbound': 'danger',
  'transfer': 'warning',
  'transfer_in': 'success',
  'transfer_out': 'warning',
  'check': 'primary',
  'adjust': 'primary',
  'other': 'default',
  'purchase_inbound': 'success',
  'production_inbound': 'success',
  'production_outbound': 'danger',
  'outsourced_inbound': 'success',
  'outsourced_outbound': 'danger',
  'sale': 'danger',
  'sales_outbound': 'danger',
  'sales_return': 'warning',
  'sales_exchange_return': 'success',  // 销售换退 - 绿色（入库）
  'sales_exchange_out': 'danger',      // 销售换出 - 红色（出库）
  
  // 中文类型颜色映射
  '入库': 'success',
  '出库': 'danger',
  '调拨': 'warning',
  '调拨入库': 'success',
  '调拨出库': 'warning',
  '采购入库': 'success',
  '生产入库': 'success',
  '生产出库': 'danger',
  '委外入库': 'success',
  '委外出库': 'danger',
  '销售出库': 'danger',
  '销售退货': 'warning',
  '销售换退': 'success',  // 销售换退 - 绿色（入库）
  '销售换出': 'danger',   // 销售换出 - 红色（出库）
  '盘点': 'primary',
  '调整': 'primary',
  '库存调整': 'primary',
  '初始导入': 'success',
  '手动调整': 'warning',
  '其他': 'default'
};

// ==================== 入库类型映射 ====================
export const INBOUND_TYPES = {
  'purchase': '采购入库',
  'production': '生产入库',
  'return': '退货入库',
  'transfer': '调拨入库',
  'other': '其他入库'
};

// ==================== 出库类型映射 ====================
export const OUTBOUND_TYPES = {
  'sales': '销售出库',
  'production': '生产出库',
  'transfer': '调拨出库',
  'scrap': '报废出库',
  'other': '其他出库'
};

// ==================== 工具函数 ====================

/**
 * 获取调拨单状态的中文名称
 * @param {string} status - 状态
 * @returns {string} 中文名称
 */
export const getTransferStatusText = (status) => {
  return TRANSFER_STATUS[status] || status;
};

/**
 * 获取调拨单状态的颜色
 * @param {string} status - 状态
 * @returns {string} 颜色类型
 */
export const getTransferStatusColor = (status) => {
  return TRANSFER_STATUS_COLORS[status] || 'default';
};

/**
 * 获取入库单状态的中文名称
 * @param {string} status - 状态
 * @returns {string} 中文名称
 */
export const getInboundStatusText = (status) => {
  return INBOUND_STATUS[status] || status;
};

/**
 * 获取入库单状态的颜色
 * @param {string} status - 状态
 * @returns {string} 颜色类型
 */
export const getInboundStatusColor = (status) => {
  return INBOUND_STATUS_COLORS[status] || 'default';
};

/**
 * 获取出库单状态的中文名称
 * @param {string} status - 状态
 * @returns {string} 中文名称
 */
export const getOutboundStatusText = (status) => {
  return OUTBOUND_STATUS[status] || status;
};

/**
 * 获取出库单状态的颜色
 * @param {string} status - 状态
 * @returns {string} 颜色类型
 */
export const getOutboundStatusColor = (status) => {
  return OUTBOUND_STATUS_COLORS[status] || 'default';
};

/**
 * 获取库存事务类型的中文名称
 * @param {string} type - 类型
 * @returns {string} 中文名称
 */
export const getInventoryTransactionTypeText = (type) => {
  return INVENTORY_TRANSACTION_TYPES[type] || type;
};

/**
 * 获取库存事务类型的颜色
 * @param {string} type - 类型
 * @returns {string} 颜色类型
 */
export const getInventoryTransactionTypeColor = (type) => {
  return INVENTORY_TRANSACTION_COLORS[type] || 'default';
};

/**
 * 获取入库类型的中文名称
 * @param {string} type - 类型
 * @returns {string} 中文名称
 */
export const getInboundTypeText = (type) => {
  return INBOUND_TYPES[type] || type;
};

/**
 * 获取出库类型的中文名称
 * @param {string} type - 类型
 * @returns {string} 中文名称
 */
export const getOutboundTypeText = (type) => {
  return OUTBOUND_TYPES[type] || type;
};

// 导出默认对象
export default {
  TRANSFER_STATUS,
  TRANSFER_STATUS_COLORS,
  INBOUND_STATUS,
  INBOUND_STATUS_COLORS,
  OUTBOUND_STATUS,
  OUTBOUND_STATUS_COLORS,
  INVENTORY_TRANSACTION_TYPES,
  INVENTORY_TRANSACTION_COLORS,
  INBOUND_TYPES,
  OUTBOUND_TYPES,
  
  // 工具函数
  getTransferStatusText,
  getTransferStatusColor,
  getInboundStatusText,
  getInboundStatusColor,
  getOutboundStatusText,
  getOutboundStatusColor,
  getInventoryTransactionTypeText,
  getInventoryTransactionTypeColor,
  getInboundTypeText,
  getOutboundTypeText
};
