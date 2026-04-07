<!--
/**
 * GlassListItem.vue - 通用列表项组件
 * @description 提供统一的列表项样式，支持图标、标题、副标题、进度条等
 * @date 2025-12-27
 * @version 1.0.0
 */
-->
<template>
  <div 
    class="glass-list-item"
    :class="{ 
      'has-alert': alert,
      'clickable': clickable
    }"
    @click="handleClick"
  >
    <!-- 头部 -->
    <div class="item-header">
      <div class="item-info">
        <!-- 图标/表情 -->
        <div v-if="icon || emoji" class="item-icon" :style="iconStyle">
          <span v-if="emoji">{{ emoji }}</span>
          <Icon v-else-if="icon" :name="icon" size="1.25rem" />
        </div>
        
        <!-- 标题和副标题 -->
        <div>
          <h3 class="item-title">{{ title }}</h3>
          <p v-if="subtitle" class="item-subtitle">{{ subtitle }}</p>
        </div>
      </div>
      
      <!-- 右侧操作 -->
      <div class="item-actions">
        <slot name="actions">
          <button v-if="showMore" class="more-btn" @click.stop="$emit('more')">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>
        </slot>
      </div>
    </div>

    <!-- 进度条（可选） -->
    <div v-if="showProgress" class="item-progress">
      <div class="progress-info">
        <span class="progress-text">{{ progressText }}</span>
        <span 
          class="progress-status"
          :class="progressStatusClass"
        >
          {{ progressStatus }}
        </span>
      </div>
      <div class="progress-bar">
        <div 
          class="progress-fill"
          :class="progressFillClass"
          :style="{ width: progressValue + '%' }"
        ></div>
      </div>
    </div>

    <!-- 自定义内容插槽 -->
    <slot></slot>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import Icon from '@/components/icons/index.vue'

const props = defineProps({
  // 标题
  title: {
    type: String,
    required: true
  },
  // 副标题
  subtitle: {
    type: String,
    default: ''
  },
  // 图标名称
  icon: {
    type: String,
    default: ''
  },
  // 表情符号
  emoji: {
    type: String,
    default: ''
  },
  // 图标样式
  iconStyle: {
    type: Object,
    default: () => ({})
  },
  // 是否显示更多按钮
  showMore: {
    type: Boolean,
    default: true
  },
  // 是否可点击
  clickable: {
    type: Boolean,
    default: true
  },
  // 是否显示进度条
  showProgress: {
    type: Boolean,
    default: false
  },
  // 进度文本
  progressText: {
    type: String,
    default: ''
  },
  // 进度状态文本
  progressStatus: {
    type: String,
    default: ''
  },
  // 进度值 (0-100)
  progressValue: {
    type: Number,
    default: 0
  },
  // 进度级别 (good/medium/low)
  progressLevel: {
    type: String,
    default: 'good',
    validator: (value) => ['good', 'medium', 'low'].includes(value)
  },
  // 是否显示警告样式
  alert: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['click', 'more'])

const progressStatusClass = computed(() => {
  return `status-${props.progressLevel}`
})

const progressFillClass = computed(() => {
  return `fill-${props.progressLevel}`
})

const handleClick = () => {
  if (props.clickable) {
    emit('click')
  }
}
</script>

<style lang="scss" scoped>
.glass-list-item {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 1rem;
  border-radius: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  transition: all 0.2s ease;
}

.glass-list-item.clickable {
  cursor: pointer;
}

.glass-list-item.clickable:active {
  transform: scale(0.99);
}

.glass-list-item.has-alert {
  border-color: rgba(239, 68, 68, 0.2);
  box-shadow: 0 0 10px rgba(239, 68, 68, 0.1);
}

/* 头部 */
.item-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.item-info {
  display: flex;
  gap: 0.75rem;
  flex: 1;
}

.item-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 0.5rem;
  background: rgba(51, 65, 85, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  flex-shrink: 0;
}

.item-title {
  font-size: 0.875rem;
  font-weight: 700;
  color: white;
}

.item-subtitle {
  font-size: 0.75rem;
  color: rgb(148, 163, 184);
  margin-top: 0.125rem;
}

.item-actions {
  display: flex;
  gap: 0.5rem;
}

.more-btn {
  background: none;
  border: none;
  color: rgb(148, 163, 184);
  cursor: pointer;
  padding: 0;
  transition: color 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.more-btn:hover {
  color: white;
}

/* 进度条 */
.item-progress {
  margin-top: 0.25rem;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  margin-bottom: 0.375rem;
}

.progress-text {
  color: rgb(203, 213, 225);
}

.progress-status {
  font-weight: 500;
}

.status-good {
  color: rgb(74, 222, 128);
}

.status-low {
  color: rgb(248, 113, 113);
}

.status-medium {
  color: rgb(251, 191, 36);
}

.progress-bar {
  width: 100%;
  height: 0.375rem;
  background: rgb(51, 65, 85);
  border-radius: 9999px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 9999px;
  transition: width 0.3s ease;
}

.fill-good {
  background: rgb(34, 197, 94);
}

.fill-low {
  background: rgb(239, 68, 68);
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.fill-medium {
  background: rgb(234, 179, 8);
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* 工具类 */
.w-5 { width: 1.25rem; height: 1.25rem; }
</style>
