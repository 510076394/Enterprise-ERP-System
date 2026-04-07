/**
 * sales.js
 * @description 路由定义文件
 * @date 2025-08-27
 * @version 1.0.0
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const { authenticateToken } = require('../middleware/auth');
const { requirePermission } = require('../middleware/requirePermission');
const salesController = require('../controllers/business/sales/salesController');
const deliveryStatsController = require('../controllers/business/sales/deliveryStatsController');

// 配置multer用于文件上传
const upload = multer({ storage: multer.memoryStorage() });

// 使用中间件进行身份验证
router.use(authenticateToken);

// Customer routes
router.get('/customers', requirePermission('basedata:customers:view'), salesController.getCustomers);
router.get('/customers-list', requirePermission('basedata:customers:view'), salesController.getCustomersList);
router.get('/products-list', requirePermission('basedata:materials:view'), salesController.getProductsList);
router.get('/customers/:id', requirePermission('basedata:customers:view'), salesController.getCustomer);
router.get('/customers/:customerId/order-products', requirePermission('sales:orders:view'), salesController.getCustomerOrderProducts);
router.post('/customers', requirePermission('basedata:customers:create'), salesController.createCustomer);
router.put('/customers/:id', requirePermission('basedata:customers:update'), salesController.updateCustomer);

// Sales Quotation routes
router.get('/quotations', requirePermission('sales:quotations:view'), salesController.getSalesQuotations);
router.get('/quotations/statistics', requirePermission('sales:reports:view'), salesController.getSalesQuotationStatistics);
router.get('/quotations/:id', requirePermission('sales:quotations:view'), salesController.getSalesQuotation);
router.post('/quotations', requirePermission('sales:quotations:create'), salesController.createSalesQuotation);
router.put('/quotations/:id', requirePermission('sales:quotations:update'), salesController.updateSalesQuotation);
router.delete('/quotations/:id', requirePermission('sales:quotations:delete'), salesController.deleteSalesQuotation);
router.post('/quotations/:id/convert', requirePermission('sales:quotations:update'), salesController.convertQuotationToOrder);

// Sales Order routes
router.get('/orders', requirePermission('sales:orders:view'), salesController.getSalesOrders);
router.get('/orders/operators', requirePermission('sales:orders:view'), salesController.getSalesOrderOperators);
router.get('/orders/statistics', requirePermission('sales:reports:view'), salesController.getSalesOrderStatistics);
router.post('/orders/export', requirePermission('sales:orders:export'), salesController.exportOrders);
router.post('/orders/import', requirePermission('sales:orders:create'), upload.single('file'), salesController.importOrders);
// 添加销售订单导入模板下载路由
router.get('/orders/template', requirePermission('sales:orders:view'), salesController.downloadOrderTemplate);
router.get('/orders/:id', requirePermission('sales:orders:view'), salesController.getSalesOrder);
router.get('/orders/:id/unshipped-items', requirePermission('sales:orders:view'), salesController.getOrderUnshippedItems);
router.post('/orders', requirePermission('sales:orders:create'), salesController.createSalesOrder);
router.put('/orders/:id', requirePermission('sales:orders:update'), salesController.updateSalesOrder);
router.delete('/orders/:id', requirePermission('sales:orders:delete'), salesController.deleteSalesOrder);
router.put('/orders/:id/status', requirePermission('sales:orders:update'), salesController.updateOrderStatus);

// Order Lock routes
router.post('/orders/:id/lock', requirePermission('sales:orders:update'), salesController.lockOrder);
router.post('/orders/:id/unlock', requirePermission('sales:orders:update'), salesController.unlockOrder);
router.get('/orders/:id/lock-status', requirePermission('sales:orders:view'), salesController.getOrderLockStatus);

// Sales Outbound routes
router.get('/outbound', requirePermission('sales:outbound:view'), salesController.getSalesOutbound);
router.get('/outbound/material/:materialId', requirePermission('sales:outbound:view'), salesController.getMaterialSalesHistory);
router.get('/outbound/:id', requirePermission('sales:outbound:view'), salesController.getSalesOutboundById);
router.post('/outbound', requirePermission('sales:outbound:create'), salesController.createSalesOutbound);
router.put('/outbound/:id', requirePermission('sales:outbound:update'), salesController.updateSalesOutbound);
router.delete('/outbound/:id', requirePermission('sales:outbound:delete'), salesController.deleteSalesOutbound);

// Sales Return routes
router.get('/returns', requirePermission('sales:returns:view'), salesController.getSalesReturns);
router.get('/returns/:id', requirePermission('sales:returns:view'), salesController.getSalesReturnById);
router.post('/returns', requirePermission('sales:returns:create'), salesController.createSalesReturn);
router.put('/returns/:id', requirePermission('sales:returns:update'), salesController.updateSalesReturn);
router.delete('/returns/:id', requirePermission('sales:returns:delete'), salesController.deleteSalesReturn);

// Sales Exchange routes
router.get('/exchanges', requirePermission('sales:returns:view'), salesController.getSalesExchanges);
router.get('/exchanges/:id', requirePermission('sales:returns:view'), salesController.getSalesExchangeById);
router.post('/exchanges', requirePermission('sales:returns:create'), salesController.createSalesExchange);
router.put('/exchanges/:id', requirePermission('sales:returns:update'), salesController.updateSalesExchange);
router.delete('/exchanges/:id', requirePermission('sales:returns:delete'), salesController.deleteSalesExchange);
router.put('/exchanges/:id/status', requirePermission('sales:returns:update'), salesController.updateExchangeStatus);

// Packing List routes
router.get('/packing-lists', requirePermission('sales:packing:view'), salesController.getPackingLists);
router.get('/packing-lists/:id', requirePermission('sales:packing:view'), salesController.getPackingList);
router.post('/packing-lists', requirePermission('sales:packing:create'), salesController.createPackingList);
router.put('/packing-lists/:id', requirePermission('sales:packing:update'), salesController.updatePackingList);
router.delete('/packing-lists/:id', requirePermission('sales:packing:delete'), salesController.deletePackingList);
router.patch('/packing-lists/:id/status', requirePermission('sales:packing:update'), salesController.updatePackingListStatus);
router.get('/packing-lists-statistics', requirePermission('sales:reports:view'), salesController.getPackingListStatistics);

// Sales Statistics routes
router.get('/statistics', requirePermission('sales:reports:view'), salesController.getSalesStatistics);
router.get('/trend', requirePermission('sales:reports:view'), salesController.getSalesTrend);

// Delivery Statistics routes
router.get('/delivery-stats', requirePermission('sales:reports:view'), deliveryStatsController.getDeliveryStats);
router.get('/delivery-stats/overview', requirePermission('sales:reports:view'), deliveryStatsController.getDeliveryOverview);
router.get('/delivery-stats/orders/:orderId', requirePermission('sales:reports:view'), deliveryStatsController.getOrderDeliveryDetails);

module.exports = router;
