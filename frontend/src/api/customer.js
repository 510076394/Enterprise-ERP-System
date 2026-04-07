import { api } from '../services/axiosInstance';

/**
 * 客户 API
 *
 * 注意：API 层直接返回 axios 响应，不做二次封装
 * 前端组件使用 parseListData 或 parsePaginatedData 解析数据
 */
export const customerApi = {
    /**
     * 获取客户列表
     * @param {Object} params - 查询参数
     * @returns {Promise} response.data = { list: [], total, page, pageSize }
     */
    getCustomers: (params = {}) => api.get('/baseData/customers', {
        params,
        headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }
    }),
    getCustomer: (id) => api.get(`/baseData/customers/${id}`),
    createCustomer: (customer) => api.post('/baseData/customers', customer),
    updateCustomer: (id, customer) => {
        if (!id) throw new Error('更新客户失败: 未提供ID');
        return api.put(`/baseData/customers/${id}`, customer);
    },
    deleteCustomer: (id) => api.delete(`/baseData/customers/${id}`),

    // 客户统计（避免全量加载）
    getCustomerStats: () => api.get('/baseData/customers/stats'),

    // 客户导入导出
    exportCustomers: (params) => api.post('/baseData/customers/export', params, { responseType: 'blob' }),
    importCustomers: (formData) => api.post('/baseData/customers/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    downloadCustomerTemplate: () => api.get('/baseData/customers/template', {
        responseType: 'blob'
    })
};
