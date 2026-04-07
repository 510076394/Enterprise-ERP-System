<!--
/**
 * Index.vue - 采购管理
 * @description 采购管理页面 - Glassmorphism 风格
 * @date 2025-12-27
 * @version 2.0.0
 */
-->
<template>
  <div class="purchase-page">
    <!-- 背景模糊层 -->
    <div class="bg-overlay"></div>

    <!-- 顶部导航栏 -->
    <header class="page-header">
      <button class="header-btn" @click="goBack">
        <Icon name="chevron-right" size="1.5rem" class-name="rotate-180" />
      </button>
      <h1 class="header-title">采购管理</h1>
      <button class="header-btn" @click="handleAdd">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
      </button>
    </header>

    <!-- 主要内容区域 -->
    <div class="page-content">
      <!-- 统计摘要 -->
      <div class="stats-summary">
        <div class="stat-item">
          <div class="stat-icon-wrapper bg-blue">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div>
            <p class="stat-label">采购订单</p>
            <p class="stat-value">{{ statistics.totalOrders }}</p>
          </div>
        </div>
        <div class="stat-item">
          <div class="stat-icon-wrapper bg-green">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p class="stat-label">采购金额</p>
            <p class="stat-value">{{ formatAmount(statistics.totalAmount) }}</p>
          </div>
        </div>
        <div class="stat-item">
          <div class="stat-icon-wrapper bg-yellow">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p class="stat-label">待处理</p>
            <p class="stat-value">{{ statistics.pendingOrders }}</p>
          </div>
        </div>
        <div class="stat-item">
          <div class="stat-icon-wrapper bg-purple">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p class="stat-label">已完成</p>
            <p class="stat-value">{{ statistics.completedOrders }}</p>
          </div>
        </div>
      </div>

      <!-- 快捷操作 -->
      <div class="quick-actions-section">
        <p class="section-title">快捷操作</p>
        <div class="actions-grid">
          <GlassCard
            v-for="action in quickActions"
            :key="action.path"
            clickable
            class="action-card"
            @click="navigateTo(action.path)"
          >
            <div class="action-icon" :style="{ background: action.gradient }">
              <Icon :name="action.icon" size="1.25rem" />
            </div>
            <span class="action-text">{{ action.label }}</span>
          </GlassCard>
        </div>
      </div>

      <!-- 功能模块 -->
      <div class="modules-section">
        <p class="section-title">功能模块</p>

        <!-- 采购申请 -->
        <div class="module-group">
          <div class="group-header">
            <svg class="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span class="group-title">采购申请</span>
          </div>
          <div class="module-items">
            <GlassListItem
              v-for="item in requisitionModules"
              :key="item.path"
              :title="item.title"
              :subtitle="item.desc"
              :icon="item.icon"
              :show-more="false"
              :show-progress="false"
              @click="navigateTo(item.path)"
            >
              <template #actions>
                <span v-if="item.badge > 0" class="badge">{{ item.badge }}</span>
                <Icon name="chevron-right" size="1rem" class-name="text-secondary" />
              </template>
            </GlassListItem>
          </div>
        </div>

        <!-- 采购订单 -->
        <div class="module-group">
          <div class="group-header">
            <svg class="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span class="group-title">采购订单</span>
          </div>
          <div class="module-items">
            <GlassListItem
              v-for="item in orderModules"
              :key="item.path"
              :title="item.title"
              :subtitle="item.desc"
              :icon="item.icon"
              :show-more="false"
              :show-progress="false"
              @click="navigateTo(item.path)"
            >
              <template #actions>
                <span v-if="item.badge > 0" class="badge">{{ item.badge }}</span>
                <Icon name="chevron-right" size="1rem" class-name="text-secondary" />
              </template>
            </GlassListItem>
          </div>
        </div>

        <!-- 采购入库 -->
        <div class="module-group">
          <div class="group-header">
            <svg class="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <span class="group-title">采购入库</span>
          </div>
          <div class="module-items">
            <GlassListItem
              v-for="item in receiptModules"
              :key="item.path"
              :title="item.title"
              :subtitle="item.desc"
              :icon="item.icon"
              :show-more="false"
              :show-progress="false"
              @click="navigateTo(item.path)"
            >
              <template #actions>
                <Icon name="chevron-right" size="1rem" class-name="text-secondary" />
              </template>
            </GlassListItem>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { GlassCard, GlassListItem } from '@/components/glass'
import Icon from '@/components/icons/index.vue'
import { purchaseApi } from '@/services/api'
import { showToast } from 'vant'

const router = useRouter()

// 统计数据
const statistics = ref({
  totalOrders: 0,
  totalAmount: 0,
  pendingOrders: 0,
  completedOrders: 0
})

// 快捷操作
const quickActions = ref([
  {
    label: '新建申请',
    path: '/purchase/requisitions/new',
    icon: 'document-text',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  },
  {
    label: '新建订单',
    path: '/purchase/orders/create',
    icon: 'cart',
    gradient: 'linear-gradient(135deg, #2CCFB0 0%, #1BA392 100%)'
  },
  {
    label: '采购入库',
    path: '/purchase/receipts/create',
    icon: 'cube',
    gradient: 'linear-gradient(135deg, #FF6B6B 0%, #EE5A52 100%)'
  },
  {
    label: '采购概览',
    path: '/purchase/dashboard',
    icon: 'chart-trending-o',
    gradient: 'linear-gradient(135deg, #FF9F45 0%, #FF8A3D 100%)'
  }
])

