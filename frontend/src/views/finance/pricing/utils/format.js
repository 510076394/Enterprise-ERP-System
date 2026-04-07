/**
 * 通用格式化工具函数
 */
import dayjs from 'dayjs';

/**
 * 格式化数字为两位小数
 * @param {number} num 数字
 * @returns {string} 格式化后的字符串
 */
export const formatNumber = (num) => Number(num || 0).toFixed(2);

/**
 * 格式化日期为 YYYY-MM-DD
 * @param {string|Date} date 日期
 * @returns {string} 格式化后的日期字符串
 */
export const formatDate = (date) => date ? dayjs(date).format('YYYY-MM-DD') : '-';

/**
 * 格式化日期时间为 YYYY-MM-DD HH:mm
 * @param {string|Date} date 日期时间
 * @returns {string} 格式化后的日期时间字符串
 */
export const formatDateTime = (date) => date ? dayjs(date).format('YYYY-MM-DD HH:mm') : '-';

/**
 * 格式化货币
 * @param {number} amount 金额
 * @param {string} prefix 前缀符号
 * @returns {string} 格式化后的货币字符串
 */
export const formatCurrency = (amount, prefix = '¥') => `${prefix}${formatNumber(amount)}`;
