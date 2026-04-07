<!--
/**
 * ThemeToggle.vue
 * @description Vue组件文件
  * @date 2025-08-27
 * @version 1.0.0
 */
-->
<template>
  <el-tooltip :content="tooltipText" placement="bottom">
    <el-button
      :icon="themeIcon"
      circle
      @click="toggleTheme"
      :type="themeStore.isDark ? 'warning' : 'primary'"
      size="small"
    />
  </el-tooltip>
</template>

<script setup>
import { computed } from 'vue'
import { useThemeStore } from '../../stores/theme'
import { Sunny, Moon } from '@element-plus/icons-vue'

const themeStore = useThemeStore()

// 主题图标
const themeIcon = computed(() => {
  return themeStore.isDark ? Sunny : Moon
})

// 提示文本
const tooltipText = computed(() => {
  return themeStore.isDark ? '切换到浅色主题' : '切换到深色主题'
})

// 切换主题
const toggleTheme = () => {
  themeStore.toggleTheme()
}
</script>

<style scoped>
.el-button {
  transition: all 0.3s ease;
}
</style>
