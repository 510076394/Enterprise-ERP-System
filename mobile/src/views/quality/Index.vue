<!--
/**
 * Index.vue - 质量管理
 * @description 质量管理页面 - Glassmorphism 风格
 * @date 2025-12-27
 * @version 2.0.0
 */
-->
<template>
  <div class="quality-page">
    <!-- 背景模糊层 -->
    <div class="bg-overlay"></div>

    <!-- 顶部导航栏 -->
    <header class="page-header">
      <button class="header-btn" @click="goBack">
        <Icon name="chevron-right" size="1.5rem" class-name="rotate-180" />
      </button>
      <h1 class="header-title">质量管理</h1>
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
                d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          </div>
          <div>
            <p class="stat-label">总检验数</p>
            <p class="stat-value">{{ statistics.totalInspections }}</p>
          </div>
        </div>
        <div class="stat-item">
          <div class="stat-icon-wrapper bg-green">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <p class="stat-label">合格数</p>
            <p class="stat-value">{{ statistics.passedInspections }}</p>
          </div>
        </div>
        <div class="stat-item">
          <div class="stat-icon-wrapper bg-red">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <div>
            <p class="stat-label">不合格数</p>
            <p class="stat-value">{{ statistics.failedInspections }}</p>
          </div>
        </div>
        <div class="stat-item">
          <div class="stat-icon-wrapper bg-yellow">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
            </svg>
          </div>
          <div>
            <p class="stat-label">合格率</p>
            <p class="stat-value">{{ statistics.passRate }}%</p>
          </div>
        </div>
      </div>

      <!-- 待处理任务 -->
      <div v-if="pendingTasks.length > 0" class="pending-section">
        <div class="section-header">
          <svg class="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span class="section-title">待处理任务</span>
        </div>
        <div class="task-list">
          <GlassCard
            v-for="task in pendingTasks"
            :key="task.id"
            clickable
            class="task-item"
            @click="handleTask(task)"
          >
            <div class="task-content">
              <div class="task-info">
                <h3 class="task-title">{{ task.title }}</h3>
                <p class="task-desc">{{ task.description }}</p>
              </div>
              <div class="task-meta">
                <span class="task-type" :class="getTaskTypeClass(task.type)">
                  {{ getTaskTypeLabel(task.type) }}
                </span>
                <span class="task-time">{{ formatTime(task.created_at) }}</span>
              </div>
            </div>
          </GlassCard>
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

        <!-- 检验管理 -->
        <div class="module-group">
          <div class="group-header">
            <svg class="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
            <span class="group-title">检验管理</span>
          </div>
          <div class="module-items">
            <GlassListItem
              v-for="item in inspectionModules"
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

        <!-- 模板管理 -->
        <div class="module-group">
          <div class="group-header">
            <svg class="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span class="group-title">模板管理</span>
          </div>
          <div class="module-items">
            <GlassListItem
              v-for="item in templateModules"
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

        <!-- 追溯管理 -->
        <div class="module-group">
          <div class="group-header">
            <svg class="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span class="group-title">追溯管理</span>
          </div>
          <div class="module-items">
            <GlassListItem
              v-for="item in traceabilityModules"
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

        <!-- 报表分析 -->
        <div class="module-group">
          <div class="group-header">
            <svg class="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span class="group-title">报表分析</span>
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
import dayjs from 'dayjs'

const router = useRouter()

// 统计数据
const statistics = ref({
  totalInspections: 0,
  passedInspections: 0,
  failedInspections: 0,
  passRate: 0
})

// 待处理任务
const pendingTasks = ref([])

// 待处理数量
const pendingCounts = ref({
  incoming: 0,
  process: 0,
  final: 0
})

// 快捷操作
const quickActions = ref([
  {
    label: '来料检验',
    path: '/quality/incoming/create',
    icon: 'cube',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  },
  {
    label: '过程检验',
    path: '/quality/process/create',
    icon: 'clipboard-check',
    gradient: 'linear-gradient(135deg, #2CCFB0 0%, #1BA392 100%)'
  },
  {
    label: '成品检验',
    path: '/quality/final/create',
    icon: 'badge-check',
    gradient: 'linear-gradient(135deg, #FF6B6B 0%, #EE5A52 100%)'
  },
  {
    label: '质量追溯',
    path: '/quality/traceability',
    icon: 'search',
    gradient: 'linear-gradient(135deg, #FF9F45 0%, #FF8A3D 100%)'
  }
])

