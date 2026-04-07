<!--
  GlassInput - 玻璃输入框组件
  @description 统一的玻璃拟态输入框组件
  @date 2025-12-27
  @version 1.0.0
-->

<template>
  <div class="glass-input-wrapper" :class="className">
    <!-- 左侧图标 -->
    <div v-if="$slots['left-icon'] || leftIcon" class="input-icon left">
      <slot name="left-icon">
        <component v-if="leftIcon" :is="leftIcon" class="w-5 h-5" />
      </slot>
    </div>

    <!-- 输入框 -->
    <input
      ref="inputRef"
      class="glass-input"
      :class="[
        ($slots['left-icon'] || leftIcon) && 'pl-10',
        ($slots['right-icon'] || rightIcon || (clearable && modelValue)) && 'pr-10',
        error && 'border-red-500'
      ]"
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :readonly="readonly"
      :maxlength="maxlength"
      @input="handleInput"
      @focus="handleFocus"
      @blur="handleBlur"
      @keyup.enter="handleEnter"
    />

    <!-- 右侧图标 -->
    <div v-if="$slots['right-icon'] || rightIcon" class="input-icon right">
      <slot name="right-icon">
        <component v-if="rightIcon" :is="rightIcon" class="w-5 h-5" />
      </slot>
    </div>

    <!-- 清除按钮 -->
    <button
      v-if="clearable && modelValue && !disabled && !$slots['right-icon'] && !rightIcon"
      class="input-icon right cursor-pointer hover:text-white"
      @click="handleClear"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>

    <!-- 错误提示 -->
    <div v-if="error && errorMessage" class="error-message">
      {{ errorMessage }}
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  // v-model 绑定值
  modelValue: {
    type: [String, Number],
    default: ''
  },
  // 输入框类型
  type: {
    type: String,
    default: 'text'
  },
  // 占位符
  placeholder: {
    type: String,
    default: ''
  },
  // 左侧图标组件
  leftIcon: {
    type: [Object, String],
    default: null
  },
  // 右侧图标组件
  rightIcon: {
    type: [Object, String],
    default: null
  },
  // 是否可清除
  clearable: {
    type: Boolean,
    default: false
  },
  // 是否禁用
  disabled: {
    type: Boolean,
    default: false
  },
  // 是否只读
  readonly: {
    type: Boolean,
    default: false
  },
  // 最大长度
  maxlength: {
    type: [String, Number],
    default: null
  },
  // 是否错误状态
  error: {
    type: Boolean,
    default: false
  },
  // 错误提示信息
  errorMessage: {
    type: String,
    default: ''
  },
  // 自定义类名
  className: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue', 'focus', 'blur', 'enter', 'clear'])

const inputRef = ref(null)

const handleInput = (event) => {
  emit('update:modelValue', event.target.value)
}

const handleFocus = (event) => {
  emit('focus', event)
}

const handleBlur = (event) => {
  emit('blur', event)
}

const handleEnter = (event) => {
  emit('enter', event)
}

const handleClear = () => {
  emit('update:modelValue', '')
  emit('clear')
  inputRef.value?.focus()
}

// 暴露 focus 方法
defineExpose({
  focus: () => inputRef.value?.focus(),
  blur: () => inputRef.value?.blur()
})
</script>

<style scoped>
.glass-input-wrapper {
  position: relative;
  width: 100%;
}

.glass-input {
  width: 100%;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
  padding: 0.75rem 1rem;
  color: white;
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.glass-input:focus {
  outline: none;
  border-color: rgba(168, 85, 247, 0.5);
  box-shadow: 0 0 0 3px rgba(168, 85, 247, 0.1);
  background: rgba(255, 255, 255, 0.08);
}

.glass-input::placeholder {
  color: #94a3b8;
}

.glass-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.input-icon {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.input-icon.left {
  left: 1rem;
}

.input-icon.right {
  right: 1rem;
}

.input-icon.cursor-pointer {
  pointer-events: auto;
}

.error-message {
  margin-top: 0.5rem;
  font-size: 0.75rem;
  color: #ef4444;
}
</style>

