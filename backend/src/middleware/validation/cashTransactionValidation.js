/**
 * cashTransactionValidation.js
 * @description 中间件文件
 * @date 2025-08-27
 * @version 1.0.0
 */

const { body, param, query } = require('express-validator');

/**
 * 现金交易验证规则
 */

// 创建现金交易验证
const createCashTransactionValidation = [
  body('type').isIn(['income', 'expense']).withMessage('交易类型必须是 income 或 expense'),

  body('transactionDate')
    .isISO8601()
    .withMessage('交易日期格式不正确')
    .custom((value) => {
      const date = new Date(value);
      const today = new Date();
      if (date > today) {
        throw new Error('交易日期不能是未来日期');
      }
      return true;
    }),

  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('金额必须是大于0的数字')
    .custom((value) => {
      if (value > 999999999.99) {
        throw new Error('金额不能超过999,999,999.99');
      }
      return true;
    }),

  body('category')
    .isIn(['sales', 'other_income', 'office', 'travel', 'meal', 'other_expense'])
    .withMessage('分类不正确'),

  body('counterparty')
    .optional()
    .isLength({ max: 200 })
    .withMessage('交易对方名称不能超过200个字符'),

  body('description')
    .notEmpty()
    .withMessage('交易描述不能为空')
    .isLength({ max: 500 })
    .withMessage('交易描述不能超过500个字符'),

  body('referenceNumber').optional().isLength({ max: 100 }).withMessage('凭证号不能超过100个字符'),
];

// 更新现金交易验证
const updateCashTransactionValidation = [
  param('id').isInt({ min: 1 }).withMessage('交易ID必须是正整数'),

  ...createCashTransactionValidation,
];

// 删除现金交易验证
const deleteCashTransactionValidation = [
  param('id').isInt({ min: 1 }).withMessage('交易ID必须是正整数'),
];

// 查询现金交易验证
const getCashTransactionsValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('页码必须是正整数'),

  query('pageSize')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('每页数量必须是1-100之间的整数'),

  query('type')
    .optional()
    .isIn(['income', 'expense'])
    .withMessage('交易类型必须是 income 或 expense'),

  query('category')
    .optional()
    .isIn(['sales', 'other_income', 'office', 'travel', 'meal', 'other_expense'])
    .withMessage('分类不正确'),

  query('startDate').optional().isISO8601().withMessage('开始日期格式不正确'),

  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('结束日期格式不正确')
    .custom((value, { req }) => {
      if (req.query.startDate && value < req.query.startDate) {
        throw new Error('结束日期不能早于开始日期');
      }
      return true;
    }),

  query('search').optional().isLength({ max: 100 }).withMessage('搜索关键词不能超过100个字符'),
];

// 获取单个现金交易验证
const getCashTransactionByIdValidation = [
  param('id').isInt({ min: 1 }).withMessage('交易ID必须是正整数'),
];

// 导入现金交易验证
const importCashTransactionsValidation = [
  // 文件验证将在multer中间件中处理
];

// 导出现金交易验证
const exportCashTransactionsValidation = [
  query('type')
    .optional()
    .isIn(['income', 'expense'])
    .withMessage('交易类型必须是 income 或 expense'),

  query('category')
    .optional()
    .isIn(['sales', 'other_income', 'office', 'travel', 'meal', 'other_expense'])
    .withMessage('分类不正确'),

  query('startDate').optional().isISO8601().withMessage('开始日期格式不正确'),

  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('结束日期格式不正确')
    .custom((value, { req }) => {
      if (req.query.startDate && value < req.query.startDate) {
        throw new Error('结束日期不能早于开始日期');
      }
      return true;
    }),
];

// 统计验证
const getCashTransactionStatsValidation = [
  query('type')
    .optional()
    .isIn(['income', 'expense'])
    .withMessage('交易类型必须是 income 或 expense'),

  query('category')
    .optional()
    .isIn(['sales', 'other_income', 'office', 'travel', 'meal', 'other_expense'])
    .withMessage('分类不正确'),

  query('startDate').optional().isISO8601().withMessage('开始日期格式不正确'),

  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('结束日期格式不正确')
    .custom((value, { req }) => {
      if (req.query.startDate && value < req.query.startDate) {
        throw new Error('结束日期不能早于开始日期');
      }
      return true;
    }),
];

module.exports = {
  createCashTransactionValidation,
  updateCashTransactionValidation,
  deleteCashTransactionValidation,
  getCashTransactionsValidation,
  getCashTransactionByIdValidation,
  importCashTransactionsValidation,
  exportCashTransactionsValidation,
  getCashTransactionStatsValidation,
};
