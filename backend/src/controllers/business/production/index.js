/**
 * index.js
 * @description 生产模块统一导出入口
 * @date 2025-10-16
 * @version 1.0.0
 */

// 导入各个控制器
const planController = require('./planController');
const taskController = require('./taskController');
const processController = require('./processController');
const reportController = require('./reportController');
const materialController = require('./materialController');
const dashboardController = require('./dashboardController');
const exportController = require('./exportController');

// 统一导出（向后兼容）
module.exports = {
  // 生产计划相关
  getTodayMaxSequence: planController.getTodayMaxSequence,
  getProductionPlans: planController.getProductionPlans,
  getPlanMaterials: planController.getPlanMaterials,
  getProductionPlanById: planController.getProductionPlanById,
  createProductionPlan: planController.createProductionPlan,
  updateProductionPlan: planController.updateProductionPlan,
  deleteProductionPlan: planController.deleteProductionPlan,
  updateProductionPlanStatus: planController.updateProductionPlanStatus,
  getDashboardProductionPlans: planController.getDashboardProductionPlans,

  // 生产任务相关
  generateTaskCode: taskController.generateTaskCode,
  getProductionTasks: taskController.getProductionTasks,
  getProductionTaskManagers: taskController.getProductionTaskManagers,
  getProductionTaskById: taskController.getProductionTaskById,
  createProductionTask: taskController.createProductionTask,
  updateProductionTask: taskController.updateProductionTask,
  deleteProductionTask: taskController.deleteProductionTask,
  updateProductionTaskProgress: taskController.updateProductionTaskProgress,
  updateProductionTaskStatus: taskController.updateProductionTaskStatus,
  getPendingTasks: taskController.getPendingTasks,
  completeTask: taskController.completeTask,
  getProductionTaskBom: taskController.getProductionTaskBom,

  // 生产工序相关
  getProcesses: processController.getProcesses,
  getProcessById: processController.getProcessById,
  createProcess: processController.createProcess,
  updateProcess: processController.updateProcess,
  deleteProcess: processController.deleteProcess,
  getProcessCompletionRates: processController.getProcessCompletionRates,

  // 生产报工相关
  getReportSummary: reportController.getReportSummary,
  getReportDetail: reportController.getReportDetail,
  exportReport: reportController.exportReport,
  getReportById: reportController.getReportById,
  createReport: reportController.createReport,
  updateReport: reportController.updateReport,
  deleteReport: reportController.deleteReport,
  getTaskReportStats: reportController.getTaskReportStats,
  getTaskProcesses: reportController.getTaskProcesses,
  getReportStatistics: reportController.getReportStatistics,

  // 物料和BOM相关
  calculateMaterials: materialController.calculateMaterials,
  calculateMaterialsByBomId: materialController.calculateMaterialsByBomId,
  getBomByProductId: materialController.getBomByProductId,
  getMaterialShortageSummary: materialController.getMaterialShortageSummary,

  // 仪表盘相关
  getDashboardStatistics: dashboardController.getDashboardStatistics,
  getDashboardTrends: dashboardController.getDashboardTrends,

  // 导出相关
  exportProductionData: exportController.exportProductionData,
};

// 也可以单独导出控制器，用于直接引用
module.exports.controllers = {
  planController,
  taskController,
  processController,
  reportController,
  materialController,
  dashboardController,
  exportController,
};
