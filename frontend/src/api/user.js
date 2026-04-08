import { api } from '../services/axiosInstance';

/**
 * 用户个人中心 API
 * 仅包含已验证在前端被实际调用的方法
 */
export const userApi = {
    // 用户个人信息
    getProfile: () => api.get('/auth/profile'),
    updateProfile: (data) => api.put('/auth/profile', data),
    changePassword: (data) => api.put('/users/password', data),
    updateAvatar: (formData) => api.put('/users/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    updateAvatarFrame: (frameId) => api.post('/auth/profile/avatar-frame', { frameId }),

    // 获取用户菜单（Layout.vue 使用）
    getUserMenus: () => api.get('/auth/menus'),

    // 用户在线时长排行榜（Dashboard.vue 使用）
    getOnlineTimeRanking: (params) => api.get('/user-activities/online-time-ranking', { params })
};

/**
 * 待办事项 API
 * 仅包含已验证在前端被实际调用的方法
 */
export const todoApi = {
    // 获取待办事项列表
    getTodos: (params) => api.get('/todos', { params }),
    getAllTodos: (params) => api.get('/todos', { params }),

    // 获取待办事项详情
    getTodo: (id) => api.get(`/todos/${id}`),

    // 创建待办事项
    createTodo: (data) => api.post('/todos', data),

    // 更新待办事项
    updateTodo: (id, data) => api.put(`/todos/${id}`, data),

    // 删除待办事项
    deleteTodo: (id) => api.delete(`/todos/${id}`),

    // 更新待办事项状态
    updateTodoStatus: (id, status) => api.put(`/todos/${id}/status`, { status }),

    // 切换待办事项状态
    toggleTodoStatus: (id) => api.put(`/todos/${id}/toggle`, {}),

    // 获取待办事项统计
    getTodoStatistics: () => api.get('/todos/statistics'),

    // 获取可用用户列表
    getAvailableUsers: () => api.get('/todos/available-users')
};
