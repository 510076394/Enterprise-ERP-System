<!--
/**
 * ProcessTemplateMaterialDialog.vue
 * @description 物料选择对话框组件 - 用于工序模板中选择所需物料
 * @date 2026-03-03
 */
-->
<template>
  <el-dialog
    v-model="visible"
    title="选择工序所需物料"
    width="800px"
    @close="handleClose"
  >
    <div class="material-selection">
      <div class="search-bar">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索物料编码或名称"
          clearable
          style="width: 300px; margin-bottom: 16px"
          @input="debouncedSearch"
        />
      </div>

      <div class="material-list">
        <el-table
          :data="materialList"
          v-loading="loadingMaterials"
          height="400px"
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="55" />
          <el-table-column prop="code" label="物料编码" width="120" />
          <el-table-column prop="name" label="物料名称" min-width="150" />
          <el-table-column prop="specs" label="规格型号" min-width="120" />
          <el-table-column prop="unit_name" label="单位" width="80" />
        </el-table>
      </div>
    </div>

    <template #footer>
      <span>
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="confirmSelection">确定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import { baseDataApi } from '@/api/baseData'
import { searchMaterials, mapMaterialData, SEARCH_CONFIG } from '@/utils/searchConfig'

const props = defineProps({
  modelValue: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue', 'confirm'])

const visible = ref(false)
const searchKeyword = ref('')
const selectedMaterials = ref([])
const materialList = ref([])
const loadingMaterials = ref(false)

// 防抖定时器和请求ID
let searchTimeout = null
let currentSearchId = 0

// 同步v-model
watch(() => props.modelValue, (val) => {
  visible.value = val
  if (val) {
    searchKeyword.value = ''
    selectedMaterials.value = []
    materialList.value = []
    debouncedSearch()
  }
})
watch(visible, (val) => { emit('update:modelValue', val) })

// 执行防抖搜索
const debouncedSearch = () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }
  
  // 生成新的请求ID
  const searchId = ++currentSearchId
  
  searchTimeout = setTimeout(async () => {
    loadingMaterials.value = true
    try {
      const results = await searchMaterials(baseDataApi, searchKeyword.value, {
        pageSize: 50 // 表格展示默认获取50条
      })
      
      // 只有当这是最新发起的请求时才更新数据
      if (searchId === currentSearchId) {
        materialList.value = mapMaterialData(results)
      }
    } catch (error) {
      console.error('获取物料数据失败:', error)
      if (searchId === currentSearchId) {
        materialList.value = []
      }
    } finally {
      if (searchId === currentSearchId) {
        loadingMaterials.value = false
      }
    }
  }, SEARCH_CONFIG.debounceTime)
}

const handleSelectionChange = (selection) => {
  selectedMaterials.value = selection
}

const handleClose = () => {
  visible.value = false
}

const confirmSelection = () => {
  emit('confirm', [...selectedMaterials.value])
  visible.value = false
}
</script>
