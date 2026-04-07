/**
 * 质量相关服务
 */
const { logger } = require('../../utils/logger');
const axios = require('axios');
const config = require('../../config');

// 构建API基础URL，避免硬编码
const getApiUrl = () => {
  const { protocol, host, port } = config.api;
  // 如果有设置baseUrl，则优先使用
  if (config.api.baseUrl) {
    return config.api.baseUrl;
  }
  return `${protocol}://${host}:${port}/api`;
};

// 创建axios实例
const api = axios.create({
  baseURL: getApiUrl(),
  timeout: 30000,
});

// 设置请求拦截器
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    logger.error('[质量服务] 请求错误:', error);
    return Promise.reject(error);
  }
);

// 设置响应拦截器
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    logger.error('[质量服务] 响应错误:', error.message);
    return Promise.reject(error);
  }
);

// 质量API服务
const qualityApi = {
  // 自动创建追溯记录
  autoCreateTraceability: async (triggerType, data) => {
    try {
      const response = await api.post('/quality/traceability/auto-create', { triggerType, data });
      return response.data;
    } catch (error) {
      logger.error('自动创建追溯记录失败:', error);
      throw error;
    }
  },

  // 获取全链路追溯数据
  getFullTraceability: async (type, code, batchNumber) => {
    try {
      const response = await api.post('/quality/traceability/full', { type, code, batchNumber });
      return response.data;
    } catch (error) {
      logger.error('获取全链路追溯数据失败:', error);
      throw error;
    }
  },

  // 自动生成所有可能的追溯记录
  autoGenerateAllTraceability: async () => {
    try {
      const response = await api.post('/quality/traceability/auto-generate-all');
      return response.data;
    } catch (error) {
      logger.error('自动生成所有追溯记录失败:', error);
      throw error;
    }
  },
};

module.exports = {
  qualityApi,
};
