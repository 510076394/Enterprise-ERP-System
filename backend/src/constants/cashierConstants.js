/**
 * 出纳管理模块常量配置
 *
 * 统一管理出纳管理模块中使用的所有常量，包括：
 * - 交易类型定义
 * - 账户类型定义
 * - 货币代码定义
 * - 状态码定义
 * - 错误消息定义
 * - 业务规则配置
 *
 * @author 系统开发团队
 * @version 2.0.0
 * @since 2025-01-01
 */

// ==================== 银行交易类型 ====================
const BANK_TRANSACTION_TYPES = {
  DEPOSIT: '存款', // 存款
  WITHDRAWAL: '取款', // 取款
  TRANSFER_IN: '转入', // 转入
  TRANSFER_OUT: '转出', // 转出
  INTEREST: '利息', // 利息收入
  FEE: '费用', // 银行费用
};

// 银行交易类型分组（用于余额计算）
const BANK_TRANSACTION_GROUPS = {
  INCOME: [
    BANK_TRANSACTION_TYPES.DEPOSIT,
    BANK_TRANSACTION_TYPES.TRANSFER_IN,
    BANK_TRANSACTION_TYPES.INTEREST,
  ],
  EXPENSE: [
    BANK_TRANSACTION_TYPES.WITHDRAWAL,
    BANK_TRANSACTION_TYPES.TRANSFER_OUT,
    BANK_TRANSACTION_TYPES.FEE,
  ],
};

// ==================== 现金交易类型 ====================
const CASH_TRANSACTION_TYPES = {
  INCOME: 'income', // 收入
  EXPENSE: 'expense', // 支出
};

// ==================== 现金交易分类 ====================
const CASH_TRANSACTION_CATEGORIES = {
  // 收入类别
  INCOME: {
    SALES: 'sales', // 销售收入
    OTHER_INCOME: 'other_income', // 其他收入
  },
  // 支出类别
  EXPENSE: {
    OFFICE: 'office', // 办公费用
    TRAVEL: 'travel', // 差旅费
    MEAL: 'meal', // 餐饮费
    OTHER_EXPENSE: 'other_expense', // 其他支出
  },
};

// ==================== 账户类型 ====================
const ACCOUNT_TYPES = {
  CURRENT: '活期', // 活期账户
  FIXED: '定期', // 定期账户
  NOTICE: '通知', // 通知存款
  SPECIAL: '专用', // 专用账户
};

// ==================== 货币代码 ====================
const CURRENCY_CODES = {
  CNY: 'CNY', // 人民币
  USD: 'USD', // 美元
  EUR: 'EUR', // 欧元
  JPY: 'JPY', // 日元
  HKD: 'HKD', // 港币
};

// ==================== 账户状态 ====================
const ACCOUNT_STATUS = {
  ACTIVE: true, // 激活
  FROZEN: false, // 冻结
};

// ==================== 对账状态 ====================
const RECONCILIATION_STATUS = {
  UNRECONCILED: false, // 未对账
  RECONCILED: true, // 已对账
};

// ==================== 分页配置 ====================
const PAGINATION_CONFIG = {
  DEFAULT_PAGE: 1, // 默认页码
  DEFAULT_PAGE_SIZE: 20, // 默认每页记录数
  MAX_PAGE_SIZE: 100, // 最大每页记录数
  MIN_PAGE_SIZE: 1, // 最小每页记录数
};

// ==================== 业务规则配置 ====================
const BUSINESS_RULES = {
  // 金额精度（小数位数）
  AMOUNT_PRECISION: 2,

  // 最大金额限制
  MAX_AMOUNT: 999999999.99,

  // 最小金额限制
  MIN_AMOUNT: 0.01,

  // 账号长度限制
  ACCOUNT_NUMBER_MIN_LENGTH: 10,
  ACCOUNT_NUMBER_MAX_LENGTH: 30,

  // 描述长度限制
  DESCRIPTION_MAX_LENGTH: 500,

  // 参考号长度限制
  REFERENCE_NUMBER_MAX_LENGTH: 50,
};

