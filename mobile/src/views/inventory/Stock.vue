<!--
/**
 * Stock.vue
 * @description 移动端应用文件
  * @date 2025-08-27
 * @version 1.0.0
 */
-->
<template>
  <div class="page-container">
    <NavBar
      title="库存查询"
      left-arrow
      @click-left="onClickLeft"
    />
    
    <div class="content-container">
      <!-- 搜索 -->
      <Search
        v-model="searchValue"
        placeholder="输入物料名称或编码搜索"
        @search="onSearch"
        shape="round"
        show-action
      />
      
      <!-- 筛选区域 -->
      <div class="filter-section">
        <div class="filter-row">
          <div class="filter-label">仓库/库位：</div>
          <div class="filter-value">
            <Picker
              v-model="selectedWarehouseIndex"
              :columns="warehouseOptions"
              @confirm="onWarehouseChange"
              @cancel="showWarehousePicker = false"
              :show-toolbar="true"
              title="选择仓库/库位"
              v-if="showWarehousePicker"
            />
            <div class="selected-filter" @click="showWarehousePicker = true">
              {{ selectedWarehouse ? selectedWarehouse : '全部仓库' }}
              <Icon name="arrow-down" />
            </div>
          </div>
        </div>
        <div class="filter-row">
          <div class="filter-label">库存状态：</div>
          <div class="filter-value stock-status">
            <div 
              :class="['status-tag', { active: stockStatus === '' }]" 
              @click="filterByStockStatus('')"
            >全部</div>
            <div 
              :class="['status-tag', { active: stockStatus === 'inStock' }]" 
              @click="filterByStockStatus('inStock')"
            >有库存</div>
            <div 
              :class="['status-tag', { active: stockStatus === 'outOfStock' }]" 
              @click="filterByStockStatus('outOfStock')"
            >缺货</div>
          </div>
        </div>
      </div>
      
      <!-- 库存列表 -->
      <div class="inventory-list-container">
        <div class="section-header flex justify-between align-center">
          <h3>库存物料 ({{ pagination.total || 0 }})</h3>
          <Button size="small" @click="exportStock">导出</Button>
        </div>

        <PullRefresh v-model="refreshing" @refresh="onRefresh">
          <List
            v-model:loading="loading"
            :finished="finished"
            finished-text="没有更多数据了"
            @load="onLoad"
          >
            <div v-if="stockList.length === 0 && !loading && !refreshing" class="empty-state">
              <Empty description="暂无库存数据" />
            </div>
            
            <Card 
              v-for="item in stockList" 
              :key="item.id" 
              class="stock-item-card"
              @click="viewStockDetail(item)"
            >
              <div class="stock-item">
                <div class="stock-item-header">
                  <span class="material-code">{{ item.material_code }}</span>
                  <Tag 
                    :type="item.quantity > 0 ? 'success' : 'danger'"
                    size="medium"
                  >
                    {{ item.quantity > 0 ? '有库存' : '无库存' }}
                  </Tag>
                </div>
                <div class="material-name">{{ item.material_name }}</div>
                <div class="stock-info-grid">
                  <div class="info-item">
                    <div class="label">库存数量</div>
                    <div class="value" :class="{'text-danger': item.quantity <= 0, 'text-success': item.quantity > 0}">
                      {{ item.quantity }} {{ item.unit_name }}
                    </div>
                  </div>
                  <div class="info-item">
                    <div class="label">仓库/库位</div>
                    <div class="value">{{ item.location_name || '-' }}</div>
                  </div>
                  <div class="info-item">
                    <div class="label">规格型号</div>
                    <div class="value">{{ item.spec || '-' }}</div>
                  </div>
                  <div class="info-item">
                    <div class="label">类别</div>
                    <div class="value">{{ item.category_name || '-' }}</div>
                  </div>
                </div>
              </div>
            </Card>
          </List>
        </PullRefresh>
      </div>
    </div>
    
    <!-- 详情弹出层 -->
    <Popup v-model:show="showDetail" position="bottom" round :style="{ height: '70%' }">
      <div class="detail-container" v-if="currentStock">
        <div class="detail-header">
          <div class="detail-title">物料详情</div>
          <Icon name="cross" @click="showDetail = false" />
        </div>
        <div class="detail-content">
          <div class="detail-item">
            <div class="detail-label">物料编码</div>
            <div class="detail-value">{{ currentStock.material_code }}</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">物料名称</div>
            <div class="detail-value">{{ currentStock.material_name }}</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">规格型号</div>
            <div class="detail-value">{{ currentStock.spec || '-' }}</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">库存数量</div>
            <div class="detail-value" :class="{'text-danger': currentStock.quantity <= 0, 'text-success': currentStock.quantity > 0}">
              {{ currentStock.quantity }} {{ currentStock.unit_name }}
            </div>
          </div>
          <div class="detail-item">
            <div class="detail-label">仓库/库位</div>
            <div class="detail-value">{{ currentStock.location_name || '-' }}</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">类别</div>
            <div class="detail-value">{{ currentStock.category_name || '-' }}</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">单价</div>
            <div class="detail-value">{{ currentStock.unit_price ? `¥${currentStock.unit_price}` : '-' }}</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">金额</div>
            <div class="detail-value">{{ calculateAmount(currentStock) }}</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">最近入库</div>
            <div class="detail-value">{{ currentStock.last_in_date || '-' }}</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">最近出库</div>
            <div class="detail-value">{{ currentStock.last_out_date || '-' }}</div>
          </div>
        </div>
        <div class="detail-actions">
          <Button type="primary" block @click="showDetail = false">关闭</Button>
        </div>
      </div>
    </Popup>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { 
  NavBar, 
  Search, 
  Icon, 
  Empty, 
  Card, 
  Tag, 
  PullRefresh, 
  List, 
  Button, 
  Popup,
  Picker,
  showToast,
  showDialog
} from 'vant';
import { inventoryApi } from '@/services/api';

