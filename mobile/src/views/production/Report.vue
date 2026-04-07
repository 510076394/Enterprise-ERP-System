<!--
/**
 * Report.vue - 生产报工
 * @description 生产报工页面 - Glassmorphism 风格
 * @date 2025-12-29
 * @version 1.0.0
 */
-->
<template>
  <div class="report-page">
    <!-- 背景模糊层 -->
    <div class="bg-overlay"></div>

    <!-- 顶部导航栏 -->
    <header class="page-header">
      <button class="header-btn" @click="goBack">
        <Icon name="chevron-right" size="1.5rem" class-name="rotate-180" />
      </button>
      <h1 class="header-title">生产报工</h1>
      <button class="header-btn" @click="viewHistory">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>
    </header>

    <!-- 主要内容区域 -->
    <div class="page-content">
      <!-- 任务选择 -->
      <div class="form-section">
        <h3 class="section-title">选择任务</h3>
        <div class="task-selector">
          <van-field
            v-model="selectedTaskName"
            label="生产任务"
            placeholder="请选择生产任务"
            readonly
            is-link
            @click="showTaskPicker = true"
            :border="false"
          />
        </div>
      </div>

      <!-- 任务信息 -->
      <div v-if="selectedTask" class="task-info-section">
        <h3 class="section-title">任务信息</h3>
        <div class="info-card">
          <div class="info-row">
            <span class="info-label">任务编号</span>
            <span class="info-value">{{ selectedTask.code }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">产品名称</span>
            <span class="info-value">{{ selectedTask.productName }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">计划数量</span>
            <span class="info-value">{{ selectedTask.quantity }} {{ selectedTask.unit }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">已完成</span>
            <span class="info-value">{{ selectedTask.completedQuantity }} {{ selectedTask.unit }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">剩余数量</span>
            <span class="info-value highlight">{{ selectedTask.remainingQuantity }} {{ selectedTask.unit }}</span>
          </div>
        </div>
      </div>

      <!-- 报工表单 -->
      <div v-if="selectedTask" class="form-section">
        <h3 class="section-title">报工信息</h3>
        <div class="form-fields">
          <van-field
            v-model="reportData.completedQuantity"
            type="number"
            label="完成数量"
            placeholder="请输入完成数量"
            required
            :border="false"
          />
          <van-field
            v-model="reportData.qualifiedQuantity"
            type="number"
            label="合格数量"
            placeholder="请输入合格数量"
            :border="false"
          />
          <van-field
            v-model="reportData.defectiveQuantity"
            type="number"
            label="不良数量"
            placeholder="请输入不良数量"
            :border="false"
          />
          <van-field
            v-model="reportData.workHours"
            type="number"
            label="工时(小时)"
            placeholder="请输入工时"
            :border="false"
          />
          <van-field
            v-model="reportData.operator"
            label="操作人员"
            placeholder="请输入操作人员"
            :border="false"
          />
          <van-field
            v-model="reportData.reportDate"
            label="报工日期"
            placeholder="请选择报工日期"
            readonly
            is-link
            @click="showDatePicker = true"
            :border="false"
          />
          <van-field
            v-model="reportData.remarks"
            label="备注"
            type="textarea"
            placeholder="请输入备注信息"
            rows="3"
            :border="false"
          />
        </div>
      </div>

      <!-- 提交按钮 -->
      <div v-if="selectedTask" class="form-actions">
        <van-button type="primary" block @click="handleSubmit" :loading="submitting">
          提交报工
        </van-button>
      </div>

      <!-- 空状态 -->
      <div v-if="!selectedTask" class="empty-state">
        <svg class="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p class="empty-text">请先选择生产任务</p>
      </div>
    </div>

    <!-- 任务选择器 -->
    <van-popup v-model:show="showTaskPicker" position="bottom">
      <van-picker
        :columns="taskOptions"
        @confirm="onTaskConfirm"
        @cancel="showTaskPicker = false"
      />
    </van-popup>

    <!-- 日期选择器 -->
    <van-popup v-model:show="showDatePicker" position="bottom">
      <van-date-picker
        v-model="reportDate"
        title="选择报工日期"
        @confirm="onDateConfirm"
        @cancel="showDatePicker = false"
      />
    </van-popup>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import Icon from '@/components/icons/index.vue'
import { showToast } from 'vant'
import dayjs from 'dayjs'

const router = useRouter()

// 任务选择器
const showTaskPicker = ref(false)
const selectedTaskId = ref('')
const selectedTaskName = ref('')

// 模拟任务数据
const tasks = ref([
  {
    id: '1',
    code: 'TASK-2025-001',
    productName: '产品A',
    quantity: 1000,
    completedQuantity: 600,
    unit: '件'
  },
  {
    id: '2',
    code: 'TASK-2025-002',
    productName: '产品B',
    quantity: 500,
    completedQuantity: 200,
    unit: '件'
  },
  {
    id: '3',
    code: 'TASK-2025-003',
    productName: '产品C',
    quantity: 800,
    completedQuantity: 400,
    unit: '件'
  }
])

const taskOptions = computed(() => {
  return tasks.value.map(task => ({
    text: `${task.code} - ${task.productName}`,
    value: task.id
  }))
})

const selectedTask = computed(() => {
  if (!selectedTaskId.value) return null
  const task = tasks.value.find(t => t.id === selectedTaskId.value)
  if (task) {
    return {
      ...task,
      remainingQuantity: task.quantity - task.completedQuantity
    }
  }
  return null
})

// 报工数据
const reportData = ref({
  completedQuantity: '',
  qualifiedQuantity: '',
  defectiveQuantity: '',
  workHours: '',
  operator: '',
  reportDate: dayjs().format('YYYY-MM-DD'),
  remarks: ''
})

// 日期选择器
const showDatePicker = ref(false)
const reportDate = ref(new Date())

// 提交状态
const submitting = ref(false)

// 方法
const goBack = () => {
  router.back()
}

const viewHistory = () => {
  router.push('/production/report/history')
}

const onTaskConfirm = (value) => {
  selectedTaskId.value = value.selectedValues[0]
  selectedTaskName.value = value.selectedOptions[0].text
  showTaskPicker.value = false

  // 重置报工数据
  reportData.value = {
    completedQuantity: '',
    qualifiedQuantity: '',
    defectiveQuantity: '',
    workHours: '',
    operator: '',
    reportDate: dayjs().format('YYYY-MM-DD'),
    remarks: ''
  }
}

const onDateConfirm = (value) => {
  reportData.value.reportDate = dayjs(value).format('YYYY-MM-DD')
  showDatePicker.value = false
}

const handleSubmit = async () => {
  // 验证表单
  if (!reportData.value.completedQuantity) {
    showToast('请输入完成数量')
    return
  }

  const completed = Number(reportData.value.completedQuantity)
  if (completed > selectedTask.value.remainingQuantity) {
    showToast('完成数量不能超过剩余数量')
    return
  }

  submitting.value = true

  try {
    // TODO: 调用API提交报工
    await new Promise(resolve => setTimeout(resolve, 1000))

    showToast({
      type: 'success',
      message: '报工成功'
    })

    // 更新任务完成数量
    const task = tasks.value.find(t => t.id === selectedTaskId.value)
    if (task) {
      task.completedQuantity += completed
    }

    // 重置表单
    selectedTaskId.value = ''
    selectedTaskName.value = ''
    reportData.value = {
      completedQuantity: '',
      qualifiedQuantity: '',
      defectiveQuantity: '',
      workHours: '',
      operator: '',
      reportDate: dayjs().format('YYYY-MM-DD'),
      remarks: ''
    }
  } catch (error) {
    showToast({
      type: 'fail',
      message: error.message || '报工失败'
    })
  } finally {
    submitting.value = false
  }
}
</script>

<style lang="scss" scoped>
.report-page {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  background: var(--bg-primary);
}

.bg-overlay {
  position: absolute;
  inset: 0;
  background: rgba(15, 23, 42, 0.5);
  backdrop-filter: blur(48px);
  -webkit-backdrop-filter: blur(48px);
  z-index: -1;
}

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

.header-btn:active {
  transform: scale(0.95);
}

.header-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: white;
}

.page-content {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
}

.page-content::-webkit-scrollbar {
  display: none;
}

.form-section {
  margin-bottom: 1.5rem;
}

.section-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: white;
  margin-bottom: 0.75rem;
}

.task-selector,
.form-fields {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.75rem;
  overflow: hidden;
}

.task-selector :deep(.van-cell),
.form-fields :deep(.van-cell) {
  background: transparent;
  color: white;
}

.task-selector :deep(.van-field__label),
.form-fields :deep(.van-field__label) {
  color: rgb(148, 163, 184);
}

.task-selector :deep(.van-field__control),
.form-fields :deep(.van-field__control) {
  color: white;
}

.task-selector :deep(.van-field__control::placeholder),
.form-fields :deep(.van-field__control::placeholder) {
  color: rgb(100, 116, 139);
}

.task-info-section {
  margin-bottom: 1.5rem;
}

.info-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.75rem;
  padding: 1rem;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.info-row:last-child {
  border-bottom: none;
}

.info-label {
  font-size: 0.875rem;
  color: rgb(148, 163, 184);
}

.info-value {
  font-size: 0.875rem;
  font-weight: 600;
  color: white;
}

.info-value.highlight {
  color: rgb(74, 222, 128);
}

.form-actions {
  margin-top: 2rem;
}

.form-actions :deep(.van-button--primary) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  height: 3rem;
  font-size: 1rem;
  font-weight: 600;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
}

.empty-icon {
  width: 6rem;
  height: 6rem;
  color: rgb(100, 116, 139);
  margin-bottom: 1rem;
}

.empty-text {
  font-size: 0.875rem;
  color: rgb(148, 163, 184);
}

.w-6 { width: 1.5rem; height: 1.5rem; }

.rotate-180 {
  transform: rotate(180deg);
}
</style>


