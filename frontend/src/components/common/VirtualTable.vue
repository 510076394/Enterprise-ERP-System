<!--
/**
 * VirtualTable.vue
 * @description Vue组件文件
  * @date 2025-08-27
 * @version 1.0.0
 */
-->
<template>
  <div class="virtual-table" :style="{ height: containerHeight + 'px' }">
    <!-- 表头 -->
    <div class="virtual-table-header" ref="headerRef">
      <table class="table-header">
        <thead>
          <tr>
            <th v-for="column in columns" :key="column.prop" :style="{ width: column.width + 'px' }">
              {{ column.label }}
            </th>
          </tr>
        </thead>
      </table>
    </div>

    <!-- 虚拟滚动容器 -->
    <div 
      class="virtual-table-body" 
      ref="containerRef"
      @scroll="handleScroll"
      :style="{ height: bodyHeight + 'px' }"
    >
      <!-- 占位元素，用于撑开滚动条 -->
      <div :style="{ height: totalHeight + 'px', position: 'relative' }">
        <!-- 可见区域的数据 -->
        <div 
          class="visible-area"
          :style="{ 
            transform: `translateY(${offsetY}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0
          }"
        >
          <table class="table-body">
            <tbody>
              <tr 
                v-for="(item, index) in visibleData" 
                :key="getRowKey(item, startIndex + index)"
                :class="{ 'row-selected': selectedRows.includes(getRowKey(item, startIndex + index)) }"
                @click="handleRowClick(item, startIndex + index)"
              >
                <td v-for="column in columns" :key="column.prop" :style="{ width: column.width + 'px' }">
                  <slot 
                    v-if="column.slot" 
                    :name="column.slot" 
                    :row="item" 
                    :column="column" 
                    :index="startIndex + index"
                  />
                  <span v-else-if="column.formatter">
                    {{ column.formatter(item, column, item[column.prop], startIndex + index) }}
                  </span>
                  <span v-else>{{ item[column.prop] }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- 加载更多指示器 -->
    <div v-if="loading" class="loading-indicator">
      <el-icon class="is-loading"><Loading /></el-icon>
      <span>加载中...</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { Loading } from '@element-plus/icons-vue'

// Props
const props = defineProps({
  data: { type: Array, required: true },
  columns: { type: Array, required: true },
  itemHeight: { type: Number, default: 40 },
  containerHeight: { type: Number, default: 400 },
  headerHeight: { type: Number, default: 40 },
  bufferSize: { type: Number, default: 5 },
  rowKey: { type: [String, Function], default: 'id' },
  loading: { type: Boolean, default: false },
  loadMore: { type: Function, default: null },
  threshold: { type: Number, default: 100 } // 距离底部多少像素时触发加载更多
})

// Emits
const emit = defineEmits(['row-click', 'selection-change', 'load-more'])

// 响应式数据
const containerRef = ref()
const headerRef = ref()
const scrollTop = ref(0)
const selectedRows = ref([])

// 计算属性
const bodyHeight = computed(() => props.containerHeight - props.headerHeight)

const totalHeight = computed(() => props.data.length * props.itemHeight)

const visibleCount = computed(() => Math.ceil(bodyHeight.value / props.itemHeight) + props.bufferSize * 2)

const startIndex = computed(() => {
  const index = Math.floor(scrollTop.value / props.itemHeight) - props.bufferSize
  return Math.max(0, index)
})

const endIndex = computed(() => {
  const index = startIndex.value + visibleCount.value
  return Math.min(props.data.length, index)
})

const visibleData = computed(() => {
  return props.data.slice(startIndex.value, endIndex.value)
})

const offsetY = computed(() => startIndex.value * props.itemHeight)

// 方法
const getRowKey = (row, index) => {
  if (typeof props.rowKey === 'function') {
    return props.rowKey(row, index)
  }
  return row[props.rowKey] || index
}

const handleScroll = (event) => {
  scrollTop.value = event.target.scrollTop
  
  // 检查是否需要加载更多
  if (props.loadMore && !props.loading) {
    const { scrollTop: top, scrollHeight, clientHeight } = event.target
    if (scrollHeight - top - clientHeight < props.threshold) {
      emit('load-more')
    }
  }
}

const handleRowClick = (row, index) => {
  emit('row-click', row, index)
}

const scrollTo = (index) => {
  if (containerRef.value) {
    const targetScrollTop = index * props.itemHeight
    containerRef.value.scrollTop = targetScrollTop
  }
}

const scrollToTop = () => {
  scrollTo(0)
}

const scrollToBottom = () => {
  scrollTo(props.data.length - 1)
}

// 选择相关方法
const toggleRowSelection = (row, selected) => {
  const key = getRowKey(row)
  const index = selectedRows.value.indexOf(key)
  
  if (selected === undefined) {
    selected = index === -1
  }
  
  if (selected && index === -1) {
    selectedRows.value.push(key)
  } else if (!selected && index !== -1) {
    selectedRows.value.splice(index, 1)
  }
  
  emit('selection-change', selectedRows.value)
}

const clearSelection = () => {
  selectedRows.value = []
  emit('selection-change', [])
}

const toggleAllSelection = () => {
  if (selectedRows.value.length === props.data.length) {
    clearSelection()
  } else {
    selectedRows.value = props.data.map((row, index) => getRowKey(row, index))
    emit('selection-change', selectedRows.value)
  }
}

// 监听数据变化，重置滚动位置
watch(() => props.data.length, () => {
  nextTick(() => {
    if (containerRef.value) {
      containerRef.value.scrollTop = 0
      scrollTop.value = 0
    }
  })
})

// 暴露方法给父组件
defineExpose({
  scrollTo,
  scrollToTop,
  scrollToBottom,
  toggleRowSelection,
  clearSelection,
  toggleAllSelection
})

// 生命周期
onMounted(() => {
  // 初始化时同步表头和表体的滚动
  if (containerRef.value && headerRef.value) {
    const syncScroll = () => {
      if (headerRef.value) {
        headerRef.value.scrollLeft = containerRef.value.scrollLeft
      }
    }
    
    containerRef.value.addEventListener('scroll', syncScroll)
    
    onUnmounted(() => {
      if (containerRef.value) {
        containerRef.value.removeEventListener('scroll', syncScroll)
      }
    })
  }
})
</script>

<style scoped>
.virtual-table {
  border: 1px solid #ebeef5;
  border-radius: 4px;
  overflow: hidden;
}

.virtual-table-header {
  overflow: hidden;
  border-bottom: 1px solid #ebeef5;
}

.virtual-table-body {
  overflow: auto;
  position: relative;
}

.table-header,
.table-body {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}

.table-header th,
.table-body td {
  padding: 8px 12px;
  text-align: left;
  border-right: 1px solid #ebeef5;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.table-header th {
  background-color: #f5f7fa;
  font-weight: 500;
  color: #909399;
}

.table-body tr {
  border-bottom: 1px solid #ebeef5;
}

.table-body tr:hover {
  background-color: #f5f7fa;
}

.table-body tr.row-selected {
  background-color: #ecf5ff;
}

.visible-area {
  will-change: transform;
}

.loading-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  color: #909399;
  font-size: 14px;
}

.loading-indicator .el-icon {
  margin-right: 8px;
}

</style>
