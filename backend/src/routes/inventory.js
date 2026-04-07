/**
 * inventory.js
 * @description 路由定义文件
 * @date 2025-08-27
 * @version 1.0.0
 */

const { logger } = require('../utils/logger');
const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/business/inventory/inventoryController');
const { authenticateToken } = require('../middleware/auth');
const { requirePermission } = require('../middleware/requirePermission');
const { getUserIdentifierFromRequest } = require('../utils/userUtils');
const multer = require('multer');
const inventoryDashboardController = require('../controllers/business/inventory/inventoryDashboardController');

// 配置multer用于文件上传
const uploadToMemory = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

// 库存列表
router.get(
  '/stock',
  authenticateToken,
  requirePermission('inventory:stock:view'),
  inventoryController.getStockList
);

// 库存导入导出（必须在动态路由之前）
router.get(
  '/stock/template',
  authenticateToken,
  requirePermission('inventory:stock:view'),
  inventoryController.downloadStockTemplate
);
router.post(
  '/stock/import',
  authenticateToken,
  requirePermission('inventory:stock:adjust'),
  uploadToMemory.single('file'),
  inventoryController.importStock
);
router.post(
  '/stock/export',
  authenticateToken,
  requirePermission('inventory:stock:view'),
  inventoryController.exportStockData
);

// 库存统计直出聚合接口 (Dashboard)
router.get(
  '/dashboard/summary',
  authenticateToken,
  requirePermission('inventory:stock:view'),
  inventoryDashboardController.getDashboardSummary
);

// 库存统计数据
router.get(
  '/stock/statistics',
  authenticateToken,
  requirePermission('inventory:stock:view'),
  inventoryController.getStockStatistics
);

// 出库单列表
router.get(
  '/outbound',
  authenticateToken,
  requirePermission('inventory:outbound:view'),
  inventoryController.getOutboundList
);

// 批量发料（必须在 /outbound/:id 之前）
router.post(
  '/outbound/batch',
  authenticateToken,
  requirePermission('inventory:outbound:create'),
  inventoryController.batchOutbound
);

// 批量更新出库单状态
router.put(
  '/outbound/batch-status',
  authenticateToken,
  requirePermission('inventory:outbound:update'),
  inventoryController.batchUpdateOutboundStatus
);

// 批量删除出库单
router.delete(
  '/outbound/batch-delete',
  authenticateToken,
  requirePermission('inventory:outbound:delete'),
  inventoryController.batchDeleteOutbound
);

// 仓库列表 - 允许有采购权限或库存权限的用户访问
router.get(
  '/locations',
  authenticateToken,
  requirePermission(
    ['inventory:stock:view', 'purchase:receipts:view', 'purchase:orders:view'],
    'any'
  ),
  inventoryController.getLocations
);

// 获取库存记录
router.get(
  '/stock/:id/records',
  authenticateToken,
  requirePermission('inventory:stock:view-detail'),
  inventoryController.getStockRecords
);

// 获取库存记录 - 通过物料ID (统一API: 内部调用getInventoryLedger)
router.get(
  '/materials/:id/records',
  authenticateToken,
  requirePermission('inventory:stock:view-detail'),
  inventoryController.getMaterialRecords
);

// 批次库存查询
router.get(
  '/batch-inventory',
  authenticateToken,
  requirePermission('inventory:stock:view'),
  inventoryController.getBatchInventoryDetail
);

// 批次流水查询
router.get(
  '/batch-transactions',
  authenticateToken,
  requirePermission('inventory:stock:view-detail'),
  inventoryController.getBatchTransactionsDetail
);

// 创建出库单
router.post(
  '/outbound',
  authenticateToken,
  requirePermission('inventory:outbound:create'),
  inventoryController.createOutbound
);

// 获取出库单详情
router.get(
  '/outbound/:id',
  authenticateToken,
  requirePermission('inventory:outbound:view'),
  inventoryController.getOutboundDetail
);

// 获取带库存的物料列表
router.get('/materials-with-stock', authenticateToken, requirePermission('inventory:stock:view'), inventoryController.getMaterialsWithStock);

// 更新出库单
router.put(
  '/outbound/:id',
  authenticateToken,
  requirePermission('inventory:outbound:update'),
  inventoryController.updateOutbound
);

// 删除出库单
router.delete(
  '/outbound/:id',
  authenticateToken,
  requirePermission('inventory:outbound:delete'),
  inventoryController.deleteOutbound
);

