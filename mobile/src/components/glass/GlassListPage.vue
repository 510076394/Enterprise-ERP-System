<!--
/**
 * GlassListPage.vue - 通用列表页面组件
 * @description 提供统一的列表页面布局，包含搜索、筛选、标签、统计等功能
 * @date 2025-12-27
 * @version 1.0.0
 */
-->
<template>
  <div class="glass-list-page">
    <!-- 背景模糊层 -->
    <div class="bg-overlay"></div>

    <!-- 顶部导航栏 -->
    <header class="page-header">
      <button v-if="showBack" class="header-btn" @click="handleBack">
        <Icon name="chevron-right" size="1.5rem" class-name="rotate-180" />
      </button>
      <h1 class="header-title">{{ title }}</h1>
      <div class="header-actions">
        <slot name="header-actions">
          <button v-if="showAdd" class="header-btn" @click="handleAdd">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </slot>
      </div>
    </header>

    <!-- 主要内容区域 -->
    <div class="page-content">
      <!-- 搜索和筛选 -->
      <div v-if="showSearch" class="search-filter-row">
        <div class="search-box-wrapper">
          <div class="search-icon">
            <Icon name="search" size="1rem" />
          </div>
          <input 
            :value="searchValue"
            @input="$emit('update:searchValue', $event.target.value)"
            type="text" 
            class="search-input" 
            :placeholder="searchPlaceholder"
          />
        </div>
        <button v-if="showFilter" class="filter-btn" @click="$emit('filter')">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
              d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
        </button>
      </div>

      <!-- 标签滚动 -->
      <div v-if="tags && tags.length > 0" class="tags-scroll">
        <button 
          v-for="tag in tags" 
          :key="tag.value"
          class="tag-btn"
          :class="{ active: activeTag === tag.value }"
          @click="$emit('update:activeTag', tag.value)"
        >
          {{ tag.label }}
        </button>
      </div>

      <!-- 统计摘要 -->
      <div v-if="stats && stats.length > 0" class="stats-summary">
        <div v-for="stat in stats" :key="stat.label" class="stat-item">
          <div class="stat-icon-wrapper" :class="stat.iconClass">
            <component :is="stat.icon" v-if="typeof stat.icon === 'object'" />
            <Icon v-else :name="stat.icon" size="1rem" />
          </div>
          <div>
            <p class="stat-label">{{ stat.label }}</p>
            <p class="stat-value">{{ stat.value }}</p>
          </div>
        </div>
      </div>

      <!-- 自定义内容插槽 -->
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
import Icon from '@/components/icons/index.vue'

