/**
 * date.js
 * @description 移动端应用文件
  * @date 2025-08-27
 * @version 1.0.0
 */

import dayjs from 'dayjs';

/**
 * 获取当前日期，格式为YYYY-MM-DD
 * @returns {string} 当前日期
 */
export const getCurrentDate = () => {
  return dayjs().format('YYYY-MM-DD');
};

/**
 * 格式化日期
 * @param {string|Date} date 日期
 * @param {string} format 格式，默认为YYYY-MM-DD
 * @returns {string} 格式化后的日期
 */
export const formatDate = (date, format = 'YYYY-MM-DD') => {
  if (!date) return '';
  return dayjs(date).format(format);
};

/**
 * 计算两个日期之间的天数差
 * @param {string|Date} start 开始日期
 * @param {string|Date} end 结束日期
 * @returns {number} 天数差
 */
export const dayDiff = (start, end) => {
  return dayjs(end).diff(dayjs(start), 'day');
};

/**
 * 获取时间段选项，用于日期范围选择
 * @returns {Array} 时间段选项
 */
export const getDateRangeOptions = () => {
  const today = dayjs();
  const yesterday = dayjs().subtract(1, 'day');
  const lastWeek = dayjs().subtract(1, 'week');
  const lastMonth = dayjs().subtract(1, 'month');

  return [
    {
      text: '今天',
      value: [
        today.format('YYYY-MM-DD'),
        today.format('YYYY-MM-DD')
      ]
    },
    {
      text: '昨天',
      value: [
        yesterday.format('YYYY-MM-DD'),
        yesterday.format('YYYY-MM-DD')
      ]
    },
    {
      text: '最近7天',
      value: [
        lastWeek.format('YYYY-MM-DD'),
        today.format('YYYY-MM-DD')
      ]
    },
    {
      text: '最近30天',
      value: [
        lastMonth.format('YYYY-MM-DD'),
        today.format('YYYY-MM-DD')
      ]
    }
  ];
}; 