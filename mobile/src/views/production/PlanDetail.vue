<!--
/**
 * PlanDetail.vue - 生产计划详情
 * @description 生产计划详情页面 - Glassmorphism 风格
 * @date 2025-12-27
 * @version 2.0.0
 */
-->
<template>
  <div class="plan-detail">
    <!-- 导航栏 -->
    <div class="nav-bar">
      <button class="back-btn" @click="goBack">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <h1 class="title">计划详情</h1>
      <button class="edit-btn" @click="handleEdit">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      </button>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <van-loading type="spinner" size="24px">加载中...</van-loading>
    </div>

    <!-- 内容区域 -->
    <div v-else-if="plan" class="content">
      <!-- 计划头部信息 -->
      <div class="header-card">
        <div class="plan-icon">📋</div>
        <div class="plan-info">
          <h2 class="plan-name">{{ plan.name }}</h2>
          <p class="plan-code">{{ plan.code }}</p>
        </div>
        <div class="status-badge" :class="getStatusClass(plan.status)">
          {{ getStatusText(plan.status) }}
        </div>
      </div>

      <!-- 进度信息 -->
      <div class="progress-section">
        <div class="progress-header">
          <span class="progress-label">完成进度</span>
          <span class="progress-value">{{ plan.progress || 0 }}%</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: `${plan.progress || 0}%` }"></div>
        </div>
      </div>

      <!-- 基本信息 -->
      <div class="info-section">
        <h3 class="section-title">基本信息</h3>
        <div class="info-grid">
          <div class="info-item">
            <span class="label">计划编号</span>
            <span class="value">{{ plan.code }}</span>
          </div>
          <div class="info-item">
            <span class="label">计划名称</span>
            <span class="value">{{ plan.name }}</span>
          </div>
          <div class="info-item">
            <span class="label">产品名称</span>
            <span class="value">{{ plan.productName || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="label">产品编码</span>
            <span class="value">{{ plan.productCode || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="label">计划数量</span>
            <span class="value highlight">{{ plan.quantity }} {{ plan.unit || '件' }}</span>
          </div>
          <div class="info-item">
            <span class="label">已完成数量</span>
            <span class="value">{{ plan.completedQuantity || 0 }} {{ plan.unit || '件' }}</span>
          </div>
        </div>
      </div>

      <!-- 时间信息 -->
      <div class="info-section">
        <h3 class="section-title">时间信息</h3>
        <div class="info-grid">
          <div class="info-item">
            <span class="label">计划开始</span>
            <span class="value">{{ formatDate(plan.startDate) }}</span>
          </div>
          <div class="info-item">
            <span class="label">计划结束</span>
            <span class="value">{{ formatDate(plan.endDate) }}</span>
          </div>
          <div class="info-item">
            <span class="label">实际开始</span>
            <span class="value">{{ formatDate(plan.actualStartDate) || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="label">实际结束</span>
            <span class="value">{{ formatDate(plan.actualEndDate) || '-' }}</span>
          </div>
        </div>
      </div>

      <!-- 其他信息 -->
      <div class="info-section">
        <h3 class="section-title">其他信息</h3>
        <div class="info-grid">
          <div class="info-item full-width">
            <span class="label">备注</span>
            <span class="value">{{ plan.remark || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="label">创建时间</span>
            <span class="value">{{ formatDate(plan.created_at) }}</span>
          </div>
          <div class="info-item">
            <span class="label">更新时间</span>
            <span class="value">{{ formatDate(plan.updated_at) }}</span>
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="action-buttons">
        <button class="action-btn primary" @click="handleStart" v-if="plan.status === 'pending'">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          开始生产
        </button>
        <button class="action-btn success" @click="handleComplete" v-if="plan.status === 'in_progress'">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          完成计划
        </button>
        <button class="action-btn danger" @click="handleCancel" v-if="plan.status !== 'completed' && plan.status !== 'cancelled'">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          取消计划
        </button>
      </div>
    </div>

    <!-- 错误状态 -->
    <div v-else class="error-container">
      <van-empty description="计划信息不存在" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { productionApi } from '@/services/api'
import { showToast, showConfirmDialog } from 'vant'
import dayjs from 'dayjs'

const router = useRouter()
const route = useRoute()

const loading = ref(false)
const plan = ref(null)

// 加载计划详情
const loadPlanDetail = async () => {
  const planId = route.params.id
  if (!planId) {
    showToast('计划ID不存在')
    router.back()
    return
  }

  loading.value = true
  try {
    const response = await productionApi.getProductionPlan(planId)
    if (response.data) {
      plan.value = response.data
    } else if (response) {
      plan.value = response
    }
  } catch (error) {
    console.error('加载计划详情失败:', error)
    showToast('加载失败，请重试')
  } finally {
    loading.value = false
  }
}

// 格式化日期
const formatDate = (date) => {
  if (!date) return '-'
  return dayjs(date).format('YYYY-MM-DD HH:mm')
}

// 获取状态类名
const getStatusClass = (status) => {
  const statusMap = {
    'pending': 'status-pending',
    'in_progress': 'status-progress',
    'completed': 'status-completed',
    'cancelled': 'status-cancelled'
  }
  return statusMap[status] || 'status-pending'
}

// 获取状态文本
const getStatusText = (status) => {
  const statusMap = {
    'pending': '待开始',
    'in_progress': '进行中',
    'completed': '已完成',
    'cancelled': '已取消'
  }
  return statusMap[status] || status
}

// 返回
const goBack = () => {
  router.back()
}

// 编辑
const handleEdit = () => {
  router.push(`/production/plans/${plan.value.id}/edit`)
}

// 开始生产
const handleStart = async () => {
  try {
    await showConfirmDialog({
      title: '确认开始',
      message: '确定要开始这个生产计划吗？'
    })

    await productionApi.startProductionPlan(plan.value.id)
    showToast('已开始生产')
    loadPlanDetail()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('开始生产失败:', error)
      showToast('操作失败')
    }
  }
}

// 完成计划
const handleComplete = async () => {
  try {
    await showConfirmDialog({
      title: '确认完成',
      message: '确定要完成这个生产计划吗？'
    })

    await productionApi.completeProductionPlan(plan.value.id)
    showToast('计划已完成')
    loadPlanDetail()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('完成计划失败:', error)
      showToast('操作失败')
    }
  }
}

// 取消计划
const handleCancel = async () => {
  try {
    await showConfirmDialog({
      title: '确认取消',
      message: '确定要取消这个生产计划吗？',
      confirmButtonText: '确认取消',
      confirmButtonColor: '#ee0a24'
    })

    await productionApi.cancelProductionPlan(plan.value.id)
    showToast('计划已取消')
    loadPlanDetail()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('取消计划失败:', error)
      showToast('操作失败')
    }
  }
}

// 页面加载时获取数据
onMounted(() => {
  loadPlanDetail()
})
</script>

<style lang="scss" scoped>
.plan-detail {
  min-height: 100vh;
  background: var(--color-bg-primary);
  padding-bottom: 2rem;
}

.nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background: var(--color-glass-light);
  backdrop-filter: blur(var(--effect-blur));
  border-bottom: 1px solid var(--color-border-light);
  position: sticky;
  top: 0;
  z-index: 100;
}

.back-btn,
.edit-btn {
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  color: var(--color-text-primary);
  cursor: pointer;

  svg {
    width: 1.5rem;
    height: 1.5rem;
  }
}

.title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
}

.loading-container,
.error-container {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
}

.content {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.header-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: var(--color-glass-medium);
  backdrop-filter: blur(var(--effect-blur));
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-lg);
  box-shadow: var(--effect-shadow);
}

.plan-icon {
  width: 3.5rem;
  height: 3.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  background: var(--color-gradient-primary);
  border-radius: var(--radius-md);
}

.plan-info {
  flex: 1;
}

.plan-name {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 0.25rem 0;
}

.plan-code {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  margin: 0;
}

.status-badge {
  padding: 0.375rem 0.875rem;
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  font-weight: 600;
}

.status-pending {
  background: rgba(59, 130, 246, 0.2);
  color: rgb(147, 197, 253);
}

.status-progress {
  background: rgba(234, 179, 8, 0.2);
  color: rgb(253, 224, 71);
}

.status-completed {
  background: rgba(34, 197, 94, 0.2);
  color: rgb(134, 239, 172);
}

.status-cancelled {
  background: rgba(148, 163, 184, 0.2);
  color: rgb(203, 213, 225);
}

.progress-section {
  background: var(--color-glass-light);
  backdrop-filter: blur(var(--effect-blur));
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-lg);
  padding: 1.25rem;
  box-shadow: var(--effect-shadow);
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.progress-label {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
}

.progress-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-primary);
}

.progress-bar {
  height: 0.5rem;
  background: var(--color-glass-medium);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--color-gradient-primary);
  border-radius: var(--radius-full);
  transition: width 0.3s ease;
}

.info-section {
  background: var(--color-glass-light);
  backdrop-filter: blur(var(--effect-blur));
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-lg);
  padding: 1.25rem;
  box-shadow: var(--effect-shadow);
}

.section-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text-secondary);
  margin: 0 0 1rem 0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;

  &.full-width {
    grid-column: 1 / -1;
  }
}

.label {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
}

.value {
  font-size: 0.875rem;
  color: var(--color-text-primary);
  font-weight: 500;

  &.highlight {
    color: var(--color-primary);
    font-size: 1rem;
    font-weight: 600;
  }
}

.action-buttons {
  display: flex;
  gap: 0.75rem;
  padding: 0.5rem 0;
}

.action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.875rem 1.5rem;
  border: none;
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  svg {
    width: 1.25rem;
    height: 1.25rem;
  }

  &.primary {
    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
    color: white;
  }

  &.success {
    background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
    color: white;
  }

  &.danger {
    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
    color: white;
  }

  &:active {
    transform: scale(0.95);
  }
}
</style>

