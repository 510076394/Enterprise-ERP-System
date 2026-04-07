/**
 * API响应适配器
 * @description 统一处理后端API的多种响应格式
 * @author ERP开发团队
 * @date 2025-01-27
 */

/**
 * API响应适配器
 */
const apiAdapter = {
  /**
   * 处理标准响应
   * @param {Object} response - API响应对象
   * @returns {Object} 统一格式的响应 { success, data, message }
   */
  handleResponse(response) {
    // 格式1: { success, data, message }
    if (response.hasOwnProperty('success')) {
      return {
        success: response.success,
        data: response.data,
        message: response.message || ''
      };
    }

    // 格式2: { data: {...} }
    if (response.hasOwnProperty('data')) {
      return {
        success: true,
        data: response.data,
        message: ''
      };
    }

    // 格式3: 直接返回数据
    return {
      success: true,
      data: response,
      message: ''
    };
  },

  /**
   * 处理分页响应
   * @param {Object} response - API响应对象
   * @returns {Object} 统一格式的分页响应
   */
  handlePaginatedResponse(response) {
    const baseResponse = this.handleResponse(response);
    const data = baseResponse.data;

    // 格式1: { data: { list, total, page, pageSize } }
    if (data && typeof data === 'object') {
      if (data.hasOwnProperty('list')) {
        return {
          success: baseResponse.success,
          data: {
            list: data.list || [],
            total: data.total || 0,
            page: data.page || 1,
            pageSize: data.pageSize || 20,
            totalPages: data.totalPages || Math.ceil((data.total || 0) / (data.pageSize || 20))
          },
          message: baseResponse.message
        };
      }

      // 格式2: { data: { items, total } }
      if (data.hasOwnProperty('items')) {
        const page = data.page || 1;
        const pageSize = data.pageSize || data.items.length;
        return {
          success: baseResponse.success,
          data: {
            list: data.items || [],
            total: data.total || 0,
            page,
            pageSize,
            totalPages: Math.ceil((data.total || 0) / pageSize)
          },
          message: baseResponse.message
        };
      }

      // 格式3: { data: { data, total } }
      if (data.hasOwnProperty('data') && Array.isArray(data.data)) {
        const page = data.page || 1;
        const pageSize = data.pageSize || data.data.length;
        return {
          success: baseResponse.success,
          data: {
            list: data.data || [],
            total: data.total || 0,
            page,
            pageSize,
            totalPages: Math.ceil((data.total || 0) / pageSize)
          },
          message: baseResponse.message
        };
      }

      // 格式4: { data: [...] } - 直接是数组
      if (Array.isArray(data)) {
        return {
          success: baseResponse.success,
          data: {
            list: data,
            total: data.length,
            page: 1,
            pageSize: data.length,
            totalPages: 1
          },
          message: baseResponse.message
        };
      }
    }

    // 默认返回空列表
    return {
      success: baseResponse.success,
      data: {
        list: [],
        total: 0,
        page: 1,
        pageSize: 20,
        totalPages: 0
      },
      message: baseResponse.message
    };
  },

  /**
   * 处理列表响应（非分页）
   * @param {Object} response - API响应对象
   * @returns {Object} 统一格式的列表响应
   */
  handleListResponse(response) {
    const baseResponse = this.handleResponse(response);
    const data = baseResponse.data;

    // 格式1: { data: { list } }
    if (data && typeof data === 'object' && data.hasOwnProperty('list')) {
      return {
        success: baseResponse.success,
        data: data.list || [],
        message: baseResponse.message
      };
    }

    // 格式2: { data: { items } }
    if (data && typeof data === 'object' && data.hasOwnProperty('items')) {
      return {
        success: baseResponse.success,
        data: data.items || [],
        message: baseResponse.message
      };
    }

    // 格式3: { data: { data } } - 嵌套data
    if (data && typeof data === 'object' && data.hasOwnProperty('data') && Array.isArray(data.data)) {
      return {
        success: baseResponse.success,
        data: data.data || [],
        message: baseResponse.message
      };
    }

    // 格式4: { data: [...] } - 直接是数组
    if (Array.isArray(data)) {
      return {
        success: baseResponse.success,
        data: data,
        message: baseResponse.message
      };
    }

    // 默认返回空数组
    return {
      success: baseResponse.success,
      data: [],
      message: baseResponse.message
    };
  },

  /**
   * 处理错误响应
   * @param {Error} error - 错误对象
   * @returns {Object} 统一格式的错误响应
   */
  handleError(error) {
    // Axios错误
    if (error.response) {
      const response = error.response.data;
      return {
        success: false,
        data: null,
        message: response.message || error.message || '请求失败',
        errorCode: response.errorCode || 'ERROR',
        statusCode: error.response.status
      };
    }

    // 网络错误
    if (error.request) {
      return {
        success: false,
        data: null,
        message: '网络连接失败',
        errorCode: 'NETWORK_ERROR',
        statusCode: 0
      };
    }

    // 其他错误
    return {
      success: false,
      data: null,
      message: error.message || '未知错误',
      errorCode: 'UNKNOWN_ERROR',
      statusCode: 0
    };
  },

  /**
   * 提取数据（兼容多种格式）
   * @param {Object} response - API响应对象
   * @returns {*} 提取的数据
   */
  extractData(response) {
    const handled = this.handleResponse(response);
    return handled.data;
  },

  /**
   * 提取列表数据（兼容多种格式）
   * @param {Object} response - API响应对象
   * @returns {Array} 提取的列表数据
   */
  extractList(response) {
    const handled = this.handleListResponse(response);
    return handled.data;
  },

  /**
   * 提取分页数据（兼容多种格式）
   * @param {Object} response - API响应对象
   * @returns {Object} 提取的分页数据 { list, total, page, pageSize }
   */
  extractPaginatedData(response) {
    const handled = this.handlePaginatedResponse(response);
    return handled.data;
  }
};

export default apiAdapter;

