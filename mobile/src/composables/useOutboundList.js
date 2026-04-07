/**
 * useOutboundList.js
 * @description 出库单列表通用逻辑 Composable
 * @author ERP开发团队
 * @date 2025-01-27
 * @version 1.0.0
 */

import { ref, computed } from 'vue';
import { showToast, showConfirmDialog } from 'vant';
import { formatDate as formatDateUtil } from '@/utils/date';

/**
 * 出库单列表通用逻辑
 * @param {Object} options - 配置选项
 * @param {String} options.outboundType - 出库类型 ('inventory' | 'sales')
 * @param {Function} options.fetchListApi - 获取列表的API函数
 * @param {Function} options.deleteOutboundApi - 删除出库单的API函数
 * @param {Array} options.statusTabs - 状态标签配置
 * @returns {Object} 出库单列表相关的状态和方法
 */
export function useOutboundList(options = {}) {
  const {
    outboundType = 'inventory', // 'inventory' | 'sales'
    fetchListApi,
    deleteOutboundApi,
    statusTabs = []
  } = options;

  // ==================== 状态管理 ====================
  const loading = ref(false);
  const refreshing = ref(false);
  const finished = ref(false);
  const outboundList = ref([]);
  const searchValue = ref('');
  const activeTab = ref(0);
  const currentPage = ref(1);
  const pageSize = ref(20);

  // ==================== 计算属性 ====================
  
  /**
   * 当前状态过滤值
   */
  const currentStatus = computed(() => {
    if (activeTab.value === 0 || !statusTabs[activeTab.value]) {
      return '';
    }
    return statusTabs[activeTab.value].value;
  });

  /**
   * 是否有数据
   */
  const hasData = computed(() => {
    return outboundList.value && outboundList.value.length > 0;
  });

  // ==================== 格式化函数 ====================
  
  /**
   * 格式化日期
   */
  const formatDate = (date) => {
    return formatDateUtil(date, 'YYYY-MM-DD');
  };

  /**
   * 格式化金额
   */
  const formatAmount = (amount) => {
    if (amount === null || amount === undefined || isNaN(amount)) {
      return '0.00';
    }
    return Number(amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  /**
   * 获取出库状态文本
   */
  const getOutboundStatusText = (status) => {
    const statusMap = {
      draft: '草稿',
      pending: '待审核',
      approved: '已审核',
      confirmed: '已确认',
      in_progress: '出库中',
      completed: '已完成',
      cancelled: '已取消',
      partial: '部分出库'
    };
    return statusMap[status] || status;
  };

  /**
   * 获取出库状态类型(用于Tag组件)
   */
  const getOutboundStatusType = (status) => {
    const typeMap = {
      draft: 'default',
      pending: 'warning',
      approved: 'primary',
      confirmed: 'primary',
      in_progress: 'warning',
      partial: 'warning',
      completed: 'success',
      cancelled: 'danger'
    };
    return typeMap[status] || 'default';
  };

  /**
   * 获取出库类型文本
   */
  const getOutboundTypeText = (type) => {
    const typeMap = {
      // 库存出库类型
      production: '生产领料',
      sales: '销售出库',
      transfer: '调拨出库',
      scrap: '报废出库',
      return: '退货出库',
      other: '其他出库',
      // 销售出库类型
      normal: '正常出库',
      sample: '样品出库',
      gift: '赠品出库'
    };
    return typeMap[type] || type;
  };

  /**
   * 获取出库类型颜色
   */
  const getOutboundTypeColor = (type) => {
    const colorMap = {
      production: 'primary',
      sales: 'success',
      transfer: 'warning',
      scrap: 'danger',
      return: 'info',
      other: 'default',
      normal: 'success',
      sample: 'warning',
      gift: 'primary'
    };
    return colorMap[type] || 'default';
  };

  // ==================== 业务逻辑 ====================
  
  /**
   * 加载出库单列表
   */
  const loadOutboundList = async (isRefresh = false) => {
    if (!fetchListApi || typeof fetchListApi !== 'function') {
      showToast('未配置数据获取API');
      return;
    }

    if (isRefresh) {
      currentPage.value = 1;
      outboundList.value = [];
      finished.value = false;
    }

    if (finished.value) {
      return;
    }

    loading.value = true;

    try {
      const params = {
        page: currentPage.value,
        pageSize: pageSize.value,
        status: currentStatus.value,
        search: searchValue.value,
        outboundType: outboundType
      };

      const response = await fetchListApi(params);
      
      if (response && response.data) {
        const newData = Array.isArray(response.data.list) 
          ? response.data.list 
          : Array.isArray(response.data) 
            ? response.data 
            : [];

        if (isRefresh) {
          outboundList.value = newData;
        } else {
          outboundList.value = [...outboundList.value, ...newData];
        }

        // 判断是否还有更多数据
        if (newData.length < pageSize.value) {
          finished.value = true;
        } else {
          currentPage.value++;
        }
      } else {
        finished.value = true;
      }
    } catch (error) {
      console.error('[加载出库单列表错误]:', error);
      showToast(error.message || '加载失败');
      finished.value = true;
    } finally {
      loading.value = false;
      refreshing.value = false;
    }
  };

  /**
   * 下拉刷新
   */
  const onRefresh = async () => {
    refreshing.value = true;
    await loadOutboundList(true);
  };

  /**
   * 上拉加载
   */
  const onLoad = async () => {
    await loadOutboundList(false);
  };

  /**
   * 搜索
   */
  const onSearch = async () => {
    await loadOutboundList(true);
  };

  /**
   * 切换标签
   */
  const switchTab = async (index) => {
    if (activeTab.value === index) return;
    activeTab.value = index;
    await loadOutboundList(true);
  };

  /**
   * 删除出库单
   */
  const deleteOutbound = async (outboundId) => {
    if (!deleteOutboundApi || typeof deleteOutboundApi !== 'function') {
      showToast('未配置删除API');
      return;
    }

    try {
      await showConfirmDialog({
        title: '确认删除',
        message: '确定要删除这个出库单吗?'
      });

      const response = await deleteOutboundApi(outboundId);
      
      if (response && response.success) {
        showToast('删除成功');
        await loadOutboundList(true);
      } else {
        showToast(response.message || '删除失败');
      }
    } catch (error) {
      if (error !== 'cancel') {
        console.error('[删除出库单错误]:', error);
        showToast(error.message || '删除失败');
      }
    }
  };

  /**
   * 重置列表
   */
  const resetList = () => {
    searchValue.value = '';
    activeTab.value = 0;
    currentPage.value = 1;
    outboundList.value = [];
    finished.value = false;
  };

  // ==================== 返回 ====================
  return {
    // 状态
    loading,
    refreshing,
    finished,
    outboundList,
    searchValue,
    activeTab,
    currentPage,
    pageSize,
    
    // 计算属性
    currentStatus,
    hasData,
    
    // 格式化函数
    formatDate,
    formatAmount,
    getOutboundStatusText,
    getOutboundStatusType,
    getOutboundTypeText,
    getOutboundTypeColor,
    
    // 业务方法
    loadOutboundList,
    onRefresh,
    onLoad,
    onSearch,
    switchTab,
    deleteOutbound,
    resetList
  };
}

