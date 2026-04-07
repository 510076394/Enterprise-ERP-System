<!--
/**
 * DefaultTag.vue
 * @description Vue组件文件
  * @date 2025-08-27
 * @version 1.0.0
 */
-->
<template>
  <el-tag :type="isDefault ? 'success' : 'info'">
    {{ isDefault ? '是' : '否' }}
  </el-tag>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  isDefault: {
    type: [Number, Boolean],
    required: true
  }
});

const isDefault = computed(() => {
  return Number(props.isDefault) === 1;
});
</script>
