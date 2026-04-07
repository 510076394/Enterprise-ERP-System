<!--
/**
 * DataTable.vue
 * @description Vue组件文件
  * @date 2025-08-27
 * @version 1.0.0
 */
-->
<template>
  <div class="data-table-container">
    <!-- 搜索区域 -->
    <el-card v-if="showSearch" class="search-card" shadow="never">
      <el-form :inline="true" class="search-form">
        <slot name="search-form" :searchData="searchData" :handleSearch="handleSearch" :resetSearch="resetSearch">
          <!-- 默认搜索表单 -->
          <el-form-item v-for="field in searchFields" :key="field.prop" :label="field.label">
            <el-input
              v-if="field.type === 'input'"
              v-model="searchData[field.prop]"
              :placeholder="field.placeholder"
              @keyup.enter="handleSearch"
              clearable
            />
            <el-select
              v-else-if="field.type === 'select'"
              v-model="searchData[field.prop]"
              :placeholder="field.placeholder"
              clearable
            >
              <el-option
                v-for="option in field.options"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </el-select>
            <el-date-picker
              v-else-if="field.type === 'daterange'"
              v-model="searchData[field.prop]"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">
              <el-icon><Search /></el-icon> 查询
            </el-button>
            <el-button @click="resetSearch">重置</el-button>
          </el-form-item>
        </slot>
      </el-form>
    </el-card>

    <!-- 操作按钮区域 -->
    <el-card v-if="showActions" class="action-card" shadow="never">
      <slot name="actions" :selectedRows="selectedRows" :handleRefresh="handleRefresh">
        <el-button v-if="showAdd" type="primary" @click="$emit('add')">
          <el-icon><Plus /></el-icon> 新增
        </el-button>
        <el-button v-if="showExport" @click="$emit('export', selectedRows)">
          <el-icon><Download /></el-icon> 导出
        </el-button>
        <el-button @click="handleRefresh">
          <el-icon><Refresh /></el-icon> 刷新
        </el-button>
      </slot>
    </el-card>

    <!-- 数据表格 -->
    <el-card class="table-card" shadow="never">
      <el-table
        ref="tableRef"
        v-loading="loading"
        :data="tableData"
        :height="tableHeight"
        :row-key="rowKey"
        :selection="selection"
        @selection-change="handleSelectionChange"
        @sort-change="handleSortChange"
        @row-click="handleRowClick"
        stripe
        border
      >
        <!-- 选择列 -->
        <el-table-column v-if="selection" type="selection" width="55" />
        
        <!-- 序号列 -->
        <el-table-column v-if="showIndex" type="index" label="序号" width="60" />
        
        <!-- 动态列 -->
        <template v-for="column in columns" :key="column.prop">
          <el-table-column
            :prop="column.prop"
            :label="column.label"
            :width="column.width"
            :min-width="column.minWidth"
            :fixed="column.fixed"
            :sortable="column.sortable"
            :show-overflow-tooltip="column.showOverflowTooltip !== false"
          >
            <template v-if="column.slot" #default="scope">
              <slot :name="column.slot" :row="scope.row" :column="column" :$index="scope.$index" />
            </template>
            <template v-else-if="column.formatter" #default="scope">
              <span>{{ column.formatter(scope.row, column, scope.row[column.prop], scope.$index) }}</span>
            </template>
          </el-table-column>
        </template>

        <!-- 操作列 -->
        <el-table-column v-if="showOperations" label="操作" :width="operationWidth" fixed="right">
          <template #default="scope">
            <slot name="operations" :row="scope.row" :$index="scope.$index">
              <el-button v-if="showEdit" type="primary" size="small" @click="$emit('edit', scope.row)">
                编辑
              </el-button>
              <el-button v-if="showDelete" type="danger" size="small" @click="$emit('delete', scope.row)">
                删除
              </el-button>
            </slot>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div v-if="showPagination" class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="pageSizes"
          :total="total"
          :background="true"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { Search, Plus, Download, Refresh } from '@element-plus/icons-vue'

// Props定义
const props = defineProps({
  // 数据相关
  data: { type: Array, default: () => [] },
  total: { type: Number, default: 0 },
  loading: { type: Boolean, default: false },
  
  // 表格配置
  columns: { type: Array, required: true },
  rowKey: { type: String, default: 'id' },
  tableHeight: { type: [String, Number], default: 'auto' },
  
  // 功能开关
  showSearch: { type: Boolean, default: true },
  showActions: { type: Boolean, default: true },
  showPagination: { type: Boolean, default: true },
  showIndex: { type: Boolean, default: false },
  showOperations: { type: Boolean, default: true },
  selection: { type: Boolean, default: false },
  
  // 操作按钮
  showAdd: { type: Boolean, default: true },
  showEdit: { type: Boolean, default: true },
  showDelete: { type: Boolean, default: true },
  showExport: { type: Boolean, default: false },
  operationWidth: { type: Number, default: 120 },
  
  // 搜索配置
  searchFields: { type: Array, default: () => [] },
  
  // 分页配置
  pageSize: { type: Number, default: 10 },
  pageSizes: { type: Array, default: () => [10, 20, 50, 100] }
})

// Emits定义
const emit = defineEmits([
  'search', 'reset', 'refresh', 'add', 'edit', 'delete', 'export',
  'selection-change', 'sort-change', 'row-click', 'page-change'
])

// 响应式数据
const tableRef = ref()
const currentPage = ref(1)
const selectedRows = ref([])
const searchData = reactive({})

// 计算属性
const tableData = computed(() => props.data)

// 方法
const handleSearch = () => {
  currentPage.value = 1
  emit('search', { ...searchData, page: 1, pageSize: props.pageSize })
}

const resetSearch = () => {
  Object.keys(searchData).forEach(key => {
    searchData[key] = ''
  })
  currentPage.value = 1
  emit('reset')
}

const handleRefresh = () => {
  emit('refresh')
}

const handleSelectionChange = (selection) => {
  selectedRows.value = selection
  emit('selection-change', selection)
}

const handleSortChange = (sortInfo) => {
  emit('sort-change', sortInfo)
}

const handleRowClick = (row) => {
  emit('row-click', row)
}

const handleSizeChange = (size) => {
  emit('page-change', { page: currentPage.value, pageSize: size })
}

const handleCurrentChange = (page) => {
  emit('page-change', { page, pageSize: props.pageSize })
}

// 初始化搜索数据
onMounted(() => {
  props.searchFields.forEach(field => {
    searchData[field.prop] = ''
  })
})
</script>

<style scoped>
.data-table-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.search-card, .action-card {
  margin-bottom: 16px;
}

.search-form {
  margin-bottom: 0;
}

.table-card {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.table-card :deep(.el-card__body) {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 16px;
}

.pagination-container {
  margin-top: 16px;
  text-align: right;
}
</style>
