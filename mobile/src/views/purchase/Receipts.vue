<!--
/**
 * Receipts.vue
 * @description 移动端应用文件
  * @date 2025-08-27
 * @version 1.0.0
 */
-->
<template>
  <div class="page-container">
    <NavBar
      title="采购入库"
      left-arrow
      @click-left="onClickLeft"
    >
      <template #right>
        <Icon name="plus" size="18" @click="createReceipt" />
      </template>
    </NavBar>
    
    <div class="content-container">
      <!-- 搜索和筛选 -->
      <div class="search-filter">
        <Search
          v-model="searchValue"
          placeholder="搜索入库单号或订单号"
          @search="onSearch"
          shape="round"
        />
        
        <div class="filter-tabs">
          <div 
            v-for="(tab, index) in statusTabs" 
            :key="index"
            :class="['filter-tab', { active: activeTab === index }]"
            @click="switchTab(index)"
          >
            {{ tab.label }}
          </div>
        </div>
      </div>
      
      <!-- 入库单列表 -->
      <PullRefresh v-model="refreshing" @refresh="onRefresh">
        <List
          v-model:loading="loading"
          :finished="finished"
          finished-text="没有更多数据了"
          @load="onLoad"
        >
          <div v-if="receiptList.length === 0 && !loading" class="empty-state">
            <Empty description="暂无采购入库单" />
          </div>
          
          <Card 
            v-for="receipt in receiptList" 
            :key="receipt.id" 
            class="receipt-card"
            @click="viewReceiptDetail(receipt.id)"
          >
            <div class="receipt-item">
              <div class="receipt-header">
                <span class="receipt-no">{{ receipt.receipt_no }}</span>
                <Tag :type="getReceiptStatusType(receipt.status)" size="medium">
                  {{ getReceiptStatusText(receipt.status) }}
                </Tag>
              </div>
              
              <div class="receipt-order" v-if="receipt.order_no">
                关联订单: {{ receipt.order_no }}
              </div>
              
              <div class="receipt-supplier">{{ receipt.supplier_name }}</div>
              
              <div class="receipt-details">
                <div class="detail-row">
                  <span class="label">入库日期:</span>
                  <span class="value">{{ formatDate(receipt.receipt_date) }}</span>
                </div>
                <div class="detail-row" v-if="receipt.total_amount">
                  <span class="label">入库金额:</span>
                  <span class="value amount">¥{{ formatAmount(receipt.total_amount) }}</span>
                </div>
                <div class="detail-row" v-if="receipt.receiver">
                  <span class="label">收货人:</span>
                  <span class="value">{{ receipt.receiver }}</span>
                </div>
                <div class="detail-row" v-if="receipt.warehouse_name">
                  <span class="label">入库仓库:</span>
                  <span class="value">{{ receipt.warehouse_name }}</span>
                </div>
              </div>
              
              <div class="receipt-items" v-if="receipt.items && receipt.items.length > 0">
                <div class="items-title">入库物料 ({{ receipt.items.length }}项)</div>
                <div class="items-list">
                  <div 
                    v-for="(item, index) in receipt.items.slice(0, 2)" 
                    :key="index"
                    class="item-row"
                  >
                    <span class="item-name">{{ item.material_name }}</span>
                    <span class="item-quantity">{{ item.quantity }} {{ item.unit_name }}</span>
                  </div>
                  <div v-if="receipt.items.length > 2" class="more-items">
                    还有 {{ receipt.items.length - 2 }} 项...
                  </div>
                </div>
              </div>
              
              <div class="receipt-actions">
                <Button 
                  size="small" 
                  type="primary" 
                  plain
                  @click.stop="viewReceiptDetail(receipt.id)"
                >
                  查看详情
                </Button>
                <Button 
                  v-if="receipt.status === 'draft'"
                  size="small" 
                  type="success" 
                  plain
                  @click.stop="confirmReceipt(receipt)"
                >
                  确认入库
                </Button>
                <Button 
                  v-if="receipt.status === 'confirmed'"
                  size="small" 
                  type="warning" 
                  plain
                  @click.stop="completeReceipt(receipt)"
                >
                  完成入库
                </Button>
              </div>
            </div>
          </Card>
        </List>
      </PullRefresh>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { NavBar, Search, Icon, Empty, Card, Tag, PullRefresh, List, Button, showToast, showConfirmDialog } from 'vant';
import { purchaseApi } from '@/services/api';
import { formatDate } from '@/utils/date';

const router = useRouter();
const searchValue = ref('');
const refreshing = ref(false);
const loading = ref(false);
const finished = ref(false);
const receiptList = ref([]);
const activeTab = ref(0);

// 状态标签
const statusTabs = [
  { label: '全部', value: '' },
  { label: '草稿', value: 'draft' },
  { label: '已确认', value: 'confirmed' },
  { label: '已完成', value: 'completed' },
  { label: '已取消', value: 'cancelled' }
];

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

// 创建入库单
const createReceipt = () => {
  router.push('/purchase/receipts/create');
};

// 搜索
const onSearch = (val) => {
  searchValue.value = val;
  resetList();
  loadReceiptList();
};

// 切换标签
const switchTab = (index) => {
  activeTab.value = index;
  resetList();
  loadReceiptList();
};

// 下拉刷新
const onRefresh = () => {
  resetList();
  loadReceiptList().finally(() => {
    refreshing.value = false;
    showToast('刷新成功');
  });
};

