<!--
/**
 * UniversalListPage.vue - 通用列表页面组件
 * @description 根据配置自动渲染列表页面，支持主题切换
 * @date 2025-12-27
 * @version 1.0.0
 */
-->
<template>
  <GlassListPage
    :title="config.title"
    :show-back="true"
    :show-add="showAdd"
    :show-search="true"
    :search-placeholder="config.searchPlaceholder"
    v-model:search-value="searchValue"
    :show-filter="showFilter"
    :tags="config.tags"
    v-model:active-tag="activeTag"
    :stats="statsData"
    @back="goBack"
    @add="handleAdd"
    @filter="handleFilter"
  >
    <!-- 列表内容 -->
    <div class="universal-list">
      <p class="list-title">{{ listTitle || '列表' }}</p>
      
      <!-- 空状态 -->
      <div v-if="filteredItems.length === 0 && !loading" class="empty-state">
        <svg class="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
        <p class="empty-text">暂无数据</p>
      </div>
      
      <!-- 列表项 -->
      <GlassListItem
        v-for="item in filteredItems"
        :key="item[config.fields.id]"
        :title="getFieldValue(item, config.fields.title)"
        :subtitle="getFieldValue(item, config.fields.subtitle)"
        :emoji="getEmoji(item)"
        :show-progress="!!config.fields.progress"
        :progress-text="getProgressText(item)"
        :progress-status="getProgressStatus(item)"
        :progress-value="getProgressValue(item)"
        :progress-level="getProgressLevel(item)"
        :alert="isAlert(item)"
        @click="handleItemClick(item)"
        @more="handleItemMore(item)"
      >
        <!-- 自定义内容插槽 -->
        <template #default>
          <div v-if="config.fields.details" class="item-details">
            <div 
              v-for="(detail, index) in config.fields.details" 
              :key="index"
              class="detail-row"
            >
              <span class="detail-label">{{ detail.label }}</span>
              <span class="detail-value">
                {{ formatDetailValue(item, detail) }}
              </span>
            </div>
          </div>
        </template>
        
        <!-- 状态标签插槽 -->
        <template #actions v-if="config.fields.status">
          <span 
            class="status-badge"
            :class="getStatusClass(item)"
          >
            {{ getStatusText(item) }}
          </span>
        </template>
      </GlassListItem>
    </div>
  </GlassListPage>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { GlassListPage, GlassListItem } from '@/components/glass'
import { showToast } from 'vant'
import dayjs from 'dayjs'

