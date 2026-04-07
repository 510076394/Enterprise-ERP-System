/**
 * API 服务层
 * @description 统一的 HTTP 请求封装，与后端完全兼容
 * @date 2025-12-27
 * @version 2.0.0
 */

import axios from 'axios'
import { showToast } from 'vant'
import { API_CONFIG } from '@/config/app'

// ==================== 创建 Axios 实例 ====================

/**
 * 开发环境：使用相对路径 /api，通过 Vite 代理转发到后端
 * 生产环境：使用完整 URL
 */
const api = axios.create({
  baseURL: import.meta.env.DEV ? '/api' : (API_CONFIG.baseURL + '/api'),
  timeout: API_CONFIG.timeout || 30000,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true  // 允许发送 Cookie（支持 HttpOnly Cookie 认证）
})

// ==================== 请求拦截器 ====================

api.interceptors.request.use(
  config => {
    // 从 localStorage 获取 token
    const token = localStorage.getItem('token')

    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }

    return config
  },
  error => {
    console.error('请求拦截器错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器 - 支持自动Token刷新
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  response => {
    // 解包后端 ResponseHandler 格式
    // 格式: { success: true, data: {...}, message: "..." }
    const responseData = response.data;

    if (responseData && typeof responseData === 'object' && 'success' in responseData) {
      if (responseData.success === true) {
        // 成功响应：解包 data 字段
        response.data = responseData.data;
        response._message = responseData.message;
      } else {
        // 业务失败：抛出错误
        const error = new Error(responseData.message || '操作失败');
        error.response = response;
        error.code = responseData.errorCode || 'BUSINESS_ERROR';
        throw error;
      }
    }

    return response;
  },
  async error => {
    const originalRequest = error.config;
    let errorMessage = '服务器错误，请稍后再试';
    
    if (error.response) {
      const status = error.response.status;
      
      // 401错误 - 尝试自动刷新Token
      if (status === 401 && !originalRequest._retry && !originalRequest.url.includes('/auth/login') && !originalRequest.url.includes('/auth/refresh')) {
        if (isRefreshing) {
          // 正在刷新Token，将请求加入队列
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          }).then(token => {
            if (token) {
              originalRequest.headers['Authorization'] = `Bearer ${token}`;
            }
            return api(originalRequest);
          }).catch(err => {
            return Promise.reject(err);
          });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          // 尝试刷新Token
          const refreshResponse = await api.post('/auth/refresh');
          // 响应拦截器已经解包，直接使用 data
          const accessToken = refreshResponse.data?.accessToken || refreshResponse.data?.token;

          if (accessToken) {
            // 保存新Token
            localStorage.setItem('token', accessToken);
            api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
            originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;

            processQueue(null, accessToken);
            return api(originalRequest);
          } else {
            throw new Error('刷新Token失败');
          }
        } catch (refreshError) {
          processQueue(refreshError, null);
          // 刷新失败，清除token并跳转登录
          localStorage.removeItem('token');
          localStorage.removeItem('user');

          errorMessage = '登录已过期，请重新登录';

          showToast({
            type: 'fail',
            message: errorMessage,
            duration: 2000
          });

          // 延迟跳转，确保toast显示
          setTimeout(() => {
            window.location.href = '/#/login';
          }, 500);

          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      } else if (status === 401) {
        // 如果是登录或刷新接口返回401，直接跳转登录页
        if (originalRequest.url.includes('/auth/login') || originalRequest.url.includes('/auth/refresh')) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');

          if (!window.location.hash.includes('/login')) {
            errorMessage = '登录已过期，请重新登录';
            showToast({
              type: 'fail',
              message: errorMessage,
              duration: 2000
            });

            setTimeout(() => {
              window.location.href = '/#/login';
            }, 500);
          }
        }
      } else if (status === 403) {
        errorMessage = '没有权限执行此操作';
      } else if (status === 404) {
        errorMessage = '请求的资源不存在';
      } else if (error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      }
    } else if (error.request) {
      // 请求已发送但未收到响应
      errorMessage = '网络连接错误，请检查网络';
    } else {
      // 请求设置时出错
      errorMessage = '请求发送失败';
    }
    
    showToast({
      type: 'fail',
      message: errorMessage,
      duration: 2000
    });
    
    return Promise.reject(error);
  }
);

