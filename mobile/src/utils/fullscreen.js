/**
 * iOS全屏模式管理工具
 */

// 是否强制应用全屏效果的标志
let forceFullscreenMode = false;

// 是否是iOS设备
const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

// 记录已经执行的操作，避免重复
let isFullscreenHackApplied = false;
let isFakeBottomBarCreated = false;

/**
 * 检查当前是否处于iOS全屏模式（standalone模式）
 * @returns {boolean} 是否处于全屏模式
 */
export const isInFullscreenMode = () => {
  // 检查是否有强制全屏标志
  if (localStorage.getItem('forceFullscreen') === 'true') {
    return true;
  }
  // 检查是否是从主屏幕启动的Web应用
  if (window.navigator.standalone === true) {
    // 如果是从主屏幕启动，强制设置全屏标记
    localStorage.setItem('forceFullscreen', 'true');
    return true;
  }
  return window.navigator.standalone === true;
};

/**
 * 设置是否强制使用全屏模式
 * @param {boolean} force 是否强制全屏
 */
export const setForceFullscreen = (force) => {
  forceFullscreenMode = force;
  if (force) {
    localStorage.setItem('forceFullscreen', 'true');
    // 强制应用全屏样式
    applyFullscreenStyles();
    // 添加全屏类
    document.documentElement.classList.add('force-fullscreen');
    document.body.classList.add('force-fullscreen');
  } else {
    localStorage.removeItem('forceFullscreen');
    document.documentElement.classList.remove('force-fullscreen');
    document.body.classList.remove('force-fullscreen');
  }
};

/**
 * 检查当前是否为iOS设备
 * @returns {boolean} 是否为iOS设备
 */
export const isIOS = () => {
  return isIOSDevice;
};

// 阻止iOS Safari的弹性滚动
export function preventElasticScrolling() {
  // 只应用一次
  if (window._elasticScrollingPrevented) return;
  window._elasticScrollingPrevented = true;
  
  document.body.addEventListener('touchmove', function(e) {
    if(e.target === document.body) {
      e.preventDefault();
    }
  }, { passive: false });
  
  // 防止双指缩放
  document.addEventListener('gesturestart', function(e) {
    e.preventDefault();
  });
}

// 强制隐藏Safari地址栏
export function hideSafariAddressBar() {
  if (!isIOSDevice) return;
  
  // 只在页面可见时执行
  if (document.visibilityState !== 'visible') return;
  
  // 尝试多种方法隐藏地址栏
  setTimeout(function() {
    // 方法1: 滚动到顶部
    window.scrollTo(0, 1);
    
    // 方法2: 向下滚动一点再回来
    setTimeout(function() {
      window.scrollTo(0, 0);
      window.scrollTo(0, 1);
    }, 100);
  }, 300);
}

// 创建一个假的底部导航栏，帮助隐藏Safari的底部工具栏
export function createFakeBottomBar() {
  if (!isIOSDevice || isFakeBottomBarCreated) return;
  
  // 标记已创建，避免重复创建
  isFakeBottomBarCreated = true;
  
  // 不再添加可见的元素，改为使用透明元素，避免闪烁
  const fakeBar = document.createElement('div');
  fakeBar.className = 'ios-fake-bottom-bar';
  fakeBar.style.cssText = `
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: 1px;
    background-color: transparent;
    z-index: 999999;
    padding-bottom: env(safe-area-inset-bottom);
  `;
  
  document.body.appendChild(fakeBar);
  
  // 短暂延迟后移除
  setTimeout(() => {
    if (document.body.contains(fakeBar)) {
      document.body.removeChild(fakeBar);
    }
    isFakeBottomBarCreated = false;
  }, 300);
}

/**
 * 尝试进入全屏模式
 * 注意：由于浏览器安全限制，只能在用户交互事件处理函数中调用
 * @returns {boolean} 是否成功进入全屏模式
 */
export const enterFullscreen = () => {
  try {
    // 尝试使用标准全屏API（这在iOS Safari上通常不起作用，但在其他设备上可能有效）
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen();
      return true;
    } else if (document.documentElement.webkitRequestFullscreen) {
      document.documentElement.webkitRequestFullscreen();
      return true;
    }
  } catch (error) {
    console.error('进入全屏模式失败:', error);
  }
  
  // 如果是iOS设备但不支持标准全屏API，设置强制全屏标记
  if (isIOSDevice && !isInFullscreenMode()) {
    setForceFullscreen(true);
    applyFullscreenStyles();
    return true;
  }
  
  return false;
};

