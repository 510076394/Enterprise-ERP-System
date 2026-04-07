/**
 * userController.js
 * @description 控制器文件
 * @date 2025-08-27
 * @version 1.0.0
 */

const { ResponseHandler } = require('../../utils/responseHandler');
// const { logger } = require('../../utils/logger'); // 未使用，已注释

const User = require('../../models/user');
// const { getUserStatusText, generateStatusCaseSQL, USER_STATUS } = require('../../constants/systemConstants'); // 未使用，已注释

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] },
    });
    ResponseHandler.success(res, users, '获取用户列表成功');
  } catch (error) {
    ResponseHandler.error(res, error.message, 'SERVER_ERROR', 500, error);
  }
};

// Get user by ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] },
    });
    if (user) {
      ResponseHandler.success(res, user, '获取用户信息成功');
    } else {
      ResponseHandler.error(res, 'User not found', 'NOT_FOUND', 404);
    }
  } catch (error) {
    ResponseHandler.error(res, error.message, 'SERVER_ERROR', 500, error);
  }
};

// Create new user
exports.createUser = async (req, res) => {
  try {
    const user = await User.create(req.body);
    const { password: _password, ...userWithoutPassword } = user.toJSON();
    ResponseHandler.success(res, userWithoutPassword, '创建成功', 201);
  } catch (error) {
    ResponseHandler.error(res, error.message, 'BAD_REQUEST', 400);
  }
};

// Update user
exports.updateUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (user) {
      await user.update(req.body);
      const { password: _password, ...userWithoutPassword } = user.toJSON();
      ResponseHandler.success(res, userWithoutPassword, '更新用户成功');
    } else {
      ResponseHandler.error(res, 'User not found', 'NOT_FOUND', 404);
    }
  } catch (error) {
    ResponseHandler.error(res, error.message, 'BAD_REQUEST', 400);
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (user) {
      await user.destroy();
      ResponseHandler.success(res, null, '删除用户成功');
    } else {
      ResponseHandler.error(res, 'User not found', 'NOT_FOUND', 404);
    }
  } catch (error) {
    ResponseHandler.error(res, error.message, 'SERVER_ERROR', 500, error);
  }
};
