/**
 * validationConfig.js
 * @description 验证规则配置管理服务
 * @date 2025-12-13
 * @version 1.0.0
 *
 * 配置优先级：
 * 1. 数据库配置（system_settings表）- 最高优先级
 * 2. 环境变量配置（.env文件）- 中等优先级
 * 3. 默认配置（本文件）- 最低优先级（后备配置）
 */

const { pool } = require('./db');
const { logger } = require('../utils/logger');

// 默认验证规则配置
const DEFAULT_VALIDATION_RULES = {
  // 库存数量验证
  stockQuantity: {
    min: 0,
    max: 999999999,
    precision: 3, // 小数位数
    allowNegative: false,
  },

  // 金额验证
  amount: {
    min: 0,
    max: 999999999.99,
    precision: 2, // 小数位数
    allowNegative: false,
  },

  // 价格验证
  price: {
    min: 0,
    max: 999999.99,
    precision: 2,
    allowNegative: false,
  },

  // 百分比验证
  percentage: {
    min: 0,
    max: 100,
    precision: 2,
    allowNegative: false,
  },

  // 数量验证（整数）
  quantity: {
    min: 1,
    max: 999999,
    precision: 0, // 整数
    allowNegative: false,
  },

  // 重量验证（kg）
  weight: {
    min: 0,
    max: 999999.999,
    precision: 3,
    allowNegative: false,
  },

  // 长度验证（mm）
  length: {
    min: 0,
    max: 999999.99,
    precision: 2,
    allowNegative: false,
  },

  // 文本长度验证
  textLength: {
    code: { min: 1, max: 50 }, // 编码
    name: { min: 1, max: 200 }, // 名称
    description: { min: 0, max: 1000 }, // 描述
    remark: { min: 0, max: 500 }, // 备注
    address: { min: 0, max: 500 }, // 地址
    phone: { min: 0, max: 20 }, // 电话
    email: { min: 0, max: 100 }, // 邮箱
  },

  // 日期验证
  date: {
    minYear: 2000,
    maxYear: 2100,
    allowFutureDate: true,
    allowPastDate: true,
  },

  // 文件上传验证
  fileUpload: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.pdf', '.doc', '.docx', '.xls', '.xlsx'],
    maxFiles: 10,
  },
};

// 配置缓存
let configCache = null;
let cacheTimestamp = null;
const CACHE_TTL = 5 * 60 * 1000; // 5分钟缓存

/**
 * 从数据库加载验证规则配置
 */
async function loadConfigFromDatabase() {
  try {
    const [rows] = await pool.execute('SELECT `value` FROM system_settings WHERE `key` = ?', [
      'validation.rules',
    ]);

    if (rows.length > 0 && rows[0].value) {
      const dbConfig =
        typeof rows[0].value === 'string' ? JSON.parse(rows[0].value) : rows[0].value;

      logger.info('验证规则配置已从数据库加载');
      return dbConfig;
    }
  } catch (error) {
    logger.warn('从数据库加载验证规则配置失败，使用默认配置:', error.message);
  }

  return null;
}

/**
 * 从环境变量加载验证规则配置
 */
function loadConfigFromEnv() {
  const envConfig = {};

  // 金额精度
  if (process.env.VALIDATION_AMOUNT_PRECISION) {
    envConfig.amount = envConfig.amount || {};
    envConfig.amount.precision = parseInt(process.env.VALIDATION_AMOUNT_PRECISION);
  }

  // 库存精度
  if (process.env.VALIDATION_STOCK_PRECISION) {
    envConfig.stockQuantity = envConfig.stockQuantity || {};
    envConfig.stockQuantity.precision = parseInt(process.env.VALIDATION_STOCK_PRECISION);
  }

  // 文件上传大小
  if (process.env.VALIDATION_MAX_FILE_SIZE) {
    envConfig.fileUpload = envConfig.fileUpload || {};
    envConfig.fileUpload.maxSize = parseInt(process.env.VALIDATION_MAX_FILE_SIZE);
  }

  return Object.keys(envConfig).length > 0 ? envConfig : null;
}

/**
 * 深度合并配置对象
 */