/**
 * 进入iOS特别优化的全屏模式（登录后专用）
 */
export const enterIOSFullscreen = () => {
  // 设置强制全屏标志
  setForceFullscreen(true);
  
  // 立即应用全屏样式
  applyFullscreenStyles();
  
  // 特别处理iOS设备
  if (isIOSDevice) {
    // 避免重复应用样式和脚本
    if (isFullscreenHackApplied && document.querySelector('.ios-fullscreen-hack')) {
      // 已经应用过，只刷新一些状态
      hideSafariAddressBar();
      return true;
    }
    
    isFullscreenHackApplied = true;
    
    // 添加用于全屏的类
    document.documentElement.classList.add('ios-fullscreen-hack');
    document.body.classList.add('ios-fullscreen-hack');
    
    // 尝试通过改变视口来强制全屏
    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
      viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, viewport-fit=cover, user-scalable=no');
    }
    
    // 添加iOS特定全屏类
    document.documentElement.classList.add('ios-fullscreen');
    document.body.classList.add('ios-fullscreen');
    
    // 尝试使用CSS和JavaScript技巧来"欺骗"Safari认为这是一个全屏应用
    document.documentElement.style.height = '100%';
    document.body.style.height = '100%';
    document.documentElement.style.position = 'fixed';
    document.body.style.position = 'fixed';
    document.documentElement.style.width = '100%';
    document.body.style.width = '100%';
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    
    // 设置颜色与应用背景相同
    document.documentElement.style.backgroundColor = '#f7f8fa';
    document.body.style.backgroundColor = '#f7f8fa';
    
    // 设置全屏样式
    if (!document.getElementById('ios-fullscreen-style')) {
      const style = document.createElement('style');
      style.id = 'ios-fullscreen-style';
      style.textContent = `
        .ios-fullscreen-hack {
          position: fixed !important;
          width: 100% !important;
          height: 100% !important;
          overflow: hidden !important;
          top: 0 !important;
          left: 0 !important;
          z-index: 2147483647 !important;
          background-color: #f7f8fa !important;
        }
        
        body.ios-fullscreen-hack {
          background-color: #f7f8fa !important;
        }
        
        .ios-fullscreen-hack #app {
          height: 100% !important;
          overflow: auto !important;
          -webkit-overflow-scrolling: touch !important;
        }
        
        /* 防止弹性滚动 */
        html, body {
          overscroll-behavior-y: none !important;
        }
        
        /* 隐藏Safari工具栏的相关元素 */
        .toolbar-hiding-element {
          position: fixed;
          height: 12px;
          bottom: 0;
          left: 0;
          right: 0;
          z-index: 2147483647;
          background: transparent;
        }
      `;
      document.head.appendChild(style);
    }
    
    // 阻止弹性滚动
    preventElasticScrolling();
    
    // 隐藏地址栏
    hideSafariAddressBar();
    
    // 创建假的底部导航栏
    createFakeBottomBar();
    
    // 添加全屏工具栏隐藏元素
    const toolbarHider = document.createElement('div');
    toolbarHider.className = 'toolbar-hiding-element';
    document.body.appendChild(toolbarHider);
    
    // 添加滚动事件来保持全屏状态
    window.addEventListener('scroll', () => {
      window.scrollTo(0, 0);
    });
    
    // 只在尚未设置的情况下设置定期刷新
    if (!window._iosFullscreenInterval && document.visibilityState === 'visible') {
      // 定期尝试隐藏地址栏，减少频率
      window._iosFullscreenInterval = setInterval(() => {
        if (document.visibilityState === 'visible') {
          hideSafariAddressBar();
        }
      }, 5000); // 每5秒刷新一次
      
      // 30秒后清除定时器
      setTimeout(() => {
        if (window._iosFullscreenInterval) {
          clearInterval(window._iosFullscreenInterval);
          window._iosFullscreenInterval = null;
        }
      }, 30000);
    }
    
    return true;
  }
  
  return false;
};

/**
 * 应用全屏模式的CSS样式
 */