// 库存相关API
export const inventoryApi = {
  // 库存查询
  getInventoryStock(params) {
    return api.get('/inventory/stock', { params });
  },

  getStockList(params) {
    return api.get('/inventory/stock', { params });
  },

  getMaterialStock(materialId, locationId) {
    return api.get(`/inventory/stock/${materialId}/${locationId}`);
  },

  getStockRecords(id) {
    return api.get(`/inventory/stock/${id}/records`);
  },

  getMaterialRecords(id) {
    return api.get(`/inventory/materials/${id}/records`);
  },

  getMaterialsWithStock(params) {
    return api.get('/inventory/materials-with-stock', { params });
  },

  getMaterialsList(params) {
    return api.get('/inventory/materials', { params });
  },

  // 出库管理
  getOutboundList(params) {
    return api.get('/inventory/outbound', { params });
  },

  getOutboundDetail(id) {
    return api.get(`/inventory/outbound/${id}`);
  },

  createOutbound(data) {
    return api.post('/inventory/outbound', data);
  },

  updateOutbound(id, data) {
    return api.put(`/inventory/outbound/${id}`, data);
  },

  deleteOutbound(id) {
    return api.delete(`/inventory/outbound/${id}`);
  },

  updateOutboundStatus(id, status) {
    return api.put(`/inventory/outbound/${id}/status`, { status });
  },

  // 入库管理
  getInboundList(params) {
    return api.get('/inventory/inbound', { params });
  },

  getInboundDetail(id) {
    return api.get(`/inventory/inbound/${id}`);
  },

  createInbound(data) {
    return api.post('/inventory/inbound', data);
  },

  createInboundFromQuality(data) {
    return api.post('/inventory/inbound/from-quality', data);
  },

  updateInboundStatus(id, status) {
    return api.put(`/inventory/inbound/status/${id}`, { status });
  },

  // 库存调拨
  getTransferList(params) {
    return api.get('/inventory/transfer', { params });
  },

  getTransferDetail(id) {
    return api.get(`/inventory/transfer/${id}`);
  },

  createTransfer(data) {
    return api.post('/inventory/transfer', data);
  },

  updateTransfer(id, data) {
    return api.put(`/inventory/transfer/${id}`, data);
  },

  deleteTransfer(id) {
    return api.delete(`/inventory/transfer/${id}`);
  },

  updateTransferStatus(id, status) {
    return api.put(`/inventory/transfer/${id}/status`, { status });
  },

  getTransferStatistics() {
    return api.get('/inventory/transfer/statistics');
  },

  // 库存盘点
  getCheckList(params) {
    return api.get('/inventory/check', { params });
  },

  getCheckDetail(id) {
    return api.get(`/inventory/check/${id}`);
  },

  createCheck(data) {
    return api.post('/inventory/check', data);
  },

  updateCheck(id, data) {
    return api.put(`/inventory/check/${id}`, data);
  },

  deleteCheck(id) {
    return api.delete(`/inventory/check/${id}`);
  },

  submitCheckResult(id, data) {
    return api.post(`/inventory/check/${id}/result`, data);
  },

  adjustInventory(id) {
    return api.post(`/inventory/check/${id}/adjust`);
  },

  getCheckStatistics() {
    return api.get('/inventory/check/statistics');
  },

  // 库存调整
  adjustStock(data) {
    return api.post('/inventory/stock/adjust', data);
  },

  // 库存流水
  getTransactionList(params) {
    return api.get('/inventory/transactions', { params });
  },

  getTransactionStats() {
    return api.get('/inventory/transactions/stats');
  },

  exportTransactionReport(params) {
    return api.get('/inventory/transactions/export', { params });
  },

  // 库存报表
  getInventoryReport(params) {
    return api.get('/inventory/report', { params });
  },

  exportInventoryReport(params) {
    return api.get('/inventory/report/export', { params });
  },

  getInventoryLedger(params) {
    return api.get('/inventory/ledger', { params });
  },

  // 导出功能
  exportStocks(data) {
    return api.post('/inventory/stocks/export', data);
  },

  // 获取库位列表
  getLocations() {
    return api.get('/inventory/locations');
  },

  // 获取物料列表
  getAllMaterials() {
    return api.get('/baseData/materials');
  },

  // 获取物料列表（支持参数）
  getMaterials(params) {
    return api.get('/baseData/materials', { params });
  },

  // 仓库管理
  getWarehouses(params) {
    return api.get('/baseData/warehouses', { params });
  },

  getWarehouse(id) {
    return api.get(`/baseData/warehouses/${id}`);
  }
};

