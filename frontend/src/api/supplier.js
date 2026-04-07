import { api } from '../services/axiosInstance';

/**
 * 供应商 API
 *
 * 注意：API 层直接返回 axios 响应，不做二次封装
 * 前端组件使用 parseListData 或 parsePaginatedData 解析数据
 */
export const supplierApi = {
    /**
     * 获取供应商列表
     * @param {Object} params - 查询参数
     * @returns {Promise} response.data = { list: [], total, page, pageSize }
     */
    getSuppliers: (params = {}) => api.get('/baseData/suppliers', {
        params,
        headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }
    }),
    getSupplier: (id) => api.get(`/baseData/suppliers/${id}`),
    createSupplier: (supplier) => api.post('/baseData/suppliers', supplier),
    updateSupplier: (id, supplier) => {
        if (!id) throw new Error('更新供应商失败: 未提供ID');
        return api.put(`/baseData/suppliers/${id}`, supplier);
    },
    deleteSupplier: (id) => api.delete(`/baseData/suppliers/${id}`),

    // 供应商导入导出
    exportSuppliers: (params) => api.post('/baseData/suppliers/export', params, { responseType: 'blob' }),
    importSuppliers: (formData) => api.post('/baseData/suppliers/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    downloadSupplierTemplate: () => api.get('/baseData/suppliers/template', {
        responseType: 'blob'
    })
};