// 撤销发料 - 回退已完成的出库单
router.post(
  '/outbound/:id/cancel',
  authenticateToken,
  requirePermission('inventory:outbound:update'),
  inventoryController.cancelOutbound
);

// 补发 - 对部分完成的出库单继续发货
router.post(
  '/outbound/:id/supplement',
  authenticateToken,
  requirePermission('inventory:outbound:update'),
  inventoryController.supplementOutbound
);

// 更新出库单状态
router.put(
  '/outbound/:id/status',
  authenticateToken,
  requirePermission('inventory:outbound:update'),
  inventoryController.updateOutboundStatus
);

// 入库单路由
router.get(
  '/inbound',
  authenticateToken,
  requirePermission('inventory:inbound:view'),
  inventoryController.getInboundList
);
router.get(
  '/inbound/:id',
  authenticateToken,
  requirePermission('inventory:inbound:view'),
  inventoryController.getInboundDetail
);
router.post(
  '/inbound',
  authenticateToken,
  requirePermission('inventory:inbound:create'),
  inventoryController.createInbound
);
router.post(
  '/inbound/from-quality',
  authenticateToken,
  requirePermission('inventory:inbound:create'),
  inventoryController.createInboundFromQuality
);
router.put(
  '/inbound/status/:id',
  authenticateToken,
  requirePermission('inventory:inbound:update'),
  inventoryController.updateInboundStatus
);

// 生产退料相关路由
router.get(
  '/task/:taskId/material-issues',
  authenticateToken,
  requirePermission('inventory:inbound:view'),
  inventoryController.getTaskMaterialIssueRecords
);

// 获取物料列表
router.get('/materials', authenticateToken, requirePermission('inventory:stock:view'), inventoryController.getMaterialsList);

// 库存调整
router.post(
  '/stock/adjust',
  authenticateToken,
  requirePermission('inventory:stock:adjust'),
  inventoryController.adjustStock
);

// 统一的库存检查API
router.post(
  '/check-stock-sufficiency',
  authenticateToken,
  requirePermission('inventory:stock:view'),
  inventoryController.checkStockSufficiency
);

// 注意: 以下测试端点仅供开发调试使用，生产环境应删除
// 所有测试端点已加上认证和管理员权限保护
router.get('/test-simple', authenticateToken, requirePermission('system:settings:update'), (req, res) => {
  res.json({ message: '测试端点工作正常', timestamp: new Date().toISOString() });
});

// 库存流水
router.get(
  '/transactions',
  authenticateToken,
  requirePermission('inventory:transactions:view'),
  inventoryController.getTransactionList
);
router.get(
  '/transactions/stats',
  authenticateToken,
  requirePermission('inventory:transactions:view'),
  inventoryController.getTransactionStats
);
router.get(
  '/transactions/export',
  authenticateToken,
  requirePermission('inventory:transactions:export'),
  inventoryController.exportTransactionReport
);

// 库存报表
router.get(
  '/report',
  authenticateToken,
  requirePermission('inventory:report:view'),
  inventoryController.getInventoryReport
);
router.get(
  '/report/export',
  authenticateToken,
  requirePermission('inventory:report:export'),
  inventoryController.exportInventoryReport
);

// 库存收发结存明细 (主API: 提供完整的筛选和分页功能)
router.get(
  '/ledger',
  authenticateToken,
  requirePermission('inventory:ledger:view'),
  inventoryController.getInventoryLedger
);

// 获取物料库存台账
router.get(
  '/ledger/material/:materialId',
  authenticateToken,
  requirePermission('inventory:stock:view'),
  inventoryController.getMaterialLedger
);

// 获取低库存预警
router.get(
  '/low-stock',
  authenticateToken,
  requirePermission('inventory:stock:view'),
  inventoryController.getLowStock
);

// 获取库存变动记录
router.get(
  '/movements',
  authenticateToken,
  requirePermission('inventory:stock:view'),
  inventoryController.getMovements
);

// 获取物料库存
router.get(
  '/stock/:materialId/:locationId',
  authenticateToken,
  requirePermission('inventory:stock:view'),
  inventoryController.getMaterialStockDetail
);

// 批量获取物料库存
router.post('/stock/batch', authenticateToken, requirePermission('inventory:stock:view'), inventoryController.getBatchMaterialStock);

