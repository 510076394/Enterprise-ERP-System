<!--
  GlassButton - 玻璃按钮组件
  @description 统一的玻璃拟态按钮组件
  @date 2025-12-27
  @version 1.0.0
-->

<template>
  <button
    class="glass-button"
    :class="[
      typeClass,
      sizeClass,
      block && 'w-full',
      loading && 'opacity-60 cursor-not-allowed',
      className
    ]"
    :disabled="disabled || loading"
    @click="handleClick"
  >
    <van-loading v-if="loading" size="16" color="currentColor" class="mr-2" />
    <slot name="icon"></slot>
    <span v-if="$slots.default"><slot></slot></span>
  </button>
</template>

<script setup>
import { computed } from 'vue'
import { Loading as VanLoading } from 'vant'

const props = defineProps({
  // 类型: primary | secondary | glass | text
  type: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'secondary', 'glass', 'text'].includes(value)
  },
  // 尺寸: sm | md | lg
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value)
  },
  // 是否禁用
  disabled: {
    type: Boolean,
    default: false
  },
  // 是否加载中
  loading: {
    type: Boolean,
    default: false
  },
  // 是否块级元素
  block: {
    type: Boolean,
    default: false
  },
  // 自定义类名
  className: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['click'])

const typeClass = computed(() => {
  const types = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    glass: 'btn-glass',
    text: 'btn-text'
  }
  return types[props.type]
})

const sizeClass = computed(() => {
  const sizes = {
    sm: 'text-xs px-3 py-2',
    md: 'text-sm px-4 py-3',
    lg: 'text-base px-6 py-4'
  }
  return sizes[props.size]
})

const handleClick = (event) => {
  if (!props.disabled && !props.loading) {
    emit('click', event)
  }
}
</script>

<style scoped>
.glass-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border: none;
  border-radius: 1rem;
  font-weight: 500;
  transition: all 0.2s ease;
  cursor: pointer;
  white-space: nowrap;
}

.glass-button:active:not(:disabled) {
  transform: scale(0.95);
}

.glass-button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

/* 主要按钮 */
.btn-primary {
  background: linear-gradient(135deg, #a855f7, #ec4899);
  color: white;
  box-shadow: 0 0 20px rgba(168, 85, 247, 0.3);
}

/* 次要按钮 */
.btn-secondary {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(16px);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.btn-secondary:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.1);
}

/* 玻璃按钮 */
.btn-glass {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #94a3b8;
}

.btn-glass:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

/* 文字按钮 */
.btn-text {
  background: transparent;
  color: #a855f7;
  padding: 0.5rem 1rem;
}

.btn-text:hover:not(:disabled) {
  background: rgba(168, 85, 247, 0.1);
}
</style>

