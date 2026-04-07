<!--
/**
 * StatusTag.vue
 * @description Vue组件文件
  * @date 2025-08-27
 * @version 1.0.0
 */
-->
<template>
  <el-tag :type="statusConfig.type">
    {{ statusConfig.text }}
  </el-tag>
</template>

<script setup>
import { computed } from 'vue';
import { STATUS_MAP } from '../../../constants/printConstants';

const props = defineProps({
  status: {
    type: [Number, String],
    required: true
  }
});

const statusConfig = computed(() => {
  const numStatus = Number(props.status);
  return STATUS_MAP[numStatus] || { text: '未知', type: 'info' };
});
</script>