// 库存调拨相关路由
router.get('/transfer', authenticateToken, requirePermission('inventory:transfer:view'), inventoryController.getTransferList);
router.get('/transfer/statistics', authenticateToken, requirePermission('inventory:transfer:view'), inventoryController.getTransferStatistics);
router.get('/transfer/:id', authenticateToken, requirePermission('inventory:transfer:view'), inventoryController.getTransferDetail);
router.post('/transfer', authenticateToken, requirePermission('inventory:transfer:create'), inventoryController.createTransfer);
router.put('/transfer/:id', authenticateToken, requirePermission('inventory:transfer:update'), inventoryController.updateTransfer);
router.delete('/transfer/:id', authenticateToken, requirePermission('inventory:transfer:delete'), inventoryController.deleteTransfer);
router.put('/transfer/:id/status', authenticateToken, requirePermission('inventory:transfer:update'), inventoryController.updateTransferStatus);
// 调拨单导出和批量删除
router.post('/transfers/export', authenticateToken, requirePermission('inventory:transfer:export'), inventoryController.exportTransfers);
router.post('/transfers/batch-delete', authenticateToken, requirePermission('inventory:transfer:delete'), inventoryController.batchDeleteTransfers);

// 库存盘点相关路由
router.get('/check/statistics', authenticateToken, requirePermission('inventory:check:view'), inventoryController.getCheckStatistics);
router.get('/check', authenticateToken, requirePermission('inventory:check:view'), inventoryController.getCheckList);
router.get('/check/:id', authenticateToken, requirePermission('inventory:check:view'), inventoryController.getCheckDetail);
router.post('/check', authenticateToken, requirePermission('inventory:check:create'), inventoryController.createCheck);
router.put('/check/:id', authenticateToken, requirePermission('inventory:check:update'), inventoryController.updateCheck);
router.put('/check/:id/status', authenticateToken, requirePermission('inventory:check:update'), inventoryController.updateCheckStatus);
router.delete('/check/:id', authenticateToken, requirePermission('inventory:check:delete'), inventoryController.deleteCheck);
router.post('/check/:id/result', authenticateToken, requirePermission('inventory:check:update'), inventoryController.submitCheckResult);
router.post('/check/:id/adjust', authenticateToken, requirePermission('inventory:check:update'), inventoryController.adjustInventory);

// 手工出入库相关路由
router.get(
  '/manual-transactions',
  authenticateToken,
  requirePermission('inventory:manual:view'),
  inventoryController.getManualTransactions
);
router.get(
  '/manual-transactions/:transaction_no',
  authenticateToken,
  requirePermission('inventory:manual:view'),
  inventoryController.getManualTransaction
);
router.post(
  '/manual-transactions',
  authenticateToken,
  requirePermission('inventory:manual:create'),
  inventoryController.createManualTransaction
);
router.post(
  '/manual-transactions/exchange',
  authenticateToken,
  requirePermission('inventory:manual:create'),
  inventoryController.createExchange
);
// 注意：手工出入库单据不建议修改，如需修改请删除重建。更新接口保留但前端未使用
router.put(
  '/manual-transactions/:transaction_no',
  authenticateToken,
  requirePermission('inventory:manual:update'),
  inventoryController.updateManualTransaction
);
router.delete(
  '/manual-transactions/:transaction_no',
  authenticateToken,
  requirePermission('inventory:manual:delete'),
  inventoryController.deleteManualTransaction
);
router.post(
  '/manual-transactions/:id/approve',
  authenticateToken,
  requirePermission('inventory:manual:approve'),
  inventoryController.approveManualTransaction
);

// 批量库存查询（优化版）
router.post('/batch-query', authenticateToken, requirePermission('inventory:stock:view'), inventoryController.getBatchInventory);

// 获取指定仓库的库存
router.get('/stock/by-location', authenticateToken, requirePermission('inventory:stock:view'), inventoryController.getStockByLocation);

// 缓存管理路由已移除

// 数据一致性检查相关路由
router.get(
  '/consistency/check',
  authenticateToken,
  requirePermission('inventory:stock:adjust'),
  inventoryController.runConsistencyCheck
);
router.get(
  '/consistency/negative-stock',
  authenticateToken,
  requirePermission('inventory:stock:view'),
  inventoryController.getNegativeStock
);
router.post(
  '/consistency/fix-quantities',
  authenticateToken,
  requirePermission('inventory:stock:adjust'),
  inventoryController.fixQuantityConsistency
);
router.post(
  '/consistency/fix-negative-stock',
  authenticateToken,
  requirePermission('inventory:stock:adjust'),
  inventoryController.fixNegativeStock
);

// ==================== 年度结存相关路由 ====================
const InventoryYearEndService = require('../services/business/InventoryYearEndService');

