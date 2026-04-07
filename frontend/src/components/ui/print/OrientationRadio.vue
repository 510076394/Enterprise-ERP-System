<!--
/**
 * OrientationRadio.vue
 * @description Vue组件文件
  * @date 2025-08-27
 * @version 1.0.0
 */
-->
<template>
  <el-radio-group
    :model-value="modelValue"
    @update:model-value="handleChange"
  >
    <el-radio-button
      v-for="option in ORIENTATION_OPTIONS"
      :key="option.value"
      :value="option.value"
    >
      {{ option.label }}
    </el-radio-button>
  </el-radio-group>
</template>

<script setup>
import { ORIENTATION_OPTIONS } from '../../../constants/printConstants';

const props = defineProps({
  modelValue: {
    type: String,
    default: 'portrait'
  }
});

const emit = defineEmits(['update:modelValue']);

const handleChange = (value) => {

  emit('update:modelValue', value);
};
</script>
