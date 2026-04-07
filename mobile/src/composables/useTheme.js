/**
 * 主题管理 Composable
 * @description 提供主题切换和主题变量访问功能
 * @date 2025-12-27
 * @version 1.0.0
 */

import { ref, computed, watch } from 'vue'
import { themes, defaultTheme } from '@/config/themes'

// 全局主题状态
const currentThemeName = ref(localStorage.getItem('theme') || 'glassmorphism')
const currentTheme = ref(themes[currentThemeName.value] || defaultTheme)

/**
 * 应用主题到 CSS 变量
 */
const applyTheme = (theme) => {
  const root = document.documentElement
  
  // 应用颜色变量
  Object.entries(theme.colors).forEach(([key, value]) => {
    root.style.setProperty(`--color-${toKebabCase(key)}`, value)
  })
  
  // 应用效果变量
  Object.entries(theme.effects).forEach(([key, value]) => {
    root.style.setProperty(`--effect-${toKebabCase(key)}`, value)
  })
  
  // 应用间距变量
  Object.entries(theme.spacing).forEach(([key, value]) => {
    root.style.setProperty(`--spacing-${key}`, value)
  })
  
  // 应用圆角变量
  Object.entries(theme.borderRadius).forEach(([key, value]) => {
    root.style.setProperty(`--radius-${key}`, value)
  })
}

/**
 * 驼峰转短横线
 */
const toKebabCase = (str) => {
  return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()
}

/**
 * 主题管理 Hook
 */
export const useTheme = () => {
  // 切换主题
  const setTheme = (themeName) => {
    if (themes[themeName]) {
      currentThemeName.value = themeName
      currentTheme.value = themes[themeName]
      localStorage.setItem('theme', themeName)
      applyTheme(currentTheme.value)
    }
  }
  
  // 获取当前主题
  const theme = computed(() => currentTheme.value)
  
  // 获取所有可用主题
  const availableThemes = computed(() => {
    return Object.values(themes).map(t => ({
      name: t.name,
      label: t.label
    }))
  })
  
  // 监听主题变化
  watch(currentTheme, (newTheme) => {
    applyTheme(newTheme)
  }, { immediate: true })
  
  return {
    theme,
    currentThemeName,
    availableThemes,
    setTheme
  }
}

// 初始化主题
export const initTheme = () => {
  const savedTheme = localStorage.getItem('theme') || 'glassmorphism'
  const theme = themes[savedTheme] || defaultTheme
  applyTheme(theme)
}