function deepMerge(target, source) {
  const result = { ...target };

  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMerge(result[key] || {}, source[key]);
    } else {
      result[key] = source[key];
    }
  }

  return result;
}

/**
 * 获取验证规则配置
 * 配置优先级：数据库 > 环境变量 > 默认配置
 */
async function getValidationRules() {
  // 检查缓存
  const now = Date.now();
  if (configCache && cacheTimestamp && now - cacheTimestamp < CACHE_TTL) {
    return configCache;
  }

  // 从默认配置开始
  let config = { ...DEFAULT_VALIDATION_RULES };

  // 合并环境变量配置
  const envConfig = loadConfigFromEnv();
  if (envConfig) {
    config = deepMerge(config, envConfig);
  }

  // 合并数据库配置（最高优先级）
  const dbConfig = await loadConfigFromDatabase();
  if (dbConfig) {
    config = deepMerge(config, dbConfig);
  }

  // 更新缓存
  configCache = config;
  cacheTimestamp = now;

  return config;
}

/**
 * 获取特定字段的验证规则
 * @param {string} fieldType - 字段类型（stockQuantity, amount等）
 */
async function getFieldRules(fieldType) {
  const allRules = await getValidationRules();
  return allRules[fieldType] || {};
}

/**
 * 验证数值
 * @param {number} value - 要验证的值
 * @param {string} fieldType - 字段类型
 * @returns {object} { valid: boolean, error: string }
 */
async function validateNumber(value, fieldType) {
  const rules = await getFieldRules(fieldType);

  if (value === null || value === undefined || value === '') {
    return { valid: false, error: '值不能为空' };
  }

  const numValue = parseFloat(value);

  if (isNaN(numValue)) {
    return { valid: false, error: '必须是有效的数字' };
  }

  if (!rules.allowNegative && numValue < 0) {
    return { valid: false, error: '不允许负数' };
  }

  if (numValue < rules.min) {
    return { valid: false, error: `值不能小于 ${rules.min}` };
  }

  if (numValue > rules.max) {
    return { valid: false, error: `值不能大于 ${rules.max}` };
  }

  // 检查小数位数
  if (rules.precision !== undefined) {
    const decimalPlaces = (numValue.toString().split('.')[1] || '').length;
    if (decimalPlaces > rules.precision) {
      return { valid: false, error: `小数位数不能超过 ${rules.precision} 位` };
    }
  }

  return { valid: true };
}

/**
 * 验证文本长度
 * @param {string} value - 要验证的值
 * @param {string} textType - 文本类型（code, name等）
 * @returns {object} { valid: boolean, error: string }
 */
async function validateTextLength(value, textType) {
  const rules = await getFieldRules('textLength');
  const typeRules = rules[textType];

  if (!typeRules) {
    return { valid: true }; // 没有规则，默认通过
  }

  const length = (value || '').length;

  if (length < typeRules.min) {
    return { valid: false, error: `长度不能少于 ${typeRules.min} 个字符` };
  }

  if (length > typeRules.max) {
    return { valid: false, error: `长度不能超过 ${typeRules.max} 个字符` };
  }

  return { valid: true };
}

/**
 * 清除配置缓存
 */
function clearCache() {
  configCache = null;
  cacheTimestamp = null;
  logger.info('验证规则配置缓存已清除');
}

/**
 * 更新验证规则配置到数据库
 * @param {object} newConfig - 新的配置对象
 */
async function updateValidationRules(newConfig) {
  try {
    await pool.execute(
      `INSERT INTO system_settings (\`key\`, \`value\`, description)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE \`value\` = VALUES(\`value\`), updated_at = NOW()`,
      ['validation.rules', JSON.stringify(newConfig), '验证规则配置']
    );

    // 清除缓存
    clearCache();

    logger.info('验证规则配置已更新到数据库');
    return true;
  } catch (error) {
    logger.error('更新验证规则配置失败:', error);
    throw error;
  }
}

// 导出配置和方法
module.exports = {
  DEFAULT_VALIDATION_RULES,
  getValidationRules,
  getFieldRules,
  validateNumber,
  validateTextLength,
  clearCache,
  updateValidationRules,
};
