<!--
/**
 * IOSInstallPrompt.vue
 * @description Vue组件文件
  * @date 2025-08-27
 * @version 1.0.0
 */
-->
<template>
  <div class="ios-install-prompt" v-if="showPrompt">
    <div class="prompt-content">
      <div class="prompt-header">
        <h3>添加到主屏幕</h3>
        <button class="close-btn" @click="closePrompt">×</button>
      </div>
      <div class="prompt-body">
        <div class="app-info">
          <div class="app-icon"></div>
          <div class="app-name">KACON-ERP</div>
        </div>
        <p class="prompt-desc">将此应用添加到主屏幕，以便快速访问、全屏使用并获得最佳体验：</p>
        <div class="steps">
          <div class="step">
            <span class="step-number">1</span>
            <span>点击底部工具栏中的<span class="icon">
              <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none">
                <path d="M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z"></path>
                <path d="M16,12L10,6"></path>
                <path d="M16,12L10,18"></path>
              </svg>
            </span>分享按钮</span>
          </div>
          <div class="step">
            <span class="step-number">2</span>
            <span>在弹出菜单中滚动查找并点击<span class="highlight">添加到主屏幕</span>选项</span>
          </div>
          <div class="step">
            <span class="step-number">3</span>
            <span>在确认界面中点击右上角的<span class="highlight">添加</span>按钮完成</span>
          </div>
        </div>
        <div class="benefits">
          <div class="benefit">✓ 全屏体验，无浏览器界面干扰</div>
          <div class="benefit">✓ 快速启动，一键访问</div>
          <div class="benefit">✓ 更流畅的使用体验</div>
        </div>
        <button class="later-btn" @click="laterPrompt">稍后提醒</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const showPrompt = ref(false);

onMounted(() => {
  // 检查是否为iOS设备或Android设备且不是从主屏幕打开
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  const isAndroid = /Android/.test(navigator.userAgent);
  const isStandalone = window.navigator.standalone === true || 
                       window.matchMedia('(display-mode: standalone)').matches;
  
  if ((isIOS || isAndroid) && !isStandalone) {
    // 检查是否已经显示过提示
    const hasShownPrompt = localStorage.getItem('installPromptShown');
    const lastPromptTime = localStorage.getItem('lastPromptTime');
    const now = Date.now();
    
    // 如果从未显示过提示或者上次提醒是3天前
    if (!hasShownPrompt || (lastPromptTime && now - Number(lastPromptTime) > 3 * 24 * 60 * 60 * 1000)) {
      // 延迟显示提示，给用户一些时间熟悉应用
      setTimeout(() => {
        showPrompt.value = true;
      }, 5000);
    }
  }
});

const closePrompt = () => {
  showPrompt.value = false;
  // 记录已经显示过提示
  localStorage.setItem('installPromptShown', 'true');
  localStorage.setItem('lastPromptTime', Date.now().toString());
};

const laterPrompt = () => {
  showPrompt.value = false;
  // 设置24小时后再次提醒
  localStorage.setItem('lastPromptTime', Date.now().toString());
};
</script>

<style scoped>
.ios-install-prompt {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  z-index: 9999;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0 16px;
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.prompt-content {
  background-color: white;
  border-radius: 12px;
  width: 100%;
  max-width: 320px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.prompt-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: #1989fa;
  color: white;
}

.prompt-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  color: white;
  cursor: pointer;
}

.prompt-body {
  padding: 16px;
}

.app-info {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.app-icon {
  width: 48px;
  height: 48px;
  background-color: #1989fa;
  border-radius: 8px;
  margin-right: 12px;
  position: relative;
  overflow: hidden;
}

.app-icon::after {
  content: 'ERP';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-weight: bold;
  font-size: 16px;
}

.app-name {
  font-size: 18px;
  font-weight: bold;
}

.prompt-desc {
  margin-bottom: 16px;
  color: #333;
  line-height: 1.4;
}

.steps {
  margin-bottom: 16px;
  background-color: #f7f8fa;
  padding: 12px;
  border-radius: 8px;
}

.step {
  display: flex;
  align-items: flex-start;
  margin-bottom: 12px;
}

.step:last-child {
  margin-bottom: 0;
}

.step-number {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 24px;
  height: 24px;
  background-color: #1989fa;
  color: white;
  border-radius: 50%;
  margin-right: 12px;
  flex-shrink: 0;
  font-size: 14px;
}

.icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin: 0 2px;
  background-color: #f2f2f2;
  border-radius: 4px;
  vertical-align: middle;
}

.highlight {
  font-weight: bold;
  color: #1989fa;
}

.benefits {
  margin-bottom: 16px;
  color: #666;
  font-size: 14px;
}

.benefit {
  margin-bottom: 6px;
}

.later-btn {
  background-color: transparent;
  color: #1989fa;
  border: none;
  padding: 8px 12px;
  text-align: center;
  width: 100%;
  font-size: 14px;
  border-radius: 4px;
  cursor: pointer;
}
</style> 