import { api } from '../services/axiosInstance';

export const productionApi = {
    // 仪表盘统计数据
    getDashboardStatistics: () => api.get('/production/dashboard/statistics'),
    getDashboardTrends: (params) => api.get('/production/dashboard/trends', { params }),
    getProcessCompletionRates: () => api.get('/production/dashboard/process-completion'),
    getPendingTasks: (params) => api.get('/production/dashboard/pending-tasks', { params }),

    // 仪表盘生产计划 - 所有用户都可访问
    getDashboardProductionPlans: (params) => api.get('/production/dashboard/plans', { params }),

    // 生产计划
    getTodayMaxSequence: () => api.get('/production/today-sequence'),
    getTodaySequence: () => api.get('/production/today-sequence'), // 别名,兼容旧代码
    getProductionPlans: async (params) => {
        try {

            // 特殊处理status参数
            let requestParams = { ...(params || {}) };
            let apiUrl = '/production/plans';

            // 如果status是字符串，确保它被正确传递
            if (requestParams.status && typeof requestParams.status === 'string') {
                // 不需要特殊处理，直接作为查询参数传递
            }
            // 如果status是数组，需要特殊处理
            else if (requestParams.status && Array.isArray(requestParams.status)) {
                // 构建查询字符串
                const searchParams = new URLSearchParams();
                for (const key in requestParams) {
                    if (key !== 'status') {
                        searchParams.append(key, requestParams[key]);
                    }
                }

                // 为每个状态值添加status[]参数
                requestParams.status.forEach(s => {
                    searchParams.append('status[]', s);
                });

                // 构建完整URL
                apiUrl = `${apiUrl}?${searchParams.toString()}`;

                // 清空requestParams，因为我们已经将其添加到URL中
                requestParams = { timestamp: new Date().getTime() };
            }

            // 添加时间戳防止缓存
            requestParams.timestamp = new Date().getTime();

            // 发送请求
            const response = await api.get(apiUrl, {
                params: requestParams,
                headers: {
                    'Cache-Control': 'no-cache, no-store',
                    'Pragma': 'no-cache'
                }
            });

            return response;
        } catch (error) {
            console.error('获取生产计划列表失败:', error);
            throw error;
        }
    },
    getProductionPlan: (id) => api.get(`/production/plans/${id}`),
    createProductionPlan: (data) => api.post('/production/plans', data),
    updateProductionPlan: (id, data) => api.put(`/production/plans/${id}`, data),
    deleteProductionPlan: (id) => api.delete(`/production/plans/${id}`),
    updateProductionPlanStatus: (id, data) => api.put(`/production/plans/${id}/status`, data),

    // 生产任务
    getProductionTasks: (params) => api.get('/production/tasks', { params }),
    getProductionTask: (id) => api.get(`/production/tasks/${id}`),
    createProductionTask: (data) => api.post('/production/tasks', data),
    updateProductionTask: (id, data) => api.put(`/production/tasks/${id}`, data),
    deleteProductionTask: (id) => api.delete(`/production/tasks/${id}`),
    updateProductionTaskStatus: (id, data) => {
        return api.put(`/production/tasks/${id}/status`, { status: data.status });
    },
    generateTaskCode: () => api.get('/production/tasks/generate-code'),

    // 生产过程
    getProductionProcesses: (params) => api.get('/production/processes', { params }),
    getProductionProcess: (id) => api.get(`/production/processes/${id}`),
    updateProductionProcess: (id, data) => api.put(`/production/processes/${id}`, data),

    // 生产报工
    getProductionReports: (params) => api.get('/production/reports', { params }),
    getProductionReportSummary: (params) => api.get('/production/reports/summary', { params }),
    getProductionReportDetail: (params) => api.get('/production/reports/detail', { params }),
    getProductionReportStatistics: (params) => api.get('/production/reports/statistics', { params }),
    getTaskReportStats: (taskId) => api.get(`/production/reports/task/${taskId}/stats`),
    getTaskProcesses: (taskId) => api.get(`/production/reports/task/${taskId}/processes`),
    createProductionReport: (data) => api.post('/production/reports', data),
    updateProductionReport: (id, data) => api.put(`/production/reports/${id}`, data),
    deleteProductionReport: (id) => api.delete(`/production/reports/${id}`),

    // 导出生产数据
    exportProductionData: (params) => api.get('/production/export', {
        params,
        responseType: 'blob'
    }),

    // 物料需求计算
    calculateMaterials: async (params) => {
        try {
            // 确保传递必要的参数
            if (!params.productId || !params.bomId || !params.quantity) {
                throw new Error('缺少必要参数: productId、bomId或quantity');
            }

            if (isNaN(Number(params.quantity)) || Number(params.quantity) <= 0) {
                throw new Error('quantity参数必须是大于0的数字');
            }

            // 添加时间戳以避免缓存问题
            const requestParams = {
                ...params,
                quantity: Number(params.quantity), // 确保quantity是数字类型
                timestamp: new Date().getTime()
            };

            // 执行API调用
            const response = await api.post('/production/calculate-materials', requestParams);

            // 拦截器已解包，response.data 就是业务数据
            let materialsData = [];
            if (Array.isArray(response.data)) {
                materialsData = response.data;
            } else if (response.data?.list && Array.isArray(response.data.list)) {
                materialsData = response.data.list;
            } else if (typeof response.data === 'object' && !Array.isArray(response.data)) {
                // 单个物料对象
                materialsData = [response.data];
            }

            // 规范化物料数据
            materialsData = materialsData.map(material => {
                // 确保数值字段是数字类型
                const requiredQuantity = typeof material.requiredQuantity === 'string' ? parseFloat(material.requiredQuantity) : (material.requiredQuantity || 0);
                const stockQuantity = typeof material.stockQuantity === 'string' ? parseFloat(material.stockQuantity) : (material.stockQuantity || 0);

                // 计算缺料数量
                const shortageQuantity = Math.max(0, requiredQuantity - stockQuantity);

                return {
                    ...material,
                    // 标准化数值字段
                    quantity: typeof material.quantity === 'string' ? parseFloat(material.quantity) : (material.quantity || 0),
                    requiredQuantity: requiredQuantity,
                    stockQuantity: stockQuantity,
                    shortageQuantity: shortageQuantity,
                    // 添加物料状态标记
                    status: shortageQuantity > 0 ? 'shortage' : 'sufficient',
                    // 确保有物料编码和名称
                    materialCode: material.code || material.materialCode || '',
                    materialName: material.name || material.materialName || ''
                };
            });

            // 返回标准化的响应结构
            return {
                data: materialsData,
                success: true
            };
        } catch (error) {
            console.error('获取物料需求数据失败:', error);
            throw error;
        }
    },

    // 获取产品的BOM数据
    getProductBom: async (productId) => {
        try {
            if (!productId) {
                throw new Error('缺少必要参数: productId');
            }

            // 使用新的直接API端点获取BOM数据
            const response = await api.get(`/production/product-bom/${productId}`);
            // 拦截器已解包，response.data 就是业务数据
            return { data: response.data };
        } catch (error) {
            console.error('获取产品BOM数据失败:', error);
            throw error;
        }
    }
};
