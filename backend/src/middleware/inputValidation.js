/**
 * 全局输入验证和清理中间件
 * @description 防止XSS、SQL注入和其他恶意输入
 * @date 2025-11-21
 */

const validator = require('validator');
const { logger } = require('../utils/logger');

/**
 * XSS防护 - 清理HTML标签
 * @param {string} input - 输入字符串
 * @returns {string} 清理后的字符串
 */
const sanitizeHTML = (input) => {
  if (typeof input !== 'string') {
    return input;
  }

  // 转义HTML特殊字符
  return validator.escape(input);
};

// 不需要 HTML 转义的字段（文件路径、URL、规格型号等）
const SKIP_SANITIZE_FIELDS = [
  'attachment',
  'file_path',
  'filePath',
  'fileUrl',
  'url',
  'instructionDocs',
  'path',
  'image_url',
  'avatar',
  'logo',
  'specs',
  'specification',
  'model',
  'drawing_no',
  'color_code', // 物料规格相关字段
  'name', // 物料名称、产品名称等，可能包含特殊字符（如：水平/垂直可调整型）
  'location_detail',
  'location', // 库位详细位置，可能包含特殊字符（如：J1-01-02/J1-01-03）
];

/**
 * 检查字段是否应该跳过 HTML 转义
 * @param {string} key - 字段名
 * @param {string} value - 字段值
 * @returns {boolean}
 */
const shouldSkipSanitize = (key, value) => {
  // 跳过白名单字段
  if (SKIP_SANITIZE_FIELDS.includes(key)) {
    return true;
  }
  // 跳过以 /uploads/ 开头的值（文件路径）
  if (typeof value === 'string' && value.startsWith('/uploads/')) {
    return true;
  }
  return false;
};

/**
 * 递归清理对象中的所有字符串
 * @param {*} obj - 要清理的对象
 * @param {number} depth - 当前递归深度
 * @param {number} maxDepth - 最大递归深度
 * @param {string} currentKey - 当前字段名
 * @returns {*} 清理后的对象
 */
const sanitizeObject = (obj, depth = 0, maxDepth = 10, currentKey = '') => {
  // 防止递归过深
  if (depth > maxDepth) {
    logger.warn('对象递归深度超过限制');
    return obj;
  }

  if (typeof obj === 'string') {
    // 跳过文件路径等特殊字段
    if (shouldSkipSanitize(currentKey, obj)) {
      return obj;
    }
    return sanitizeHTML(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map((item, index) => sanitizeObject(item, depth + 1, maxDepth, currentKey));
  }

  if (obj !== null && typeof obj === 'object') {
    const sanitized = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        sanitized[key] = sanitizeObject(obj[key], depth + 1, maxDepth, key);
      }
    }
    return sanitized;
  }

  return obj;
};

/**
 * 验证和清理输入的中间件
 */
const validateAndSanitizeInput = (req, res, next) => {
  try {
    // 跳过文件上传请求
    if (req.is('multipart/form-data')) {
      return next();
    }

    // 清理请求体
    if (req.body && Object.keys(req.body).length > 0) {
      req.body = sanitizeObject(req.body);
    }

    // 清理查询参数
    if (req.query && Object.keys(req.query).length > 0) {
      req.query = sanitizeObject(req.query);
    }

    // 清理URL参数
    if (req.params && Object.keys(req.params).length > 0) {
      req.params = sanitizeObject(req.params);
    }

    next();
  } catch (error) {
    logger.error('输入验证失败:', error);
    res.status(400).json({
      success: false,
      message: '输入数据格式错误',
      code: 'INVALID_INPUT',
    });
  }
};

/**
 * 验证必需字段
 * @param {Array<string>} fields - 必需字段列表
 * @returns {Function} Express中间件
 */
const requireFields = (fields) => {
  return (req, res, next) => {
    const missingFields = [];

    for (const field of fields) {
      if (req.body[field] === undefined || req.body[field] === null || req.body[field] === '') {
        missingFields.push(field);
      }
    }

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `缺少必需字段: ${missingFields.join(', ')}`,
        code: 'MISSING_REQUIRED_FIELDS',
        details: { missingFields },
      });
    }

    next();
  };
};

/**
 * 验证邮箱格式
 * @param {string} fieldName - 字段名
 * @returns {Function} Express中间件
 */
const validateEmail = (fieldName = 'email') => {
  return (req, res, next) => {
    const email = req.body[fieldName];

    if (!email) {
      return next();
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({
        success: false,
        message: `${fieldName} 格式无效`,
        code: 'INVALID_EMAIL',
      });
    }

    next();
  };
};

/**
 * 验证手机号格式（中国大陆）
 * @param {string} fieldName - 字段名
 * @returns {Function} Express中间件
 */
const validatePhone = (fieldName = 'phone') => {
  return (req, res, next) => {
    const phone = req.body[fieldName];

    if (!phone) {
      return next();
    }

    // 中国大陆手机号正则
    const phoneRegex = /^1[3-9]\d{9}$/;

    if (!phoneRegex.test(phone)) {
      return res.status(400).json({
        success: false,
        message: `${fieldName} 格式无效`,
        code: 'INVALID_PHONE',
      });
    }

    next();
  };
};

/**
 * 验证字符串长度
 * @param {string} fieldName - 字段名
 * @param {Object} options - 选项 { min, max }
 * @returns {Function} Express中间件
 */
const validateLength = (fieldName, options = {}) => {
  const { min = 0, max = Infinity } = options;

  return (req, res, next) => {
    const value = req.body[fieldName];

    if (!value) {
      return next();
    }

    if (typeof value !== 'string') {
      return res.status(400).json({
        success: false,
        message: `${fieldName} 必须是字符串`,
        code: 'INVALID_TYPE',
      });
    }

    const length = value.length;

    if (length < min || length > max) {
      return res.status(400).json({
        success: false,
        message: `${fieldName} 长度必须在 ${min} 到 ${max} 之间`,
        code: 'INVALID_LENGTH',
        details: { min, max, actual: length },
      });
    }

    next();
  };
};