const props = defineProps({
  // 页面标题
  title: {
    type: String,
    required: true
  },
  // 是否显示返回按钮
  showBack: {
    type: Boolean,
    default: true
  },
  // 是否显示添加按钮
  showAdd: {
    type: Boolean,
    default: true
  },
  // 是否显示搜索框
  showSearch: {
    type: Boolean,
    default: true
  },
  // 搜索框占位符
  searchPlaceholder: {
    type: String,
    default: 'SKU 或 名称'
  },
  // 搜索值
  searchValue: {
    type: String,
    default: ''
  },
  // 是否显示筛选按钮
  showFilter: {
    type: Boolean,
    default: true
  },
  // 标签列表
  tags: {
    type: Array,
    default: () => []
  },
  // 当前激活的标签
  activeTag: {
    type: String,
    default: ''
  },
  // 统计数据
  stats: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['back', 'add', 'update:searchValue', 'update:activeTag', 'filter'])

const handleBack = () => {
  emit('back')
}

const handleAdd = () => {
  emit('add')
}
</script>

<style lang="scss" scoped>
.glass-list-page {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  background: var(--bg-primary);
}

/* 背景模糊层 */
.bg-overlay {
  position: absolute;
  inset: 0;
  background: rgba(15, 23, 42, 0.5);
  backdrop-filter: blur(48px);
  -webkit-backdrop-filter: blur(48px);
  z-index: -1;
}

/* 顶部导航栏 */
.page-header {
  padding: 3rem 1.5rem 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
}

.header-btn {
  padding: 0.5rem;
  margin: -0.5rem;
  border-radius: 50%;
  background: none;
  border: none;
  color: rgb(226, 232, 240);
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.header-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.header-btn:active {
  transform: scale(0.95);
}

.header-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: white;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
}

/* 主要内容区域 */
.page-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* 隐藏滚动条 */
.page-content::-webkit-scrollbar {
  display: none;
}

/* 搜索和筛选行 */
.search-filter-row {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.search-box-wrapper {
  position: relative;
  flex: 1;
}

.search-icon {
  position: absolute;
  inset-y: 0;
  left: 0;
  padding-left: 0.75rem;
  display: flex;
  align-items: center;
  pointer-events: none;
  color: rgb(148, 163, 184);
}

.search-input {
  display: block;
  width: 100%;
  padding: 0.625rem 0.75rem 0.625rem 2.25rem;
  border-radius: 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 0.875rem;
  color: white;
  transition: all 0.2s ease;
}

.search-input::placeholder {
  color: rgb(148, 163, 184);
}

.search-input:focus {
  outline: none;
  border-color: rgba(59, 130, 246, 0.5);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.filter-btn {
  width: 2.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgb(203, 213, 225);
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.filter-btn:active {
  transform: scale(0.95);
}

/* 标签滚动 */
.tags-scroll {
  display: flex;
  gap: 0.5rem;
  overflow-x: auto;
  overflow-y: visible;
  padding: 0.25rem 0 0.5rem 0;
  margin: 0;
  -webkit-overflow-scrolling: touch;
}

.tags-scroll::-webkit-scrollbar {
  display: none;
}

.tag-btn {
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgb(203, 213, 225);
  font-size: 0.75rem;
  font-weight: 500;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
  min-height: 2rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.tag-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.tag-btn.active {
  background: rgb(59, 130, 246);
  color: white;
  border-color: rgb(59, 130, 246);
}

/* 统计摘要 */
.stats-summary {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
}

.stat-item {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 0.75rem;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.stat-icon-wrapper {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-icon-wrapper.bg-blue {
  background: rgba(59, 130, 246, 0.2);
  color: rgb(147, 197, 253);
}

.stat-icon-wrapper.bg-red {
  background: rgba(239, 68, 68, 0.2);
  color: rgb(252, 165, 165);
}

.stat-icon-wrapper.bg-green {
  background: rgba(34, 197, 94, 0.2);
  color: rgb(134, 239, 172);
}

.stat-icon-wrapper.bg-yellow {
  background: rgba(234, 179, 8, 0.2);
  color: rgb(253, 224, 71);
}

.stat-icon-wrapper.bg-purple {
  background: rgba(168, 85, 247, 0.2);
  color: rgb(216, 180, 254);
}

.stat-label {
  font-size: 0.625rem;
  color: rgb(148, 163, 184);
  text-transform: uppercase;
}

.stat-value {
  font-size: 0.875rem;
  font-weight: 700;
  color: white;
}

/* 响应式设计 */
@media (max-width: 375px) {
  .page-content {
    padding: 1rem;
    gap: 1rem;
  }

  .tags-scroll {
    padding: 0.25rem 0 0.5rem 0;
    gap: 0.375rem;
  }

  .tag-btn {
    padding: 0.375rem 0.75rem;
    font-size: 0.6875rem;
    min-height: 1.75rem;
  }

  .stats-summary {
    grid-template-columns: repeat(3, 1fr);
    gap: 0.5rem;
  }

  .stat-item {
    padding: 0.5rem;
    gap: 0.5rem;
  }

  .stat-icon-wrapper {
    width: 1.5rem;
    height: 1.5rem;
  }

  .stat-label {
    font-size: 0.5rem;
  }

  .stat-value {
    font-size: 0.75rem;
  }
}

/* 工具类 */
.w-5 { width: 1.25rem; height: 1.25rem; }
.w-6 { width: 1.5rem; height: 1.5rem; }

.rotate-180 {
  transform: rotate(180deg);
}
</style>

