<!--
/**
 * Home.vue
 * @description 移动端首页 - Glassmorphism 风格
 * @date 2025-12-27
 * @version 2.0.0
 */
-->
<template>
  <div class="home-container">
    <!-- 背景光斑效果 -->
    <div class="bg-blobs">
      <div class="blob blob-purple"></div>
      <div class="blob blob-pink"></div>
      <div class="blob blob-blue"></div>
    </div>

    <!-- 顶部用户信息 -->
    <div class="header-section">
      <div class="user-card glass-panel">
        <div class="user-info" @click="navigateTo('/profile')">
          <div class="avatar">
            <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div class="user-details">
            <div class="user-name">{{ userName }}</div>
            <div class="user-role">{{ userRole }}</div>
          </div>
        </div>
        <div class="header-actions">
          <button class="action-btn" @click="handleNotification">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span v-if="notificationCount" class="badge">{{ notificationCount }}</span>
          </button>
          <button class="action-btn" @click="handleScan">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
          </button>
        </div>
      </div>

      <!-- 搜索框 -->
      <GlassInput 
        v-model="searchValue"
        placeholder="搜索功能、物料、订单..."
        readonly
        @click="handleSearch"
        class="search-box"
      >
        <template #left-icon>
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </template>
      </GlassInput>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <!-- 统计卡片 -->
      <div class="stats-section">
        <h3 class="section-title">数据概览</h3>
        <div class="stats-grid">
          <GlassCard 
            v-for="stat in stats" 
            :key="stat.label"
            clickable
            class="stat-card"
            @click="navigateTo(stat.path)"
          >
            <div class="stat-icon" :style="{ background: stat.gradient }">
              <Icon :name="stat.icon" size="1.5rem" />
            </div>
            <div class="stat-value">{{ stat.value }}</div>
            <div class="stat-label">{{ stat.label }}</div>
          </GlassCard>
        </div>
      </div>

      <!-- 常用功能 -->
      <div class="menu-section">
        <div class="section-header">
          <h3 class="section-title">常用功能</h3>
          <button class="view-all" @click="showAllModules = !showAllModules">
            <span>{{ showAllModules ? '收起' : '全部应用' }}</span>
            <Icon :name="showAllModules ? 'chevron-up' : 'chevron-down'" size="1rem" />
          </button>
        </div>

        <!-- 功能网格 -->
        <div class="menu-grid" :class="{ expanded: showAllModules }">
          <GlassCard 
            v-for="menu in displayedMenus" 
            :key="menu.title"
            clickable
            class="menu-card"
            @click="navigateTo(menu.path)"
          >
            <div class="menu-icon" :style="{ color: menu.color }">
              <Icon :name="menu.icon" size="2rem" />
            </div>
            <div class="menu-title">{{ menu.title }}</div>
          </GlassCard>
        </div>
      </div>

      <!-- 常用功能快捷入口 -->
      <div class="quick-actions">
        <h3 class="section-title">快捷操作</h3>
        <div class="action-list">
          <GlassCard 
            v-for="action in quickActions" 
            :key="action.title"
            clickable
            class="action-item"
            @click="navigateTo(action.path)"
          >
            <div class="action-icon" :style="{ background: action.gradient }">
              <Icon :name="action.icon" size="1.25rem" />
            </div>
            <div class="action-content">
              <div class="action-title">{{ action.title }}</div>
              <div class="action-desc">{{ action.desc }}</div>
            </div>
            <Icon name="chevron-right" size="1.25rem" class-name="text-secondary" />
          </GlassCard>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { GlassCard, GlassInput } from '@/components/glass'
import { useAuthStore } from '../stores/auth'
import { inventoryApi, productionApi, salesApi } from '@/services/api'
import Icon from '@/components/icons/index.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

// 加载状态
const statsLoading = ref(false)

// 用户信息
const userName = computed(() => authStore.user?.realName || authStore.user?.username || '用户')
const userRole = computed(() => authStore.user?.roleName || '管理员')

// 搜索
const searchValue = ref('')

// 通知数量
const notificationCount = ref(5)

