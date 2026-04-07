/**
 * 质量统计报表路由
 */

const express = require('express');
const router = express.Router();
const qualityStatisticsController = require('../../controllers/business/quality/qualityStatisticsController');
const { authenticateToken } = require('../../middleware/auth');
const { requirePermission } = require('../../middleware/requirePermission');

// 所有路由需要认证
router.use(authenticateToken);

// 获取综合统计概览
router.get('/overview', requirePermission('quality:reports:view'), qualityStatisticsController.getOverview);

// 获取处理方式统计
router.get('/disposition', requirePermission('quality:reports:view'), qualityStatisticsController.getDispositionStatistics);

// 获取趋势分析
router.get('/trend', requirePermission('quality:reports:view'), qualityStatisticsController.getTrendAnalysis);

// 获取供应商质量分析
router.get('/supplier', requirePermission('quality:reports:view'), qualityStatisticsController.getSupplierQualityAnalysis);

// 获取物料缺陷分析
router.get('/material', requirePermission('quality:reports:view'), qualityStatisticsController.getMaterialDefectAnalysis);

// 获取成本分析
router.get('/cost', requirePermission('quality:reports:view'), qualityStatisticsController.getCostAnalysis);

module.exports = router;
