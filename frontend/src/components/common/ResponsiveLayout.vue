<!--
/**
 * ResponsiveLayout.vue
 * @description Vue组件文件
  * @date 2025-08-27
 * @version 1.0.0
 */
-->
<template>
  <div class="responsive-layout" :class="layoutClasses">
    <!-- 移动端顶部导航 -->
    <div v-if="isMobile" class="mobile-header">
      <div class="mobile-header-content">
        <el-button 
          class="menu-toggle" 
          :icon="Expand" 
          @click="toggleSidebar"
          text
        />
        <div class="header-title">
          <slot name="header-title">{{ title }}</slot>
        </div>
        <div class="header-actions">
          <slot name="header-actions" />
        </div>
      </div>
    </div>

    <!-- 侧边栏 -->
    <div 
      v-if="showSidebar" 
      class="sidebar-container"
      :class="{ 'sidebar-mobile': isMobile }"
    >
      <!-- 移动端遮罩 -->
      <div 
        v-if="isMobile && sidebarVisible" 
        class="sidebar-overlay"
        @click="closeSidebar"
      />
      
      <!-- 侧边栏内容 -->
      <div class="sidebar" :class="{ 'sidebar-collapsed': !sidebarVisible }">
        <div class="sidebar-header">
          <slot name="sidebar-header">
            <div class="logo">
              <img src="/logo.png" alt="Logo" />
              <span v-if="sidebarVisible">ERP系统</span>
            </div>
          </slot>
        </div>
        
        <div class="sidebar-content">
          <slot name="sidebar-content" />
        </div>
      </div>
    </div>

    <!-- 主内容区域 -->
    <div class="main-container" :class="mainContainerClasses">
      <!-- 桌面端顶部导航 -->
      <div v-if="!isMobile && showHeader" class="desktop-header">
        <div class="header-left">
          <el-button 
            v-if="showSidebar"
            class="sidebar-toggle" 
            :icon="sidebarVisible ? Fold : Expand"
            @click="toggleSidebar"
            text
          />
          <slot name="header-left" />
        </div>
        
        <div class="header-center">
          <slot name="header-center" />
        </div>
        
        <div class="header-right">
          <slot name="header-right" />
        </div>
      </div>

      <!-- 面包屑导航 -->
      <div v-if="showBreadcrumb" class="breadcrumb-container">
        <slot name="breadcrumb">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item 
              v-for="item in breadcrumbItems" 
              :key="item.path"
              :to="item.path"
            >
              {{ item.title }}
            </el-breadcrumb-item>
          </el-breadcrumb>
        </slot>
      </div>

      <!-- 主要内容 -->
      <div class="content-container" :class="contentClasses">
        <slot />
      </div>

      <!-- 底部 -->
      <div v-if="showFooter" class="footer-container">
        <slot name="footer">
          <div class="footer-content">
            <span>&copy; 2025 ERP系统. All rights reserved.</span>
          </div>
        </slot>
      </div>
    </div>

    <!-- 移动端底部导航 -->
    <div v-if="isMobile && showBottomNav" class="bottom-navigation">
      <slot name="bottom-nav">
        <div class="bottom-nav-item" v-for="item in bottomNavItems" :key="item.name">
          <el-icon>
            <component :is="item.icon" />
          </el-icon>
          <span>{{ item.label }}</span>
        </div>
      </slot>
    </div>

    <!-- 回到顶部按钮 -->
    <el-backtop v-if="showBackTop" :right="20" :bottom="isMobile ? 80 : 40" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Expand, Fold } from '@element-plus/icons-vue'

// Props
const props = defineProps({
  title: { type: String, default: 'ERP系统' },
  showSidebar: { type: Boolean, default: true },
  showHeader: { type: Boolean, default: true },
  showFooter: { type: Boolean, default: false },
  showBreadcrumb: { type: Boolean, default: true },
  showBottomNav: { type: Boolean, default: false },
  showBackTop: { type: Boolean, default: true },
  sidebarCollapsed: { type: Boolean, default: false },
  contentPadding: { type: String, default: '16px' },
  breadcrumbItems: { type: Array, default: () => [] },
  bottomNavItems: { type: Array, default: () => [] }
})

// Emits
const emit = defineEmits(['sidebar-toggle', 'mobile-change'])

// 响应式数据
const sidebarVisible = ref(!props.sidebarCollapsed)
const windowWidth = ref(window.innerWidth)

// 计算属性
const isMobile = computed(() => windowWidth.value < 768)
const isTablet = computed(() => windowWidth.value >= 768 && windowWidth.value < 1024)
const isDesktop = computed(() => windowWidth.value >= 1024)

const layoutClasses = computed(() => ({
  'layout-mobile': isMobile.value,
  'layout-tablet': isTablet.value,
  'layout-desktop': isDesktop.value,
  'sidebar-visible': sidebarVisible.value && props.showSidebar,
  'sidebar-hidden': !sidebarVisible.value || !props.showSidebar
}))

