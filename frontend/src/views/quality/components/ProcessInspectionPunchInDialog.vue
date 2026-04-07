<!--
/**
 * ProcessInspectionPunchInDialog.vue
 * @description 过程检验打卡弹窗 - 检验员对待检验单打卡签到
 * @workflow 生产开始 → 自动生成检验单 → 检验员选择检验单打卡
 */
-->
<template>
  <el-dialog v-model="dialogVisible" title="检验员打卡" width="800px" destroy-on-close>
    <div class="punch-in-container">
      <!-- 打卡区域 -->
      <el-card class="punch-card" shadow="hover">
        <div class="punch-header">
          <div class="user-info">
            <el-avatar :size="50" :src="currentUser?.avatar">
              {{ currentUser?.real_name?.charAt(0) || currentUser?.username?.charAt(0) || 'U' }}
            </el-avatar>
            <div class="user-details">
              <div class="user-name">{{ currentUser?.real_name || currentUser?.username }}</div>
              <div class="user-role">检验员</div>
            </div>
          </div>
          <div class="current-time">
            <div class="time">{{ currentTimeDisplay }}</div>
            <div class="date">{{ currentDateDisplay }}</div>
          </div>
        </div>
      </el-card>

      <!-- 待检验记录列表 -->
      <el-card class="records-card" shadow="never">
        <template #header>
          <div class="records-header">
            <span>待检验记录</span>
            <el-button size="small" @click="fetchPendingInspections">
              <el-icon><Refresh /></el-icon>刷新
            </el-button>
          </div>
        </template>
        
        <el-table 
          :data="pendingInspections" 
          v-loading="loadingInspections"
          @row-click="handleRowClick"
          highlight-current-row
          :row-class-name="getRowClassName"
        >
          <el-table-column prop="inspection_no" label="检验单号" min-width="140" />
          <el-table-column prop="production_order_no" label="工单号" min-width="120" />
          <el-table-column prop="process_name" label="工序" min-width="100" />
          <el-table-column prop="product_name" label="产品" min-width="140" />
          <el-table-column prop="quantity" label="数量" width="80" />
          <el-table-column label="操作" width="120" fixed="right">
            <template #default="{ row }">
              <el-button 
                type="primary" 
                size="small"
                :loading="punchingId === row.id"
                @click.stop="handlePunchIn(row)"
              >
                <el-icon><Check /></el-icon>打卡
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <el-empty 
          v-if="!loadingInspections && pendingInspections.length === 0" 
          description="暂无待检验记录" 
          :image-size="80"
        >
          <template #description>
            <div>暂无待检验记录</div>
            <div style="color: #909399; font-size: 12px; margin-top: 8px;">
              生产过程开始后会自动生成检验记录
            </div>
          </template>
        </el-empty>
      </el-card>

      <!-- 今日打卡记录 -->
      <el-card class="today-card" shadow="never">
        <template #header>
          <div class="records-header">
            <span>今日打卡记录</span>
            <el-tag type="success">{{ todayCompleted.length }} 条</el-tag>
          </div>
        </template>
        
        <el-table :data="todayCompleted" size="small" max-height="200" v-loading="loadingCompleted">
          <el-table-column prop="inspection_no" label="检验单号" min-width="140" />
          <el-table-column prop="process_name" label="工序" min-width="80" />
          <el-table-column prop="punch_time" label="打卡时间" width="100">
            <template #default="{ row }">{{ formatTime(row.punch_time) }}</template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="80">
            <template #default="{ row }">
              <el-tag :type="getStatusType(row.status)" size="small">
                {{ getStatusText(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>

    <template #footer>
      <el-button @click="dialogVisible = false">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch, onUnmounted } from 'vue'
import { Check, Refresh } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { qualityApi } from '@/api/quality'
import { useAuthStore } from '@/stores/auth'
import dayjs from 'dayjs'

const props = defineProps({ visible: Boolean })
const emit = defineEmits(['update:visible', 'success'])

const authStore = useAuthStore()
const currentUser = computed(() => authStore.user)

const dialogVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val)
})

