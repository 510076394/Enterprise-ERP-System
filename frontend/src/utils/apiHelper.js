/**
 * API 响应数据辅助工具
 * @description 提供简单的函数来解析后端 ResponseHandler 返回的数据
 * @date 2025-11-26
 */

/**
 * 解析 ResponseHandler 返回的数据
 * 自动处理 { success: true, data: {...} } 格式
 * @param {Object} response - axios 响应对象
 * @returns {*} 实际的数据部分
 */
export const getData = (response) => {
  return response?.data?.data || response?.data || response;
};

/**
 * 解析列表数据
 * @param {Object} response - axios 响应对象
 * @returns {Array} 列表数组
 */
export const getList = (response) => {
  const data = getData(response);
  if (Array.isArray(data)) return data;
  if (data?.list && Array.isArray(data.list)) return data.list;
  if (data?.items && Array.isArray(data.items)) return data.items;
  if (data?.rows && Array.isArray(data.rows)) return data.rows;
  return [];
};

/**
 * 解析总数
 * @param {Object} response - axios 响应对象
 * @returns {number} 总数
 */
export const getTotal = (response) => {
  const data = getData(response);
  return Number(data?.total || data?.totalCount || 0);
};

/**
 * 解析分页数据
 * @param {Object} response - axios 响应对象
 * @returns {Object} { list, total }
 */
export const getPaginated = (response) => {
  return {
    list: getList(response),
    total: getTotal(response)
  };
};

export default {
  getData,
  getList,
  getTotal,
  getPaginated
};

