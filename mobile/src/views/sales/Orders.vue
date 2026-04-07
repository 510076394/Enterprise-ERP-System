<!--
/**
 * Orders.vue - 销售订单
 * @description 销售订单页面 - 使用通用列表组件
 * @date 2025-12-27
 * @version 2.0.0
 */
-->
<template>
  <UniversalListPage
    :config="pageConfig"
    :api-function="loadOrders"
    :show-add="true"
    :show-filter="true"
    list-title="销售订单列表"
    @add="handleAdd"
    @filter="handleFilter"
    @item-click="handleItemClick"
  />
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import UniversalListPage from '@/components/common/UniversalListPage.vue'
import { salesApi } from '@/services/api'
import { showToast } from 'vant'

const router = useRouter()

// 页面配置
const pageConfig = computed(() => ({
  title: '销售订单',
  searchPlaceholder: '搜索订单编号或客户',
  tags: [
    { label: '全部', value: 'all' },
    { label: '待审核', value: 'pending' },
    { label: '已审核', value: 'approved' },
    { label: '已完成', value: 'completed' }
  ],
  stats: [
    { label: '总订单', field: 'total', icon: 'shopping-bag', iconClass: 'bg-blue' },
    { label: '待审核', field: 'pending', icon: 'shopping-bag', iconClass: 'bg-yellow' },
    { label: '已完成', field: 'completed', icon: 'badge-check', iconClass: 'bg-green' }
  ],
  fields: {
    id: 'id',
    title: 'customer_name',
    subtitle: 'order_code',
    emoji: () => '🛍️',
    details: [
      { label: '订单金额', field: 'total_amount', prefix: '¥' },
      { label: '订单日期', field: 'order_date', format: 'date' },
      { label: '交货日期', field: 'delivery_date', format: 'date' }
    ],
    status: {
      field: 'status',
      map: {
        pending: { text: '待审核', class: 'status-pending' },
        approved: { text: '已审核', class: 'status-progress' },
        completed: { text: '已完成', class: 'status-completed' }
      }
    }
  },
  detailRoute: '/sales/orders/:id'
}))

// API 函数
const loadOrders = async (params) => {
  try {
    const response = await salesApi.getSalesOrders(params)
    return response
  } catch (error) {
    console.error('加载销售订单失败:', error)
    throw error
  }
}

// 事件处理
const handleAdd = () => {
  router.push('/sales/orders/create')
}

const handleFilter = () => {
  showToast('筛选功能')
}

const handleItemClick = (item) => {
  console.log('点击订单:', item)
}
</script>

