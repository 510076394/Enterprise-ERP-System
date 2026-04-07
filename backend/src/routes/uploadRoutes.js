/**
 * uploadRoutes.js
 * @description 文件上传路由
 * @date 2025-11-04
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authenticateToken } = require('../middleware/auth');
const { ResponseHandler } = require('../utils/responseHandler');
const { logger } = require('../utils/logger');

// 确保上传目录存在
const uploadDir = path.join(__dirname, '../../uploads/attachments');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 配置存储
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // 生成唯一文件名：时间戳-随机数-原文件名
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const basename = path.basename(file.originalname, ext);
    // 清理文件名，移除特殊字符
    const cleanBasename = basename.replace(/[^a-zA-Z0-9_\u4e00-\u9fa5-]/g, '_');
    cb(null, `${uniqueSuffix}-${cleanBasename}${ext}`);
  },
});

// 文件过滤器
const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'text/plain',
    'application/zip',
    'application/x-rar-compressed',
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('不支持的文件类型'), false);
  }
};

// 配置multer
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter,
});

/**
 * 上传单个文件
 */
router.post('/file', authenticateToken, (req, res) => {
  const uploadSingle = upload.single('file');

  uploadSingle(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      // Multer错误
      if (err.code === 'LIMIT_FILE_SIZE') {
        return ResponseHandler.error(res, '文件大小不能超过10MB', 400);
      }
      logger.error('Multer错误:', err);
      return ResponseHandler.error(res, '文件上传失败', 400);
    } else if (err) {
      // 其他错误
      logger.error('上传错误:', err);
      return ResponseHandler.error(res, err.message || '文件上传失败', 400);
    }

    if (!req.file) {
      return ResponseHandler.error(res, '没有文件上传', 400);
    }

    // 返回文件信息
    ResponseHandler.success(res, {
      url: `/uploads/attachments/${req.file.filename}`,
      filename: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
    });
  });
});

/**
 * 上传多个文件
 */
router.post('/files', authenticateToken, (req, res) => {
  const uploadMultiple = upload.array('files', 5); // 最多5个文件

  uploadMultiple(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return ResponseHandler.error(res, '文件大小不能超过10MB', 400);
      }
      if (err.code === 'LIMIT_FILE_COUNT') {
        return ResponseHandler.error(res, '最多只能上传5个文件', 400);
      }
      logger.error('Multer错误:', err);
      return ResponseHandler.error(res, '文件上传失败', 400);
    } else if (err) {
      logger.error('上传错误:', err);
      return ResponseHandler.error(res, err.message || '文件上传失败', 400);
    }

    if (!req.files || req.files.length === 0) {
      return ResponseHandler.error(res, '没有文件上传', 400);
    }

    // 返回文件信息列表
    const files = req.files.map((file) => ({
      url: `/uploads/attachments/${file.filename}`,
      filename: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
    }));

    ResponseHandler.success(res, { files });
  });
});

/**
 * 删除文件
 */
router.delete('/file', authenticateToken, (req, res) => {
  try {
    const { filename } = req.body;

    if (!filename) {
      return ResponseHandler.error(res, '缺少文件名参数', 400);
    }

    // 安全检查：确保文件名不包含路径遍历字符
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return ResponseHandler.error(res, '非法的文件名', 400);
    }

    const filePath = path.join(uploadDir, filename);

    // 检查文件是否存在
    if (!fs.existsSync(filePath)) {
      return ResponseHandler.error(res, '文件不存在', 404);
    }

    // 删除文件
    fs.unlinkSync(filePath);

    ResponseHandler.success(res, { message: '文件删除成功' });
  } catch (error) {
    logger.error('删除文件失败:', error);
    ResponseHandler.error(res, '删除文件失败');
  }
});

module.exports = router;
