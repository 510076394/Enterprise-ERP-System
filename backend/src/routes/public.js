/**
 * public.js
 * @description 公开路由（无需认证）
 * @date 2025-10-30
 * @version 1.0.0
 */

const express = require('express');
const router = express.Router();
const productionBoardController = require('../controllers/public/productionBoardController');

// 生产流程可视化看板 - 公开访问
router.get('/production-board', productionBoardController.getProductionBoardData);
router.get('/production-board/stats', productionBoardController.getProductionBoardStats);

module.exports = router;
