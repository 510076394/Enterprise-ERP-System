/**
 * 用户体验优化组合式函数
 */

import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import { performance } from '@/utils/performance';
import { cache } from '@/utils/cache';

/**
 * 页面加载优化
 */
export function usePageOptimization() {
  const loading = ref(true);
  const loadingText = ref('加载中...');
  const progress = ref(0);

  // 模拟加载进度
  const simulateProgress = () => {
    const interval = setInterval(() => {
      progress.value += Math.random() * 30;
      if (progress.value >= 90) {
        progress.value = 90;
        clearInterval(interval);
      }
    }, 200);

    return interval;
  };

  // 开始加载
  const startLoading = (text = '加载中...') => {
    loading.value = true;
    loadingText.value = text;
    progress.value = 0;
    
    performance.markStart('page-load');
    return simulateProgress();
  };

  // 完成加载
  const finishLoading = () => {
    progress.value = 100;
    setTimeout(() => {
      loading.value = false;
      performance.markEnd('page-load');
    }, 300);
  };

  return {
    loading,
    loadingText,
    progress,
    startLoading,
    finishLoading
  };
}

/**
 * 图片懒加载优化
 */
export function useLazyLoad() {
  const observer = ref(null);
  const loadedImages = new Set();

  const createObserver = () => {
    if ('IntersectionObserver' in window) {
      observer.value = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            const src = img.dataset.src;
            
            if (src && !loadedImages.has(src)) {
              img.src = src;
              img.classList.add('loaded');
              loadedImages.add(src);
              observer.value.unobserve(img);
            }
          }
        });
      }, {
        rootMargin: '50px'
      });
    }
  };

  const observeImage = (element) => {
    if (observer.value && element) {
      observer.value.observe(element);
    }
  };

  const unobserveImage = (element) => {
    if (observer.value && element) {
      observer.value.unobserve(element);
    }
  };

  onMounted(() => {
    createObserver();
  });

  onUnmounted(() => {
    if (observer.value) {
      observer.value.disconnect();
    }
  });

  return {
    observeImage,
    unobserveImage
  };
}

/**
 * 防抖优化
 */
export function useDebounce(fn, delay = 300) {
  let timer = null;

  const debouncedFn = (...args) => {
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };

  const cancel = () => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  };

  onUnmounted(() => {
    cancel();
  });

  return {
    debouncedFn,
    cancel
  };
}

/**
 * 节流优化
 */
export function useThrottle(fn, delay = 300) {
  let timer = null;
  let lastExecTime = 0;

  const throttledFn = (...args) => {
    const currentTime = Date.now();
    
    if (currentTime - lastExecTime > delay) {
      fn.apply(this, args);
      lastExecTime = currentTime;
    } else if (!timer) {
      timer = setTimeout(() => {
        fn.apply(this, args);
        lastExecTime = Date.now();
        timer = null;
      }, delay - (currentTime - lastExecTime));
    }
  };

  const cancel = () => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  };

  onUnmounted(() => {
    cancel();
  });

  return {
    throttledFn,
    cancel
  };
}

/**
 * 虚拟滚动优化
 */
export function useVirtualScroll(options = {}) {
  const {
    itemHeight = 50,
    containerHeight = 300,
    buffer = 5
  } = options;

  const scrollTop = ref(0);
  const containerRef = ref(null);

  const visibleCount = Math.ceil(containerHeight / itemHeight) + buffer * 2;
  const startIndex = ref(0);
  const endIndex = ref(visibleCount);

  const updateVisibleRange = () => {
    const start = Math.floor(scrollTop.value / itemHeight);
    startIndex.value = Math.max(0, start - buffer);
    endIndex.value = Math.min(startIndex.value + visibleCount, options.total || 0);
  };

  const onScroll = (event) => {
    scrollTop.value = event.target.scrollTop;
    updateVisibleRange();
  };

  const getItemStyle = (index) => {
    return {
      position: 'absolute',
      top: `${index * itemHeight}px`,
      height: `${itemHeight}px`,
      width: '100%'
    };
  };

  const getContainerStyle = (total) => {
    return {
      height: `${total * itemHeight}px`,
      position: 'relative'
    };
  };

  return {
    containerRef,
    startIndex,
    endIndex,
    onScroll,
    getItemStyle,
    getContainerStyle
  };
}

/**
 * 缓存优化
 */
export function useCacheOptimization() {
  // 缓存API响应
  const cacheApiResponse = (key, data, ttl = 5 * 60 * 1000) => {
    cache.set(`api_${key}`, data, { ttl, type: 'storage' });
  };

  // 获取缓存的API响应
  const getCachedApiResponse = (key) => {
    return cache.get(`api_${key}`);
  };

  // 缓存页面状态
  const cachePageState = (route, state) => {
    cache.set(`page_${route}`, state, { type: 'session' });
  };

  // 获取缓存的页面状态
  const getCachedPageState = (route) => {
    return cache.get(`page_${route}`);
  };

  // 预加载数据
  const preloadData = async (key, fetchFn) => {
    const cached = getCachedApiResponse(key);
    if (cached) {
      return cached;
    }

    try {
      const data = await fetchFn();
      cacheApiResponse(key, data);
      return data;
    } catch (error) {
      console.error('Preload data failed:', error);
      return null;
    }
  };

  return {
    cacheApiResponse,
    getCachedApiResponse,
    cachePageState,
    getCachedPageState,
    preloadData
  };
}

/**
 * 触摸优化
 */
export function useTouchOptimization() {
  const touchStartTime = ref(0);
  const touchStartPos = ref({ x: 0, y: 0 });

  // 快速点击检测
  const onTouchStart = (event) => {
    touchStartTime.value = Date.now();
    const touch = event.touches[0];
    touchStartPos.value = {
      x: touch.clientX,
      y: touch.clientY
    };
  };

  const onTouchEnd = (event, callback) => {
    const touchEndTime = Date.now();
    const touchDuration = touchEndTime - touchStartTime.value;
    
    const touch = event.changedTouches[0];
    const touchEndPos = {
      x: touch.clientX,
      y: touch.clientY
    };

    const distance = Math.sqrt(
      Math.pow(touchEndPos.x - touchStartPos.value.x, 2) +
      Math.pow(touchEndPos.y - touchStartPos.value.y, 2)
    );

    // 快速点击且移动距离小于10px
    if (touchDuration < 300 && distance < 10) {
      callback && callback();
    }
  };

  // 防止双击缩放
  const preventDoubleClickZoom = (event) => {
    if (event.touches.length > 1) {
      event.preventDefault();
    }
  };

  return {
    onTouchStart,
    onTouchEnd,
    preventDoubleClickZoom
  };
}

/**
 * 性能监控
 */
export function usePerformanceMonitoring() {
  const startTiming = (name) => {
    performance.markStart(name);
  };

  const endTiming = (name) => {
    return performance.markEnd(name);
  };

  const recordInteraction = (type, startTime) => {
    const duration = Date.now() - startTime;
    performance.recordInteraction(type, duration);
  };

  const getPerformanceReport = () => {
    return performance.getReport();
  };

  return {
    startTiming,
    endTiming,
    recordInteraction,
    getPerformanceReport
  };
}
