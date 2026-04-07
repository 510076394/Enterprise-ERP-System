/**
 * 通用格式化工具函数
 */

/**
 * 格式化货币金额
 * @param {number|string} amount - 金额
 * @param {string} currency - 货币符号,默认¥
 * @param {number} decimals - 小数位数,默认2
 * @returns {string} 格式化后的金额字符串
 */
export const formatCurrency = (amount, currency = '¥', decimals = 2) => {
    if (amount === undefined || amount === null || amount === '') return `${currency}0.00`;
    const num = parseFloat(amount);
    if (isNaN(num)) return `${currency}0.00`;

    return `${currency}${num.toLocaleString('zh-CN', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    })}`;
};

/**
 * 格式化日期 (YYYY-MM-DD)
 * @param {string|Date} date - 日期
 * @returns {string} 格式化后的日期字符串
 */
export const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
};

/**
 * 格式化日期时间 (YYYY-MM-DD HH:mm:ss)
 * @param {string|Date} date - 日期时间
 * @returns {string} 格式化后的日期时间字符串
 */
export const formatDateTime = (date) => {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

/**
 * 格式化数字（千分位）
 * @param {number|string} num - 数值
 * @param {number} decimals - 小数位数
 * @returns {string}
 */
export const formatNumber = (num, decimals = 2) => {
    if (num === undefined || num === null || num === '') return '0';
    const val = parseFloat(num);
    if (isNaN(val)) return '0';

    return val.toLocaleString('zh-CN', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    });
};
