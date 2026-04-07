/**
 * auth.js
 * @description 认证中间件 - 统一代理到 authEnhanced.js
 * @date 2025-12-15
 * @version 3.0.0
 *
 * ✅ 重构: 原 auth.js 与 authEnhanced.js 功能重复，
 * 现统一使用 authEnhanced.js 的实现，此文件仅作为兼容层。
 * 所有路由无需修改引用路径。
 */

const {
  authenticateToken,
  optionalAuth,
  authenticateRefreshToken,
} = require('./authEnhanced');

module.exports = {
  authenticateToken,
  optionalAuth,
  authenticateRefreshToken,
};