// 显示所有模块
const showAllModules = ref(false)

// 统计数据
const stats = ref([
  {
    label: '库存物料',
    value: '--',
    path: '/inventory',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    icon: 'cube'
  },
  {
    label: '生产任务',
    value: '--',
    path: '/production/tasks',
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    icon: 'clipboard-check'
  },
  {
    label: '待处理订单',
    value: '--',
    path: '/sales/orders',
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    icon: 'document-text'
  }
])

// 功能菜单
const allMenus = ref([
  {
    title: '生产管理',
    path: '/production',
    color: '#667eea',
    icon: 'beaker'
  },
  {
    title: '销售管理',
    path: '/sales',
    color: '#f093fb',
    icon: 'shopping-bag'
  },
  {
    title: '采购管理',
    path: '/purchase',
    color: '#4facfe',
    icon: 'shopping-cart'
  },
  {
    title: '库存管理',
    path: '/inventory',
    color: '#43e97b',
    icon: 'cube'
  },
  {
    title: '物料管理',
    path: '/baseData/materials',
    color: '#fa709a',
    icon: 'archive'
  },
  {
    title: '质量管理',
    path: '/quality',
    color: '#30cfd0',
    icon: 'badge-check'
  },
  {
    title: '客户管理',
    path: '/baseData/customers',
    color: '#a8edea',
    icon: 'user-group'
  },
  {
    title: '供应商管理',
    path: '/baseData/suppliers',
    color: '#fbc2eb',
    icon: 'office-building'
  }
])

// 显示的菜单（根据是否展开）
const displayedMenus = computed(() => {
  return showAllModules.value ? allMenus.value : allMenus.value.slice(0, 8)
})

// 快捷操作
const quickActions = ref([
  {
    title: '扫码功能',
    desc: '扫描二维码快速查询',
    path: '/scan',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    icon: 'qrcode'
  },
  {
    title: '库存查询',
    desc: '查看实时库存信息',
    path: '/inventory/stock',
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    icon: 'search'
  },
  {
    title: '生产任务',
    desc: '查看和管理生产任务',
    path: '/production/tasks',
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    icon: 'clipboard-check'
  }
])



// 方法
const navigateTo = (path) => {
  router.push(path)
}

const handleSearch = () => {
  router.push('/search')
}

const handleNotification = () => {
  router.push('/notifications')
}

const handleScan = () => {
  router.push('/scan')
}

/**
 * 加载首页统计数据
 * 并行调用多个后端 API，获取实时统计数据
 */
const loadHomeStats = async () => {
  statsLoading.value = true
  try {
    // 并行调用，不阻塞页面渲染
    const results = await Promise.allSettled([
      inventoryApi.getInventoryStock({ page: 1, pageSize: 1 }),
      productionApi.getDashboardStatistics(),
      salesApi.getSalesOrderStatistics()
    ])

    // 库存物料数量
    if (results[0].status === 'fulfilled') {
      const invData = results[0].value.data
      // 后端返回的可能是 { total, rows } 或 { totalCount } 格式
      const total = invData?.total || invData?.totalCount || invData?.length || 0
      stats.value[0].value = String(total)
    }

    // 生产任务数量
    if (results[1].status === 'fulfilled') {
      const prodData = results[1].value.data
      const taskCount = prodData?.totalTasks || prodData?.inProgressTasks || 0
      stats.value[1].value = String(taskCount)
    }

    // 待处理订单数量
    if (results[2].status === 'fulfilled') {
      const salesData = results[2].value.data
      const orderCount = salesData?.pendingCount || salesData?.total || 0
      stats.value[2].value = String(orderCount)
    }
  } catch (error) {
    console.error('加载首页统计数据失败:', error)
    // 失败时保持 "--" 默认值，不影响页面使用
  } finally {
    statsLoading.value = false
  }
}

onMounted(() => {
  // 获取用户信息 - 只在已登录且有token时才尝试
  if (authStore.isAuthenticated && authStore.token) {
    authStore.fetchUserProfile().catch(() => {
      // 静默失败，错误已在拦截器中处理
      console.log('获取用户信息失败，可能需要重新登录')
    })

    // 加载首页统计数据
    loadHomeStats()
  }
})
</script>

