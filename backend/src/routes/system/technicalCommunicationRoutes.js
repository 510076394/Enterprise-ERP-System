/**
 * 技术通讯路由
 */

const express = require('express');
const router = express.Router();
const technicalCommunicationController = require('../../controllers/system/technicalCommunicationController');
const { authenticateToken } = require('../../middleware/auth');

// 所有路由都需要认证
router.use(authenticateToken);

// 获取技术通讯列表
router.get('/', technicalCommunicationController.getCommunications);

// 获取技术通讯详情
router.get('/:id', technicalCommunicationController.getCommunicationDetail);

// 创建技术通讯
router.post('/', technicalCommunicationController.createCommunication);

// 更新技术通讯
router.put('/:id', technicalCommunicationController.updateCommunication);

// 删除技术通讯
router.delete('/:id', technicalCommunicationController.deleteCommunication);

// 添加评论
router.post('/:id/comments', technicalCommunicationController.addComment);

// 删除评论
router.delete('/comments/:commentId', technicalCommunicationController.deleteComment);

// 点赞
router.post('/:id/like', technicalCommunicationController.toggleLike);

// 收藏
router.post('/:id/favorite', technicalCommunicationController.toggleFavorite);

// 获取用户互动状态
router.get('/:id/interaction', technicalCommunicationController.getUserInteraction);

// 获取抄送人员列表
router.get('/:id/recipients', technicalCommunicationController.getRecipients);

// 标记为已读
router.post('/:id/mark-read', technicalCommunicationController.markAsRead);

module.exports = router;