const props = defineProps({
  config: {
    type: Object,
    required: true
  },
  apiFunction: {
    type: Function,
    required: true
  },
  showAdd: {
    type: Boolean,
    default: true
  },
  showFilter: {
    type: Boolean,
    default: false
  },
  listTitle: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['add', 'filter', 'item-click', 'item-more'])

const router = useRouter()
const searchValue = ref('')
const activeTag = ref('all')
const loading = ref(false)
const items = ref([])
const statistics = ref({})

// 统计数据
const statsData = computed(() => {
  if (!props.config.stats) return []
  
  return props.config.stats.map(stat => ({
    label: stat.label,
    value: (statistics.value[stat.field] || 0).toString() + (stat.suffix || ''),
    icon: stat.icon,
    iconClass: stat.iconClass
  }))
})

// 过滤后的列表
const filteredItems = computed(() => {
  let filtered = items.value
  
  // 按标签筛选
  if (activeTag.value !== 'all') {
    filtered = filtered.filter(item => {
      if (props.config.fields.status) {
        return item[props.config.fields.status.field] === activeTag.value
      }
      return true
    })
  }
  
  // 按搜索值筛选
  if (searchValue.value) {
    const search = searchValue.value.toLowerCase()
    filtered = filtered.filter(item => {
      const title = getFieldValue(item, props.config.fields.title)
      const subtitle = getFieldValue(item, props.config.fields.subtitle)
      return title.toLowerCase().includes(search) || 
             subtitle.toLowerCase().includes(search)
    })
  }
  
  return filtered
})

// 获取字段值
const getFieldValue = (item, field) => {
  if (typeof field === 'function') {
    return field(item)
  }
  return item[field] || ''
}

// 获取表情图标
const getEmoji = (item) => {
  if (typeof props.config.fields.emoji === 'function') {
    return props.config.fields.emoji(item)
  }
  return props.config.fields.emoji || '📦'
}

// 格式化详情值
const formatDetailValue = (item, detail) => {
  let value = item[detail.field] || ''

  // 添加前缀
  if (detail.prefix) {
    value = detail.prefix + value
  }

  // 添加后缀
  if (detail.suffix) {
    if (typeof detail.suffix === 'string' && detail.suffix.startsWith('_')) {
      // 从其他字段获取后缀
      value = value + ' ' + (item[detail.suffix] || '')
    } else {
      value = value + ' ' + detail.suffix
    }
  }

  // 格式化日期
  if (detail.format === 'date' && value) {
    value = dayjs(value).format('YYYY-MM-DD')
  } else if (detail.format === 'datetime' && value) {
    value = dayjs(value).format('YYYY-MM-DD HH:mm')
  }

  return value || '-'
}

// 获取状态类名
const getStatusClass = (item) => {
  if (!props.config.fields.status) return ''

  const status = item[props.config.fields.status.field]
  const statusMap = props.config.fields.status.map

  return statusMap[status]?.class || ''
}

// 获取状态文本
const getStatusText = (item) => {
  if (!props.config.fields.status) return ''

  const status = item[props.config.fields.status.field]
  const statusMap = props.config.fields.status.map

  return statusMap[status]?.text || status
}

// 获取进度文本
const getProgressText = (item) => {
  if (!props.config.fields.progress) return ''

  if (props.config.fields.progress.calculate) {
    const result = props.config.fields.progress.calculate(item)
    return result.text || ''
  }

  const current = item[props.config.fields.progress.field] || 0
  const total = item[props.config.fields.progress.total] || 0

  return `${current} / ${total}`
}

// 获取进度状态
const getProgressStatus = (item) => {
  if (!props.config.fields.progress) return ''

  if (props.config.fields.progress.calculate) {
    const result = props.config.fields.progress.calculate(item)
    return result.text || ''
  }

  return ''
}

// 获取进度值
const getProgressValue = (item) => {
  if (!props.config.fields.progress) return 0

  if (props.config.fields.progress.calculate) {
    const result = props.config.fields.progress.calculate(item)
    return result.percent || 0
  }

  const current = item[props.config.fields.progress.field] || 0
  const total = item[props.config.fields.progress.total] || 1

  return Math.min((current / total) * 100, 100)
}

// 获取进度等级
const getProgressLevel = (item) => {
  if (!props.config.fields.progress) return 'good'

  if (props.config.fields.progress.calculate) {
    const result = props.config.fields.progress.calculate(item)
    return result.level || 'good'
  }

  const percent = getProgressValue(item)
  if (percent >= 100) return 'good'
  if (percent >= 50) return 'medium'
  return 'low'
}

// 是否显示警告
const isAlert = (item) => {
  if (!props.config.fields.progress) return false

  if (props.config.fields.progress.calculate) {
    const result = props.config.fields.progress.calculate(item)
    return result.level === 'low'
  }

  return false
}

// 加载数据
const loadData = async () => {
  if (loading.value) return

  loading.value = true
  try {
    const params = {
      page: 1,
      pageSize: 100,
      search: searchValue.value || undefined
    }

    console.log('📡 UniversalListPage - 调用 API，参数:', params)
    const response = await props.apiFunction(params)
    console.log('📡 UniversalListPage - API 响应:', response)
    console.log('📡 UniversalListPage - response.data:', response.data)

    // 处理响应数据
    let data = []

    // 处理 Axios 响应对象
    let responseData = response
    if (response.data !== undefined) {
      responseData = response.data
      console.log('📦 检测到 Axios 响应，使用 response.data')
    }

    // 解析数据 - 支持多种后端响应格式
    if (responseData.list && Array.isArray(responseData.list)) {
      // 格式: { list: [...], total: ..., page: ... }
      data = responseData.list
      console.log('📦 数据格式: responseData.list，数量:', data.length)
    } else if (responseData.items && Array.isArray(responseData.items)) {
      // 格式: { items: [...], total: ... }
      data = responseData.items
      console.log('📦 数据格式: responseData.items，数量:', data.length)
    } else if (responseData.data && responseData.data.items && Array.isArray(responseData.data.items)) {
      // 格式: { data: { items: [...] } }
      data = responseData.data.items
      console.log('📦 数据格式: responseData.data.items，数量:', data.length)
    } else if (responseData.data && responseData.data.list && Array.isArray(responseData.data.list)) {
      // 格式: { data: { list: [...] } }
      data = responseData.data.list
      console.log('📦 数据格式: responseData.data.list，数量:', data.length)
    } else if (responseData.data && Array.isArray(responseData.data)) {
      // 格式: { data: [...] }
      data = responseData.data
      console.log('📦 数据格式: responseData.data (数组)，数量:', data.length)
    } else if (Array.isArray(responseData)) {
      // 格式: [...]
      data = responseData
      console.log('📦 数据格式: responseData (数组)，数量:', data.length)
    } else {
      console.warn('⚠️ 未识别的数据格式:', responseData)
      console.warn('⚠️ responseData 的键:', Object.keys(responseData))
    }

    console.log('📊 解析后的数据:', data)
    console.log('📊 数据数量:', data.length)

    items.value = data

    // 计算统计数据
    if (props.config.stats) {
      statistics.value = calculateStatistics(data, responseData)
      console.log('📈 统计数据:', statistics.value)
    }
  } catch (error) {
    console.error('❌ 加载数据失败:', error)
    showToast('加载失败，请重试')
  } finally {
    loading.value = false
  }
}

// 计算统计数据
const calculateStatistics = (data, responseData = {}) => {
  const stats = {}

  props.config.stats.forEach(stat => {
    if (stat.field === 'total') {
      // 优先使用后端返回的 total，否则使用数据长度
      stats.total = responseData.total || data.length
    } else if (stat.field === 'totalMaterials') {
      // 物料总数
      stats.totalMaterials = responseData.total || data.length
    } else if (stat.field === 'lowStock') {
      // 低库存数量 - 需要根据实际数据计算
      stats.lowStock = data.filter(item => {
        const qty = item.quantity || 0
        const min = item.min_stock || 0
        return min > 0 && qty <= min
      }).length
    } else if (stat.field === 'inProgress' && props.config.fields.status) {
      stats.inProgress = data.filter(item =>
        item[props.config.fields.status.field] === 'in_progress'
      ).length
    } else if (stat.field === 'completed' && props.config.fields.status) {
      stats.completed = data.filter(item =>
        item[props.config.fields.status.field] === 'completed'
      ).length
    } else if (stat.field === 'pending' && props.config.fields.status) {
      stats.pending = data.filter(item =>
        item[props.config.fields.status.field] === 'pending'
      ).length
    } else if (stat.field === 'active') {
      // 活跃客户/供应商
      stats.active = data.filter(item => item.status === 'active').length
    }
  })

  return stats
}

// 方法
const goBack = () => {
  router.back()
}

const handleAdd = () => {
  emit('add')
}

const handleFilter = () => {
  emit('filter')
}

const handleItemClick = (item) => {
  if (props.config.detailRoute) {
    const route = props.config.detailRoute.replace(':id', item[props.config.fields.id])
    router.push(route)
  }
  emit('item-click', item)
}

const handleItemMore = (item) => {
  emit('item-more', item)
}

// 页面加载时获取数据
onMounted(() => {
  loadData()
})
</script>

<style lang="scss" scoped>
.universal-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.list-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 0.5rem;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
}

.empty-icon {
  width: 4rem;
  height: 4rem;
  color: var(--color-text-tertiary);
  margin-bottom: 1rem;
}

.empty-text {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
}

.item-details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 0.75rem;
}

.detail-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.detail-label {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
}

.detail-value {
  font-size: 0.75rem;
  color: var(--color-text-primary);
  font-weight: 500;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: var(--radius-full);
  font-size: 0.625rem;
  font-weight: 600;
}

.status-pending {
  background: rgba(148, 163, 184, 0.2);
  color: rgb(203, 213, 225);
}

.status-progress {
  background: rgba(234, 179, 8, 0.2);
  color: rgb(253, 224, 71);
}

.status-completed {
  background: rgba(34, 197, 94, 0.2);
  color: rgb(134, 239, 172);
}

.status-cancelled {
  background: rgba(239, 68, 68, 0.2);
  color: rgb(252, 165, 165);
}
</style>
