<!--
/**
 * Tasks.vue - 生产任务
 * @description 生产任务页面 - Glassmorphism 风格
 * @date 2025-12-27
 * @version 2.0.0
 */
-->
<template>
  <GlassListPage
    title="生产任务"
    :show-back="true"
    :show-add="true"
    :show-search="true"
    search-placeholder="搜索任务编号或产品名称"
    v-model:search-value="searchValue"
    :show-filter="false"
    :tags="statusTabs"
    v-model:active-tag="activeStatus"
    :stats="statsData"
    @back="goBack"
    @add="createTask"
  >
    <!-- 任务列表 -->
    <div class="task-list">
      <p class="list-title">任务列表</p>
      
      <!-- 列表项 -->
      <div
        v-for="task in filteredTasks"
        :key="task.id"
        class="task-item"
        @click="viewTaskDetail(task.id)"
      >
        <GlassCard clickable>
          <!-- 任务头部 -->
          <div class="task-header">
            <span class="task-code">{{ task.code }}</span>
            <span class="task-status" :class="getStatusClass(task.status)">
              {{ getStatusText(task.status) }}
            </span>
          </div>

          <!-- 任务标题 -->
          <h3 class="task-title">{{ task.productName }}</h3>

          <!-- 任务详情 -->
          <div class="task-details">
            <div class="detail-row">
              <span class="detail-label">任务数量</span>
              <span class="detail-value">{{ task.quantity }} {{ task.unit }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">关联计划</span>
              <span class="detail-value">{{ task.planName || '无' }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">创建时间</span>
              <span class="detail-value">{{ formatDate(task.created_at) }}</span>
            </div>
          </div>

          <!-- 进度条 -->
          <div class="task-progress">
            <div class="progress-info">
              <span class="progress-label">完成进度</span>
              <span class="progress-percent">{{ task.progressPercent }}%</span>
            </div>
            <div class="progress-bar">
              <div 
                class="progress-fill"
                :class="getProgressClass(task.progressPercent)"
                :style="{ width: task.progressPercent + '%' }"
              ></div>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="task-actions">
            <button 
              class="action-btn btn-primary"
              @click.stop="viewTaskDetail(task.id)"
            >
              查看详情
            </button>
            <button 
              v-if="task.status === 'pending'"
              class="action-btn btn-success"
              @click.stop="startTask(task)"
            >
              开始任务
            </button>
            <button 
              v-if="task.status === 'in_progress'"
              class="action-btn btn-warning"
              @click.stop="reportProgress(task)"
            >
              报工
            </button>
          </div>
        </GlassCard>
      </div>
    </div>
  </GlassListPage>

  <!-- 报工弹窗 -->
  <div v-if="showReportDialog" class="report-overlay" @click="showReportDialog = false">
    <div class="report-dialog" @click.stop>
      <div class="dialog-header">
        <h2 class="dialog-title">生产报工</h2>
        <button class="close-btn" @click="showReportDialog = false">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div class="dialog-content">
        <!-- 任务信息 -->
        <div class="task-info-card">
          <div class="info-row">
            <span class="info-label">任务编号</span>
            <span class="info-value">{{ currentTask?.code }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">产品名称</span>
            <span class="info-value">{{ currentTask?.productName }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">计划数量</span>
            <span class="info-value">{{ currentTask?.quantity }} {{ currentTask?.unit }}</span>
          </div>
        </div>

        <!-- 报工表单 -->
        <div class="form-group">
          <label class="form-label">完成数量</label>
          <input 
            v-model="reportForm.completed_quantity"
            type="number"
            class="form-input"
            placeholder="请输入完成数量"
          />
        </div>

        <div class="form-group">
          <label class="form-label">备注</label>
          <textarea 
            v-model="reportForm.remarks"
            class="form-textarea"
            placeholder="请输入备注信息"
            rows="3"
          ></textarea>
        </div>
      </div>

      <div class="dialog-actions">
        <button class="dialog-btn btn-cancel" @click="showReportDialog = false">
          取消
        </button>
        <button class="dialog-btn btn-submit" @click="submitReport">
          提交报工
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { GlassListPage, GlassCard } from '@/components/glass'
import { productionApi } from '@/services/api'
import { showToast } from 'vant'
import dayjs from 'dayjs'

const router = useRouter()

// 搜索和筛选
const searchValue = ref('')
const activeStatus = ref('all')

// 状态标签
const statusTabs = ref([
  { label: '全部', value: 'all' },
  { label: '待开始', value: 'pending' },
  { label: '进行中', value: 'in_progress' },
  { label: '已完成', value: 'completed' },
  { label: '已取消', value: 'cancelled' }
])

// 任务列表
const taskList = ref([])
const loading = ref(false)

// 报工弹窗
const showReportDialog = ref(false)
const currentTask = ref(null)
const reportForm = reactive({
  completed_quantity: '',
  remarks: ''
})

// 统计数据
const statsData = computed(() => {
  const total = taskList.value.length
  const inProgress = taskList.value.filter(t => t.status === 'in_progress').length
  const completed = taskList.value.filter(t => t.status === 'completed').length

  return [
    {
      label: '总任务',
      value: total.toString(),
      icon: 'clipboard-check',
      iconClass: 'bg-blue'
    },
    {
      label: '进行中',
      value: inProgress.toString(),
      icon: 'clipboard-check',
      iconClass: 'bg-yellow'
    },
    {
      label: '已完成',
      value: completed.toString(),
      icon: 'badge-check',
      iconClass: 'bg-green'
    }
  ]
})

// 过滤后的任务列表
const filteredTasks = computed(() => {
  let tasks = taskList.value

  // 按状态筛选
  if (activeStatus.value !== 'all') {
    tasks = tasks.filter(t => t.status === activeStatus.value)
  }

  // 按搜索值筛选
  if (searchValue.value) {
    const search = searchValue.value.toLowerCase()
    tasks = tasks.filter(t =>
      t.code.toLowerCase().includes(search) ||
      t.productName.toLowerCase().includes(search)
    )
  }

  return tasks
})

// 加载任务列表
const loadTaskList = async () => {
  if (loading.value) return

  loading.value = true
  try {
    const params = {
      page: 1,
      pageSize: 100,
      search: searchValue.value || undefined
    }

    const response = await productionApi.getProductionTasks(params)

    console.log('生产任务API响应:', response)

    // 处理响应数据 - 支持多种数据结构
    let tasks = []
    if (response.data && response.data.items) {
      // 格式: { data: { items: [...], total: ... } }
      tasks = response.data.items
    } else if (response.data && Array.isArray(response.data)) {
      // 格式: { data: [...] }
      tasks = response.data
    } else if (response.items && Array.isArray(response.items)) {
      // 格式: { items: [...], total: ... }
      tasks = response.items
    } else if (Array.isArray(response)) {
      // 格式: [...]
      tasks = response
    }

    console.log('解析后的任务列表:', tasks)

    taskList.value = tasks.map(task => ({
      id: task.id,
      code: task.task_code || task.code || `TASK-${task.id}`,
      productName: task.product_name || task.productName || '未知产品',
      quantity: task.planned_quantity || task.quantity || 0,
      unit: task.unit_name || task.unit || '件',
      planName: task.plan_name || task.planName || '',
      specs: task.specs || '',
      status: task.status || 'pending',
      completedQuantity: task.completed_quantity || 0,
      created_at: task.created_at,
      progressPercent: calculateProgress(task)
    }))

    console.log('最终任务列表:', taskList.value)
  } catch (error) {
    console.error('加载任务列表失败:', error)
    showToast('加载失败，请重试')
  } finally {
    loading.value = false
  }
}

// 计算进度百分比
const calculateProgress = (task) => {
  const planned = task.planned_quantity || task.quantity || 0
  const completed = task.completed_quantity || 0
  if (planned === 0) return 0
  return Math.min(Math.round((completed / planned) * 100), 100)
}

// 格式化日期
const formatDate = (date) => {
  if (!date) return ''
  return dayjs(date).format('YYYY-MM-DD HH:mm')
}

// 获取状态样式类
const getStatusClass = (status) => {
  const classes = {
    pending: 'status-pending',
    in_progress: 'status-progress',
    completed: 'status-completed',
    cancelled: 'status-cancelled'
  }
  return classes[status] || ''
}

// 获取状态文本
const getStatusText = (status) => {
  const texts = {
    pending: '待开始',
    in_progress: '进行中',
    completed: '已完成',
    cancelled: '已取消'
  }
  return texts[status] || status
}

// 获取进度条样式类
const getProgressClass = (percent) => {
  if (percent >= 100) return 'progress-completed'
  if (percent >= 50) return 'progress-good'
  if (percent > 0) return 'progress-medium'
  return 'progress-low'
}

// 方法
const goBack = () => {
  router.back()
}

const createTask = () => {
  router.push('/production/tasks/create')
}

const viewTaskDetail = (id) => {
  router.push(`/production/tasks/${id}`)
}

const startTask = async (task) => {
  try {
    await productionApi.startProductionTask(task.id)
    showToast('任务已开始')
    loadTaskList()
  } catch (error) {
    console.error('开始任务失败:', error)
    showToast('操作失败')
  }
}

const reportProgress = (task) => {
  currentTask.value = task
  reportForm.completed_quantity = ''
  reportForm.remarks = ''
  showReportDialog.value = true
}

const submitReport = async () => {
  if (!reportForm.completed_quantity) {
    showToast('请输入完成数量')
    return
  }

  try {
    await productionApi.reportProductionProgress({
      task_id: currentTask.value.id,
      completed_quantity: Number(reportForm.completed_quantity),
      remarks: reportForm.remarks
    })
    showToast('报工成功')
    showReportDialog.value = false
    loadTaskList()
  } catch (error) {
    console.error('报工失败:', error)
    showToast('报工失败')
  }
}

// 页面加载时获取数据
onMounted(() => {
  loadTaskList()
})
</script>

<style lang="scss" scoped>
.task-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.list-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: white;
  margin: 0 0 0.75rem 0;
  padding: 0.5rem 0;
  opacity: 0.9;
}

.task-item {
  margin-bottom: 0.75rem;
}

/* 任务卡片 */
.task-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}

.task-code {
  font-size: 0.75rem;
  font-weight: 600;
  color: rgb(168, 85, 247);
}

.task-status {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.625rem;
  font-weight: 600;
}

.status-pending {
  background: rgba(148, 163, 184, 0.2);
  color: rgb(203, 213, 225);
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
  background: rgba(239, 68, 68, 0.2);
  color: rgb(252, 165, 165);
}

.task-title {
  font-size: 1rem;
  font-weight: 700;
  color: white;
  margin-bottom: 0.75rem;
}

.task-details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.detail-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.detail-label {
  font-size: 0.75rem;
  color: rgb(148, 163, 184);
}

.detail-value {
  font-size: 0.75rem;
  color: white;
  font-weight: 500;
}

/* 进度条 */
.task-progress {
  margin-bottom: 1rem;
}

.progress-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.progress-label {
  font-size: 0.75rem;
  color: rgb(148, 163, 184);
}

.progress-percent {
  font-size: 0.75rem;
  font-weight: 600;
  color: white;
}

.progress-bar {
  height: 0.5rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 9999px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 9999px;
  transition: width 0.3s ease;
}

.progress-low {
  background: linear-gradient(90deg, #ef4444 0%, #dc2626 100%);
}

.progress-medium {
  background: linear-gradient(90deg, #eab308 0%, #ca8a04 100%);
}

.progress-good {
  background: linear-gradient(90deg, #3b82f6 0%, #2563eb 100%);
}

.progress-completed {
  background: linear-gradient(90deg, #22c55e 0%, #16a34a 100%);
}

/* 操作按钮 */
.task-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  flex: 1;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary {
  background: rgba(59, 130, 246, 0.2);
  color: rgb(147, 197, 253);
  border: 1px solid rgba(59, 130, 246, 0.3);
}

.btn-primary:hover {
  background: rgba(59, 130, 246, 0.3);
}

.btn-success {
  background: rgba(34, 197, 94, 0.2);
  color: rgb(134, 239, 172);
  border: 1px solid rgba(34, 197, 94, 0.3);
}

.btn-success:hover {
  background: rgba(34, 197, 94, 0.3);
}

.btn-warning {
  background: rgba(234, 179, 8, 0.2);
  color: rgb(253, 224, 71);
  border: 1px solid rgba(234, 179, 8, 0.3);
}

.btn-warning:hover {
  background: rgba(234, 179, 8, 0.3);
}

.action-btn:active {
  transform: scale(0.95);
}

/* 报工弹窗 */
.report-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  align-items: flex-end;
  z-index: 1000;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.report-dialog {
  width: 100%;
  max-height: 80vh;
  background: rgba(30, 41, 59, 0.95);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1.5rem 1.5rem 0 0;
  display: flex;
  flex-direction: column;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

.dialog-header {
  padding: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.dialog-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: white;
}

.close-btn {
  padding: 0.5rem;
  margin: -0.5rem;
  border-radius: 50%;
  background: none;
  border: none;
  color: rgb(148, 163, 184);
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.w-6 {
  width: 1.5rem;
  height: 1.5rem;
}

.dialog-content {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.dialog-content::-webkit-scrollbar {
  display: none;
}

.task-info-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.75rem;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.info-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.info-label {
  font-size: 0.75rem;
  color: rgb(148, 163, 184);
}

.info-value {
  font-size: 0.875rem;
  font-weight: 600;
  color: white;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: white;
}

.form-input,
.form-textarea {
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  color: white;
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: rgba(168, 85, 247, 0.5);
  background: rgba(255, 255, 255, 0.08);
}

.form-input::placeholder,
.form-textarea::placeholder {
  color: rgb(100, 116, 139);
}

.form-textarea {
  resize: vertical;
  min-height: 5rem;
}

.dialog-actions {
  padding: 1.5rem;
  display: flex;
  gap: 0.75rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.dialog-btn {
  flex: 1;
  padding: 0.75rem 1.5rem;
  border-radius: 0.75rem;
  font-size: 0.875rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-cancel {
  background: rgba(148, 163, 184, 0.2);
  color: rgb(203, 213, 225);
  border: 1px solid rgba(148, 163, 184, 0.3);
}

.btn-cancel:hover {
  background: rgba(148, 163, 184, 0.3);
}

.btn-submit {
  background: linear-gradient(135deg, #a855f7 0%, #ec4899 100%);
  color: white;
}

.btn-submit:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(168, 85, 247, 0.3);
}

.dialog-btn:active {
  transform: scale(0.95);
}
</style>

