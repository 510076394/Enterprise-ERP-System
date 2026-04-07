import { api } from '../services/axiosInstance';

export const locationApi = {
    // 库位管理
    getLocations: (params) => api.get('/baseData/locations', { params }),
    getLocation: (id) => api.get(`/baseData/locations/${id}`),
    createLocation: async (location) => {
        try {
            const response = await api.post('/baseData/locations', location);
            return response;
        } catch (error) {
            console.error('创建库位失败:', error);
            throw error;
        }
    },
    updateLocation: async (id, location) => {
        try {
            const response = await api.put(`/baseData/locations/${id}`, location);
            return response;
        } catch (error) {
            console.error('更新库位失败:', error);
            throw error;
        }
    },
    deleteLocation: (id) => api.delete(`/baseData/locations/${id}`)
};
