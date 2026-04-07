/**
 * index.js
 * @description 应用程序入口文件
  * @date 2025-08-27
 * @version 1.0.0
 */

import { createI18n } from 'vue-i18n'
import zhCN from './zhCN'
import en from './en'
import ko from './ko'

// 获取浏览器语言
function getBrowserLanguage() {
  const language = navigator.language || navigator.userLanguage
  if (language.includes('zh')) {
    return 'zh-CN'
  } else if (language.includes('ko')) {
    return 'ko'
  }
  return 'en'
}

// 从localStorage获取保存的语言，如果没有则使用浏览器语言
const savedLanguage = localStorage.getItem('language') || getBrowserLanguage()

const i18n = createI18n({
  legacy: false, // 使用 Composition API 模式
  locale: savedLanguage,
  fallbackLocale: 'zh-CN',
  messages: {
    'zh-CN': zhCN,
    'en': en,
    'ko': ko
  }
})

export default i18n
