/**
 * main.js
 * @description 移动端应用文件
  * @date 2025-08-27
 * @version 1.0.0
 */

import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { createPinia } from 'pinia'
import { initTheme } from './composables/useTheme';

// 导入性能监控和缓存管理
import performanceMonitor, { performance } from './utils/performance';
import cacheManager, { cache, offline } from './utils/cache';
import {
  Button,
  NavBar,
  Tabbar,
  TabbarItem,
  Form,
  Field,
  Cell,
  CellGroup,
  Popup,
  DatePicker,
  NumberKeyboard,
  ActionBar,
  ActionBarIcon,
  ActionBarButton,
  Icon,
  Loading,
  Toast,
  Dialog,
  Empty,
  Picker,
  PullRefresh,
  List,
  Card,
  Tag,
  Search,
  SwipeCell,
  Radio,
  RadioGroup,
  Checkbox,
  CheckboxGroup,
  Swipe,
  SwipeItem,
  Badge,
  Tabs,
  Tab
} from 'vant';
import 'vant/lib/index.css';
import './assets/styles/index.scss';

// 引入 Glass 主题样式
import './styles/glass-theme.css';

// 引入 Glass 组件库
import GlassComponents from './components/glass';

import { refreshFullscreenState, isIOS, applyFullscreenStyles, enterIOSFullscreen, initFullscreen } from './utils/fullscreen';

// 检查是否已登录
const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

// 检查是否是从主屏幕启动的Web应用
const isStandalone = window.navigator.standalone === true;

// 如果是从主屏幕启动，无论当前URL如何，都强制设置全屏模式
if (isStandalone) {
  localStorage.setItem('forceFullscreen', 'true');
}

// 如果是iOS和已登录状态，优先使用增强版全屏
if (isIOS() && (isLoggedIn || isStandalone)) {
  initFullscreen();
} else {
  // 在应用创建前立即应用全屏样式
  applyFullscreenStyles();
}

// 立即刷新全屏状态，不等待DOM内容加载
if (isIOS() && (isLoggedIn || isStandalone)) {
  enterIOSFullscreen();
} else {
  refreshFullscreenState();
}

// 即使在动态加载应用前就开始强制使用全屏样式
document.documentElement.classList.add('fullscreen-mode');
document.body.classList.add('fullscreen-mode');

// 固定页面，防止iOS弹性滚动
document.documentElement.style.overflow = 'hidden';
document.documentElement.style.position = 'fixed';
document.documentElement.style.width = '100%';
document.documentElement.style.height = '100%';
document.body.style.overflow = 'hidden';
document.body.style.position = 'fixed';
document.body.style.width = '100%';
document.body.style.height = '100%';

const app = createApp(App);
const pinia = createPinia();

// 注册Vant组件
app.use(Button);
app.use(NavBar);
app.use(Tabbar);
app.use(TabbarItem);
app.use(Form);
app.use(Field);
app.use(Cell);
app.use(CellGroup);
app.use(Popup);
app.use(DatePicker);
app.use(NumberKeyboard);
app.use(ActionBar);
app.use(ActionBarIcon);
app.use(ActionBarButton);
app.use(Icon);
app.use(Loading);
app.use(Toast);
app.use(Dialog);
app.use(Empty);
app.use(Picker);
app.use(PullRefresh);
app.use(List);
app.use(Card);
app.use(Tag);
app.use(Search);
app.use(SwipeCell);
app.use(Radio);
app.use(RadioGroup);
app.use(Checkbox);
app.use(CheckboxGroup);
app.use(Swipe);
app.use(SwipeItem);
app.use(Badge);
app.use(Tabs);
app.use(Tab);

app.use(pinia);
app.use(router);

// 注册 Glass 组件库
app.use(GlassComponents);

// 初始化主题系统
initTheme();

// 配置 Vue 警告处理器，抑制来自 Vant 组件库的 slot 警告
app.config.warnHandler = (msg, instance, trace) => {
  // 抑制 Vant 组件库的 slot 警告
  if (msg.includes('Slot "default" invoked outside of the render function')) {
    return;
  }
  // 其他警告正常输出
  console.warn(`[Vue warn]: ${msg}`, trace);
};

// 全局配置性能监控和缓存
app.config.globalProperties.$performance = performance;
app.config.globalProperties.$cache = cache;
app.config.globalProperties.$offline = offline;

// 开发环境下暴露到window对象
if (process.env.NODE_ENV === 'development') {
  window.$performance = performance;
  window.$cache = cache;
  window.$offline = offline;
  window.$performanceMonitor = performanceMonitor;
  window.$cacheManager = cacheManager;
}

app.mount('#app');

// 全局初始化代码
document.addEventListener('DOMContentLoaded', () => {
  // 初始化全屏状态
  if (isIOS() && (isLoggedIn || isStandalone)) {
    // 对于iOS已登录用户，使用增强的全屏
    initFullscreen();
  } else {
    refreshFullscreenState();
  }
  
  // 处理iOS滚动到顶部的功能 (点击状态栏)
  if (isIOS()) {
    window.addEventListener('scroll', () => {
      // 当页面滚动时记录位置
      sessionStorage.setItem('scrollPosition', window.scrollY);
    });
    
    document.addEventListener('touchstart', (e) => {
      // 检测是否点击了顶部状态栏区域 (大约前20px)
      if (e.touches[0].clientY < 20) {
        // 如果已经在顶部，则不做任何处理
        if (window.scrollY === 0) return;
        
        // 平滑滚动到顶部
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      }
    });
  }
});

// 使用防抖函数包装全屏刷新
const debounceFullscreenRefresh = (func, delay) => {
  let timer;
  return function() {
    clearTimeout(timer);
    timer = setTimeout(() => {
      if (document.visibilityState === 'visible') {
        func();
      }
    }, delay);
  }
};

// 统一的全屏刷新处理函数
const refreshFullscreen = () => {
  if (isIOS() && (isLoggedIn || isStandalone)) {
    initFullscreen();
    enterIOSFullscreen();
  } else {
    refreshFullscreenState();
  }
};

// 添加全局事件监听器，处理各种场景下的全屏模式
const debouncedRefresh = debounceFullscreenRefresh(refreshFullscreen, 500);

window.addEventListener('orientationchange', debouncedRefresh);
window.addEventListener('resize', debouncedRefresh);
window.addEventListener('load', debouncedRefresh);
window.addEventListener('focus', debouncedRefresh);

// 设置定期检查全屏状态的定时器，减少频率
const fullscreenIntervalId = setInterval(() => {
  if (document.visibilityState === 'visible') {
    // 仅在屏幕可见时才刷新全屏状态
    // 再次减少频率以避免抖动
    refreshFullscreen();
  }
}, 10000); // 从5秒改为10秒，进一步减少频率

// 清理处理 - 应用销毁时清除定时器
window.addEventListener('beforeunload', () => {
  clearInterval(fullscreenIntervalId);
}); 