// 生产管理相关API
export const productionApi = {
  // 仪表盘数据
  getDashboardStatistics() {
    return api.get('/production/dashboard/statistics');
  },

  getDashboardTrends() {
    return api.get('/production/dashboard/trends');
  },

  getPendingTasks() {
    return api.get('/production/dashboard/pending-tasks');
  },

  // 生产计划
  getProductionPlans(params) {
    return api.get('/production/plans', { params });
  },

  getProductionPlan(id) {
    return api.get(`/production/plans/${id}`);
  },

  createProductionPlan(data) {
    return api.post('/production/plans', data);
  },

  updateProductionPlan(id, data) {
    return api.put(`/production/plans/${id}`, data);
  },

  updateProductionPlanStatus(id, status) {
    return api.put(`/production/plans/${id}/status`, { status });
  },

  deleteProductionPlan(id) {
    return api.delete(`/production/plans/${id}`);
  },

  // 获取计划物料需求
  getPlanMaterials(planId) {
    return api.get(`/production/plans/${planId}/materials`);
  },

  // 生产任务
  getProductionTasks(params) {
    return api.get('/production/tasks', { params });
  },

  getProductionTask(id) {
    return api.get(`/production/tasks/${id}`);
  },

  createProductionTask(data) {
    return api.post('/production/tasks', data);
  },

  updateProductionTask(id, data) {
    return api.put(`/production/tasks/${id}`, data);
  },

  updateProductionTaskStatus(id, status) {
    return api.put(`/production/tasks/${id}/status`, { status });
  },

  updateProductionTaskProgress(id, progress) {
    return api.post(`/production/tasks/${id}/progress`, progress);
  },

  generateTaskCode() {
    return api.get('/production/tasks/generate-code');
  },

  // 获取生产过程
  getProcesses(params) {
    return api.get('/production/processes', { params });
  },

  // 物料需求计算
  calculateMaterials(data) {
    return api.post('/production/calculate-materials', data);
  },

  // 获取产品BOM
  getProductBom(productId) {
    return api.get(`/production/product-bom/${productId}`);
  },

  // 获取今日最大序号
  getTodayMaxSequence() {
    return api.get('/production/today-sequence');
  }
};

// 销售管理相关API
export const salesApi = {
  // 客户管理
  getCustomers(params) {
    return api.get('/sales/customers', { params });
  },

  getCustomer(id) {
    return api.get(`/sales/customers/${id}`);
  },

  createCustomer(data) {
    return api.post('/sales/customers', data);
  },

  updateCustomer(id, data) {
    return api.put(`/sales/customers/${id}`, data);
  },

  getCustomersList() {
    return api.get('/sales/customers-list');
  },

  // 销售报价单
  getSalesQuotations(params) {
    return api.get('/sales/quotations', { params });
  },

  getSalesQuotation(id) {
    return api.get(`/sales/quotations/${id}`);
  },

  createSalesQuotation(data) {
    return api.post('/sales/quotations', data);
  },

  updateSalesQuotation(id, data) {
    return api.put(`/sales/quotations/${id}`, data);
  },

  deleteSalesQuotation(id) {
    return api.delete(`/sales/quotations/${id}`);
  },

  convertQuotationToOrder(id) {
    return api.post(`/sales/quotations/${id}/convert`);
  },

  getSalesQuotationStatistics() {
    return api.get('/sales/quotations/statistics');
  },

  // 销售订单
  getSalesOrders(params) {
    return api.get('/sales/orders', { params });
  },

  getSalesOrder(id) {
    return api.get(`/sales/orders/${id}`);
  },

  createSalesOrder(data) {
    return api.post('/sales/orders', data);
  },

  updateSalesOrder(id, data) {
    return api.put(`/sales/orders/${id}`, data);
  },

  deleteSalesOrder(id) {
    return api.delete(`/sales/orders/${id}`);
  },

  updateSalesOrderStatus(id, status) {
    return api.put(`/sales/orders/${id}/status`, { status });
  },

  getSalesOrderStatistics() {
    return api.get('/sales/orders/statistics');
  },

  // 销售出库
  getSalesOutbound(params) {
    return api.get('/sales/outbound', { params });
  },

  getSalesOutboundById(id) {
    return api.get(`/sales/outbound/${id}`);
  },

  createSalesOutbound(data) {
    return api.post('/sales/outbound', data);
  },

  updateSalesOutbound(id, data) {
    return api.put(`/sales/outbound/${id}`, data);
  },

  deleteSalesOutbound(id) {
    return api.delete(`/sales/outbound/${id}`);
  },

  // 销售退货
  getSalesReturns(params) {
    return api.get('/sales/returns', { params });
  },

  getSalesReturn(id) {
    return api.get(`/sales/returns/${id}`);
  },

  createSalesReturn(data) {
    return api.post('/sales/returns', data);
  },

  updateSalesReturn(id, data) {
    return api.put(`/sales/returns/${id}`, data);
  },

  deleteSalesReturn(id) {
    return api.delete(`/sales/returns/${id}`);
  },

  // 销售换货
  getSalesExchanges(params) {
    return api.get('/sales/exchanges', { params });
  },

  getSalesExchange(id) {
    return api.get(`/sales/exchanges/${id}`);
  },

  createSalesExchange(data) {
    return api.post('/sales/exchanges', data);
  },

  updateSalesExchange(id, data) {
    return api.put(`/sales/exchanges/${id}`, data);
  },

  deleteSalesExchange(id) {
    return api.delete(`/sales/exchanges/${id}`);
  },

  // 销售统计
  getSalesStatistics() {
    return api.get('/sales/statistics');
  }
};

