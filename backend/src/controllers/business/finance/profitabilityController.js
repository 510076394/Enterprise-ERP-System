/**
 * profitabilityController.js
 * @description 盈利分析控制器 — 从路由内联逻辑抽离，符合 SRP 原则
 * @date 2026-03-25
 * @version 1.0.0
 */

const { ResponseHandler } = require('../../../utils/responseHandler');
const { logger } = require('../../../utils/logger');
const ProfitabilityService = require('../../../services/business/ProfitabilityService');

const profitabilityController = {
  /**
   * 获取盈利汇总
   */
  getProfitSummary: async (req, res) => {
    try {
      const data = await ProfitabilityService.getProfitSummary(req.query);
      ResponseHandler.success(res, data, '获取盈利汇总成功');
    } catch (error) {
      logger.error('获取盈利汇总失败:', error);
      ResponseHandler.error(res, '获取盈利汇总失败', 'SERVER_ERROR', 500, error);
    }
  },

  /**
   * 获取产品盈利分析
   */
  getProductProfitability: async (req, res) => {
    try {
      const data = await ProfitabilityService.getProductProfitability(req.query);
      ResponseHandler.success(res, data, '获取产品盈利分析成功');
    } catch (error) {
      logger.error('获取产品盈利分析失败:', error);
      ResponseHandler.error(res, '获取产品盈利分析失败', 'SERVER_ERROR', 500, error);
    }
  },

  /**
   * 获取客户盈利贡献
   */
  getCustomerProfitability: async (req, res) => {
    try {
      const data = await ProfitabilityService.getCustomerProfitability(req.query);
      ResponseHandler.success(res, data, '获取客户盈利贡献成功');
    } catch (error) {
      logger.error('获取客户盈利贡献失败:', error);
      ResponseHandler.error(res, '获取客户盈利贡献失败', 'SERVER_ERROR', 500, error);
    }
  },

  /**
   * 获取盈利趋势
   */
  getProfitTrend: async (req, res) => {
    try {
      const data = await ProfitabilityService.getProfitTrend(req.query);
      ResponseHandler.success(res, data, '获取盈利趋势成功');
    } catch (error) {
      logger.error('获取盈利趋势失败:', error);
      ResponseHandler.error(res, '获取盈利趋势失败', 'SERVER_ERROR', 500, error);
    }
  },
};

module.exports = profitabilityController;