const mainContainerClasses = computed(() => ({
  'main-with-sidebar': props.showSidebar && sidebarVisible.value && !isMobile.value,
  'main-full-width': !props.showSidebar || !sidebarVisible.value || isMobile.value
}))

const contentClasses = computed(() => ({
  'content-mobile': isMobile.value,
  'content-tablet': isTablet.value,
  'content-desktop': isDesktop.value
}))

// 方法
const toggleSidebar = () => {
  sidebarVisible.value = !sidebarVisible.value
  emit('sidebar-toggle', sidebarVisible.value)
}

const closeSidebar = () => {
  if (isMobile.value) {
    sidebarVisible.value = false
    emit('sidebar-toggle', false)
  }
}

const handleResize = () => {
  const newWidth = window.innerWidth
  const wasMobile = windowWidth.value < 768
  const isNowMobile = newWidth < 768
  
  windowWidth.value = newWidth
  
  // 当从桌面切换到移动端时，隐藏侧边栏
  if (!wasMobile && isNowMobile) {
    sidebarVisible.value = false
    emit('mobile-change', true)
  }
  // 当从移动端切换到桌面时，显示侧边栏
  else if (wasMobile && !isNowMobile) {
    sidebarVisible.value = true
    emit('mobile-change', false)
  }
}

// 生命周期
onMounted(() => {
  window.addEventListener('resize', handleResize)
  
  // 初始化时根据屏幕大小设置侧边栏状态
  if (isMobile.value) {
    sidebarVisible.value = false
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

// 暴露方法
defineExpose({
  toggleSidebar,
  closeSidebar,
  isMobile,
  isTablet,
  isDesktop
})
</script>

<style scoped>
.responsive-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

/* 移动端顶部导航 */
.mobile-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 56px;
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
  z-index: 1000;
}

.mobile-header-content {
  display: flex;
  align-items: center;
  height: 100%;
  padding: 0 16px;
}

.menu-toggle {
  margin-right: 12px;
}

.header-title {
  flex: 1;
  font-size: 18px;
  font-weight: 500;
  color: #303133;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 侧边栏 */
.sidebar-container {
  position: relative;
}

.sidebar-mobile {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  z-index: 1001;
}

.sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1001;
}

.sidebar {
  width: 240px;
  height: 100vh;
  background: #304156;
  color: #fff;
  transition: all 0.3s ease;
  overflow-y: auto;
  z-index: 1002;
}

.sidebar-collapsed {
  width: 64px;
}

.layout-mobile .sidebar {
  transform: translateX(-100%);
}

.layout-mobile .sidebar-visible .sidebar {
  transform: translateX(0);
}

.sidebar-header {
  height: 56px;
  display: flex;
  align-items: center;
  padding: 0 16px;
  border-bottom: 1px solid #434a50;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo img {
  width: 32px;
  height: 32px;
}

.sidebar-content {
  padding: 16px 0;
}

/* 主容器 */
.main-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
}

.layout-mobile .main-container {
  margin-top: 56px;
}

.main-with-sidebar {
  margin-left: 240px;
}

.layout-desktop.sidebar-hidden .main-with-sidebar {
  margin-left: 64px;
}

/* 桌面端顶部导航 */
.desktop-header {
  height: 56px;
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  align-items: center;
  padding: 0 16px;
  gap: 16px;
}

.header-left,
.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-center {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 面包屑 */
.breadcrumb-container {
  padding: 12px 16px;
  background: #f5f7fa;
  border-bottom: 1px solid #e4e7ed;
}

/* 内容区域 */
.content-container {
  flex: 1;
  overflow: auto;
  background: #f0f2f5;
}

.content-mobile {
  padding: 8px;
}

.content-tablet {
  padding: 12px;
}

.content-desktop {
  padding: 16px;
}

/* 底部 */
.footer-container {
  background: #fff;
  border-top: 1px solid #e4e7ed;
  padding: 16px;
  text-align: center;
}

.footer-content {
  color: #909399;
  font-size: 14px;
}

/* 移动端底部导航 */
.bottom-navigation {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: #fff;
  border-top: 1px solid #e4e7ed;
  display: flex;
  z-index: 1000;
}

.bottom-nav-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  color: #909399;
  font-size: 12px;
  cursor: pointer;
  transition: color 0.3s ease;
}

.bottom-nav-item:hover,
.bottom-nav-item.active {
  color: #409eff;
}

/* 响应式断点 */
@media (max-width: 767px) {
  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 1002;
  }
  
  .main-container {
    margin-left: 0 !important;
  }
}

@media (min-width: 768px) and (max-width: 1023px) {
  .sidebar {
    width: 200px;
  }
  
  .main-with-sidebar {
    margin-left: 200px;
  }
}

@media (min-width: 1024px) {
  .content-container {
    padding: 24px;
  }
}

</style>