// 采购管理相关API
export const purchaseApi = {
  // 采购申请
  getRequisitions(params) {
    return api.get('/purchase/requisitions', { params });
  },

  getRequisition(id) {
    return api.get(`/purchase/requisitions/${id}`);
  },

  createRequisition(data) {
    return api.post('/purchase/requisitions', data);
  },

  updateRequisition(id, data) {
    return api.put(`/purchase/requisitions/${id}`, data);
  },

  deleteRequisition(id) {
    return api.delete(`/purchase/requisitions/${id}`);
  },

  updateRequisitionStatus(id, status) {
    return api.put(`/purchase/requisitions/${id}/status`, { status });
  },

  // 采购订单
  getOrders(params) {
    return api.get('/purchase/orders', { params });
  },

  getOrder(id) {
    return api.get(`/purchase/orders/${id}`);
  },

  createOrder(data) {
    return api.post('/purchase/orders', data);
  },

  updateOrder(id, data) {
    return api.put(`/purchase/orders/${id}`, data);
  },

  deleteOrder(id) {
    return api.delete(`/purchase/orders/${id}`);
  },

  updateOrderStatus(id, status) {
    return api.put(`/purchase/orders/${id}/status`, { status });
  },

  // 采购入库
  getReceipts(params) {
    return api.get('/purchase/receipts', { params });
  },

  getReceipt(id) {
    return api.get(`/purchase/receipts/${id}`);
  },

  createReceipt(data) {
    return api.post('/purchase/receipts', data);
  },

  updateReceipt(id, data) {
    return api.put(`/purchase/receipts/${id}`, data);
  },

  deleteReceipt(id) {
    return api.delete(`/purchase/receipts/${id}`);
  },

  // 采购退货
  getReturns(params) {
    return api.get('/purchase/returns', { params });
  },

  getReturn(id) {
    return api.get(`/purchase/returns/${id}`);
  },

  createReturn(data) {
    return api.post('/purchase/returns', data);
  },

  updateReturn(id, data) {
    return api.put(`/purchase/returns/${id}`, data);
  },

  deleteReturn(id) {
    return api.delete(`/purchase/returns/${id}`);
  },

  // 外委加工
  getProcessing(params) {
    return api.get('/purchase/processing', { params });
  },

  getProcessingById(id) {
    return api.get(`/purchase/processing/${id}`);
  },

  createProcessing(data) {
    return api.post('/purchase/processing', data);
  },

  updateProcessing(id, data) {
    return api.put(`/purchase/processing/${id}`, data);
  },

  deleteProcessing(id) {
    return api.delete(`/purchase/processing/${id}`);
  },

  // 外委入库
  getProcessingReceipts(params) {
    return api.get('/purchase/processing-receipts', { params });
  },

  getProcessingReceipt(id) {
    return api.get(`/purchase/processing-receipts/${id}`);
  },

  createProcessingReceipt(data) {
    return api.post('/purchase/processing-receipts', data);
  },

  updateProcessingReceipt(id, data) {
    return api.put(`/purchase/processing-receipts/${id}`, data);
  },

  deleteProcessingReceipt(id) {
    return api.delete(`/purchase/processing-receipts/${id}`);
  },

  // 供应商管理
  getSuppliers(params) {
    return api.get('/purchase/suppliers', { params });
  },

  getSupplier(id) {
    return api.get(`/purchase/suppliers/${id}`);
  },

  // 统计数据
  getStatistics() {
    return api.get('/purchase/statistics');
  }
};