// ==================== 错误消息 ====================
const ERROR_MESSAGES = {
  // 通用错误
  INVALID_ID: '无效的ID参数',
  INVALID_AMOUNT: '无效的金额',
  INVALID_DATE: '无效的日期格式',
  INVALID_PAGINATION: '无效的分页参数',

  // 银行账户相关错误
  BANK_ACCOUNT_NOT_FOUND: '银行账户不存在',
  BANK_ACCOUNT_FROZEN: '银行账户已冻结',
  INSUFFICIENT_BALANCE: '账户余额不足',
  DUPLICATE_ACCOUNT_NUMBER: '银行账号已存在',

  // 交易相关错误
  TRANSACTION_NOT_FOUND: '交易记录不存在',
  INVALID_TRANSACTION_TYPE: '不支持的交易类型',
  TRANSACTION_ALREADY_RECONCILED: '交易已对账，无法修改',

  // 文件相关错误
  FILE_NOT_PROVIDED: '请选择要上传的文件',
  INVALID_FILE_FORMAT: '不支持的文件格式',
  FILE_SIZE_EXCEEDED: '文件大小超出限制',

  // 数据库相关错误
  DATABASE_CONNECTION_ERROR: '数据库连接失败',
  TRANSACTION_ROLLBACK: '事务回滚',
  DATA_INTEGRITY_ERROR: '数据完整性错误',
};

// ==================== 成功消息 ====================
const SUCCESS_MESSAGES = {
  // 银行账户操作
  BANK_ACCOUNT_CREATED: '银行账户创建成功',
  BANK_ACCOUNT_UPDATED: '银行账户更新成功',
  BANK_ACCOUNT_DELETED: '银行账户删除成功',
  BANK_ACCOUNT_STATUS_UPDATED: '银行账户状态更新成功',

  // 银行交易操作
  BANK_TRANSACTION_CREATED: '银行交易创建成功',
  BANK_TRANSACTION_UPDATED: '银行交易更新成功',
  BANK_TRANSACTION_DELETED: '银行交易删除成功',
  BANK_TRANSACTION_RECONCILED: '银行交易对账成功',

  // 现金交易操作
  CASH_TRANSACTION_CREATED: '现金交易创建成功',
  CASH_TRANSACTION_UPDATED: '现金交易更新成功',
  CASH_TRANSACTION_DELETED: '现金交易删除成功',

  // 文件操作
  FILE_EXPORTED: '文件导出成功',
  FILE_IMPORTED: '文件导入成功',

  // 数据操作
  DATA_RETRIEVED: '数据获取成功',
  STATISTICS_CALCULATED: '统计数据计算成功',
  BALANCE_RECALCULATED: '余额重新计算成功',
};

// ==================== 日志级别 ====================
const LOG_LEVELS = {
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
  DEBUG: 'debug',
};

// ==================== 导出配置 ====================
const EXPORT_CONFIG = {
  // Excel文件配置
  EXCEL: {
    MAX_ROWS: 10000, // 最大导出行数
    SHEET_NAME: '交易记录', // 工作表名称
    FILE_EXTENSION: '.xlsx', // 文件扩展名
  },

  // CSV文件配置
  CSV: {
    DELIMITER: ',', // 分隔符
    ENCODING: 'utf8', // 编码格式
    FILE_EXTENSION: '.csv', // 文件扩展名
  },
};

// ==================== 验证规则 ====================
const VALIDATION_RULES = {
  // 金额验证
  AMOUNT: {
    min: BUSINESS_RULES.MIN_AMOUNT,
    max: BUSINESS_RULES.MAX_AMOUNT,
    precision: BUSINESS_RULES.AMOUNT_PRECISION,
  },

  // 账号验证
  ACCOUNT_NUMBER: {
    minLength: BUSINESS_RULES.ACCOUNT_NUMBER_MIN_LENGTH,
    maxLength: BUSINESS_RULES.ACCOUNT_NUMBER_MAX_LENGTH,
    pattern: /^[0-9]+$/, // 只允许数字
  },

  // 描述验证
  DESCRIPTION: {
    maxLength: BUSINESS_RULES.DESCRIPTION_MAX_LENGTH,
  },

  // 参考号验证
  REFERENCE_NUMBER: {
    maxLength: BUSINESS_RULES.REFERENCE_NUMBER_MAX_LENGTH,
  },
};

module.exports = {
  BANK_TRANSACTION_TYPES,
  BANK_TRANSACTION_GROUPS,
  CASH_TRANSACTION_TYPES,
  CASH_TRANSACTION_CATEGORIES,
  ACCOUNT_TYPES,
  CURRENCY_CODES,
  ACCOUNT_STATUS,
  RECONCILIATION_STATUS,
  PAGINATION_CONFIG,
  BUSINESS_RULES,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  LOG_LEVELS,
  EXPORT_CONFIG,
  VALIDATION_RULES,
};
