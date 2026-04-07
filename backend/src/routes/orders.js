/**
 * orders.js
 * @description 路由定义文件
 * @date 2025-08-27
 * @version 1.0.0
 */

const express = require('express');
const router = express.Router();
const { getOrders, createOrder, updateOrder } = require('../controllers/common/ordersController');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);
const { requirePermission } = require('../middleware/requirePermission');

router.get('/', requirePermission('sales:orders:view'), getOrders);
router.post('/', requirePermission('sales:orders:create'), createOrder);
router.put('/:id', requirePermission('sales:orders:update'), updateOrder);

module.exports = router;
