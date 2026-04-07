/**
 * userUtils.js
 * @description 用户相关的工具函数
 * @date 2026-01-06
 */

const { logger } = require('./logger');

/**
 * 根据用户名、真实姓名或ID获取用户ID
 * @param {Object} connection - 数据库连接
 * @param {string|number} userIdentifier - 用户名(username)、真实姓名(real_name)或用户ID
 * @returns {Promise<number>} 用户ID
 */
async function getUserIdByIdentifier(connection, userIdentifier) {
  // 如果已经是数字，直接返回
  if (typeof userIdentifier === 'number') {
    return userIdentifier;
  }

  // 如果是字符串数字，转换后返回
  if (!isNaN(userIdentifier)) {
    return parseInt(userIdentifier);
  }

  // 如果是 'system' 或 'admin'，返回默认系统用户ID（假设为1）
  if (userIdentifier === 'system' || userIdentifier === 'admin') {
    return 1;
  }

  // 根据用户名或真实姓名查询用户ID
  // real_name: 真实姓名（如"王晓敏"）
  // username: 用户名（如"admin"）
  try {
    const [users] = await connection.execute(
      'SELECT id FROM users WHERE real_name = ? OR username = ? LIMIT 1',
      [userIdentifier, userIdentifier]
    );

    if (users.length > 0) {
      return users[0].id;
    }

    // 如果找不到用户，记录警告并返回系统用户ID
    logger.warn(`用户不存在: ${userIdentifier}，使用系统用户ID=1`);
    return 1;
  } catch (error) {
    logger.error(`查询用户ID失败: ${error.message}`);
    return 1; // 出错时返回系统用户ID
  }
}

/**
 * 从请求对象中获取用户标识（优先使用真实姓名）
 * @param {Object} req - Express请求对象
 * @returns {string} 用户标识（真实姓名、用户名或'system'）
 */
function getUserIdentifierFromRequest(req) {
  return req.user?.real_name || req.user?.name || req.user?.username || 'system';
}

module.exports = {
  getUserIdByIdentifier,
  getUserIdentifierFromRequest,
};