// 基础数据管理相关API
export const baseDataApi = {
  // 物料管理
  getMaterials(params) {
    return api.get('/baseData/materials', { params });
  },

  getMaterial(id) {
    return api.get(`/baseData/materials/${id}`);
  },

  createMaterial(data) {
    return api.post('/baseData/materials', data);
  },

  updateMaterial(id, data) {
    return api.put(`/baseData/materials/${id}`, data);
  },

  deleteMaterial(id) {
    return api.delete(`/baseData/materials/${id}`);
  },

  getMaterialOptions() {
    return api.get('/baseData/materials/options');
  },

  getNextMaterialCode() {
    return api.get('/baseData/materials/next-code');
  },

  getMaterialsByIds(ids) {
    return api.post('/baseData/materials/batch', { ids });
  },

  // BOM管理
  getBoms(params) {
    return api.get('/baseData/boms', { params });
  },

  getBom(id) {
    return api.get(`/baseData/boms/${id}`);
  },

  createBom(data) {
    return api.post('/baseData/boms', data);
  },

  updateBom(id, data) {
    return api.put(`/baseData/boms/${id}`, data);
  },

  deleteBom(id) {
    return api.delete(`/baseData/boms/${id}`);
  },

  approveBom(id) {
    return api.put(`/baseData/boms/${id}/approve`);
  },

  unapproveBom(id) {
    return api.put(`/baseData/boms/${id}/unapprove`);
  },

  // 客户管理
  getCustomers(params) {
    return api.get('/baseData/customers', { params });
  },

  getCustomer(id) {
    return api.get(`/baseData/customers/${id}`);
  },

  createCustomer(data) {
    return api.post('/baseData/customers', data);
  },

  updateCustomer(id, data) {
    return api.put(`/baseData/customers/${id}`, data);
  },

  deleteCustomer(id) {
    return api.delete(`/baseData/customers/${id}`);
  },

  // 供应商管理
  getSuppliers(params) {
    return api.get('/baseData/suppliers', { params });
  },

  getSupplier(id) {
    return api.get(`/baseData/suppliers/${id}`);
  },

  createSupplier(data) {
    return api.post('/baseData/suppliers', data);
  },

  updateSupplier(id, data) {
    return api.put(`/baseData/suppliers/${id}`, data);
  },

  deleteSupplier(id) {
    return api.delete(`/baseData/suppliers/${id}`);
  },

  // 库位管理
  getLocations(params) {
    return api.get('/baseData/locations', { params });
  },

  getLocation(id) {
    return api.get(`/baseData/locations/${id}`);
  },

  createLocation(data) {
    return api.post('/baseData/locations', data);
  },

  updateLocation(id, data) {
    return api.put(`/baseData/locations/${id}`, data);
  },

  deleteLocation(id) {
    return api.delete(`/baseData/locations/${id}`);
  },

  // 工序模板管理
  getProcessTemplates(params) {
    return api.get('/baseData/process-templates', { params });
  },

  getProcessTemplate(id) {
    return api.get(`/baseData/process-templates/${id}`);
  },

  createProcessTemplate(data) {
    return api.post('/baseData/process-templates', data);
  },

  updateProcessTemplate(id, data) {
    return api.put(`/baseData/process-templates/${id}`, data);
  },

  deleteProcessTemplate(id) {
    return api.delete(`/baseData/process-templates/${id}`);
  },

  updateProcessTemplateStatus(id, status) {
    return api.put(`/baseData/process-templates/${id}/status`, { status });
  },

  getProcessTemplateByProductId(productId) {
    return api.get(`/baseData/products/${productId}/process-template`);
  }
};