const router = useRouter();
const searchValue = ref('');
const refreshing = ref(false);
const loading = ref(false);
const finished = ref(false);
const stockList = ref([]);
const stockStatus = ref('');
const showDetail = ref(false);
const currentStock = ref(null);
const selectedWarehouseIndex = ref(0);
const selectedWarehouse = ref('');
const selectedWarehouseId = ref('');
const warehouseOptions = ref([]);
const showWarehousePicker = ref(false);

// 分页参数
const pagination = reactive({
  page: 1,
  limit: 10,
  total: 0
});

// 返回上一页
const onClickLeft = () => {
  router.back();
};

// 搜索
const onSearch = (val) => {
  searchValue.value = val;
  resetList();
  loadStockList();
};

// 下拉刷新
const onRefresh = () => {
  resetList();
  loadStockList().finally(() => {
    refreshing.value = false;
    showToast('刷新成功');
  });
};

// 仓库筛选变更
const onWarehouseChange = (value) => {
  showWarehousePicker.value = false;
  
  if (Array.isArray(value)) {
    const warehouseValue = value[0];
    if (warehouseValue) {
      const foundIndex = warehouseOptions.value.findIndex(option => option === warehouseValue);
      if (foundIndex !== -1) {
        selectedWarehouseIndex.value = foundIndex;
        
        if (foundIndex === 0) {
          selectedWarehouse.value = '';
          selectedWarehouseId.value = '';
        } else {
          // 如果仓库选项是形如 "仓库名 (ID)" 的格式，则需要解析ID
          const match = warehouseValue.match(/\(([^)]+)\)$/);
          if (match) {
            selectedWarehouseId.value = match[1];
            selectedWarehouse.value = warehouseValue.replace(/ \([^)]+\)$/, '');
          } else {
            selectedWarehouse.value = warehouseValue;
            selectedWarehouseId.value = foundIndex.toString();
          }
        }
        
        resetList();
        loadStockList();
      }
    }
  }
};

// 库存状态筛选
const filterByStockStatus = (status) => {
  stockStatus.value = status;
  resetList();
  loadStockList();
};

// 重置列表
const resetList = () => {
  stockList.value = [];
  pagination.page = 1;
  finished.value = false;
};

// 加载更多
const onLoad = () => {
  loadStockList();
};

// 查看库存详情
const viewStockDetail = (item) => {
  currentStock.value = item;
  showDetail.value = true;
};

// 计算金额
const calculateAmount = (stock) => {
  if (stock.quantity && stock.unit_price) {
    return `¥${(stock.quantity * stock.unit_price).toFixed(2)}`;
  }
  return '-';
};

// 导出库存
const exportStock = () => {
  showDialog({
    title: '导出库存',
    message: '是否导出当前筛选条件下的库存数据？',
    showCancelButton: true,
  }).then(() => {
    showToast('导出成功');
    // 实际导出功能可以调用后端API
    // window.location.href = `/api/inventory/stock/export?search=${searchValue.value}&location_id=${selectedWarehouseId.value}`;
  }).catch(() => {
    // 取消
  });
};

