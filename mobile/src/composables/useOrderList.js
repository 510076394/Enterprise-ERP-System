/**
 * useOrderList.js
 * @description 订单列表通用逻辑 Composable
 * @author ERP开发团队
 * @date 2025-01-27
 * @version 1.0.0
 */

import { ref, computed } from 'vue';
import { showToast, showConfirmDialog } from 'vant';
import { formatDate as formatDateUtil } from '@/utils/date';

/**
 * 订单列表通用逻辑
 * @param {Object} options - 配置选项
 * @param {String} options.orderType - 订单类型 ('purchase' | 'sales')
 * @param {Function} options.fetchListApi - 获取列表的API函数
 * @param {Function} options.deleteOrderApi - 删除订单的API函数
 * @param {Array} options.statusTabs - 状态标签配置
 * @returns {Object} 订单列表相关的状态和方法
 */
export function useOrderList(options = {}) {
  const {
    orderType = 'purchase', // 'purchase' | 'sales'
    fetchListApi,
    deleteOrderApi,
    statusTabs = []
  } = options;

  // ==================== 状态管理 ====================
  const loading = ref(false);
  const refreshing = ref(false);
  const finished = ref(false);
  const orderList = ref([]);
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
   * 实体名称字段 (供应商/客户)
   */
  const entityNameField = computed(() => {
    return orderType === 'purchase' ? 'supplier_name' : 'customer_name';
  });

  /**
   * 是否有数据
   */
  const hasData = computed(() => {
    return orderList.value && orderList.value.length > 0;
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
   * 获取订单状态文本
   */
  const getOrderStatusText = (status) => {
    const statusMap = {
      // 采购订单状态
      draft: '草稿',
      pending: '待审核',
      approved: '已审核',
      partial_received: '部分收货',
      received: '已收货',
      completed: '已完成',
      cancelled: '已取消',
      // 销售订单状态
      confirmed: '已确认',
      in_production: '生产中',
      partial_shipped: '部分发货',
      shipped: '已发货'
    };
    return statusMap[status] || status;
  };

  /**
   * 获取订单状态类型(用于Tag组件)
   */
  const getOrderStatusType = (status) => {
    const typeMap = {
      draft: 'default',
      pending: 'warning',
      approved: 'primary',
      confirmed: 'primary',
      in_production: 'primary',
      partial_received: 'warning',
      partial_shipped: 'warning',
      received: 'success',
      shipped: 'success',
      completed: 'success',
      cancelled: 'danger'
    };
    return typeMap[status] || 'default';
  };

  /**
   * 计算收货/发货百分比
   */
  const getReceivePercent = (order) => {
    if (orderType === 'purchase') {
      // 采购订单 - 收货进度
      if (!order.total_amount || order.total_amount === 0) return 0;
      const percent = (order.received_amount / order.total_amount) * 100;
      return Math.min(Math.round(percent), 100);
    } else {
      // 销售订单 - 发货进度
      if (!order.total_amount || order.total_amount === 0) return 0;
      const percent = (order.shipped_amount / order.total_amount) * 100;
      return Math.min(Math.round(percent), 100);
    }
  };

  // ==================== 业务逻辑 ====================
  
  /**
   * 加载订单列表
   */
  const loadOrderList = async (isRefresh = false) => {
    if (!fetchListApi || typeof fetchListApi !== 'function') {
      showToast('未配置数据获取API');
      return;
    }

    if (isRefresh) {
      currentPage.value = 1;
      orderList.value = [];
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
        search: searchValue.value
      };

      const response = await fetchListApi(params);
      
      if (response && response.data) {
        const newData = Array.isArray(response.data.list) 
          ? response.data.list 
          : Array.isArray(response.data) 
            ? response.data 
            : [];

        if (isRefresh) {
          orderList.value = newData;
        } else {
          orderList.value = [...orderList.value, ...newData];
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
      console.error('[加载订单列表错误]:', error);
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
    await loadOrderList(true);
  };

  /**
   * 上拉加载
   */
  const onLoad = async () => {
    await loadOrderList(false);
  };

  /**
   * 搜索
   */
  const onSearch = async () => {
    await loadOrderList(true);
  };

  /**
   * 切换标签
   */
  const switchTab = async (index) => {
    if (activeTab.value === index) return;
    activeTab.value = index;
    await loadOrderList(true);
  };

  /**
   * 删除订单
   */
  const deleteOrder = async (orderId) => {
    if (!deleteOrderApi || typeof deleteOrderApi !== 'function') {
      showToast('未配置删除API');
      return;
    }

    try {
      await showConfirmDialog({
        title: '确认删除',
        message: '确定要删除这个订单吗?'
      });

      const response = await deleteOrderApi(orderId);
      
      if (response && response.success) {
        showToast('删除成功');
        await loadOrderList(true);
      } else {
        showToast(response.message || '删除失败');
      }
    } catch (error) {
      if (error !== 'cancel') {
        console.error('[删除订单错误]:', error);
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
    orderList.value = [];
    finished.value = false;
  };

  // ==================== 返回 ====================
  return {
    // 状态
    loading,
    refreshing,
    finished,
    orderList,
    searchValue,
    activeTab,
    currentPage,
    pageSize,
    
    // 计算属性
    currentStatus,
    entityNameField,
    hasData,
    
    // 格式化函数
    formatDate,
    formatAmount,
    getOrderStatusText,
    getOrderStatusType,
    getReceivePercent,
    
    // 业务方法
    loadOrderList,
    onRefresh,
    onLoad,
    onSearch,
    switchTab,
    deleteOrder,
    resetList
  };
}

