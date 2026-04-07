/**
 * 财务模块公共工具函数
 * 提取自 BankAccounts.vue, Transactions.vue, Reconciliation.vue
 */

/**
 * 格式化货币金额
 * @param {number} amount - 金额
 * @param {string} currency - 货币符号,默认¥
 * @returns {string} 格式化后的金额字符串
 */
export const formatCurrency = (amount, currency = '¥') => {
    if (amount === undefined || amount === null) return `${currency}0.00`;
    const num = parseFloat(amount);
    return `${currency}${num.toLocaleString('zh-CN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })}`;
};

/**
 * 获取交易类型显示文本
 * @param {string} type - 交易类型
 * @returns {string} 显示文本
 */
export const getTransactionTypeText = (type) => {
    const typeMap = {
        income: '收入',
        expense: '支出',
        transfer: '转账',
        '收入': '收入',
        '支出': '支出',
        '存款': '存款',
        '取款': '取款',
        '转入': '转入',
        '转出': '转出',
        '利息': '利息',
        '费用': '费用'
    };
    return typeMap[type] || type || '';
};

/**
 * 获取交易类型标签样式
 * @param {string} type - 交易类型
 * @returns {string} Element Plus标签类型
 */
export const getTransactionTagType = (type) => {
    const typeMap = {
        income: 'success',
        expense: 'danger',
        transfer: 'info',
        '存款': 'success',
        '取款': 'danger',
        '转入': 'success',
        '转出': 'warning',
        '利息': 'success',
        '费用': 'danger'
    };
    return typeMap[type] || 'info';
};

/**
 * 获取分类显示文本
 * @param {string} category - 分类代码
 * @returns {string} 显示文本
 */
export const getCategoryDisplayText = (category) => {
    const categoryMap = {
        'sales_income': '销售收入',
        'investment_income': '投资收益',
        'interest_income': '利息收入',
        'other_income': '其他收入',
        'purchase_expense': '采购支出',
        'salary_expense': '工资支出',
        'rent_expense': '租金支出',
        'utility_expense': '水电费',
        'office_expense': '办公费用',
        'other_expense': '其他支出',
        'internal_transfer': '内部转账',
        'fund_allocation': '资金调拨'
    };
    return categoryMap[category] || category || '';
};

/**
 * 获取支付方式显示文本
 * @param {string} method - 支付方式代码
 * @returns {string} 显示文本
 */
export const getPaymentMethodDisplayText = (method) => {
    const methodMap = {
        'cash': '现金',
        'bank_transfer': '银行转账',
        'check': '支票',
        'credit_card': '信用卡',
        'electronic_payment': '电子支付'
    };
    return methodMap[method] || method || '';
};

/**
 * 获取币种显示文本
 * @param {string} currency - 币种代码
 * @returns {string} 显示文本
 */
export const getCurrencyText = (currency) => {
    const currencyMap = {
        CNY: '人民币',
        USD: '美元',
        EUR: '欧元',
        JPY: '日元',
        GBP: '英镑'
    };
    return currencyMap[currency] || currency || '';
};

/**
 * 获取账户状态类型
 * @param {string} status - 状态
 * @returns {string} Element Plus标签类型
 */
export const getAccountStatusType = (status) => {
    const statusMap = {
        active: 'success',
        frozen: 'warning',
        closed: 'info'
    };
    return statusMap[status] || 'info';
};

/**
 * 获取账户状态文本
 * @param {string} status - 状态
 * @returns {string} 显示文本
 */
export const getAccountStatusText = (status) => {
    const statusMap = {
        active: '正常',
        frozen: '冻结',
        closed: '已注销'
    };
    return statusMap[status] || status || '';
};

/**
 * 格式化日期，只显示年月日
 * @param {string} dateStr - 日期字符串
 * @returns {string} 格式化后的日期
 */
export const formatDate = (dateStr) => {
    if (!dateStr) return '';
    if (typeof dateStr === 'string' && dateStr.includes('T')) {
        return dateStr.split('T')[0];
    }
    return dateStr;
};

/**
 * 获取金额样式类
 * @param {string} type - 交易类型
 * @returns {string} CSS类名
 */
export const getAmountClass = (type) => {
    if (['income', '存款', '转入', '利息'].includes(type)) {
        return 'positive-value';
    } else if (['expense', '取款', '转出', '费用'].includes(type)) {
        return 'negative-value';
    }
    return '';
};
