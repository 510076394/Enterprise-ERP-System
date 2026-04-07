<!--
/**
 * App.vue
 * @description 移动端应用文件
  * @date 2025-08-27
 * @version 1.0.0
 */
-->
<template>
  <div :class="['app-container', { 'standalone-mode': isStandalone, 'fullscreen-active': forceFullscreen }]">
    <!-- 错误边界 -->
    <ErrorBoundary ref="errorBoundaryRef">
      <RouterView />

      <Tabbar v-show="showTabbar" route>
        <TabbarItem name="Home" to="/" icon="home-o">首页</TabbarItem>
        <TabbarItem name="Scan" to="/scan" icon="scan">扫码</TabbarItem>
        <TabbarItem name="Notifications" to="/notifications" icon="bell">通知</TabbarItem>
        <TabbarItem name="Profile" to="/profile" icon="user-o">我的</TabbarItem>
      </Tabbar>
    
    <IOSInstallPrompt />
    
    <!-- 添加快捷入口，引导添加到主屏幕 -->
    <div v-if="!isStandalone && showAddToHomeButton" class="add-to-home-btn" @click="openInstallGuide">
      <Icon name="plus" />
      <span>添加到主屏幕</span>
    </div>
    </ErrorBoundary>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onBeforeUnmount, watch } from 'vue';
import { useRoute } from 'vue-router';
import { Tabbar, TabbarItem, Icon } from 'vant';
import { useAuthStore } from './stores/auth';
import IOSInstallPrompt from './components/IOSInstallPrompt.vue';
import ErrorBoundary from './components/ErrorBoundary.vue';
import { runStartupChecks } from '@/utils/startup';
import {
  setForceFullscreen,
  isInFullscreenMode,
  isIOS,
  enterIOSFullscreen,
  applyFullscreenStyles,
  refreshFullscreenState
} from './utils/fullscreen';

const route = useRoute();
const authStore = useAuthStore();
const errorBoundaryRef = ref(null);

// 响应式状态
const isStandalone = ref(false);
const forceFullscreen = ref(false);
const showAddToHomeButton = ref(true);

// 定时器ID
let fullscreenIntervalId = null;

// 检查是否是从主屏幕启动（standalone模式）
const checkStandaloneMode = () => {
  // 检查是否是从主屏幕启动
  const isFromHomeScreen = window.navigator.standalone === true || 
                           window.matchMedia('(display-mode: standalone)').matches;
  
  // 如果是从主屏幕启动，强制设置全屏
  if (isFromHomeScreen) {
    localStorage.setItem('forceFullscreen', 'true');
    showAddToHomeButton.value = false;
  }
  
  isStandalone.value = isInFullscreenMode() || isFromHomeScreen;
  forceFullscreen.value = localStorage.getItem('forceFullscreen') === 'true';
  
  // 检查是否已登录
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  
  // 如果已登录且在iOS上或从主屏幕启动，使用增强型全屏
  if ((isLoggedIn || isFromHomeScreen) && isIOS()) {
    enterIOSFullscreen();
  } else {
    // 其他情况使用标准全屏刷新
    applyFullscreenStyles();
  }
};

// 打开添加到主屏幕指南
const openInstallGuide = () => {
  window.open('/pwa-guide.html', '_blank');
};

// 计算是否显示底部导航栏
const showTabbar = computed(() => {
  // 特定路由不显示导航栏
  const noTabbarRoutes = ['/login'];
  if (noTabbarRoutes.includes(route.path)) {
    return false;
  }
  
  // 检查是否登录
  return authStore.isAuthenticated;
});

// 监听路由变化，每次路由变化都刷新全屏状态
watch(() => route.path, () => {
  // 使用防抖方式刷新全屏状态，避免频繁刷新
  clearTimeout(window._fullscreenRefreshTimer);
  window._fullscreenRefreshTimer = setTimeout(() => {
    checkStandaloneMode();
  }, 300);
}, { immediate: true });

// 在可见性变化时重新检查状态（例如从后台切回应用）
const handleVisibilityChange = () => {
  if (document.visibilityState === 'visible') {
    // 使用防抖处理，避免多次触发
    clearTimeout(window._visibilityChangeTimer);
    window._visibilityChangeTimer = setTimeout(() => {
      checkStandaloneMode();
      
      // 如果已登录并且是iOS设备，使用增强型全屏
      if (localStorage.getItem('isLoggedIn') === 'true' && isIOS()) {
        enterIOSFullscreen();
      } else {
        refreshFullscreenState();
      }
    }, 500);
  }
};

