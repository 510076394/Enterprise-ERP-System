<!--
/**
 * CreateTask.vue - 新建生产任务
 * @description 创建生产任务页面 - Glassmorphism 风格
 * @date 2025-12-29
 * @version 1.0.0
 */
-->
<template>
  <div class="create-task-page">
    <!-- 背景模糊层 -->
    <div class="bg-overlay"></div>

    <!-- 顶部导航栏 -->
    <header class="page-header">
      <button class="header-btn" @click="goBack">
        <Icon name="chevron-right" size="1.5rem" class-name="rotate-180" />
      </button>
      <h1 class="header-title">新建生产任务</h1>
      <button class="header-btn" @click="handleSave">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
      </button>
    </header>

    <!-- 主要内容区域 -->
    <div class="page-content">
      <form @submit.prevent="handleSubmit">
        <!-- 基本信息 -->
        <div class="form-section">
          <h3 class="section-title">基本信息</h3>
          <div class="form-fields">
            <van-field
              v-model="formData.taskCode"
              label="任务编号"
              placeholder="自动生成"
              readonly
              :border="false"
            />
            <van-field
              v-model="formData.planId"
              label="生产计划"
              placeholder="请选择生产计划"
              readonly
              is-link
              @click="showPlanPicker = true"
              :border="false"
            />
            <van-field
              v-model="formData.productName"
              label="产品名称"
              placeholder="请输入产品名称"
              required
              :border="false"
            />
            <van-field
              v-model="formData.quantity"
              type="number"
              label="任务数量"
              placeholder="请输入任务数量"
              required
              :border="false"
            />
            <van-field
              v-model="formData.unit"
              label="单位"
              placeholder="请输入单位"
              :border="false"
            />
          </div>
        </div>

        <!-- 时间信息 -->
        <div class="form-section">
          <h3 class="section-title">时间信息</h3>
          <div class="form-fields">
            <van-field
              v-model="formData.startDate"
              label="开始日期"
              placeholder="请选择开始日期"
              readonly
              is-link
              @click="showStartDatePicker = true"
              :border="false"
            />
            <van-field
              v-model="formData.endDate"
              label="结束日期"
              placeholder="请选择结束日期"
              readonly
              is-link
              @click="showEndDatePicker = true"
              :border="false"
            />
          </div>
        </div>

        <!-- 其他信息 -->
        <div class="form-section">
          <h3 class="section-title">其他信息</h3>
          <div class="form-fields">
            <van-field
              v-model="formData.workshop"
              label="生产车间"
              placeholder="请输入生产车间"
              :border="false"
            />
            <van-field
              v-model="formData.remarks"
              label="备注"
              type="textarea"
              placeholder="请输入备注信息"
              rows="3"
              :border="false"
            />
          </div>
        </div>

        <!-- 提交按钮 -->
        <div class="form-actions">
          <van-button type="primary" block @click="handleSubmit" :loading="submitting">
            创建任务
          </van-button>
        </div>
      </form>
    </div>

    <!-- 日期选择器 -->
    <van-popup v-model:show="showStartDatePicker" position="bottom">
      <van-date-picker
        v-model="startDate"
        title="选择开始日期"
        @confirm="onStartDateConfirm"
        @cancel="showStartDatePicker = false"
      />
    </van-popup>

    <van-popup v-model:show="showEndDatePicker" position="bottom">
      <van-date-picker
        v-model="endDate"
        title="选择结束日期"
        @confirm="onEndDateConfirm"
        @cancel="showEndDatePicker = false"
      />
    </van-popup>

    <!-- 生产计划选择器 -->
    <van-popup v-model:show="showPlanPicker" position="bottom">
      <van-picker
        :columns="planOptions"
        @confirm="onPlanConfirm"
        @cancel="showPlanPicker = false"
      />
    </van-popup>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import Icon from '@/components/icons/index.vue'
import { showToast, showConfirmDialog } from 'vant'
import dayjs from 'dayjs'

const router = useRouter()

// 表单数据
const formData = ref({
  taskCode: '自动生成',
  planId: '',
  productName: '',
  quantity: '',
  unit: '件',
  startDate: '',
  endDate: '',
  workshop: '',
  remarks: ''
})

// 日期选择器
const showStartDatePicker = ref(false)
const showEndDatePicker = ref(false)
const startDate = ref(new Date())
const endDate = ref(new Date())

// 生产计划选择器
const showPlanPicker = ref(false)
const planOptions = ref([
  { text: '计划001 - 产品A生产', value: '1' },
  { text: '计划002 - 产品B生产', value: '2' },
  { text: '计划003 - 产品C生产', value: '3' }
])

// 提交状态
const submitting = ref(false)

// 方法
const goBack = () => {
  showConfirmDialog({
    title: '提示',
    message: '确定要放弃创建吗？',
  }).then(() => {
    router.back()
  }).catch(() => {
    // 取消
  })
}

const onStartDateConfirm = (value) => {
  formData.value.startDate = dayjs(value).format('YYYY-MM-DD')
  showStartDatePicker.value = false
}

const onEndDateConfirm = (value) => {
  formData.value.endDate = dayjs(value).format('YYYY-MM-DD')
  showEndDatePicker.value = false
}

const onPlanConfirm = (value) => {
  formData.value.planId = value.selectedOptions[0].text
  showPlanPicker.value = false
}

const handleSave = () => {
  handleSubmit()
}

const handleSubmit = async () => {
  // 验证表单
  if (!formData.value.productName) {
    showToast('请输入产品名称')
    return
  }
  if (!formData.value.quantity) {
    showToast('请输入任务数量')
    return
  }

  submitting.value = true

  try {
    // TODO: 调用API创建任务
    await new Promise(resolve => setTimeout(resolve, 1000))

    showToast({
      type: 'success',
      message: '创建成功'
    })

    setTimeout(() => {
      router.back()
    }, 500)
  } catch (error) {
    showToast({
      type: 'fail',
      message: error.message || '创建失败'
    })
  } finally {
    submitting.value = false
  }
}
</script>

<style lang="scss" scoped>
.create-task-page {
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

.form-fields {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.75rem;
  overflow: hidden;
}

.form-fields :deep(.van-cell) {
  background: transparent;
  color: white;
}

.form-fields :deep(.van-field__label) {
  color: rgb(148, 163, 184);
}

.form-fields :deep(.van-field__control) {
  color: white;
}

.form-fields :deep(.van-field__control::placeholder) {
  color: rgb(100, 116, 139);
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

.w-6 { width: 1.5rem; height: 1.5rem; }

.rotate-180 {
  transform: rotate(180deg);
}
</style>


