<!--
/**
 * Plans.vue - 生产计划列表
 * @description 生产计划列表页面 - Glassmorphism 风格
 * @date 2025-12-27
 * @version 2.0.0
 */
-->
<template>
  <UniversalListPage
    :config="pageConfig"
    :api-function="loadPlans"
    @item-click="handleItemClick"
  />
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import UniversalListPage from '@/components/common/UniversalListPage.vue'
import { productionApi } from '@/services/api'

const router = useRouter()

// 页面配置
const pageConfig = computed(() => ({
  title: '生产计划',
  searchPlaceholder: '搜索计划编号或产品名称',
  
  // 筛选标签
  filterTabs: [
    { label: '全部', value: 'all' },
    { label: '待开始', value: 'pending' },
    { label: '进行中', value: 'in_progress' },
    { label: '已完成', value: 'completed' },
    { label: '已取消', value: 'cancelled' }
  ],
  
  // 字段映射
  fields: {
    id: 'id',
    title: 'name',
    subtitle: 'code',
    emoji: () => '📋',
    
    // 详情字段
    details: [
      { label: '产品', field: 'productName' },
      { label: '计划数量', field: 'quantity', suffix: 'unit' },
      { label: '开始时间', field: 'startDate', type: 'date' },
      { label: '结束时间', field: 'endDate', type: 'date' }
    ],
    
    // 标签
    tags: [
      { 
        field: 'status', 
        type: 'status',
        map: {
          'pending': { text: '待开始', color: 'info' },
          'in_progress': { text: '进行中', color: 'warning' },
          'completed': { text: '已完成', color: 'success' },
          'cancelled': { text: '已取消', color: 'default' }
        }
      }
    ],
    
    // 进度条
    progress: {
      field: 'progress',
      label: '完成进度'
    }
  },
  
  // 详情路由
  detailRoute: '/production/plans/:id',
  
  // 右上角按钮
  headerActions: [
    {
      icon: 'plus',
      label: '新建',
      action: 'create'
    }
  ]
}))

// 加载生产计划数据
const loadPlans = async (params) => {
  console.log('🔧 Plans.vue - 调用 productionApi.getProductionPlans，参数:', params)
  
  // 处理状态筛选
  const apiParams = { ...params }
  if (params.status && params.status !== 'all') {
    apiParams.status = params.status
  }
  delete apiParams.status
  
  const response = await productionApi.getProductionPlans(apiParams)
  console.log('🔧 Plans.vue - API 返回:', response)
  
  return response
}

// 处理项目点击
const handleItemClick = (plan) => {
  router.push(`/production/plans/${plan.id}`)
}
</script>

<style lang="scss" scoped>
// 使用 UniversalListPage 的样式，无需额外样式
</style>

