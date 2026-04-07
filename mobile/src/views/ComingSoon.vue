<!--
/**
 * ComingSoon.vue
 * @description 功能开发中占位页面 - Glassmorphism 风格
 * @date 2026-03-23
 * @version 2.0.0
 */
-->
<template>
  <div class="coming-soon-page">
    <!-- 背景光斑效果 -->
    <div class="bg-blobs">
      <div class="blob blob-purple"></div>
      <div class="blob blob-pink"></div>
      <div class="blob blob-blue"></div>
    </div>

    <!-- 顶部导航栏 -->
    <header class="page-header">
      <button class="header-btn" @click="onBack">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <h1 class="header-title">{{ pageTitle }}</h1>
      <div class="header-spacer"></div>
    </header>

    <!-- 内容区域 -->
    <div class="page-content">
      <div class="coming-soon-card glass-panel">
        <!-- 图标 -->
        <div class="icon-wrapper">
          <svg class="icon-main" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>

        <!-- 标题和描述 -->
        <h2 class="title">功能开发中</h2>
        <p class="description">{{ pageTitle }} 正在紧张开发中，敬请期待</p>

        <!-- 进度指示 -->
        <div class="progress-bar">
          <div class="progress-track">
            <div class="progress-fill"></div>
          </div>
          <span class="progress-text">开发中...</span>
        </div>

        <!-- 返回按钮 -->
        <button class="back-button" @click="onBack">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>返回上一页</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();

const pageTitle = computed(() => {
  return route.meta.title || '功能页';
});

const onBack = () => {
  router.back();
};
</script>

<style lang="scss" scoped>
.coming-soon-page {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  background: var(--bg-primary, #0f172a);
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
  opacity: 0.15;
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
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(30px, -50px) scale(1.1); }
  66% { transform: translate(-20px, 20px) scale(0.9); }
}

/* 顶部导航栏 */
.page-header {
  position: relative;
  z-index: 2;
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
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-primary, #e2e8f0);
  cursor: pointer;
  transition: all 0.2s ease;
}

.header-btn:active {
  transform: scale(0.95);
  background: rgba(255, 255, 255, 0.1);
}

.header-title {
  flex: 1;
  text-align: center;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary, #e2e8f0);
}

.header-spacer {
  width: 2.5rem;
}

/* 内容区域 */
.page-content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  position: relative;
  z-index: 1;
}

/* 卡片 */
.coming-soon-card {
  width: 100%;
  max-width: 320px;
  padding: 2.5rem 2rem;
  border-radius: 1.5rem;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 1.25rem;
  animation: fadeInUp 0.5s ease-out;
}

/* 图标 */
.icon-wrapper {
  width: 5rem;
  height: 5rem;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(168, 85, 247, 0.2), rgba(236, 72, 153, 0.2));
  border: 1px solid rgba(168, 85, 247, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: pulse 3s infinite ease-in-out;
}

.icon-main {
  width: 2.5rem;
  height: 2.5rem;
  color: #c084fc;
}

/* 文字 */
.title {
  font-size: 1.375rem;
  font-weight: 700;
  color: var(--text-primary, #e2e8f0);
  margin: 0;
}

.description {
  font-size: 0.875rem;
  color: var(--text-secondary, #94a3b8);
  line-height: 1.5;
  margin: 0;
}

/* 进度条 */
.progress-bar {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.progress-track {
  width: 100%;
  height: 4px;
  border-radius: 2px;
  background: rgba(255, 255, 255, 0.1);
  overflow: hidden;
}

.progress-fill {
  width: 60%;
  height: 100%;
  border-radius: 2px;
  background: linear-gradient(90deg, #a855f7, #ec4899);
  animation: progressShimmer 2s infinite ease-in-out;
}

.progress-text {
  font-size: 0.75rem;
  color: var(--text-secondary, #94a3b8);
}

/* 返回按钮 */
.back-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 0.75rem;
  background: rgba(168, 85, 247, 0.15);
  border: 1px solid rgba(168, 85, 247, 0.3);
  color: #c084fc;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 0.5rem;
}

.back-button:active {
  transform: scale(0.98);
  background: rgba(168, 85, 247, 0.25);
}

/* 动画 */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.05); opacity: 0.8; }
}

@keyframes progressShimmer {
  0% { width: 30%; }
  50% { width: 70%; }
  100% { width: 30%; }
}

/* 工具类 */
.w-5 { width: 1.25rem; height: 1.25rem; }
.w-6 { width: 1.5rem; height: 1.5rem; }
.h-5 { height: 1.25rem; }
.h-6 { height: 1.5rem; }
</style>