// 采购申请模块
const requisitionModules = ref([
  {
    title: '采购申请',
    desc: '查看和管理采购申请',
    path: '/purchase/requisitions',
    icon: 'document-text',
    badge: 0
  },
  {
    title: '新建申请',
    desc: '创建新的采购申请',
    path: '/purchase/requisitions/new',
    icon: 'plus'
  }
])

// 采购订单模块
const orderModules = ref([
  {
    title: '采购订单',
    desc: '查看和管理采购订单',
    path: '/purchase/orders',
    icon: 'cart',
    badge: 0
  },
  {
    title: '新建订单',
    desc: '创建新的采购订单',
    path: '/purchase/orders/create',
    icon: 'plus'
  }
])

// 采购入库模块
const receiptModules = ref([
  {
    title: '采购入库',
    desc: '查看和管理采购入库单',
    path: '/purchase/receipts',
    icon: 'cube'
  },
  {
    title: '新建入库单',
    desc: '创建新的采购入库单',
    path: '/purchase/receipts/create',
    icon: 'plus'
  },
  {
    title: '采购退货',
    desc: '采购退货管理',
    path: '/purchase/returns',
    icon: 'revoke'
  }
])

// 方法
const goBack = () => {
  router.back()
}

const handleAdd = () => {
  router.push('/purchase/orders/create')
}

const navigateTo = (path) => {
  // 新建订单和创建入库单功能已完成，允许跳转
  if (path === '/purchase/orders/create' || path === '/purchase/receipts/create') {
    router.push(path)
    return
  }

  // 其他包含 new、dashboard、ai-assistant、processing、returns 的功能还在开发中
  if (path.includes('new') || path.includes('dashboard') || path.includes('ai-assistant') ||
      path.includes('processing') || path.includes('returns')) {
    showToast('功能开发中')
    return
  }

  router.push(path)
}

// 格式化金额
const formatAmount = (amount) => {
  if (!amount) return '0'
  if (amount >= 10000) {
    return (amount / 10000).toFixed(1) + 'w'
  }
  return amount.toString()
}

// 加载统计数据
const loadStatistics = async () => {
  try {
    const response = await purchaseApi.getStatistics()
    if (response.data) {
      statistics.value = response.data

      // 更新待处理订单徽章
      if (response.data.pendingOrders > 0) {
        orderModules.value[0].badge = response.data.pendingOrders
      }
    }
  } catch (error) {
    console.error('加载统计数据失败:', error)
    // 使用模拟数据
    statistics.value = {
      totalOrders: 156,
      totalAmount: 2580000,
      pendingOrders: 23,
      completedOrders: 133
    }
  }
}

// 页面加载时获取数据
onMounted(() => {
  loadStatistics()
})
</script>

<style lang="scss" scoped>
.purchase-page {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  background: var(--bg-primary);
}

/* 背景模糊层 */
.bg-overlay {
  position: absolute;
  inset: 0;
  background: rgba(15, 23, 42, 0.5);
  backdrop-filter: blur(48px);
  -webkit-backdrop-filter: blur(48px);
  z-index: -1;
}

/* 顶部导航栏 */
.page-header {
  padding: 3rem 1.5rem 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
}

.header-btn {
  padding: 0.5rem;
  margin: -0.5rem;
  border-radius: 50%;
  background: none;
  border: none;
  color: rgb(226, 232, 240);
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.header-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.header-btn:active {
  transform: scale(0.95);
}

.header-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: white;
}

/* 主要内容区域 */
.page-content {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.page-content::-webkit-scrollbar {
  display: none;
}

/* 统计摘要 */
.stats-summary {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
}

.stat-item {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 0.75rem;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.stat-icon-wrapper {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-icon-wrapper.bg-blue {
  background: rgba(59, 130, 246, 0.2);
  color: rgb(147, 197, 253);
}

.stat-icon-wrapper.bg-green {
  background: rgba(34, 197, 94, 0.2);
  color: rgb(134, 239, 172);
}

.stat-icon-wrapper.bg-yellow {
  background: rgba(234, 179, 8, 0.2);
  color: rgb(253, 224, 71);
}

.stat-icon-wrapper.bg-purple {
  background: rgba(168, 85, 247, 0.2);
  color: rgb(196, 181, 253);
}

.stat-label {
  font-size: 0.625rem;
  color: rgb(148, 163, 184);
  text-transform: uppercase;
}

.stat-value {
  font-size: 0.875rem;
  font-weight: 700;
  color: white;
}

/* 快捷操作 */
.quick-actions-section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.section-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: white;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
}

.action-card {
  padding: 1rem !important;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

.action-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.action-text {
  font-size: 0.875rem;
  font-weight: 500;
  color: white;
}

/* 功能模块 */
.modules-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.module-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.group-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.group-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: white;
}

.module-items {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.badge {
  padding: 0.125rem 0.5rem;
  border-radius: 9999px;
  background: rgb(239, 68, 68);
  color: white;
  font-size: 0.625rem;
  font-weight: 600;
  min-width: 1.25rem;
  text-align: center;
}

.text-secondary {
  color: rgb(148, 163, 184);
}

.text-blue-400 {
  color: rgb(96, 165, 250);
}

.text-green-400 {
  color: rgb(74, 222, 128);
}

.text-purple-400 {
  color: rgb(192, 132, 252);
}

/* 工具类 */
.w-4 { width: 1rem; height: 1rem; }
.w-6 { width: 1.5rem; height: 1.5rem; }

.rotate-180 {
  transform: rotate(180deg);
}
</style>
