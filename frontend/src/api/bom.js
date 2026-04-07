import { api } from '../services/axiosInstance';

/**
 * BOM API
 *
 * 重要说明：
 * 1. axios 拦截器 (axiosInstance.js) 已统一解包 ResponseHandler 格式
 * 2. response.data 就是实际的业务数据，格式为: { list: [], total, page, pageSize, totalPages }
 * 3. 前端组件应使用 parsePaginatedData 或 parseListData 解析响应
 * 4. API 层不再做二次封装，直接返回原始响应
 */

export const bomApi = {
    /**
     * 获取BOM列表
     * @param {Object} params - 查询参数 { page, pageSize, product_id, ... }
     * @returns {Promise} 响应对象，response.data = { list: [], total, page, pageSize, totalPages }
     */
    getBoms: async (params = {}) => {
        // 规范化参数
        const requestParams = {
            ...(params?.params || params),
            timestamp: Date.now()  // 防止缓存
        };

        // 兼容 product_id 和 productId 两种命名
        if (requestParams.productId && !requestParams.product_id) {
            requestParams.product_id = requestParams.productId;
        }

        const response = await api.get('/baseData/boms', {
            params: requestParams,
            headers: {
                'Cache-Control': 'no-cache, no-store',
                'Pragma': 'no-cache'
            }
        });

        // 拦截器已解包，response.data 就是业务数据
        // 后端 ResponseHandler.paginated() 返回格式: { list: [], total, page, pageSize, totalPages }
        // 直接返回，让 parsePaginatedData 处理
        return response;
    },
    /**
     * 获取单个BOM详情
     * @param {number|string} id - BOM ID
     * @returns {Promise} 响应对象，response.data = BOM对象
     */
    getBom: (id) => api.get(`/baseData/boms/${id}`),

    /**
     * 获取BOM明细
     * @param {number|string} id - BOM ID
     * @returns {Promise} 响应对象，response.data = 明细数组
     */
    getBomDetails: (id) => api.get(`/baseData/boms/${id}/details`),
    createBom: (bom) => api.post('/baseData/boms', bom),
    updateBom: (id, bom) => api.put(`/baseData/boms/${id}`, bom),
    deleteBom: (id) => api.delete(`/baseData/boms/${id}`),

    // 获取BOM统计信息
    getBomStats: () => api.get('/baseData/boms/stats'),

    // BOM导出功能
    exportBoms: (filters) => api.get('/baseData/boms/export', {
        params: filters,
        responseType: 'blob'
    }),

    // 导入BOM数据
    importBoms: (data) => api.post('/baseData/boms/import', data, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    }),

    // 下载BOM导入模板
    downloadBomTemplate: () => api.get('/baseData/boms/template', {
        responseType: 'blob'
    }),

    // 批量替换BOM
    replaceBom: (data) => api.post('/baseData/boms/replace', data),

    // 定位零部件 - 查找包含特定零部件的BOM
    locatePart: (partCode) => api.get(`/baseData/boms/locate/${partCode}`),

    // 审核BOM
    approveBom: (id) => api.put(`/baseData/boms/${id}/approve`, { approved: true }),

    // 反审核BOM
    unapproveBom: async (id) => {
        const response = await api.put(`/baseData/boms/${id}/unapprove`);
        return response;
    },

    // ========== 引用式BOM相关API ==========

    /**
     * 展开BOM - 获取所有层级物料（递归展开引用的子BOM）
     * @param {number} id - BOM ID
     * @param {Object} params - { quantity: 1, useCache: true }
     * @returns {Promise} 展开结果
     */
    explodeBom: (id, params = {}) => api.get(`/baseData/boms/${id}/explode`, { params }),

    /**
     * 检测循环引用
     * @param {number} productId - 产品ID
     * @param {number} materialId - 要添加的物料ID
     * @returns {Promise} { hasCircle: boolean, path: string }
     */
    detectCircularReference: (productId, materialId) =>
        api.get('/baseData/boms/detect-circular', { params: { productId, materialId } }),

    /**
     * 获取物料的子BOM信息
     * @param {number} materialId - 物料ID
     * @returns {Promise} 子BOM信息
     */
    getMaterialSubBom: (materialId) => api.get(`/baseData/materials/${materialId}/sub-bom`),

    /**
     * 刷新BOM缓存
     * @param {number} id - BOM ID
     * @returns {Promise}
     */
    refreshBomCache: (id) => api.post(`/baseData/boms/${id}/refresh-cache`)
};
