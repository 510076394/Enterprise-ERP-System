/**
 * desensitizer.js
 * @description 金额等敏感数据脱敏工具
 */

const { logger } = require('./logger');

const SENSITIVE_FIELDS = [
  // 基础字段
  'price',
  'cost_price',
  'amount',
  'total_cost',
  'tax_rate',
  // 引申字段
  'unit_cost',
  'order_price',
  'material_cost',
  'labor_cost',
  'overhead_cost',
  'standard_price',
  'actual_cost',
  'standard_cost',
  'unitCost',
  'costPrice',
  'actualCost',
  'taxRate',
  'totalCost',
  'orderPrice'
];

/**
 * 遍历对象或数组，把匹配到的敏感字段设为 null
 * @param {any} data 要遍历的数据 
 * @param {boolean} hasPermission 是否有权限
 */
function desensitizeData(data, hasPermission) {
  // 如果有财务权限，直接放行数据
  if (hasPermission) return data;
  if (!data) return data;

  if (Array.isArray(data)) {
    data.forEach(item => desensitizeData(item, hasPermission));
  } else if (typeof data === 'object') {
    Object.keys(data).forEach(key => {
      // 匹配关键字或者是数组/对象继续深入
      if (SENSITIVE_FIELDS.includes(key)) {
        data[key] = null; 
      } else if (typeof data[key] === 'object') {
         desensitizeData(data[key], hasPermission);
      }
    });
  }
  return data;
}

/**
 * 权限判断：检查是否有配置在 system.roles 或用户 permissions 里的 finance 权限
 * @param {Object} user req.user对象
 */
function hasFinancePermission(user) {
  // 检查 user 对象是否有相关权限标识
  if (!user) return false;
  
  // 对于超级管理员或特定白名单用户，可增加硬编码用户名检查（例如 'admin'）
  if (user.username === 'admin') return true;

  // 如果含有 finance 相关 role，则放行
  if (user.roles && (user.roles.includes('FINANCE') || user.roles.includes('ADMIN') || user.roles.includes('财务'))) {
     return true;
  }
  
  // 检查具体权限词
  if (user.permissions && (user.permissions.includes('finance:view') || user.permissions.includes('finance:view_cost'))) {
     return true;
  }
  
  return false;
}

module.exports = {
  desensitizeData,
  hasFinancePermission
};
