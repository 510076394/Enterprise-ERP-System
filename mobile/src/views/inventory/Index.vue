<!--
/**
 * Index.vue - 库存管理
 * @description 库存管理页面 - Glassmorphism 风格
 * @date 2025-12-27
 * @version 2.0.0
 */
-->
<template>
  <GlassListPage
    title="库存管理"
    :show-back="true"
    :show-add="true"
    :show-search="true"
    search-placeholder="SKU 或 名称"
    v-model:search-value="searchValue"
    :show-filter="true"
    :tags="tags"
    v-model:active-tag="activeTag"
    :stats="statsData"
    @back="goBack"
    @add="handleAdd"
    @filter="handleFilter"
  >
    <!-- 商品列表 -->
    <div class="inventory-list">
      <p class="list-title">商品列表</p>

      <!-- 列表项 -->
      <GlassListItem
        v-for="item in filteredItems"
        :key="item.id"
        :title="item.name"
        :subtitle="`SKU: ${item.sku}`"
        :emoji="item.emoji"
        :show-more="true"
        :clickable="true"
        :show-progress="true"
        :progress-text="`库存: ${item.quantity} ${item.unit}`"
        :progress-status="item.stockLevelText"
        :progress-value="item.stockPercentage"
        :progress-level="item.stockLevel"
        :alert="item.stockLevel === 'low'"
        @click="handleItemClick(item)"
        @more="handleItemMore(item)"
      />
    </div>
  </GlassListPage>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { GlassListPage, GlassListItem } from '@/components/glass'
import { inventoryApi } from '@/services/api'
import { showToast } from 'vant'

const router = useRouter()

// 搜索值
const searchValue = ref('')

// 当前激活的标签
const activeTag = ref('all')

// 加载状态
const loading = ref(false)

// 标签列表
const tags = ref([
  { label: '全部商品', value: 'all' },
  { label: '低库存预警', value: 'low' }
])

// 统计数据
const statistics = ref({
  totalMaterials: 0,
  lowStock: 0
})

// 统计数据（用于 GlassListPage）
const statsData = computed(() => [
  {
    label: '总 SKU',
    value: statistics.value.totalMaterials.toString(),
    icon: 'cube',
    iconClass: 'bg-blue'
  },
  {
    label: '需补货',
    value: `${statistics.value.lowStock} 项`,
    icon: 'cube',
    iconClass: 'bg-red'
  }
])

// 库存列表
const inventoryItems = ref([])

// 获取库存状态
const getStockStatus = (quantity, minStock) => {
  if (!quantity || quantity === 0) {
    return { level: 'low', text: '无库存', percentage: 0 }
  }
  if (minStock && quantity <= minStock) {
    return { level: 'low', text: '急需补货', percentage: Math.min((quantity / minStock) * 100, 100) }
  }
  if (minStock && quantity <= minStock * 2) {
    return { level: 'medium', text: '正常', percentage: Math.min((quantity / (minStock * 3)) * 100, 100) }
  }
  return { level: 'good', text: '充足', percentage: 85 }
}

// 获取物料图标
const getMaterialEmoji = (materialName) => {
  const name = materialName.toLowerCase()
  if (name.includes('电脑') || name.includes('笔记本') || name.includes('macbook')) return '💻'
  if (name.includes('手机') || name.includes('iphone') || name.includes('phone')) return '📱'
  if (name.includes('耳机') || name.includes('airpods')) return '🎧'
  if (name.includes('键盘') || name.includes('keyboard')) return '⌨️'
  if (name.includes('鼠标') || name.includes('mouse')) return '🖱️'
  if (name.includes('转接') || name.includes('线') || name.includes('cable')) return '🔌'
  if (name.includes('充电') || name.includes('电源')) return '🔋'
  if (name.includes('包') || name.includes('bag')) return '🎒'
  return '📦'
}

// 过滤后的列表
const filteredItems = computed(() => {
  let items = inventoryItems.value

  // 按标签筛选
  if (activeTag.value !== 'all') {
    if (activeTag.value === 'low') {
      items = items.filter(item => item.stockLevel === 'low')
    }
  }

  // 按搜索值筛选
  if (searchValue.value) {
    const search = searchValue.value.toLowerCase()
    items = items.filter(item =>
      item.name.toLowerCase().includes(search) ||
      item.sku.toLowerCase().includes(search)
    )
  }

  return items
})

// 加载库存列表
const loadStockList = async () => {
  if (loading.value) return

  loading.value = true
  try {
    const params = {
      page: 1,
      limit: 100,
      search: searchValue.value || undefined,
      show_all: true
    }

    const response = await inventoryApi.getInventoryStock(params)

    if (response.data && Array.isArray(response.data)) {
      // 处理数据
      inventoryItems.value = response.data.map(item => {
        const status = getStockStatus(item.quantity, item.min_stock)
        return {
          id: item.id,
          name: item.material_name,
          sku: item.material_code,
          emoji: getMaterialEmoji(item.material_name),
          quantity: item.quantity || 0,
          unit: item.unit_name || '个',
          stockPercentage: status.percentage,
          stockLevel: status.level,
          stockLevelText: status.text,
          minStock: item.min_stock,
          maxStock: item.max_stock,
          locationName: item.location_name
        }
      })

      // 更新统计数据
      statistics.value.totalMaterials = inventoryItems.value.length
      statistics.value.lowStock = inventoryItems.value.filter(item => item.stockLevel === 'low').length
    } else if (response.list && Array.isArray(response.list)) {
      // 处理分页数据
      inventoryItems.value = response.list.map(item => {
        const status = getStockStatus(item.quantity, item.min_stock)
        return {
          id: item.id,
          name: item.material_name,
          sku: item.material_code,
          emoji: getMaterialEmoji(item.material_name),
          quantity: item.quantity || 0,
          unit: item.unit_name || '个',
          stockPercentage: status.percentage,
          stockLevel: status.level,
          stockLevelText: status.text,
          minStock: item.min_stock,
          maxStock: item.max_stock,
          locationName: item.location_name
        }
      })

      statistics.value.totalMaterials = response.total || inventoryItems.value.length
      statistics.value.lowStock = inventoryItems.value.filter(item => item.stockLevel === 'low').length
    }
  } catch (error) {
    console.error('加载库存列表失败:', error)
    showToast('加载失败，请重试')
  } finally {
    loading.value = false
  }
}

// 方法
const goBack = () => {
  router.back()
}

const handleAdd = () => {
  router.push('/inventory/inbound')
}

const handleFilter = () => {
  console.log('打开筛选')
}

const handleItemClick = (item) => {
  router.push(`/inventory/stock/${item.id}`)
}

const handleItemMore = (item) => {
  console.log('更多操作:', item)
}

// 页面加载时获取数据
onMounted(() => {
  loadStockList()
})
</script>

<style lang="scss" scoped>
/* 商品列表 */
.inventory-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.list-title {
  font-size: 0.75rem;
  font-weight: 600;
  color: rgb(148, 163, 184);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
</style>

