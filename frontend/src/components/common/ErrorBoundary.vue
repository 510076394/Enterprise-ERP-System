<!--
/**
 * ErrorBoundary.vue
 * @description Vue组件文件
 * @date 2025-08-27
 * @version 1.0.0
 */
-->
<template>
  <div v-if="hasError" class="error-boundary">
    <el-alert
      :title="errorTitle"
      :description="errorDescription"
      type="error"
      show-icon
      :closable="false"
    />
    <div class="error-actions">
      <el-button @click="retry" type="primary">重试</el-button>
      <el-button @click="reload" type="default">刷新页面</el-button>
    </div>
  </div>
  <slot v-else />
</template>

<script setup>
import { ref, onErrorCaptured, nextTick } from 'vue'
import { ElMessage } from 'element-plus'

// Props
const props = defineProps({
  fallbackTitle: {
    type: String,
    default: '组件加载失败'
  },
  fallbackDescription: {
    type: String,
    default: '组件在渲染过程中发生了错误，请尝试重新加载。'
  },
  showReload: {
    type: Boolean,
    default: true
  },
  showRetry: {
    type: Boolean,
    default: true
  }
})

// Emits
const emit = defineEmits(['error', 'retry'])

// 响应式数据
const hasError = ref(false)
const errorTitle = ref('')
const errorDescription = ref('')
const errorInfo = ref(null)

// 错误捕获
onErrorCaptured((error, instance, info) => {
  console.error('ErrorBoundary 捕获到错误:', error)
  console.error('错误信息:', info)
  console.error('组件实例:', instance)

  hasError.value = true
  errorTitle.value = props.fallbackTitle
  errorDescription.value = props.fallbackDescription
  errorInfo.value = { error, instance, info }

  // 发送错误事件
  emit('error', { error, instance, info })

  // 显示错误消息
  ElMessage.error('组件加载失败，请检查控制台获取详细信息')

  // 阻止错误继续传播
  return false
})

// 重试方法
const retry = async () => {
  hasError.value = false
  errorTitle.value = ''
  errorDescription.value = ''
  errorInfo.value = null

  // 等待下一个tick，确保DOM更新
  await nextTick()

  // 发送重试事件
  emit('retry')

  ElMessage.info('正在重新加载组件...')
}

// 刷新页面
const reload = () => {
  window.location.reload()
}

// 暴露方法
defineExpose({
  retry,
  reload,
  hasError: () => hasError.value,
  getErrorInfo: () => errorInfo.value
})
</script>

<style scoped>
.error-boundary {
  padding: 20px;
  margin: 20px 0;
  border-radius: 8px;
  background-color: #fef0f0;
  border: 1px solid #fde2e2;
}

.error-actions {
  margin-top: 16px;
  display: flex;
  gap: 12px;
  justify-content: center;
}

.error-actions .el-button {
  min-width: 80px;
}
</style>