<style lang="scss" scoped>
.home-container {
  min-height: 100vh;
  background: var(--bg-primary);
  position: relative;
  padding-bottom: calc(var(--van-tabbar-height, 50px) + 16px);
}

/* 背景光斑 */
.bg-blobs {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  z-index: 0;
  pointer-events: none;
}

.blob {
  position: absolute;
  width: 18rem;
  height: 18rem;
  border-radius: 50%;
  filter: blur(3rem);
  opacity: 0.2;
  animation: blob 7s infinite;
}

.blob-purple {
  background: linear-gradient(135deg, #a855f7, #ec4899);
  top: -5rem;
  left: -5rem;
}

.blob-pink {
  background: linear-gradient(135deg, #ec4899, #f97316);
  top: 50%;
  right: -5rem;
  animation-delay: 2s;
}

.blob-blue {
  background: linear-gradient(135deg, #6366f1, #a855f7);
  bottom: -5rem;
  left: 50%;
  animation-delay: 4s;
}

@keyframes blob {
  0%, 100% {
    transform: translate(0, 0) scale(1);
  }
  33% {
    transform: translate(30px, -50px) scale(1.1);
  }
  66% {
    transform: translate(-20px, 20px) scale(0.9);
  }
}

/* 头部区域 */
.header-section {
  position: relative;
  z-index: 1;
  padding: 1rem;
}

.user-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  margin-bottom: 1rem;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
}

.avatar {
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  background: linear-gradient(135deg, #a855f7, #ec4899);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 0 20px rgba(168, 85, 247, 0.3);
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.user-name {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
}

.user-role {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.header-actions {
  display: flex;
  gap: 0.75rem;
}

.action-btn {
  position: relative;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn:active {
  transform: scale(0.95);
  background: rgba(255, 255, 255, 0.1);
}

.badge {
  position: absolute;
  top: -4px;
  right: -4px;
  background: #ef4444;
  color: white;
  font-size: 0.625rem;
  padding: 0.125rem 0.375rem;
  border-radius: 0.75rem;
  min-width: 1.25rem;
  text-align: center;
}

.search-box {
  margin-top: 0.5rem;
}

/* 主要内容 */
.main-content {
  position: relative;
  z-index: 1;
  padding: 0 1rem 1rem;
}

.section-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 1rem;
}

/* 统计卡片 */
.stats-section {
  margin-bottom: 2rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
}

.stat-card {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  text-align: center;
}

.stat-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
}

.stat-label {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

/* 功能菜单 */
.menu-section {
  margin-bottom: 2rem;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.view-all {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.875rem;
  color: var(--color-primary);
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: 0.5rem;
  transition: all 0.2s ease;
}

.view-all:active {
  background: rgba(168, 85, 247, 0.1);
}

.menu-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  max-height: 400px;
  overflow: hidden;
  transition: max-height 0.3s ease;
}

.menu-grid.expanded {
  max-height: 1000px;
}

.menu-card {
  padding: 1rem 0.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.menu-icon {
  width: 3rem;
  height: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.menu-title {
  font-size: 0.75rem;
  color: var(--text-primary);
  text-align: center;
}

/* 快捷操作 */
.quick-actions {
  margin-bottom: 1rem;
}

.action-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.action-item {
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.action-icon {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.action-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.action-title {
  font-size: 0.9375rem;
  font-weight: 500;
  color: var(--text-primary);
}

.action-desc {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

/* 工具类 */
.w-4 { width: 1rem; height: 1rem; }
.w-5 { width: 1.25rem; height: 1.25rem; }
.w-6 { width: 1.5rem; height: 1.5rem; }
.w-8 { width: 2rem; height: 2rem; }
.w-10 { width: 2.5rem; height: 2.5rem; }
.h-4 { height: 1rem; }
.h-5 { height: 1.25rem; }
.h-6 { height: 1.5rem; }
.h-8 { height: 2rem; }
.h-10 { height: 2.5rem; }

.text-secondary {
  color: var(--text-secondary);
}
</style>

