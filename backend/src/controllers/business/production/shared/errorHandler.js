/**
 * errorHandler.js
 * @description 生产模块统一错误处理工具
 * @date 2025-10-16
 * @version 1.0.0
 */

const { ResponseHandler } = require('../../../../utils/responseHandler');
const { logger } = require('../../../../utils/logger');
const { SystemErrors, mapDatabaseError, createError } = require('../../../../constants/errorCodes');

/**
 * 统一错误处理函数
 * @param {Object} res - Express响应对象
 * @param {Error} error - 错误对象
 * @param {Object} context - 上下文信息
 */
const handleError = (res, error, context = {}) => {
  logger.error('操作失败:', {
    error: error.message,
    stack: error.stack,
    context,
  });

  // 数据库错误映射
  if (error.code && error.code.startsWith('ER_')) {
    const dbError = mapDatabaseError(error);
    const errorObj = createError(dbError, {
      details: context,
    });
    return ResponseHandler.error(
      res,
      errorObj.message,
      errorObj.code,
      errorObj.httpStatus,
      errorObj
    );
  }

  // 业务错误（已经包含错误码的）
  if (error.errorCode) {
    return ResponseHandler.error(
      res,
      error.message,
      error.errorCode,
      error.httpStatus || 400,
      error
    );
  }

  // 默认服务器错误
  const systemError = createError(SystemErrors.INTERNAL_ERROR, {
    message: error.message,
    details: context,
  });

  return ResponseHandler.error(
    res,
    systemError.message,
    systemError.code,
    systemError.httpStatus,
    systemError
  );
};

module.exports = {
  handleError,
};
