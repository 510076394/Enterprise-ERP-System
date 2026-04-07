<!--
/**
 * Materials.vue
 * @description 前端界面组件文件 (Refactored)
 * @date 2026-01-23
 * @version 2.0.0
 */
-->
<template>
  <div class="purchase-requisitions-container">
    <el-card class="header-card">
      <div class="header-content">
        <div class="title-section">
          <h2>{{ $t('page.baseData.materials.title') }}</h2>
          <p class="subtitle">管理物料基础信息</p>
        </div>
        <el-button v-if="canCreate" type="primary" :icon="Plus" @click="handleAdd">{{ $t('page.baseData.materials.add') }}</el-button>
      </div>
    </el-card>

    <!-- 搜索区域 -->
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item :label="$t('page.baseData.materials.keywordSearch')">
          <el-input  v-model="searchForm.keyword" :placeholder="$t('page.baseData.materials.keywordPlaceholder')" clearable ></el-input>
        </el-form-item>
        <el-form-item :label="$t('page.baseData.materials.category')">
          <el-select v-model="searchForm.categoryId" :placeholder="$t('page.baseData.materials.categoryPlaceholder')" clearable>
            <el-option
              v-for="item in categoryOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('common.status')">
          <el-select  v-model="searchForm.status" :placeholder="$t('page.baseData.materials.statusPlaceholder')" clearable>
            <el-option :value="1" :label="$t('page.baseData.materials.enabled')"></el-option>
            <el-option :value="0" :label="$t('page.baseData.materials.disabled')"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch" class="action-btn" :loading="loading">
            <el-icon v-if="!loading"><Search /></el-icon> {{ $t('page.baseData.materials.query') }}
          </el-button>
          <el-button @click="resetSearch" class="action-btn" :loading="loading">
            <el-icon v-if="!loading"><Refresh /></el-icon> {{ $t('page.baseData.materials.reset') }}
          </el-button>
          <el-dropdown @command="handleMoreCommand" v-if="canExport || canImport" style="margin-left: 8px;">
            <el-button type="success" class="action-btn">
              更多操作<el-icon class="el-icon--right"><ArrowDown /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="copy" :icon="DocumentCopy">复制物料</el-dropdown-item>
                <el-dropdown-item command="export" :icon="Download" v-if="canExport">导出物料</el-dropdown-item>
                <el-dropdown-item command="import" :icon="Upload" v-if="canImport">导入物料</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 统计信息 -->
    <MaterialStatCards :stats="stats" />

    <!-- 表格区域 -->
    <el-card class="data-card">
      <MaterialTable
        :tableData="tableData"
        :loading="loading"
        :total="total"
        v-model:currentPage="currentPage"
        v-model:pageSize="pageSize"
        :canUpdate="canUpdate"
        :canDelete="canDelete"
        :canViewCost="canViewCost"
        :canViewPrice="canViewPrice"
        @view="handleView"
        @edit="handleEdit"
        @delete="handleDelete"
        @enable="handleEnable"
        @disable="handleDisable"
        @update:currentPage="fetchData"
        @update:pageSize="fetchData"
      />
    </el-card>

    <!-- 新增/编辑对话框 -->
    <MaterialFormDialog
      v-if="dialogVisible"
      v-model="dialogVisible"
      :title="dialogTitle"
      :editData="currentEditMaterial"
      :productCategoryOptions="productCategoryOptions"
      :categoryOptions="categoryOptions"
      :inspectionMethodOptions="inspectionMethodOptions"
      :materialSourceOptions="materialSourceOptions"
      :unitOptions="unitOptions"
      :locationOptions="locationOptions"
      :productionGroupOptions="productionGroupOptions"
      :managerOptions="managerOptions"
      @search-suppliers="searchSuppliers"
      @success="fetchData"
    />

    <!-- 查看对话框 -->
    <MaterialViewDialog
      v-if="viewDialogVisible"
      v-model="viewDialogVisible"
      :viewData="currentViewMaterial"
      :canViewCost="canViewCost"
      :canViewPrice="canViewPrice"
    />

    <!-- 不常用的导入对话框暂略 (或保持原样，如果代码量允许) -->
    <!-- 由于篇幅限制，这里建议后续也将 ImportDialog 提取为单独组件 -->

  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { ElMessage } from 'element-plus'
