/**
 * authEnhanced.js
 * @description 增强的认证中间件，支持Cookie和refresh token
 * @date 2025-11-21
 * @version 2.0.0
 */

const {
  verifyAccessToken,
  verifyRefreshToken,
  getTokensFromCookies,
} = require('../config/jwtEnhanced');
const { logger } = require('../utils/logger');

/**
 * 认证中间件 - 支持Cookie和Authorization Header
 */
const authenticateToken = async (req, res, next) => {
  try {
    let token = null;

    // 1. 尝试从Cookie获取token
    const { accessToken } = getTokensFromCookies(req);
    if (accessToken) {
      token = accessToken;
    }

    // 2. 如果Cookie中没有，尝试从Authorization Header获取（向后兼容）
    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
      }
    }

    // 3. 如果都没有，返回401
    if (!token) {
      return res.status(401).json({
        success: false,
        message: '未提供认证令牌',
        code: 'NO_TOKEN',
      });
    }

    // 4. 验证token
    const decoded = verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    logger.warn('Token验证失败:', { error: error.message, path: req.path });

    return res.status(401).json({
      success: false,
      message: error.message || '认证令牌无效或已过期',
      code: error.message.includes('过期') ? 'TOKEN_EXPIRED' : 'INVALID_TOKEN',
    });
  }
};

/**
 * 可选认证中间件 - 如果有token则验证，没有则继续
 */
const optionalAuth = async (req, res, next) => {
  try {
    const { accessToken } = getTokensFromCookies(req);
    const authHeader = req.headers.authorization;
    const token =
      accessToken || (authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null);

    if (token) {
      const decoded = verifyAccessToken(token);
      req.user = decoded;
    }
  } catch (error) {
    // 忽略错误，继续处理
    logger.debug('可选认证失败:', error.message);
  }
  next();
};

/**
 * 验证刷新令牌中间件
 */
const authenticateRefreshToken = async (req, res, next) => {
  try {
    // 从 Cookie 或请求体中获取刷新令牌
    const { refreshToken } = getTokensFromCookies(req);
    const token = refreshToken || req.body?.refreshToken;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: '未提供刷新令牌',
        code: 'NO_REFRESH_TOKEN',
      });
    }

    // 验证刷新令牌
    req.user = verifyRefreshToken(token);
    req.refreshToken = token;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: error.message || '刷新令牌无效或已过期',
      code: 'INVALID_REFRESH_TOKEN',
    });
  }
};

module.exports = {
  authenticateToken,
  optionalAuth,
  authenticateRefreshToken,
};
