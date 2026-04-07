<!--
/**
 * Status.vue
 * @description 前端界面组件文件
  * @date 2025-08-27
 * @version 1.0.0
 */
-->
<template>
  <div class="equipment-status-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <h3>设备状态</h3>
          <el-button type="primary">刷新状态</el-button>
        </div>
      </template>
      <div class="content">
        <el-empty description="设备状态功能正在开发中..." />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { ElMessage } from 'element-plus'

onMounted(() => {
  ElMessage.info('设备状态模块正在开发中...')
})
</script>

<style scoped>

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.content {
  min-height: 400px;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style> 