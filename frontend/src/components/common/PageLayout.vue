<!--
/**
 * PageLayout.vue
 * @description 通用页面布局组件 - 减少销售模块页面重复代码
 * @date 2025-09-10
 * @version 1.0.0
 */
-->
<template>
  <div class="page-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>{{ title }}</h2>
      <div class="header-actions">
        <slot name="header-actions">
          <el-button type="primary" @click="$emit('add')">
            <el-icon><Plus /></el-icon> {{ addButtonText }}
          </el-button>
        </slot>
      </div>
    </div>

    <!-- 搜索区域 -->
    <el-card class="search-card">
      <slot name="search-form">
        <el-form :inline="true" class="search-form">
          <el-form-item :label="searchLabel">
            <el-input
              :model-value="searchQuery"
              @update:model-value="$emit('update:searchQuery', $event)"
              :placeholder="searchPlaceholder"
              @keyup.enter="$emit('search', true)"
              @input="$emit('search')"
              clearable
            />
          </el-form-item>

          <el-form-item label="状态">
            <el-select 
              :model-value="statusFilter" 
              @update:model-value="$emit('update:statusFilter', $event)"
              placeholder="状态" 
              clearable 
              @change="$emit('search', true)"
              style="width: 130px"
            >
              <el-option
                v-for="item in statusOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          
          <el-form-item label="日期范围">
            <el-date-picker
              :model-value="dateRange"
              @update:model-value="$emit('update:dateRange', $event)"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              @change="$emit('search', true)"
              style="width: 220px"
            />
          </el-form-item>
          
          <el-form-item>
            <el-button type="primary" @click="$emit('search', true)">
              <el-icon><Search /></el-icon> 查询
            </el-button>
            <el-button @click="$emit('reset')">
              <el-icon><Refresh /></el-icon> 重置
            </el-button>
          </el-form-item>
        </el-form>
      </slot>
      
      <div class="action-buttons" v-if="showActions">
        <slot name="actions">
          <el-dropdown>
            <el-button type="primary">
              更多操作<el-icon class="el-icon--right"><ArrowDown /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="$emit('import')">
                  <el-icon><Upload /></el-icon> 导入
                </el-dropdown-item>
                <el-dropdown-item @click="$emit('export')">
                  <el-icon><Download /></el-icon> 导出
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </slot>
      </div>
    </el-card>

    <!-- 统计卡片 -->
    <div class="statistics-row" v-if="statistics && statistics.length">
      <el-card 
        v-for="stat in statistics" 
        :key="stat.key"
        class="stat-card" 
        shadow="hover"
        @click="$emit('stat-click', stat.key)"
      >
        <div class="stat-value">{{ stat.value }}</div>
        <div class="stat-label">{{ stat.label }}</div>
      </el-card>
    </div>

    <!-- 主要内容区域 -->
    <el-card class="data-card">
      <slot name="content">
        <!-- 默认表格插槽 -->
        <el-table 
          :data="tableData" 
          border
          style="width: 100%" 
          :loading="loading"
          :max-height="tableHeight"
          table-layout="fixed"
        >
          <slot name="table-columns" />
        </el-table>
        
        <!-- 分页 -->
        <div class="pagination-container" v-if="showPagination">
          <el-pagination
            :current-page="currentPage"
            :page-size="pageSize"
            :total="total"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="$emit('size-change', $event)"
            @current-change="$emit('page-change', $event)"
          />
        </div>
      </slot>
    </el-card>
  </div>
</template>

<script setup>
import { Plus, Search, Refresh, Upload, Download, ArrowDown } from '@element-plus/icons-vue'

// Props定义
defineProps({
  title: {
    type: String,
    required: true
  },
  addButtonText: {
    type: String,
    default: '添加'
  },
  searchLabel: {
    type: String,
    default: '搜索'
  },
  searchPlaceholder: {
    type: String,
    default: '请输入搜索关键词'
  },
  searchQuery: {
    type: String,
    default: ''
  },
  statusFilter: {
    type: String,
    default: ''
  },
  dateRange: {
    type: Array,
    default: () => []
  },
  statusOptions: {
    type: Array,
    default: () => []
  },
  statistics: {
    type: Array,
    default: () => []
  },
  tableData: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  tableHeight: {
    type: String,
    default: 'calc(100vh - 280px)'
  },
  currentPage: {
    type: Number,
    default: 1
  },
  pageSize: {
    type: Number,
    default: 10
  },
  total: {
    type: Number,
    default: 0
  },
  showActions: {
    type: Boolean,
    default: true
  },
  showPagination: {
    type: Boolean,
    default: true
  }
})

// 事件定义
defineEmits([
  'add',
  'search',
  'reset',
  'import',
  'export',
  'stat-click',
  'size-change',
  'page-change',
  'update:searchQuery',
  'update:statusFilter',
  'update:dateRange'
])
</script>

<style scoped>
.page-container {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.page-header h2 {
  margin: 0;
  font-size: 1.5rem;
  color: #303133;
}

.search-card {
  margin-bottom: 16px;
  position: relative;
}

.search-form {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.action-buttons {
  position: absolute;
  top: 20px;
  right: 20px;
}

.statistics-row {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.stat-card {
  flex: 1;
  min-width: 140px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.stat-value {
  font-size: 2rem;
  font-weight: bold;
  color: #409eff;
  margin-bottom: 8px;
}

.stat-label {
  color: #606266;
  font-size: 0.9rem;
}

.data-card {
  margin-bottom: 16px;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

@media (max-width: 768px) {
  .statistics-row {
    flex-direction: column;
  }
  
  .stat-card {
    min-width: auto;
  }
  
  .search-form {
    flex-direction: column;
  }
  
  .page-header {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }
}
</style>
