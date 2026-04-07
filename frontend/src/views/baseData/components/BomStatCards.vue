<template>
  <div class="statistics-row">
    <el-card class="stat-card" shadow="hover">
      <div class="stat-value">{{ stats.total || 0 }}</div>
      <div class="stat-label">BOM总数</div>
    </el-card>
    <el-card class="stat-card" shadow="hover">
      <div class="stat-value">{{ stats.active || 0 }}</div>
      <div class="stat-label">已审核</div>
    </el-card>
    <el-card class="stat-card" shadow="hover">
      <div class="stat-value">{{ stats.inactive || 0 }}</div>
      <div class="stat-label">未审核</div>
    </el-card>
    <el-card class="stat-card" shadow="hover">
      <div class="stat-value">{{ stats.detailsCount || 0 }}</div>
      <div class="stat-label">物料明细</div>
    </el-card>
    <el-card class="stat-card" shadow="hover">
      <div class="stat-value">{{ formatCurrency(stats.totalCost || 0) }}</div>
      <div class="stat-label">总成本</div>
    </el-card>
  </div>
</template>

<script setup>
defineProps({
  stats: {
    type: Object,
    default: () => ({
      total: 0,
      active: 0,
      inactive: 0,
      detailsCount: 0,
      totalCost: 0
    })
  }
})

const formatCurrency = (value) => {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY'
  }).format(value)
}
</script>

<style scoped>
.statistics-row {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.stat-card {
  flex: 1;
  text-align: center;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #409EFF;
  margin-bottom: 10px;
}

.stat-label {
  color: #909399;
  font-size: 14px;
}
</style>
