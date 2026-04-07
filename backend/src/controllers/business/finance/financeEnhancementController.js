/**
 * financeEnhancementController.js
 * @description 控制器文件
 * @date 2025-08-27
 * @version 1.0.0
 */

const { ResponseHandler } = require('../../../utils/responseHandler');
const { logger } = require('../../../utils/logger');

const FinanceIntegrationService = require('../../../services/external/FinanceIntegrationService');
const PeriodEndService = require('../../../services/business/PeriodEndService');
const CostAccountingService = require('../../../services/business/CostAccountingService');
const AdvancedReportsService = require('../../../services/utils/AdvancedReportsService');
const db = require('../../../config/db');

/**
 * 财务增强功能控制器
 * 处理财务模块的增强功能API请求
 * 注意: 审批功能已移除，统一通过 RBAC 权限按钮控制
 */
class FinanceEnhancementController {
  // ==================== 自动化集成功能 ====================

  /**
   * 从销售订单生成应收发票
   */
  static async generateARInvoiceFromSalesOrder(req, res) {
    try {
      const { salesOrderId } = req.params;

      // 获取销售订单信息
      const [salesOrders] = await db.pool.execute('SELECT * FROM sales_orders WHERE id = ?', [
        salesOrderId,
      ]);

      if (salesOrders.length === 0) {
        return ResponseHandler.error(res, '销售订单不存在', 'NOT_FOUND', 404);
      }

      // 传递当前操作用户ID
      const result = await FinanceIntegrationService.generateARInvoiceFromSalesOrder(
        salesOrders[0],
        req.user?.id
      );

      ResponseHandler.success(res, result, '应收发票生成成功');
    } catch (error) {
      logger.error('生成应收发票失败:', error);
      ResponseHandler.error(res, error.message || '生成应收发票失败', 'SERVER_ERROR', 500, error);
    }
  }

  /**
   * 从采购入库单生成应付发票
   */
  static async generateAPInvoiceFromPurchaseReceipt(req, res) {
    try {
      const { receiptId } = req.params;

      // 获取采购入库单信息
      const [receipts] = await db.pool.execute('SELECT * FROM purchase_receipts WHERE id = ?', [
        receiptId,
      ]);

      if (receipts.length === 0) {
        return ResponseHandler.error(res, '采购入库单不存在', 'NOT_FOUND', 404);
      }

      // 传递当前操作用户ID
      const result = await FinanceIntegrationService.generateAPInvoiceFromPurchaseReceipt(
        receipts[0],
        req.user?.id
      );

      ResponseHandler.success(res, result, '应付发票生成成功');
    } catch (error) {
      logger.error('生成应付发票失败:', error);
      ResponseHandler.error(res, error.message || '生成应付发票失败', 'SERVER_ERROR', 500, error);
    }
  }

  // ==================== 期末处理功能 ====================

  // 期末结账方法已移除，统一使用主财务控制器的逻辑

  /**
   * 获取期间结账状态
   */
  static async getPeriodClosingStatus(req, res) {
    try {
      const { periodId } = req.params;

      const status = await PeriodEndService.getPeriodClosingStatus(periodId);

      ResponseHandler.success(res, status, '获取期间结账状态成功');
    } catch (error) {
      logger.error('获取期间结账状态失败:', error);
      ResponseHandler.error(
        res,
        error.message || '获取期间结账状态失败',
        'SERVER_ERROR',
        500,
        error
      );
    }
  }

  // ==================== 成本核算功能 ====================

  /**
   * 计算标准成本
   */
  static async calculateStandardCost(req, res) {
    try {
      const { productId } = req.params;
      const { quantity = 1 } = req.query;

      const result = await CostAccountingService.calculateStandardCost(
        parseInt(productId),
        parseFloat(quantity)
      );

      ResponseHandler.success(res, result, '标准成本计算完成');
    } catch (error) {
      ResponseHandler.error(res, error.message || '计算标准成本失败', 'SERVER_ERROR', 500, error);
    }
  }

  /**
   * 计算实际成本
   */
  static async calculateActualCost(req, res) {
    try {
      const { productionOrderId } = req.params;

      const result = await CostAccountingService.calculateActualCost(parseInt(productionOrderId));

      ResponseHandler.success(res, result, '实际成本计算完成');
    } catch (error) {
      ResponseHandler.error(res, error.message || '计算实际成本失败', 'SERVER_ERROR', 500, error);
    }
  }

  /**
   * 成本差异分析
   */
  static async analyzeCostVariance(req, res) {
    try {
      const { productionOrderId } = req.params;

      const result = await CostAccountingService.analyzeCostVariance(parseInt(productionOrderId));

      ResponseHandler.success(res, result, '成本差异分析完成');
    } catch (error) {
      ResponseHandler.error(res, error.message || '成本差异分析失败', 'SERVER_ERROR', 500, error);
    }
  }

  // ==================== 高级报表功能 ====================

  /**
   * 财务比率分析
   */
  static async generateFinancialRatioAnalysis(req, res) {
    try {
      const params = req.query;

      const result = await AdvancedReportsService.generateFinancialRatioAnalysis(params);

      ResponseHandler.success(res, result, '财务比率分析完成');
    } catch (error) {
      logger.error('财务比率分析失败:', error);
      ResponseHandler.error(res, error.message || '财务比率分析失败', 'SERVER_ERROR', 500, error);
    }
  }

  /**
   * 趋势分析
   */
  static async generateTrendAnalysis(req, res) {
    try {
      const params = req.query;

      const result = await AdvancedReportsService.generateTrendAnalysis(params);

      ResponseHandler.success(res, result, '趋势分析完成');
    } catch (error) {
      logger.error('趋势分析失败:', error);
      ResponseHandler.error(res, error.message || '趋势分析失败', 'SERVER_ERROR', 500, error);
    }
  }
}

module.exports = FinanceEnhancementController;
