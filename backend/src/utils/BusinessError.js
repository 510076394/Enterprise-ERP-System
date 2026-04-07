/**
 * BusinessError.js
 * @description 带有前端引导行为的业务级错误
 */
class BusinessError extends Error {
  /**
   * 构造业务错误
   * @param {string} message 错误消息（将展示给用户看）
   * @param {Object} action 附带的新增行动指令，例如：{ route: '/basedata/materials', buttonText: '去完善物料' }
   * @param {string} errorCode 给前端分辨用的特定错误码，默认 'BUSINESS_ERROR'
   * @param {number} httpStatus 返回给前端的 Http StatusCode
   */
  constructor(message, action = null, errorCode = 'BUSINESS_ERROR', httpStatus = 400) {
    super(message);
    this.name = 'BusinessError';
    this.action = action;
    this.errorCode = errorCode;
    this.httpStatus = httpStatus;
  }
}

module.exports = BusinessError;
