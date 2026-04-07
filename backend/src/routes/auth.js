/**
 * auth.js
 * @description 路由定义文件
 * @date 2025-08-27
 * @version 1.0.0
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const {
  login,
  logout,
  refreshToken,
  getUserProfile,
  updateUserProfile,
  uploadAvatar,
  getUserPermissions,
  updateAvatarFrame,
  getUserMenus,
} = require('../controllers/auth/authController');
const {
  getUserTheme,
  saveUserTheme,
  resetUserTheme,
} = require('../controllers/auth/themeController');
const { authenticateToken, authenticateRefreshToken } = require('../middleware/auth');

// 配置multer
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 限制2MB
});

// 登录路由
router.post('/login', login);

// 登出路由
router.post('/logout', authenticateToken, logout);

// 刷新令牌路由
router.post('/refresh', authenticateRefreshToken, refreshToken);

// 获取用户信息
router.get('/profile', authenticateToken, getUserProfile);

// 更新用户信息
router.put('/profile', authenticateToken, updateUserProfile);

// 获取用户权限
router.get('/permissions', authenticateToken, getUserPermissions);

// 获取用户菜单（根据权限过滤）
router.get('/menus', authenticateToken, getUserMenus);

// 上传用户头像
router.put('/users/avatar', authenticateToken, upload.single('avatar'), uploadAvatar);

// 更新用户头像特效
router.post('/profile/avatar-frame', authenticateToken, updateAvatarFrame);

// 主题设置路由
router.get('/theme', authenticateToken, getUserTheme);
router.post('/theme', authenticateToken, saveUserTheme);
router.delete('/theme', authenticateToken, resetUserTheme);

module.exports = router;
