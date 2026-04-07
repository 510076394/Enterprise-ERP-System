/**
 * formatters.js
 * @description 移动端格式化工具函数
 * @author ERP开发团队
 * @date 2025-01-27
 * @version 1.0.0
 */

import { formatDate as formatDateUtil } from './date';

/**
 * 格式化金额
 * @param {Number} amount - 金额
 * @param {Number} decimals - 小数位数
 * @returns {String} 格式化后的金额
 */
export function formatAmount(amount, decimals = 2) {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '0.00';
  }
  return Number(amount).toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * 格式化货币
 * @param {Number} amount - 金额
 * @param {String} currency - 货币符号
 * @param {Number} decimals - 小数位数
 * @returns {String} 格式化后的货币字符串
 */
export function formatCurrency(amount, currency = '¥', decimals = 2) {
  return `${currency}${formatAmount(amount, decimals)}`;
}

/**
 * 格式化日期
 * @param {String|Date} date - 日期
 * @param {String} format - 格式
 * @returns {String} 格式化后的日期
 */
export function formatDate(date, format = 'YYYY-MM-DD') {
  return formatDateUtil(date, format);
}

/**
 * 格式化百分比
 * @param {Number} value - 数值
 * @param {Number} total - 总数
 * @param {Number} decimals - 小数位数
 * @returns {String} 格式化后的百分比
 */
export function formatPercent(value, total, decimals = 2) {
  if (!total || total === 0) return '0.00%';
  const percent = (value / total) * 100;
  return `${percent.toFixed(decimals)}%`;
}

/**
 * 格式化数量
 * @param {Number} quantity - 数量
 * @param {String} unit - 单位
 * @param {Number} decimals - 小数位数
 * @returns {String} 格式化后的数量
 */
export function formatQuantity(quantity, unit = '', decimals = 2) {
  if (quantity === null || quantity === undefined || isNaN(quantity)) {
    return `0${unit}`;
  }
  const formatted = Number(quantity).toFixed(decimals);
  return unit ? `${formatted}${unit}` : formatted;
}

/**
 * 格式化文件大小
 * @param {Number} bytes - 字节数
 * @returns {String} 格式化后的文件大小
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

/**
 * 格式化手机号
 * @param {String} phone - 手机号
 * @returns {String} 格式化后的手机号
 */
export function formatPhone(phone) {
  if (!phone) return '';
  const cleaned = phone.toString().replace(/\D/g, '');
  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{3})(\d{4})(\d{4})/, '$1 $2 $3');
  }
  return phone;
}

/**
 * 格式化银行卡号
 * @param {String} cardNo - 银行卡号
 * @returns {String} 格式化后的银行卡号
 */
export function formatBankCard(cardNo) {
  if (!cardNo) return '';
  const cleaned = cardNo.toString().replace(/\s/g, '');
  return cleaned.replace(/(\d{4})(?=\d)/g, '$1 ');
}

/**
 * 隐藏手机号中间4位
 * @param {String} phone - 手机号
 * @returns {String} 隐藏后的手机号
 */
export function hiddenPhone(phone) {
  if (!phone) return '';
  return phone.toString().replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
}

/**
 * 隐藏身份证号中间部分
 * @param {String} idCard - 身份证号
 * @returns {String} 隐藏后的身份证号
 */
export function hiddenIdCard(idCard) {
  if (!idCard) return '';
  return idCard.toString().replace(/(\d{6})\d{8}(\d{4})/, '$1********$2');
}

/**
 * 格式化时长(秒转为时分秒)
 * @param {Number} seconds - 秒数
 * @returns {String} 格式化后的时长
 */
export function formatDuration(seconds) {
  if (!seconds || seconds < 0) return '0秒';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  const parts = [];
  if (hours > 0) parts.push(`${hours}小时`);
  if (minutes > 0) parts.push(`${minutes}分钟`);
  if (secs > 0 || parts.length === 0) parts.push(`${secs}秒`);
  
  return parts.join('');
}

/**
 * 格式化相对时间
 * @param {String|Date} date - 日期
 * @returns {String} 相对时间描述
 */
export function formatRelativeTime(date) {
  if (!date) return '';
  
  const now = new Date();
  const target = new Date(date);
  const diff = now - target;
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (seconds < 60) return '刚刚';
  if (minutes < 60) return `${minutes}分钟前`;
  if (hours < 24) return `${hours}小时前`;
  if (days < 7) return `${days}天前`;
  
  return formatDate(date);
}

/**
 * 截断文本
 * @param {String} text - 文本
 * @param {Number} maxLength - 最大长度
 * @param {String} suffix - 后缀
 * @returns {String} 截断后的文本
 */
export function truncateText(text, maxLength = 50, suffix = '...') {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + suffix;
}

/**
 * 高亮关键词
 * @param {String} text - 文本
 * @param {String} keyword - 关键词
 * @returns {String} 高亮后的HTML
 */
export function highlightKeyword(text, keyword) {
  if (!text || !keyword) return text;
  const regex = new RegExp(`(${keyword})`, 'gi');
  return text.replace(regex, '<span class="highlight">$1</span>');
}

// 默认导出
export default {
  formatAmount,
  formatCurrency,
  formatDate,
  formatPercent,
  formatQuantity,
  formatFileSize,
  formatPhone,
  formatBankCard,
  hiddenPhone,
  hiddenIdCard,
  formatDuration,
  formatRelativeTime,
  truncateText,
  highlightKeyword
};