// 财务管理相关API
export const financeApi = {
  // 财务统计
  getStatistics() {
    return api.get('/finance/statistics');
  },

  // 总账管理
  getAccounts(params) {
    return api.get('/finance/gl/accounts', { params });
  },

  getAccount(id) {
    return api.get(`/finance/gl/accounts/${id}`);
  },

  createAccount(data) {
    return api.post('/finance/gl/accounts', data);
  },

  updateAccount(id, data) {
    return api.put(`/finance/gl/accounts/${id}`, data);
  },

  deleteAccount(id) {
    return api.delete(`/finance/gl/accounts/${id}`);
  },

  // 会计凭证
  getEntries(params) {
    return api.get('/finance/gl/entries', { params });
  },

  getEntry(id) {
    return api.get(`/finance/gl/entries/${id}`);
  },

  createEntry(data) {
    return api.post('/finance/gl/entries', data);
  },

  updateEntry(id, data) {
    return api.put(`/finance/gl/entries/${id}`, data);
  },

  deleteEntry(id) {
    return api.delete(`/finance/gl/entries/${id}`);
  },

  approveEntry(id) {
    return api.put(`/finance/gl/entries/${id}/approve`);
  },

  rejectEntry(id, reason) {
    return api.put(`/finance/gl/entries/${id}/reject`, { reason });
  },

  // 会计期间
  getPeriods(params) {
    return api.get('/finance/gl/periods', { params });
  },

  getCurrentPeriod() {
    return api.get('/finance/gl/periods/current');
  },

  closePeriod(id) {
    return api.put(`/finance/gl/periods/${id}/close`);
  },

  // 应收管理
  getARInvoices(params) {
    return api.get('/finance/ar/invoices', { params });
  },

  getARInvoice(id) {
    return api.get(`/finance/ar/invoices/${id}`);
  },

  createARInvoice(data) {
    return api.post('/finance/ar/invoices', data);
  },

  getARReceipts(params) {
    return api.get('/finance/ar/receipts', { params });
  },

  createARReceipt(data) {
    return api.post('/finance/ar/receipts', data);
  },

  getARAging(params) {
    return api.get('/finance/ar/aging', { params });
  },

  // 应付管理
  getAPInvoices(params) {
    return api.get('/finance/ap/invoices', { params });
  },

  getAPInvoice(id) {
    return api.get(`/finance/ap/invoices/${id}`);
  },

  createAPInvoice(data) {
    return api.post('/finance/ap/invoices', data);
  },

  getAPPayments(params) {
    return api.get('/finance/ap/payments', { params });
  },

  createAPPayment(data) {
    return api.post('/finance/ap/payments', data);
  },

  getAPAging(params) {
    return api.get('/finance/ap/aging', { params });
  },

  // 固定资产
  getAssets(params) {
    return api.get('/finance/assets/list', { params });
  },

  getAsset(id) {
    return api.get(`/finance/assets/list/${id}`);
  },

  createAsset(data) {
    return api.post('/finance/assets/list', data);
  },

  updateAsset(id, data) {
    return api.put(`/finance/assets/list/${id}`, data);
  },

  deleteAsset(id) {
    return api.delete(`/finance/assets/list/${id}`);
  },

  getAssetCategories() {
    return api.get('/finance/assets/categories');
  },

  getDepreciation(params) {
    return api.get('/finance/assets/depreciation', { params });
  },

  calculateDepreciation(data) {
    return api.post('/finance/assets/depreciation/calculate', data);
  },

  // 现金银行
  getCashAccounts(params) {
    return api.get('/finance/cash/accounts', { params });
  },

  getCashAccount(id) {
    return api.get(`/finance/cash/accounts/${id}`);
  },

  createCashAccount(data) {
    return api.post('/finance/cash/accounts', data);
  },

  getCashTransactions(params) {
    return api.get('/finance/cash/transactions', { params });
  },

  createCashTransaction(data) {
    return api.post('/finance/cash/transactions', data);
  },

  getReconciliation(params) {
    return api.get('/finance/cash/reconciliation', { params });
  },

  // 财务报表
  getBalanceSheet(params) {
    return api.get('/finance/reports/balance-sheet', { params });
  },

  getIncomeStatement(params) {
    return api.get('/finance/reports/income-statement', { params });
  },

  getCashFlowStatement(params) {
    return api.get('/finance/reports/cash-flow', { params });
  },

  // 财务自动化
  getAutomationTasks() {
    return api.get('/finance/automation/tasks');
  },

  executeAutomationTask(taskType) {
    return api.post('/finance/automation/execute', { taskType });
  }
};

