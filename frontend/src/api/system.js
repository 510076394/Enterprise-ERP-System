import { api } from '../services/axiosInstance';

// 系统相关API
export const systemApi = {
    // 角色管理
    getRoles: (params) => api.get('/system/roles', { params }),
    getRole: (id) => api.get(`/system/roles/${id}`),
    createRole: (data) => api.post('/system/roles', data),
    updateRole: (id, data) => api.put(`/system/roles/${id}`, data),
    deleteRole: (id) => api.delete(`/system/roles/${id}`),
    updateRoleStatus: (id, data) => api.put(`/system/roles/${id}/status`, data),
    getRolePermissions: (id) => api.get(`/system/roles/${id}/permissions`),
    updateRolePermissions: (id, data) => api.put(`/system/roles/${id}/permissions`, data),

    // 菜单管理
    getMenus: (params) => api.get('/system/menus', { params }),
    getMenu: (id) => api.get(`/system/menus/${id}`),
    createMenu: (data) => api.post('/system/menus', data),
    updateMenu: (id, data) => api.put(`/system/menus/${id}`, data),
    deleteMenu: (id) => api.delete(`/system/menus/${id}`),
    getMenusDirect: () => api.get('/system/menus/direct'),

    // 部门管理
    getDepartments: (params) => api.get('/system/departments', { params }),
    getDepartment: (id) => api.get(`/system/departments/${id}`),
    createDepartment: (data) => api.post('/system/departments', data),
    updateDepartment: (id, data) => api.put(`/system/departments/${id}`, data),
    deleteDepartment: (id) => api.delete(`/system/departments/${id}`),

    // 用户管理
    getUsers: (params) => api.get('/system/users', { params }),
    getUsersList: () => api.get('/system/users/list'),
    getUser: (id) => api.get(`/system/users/${id}`),
    createUser: (data) => api.post('/system/users', data),
    updateUser: (id, data) => api.put(`/system/users/${id}`, data),
    deleteUser: (id) => api.delete(`/system/users/${id}`),
    updateUserStatus: (id, data) => api.put(`/system/users/${id}/status`, data),
    resetUserPassword: (id) => api.post(`/system/users/${id}/reset-password`),

    // 系统日志
    getLogs: (params) => api.get('/system/logs', { params }),
    getLog: (id) => api.get(`/system/logs/${id}`),

    // 业务类型管理
    getBusinessTypeGroups: () => api.get('/system/business-types/groups'),
    getBusinessTypes: (params) => api.get('/system/business-types', { params }),
    getBusinessTypesByCategory: (category) => api.get(`/system/business-types/category/${category}`),
    getBusinessType: (id) => api.get(`/system/business-types/${id}`),
    createBusinessType: (data) => api.post('/system/business-types', data),
    updateBusinessType: (id, data) => api.put(`/system/business-types/${id}`, data),
    deleteBusinessType: (id) => api.delete(`/system/business-types/${id}`),
    updateBusinessTypesSort: (data) => api.put('/system/business-types/sort', data)
};