// 获取年度结存状态
router.get(
  '/year-end/status/:year',
  authenticateToken,
  requirePermission('inventory:stock:view'),
  async (req, res) => {
    try {
      const { year } = req.params;
      const result = await InventoryYearEndService.getYearEndStatus(parseInt(year));
      res.json({ success: true, data: result });
    } catch (error) {
      logger.error('获取年度结存状态失败:', error);
      res.status(500).json({ success: false, message: error.message || '获取年度结存状态失败' });
    }
  }
);

// 执行年度库存结存
router.post(
  '/year-end/execute',
  authenticateToken,
  requirePermission('inventory:stock:adjust'),
  async (req, res) => {
    try {
      const { year } = req.body;
      const operator = getUserIdentifierFromRequest(req);
      const result = await InventoryYearEndService.executeYearEndClosing({ year, operator });
      res.json({ success: true, data: result, message: '年度库存结存执行成功' });
    } catch (error) {
      logger.error('年度库存结存失败:', error);
      res.status(500).json({ success: false, message: error.message || '年度库存结存失败' });
    }
  }
);

// 冻结年度结存
router.post(
  '/year-end/freeze',
  authenticateToken,
  requirePermission('inventory:stock:adjust'),
  async (req, res) => {
    try {
      const { year } = req.body;
      const operator = getUserIdentifierFromRequest(req);
      const result = await InventoryYearEndService.freezeYearEndBalance({ year, operator });
      res.json({ success: true, data: result, message: '年度库存结存冻结成功' });
    } catch (error) {
      logger.error('冻结年度结存失败:', error);
      res.status(500).json({ success: false, message: error.message || '冻结年度结存失败' });
    }
  }
);

// 获取年度结存明细列表
router.get(
  '/year-end/list',
  authenticateToken,
  requirePermission('inventory:stock:view'),
  async (req, res) => {
    try {
      const params = req.query;
      const result = await InventoryYearEndService.getYearEndBalanceList(params);
      res.json({ success: true, data: result });
    } catch (error) {
      logger.error('获取年度结存明细失败:', error);
      res.status(500).json({ success: false, message: error.message || '获取年度结存明细失败' });
    }
  }
);

// 导出年度结存报表
router.get(
  '/year-end/export/:year',
  authenticateToken,
  requirePermission('inventory:stock:view'),
  async (req, res) => {
    try {
      const { year } = req.params;
      const data = await InventoryYearEndService.exportYearEndReport(parseInt(year));
      res.json({ success: true, data });
    } catch (error) {
      logger.error('导出年度结存报表失败:', error);
      res.status(500).json({ success: false, message: error.message || '导出年度结存报表失败' });
    }
  }
);

// ========== 库存预警管理 ==========
const InventoryAlertService = require('../services/business/InventoryAlertService');

// 手动检查低库存预警（不自动创建采购申请）
router.get(
  '/alerts/low-stock/check',
  authenticateToken,
  requirePermission('inventory:stock:view'),
  async (req, res) => {
    try {
      const result = await InventoryAlertService.checkLowStockAndCreateRequisition({
        autoCreate: false,
        operator: getUserIdentifierFromRequest(req),
      });
      res.json({ success: true, data: result });
    } catch (error) {
      logger.error('检查低库存预警失败:', error);
      res.status(500).json({ success: false, message: error.message || '检查低库存预警失败' });
    }
  }
);

// 检查低库存并自动生成采购申请
router.post(
  '/alerts/low-stock/auto-requisition',
  authenticateToken,
  requirePermission('inventory:stock:edit'),
  async (req, res) => {
    try {
      const result = await InventoryAlertService.checkLowStockAndCreateRequisition({
        autoCreate: true,
        operator: getUserIdentifierFromRequest(req),
      });
      res.json({ success: true, data: result, message: result.message });
    } catch (error) {
      logger.error('自动生成采购申请失败:', error);
      res.status(500).json({ success: false, message: error.message || '自动生成采购申请失败' });
    }
  }
);

// 检查批次过期预警
router.get(
  '/alerts/batch-expiry/check',
  authenticateToken,
  requirePermission('inventory:stock:view'),
  async (req, res) => {
    try {
      const daysBeforeExpiry = parseInt(req.query.days) || 30;
      const result = await InventoryAlertService.checkBatchExpiry(daysBeforeExpiry);
      res.json({ success: true, data: result });
    } catch (error) {
      logger.error('检查批次过期预警失败:', error);
      res.status(500).json({ success: false, message: error.message || '检查批次过期预警失败' });
    }
  }
);

module.exports = router;
