/**
 * rateLimiter.js
 * @description API限流中间件
 * @date 2026-01-23
 * @version 1.0.0
 */

const rateLimit = require('express-rate-limit');
const { logger } = require('../utils/logger');

// 通用API限流：15分钟内最多1000次请求
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: '请求过于频繁，请稍后再试',
    code: 'RATE_LIMIT_EXCEEDED',
  },
  handler: (req, res, next, options) => {
    logger.warn(`API Rate Limit Exceeded: ${req.ip} -> ${req.originalUrl}`);
    res.status(options.statusCode).json(options.message);
  },
});

// 登录/认证接口限流：15分钟内最多10次失败尝试（更严格）
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20, // 允许稍微多一点，防止误杀
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: '登录尝试次数过多，请15分钟后再试',
    code: 'AUTH_RATE_LIMIT_EXCEEDED',
  },
  handler: (req, res, next, options) => {
    logger.warn(`Auth Rate Limit Exceeded: ${req.ip}`);
    res.status(options.statusCode).json(options.message);
  },
});

// 导出限流器
module.exports = {
  apiLimiter,
  authLimiter,
};
