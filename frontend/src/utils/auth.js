/**
 * 前端认证工具
 * @description 处理Token认证（支持Cookie和LocalStorage双模式）
 * @date 2025-11-21
 */

import axios from 'axios';

/**
 * 配置axios以支持Cookie
 */
export const configureAxios = () => {
  // 允许跨域请求携带Cookie
  axios.defaults.withCredentials = true;

  // 从LocalStorage获取token（向后兼容）
  const token = localStorage.getItem('token');
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
};

/**
 * 登录（新版 - 使用Cookie）
 * @param {Object} credentials - 登录凭据
 * @returns {Promise<Object>} 用户信息
 */
export const loginWithCookie = async (credentials) => {
  try {
    const response = await axios.post('/auth/login', credentials);
    
    // axios拦截器已自动解包ResponseHandler格式
    const { accessToken, user } = response.data;
    
    // 保存用户信息到localStorage
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    }
    
    // 可选：保存accessToken到内存（不推荐存localStorage）
    // sessionStorage比localStorage更安全，页面关闭即清除
    if (accessToken) {
      sessionStorage.setItem('accessToken', accessToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
    }
    
    return { user, accessToken };
  } catch (error) {
    throw error;
  }
};

/**
 * 刷新Token
 * @returns {Promise<string>} 新的accessToken
 */
export const refreshToken = async () => {
  try {
    const response = await axios.post('/auth/refresh');
    // axios拦截器已自动解包ResponseHandler格式
    const { accessToken } = response.data;
    
    // 更新Authorization头
    if (accessToken) {
      sessionStorage.setItem('accessToken', accessToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
    }
    
    return accessToken;
  } catch (error) {
    // Refresh token失败，跳转登录页
    logout();
    window.location.href = '/login';
    throw error;
  }
};

/**
 * 登出
 */
export const logout = async () => {
  try {
    await axios.post('/auth/logout');
  } catch (error) {
    console.error('登出请求失败:', error);
  } finally {
    // 清除本地存储
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('accessToken');
    delete axios.defaults.headers.common['Authorization'];
  }
};

/**
 * 检查是否已登录
 * @returns {boolean}
 */
export const isAuthenticated = () => {
  const token = sessionStorage.getItem('accessToken') || localStorage.getItem('token');
  const user = localStorage.getItem('user');
  return !!(token && user);
};

/**
 * 获取当前用户
 * @returns {Object|null}
 */
export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  try {
    return userStr ? JSON.parse(userStr) : null;
  } catch {
    return null;
  }
};

/**
 * 设置请求拦截器 - 自动刷新Token
 */
export const setupInterceptors = () => {
  let isRefreshing = false;
  let failedQueue = [];

  const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
      if (error) {
        prom.reject(error);
      } else {
        prom.resolve(token);
      }
    });
    failedQueue = [];
  };

  // 响应拦截器
  axios.interceptors.response.use(
    response => response,
    async error => {
      const originalRequest = error.config;

      // 如果是401错误且未重试过
      if (error.response?.status === 401 && !originalRequest._retry) {
        if (isRefreshing) {
          // 正在刷新token，将请求加入队列
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then(token => {
              originalRequest.headers['Authorization'] = `Bearer ${token}`;
              return axios(originalRequest);
            })
            .catch(err => {
              return Promise.reject(err);
            });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          // 尝试刷新token
          const newToken = await refreshToken();
          processQueue(null, newToken);
          
          // 重试原始请求
          originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
          return axios(originalRequest);
        } catch (refreshError) {
          processQueue(refreshError, null);
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      return Promise.reject(error);
    }
  );

  // 请求拦截器 - 自动添加token
  axios.interceptors.request.use(
    config => {
      const token = sessionStorage.getItem('accessToken') || localStorage.getItem('token');
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
      return config;
    },
    error => {
      return Promise.reject(error);
    }
  );
};

// 初始化
configureAxios();
setupInterceptors();

export default {
  loginWithCookie,
  refreshToken,
  logout,
  isAuthenticated,
  getCurrentUser,
  configureAxios,
  setupInterceptors
};

