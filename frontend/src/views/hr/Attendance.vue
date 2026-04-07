<!--
/**
 * Attendance.vue
 * @description 前端界面组件文件
  * @date 2025-08-27
 * @version 1.0.0
 */
-->
<template>
  <div class="attendance-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <h3>考勤管理</h3>
          <el-button type="primary">导入考勤数据</el-button>
        </div>
      </template>
      <div class="content">
        <el-empty description="考勤管理功能正在开发中..." />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { ElMessage } from 'element-plus'

onMounted(() => {
  ElMessage.info('考勤管理模块正在开发中...')
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