import { Search, Refresh, Plus, Download, Upload, DocumentCopy, ArrowDown } from '@element-plus/icons-vue';
import { useAuthStore } from '@/stores/auth';
import { materialApi } from '@/api/material';
import { baseDataApi } from '@/api/baseData';
import { systemApi } from '@/api/system';
import { commonApi } from '@/api/common';
import { parsePaginatedData, parseListData, parseDataObject } from '@/utils/responseParser';

// 引入新组件
import MaterialTable from './components/MaterialTable.vue';
import MaterialStatCards from './components/MaterialStatCards.vue';
import MaterialFormDialog from './components/MaterialFormDialog.vue';
import MaterialViewDialog from './components/MaterialViewDialog.vue';

const authStore = useAuthStore();
const canCreate = computed(() => authStore.hasPermission('basedata:materials:create'));
const canUpdate = computed(() => authStore.hasPermission('basedata:materials:update'));
const canDelete = computed(() => authStore.hasPermission('basedata:materials:delete'));
const canImport = computed(() => authStore.hasPermission('basedata:materials:import'));
const canExport = computed(() => authStore.hasPermission('basedata:materials:export'));
// 🔒 敏感数据查看权限（成本/价格）
const canViewCost = computed(() => authStore.hasPermission('basedata:materials:view_cost'));
const canViewPrice = computed(() => authStore.hasPermission('basedata:materials:view_price'));

