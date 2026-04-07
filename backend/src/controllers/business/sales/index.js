/**
 * index.js
 * @description 销售模块统一入口 - 导出所有子模块的控制器函数
 * @date 2026-01-07
 * @version 1.0.0
 *
 * 此文件作为销售模块的统一入口，将分散在多个文件中的控制器函数
 * 统一导出，保持向后兼容性，同时提供模块化的代码结构。
 *
 * 模块拆分结构：
 * - salesShared.js          - 共享常量和工具函数
 * - salesCustomerController.js   - 客户相关操作
 * - salesQuotationController.js  - 报价单相关操作
 * - salesController.js           - 订单、出库、退货、换货等（待拆分）
 */

// 导入共享模块
const shared = require('./salesShared');

// 导入子控制器模块
const customerController = require('./salesCustomerController');
const quotationController = require('./salesQuotationController');

// 导入原始控制器（包含尚未拆分的函数）
const salesController = require('./salesController');

// 统一导出所有函数
module.exports = {
  // ===== 共享常量和工具 =====
  STATUS: shared.STATUS,
  getConnection: shared.getConnection,
  getConnectionWithTransaction: shared.getConnectionWithTransaction,
  generateSalesOrderNo: shared.generateSalesOrderNo,
  generateOrderNo: shared.generateOrderNo,
  generateTransactionNo: shared.generateTransactionNo,
  generateSalesOutboundNo: shared.generateSalesOutboundNo,
  formatDateToMySQLDate: shared.formatDateToMySQLDate,

  // ===== 客户模块 =====
  getCustomersList: customerController.getCustomersList,
  getProductsList: customerController.getProductsList,
  getCustomers: customerController.getCustomers,
  getCustomer: customerController.getCustomer,
  createCustomer: customerController.createCustomer,
  updateCustomer: customerController.updateCustomer,

  // ===== 报价单模块 =====
  getSalesQuotations: quotationController.getSalesQuotations,
  getSalesQuotationStatistics: quotationController.getSalesQuotationStatistics,
  getSalesQuotation: quotationController.getSalesQuotation,
  createSalesQuotation: quotationController.createSalesQuotation,
  updateSalesQuotation: quotationController.updateSalesQuotation,
  deleteSalesQuotation: quotationController.deleteSalesQuotation,

  // ===== 原始控制器中的其他函数（待拆分） =====
  // 订单相关
  getSalesOrderOperators: salesController.getSalesOrderOperators,
  getSalesOrders: salesController.getSalesOrders,
  getSalesOrder: salesController.getSalesOrder,
  updateOrderStatus: salesController.updateOrderStatus,
  createSalesOrder: salesController.createSalesOrder,
  updateSalesOrder: salesController.updateSalesOrder,
  deleteSalesOrder: salesController.deleteSalesOrder,
  getSalesOrderStatistics: salesController.getSalesOrderStatistics,
  getSalesStatistics: salesController.getSalesStatistics,
  getSalesTrend: salesController.getSalesTrend,
  convertQuotationToOrder: salesController.convertQuotationToOrder,

  // 出库相关
  getSalesOutbound: salesController.getSalesOutbound,
  getSalesOutboundById: salesController.getSalesOutboundById,
  createSalesOutbound: salesController.createSalesOutbound,
  updateSalesOutbound: salesController.updateSalesOutbound,
  deleteSalesOutbound: salesController.deleteSalesOutbound,
  confirmSalesOutbound: salesController.confirmSalesOutbound,
  getSalesOutboundStatistics: salesController.getSalesOutboundStatistics,

  // 退货相关
  getSalesReturns: salesController.getSalesReturns,
  getSalesReturn: salesController.getSalesReturn,
  createSalesReturn: salesController.createSalesReturn,
  updateSalesReturn: salesController.updateSalesReturn,
  deleteSalesReturn: salesController.deleteSalesReturn,
  approveSalesReturn: salesController.approveSalesReturn,
  completeSalesReturn: salesController.completeSalesReturn,
  getSalesReturnStatistics: salesController.getSalesReturnStatistics,

  // 换货相关
  getSalesExchanges: salesController.getSalesExchanges,
  getSalesExchange: salesController.getSalesExchange,
  createSalesExchange: salesController.createSalesExchange,
  updateSalesExchange: salesController.updateSalesExchange,
  deleteSalesExchange: salesController.deleteSalesExchange,
  processSalesExchange: salesController.processSalesExchange,
  completeSalesExchange: salesController.completeSalesExchange,
  getSalesExchangeStatistics: salesController.getSalesExchangeStatistics,
  updateExchangeStatus: salesController.updateExchangeStatus,

  // 装箱单相关
  getPackingLists: salesController.getPackingLists,
  getPackingList: salesController.getPackingList,
  createPackingList: salesController.createPackingList,
  updatePackingList: salesController.updatePackingList,
  deletePackingList: salesController.deletePackingList,
  getPackingListStatistics: salesController.getPackingListStatistics,
  printPackingList: salesController.printPackingList,

};
