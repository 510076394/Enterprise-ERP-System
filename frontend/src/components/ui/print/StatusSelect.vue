<!--
/**
 * StatusSelect.vue
 * @description Vue组件文件
  * @date 2025-08-27
 * @version 1.0.0
 */
-->
<template>
  <el-select 
    :model-value="modelValue" 
    :placeholder="placeholder"
    :style="{ width: width }"
    clearable
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <el-option
      v-for="option in STATUS_OPTIONS"
      :key="option.value"
      :label="option.label"
      :value="option.value"
    />
  </el-select>
</template>

<script setup>
import { STATUS_OPTIONS } from '../../../constants/printConstants';

defineProps({
  modelValue: {
    type: [Number, String],
    default: ''
  },
  placeholder: {
    type: String,
    default: '选择状态'
  },
  width: {
    type: String,
    default: '120px'
  }
});

defineEmits(['update:modelValue']);
</script>
