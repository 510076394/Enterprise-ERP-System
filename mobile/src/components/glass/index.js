/**
 * Glass 组件库导出
 * @description 统一导出所有玻璃拟态组件
 * @date 2025-12-27
 * @version 1.0.0
 */

import GlassCard from './GlassCard.vue'
import GlassButton from './GlassButton.vue'
import GlassInput from './GlassInput.vue'
import GlassPage from './GlassPage.vue'
import GlassListPage from './GlassListPage.vue'
import GlassListItem from './GlassListItem.vue'

// 所有组件
const components = {
  GlassCard,
  GlassButton,
  GlassInput,
  GlassPage,
  GlassListPage,
  GlassListItem
}

/**
 * 安装插件
 * @param {Object} app - Vue 应用实例
 */
const install = (app) => {
  Object.keys(components).forEach(key => {
    app.component(key, components[key])
  })
}

// 导出所有组件
export {
  GlassCard,
  GlassButton,
  GlassInput,
  GlassPage,
  GlassListPage,
  GlassListItem
}

// 默认导出（包含 install 方法）
export default {
  install,
  ...components
}