// 检验管理模块
const inspectionModules = ref([
  {
    title: '来料检验',
    desc: '原材料质量检验',
    path: '/quality/incoming',
    icon: 'cube',
    badge: 0
  },
  {
    title: '过程检验',
    desc: '生产过程质量控制',
    path: '/quality/process',
    icon: 'clipboard-check',
    badge: 0
  },
  {
    title: '成品检验',
    desc: '最终产品质量检验',
    path: '/quality/final',
    icon: 'badge-check',
    badge: 0
  }
])

// 模板管理模块
const templateModules = ref([
  {
    title: '检验模板',
    desc: '检验标准与模板',
    path: '/quality/templates',
    icon: 'document-text'
  },
  {
    title: '质量标准',
    desc: '质量标准管理',
    path: '/quality/standards',
    icon: 'badge-check'
  }
])

// 追溯管理模块
const traceabilityModules = ref([
  {
    title: '质量追溯',
    desc: '产品质量追溯查询',
    path: '/quality/traceability',
    icon: 'search'
  },
  {
    title: '不合格品处理',
    desc: '不合格品管理',
    path: '/quality/nonconformance',
    icon: 'cube'
  }
])

// 报表分析模块
const reportModules = ref([
  {
    title: '质量统计',
    desc: '质量数据统计分析',
    path: '/quality/reports/statistics',
    icon: 'document-text'
  },
  {
    title: '质量趋势',
    desc: '质量趋势分析',
    path: '/quality/reports/trends',
    icon: 'document-text'
  },
  {
    title: 'SPC控制图',
    desc: '统计过程控制',
    path: '/quality/reports/spc',
    icon: 'document-text'
  }
])

// 方法
const goBack = () => {
  router.back()
}

const handleAdd = () => {
  router.push('/quality/incoming/create')
}

const navigateTo = (path) => {
  router.push(path)
}

const handleTask = (task) => {
  console.log('处理任务:', task)
}

const getTaskTypeClass = (type) => {
  const classes = {
    incoming: 'type-incoming',
    process: 'type-process',
    final: 'type-final'
  }
  return classes[type] || ''
}

const getTaskTypeLabel = (type) => {
  const labels = {
    incoming: '来料检验',
    process: '过程检验',
    final: '成品检验'
  }
  return labels[type] || type
}

const formatTime = (time) => {
  if (!time) return ''
  return dayjs(time).format('MM-DD HH:mm')
}

// 页面加载时获取数据
onMounted(() => {
  // TODO: 加载真实数据
  statistics.value = {
    totalInspections: 156,
    passedInspections: 142,
    failedInspections: 14,
    passRate: 91.0
  }
})
</script>

<style lang="scss" scoped>
.quality-page {
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

.stat-icon-wrapper.bg-red {
  background: rgba(239, 68, 68, 0.2);
  color: rgb(252, 165, 165);
}

.stat-icon-wrapper.bg-yellow {
  background: rgba(234, 179, 8, 0.2);
  color: rgb(253, 224, 71);
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

/* 待处理任务 */
.pending-section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.section-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: white;
}

.task-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.task-item {
  padding: 1rem !important;
}

.task-content {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.task-info {
  flex: 1;
}

.task-title {
  font-size: 0.875rem;
  font-weight: 700;
  color: white;
  margin-bottom: 0.25rem;
}

.task-desc {
  font-size: 0.75rem;
  color: rgb(148, 163, 184);
}

.task-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.task-type {
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.625rem;
  font-weight: 500;
}

.type-incoming {
  background: rgba(59, 130, 246, 0.2);
  color: rgb(147, 197, 253);
}

.type-process {
  background: rgba(34, 197, 94, 0.2);
  color: rgb(134, 239, 172);
}

.type-final {
  background: rgba(239, 68, 68, 0.2);
  color: rgb(252, 165, 165);
}

.task-time {
  font-size: 0.625rem;
  color: rgb(148, 163, 184);
}

/* 快捷操作 */
.quick-actions-section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
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

.text-yellow-400 {
  color: rgb(251, 191, 36);
}

.text-blue-400 {
  color: rgb(96, 165, 250);
}

.text-green-400 {
  color: rgb(74, 222, 128);
}

.text-red-400 {
  color: rgb(248, 113, 113);
}

/* 工具类 */
.w-4 { width: 1rem; height: 1rem; }
.w-6 { width: 1.5rem; height: 1.5rem; }

.rotate-180 {
  transform: rotate(180deg);
}
</style>