/**
 * 验证数值范围
 * @param {string} fieldName - 字段名
 * @param {Object} options - 选项 { min, max }
 * @returns {Function} Express中间件
 */
const validateRange = (fieldName, options = {}) => {
  const { min = -Infinity, max = Infinity } = options;

  return (req, res, next) => {
    const value = req.body[fieldName];

    if (value === undefined || value === null) {
      return next();
    }

    const num = Number(value);

    if (isNaN(num)) {
      return res.status(400).json({
        success: false,
        message: `${fieldName} 必须是数字`,
        code: 'INVALID_NUMBER',
      });
    }

    if (num < min || num > max) {
      return res.status(400).json({
        success: false,
        message: `${fieldName} 必须在 ${min} 到 ${max} 之间`,
        code: 'OUT_OF_RANGE',
        details: { min, max, actual: num },
      });
    }

    next();
  };
};

/**
 * 验证日期格式
 * @param {string} fieldName - 字段名
 * @returns {Function} Express中间件
 */
const validateDate = (fieldName) => {
  return (req, res, next) => {
    const dateStr = req.body[fieldName];

    if (!dateStr) {
      return next();
    }

    if (!validator.isISO8601(dateStr)) {
      return res.status(400).json({
        success: false,
        message: `${fieldName} 日期格式无效，请使用ISO8601格式`,
        code: 'INVALID_DATE',
      });
    }

    next();
  };
};

/**
 * 防止SQL注入 - 检测危险字符
 * @param {*} input - 输入
 * @returns {boolean} 是否包含危险字符
 */
const containsSQLInjection = (input) => {
  if (typeof input !== 'string') {
    return false;
  }

  // SQL注入常见模式
  // 注意：移除了单独的 * 字符检测，因为在物料规格中 * 常用作乘号（如：400x600*120mm）
  // 保留 /* 和 */ 的检测（SQL注释语法）
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/i,
    /(UNION\s+SELECT)/i,
    /(OR\s+1\s*=\s*1)/i,
    /(AND\s+1\s*=\s*1)/i,
    /('|;|--)/, // 单引号、分号、双横线注释
    /(\/\*|\*\/)/, // SQL块注释标记
  ];

  return sqlPatterns.some((pattern) => pattern.test(input));
};

/**
 * SQL注入检测中间件
 */
const detectSQLInjection = (req, res, next) => {
  // 跳过富文本内容字段的检查（HTML内容可能包含类似SQL的模式）
  const shouldSkipPath = (path) => {
    // 打印模板API的HTML内容字段
    if (req.path.startsWith('/api/print/')) {
      if (
        path === 'content' ||
        path === 'header_html' ||
        path === 'footer_html' ||
        path === 'body_html'
      ) {
        return true;
      }
    }
    // 技术交流API的富文本内容字段
    if (req.path.startsWith('/api/technical-communications')) {
      if (path === 'content' || path === 'solution' || path === 'description') {
        return true;
      }
    }
    // 附件/文件路径字段 - 这些字段包含合法的文件路径，不应该被SQL注入检测拦截
    const attachmentFields = [
      'attachment',
      'file_path',
      'fileUrl',
      'filePath',
      'url',
      'instructionDocs',
    ];
    if (
      attachmentFields.some(
        (field) => path.endsWith(field) || path.includes('.attachment') || path.includes('.url')
      )
    ) {
      return true;
    }
    // 物料规格相关字段 - 可能包含 / * 等特殊字符（如：K22/25、400*600*120mm、水平/垂直可调整型、J1-01-02/J1-01-03）
    // avatar 和 bio 字段也需要跳过，因为 base64 图片数据可能触发误报
    // issue_reason 和 reason 字段可能包含分号作为分隔符（如：丢件;损坏）
    const specFields = [
      'specs',
      'specification',
      'model',
      'drawing_no',
      'color_code',
      'remark',
      'remarks',
      'description',
      'name',
      'location_detail',
      'location',
      'avatar',
      'bio',
      'issue_reason',
      'reason',
    ];
    if (specFields.some((field) => path.endsWith(field))) {
      return true;
    }
    return false;
  };

  const checkInput = (obj, path = '') => {
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const value = obj[key];
        const currentPath = path ? `${path}.${key}` : key;

        // 跳过特定路径
        if (shouldSkipPath(currentPath)) {
          continue;
        }

        if (typeof value === 'string' && containsSQLInjection(value)) {
          logger.warn('检测到可疑的SQL注入尝试', {
            path: currentPath,
            value: value.substring(0, 100), // 只记录前100个字符
            ip: req.ip,
            user: req.user?.id,
          });

          return res.status(403).json({
            success: false,
            message: '检测到非法输入',
            code: 'SUSPICIOUS_INPUT',
          });
        }

        if (typeof value === 'object' && value !== null) {
          const result = checkInput(value, currentPath);
          if (result) return result;
        }
      }
    }
  };

  // 检查请求体、查询参数和URL参数
  // 如果检测到注入，checkInput会返回响应对象，需要立即终止
  if (checkInput(req.body || {})) return;
  if (checkInput(req.query || {})) return;
  if (checkInput(req.params || {})) return;

  next();
};

module.exports = {
  validateAndSanitizeInput,
  requireFields,
  validateEmail,
  validatePhone,
  validateLength,
  validateRange,
  validateDate,
  detectSQLInjection,
  sanitizeHTML,
  sanitizeObject,
};