export const applyFullscreenStyles = () => {
  // 设置HTML和body为100%高度
  document.documentElement.style.height = '100%';
  document.body.style.height = '100%';
  
  // 消除边距和滚动条
  document.body.style.margin = '0';
  document.body.style.padding = '0';
  
  // 应用全屏模式的类
  document.documentElement.classList.add('fullscreen-mode');
  document.body.classList.add('fullscreen-mode');
  
  // 对iOS设备特别处理
  if (isIOSDevice) {
    // 防止Safari页面滚动
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.overflow = 'hidden';
    
    // 设置视口
    const viewport = document.querySelector("meta[name=viewport]");
    if (viewport) {
      viewport.setAttribute("content", "width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, viewport-fit=cover, user-scalable=no");
    }
    
    // 尝试隐藏地址栏
    setTimeout(() => window.scrollTo(0, 1), 100);
  }
};

// 全屏状态下添加操作栏隐藏元素
export function addToolbarHidingElements() {
  if (!isIOSDevice) return;
  
  // 避免重复添加
  if (document.querySelector('.ios-toolbar-blocker')) {
    return;
  }
  
  // 添加底部阻挡元素
  const bottomBlocker = document.createElement('div');
  bottomBlocker.className = 'ios-toolbar-blocker';
  bottomBlocker.style.cssText = `
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: 1px;
    background-color: transparent;
    z-index: 999999;
  `;
  document.body.appendChild(bottomBlocker);
}

/**
 * 刷新应用状态以尝试恢复全屏模式
 * 在一些场景如登录后，可以调用此函数尝试重新应用全屏设置
 */
export const refreshFullscreenState = () => {
  // 防止频繁刷新，添加时间检查
  const now = Date.now();
  const lastRefresh = window._lastFullscreenRefresh || 0;
  
  // 如果上次刷新时间小于2秒，则不再刷新
  if (now - lastRefresh < 2000) {
    return;
  }
  
  // 记录当前刷新时间
  window._lastFullscreenRefresh = now;
  
  // 检查是否需要进入全屏模式
  if (isInFullscreenMode()) {
    // 检查是否已登录
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    
    // 如果是iOS并且已登录，使用增强版全屏
    if (isIOSDevice && isLoggedIn) {
      enterIOSFullscreen();
    } else {
      // 进入普通全屏状态
      applyFullscreenStyles();
    }
  }
};

/**
 * 初始化全屏
 */
export function initFullscreen() {
  // 检查是否是从主屏幕启动
  const isStandalone = window.navigator.standalone === true;
  
  // 如果是iOS并且已登录或者从主屏幕启动，则应用全屏
  if (isIOSDevice && (localStorage.getItem('isLoggedIn') === 'true' || isStandalone)) {
    // 强制设置全屏标记
    localStorage.setItem('forceFullscreen', 'true');
    
    // 应用iOS全屏技巧
    enterIOSFullscreen();
    
    // 添加工具栏隐藏元素
    addToolbarHidingElements();
    
    // 隐藏地址栏
    setTimeout(hideSafariAddressBar, 300);
    setTimeout(hideSafariAddressBar, 1000);
    
    // 仅在尚未设置的情况下添加监听器
    if (!window._iosFullscreenListenersAdded) {
      window._iosFullscreenListenersAdded = true;
      
      // 使用防抖函数处理事件
      const debouncedHideAddressBar = (() => {
        let timer;
        return () => {
          clearTimeout(timer);
          timer = setTimeout(() => {
            if (document.visibilityState === 'visible') {
              hideSafariAddressBar();
            }
          }, 300);
        };
      })();
      
      // 添加监听
      window.addEventListener('orientationchange', debouncedHideAddressBar);
      window.addEventListener('resize', debouncedHideAddressBar);
      
      // 添加自动滚动到顶部的处理
      window.addEventListener('scroll', function() {
        if (window.scrollY > 0) {
          clearTimeout(window._scrollToTopTimer);
          window._scrollToTopTimer = setTimeout(function() {
            window.scrollTo(0, 0);
          }, 300);
        }
      });
    }
    
    return true;
  }
  
  return false;
}

// 立即执行初始化，但只在文档可见时
if (isIOSDevice && document.visibilityState === 'visible') {
  // 页面加载时执行
  window.addEventListener('DOMContentLoaded', () => {
    if (document.visibilityState === 'visible') {
      initFullscreen();
    }
  });
}