// 加载库存列表
const loadStockList = async () => {
  if (loading.value) return;
  
  loading.value = true;
  try {
    const params = {
      page: pagination.page,
      limit: pagination.limit,
      search: searchValue.value || undefined,
      location_id: selectedWarehouseId.value || undefined
    };
    
    // 添加库存状态过滤
    if (stockStatus.value === 'inStock') {
      params.in_stock = true;
    } else if (stockStatus.value === 'outOfStock') {
      params.in_stock = false;
    }
    
    const response = await inventoryApi.getInventoryStock(params);
    
    if (response.data && Array.isArray(response.data)) {
      // 兼容返回数组的情况
      stockList.value = [...stockList.value, ...response.data];
      finished.value = response.data.length < pagination.limit;
    } else if (response.data && response.data.items) {
      // 兼容返回分页对象的情况
      stockList.value = [...stockList.value, ...response.data.items];
      pagination.total = response.data.total || 0;
      finished.value = stockList.value.length >= pagination.total;
    } else {
      finished.value = true;
    }
    
    pagination.page++;
  } catch (error) {
    console.error('获取库存列表失败:', error);
    showToast('获取库存列表失败');
    finished.value = true;
  } finally {
    loading.value = false;
  }
};

// 获取仓库列表
const getWarehouses = async () => {
  try {
    const response = await inventoryApi.getLocations();
    if (response.data && response.data.items) {
      // 构建下拉选项
      warehouseOptions.value = [
        '全部仓库',
        ...response.data.items.map(item => `${item.name} (${item.id})`)
      ];
    }
  } catch (error) {
    console.error('获取仓库列表失败:', error);
  }
};

onMounted(() => {
  getWarehouses();
  loadStockList();
});
</script>

<style lang="scss" scoped>
.filter-section {
  background-color: white;
  border-radius: $border-radius-md;
  margin: $margin-md 0;
  padding: $padding-md;
}

.filter-row {
  display: flex;
  align-items: center;
  margin-bottom: $margin-md;
  
  &:last-child {
    margin-bottom: 0;
  }
}

.filter-label {
  width: 90px;
  font-size: $font-size-sm;
  color: $text-color-secondary;
}

.filter-value {
  flex: 1;
}

.selected-filter {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: $padding-xs $padding-sm;
  background-color: #f5f5f5;
  border-radius: $border-radius-sm;
  font-size: $font-size-sm;
}

.stock-status {
  display: flex;
}

.status-tag {
  padding: $padding-xs $padding-sm;
  margin-right: $margin-xs;
  border-radius: $border-radius-sm;
  font-size: $font-size-sm;
  background-color: #f5f5f5;
  
  &.active {
    background-color: $primary-color;
    color: white;
  }
}

.inventory-list-container {
  margin-top: $margin-md;
}

.section-header {
  margin-bottom: $margin-md;
  
  h3 {
    font-size: $font-size-lg;
    margin: 0;
  }
}

.stock-item-card {
  margin-bottom: $margin-md;
}

.stock-item {
  padding: $padding-xs 0;
}

.stock-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $margin-xs;
}

.material-code {
  font-size: $font-size-sm;
  color: $text-color-secondary;
}

.material-name {
  font-size: $font-size-md;
  font-weight: bold;
  margin-bottom: $margin-sm;
}

.stock-info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: $padding-xs;
  margin-top: $margin-md;
}

.info-item {
  .label {
    font-size: $font-size-xs;
    color: $text-color-secondary;
    margin-bottom: 2px;
  }
  
  .value {
    font-size: $font-size-sm;
  }
}

.text-danger {
  color: $danger-color;
}

.text-success {
  color: $success-color;
}

// 详情弹出层样式
.detail-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: $padding-md;
  border-bottom: 1px solid $border-color;
}

.detail-title {
  font-weight: bold;
  font-size: $font-size-lg;
}

.detail-content {
  flex: 1;
  overflow-y: auto;
  padding: $padding-md;
}

.detail-item {
  display: flex;
  margin-bottom: $margin-md;
}

.detail-label {
  width: 80px;
  color: $text-color-secondary;
  font-size: $font-size-sm;
}

.detail-value {
  flex: 1;
  font-size: $font-size-md;
}

.detail-actions {
  padding: $padding-md;
  border-top: 1px solid $border-color;
}
</style> 