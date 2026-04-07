/**
 * costCenterRoutes.js
 * 成本中心管理API路由
 */

const express = require('express');
const router = express.Router();
const CostCenterService = require('../../../services/business/CostCenterService');

const { ResponseHandler } = require('../../../utils/responseHandler');
const { logger } = require('../../../utils/logger');
const { authenticateToken } = require('../../../middleware/auth');
const { requirePermission } = require('../../../middleware/requirePermission');

// 所有路由需要认证
router.use(authenticateToken);

// ==================== 成本中心 ====================

/**
 * 获取成本中心列表（树形结构）
 * GET /api/finance/cost-centers
 */
router.get('/', requirePermission('finance:cost:view'), async (req, res) => {
  try {
    const { type, isActive, keyword } = req.query;
    const filters = {};
    if (type) filters.type = type;
    if (isActive !== undefined) filters.isActive = isActive === 'true';
    if (keyword) filters.keyword = keyword;

    const data = await CostCenterService.getAll(filters);
    ResponseHandler.success(res, data);
  } catch (error) {
    logger.error('[API] 获取成本中心列表失败:', error);
    ResponseHandler.error(res, '获取成本中心列表失败', 'SERVER_ERROR', 500);
  }
});

/**
 * 获取成本中心选项（下拉框用）
 * GET /api/finance/cost-centers/options
 */
router.get('/options', requirePermission('finance:cost:view'), async (req, res) => {
  try {
    const data = await CostCenterService.getOptions();
    ResponseHandler.success(res, data);
  } catch (error) {
    logger.error('[API] 获取成本中心选项失败:', error);
    ResponseHandler.error(res, '获取成本中心选项失败', 'SERVER_ERROR', 500);
  }
});

/**
 * 获取成本归集报表
 * GET /api/finance/cost-centers/report
 */
router.get('/report', requirePermission('finance:reports:view'), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const data = await CostCenterService.getCostReport({ startDate, endDate });
    ResponseHandler.success(res, data);
  } catch (error) {
    logger.error('[API] 获取成本归集报表失败:', error);
    ResponseHandler.error(res, '获取成本归集报表失败', 'SERVER_ERROR', 500);
  }
});

/**
 * 获取效率差异分析数据
 * GET /api/finance/cost-centers/efficiency-variance
 */
router.get('/efficiency-variance', requirePermission('finance:reports:view'), async (req, res) => {
  try {
    const { startDate, endDate, costCenterId } = req.query;
    const data = await CostCenterService.getEfficiencyVariance({
      startDate,
      endDate,
      costCenterId,
    });
    ResponseHandler.success(res, data);
  } catch (error) {
    logger.error('[API] 获取效率差异失败:', error);
    ResponseHandler.error(res, '获取效率差异失败', 'SERVER_ERROR', 500);
  }
});

/**
 * 获取产能利用分析数据
 * GET /api/finance/cost-centers/capacity-utilization
 */
router.get('/capacity-utilization', requirePermission('finance:reports:view'), async (req, res) => {
  try {
    const { month } = req.query;
    const data = await CostCenterService.getCapacityUtilization({ month });
    ResponseHandler.success(res, data);
  } catch (error) {
    logger.error('[API] 获取产能利用失败:', error);
    ResponseHandler.error(res, '获取产能利用失败', 'SERVER_ERROR', 500);
  }
});

/**
 * 获取成本中心详情
 * GET /api/finance/cost-centers/:id
 */
router.get('/:id', requirePermission('finance:cost:view'), async (req, res) => {
  try {
    const data = await CostCenterService.getById(req.params.id);
    if (!data) {
      return ResponseHandler.error(res, '成本中心不存在', 'NOT_FOUND', 404);
    }
    ResponseHandler.success(res, data);
  } catch (error) {
    logger.error('[API] 获取成本中心详情失败:', error);
    ResponseHandler.error(res, '获取成本中心详情失败', 'SERVER_ERROR', 500);
  }
});

/**
 * 创建成本中心
 * POST /api/finance/cost-centers
 */
router.post('/', requirePermission('finance:cost:create'), async (req, res) => {
  try {
    const { code, name, type, parent_id, department_id, manager, description } = req.body;

    if (!code || !name) {
      return ResponseHandler.error(res, '编码和名称不能为空', 'VALIDATION_ERROR', 400);
    }

    const data = await CostCenterService.create({
      code,
      name,
      type,
      parent_id,
      department_id,
      manager,
      description,
    });
    ResponseHandler.success(res, data, 201);
  } catch (error) {
    logger.error('[API] 创建成本中心失败:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return ResponseHandler.error(res, '成本中心编码已存在', 'DUPLICATE', 400);
    }
    ResponseHandler.error(res, '创建成本中心失败', 'SERVER_ERROR', 500);
  }
});

/**
 * 更新成本中心
 * PUT /api/finance/cost-centers/:id
 */
router.put('/:id', requirePermission('finance:cost:update'), async (req, res) => {
  try {
    const result = await CostCenterService.update(req.params.id, req.body);
    ResponseHandler.success(res, result);
  } catch (error) {
    logger.error('[API] 更新成本中心失败:', error);
    ResponseHandler.error(res, '更新成本中心失败', 'SERVER_ERROR', 500);
  }
});

/**
 * 删除成本中心
 * DELETE /api/finance/cost-centers/:id
 */
router.delete('/:id', requirePermission('finance:cost:delete'), async (req, res) => {
  try {
    const result = await CostCenterService.delete(req.params.id);
    ResponseHandler.success(res, result);
  } catch (error) {
    logger.error('[API] 删除成本中心失败:', error);
    ResponseHandler.error(res, error.message || '删除成本中心失败', 'SERVER_ERROR', 500);
  }
});

// ==================== 注意 ====================
// 制造费用分摊配置的 API 已统一迁移至 financeEnhancement.js
// 路由路径: /api/finance-enhancement/cost/overhead-allocation
// 前端入口: CostSettings.vue → "制费分摊规则" 标签页

module.exports = router;

