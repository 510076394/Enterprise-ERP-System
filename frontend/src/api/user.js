import { api } from '../services/axiosInstance';

export const userApi = {
    // 用户个人信息
    getProfile: () => api.get('/auth/profile'),
    updateProfile: (data) => api.put('/auth/profile', data),
    changePassword: (data) => api.put('/users/password', data),
    updateAvatar: (formData) => api.put('/users/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    updateAvatarFrame: (frameId) => api.post('/auth/profile/avatar-frame', { frameId }),

    // 获取用户菜单（根据权限过滤的菜单树）
    getUserMenus: () => api.get('/auth/menus'),

    // 用户设置
    getSettings: () => api.get('/users/settings'),
    updateSettings: (data) => api.put('/users/settings', data),

    // 用户通知
    getNotifications: (params) => api.get('/users/notifications', { params }),
    markNotificationRead: (id) => api.put(`/users/notifications/${id}/read`),
    markAllNotificationsRead: () => api.put('/users/notifications/read-all'),
    deleteNotification: (id) => api.delete(`/users/notifications/${id}`),
    getUnreadCount: () => api.get('/users/notifications/unread-count'),

    // 用户活动日志
    getActivities: (params) => api.get('/user-activities', { params }),

    // 用户统计数据
    getStatistics: () => api.get('/user-activities/statistics'),

    // 用户在线时长排行榜
    getOnlineTimeRanking: (params) => api.get('/user-activities/online-time-ranking', { params })
};

// 待办事项API
export const todoApi = {
    // 获取待办事项列表
    getTodos: (params) => api.get('/todos', { params }),
    getAllTodos: (params) => api.get('/todos', { params }), // 别名,兼容旧代码

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