// 质量管理相关API
export const qualityApi = {
  // 质量统计
  getStatistics() {
    return api.get('/quality/statistics');
  },

  // 来料检验
  getIncomingInspections(params) {
    return api.get('/quality/incoming', { params });
  },

  getIncomingInspection(id) {
    return api.get(`/quality/incoming/${id}`);
  },

  createIncomingInspection(data) {
    return api.post('/quality/incoming', data);
  },

  updateIncomingInspection(id, data) {
    return api.put(`/quality/incoming/${id}`, data);
  },

  deleteIncomingInspection(id) {
    return api.delete(`/quality/incoming/${id}`);
  },

  startInspection(id) {
    return api.put(`/quality/incoming/${id}/start`);
  },

  completeInspection(id, data) {
    return api.put(`/quality/incoming/${id}/complete`, data);
  },

  // 过程检验
  getProcessInspections(params) {
    return api.get('/quality/process', { params });
  },

  getProcessInspection(id) {
    return api.get(`/quality/process/${id}`);
  },

  createProcessInspection(data) {
    return api.post('/quality/process', data);
  },

  updateProcessInspection(id, data) {
    return api.put(`/quality/process/${id}`, data);
  },

  // 成品检验
  getFinalInspections(params) {
    return api.get('/quality/final', { params });
  },

  getFinalInspection(id) {
    return api.get(`/quality/final/${id}`);
  },

  createFinalInspection(data) {
    return api.post('/quality/final', data);
  },

  updateFinalInspection(id, data) {
    return api.put(`/quality/final/${id}`, data);
  },

  // 检验模板
  getInspectionTemplates(params) {
    return api.get('/quality/templates', { params });
  },

  getInspectionTemplate(id) {
    return api.get(`/quality/templates/${id}`);
  },

  createInspectionTemplate(data) {
    return api.post('/quality/templates', data);
  },

  updateInspectionTemplate(id, data) {
    return api.put(`/quality/templates/${id}`, data);
  },

  deleteInspectionTemplate(id) {
    return api.delete(`/quality/templates/${id}`);
  },

  // 质量追溯
  getTraceabilityRecords(params) {
    return api.get('/quality/traceability', { params });
  },

  getTraceabilityRecord(id) {
    return api.get(`/quality/traceability/${id}`);
  },

  traceProduct(productCode) {
    return api.get(`/quality/traceability/product/${productCode}`);
  },

  traceBatch(batchNumber) {
    return api.get(`/quality/traceability/batch/${batchNumber}`);
  },

  // 不合格品处理
  getNonconformanceRecords(params) {
    return api.get('/quality/nonconformance', { params });
  },

  getNonconformanceRecord(id) {
    return api.get(`/quality/nonconformance/${id}`);
  },

  createNonconformanceRecord(data) {
    return api.post('/quality/nonconformance', data);
  },

  updateNonconformanceRecord(id, data) {
    return api.put(`/quality/nonconformance/${id}`, data);
  },

  processNonconformance(id, action, data) {
    return api.put(`/quality/nonconformance/${id}/${action}`, data);
  },

  // 质量报表
  getQualityReports(params) {
    return api.get('/quality/reports', { params });
  },

  getQualityTrends(params) {
    return api.get('/quality/reports/trends', { params });
  },

  getSPCData(params) {
    return api.get('/quality/reports/spc', { params });
  },

  // 检验项目
  getInspectionItems(params) {
    return api.get('/quality/inspection-items', { params });
  },

  createInspectionItem(data) {
    return api.post('/quality/inspection-items', data);
  },

  updateInspectionItem(id, data) {
    return api.put(`/quality/inspection-items/${id}`, data);
  },

  // 检验结果录入
  submitInspectionResult(inspectionId, data) {
    return api.post(`/quality/inspections/${inspectionId}/results`, data);
  },

  updateInspectionResult(inspectionId, resultId, data) {
    return api.put(`/quality/inspections/${inspectionId}/results/${resultId}`, data);
  }
};

// 认证相关API
export const authApi = {
  // 用户登录
  login(credentials) {
    return api.post('/auth/login', credentials);
  },

  // 获取用户信息
  getUserProfile() {
    return api.get('/auth/profile');
  }
};

export default api;