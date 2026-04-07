/**
 * statusMappers.js
 * @description 移动端状态映射工具函数
 * @author ERP开发团队
 * @date 2025-01-27
 * @version 1.0.0
 */

// ==================== 订单状态映射 ====================

/**
 * 采购订单状态映射
 */
export const PURCHASE_ORDER_STATUS = {
  draft: '草稿',
  pending: '待审核',
  approved: '已审核',
  partial_received: '部分收货',
  received: '已收货',
  completed: '已完成',
  cancelled: '已取消'
};

/**
 * 采购订单状态颜色映射(Vant Tag)
 */
export const PURCHASE_ORDER_STATUS_COLORS = {
  draft: 'default',
  pending: 'warning',
  approved: 'primary',
  partial_received: 'warning',
  received: 'success',
  completed: 'success',
  cancelled: 'danger'
};

/**
 * 销售订单状态映射
 */
export const SALES_ORDER_STATUS = {
  draft: '草稿',
  pending: '待审核',
  confirmed: '已确认',
  approved: '已审核',
  in_production: '生产中',
  partial_shipped: '部分发货',
  shipped: '已发货',
  completed: '已完成',
  cancelled: '已取消'
};

/**
 * 销售订单状态颜色映射(Vant Tag)
 */
export const SALES_ORDER_STATUS_COLORS = {
  draft: 'default',
  pending: 'warning',
  confirmed: 'primary',
  approved: 'primary',
  in_production: 'primary',
  partial_shipped: 'warning',
  shipped: 'success',
  completed: 'success',
  cancelled: 'danger'
};

// ==================== 出库单状态映射 ====================

/**
 * 出库单状态映射
 */
export const OUTBOUND_STATUS = {
  draft: '草稿',
  pending: '待审核',
  approved: '已审核',
  confirmed: '已确认',
  in_progress: '出库中',
  partial: '部分出库',
  completed: '已完成',
  cancelled: '已取消'
};

/**
 * 出库单状态颜色映射(Vant Tag)
 */
export const OUTBOUND_STATUS_COLORS = {
  draft: 'default',
  pending: 'warning',
  approved: 'primary',
  confirmed: 'primary',
  in_progress: 'warning',
  partial: 'warning',
  completed: 'success',
  cancelled: 'danger'
};

/**
 * 出库类型映射
 */
export const OUTBOUND_TYPE = {
  production: '生产领料',
  sales: '销售出库',
  transfer: '调拨出库',
  scrap: '报废出库',
  return: '退货出库',
  other: '其他出库',
  normal: '正常出库',
  sample: '样品出库',
  gift: '赠品出库'
};

/**
 * 出库类型颜色映射(Vant Tag)
 */
export const OUTBOUND_TYPE_COLORS = {
  production: 'primary',
  sales: 'success',
  transfer: 'warning',
  scrap: 'danger',
  return: 'default',
  other: 'default',
  normal: 'success',
  sample: 'warning',
  gift: 'primary'
};

// ==================== 入库单状态映射 ====================

/**
 * 入库单状态映射
 */
export const INBOUND_STATUS = {
  draft: '草稿',
  pending: '待审核',
  confirmed: '已确认',
  completed: '已完成',
  cancelled: '已取消'
};

/**
 * 入库单状态颜色映射(Vant Tag)
 */
export const INBOUND_STATUS_COLORS = {
  draft: 'default',
  pending: 'warning',
  confirmed: 'primary',
  completed: 'success',
  cancelled: 'danger'
};

// ==================== 生产任务状态映射 ====================

/**
 * 生产任务状态映射
 */
export const PRODUCTION_TASK_STATUS = {
  planned: '已计划',
  pending: '待开始',
  in_progress: '进行中',
  paused: '已暂停',
  completed: '已完成',
  cancelled: '已取消'
};

/**
 * 生产任务状态颜色映射(Vant Tag)
 */
export const PRODUCTION_TASK_STATUS_COLORS = {
  planned: 'default',
  pending: 'warning',
  in_progress: 'primary',
  paused: 'warning',
  completed: 'success',
  cancelled: 'danger'
};

// ==================== 质检状态映射 ====================

/**
 * 质检状态映射
 */
export const QUALITY_STATUS = {
  pending: '待检验',
  in_progress: '检验中',
  passed: '合格',
  failed: '不合格',
  partial: '部分合格'
};

/**
 * 质检状态颜色映射(Vant Tag)
 */
export const QUALITY_STATUS_COLORS = {
  pending: 'warning',
  in_progress: 'primary',
  passed: 'success',
  failed: 'danger',
  partial: 'warning'
};

// ==================== 工具函数 ====================

/**
 * 获取状态文本
 * @param {String} category - 状态类别
 * @param {String} status - 状态值
 * @returns {String} 状态文本
 */
export function getStatusText(category, status) {
  const statusMaps = {
    purchaseOrder: PURCHASE_ORDER_STATUS,
    salesOrder: SALES_ORDER_STATUS,
    outbound: OUTBOUND_STATUS,
    inbound: INBOUND_STATUS,
    productionTask: PRODUCTION_TASK_STATUS,
    quality: QUALITY_STATUS
  };
  
  const map = statusMaps[category];
  return map ? (map[status] || status) : status;
}

/**
 * 获取状态颜色
 * @param {String} category - 状态类别
 * @param {String} status - 状态值
 * @returns {String} 状态颜色类型
 */
export function getStatusColor(category, status) {
  const colorMaps = {
    purchaseOrder: PURCHASE_ORDER_STATUS_COLORS,
    salesOrder: SALES_ORDER_STATUS_COLORS,
    outbound: OUTBOUND_STATUS_COLORS,
    inbound: INBOUND_STATUS_COLORS,
    productionTask: PRODUCTION_TASK_STATUS_COLORS,
    quality: QUALITY_STATUS_COLORS
  };
  
  const map = colorMaps[category];
  return map ? (map[status] || 'default') : 'default';
}

/**
 * 获取出库类型文本
 * @param {String} type - 出库类型
 * @returns {String} 类型文本
 */
export function getOutboundTypeText(type) {
  return OUTBOUND_TYPE[type] || type;
}

/**
 * 获取出库类型颜色
 * @param {String} type - 出库类型
 * @returns {String} 类型颜色
 */
export function getOutboundTypeColor(type) {
  return OUTBOUND_TYPE_COLORS[type] || 'default';
}

// 默认导出
export default {
  // 状态映射
  PURCHASE_ORDER_STATUS,
  PURCHASE_ORDER_STATUS_COLORS,
  SALES_ORDER_STATUS,
  SALES_ORDER_STATUS_COLORS,
  OUTBOUND_STATUS,
  OUTBOUND_STATUS_COLORS,
  OUTBOUND_TYPE,
  OUTBOUND_TYPE_COLORS,
  INBOUND_STATUS,
  INBOUND_STATUS_COLORS,
  PRODUCTION_TASK_STATUS,
  PRODUCTION_TASK_STATUS_COLORS,
  QUALITY_STATUS,
  QUALITY_STATUS_COLORS,
  
  // 工具函数
  getStatusText,
  getStatusColor,
  getOutboundTypeText,
  getOutboundTypeColor
};

