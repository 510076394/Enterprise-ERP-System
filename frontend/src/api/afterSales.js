import { api } from '../services/axiosInstance';

// 换货单管理API
export const replacementOrderApi = {
    // 获取换货单列表
    getReplacementOrders: (params) => api.get('/replacement-orders', { params }),

    // 获取换货单详情
    getReplacementOrderById: (id) => api.get(`/replacement-orders/${id}`),

    // 更新换货单
    updateReplacementOrder: (id, data) => api.put(`/replacement-orders/${id}`, data),

    // 换货收货确认
    confirmReceipt: (id, data) => api.post(`/replacement-orders/${id}/confirm-receipt`, data),

    // 更新换货单状态
    updateStatus: (id, data) => api.put(`/replacement-orders/${id}/status`, data),

    // 获取统计数据
    getStatistics: (params) => api.get('/replacement-orders/statistics', { params })
};
