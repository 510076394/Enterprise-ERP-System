<!--
/**
 * GlassPage.vue
 * @description 通用的 Glassmorphism 页面布局组件
 * @date 2025-12-27
 * @version 1.0.0
 */
-->
<template>
  <div class="glass-page">
    <!-- 背景光斑效果 -->
    <div v-if="showBlobs" class="bg-blobs">
      <div class="blob blob-purple"></div>
      <div class="blob blob-pink"></div>
      <div class="blob blob-blue"></div>
    </div>

    <!-- 顶部导航栏 -->
    <div v-if="showHeader" class="page-header glass-panel">
      <button v-if="showBack" class="back-btn" @click="handleBack">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      
      <div class="header-title">{{ title }}</div>
      
      <div class="header-actions">
        <slot name="header-actions"></slot>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="page-content" :class="{ 'with-header': showHeader, 'with-nav': showBottomNav }">
      <slot></slot>
    </div>

    <!-- 底部导航栏 -->
    <div v-if="showBottomNav" class="bottom-nav glass-nav">
      <button 
        v-for="nav in navItems" 
        :key="nav.name"
        class="nav-item"
        :class="{ active: currentRoute === nav.path }"
        @click="navigateTo(nav.path)"
      >
        <component :is="nav.icon" class="w-6 h-6" />
        <span>{{ nav.name }}</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  showHeader: {
    type: Boolean,
    default: true
  },
  showBack: {
    type: Boolean,
    default: true
  },
  showBlobs: {
    type: Boolean,
    default: true
  },
  showBottomNav: {
    type: Boolean,
    default: false
  }
})

const router = useRouter()
const route = useRoute()

const currentRoute = computed(() => route.path)

const navItems = [
  {
    name: '首页',
    path: '/',
    icon: {
      template: `
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      `
    }
  },
  {
    name: '扫码',
    path: '/scan',
    icon: {
      template: `
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
            d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
        </svg>
      `
    }
  },
  {
    name: '通知',
    path: '/notifications',
    icon: {
      template: `
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      `
    }
  },
  {
    name: '我的',
    path: '/profile',
    icon: {
      template: `
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      `
    }
  }
]

const navigateTo = (path) => {
  router.push(path)
}

const handleBack = () => {
  router.back()
}
</script>

<style lang="scss" scoped>
.glass-page {
  min-height: 100vh;
  background: var(--bg-primary);
  position: relative;
}

/* 背景光斑 */
.bg-blobs {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  z-index: 0;
  pointer-events: none;
}

.blob {
  position: absolute;
  width: 18rem;
  height: 18rem;
  border-radius: 50%;
  filter: blur(3rem);
  opacity: 0.2;
  animation: blob 7s infinite;
}

.blob-purple {
  background: linear-gradient(135deg, #a855f7, #ec4899);
  top: -5rem;
  left: -5rem;
}

.blob-pink {
  background: linear-gradient(135deg, #ec4899, #f97316);
  top: 50%;
  right: -5rem;
  animation-delay: 2s;
}

.blob-blue {
  background: linear-gradient(135deg, #6366f1, #a855f7);
  bottom: -5rem;
  left: 50%;
  animation-delay: 4s;
}

@keyframes blob {
  0%, 100% {
    transform: translate(0, 0) scale(1);
  }
  33% {
    transform: translate(30px, -50px) scale(1.1);
  }
  66% {
    transform: translate(-20px, 20px) scale(0.9);
  }
}

/* 页面头部 */
.page-header {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.back-btn {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.back-btn:active {
  transform: scale(0.95);
  background: rgba(255, 255, 255, 0.1);
}

.header-title {
  flex: 1;
  text-align: center;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
}

.header-actions {
  min-width: 2.5rem;
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

/* 页面内容 */
.page-content {
  position: relative;
  z-index: 1;
  padding: 1rem;
  min-height: calc(100vh - 60px);
}

.page-content.with-header {
  min-height: calc(100vh - 120px);
}

.page-content.with-nav {
  padding-bottom: 80px;
}

/* 底部导航 */
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 0.5rem 0;
  z-index: 100;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem 1rem;
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.75rem;
}

.nav-item.active {
  color: var(--color-primary);
}

.nav-item:active {
  transform: scale(0.95);
}

/* 工具类 */
.w-6 {
  width: 1.5rem;
  height: 1.5rem;
}
</style>