// 实时时间
const currentTimeDisplay = ref('')
const currentDateDisplay = ref('')
let timeInterval = null

const updateTime = () => {
  const now = dayjs()
  currentTimeDisplay.value = now.format('HH:mm:ss')
  currentDateDisplay.value = now.format('YYYY年MM月DD日 dddd')
}

// 数据
const loadingInspections = ref(false)
const loadingCompleted = ref(false)
const punchingId = ref(null)
const pendingInspections = ref([])
const todayCompleted = ref([])
const selectedRow = ref(null)

// 获取待检验记录
const fetchPendingInspections = async () => {
  loadingInspections.value = true
  try {
    const res = await qualityApi.getProcessInspections({ 
      status: 'pending',
      pageSize: 100 
    })
    const data = res.data?.data || res.data || {}
    pendingInspections.value = data.list || data.rows || []
  } catch (error) {
    console.error('获取待检验记录失败:', error)
    pendingInspections.value = []
  } finally {
    loadingInspections.value = false
  }
}

// 获取今日打卡记录
const fetchTodayCompleted = async () => {
  loadingCompleted.value = true
  try {
    // 改用打卡记录 API 而非检验单列表
    const res = await qualityApi.getProcessInspectionPunchToday()
    todayCompleted.value = res.data || []
  } catch (error) {
    console.error('获取今日打卡记录失败:', error)
    todayCompleted.value = []
  } finally {
    loadingCompleted.value = false
  }
}

// 选中行
const handleRowClick = (row) => {
  selectedRow.value = row
}

// 行样式
const getRowClassName = ({ row }) => {
  return selectedRow.value?.id === row.id ? 'selected-row' : ''
}

// 打卡 - 记录巡检时间
const handlePunchIn = async (inspection) => {
  punchingId.value = inspection.id
  try {
    // 调用打卡API - 记录检验员已到达并开始检验
    await qualityApi.punchProcessInspection(inspection.id, {
      inspector_id: currentUser.value?.id,
      inspector_name: currentUser.value?.real_name || currentUser.value?.username
      // punch_time removed: backend uses NOW()
    })

    ElMessage.success(`已对检验单 ${inspection.inspection_no} 打卡成功！`)
    
    // 刷新列表
    fetchPendingInspections()
    fetchTodayCompleted()
    
    // 触发成功事件
    emit('success')
  } catch (error) {
    ElMessage.error(error.response?.data?.message || '打卡失败')
  } finally {
    punchingId.value = null
  }
}

// 格式化时间
const formatTime = (time) => {
  return time ? dayjs(time).format('HH:mm') : '-'
}

// 状态
const getStatusType = (status) => {
  const map = { pending: 'info', in_progress: 'warning', passed: 'success', failed: 'danger' }
  return map[status] || 'info'
}

const getStatusText = (status) => {
  const map = { pending: '待检', in_progress: '检验中', passed: '合格', failed: '不合格' }
  return map[status] || status
}

watch(() => props.visible, (val) => {
  if (val) {
    updateTime()
    timeInterval = setInterval(updateTime, 1000)
    fetchPendingInspections()
    fetchTodayCompleted()
  } else {
    if (timeInterval) {
      clearInterval(timeInterval)
      timeInterval = null
    }
  }
})

onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval)
  }
})
</script>

<style scoped>
.punch-in-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.punch-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.punch-card :deep(.el-card__body) {
  padding: 20px 24px;
}

.punch-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-details {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-size: 18px;
  font-weight: 600;
}

.user-role {
  font-size: 12px;
  opacity: 0.85;
}

.current-time {
  text-align: right;
}

.current-time .time {
  font-size: 28px;
  font-weight: bold;
  font-family: 'Courier New', monospace;
}

.current-time .date {
  font-size: 13px;
  opacity: 0.85;
}

.records-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

:deep(.selected-row) {
  background-color: #ecf5ff !important;
}

:deep(.el-table__row) {
  cursor: pointer;
}
</style>
