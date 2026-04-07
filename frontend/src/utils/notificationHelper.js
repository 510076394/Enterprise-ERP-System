/**
 * 通知类型映射工具模块
 * @description 统一管理通知图标、颜色、标签等映射关系（DRY 原则）
 */

import {
  InfoFilled,
  Warning,
  CircleCheck,
  Document,
} from '@element-plus/icons-vue'

/**
 * 获取通知类型对应的图标组件
 */
export function getNotificationIcon(type) {
  const iconMap = {
    system: InfoFilled,
    business: Document,
    warning: Warning,
    inventory_alert: Warning,
    inventory_warning: Warning,
    overdue_invoice: Warning,
    info: CircleCheck,
  }
  return iconMap[type] || InfoFilled
}

/**
 * 获取通知类型对应的颜色
 */
export function getNotificationColor(type) {
  const colorMap = {
    system: '#409EFF',
    business: '#67C23A',
    warning: '#F56C6C',
    inventory_alert: '#F56C6C',
    inventory_warning: '#E6A23C',
    overdue_invoice: '#F56C6C',
    info: '#909399',
  }
  return colorMap[type] || '#409EFF'
}

/**
 * 获取通知类型对应的 ElTag type
 */
export function getTypeTag(type) {
  const tagMap = {
    system: 'primary',
    business: 'success',
    warning: 'danger',
    inventory_alert: 'danger',
    inventory_warning: 'warning',
    overdue_invoice: 'danger',
    info: 'info',
  }
  return tagMap[type] || 'info'
}

/**
 * 获取通知类型对应的中文文本
 */
export function getTypeText(type) {
  const textMap = {
    system: '系统通知',
    business: '业务通知',
    warning: '预警通知',
    inventory_alert: '库存告警',
    inventory_warning: '库存预警',
    overdue_invoice: '逾期提醒',
    info: '信息通知',
  }
  return textMap[type] || type
}

/**
 * 预警相关通知类型列表（用于筛选）
 */
export const WARNING_TYPES = 'warning,inventory_alert,inventory_warning,overdue_invoice'

/**
 * 格式化通知时间为相对时间
 */
export function formatNotificationTime(time) {
  if (!time) return ''
  const date = new Date(time)
  const now = new Date()
  const diff = now - date
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`

  return date.toLocaleString('zh-CN')
}