// 重置列表
const resetList = () => {
  receiptList.value = [];
  pagination.page = 1;
  finished.value = false;
};

// 加载更多
const onLoad = () => {
  loadReceiptList();
};

// 加载入库单列表
const loadReceiptList = async () => {
  if (loading.value) return;
  
  loading.value = true;
  try {
    const params = {
      page: pagination.page,
      pageSize: pagination.limit,
      receiptNo: searchValue.value || undefined,
      status: statusTabs[activeTab.value].value || undefined
    };
    
    const response = await purchaseApi.getReceipts(params);
    
    if (response.data && response.data.items) {
      receiptList.value = [...receiptList.value, ...response.data.items];
      pagination.total = response.data.total || 0;
      finished.value = receiptList.value.length >= pagination.total;
    } else {
      finished.value = true;
    }
    
    pagination.page++;
  } catch (error) {
    console.error('获取采购入库单列表失败:', error);
    showToast('获取采购入库单列表失败');
    finished.value = true;
  } finally {
    loading.value = false;
  }
};

// 获取入库单状态类型
const getReceiptStatusType = (status) => {
  const statusMap = {
    'draft': 'default',
    'confirmed': 'primary',
    'completed': 'success',
    'cancelled': 'danger'
  };
  return statusMap[status] || 'default';
};

// 获取入库单状态文本
const getReceiptStatusText = (status) => {
  const statusMap = {
    'draft': '草稿',
    'confirmed': '已确认',
    'completed': '已完成',
    'cancelled': '已取消'
  };
  return statusMap[status] || status;
};

// 格式化金额
const formatAmount = (amount) => {
  if (!amount) return '0.00';
  return parseFloat(amount).toFixed(2);
};

// 查看入库单详情
const viewReceiptDetail = (id) => {
  router.push(`/purchase/receipts/${id}`);
};

// 确认入库
const confirmReceipt = async (receipt) => {
  try {
    await showConfirmDialog({
      title: '确认入库',
      message: `确定要确认入库单 ${receipt.receipt_no} 吗？`
    });
    
    // 这里需要调用确认入库的API
    showToast('入库单已确认');
    
    // 更新本地状态
    receipt.status = 'confirmed';
  } catch (error) {
    if (error !== 'cancel') {
      console.error('确认入库失败:', error);
      showToast('确认入库失败');
    }
  }
};

// 完成入库
const completeReceipt = async (receipt) => {
  try {
    await showConfirmDialog({
      title: '完成入库',
      message: `确定要完成入库单 ${receipt.receipt_no} 吗？`
    });
    
    // 这里需要调用完成入库的API
    showToast('入库单已完成');
    
    // 更新本地状态
    receipt.status = 'completed';
  } catch (error) {
    if (error !== 'cancel') {
      console.error('完成入库失败:', error);
      showToast('完成入库失败');
    }
  }
};

onMounted(() => {
  loadReceiptList();
});
</script>

<style lang="scss" scoped>
.search-filter {
  padding: $padding-md;
  background-color: white;
  border-bottom: 1px solid $border-color;
}

.filter-tabs {
  display: flex;
  margin-top: $margin-sm;
  overflow-x: auto;
  
  &::-webkit-scrollbar {
    display: none;
  }
  
  .filter-tab {
    flex: 0 0 auto;
    text-align: center;
    padding: $padding-xs $padding-sm;
    font-size: $font-size-sm;
    color: $text-color-secondary;
    border-bottom: 2px solid transparent;
    white-space: nowrap;
    margin-right: $margin-sm;
    
    &.active {
      color: $primary-color;
      border-bottom-color: $primary-color;
    }
  }
}

.receipt-card {
  margin: $margin-md;
  margin-bottom: $margin-sm;
}

.receipt-item {
  padding: $padding-xs 0;
}

.receipt-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $margin-xs;
}

.receipt-no {
  font-size: $font-size-sm;
  color: $text-color-secondary;
}

.receipt-order {
  font-size: $font-size-sm;
  color: $primary-color;
  margin-bottom: $margin-xs;
}

.receipt-supplier {
  font-size: $font-size-lg;
  font-weight: bold;
  margin-bottom: $margin-sm;
}

.receipt-details {
  margin-bottom: $margin-md;
  
  .detail-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 4px;
    
    .label {
      font-size: $font-size-sm;
      color: $text-color-secondary;
    }
    
    .value {
      font-size: $font-size-sm;
      color: $text-color;
      
      &.amount {
        color: $primary-color;
        font-weight: bold;
      }
    }
  }
}

.receipt-items {
  margin-bottom: $margin-md;
  
  .items-title {
    font-size: $font-size-sm;
    color: $text-color-secondary;
    margin-bottom: $margin-xs;
  }
  
  .items-list {
    background-color: #f8f9fa;
    padding: $padding-sm;
    border-radius: $border-radius-sm;
    
    .item-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 4px;
      
      &:last-child {
        margin-bottom: 0;
      }
      
      .item-name {
        font-size: $font-size-sm;
        color: $text-color;
        flex: 1;
        margin-right: $margin-sm;
      }
      
      .item-quantity {
        font-size: $font-size-sm;
        color: $text-color-secondary;
      }
    }
    
    .more-items {
      font-size: $font-size-xs;
      color: $text-color-secondary;
      text-align: center;
      margin-top: $margin-xs;
    }
  }
}

.receipt-actions {
  display: flex;
  gap: $margin-sm;
  
  .van-button {
    flex: 1;
  }
}
</style>
