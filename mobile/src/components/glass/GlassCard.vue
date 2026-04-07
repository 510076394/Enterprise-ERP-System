<!--
  GlassCard - 玻璃卡片组件
  @description 统一的玻璃拟态卡片组件
  @date 2025-12-27
  @version 1.0.0
-->

<template>
  <div 
    class="glass-card"
    :class="[
      sizeClass,
      clickable && 'cursor-pointer hover-scale',
      glow && 'hover-glow',
      className
    ]"
    @click="handleClick"
  >
    <slot></slot>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  // 尺寸: sm | md | lg
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value)
  },
  // 是否可点击
  clickable: {
    type: Boolean,
    default: false
  },
  // 是否有发光效果
  glow: {
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

const sizeClass = computed(() => {
  const sizes = {
    sm: 'p-3 rounded-lg',
    md: 'p-4 rounded-xl',
    lg: 'p-6 rounded-2xl'
  }
  return sizes[props.size]
})

const handleClick = (event) => {
  if (props.clickable) {
    emit('click', event)
  }
}
</script>

<style scoped>
.glass-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  transition: all 0.2s ease;
}

.glass-card:hover {
  background: rgba(255, 255, 255, 0.08);
}

.cursor-pointer {
  cursor: pointer;
}

.hover-scale:active {
  transform: scale(0.98);
}

.hover-glow:hover {
  box-shadow: 0 0 20px rgba(168, 85, 247, 0.3);
}
</style>

