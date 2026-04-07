<!--
/**
 * Index.vue - 生产管理
 * @description 生产管理页面 - Glassmorphism 风格
 * @date 2025-12-27
 * @version 2.0.0
 */
-->
<template>
  <div class="production-page">
    <!-- 背景模糊层 -->
    <div class="bg-overlay"></div>

    <!-- 顶部导航栏 -->
    <header class="page-header">
      <button class="header-btn" @click="goBack">
        <Icon name="chevron-right" size="1.5rem" class-name="rotate-180" />
      </button>
      <h1 class="header-title">生产管理</h1>
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
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <p class="stat-label">生产计划</p>
            <p class="stat-value">{{ statistics.totalPlans }}</p>
          </div>
        </div>
        <div class="stat-item">
          <div class="stat-icon-wrapper bg-purple">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <div>
            <p class="stat-label">生产任务</p>
            <p class="stat-value">{{ statistics.totalTasks }}</p>
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
            <p class="stat-label">进行中</p>
            <p class="stat-value">{{ statistics.inProgressTasks }}</p>
          </div>
        </div>
        <div class="stat-item">
          <div class="stat-icon-wrapper bg-green">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p class="stat-label">已完成</p>
            <p class="stat-value">{{ statistics.completedTasks }}</p>
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

        <!-- 计划管理 -->
        <div class="module-group">
          <div class="group-header">
            <Icon name="calendar" size="1rem" class-name="text-blue-400" />
            <span class="group-title">计划管理</span>
          </div>
          <div class="module-items">
            <GlassListItem
              v-for="item in planModules"
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

        <!-- 任务管理 -->
        <div class="module-group">
          <div class="group-header">
            <Icon name="clipboard-check" size="1rem" class-name="text-purple-400" />
            <span class="group-title">任务管理</span>
          </div>
          <div class="module-items">
            <GlassListItem
              v-for="item in taskModules"
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

        <!-- 报工管理 -->
        <div class="module-group">
          <div class="group-header">
            <Icon name="document-text" size="1rem" class-name="text-green-400" />
            <span class="group-title">报工管理</span>
          </div>
          <div class="module-items">
            <GlassListItem
              v-for="item in reportModules"
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
import { productionApi } from '@/services/api'

const router = useRouter()

// 统计数据
const statistics = ref({
  totalPlans: 0,
  totalTasks: 0,
  inProgressTasks: 0,
  completedTasks: 0
})

// 快捷操作
const quickActions = ref([
  {
    label: '新建计划',
    path: '/production/plans/create',
    icon: 'calendar',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  },
  {
    label: '新建任务',
    path: '/production/tasks/create',
    icon: 'clipboard-check',
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
  },
  {
    label: '生产报工',
    path: '/production/report',
    icon: 'document-text',
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
  },
  {
    label: '生产看板',
    path: '/production/dashboard',
    icon: 'chart-trending-o',
    gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
  }
])

// 计划管理模块
const planModules = ref([
  {
    title: '生产计划',
    desc: '查看和管理生产计划',
    path: '/production/plans',
    icon: 'calendar',
    badge: 0
  },
  {
    title: '新建计划',
    desc: '创建新的生产计划',
    path: '/production/plans/create',
    icon: 'plus'
  }
])

// 任务管理模块
const taskModules = ref([
  {
    title: '生产任务',
    desc: '查看和管理生产任务',
    path: '/production/tasks',
    icon: 'clipboard-check',
    badge: 0
  },
  {
    title: '新建任务',
    desc: '创建新的生产任务',
    path: '/production/tasks/create',
    icon: 'plus'
  }
])

// 报工管理模块
const reportModules = ref([
  {
    title: '生产报工',
    desc: '生产任务报工记录',
    path: '/production/report',
    icon: 'document-text'
  },
  {
    title: '报工记录',
    desc: '查看历史报工记录',
    path: '/production/report/history',
    icon: 'clock'
  }
])

// 方法
const goBack = () => {
  router.back()
}

const handleAdd = () => {
  router.push('/production/plans/create')
}

const navigateTo = (path) => {
  router.push(path)
}

// 加载统计数据
const loadStatistics = async () => {
  try {
    const response = await productionApi.getProductionStatistics()
    if (response.data) {
      const stats = response.data
      statistics.value.totalPlans = stats.totalPlans || 0
      statistics.value.totalTasks = stats.totalTasks || 0
      statistics.value.inProgressTasks = stats.inProgressTasks || 0
      statistics.value.completedTasks = stats.completedTasks || 0

      // 更新待处理任务徽章
      if (stats.pendingTasks > 0) {
        taskModules.value[0].badge = stats.pendingTasks
      }
    }
  } catch (error) {
    console.error('加载统计数据失败:', error)
    // 使用模拟数据
    statistics.value = {
      totalPlans: 45,
      totalTasks: 128,
      inProgressTasks: 32,
      completedTasks: 96
    }
  }
}

// 页面加载时获取数据
onMounted(() => {
  loadStatistics()
})
</script>

<style lang="scss" scoped>
.production-page {
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

.stat-icon-wrapper.bg-purple {
  background: rgba(168, 85, 247, 0.2);
  color: rgb(196, 181, 253);
}

.stat-icon-wrapper.bg-yellow {
  background: rgba(234, 179, 8, 0.2);
  color: rgb(253, 224, 71);
}

.stat-icon-wrapper.bg-green {
  background: rgba(34, 197, 94, 0.2);
  color: rgb(134, 239, 172);
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

.text-purple-400 {
  color: rgb(192, 132, 252);
}

.text-green-400 {
  color: rgb(74, 222, 128);
}

/* 工具类 */
.w-4 { width: 1rem; height: 1rem; }
.w-6 { width: 1.5rem; height: 1.5rem; }

.rotate-180 {
  transform: rotate(180deg);
}
</style>