// 在组件挂载时设置
onMounted(() => {
  // 执行启动检查（异步执行，不阻塞挂载）
  runStartupChecks().catch(() => {
    // 静默处理启动检查错误
  });

  // 检查是否是从主屏幕启动
  const isFromHomeScreen = window.navigator.standalone === true;

  // 检查是否从登录页来，如是则强制全屏
  if (authStore.isAuthenticated || isFromHomeScreen) {
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('forceFullscreen', 'true');
    
    if (isIOS()) {
      // 只调用一次enterIOSFullscreen，避免多次调用导致抖动
      enterIOSFullscreen();
    } else {
      setForceFullscreen(true);
    }
    
    // 初始检查只执行一次
    checkStandaloneMode();
  } else {
    // 非登录状态下还是需要初始检查
    checkStandaloneMode();
  }
  
  // 添加可见性变化监听
  document.addEventListener('visibilitychange', handleVisibilityChange);
  
  // 添加聚焦监听 - 使用防抖
  window.addEventListener('focus', () => {
    clearTimeout(window._focusTimer);
    window._focusTimer = setTimeout(checkStandaloneMode, 500);
  });
  
  // 添加调整大小监听 - 使用防抖
  window.addEventListener('resize', () => {
    clearTimeout(window._resizeTimer);
    window._resizeTimer = setTimeout(checkStandaloneMode, 500);
  });
  
  // 定期检查全屏状态
  fullscreenIntervalId = setInterval(() => {
    if ((authStore.isAuthenticated || isFromHomeScreen) && document.visibilityState === 'visible') {
      const now = Date.now();
      const lastRefresh = window._lastAppFullscreenRefresh || 0;

      if (now - lastRefresh < 3000) {
        return;
      }

      window._lastAppFullscreenRefresh = now;

      if (isIOS()) {
        enterIOSFullscreen();
      } else {
        refreshFullscreenState();
      }
    }
  }, 10000);
});

// 在组件卸载前清理
onBeforeUnmount(() => {
  // 清除定时器
  if (fullscreenIntervalId) {
    clearInterval(fullscreenIntervalId);
  }
  // 移除事件监听器
  document.removeEventListener('visibilitychange', handleVisibilityChange);
  window.removeEventListener('focus', checkStandaloneMode);
  window.removeEventListener('resize', checkStandaloneMode);
});
</script>

<style lang="scss">
@use "@/assets/styles/variables.scss" as *;

html, body {
  margin: 0;
  padding: 0;
  height: 100% !important;
  font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica,
    Segoe UI, Arial, Roboto, 'PingFang SC', 'miui', 'Hiragino Sans GB', 'Microsoft Yahei',
    sans-serif;
  background-color: $background-color;
  color: $text-color;
  /* 防止iOS弹性滚动效果 */
  position: fixed;
  width: 100%;
  overflow: hidden;
  overscroll-behavior-y: none;
}

/* 全屏模式类 */
.fullscreen-mode {
  position: fixed !important;
  width: 100% !important;
  height: 100% !important;
  overflow: hidden !important;
  margin: 0 !important;
  padding: 0 !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
}

.app-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  
  /* 全屏模式下的样式调整 */
  &.standalone-mode,
  &.fullscreen-active {
    /* 适配iPhone X及以上刘海屏 */
    padding-top: env(safe-area-inset-top);
    padding-bottom: env(safe-area-inset-bottom);
    padding-left: env(safe-area-inset-left);
    padding-right: env(safe-area-inset-right);
  }
}

// 页面通用容器
.page-container {
  display: flex;
  flex-direction: column;
  min-height: 100%;
  height: 100%;
  position: relative;
}

// 内容容器
.content-container {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding-bottom: calc($padding-md + var(--van-tabbar-height, 50px));
}

// 卡片样式
.card {
  background-color: white;
  border-radius: $border-radius-lg;
  margin: $margin-md;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(100, 101, 102, 0.08);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: $padding-md;
  border-bottom: 1px solid $border-color;
  font-weight: bold;
}

.card-content {
  padding: $padding-md;
}

// 辅助类
.text-center {
  text-align: center;
}

.flex {
  display: flex;
}

.justify-between {
  justify-content: space-between;
}

.align-center {
  align-items: center;
}

.p-xs {
  padding: $padding-xs;
}

.mt-xs {
  margin-top: $margin-xs;
}

// 盘盈盘亏状态颜色
.profit-text {
  color: #4caf50;
}

.loss-text {
  color: #f44336;
}

.add-to-home-btn {
  position: fixed;
  right: 16px;
  bottom: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  background-color: #1989fa;
  color: white;
  padding: 8px;
  border-radius: 50%;
  width: 56px;
  height: 56px;
  box-shadow: 0 3px 8px rgba(25, 137, 250, 0.5);
  z-index: 100;
  font-size: 12px;
  line-height: 1.2;
  
  .van-icon {
    font-size: 20px;
    margin-bottom: 2px;
  }
  
  span {
    font-size: 10px;
    text-align: center;
    white-space: nowrap;
  }
}

/* iOS设备底部适配 */
.ios-device .add-to-home-btn {
  bottom: calc(80px + env(safe-area-inset-bottom));
}

/* 顶级容器 */
.standalone-mode {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.fullscreen-active {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  width: 100% !important;
  height: 100% !important;
  overflow: hidden !important;
}
</style> 