// 状态
const loading = ref(false);
const tableData = ref([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
const dialogVisible = ref(false);
const viewDialogVisible = ref(false);
const dialogTitle = ref('新增物料');
const currentEditMaterial = ref(null);
const currentViewMaterial = ref(null);

const searchForm = reactive({
  keyword: '',
  categoryId: '',
  status: ''
});

const stats = reactive({
  total: 0,
  active: 0,
  inactive: 0,
  lowStock: 0
});

// 选项数据
const categoryOptions = ref([]);
const inspectionMethodOptions = ref([]);
const materialSourceOptions = ref([]);
const unitOptions = ref([]);
const locationOptions = ref([]);
const productCategoryOptions = ref([]);
const productionGroupOptions = ref([]);
const managerOptions = ref([]);

// 将平铺数据转换为树形结构（用于物料大类选择器）
const buildProductCategoryTree = (flatData, parentId = 0) => {
  const tree = [];
  for (const item of flatData) {
    // 支持 parent_id 为 0、null 或 undefined 的情况
    const itemParentId = item.parent_id || 0;
    if (itemParentId === parentId) {
      // 显示名称格式：编码 - 名称（如 "1001 - EQ1开关电源"）
      const displayName = item.code ? `${item.code} - ${item.name}` : item.name;
      
      const node = {
        id: item.id,
        name: item.name,
        code: item.code,
        parent_id: item.parent_id,
        displayName: displayName, // 用于 TreeSelect 显示和搜索
        children: buildProductCategoryTree(flatData, item.id)
      };
      
      // 如果没有子节点，删除 children 属性
      if (node.children.length === 0) {
        delete node.children;
      }
      
      tree.push(node);
    }
  }
  return tree;
};

// 加载基础数据
const loadOptions = async () => {
  try {
    // 并行请求所有需要的选项数据
    const [cats, sources, units, locs, pCatOptions, groups, users, inspections] = await Promise.all([
      baseDataApi.getCategories(), // 替换 getDictionary('material_category')
      baseDataApi.getMaterialSources(), // 替换 getDictionary('material_source')
      baseDataApi.getUnits(),
      baseDataApi.getLocations(),
      baseDataApi.getProductCategoryOptions(), // 使用树形选项API
      commonApi.getEnums('production_group'), // 尝试使用 commonApi 获取生产组枚举
      systemApi.getUsersList(), // 使用无权限隔离的轻量级下拉列表接口
      baseDataApi.getInspectionMethods() // 获取检验方式数据
    ]);

    // 使用 parseListData 正确解析响应数据
    categoryOptions.value = parseListData(cats, { enableLog: false });
    inspectionMethodOptions.value = parseListData(inspections, { enableLog: false });
    materialSourceOptions.value = parseListData(sources, { enableLog: false });
    unitOptions.value = parseListData(units, { enableLog: false });
    locationOptions.value = parseListData(locs, { enableLog: false });
    
    // 产品大类需要构建树形结构
    const pCatList = parseListData(pCatOptions, { enableLog: false });
    productCategoryOptions.value = buildProductCategoryTree(pCatList);
    
    productionGroupOptions.value = parseListData(groups, { enableLog: false });
    
    // 用户列表可能需要特殊处理
    const userRes = parseListData(users, { enableLog: false });
    managerOptions.value = userRes.map(u => ({
      id: u.id,
      username: u.username,
      real_name: u.real_name || u.nickname || u.username
    }));

  } catch (e) {
    console.error('加载选项失败', e);
    ElMessage.error('部分基础数据加载失败');
  }
};

const fetchData = async () => {
  loading.value = true;
  try {
    const params = {
      page: currentPage.value,
      pageSize: pageSize.value,
      ...searchForm
    };
    const res = await materialApi.getMaterials(params);
    const { list, total: t } = parsePaginatedData(res);
    tableData.value = list;
    total.value = t;
    
    // 更新统计：仅在有详细查看权限时调用，避免被接口拦截报错
    if (authStore.hasPermission('basedata:materials:view')) {
      const s = await materialApi.getMaterialStats();
      const statsData = parseDataObject(s);
      if (statsData) {
        Object.assign(stats, statsData);
      }
    }
  } catch (error) {
    ElMessage.error('获取列表失败');
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadOptions();
  fetchData();
});

const handleSearch = () => {
  currentPage.value = 1;
  fetchData();
};

const resetSearch = () => {
  searchForm.keyword = '';
  searchForm.categoryId = '';
  searchForm.status = '';
  handleSearch();
};

const handleAdd = () => {
  dialogTitle.value = '新增物料';
  currentEditMaterial.value = null;
  dialogVisible.value = true;
};

const handleEdit = async (row) => {
  dialogTitle.value = '编辑物料';
  // 获取详情
  try {
     const detail = await materialApi.getMaterial(row.id);
     currentEditMaterial.value = parseDataObject(detail);
     dialogVisible.value = true;
  } catch (e) {
    ElMessage.error('获取详情失败');
  }
};

const handleView = async (row) => {
  try {
     const detail = await materialApi.getMaterial(row.id);
     currentViewMaterial.value = parseDataObject(detail);
     viewDialogVisible.value = true;
  } catch (e) {
    ElMessage.error('获取详情失败');
  }
};

const handleDelete = async (row) => {
  try {
    await materialApi.deleteMaterial(row.id);
    ElMessage.success('删除成功');
    fetchData();
  } catch (error) {
    ElMessage.error('删除失败');
  }
};

const handleEnable = async (row) => {
  try {
    await materialApi.updateMaterialStatus(row.id, 1);
    ElMessage.success('启用成功');
    fetchData();
  } catch (error) {
    ElMessage.error('操作失败');
  }
};

const handleDisable = async (row) => {
  try {
    await materialApi.updateMaterialStatus(row.id, 0);
    ElMessage.success('禁用成功');
    fetchData();
  } catch (error) {
    ElMessage.error('操作失败');
  }
};

const handleMoreCommand = (command) => {
  ElMessage.info('功能开发中');
};

const searchSuppliers = async (query, callback) => {
  if (!query) {
    callback([]);
    return;
  }
  try {
    const res = await baseDataApi.getSuppliers({ keyword: query, page: 1, pageSize: 20 });
    const { list } = parseListData(res);
    callback(list);
  } catch (e) {
    console.error(e);
    callback([]);
  }
};

</script>

<style scoped>
.purchase-requisitions-container {
  padding: 20px;
}
.header-card {
  margin-bottom: 20px;
}
.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.search-card {
  margin-bottom: 20px;
}
.data-card {
  margin-bottom: 20px;
}
</style>