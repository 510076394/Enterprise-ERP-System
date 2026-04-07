/**
 * 自动化设备监控路由
 */

const express = require('express');
const router = express.Router();
const equipmentMonitoringController = require('../controllers/business/production/equipmentMonitoringController');
const { authenticateToken } = require('../middleware/auth');
const { requirePermission } = require('../middleware/requirePermission');
const { cacheMiddleware } = require('../services/cacheService'); // ✅ 更新：使用统一的缓存服务

// 应用认证中间件
router.use(authenticateToken);

/**
 * 设备管理相关路由
 */

// 获取设备列表
router.get(
  '/equipment',
  requirePermission('production:equipment:view'),
  cacheMiddleware(60), // 缓存1分钟
  equipmentMonitoringController.getEquipmentList
);

// 获取设备详细信息
router.get('/equipment/:id', requirePermission('production:equipment:view'), equipmentMonitoringController.getEquipmentDetail);

// 获取设备实时数据
router.get('/equipment/:id/realtime-data', requirePermission('production:equipment:view'), equipmentMonitoringController.getEquipmentRealTimeData);

// 获取设备健康状态
router.get('/equipment/:id/health', requirePermission('production:equipment:view'), equipmentMonitoringController.getEquipmentHealth);

// 更新设备状态
router.put('/equipment/:id/status', requirePermission('production:equipment:update'), equipmentMonitoringController.updateEquipmentStatus);

/**
 * 数据采集相关路由
 */

// 记录单个设备数据
router.post('/equipment/:id/data', requirePermission('production:equipment:update'), equipmentMonitoringController.recordEquipmentData);

// 批量记录设备数据
router.post('/equipment/:id/data/batch', requirePermission('production:equipment:update'), equipmentMonitoringController.batchRecordEquipmentData);

/**
 * 报警管理相关路由
 */

// 获取设备报警列表
router.get('/alarms', requirePermission('production:equipment:view'), equipmentMonitoringController.getEquipmentAlarms);

// 确认报警
router.put('/alarms/:id/acknowledge', requirePermission('production:equipment:update'), equipmentMonitoringController.acknowledgeAlarm);

// 解决报警
router.put('/alarms/:id/resolve', requirePermission('production:equipment:update'), equipmentMonitoringController.resolveAlarm);

/**
 * 统计分析相关路由
 */

// 获取设备统计信息
router.get(
  '/statistics',
  requirePermission('production:equipment:view'),
  cacheMiddleware(300), // 缓存5分钟
  equipmentMonitoringController.getEquipmentStatistics
);

module.exports = router;
