<!--
/**
 * Returns.vue
 * @description 移动端应用文件
  * @date 2025-08-27
 * @version 1.0.0
 */
-->
<template>
  <div class="page-container">
    <NavBar
      title="销售退货"
      left-arrow
      @click-left="onClickLeft"
    >
      <template #right>
        <Icon name="plus" size="18" @click="createReturn" />
      </template>
    </NavBar>
    
    <div class="content-container">
      <!-- 搜索和筛选 -->
      <div class="search-filter">
        <Search
          v-model="searchValue"
          placeholder="搜索退货单号或客户名称"
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
      
      <!-- 退货单列表 -->
      <PullRefresh v-model="refreshing" @refresh="onRefresh">
        <List
          v-model:loading="loading"
          :finished="finished"
          finished-text="没有更多数据了"
          @load="onLoad"
        >
          <div v-if="returnList.length === 0 && !loading" class="empty-state">
            <Empty description="暂无销售退货单" />
          </div>
          
          <Card 
            v-for="returnItem in returnList" 
            :key="returnItem.id" 
            class="return-card"
            @click="viewReturnDetail(returnItem.id)"
          >
            <div class="return-item">
              <div class="return-header">
                <span class="return-no">{{ returnItem.return_no }}</span>
                <Tag :type="getReturnStatusType(returnItem.status)" size="medium">
                  {{ getReturnStatusText(returnItem.status) }}
                </Tag>
              </div>
              
              <div class="return-order" v-if="returnItem.order_no">
                关联订单: {{ returnItem.order_no }}
              </div>
              
              <div class="return-customer">{{ returnItem.customer_name }}</div>
              
              <div class="return-details">
                <div class="detail-row">
                  <span class="label">退货日期:</span>
                  <span class="value">{{ formatDate(returnItem.return_date) }}</span>
                </div>
                <div class="detail-row" v-if="returnItem.total_amount">
                  <span class="label">退货金额:</span>
                  <span class="value amount">¥{{ formatAmount(returnItem.total_amount) }}</span>
                </div>
                <div class="detail-row" v-if="returnItem.return_reason">
                  <span class="label">退货原因:</span>
                  <span class="value">{{ returnItem.return_reason }}</span>
                </div>
                <div class="detail-row" v-if="returnItem.contact_person">
                  <span class="label">联系人:</span>
                  <span class="value">{{ returnItem.contact_person }}</span>
                </div>
              </div>
              
              <div class="return-items" v-if="returnItem.items && returnItem.items.length > 0">
                <div class="items-title">退货物料 ({{ returnItem.items.length }}项)</div>
                <div class="items-list">
                  <div 
                    v-for="(item, index) in returnItem.items.slice(0, 2)" 
                    :key="index"
                    class="item-row"
                  >
                    <span class="item-name">{{ item.material_name }}</span>
                    <span class="item-quantity">{{ item.quantity }} {{ item.unit_name }}</span>
                  </div>
                  <div v-if="returnItem.items.length > 2" class="more-items">
                    还有 {{ returnItem.items.length - 2 }} 项...
                  </div>
                </div>
              </div>
              
              <div class="return-actions">
                <Button 
                  size="small" 
                  type="primary" 
                  plain
                  @click.stop="viewReturnDetail(returnItem.id)"
                >
                  查看详情
                </Button>
                <Button 
                  v-if="returnItem.status === 'draft'"
                  size="small" 
                  type="success" 
                  plain
                  @click.stop="confirmReturn(returnItem)"
                >
                  确认退货
                </Button>
                <Button 
                  v-if="returnItem.status === 'confirmed'"
                  size="small" 
                  type="warning" 
                  plain
                  @click.stop="processReturn(returnItem)"
                >
                  处理退货
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
import { salesApi } from '@/services/api';
import { formatDate } from '@/utils/date';

const router = useRouter();
const searchValue = ref('');
const refreshing = ref(false);
const loading = ref(false);
const finished = ref(false);
const returnList = ref([]);
const activeTab = ref(0);

// 状态标签
const statusTabs = [
  { label: '全部', value: '' },
  { label: '草稿', value: 'draft' },
  { label: '已确认', value: 'confirmed' },
  { label: '处理中', value: 'processing' },
  { label: '已完成', value: 'completed' },
  { label: '已拒绝', value: 'rejected' }
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

// 创建退货单
const createReturn = () => {
  showToast('功能开发中');
};

// 搜索
const onSearch = (val) => {
  searchValue.value = val;
  resetList();
  loadReturnList();
};

// 切换标签
const switchTab = (index) => {
  activeTab.value = index;
  resetList();
  loadReturnList();
};

// 下拉刷新
const onRefresh = () => {
  resetList();
  loadReturnList().finally(() => {
    refreshing.value = false;
    showToast('刷新成功');
  });
};

// 重置列表
const resetList = () => {
  returnList.value = [];
  pagination.page = 1;
  finished.value = false;
};

// 加载更多
const onLoad = () => {
  loadReturnList();
};

// 加载退货单列表
const loadReturnList = async () => {
  if (loading.value) return;
  
  loading.value = true;
  try {
    const params = {
      page: pagination.page,
      limit: pagination.limit,
      search: searchValue.value || undefined,
      status: statusTabs[activeTab.value].value || undefined
    };
    
    const response = await salesApi.getSalesReturns(params);
    
    if (response.data && response.data.items) {
      returnList.value = [...returnList.value, ...response.data.items];
      pagination.total = response.data.total || 0;
      finished.value = returnList.value.length >= pagination.total;
    } else {
      finished.value = true;
    }
    
    pagination.page++;
  } catch (error) {
    console.error('获取销售退货单列表失败:', error);
    showToast('获取销售退货单列表失败');
    finished.value = true;
  } finally {
    loading.value = false;
  }
};

// 获取退货单状态类型
const getReturnStatusType = (status) => {
  const statusMap = {
    'draft': 'default',
    'confirmed': 'primary',
    'processing': 'warning',
    'completed': 'success',
    'rejected': 'danger'
  };
  return statusMap[status] || 'default';
};

// 获取退货单状态文本
const getReturnStatusText = (status) => {
  const statusMap = {
    'draft': '草稿',
    'confirmed': '已确认',
    'processing': '处理中',
    'completed': '已完成',
    'rejected': '已拒绝'
  };
  return statusMap[status] || status;
};

// 格式化金额
const formatAmount = (amount) => {
  if (!amount) return '0.00';
  return parseFloat(amount).toFixed(2);
};

// 查看退货单详情
const viewReturnDetail = (id) => {
  router.push(`/sales/returns/${id}`);
};

// 确认退货
const confirmReturn = async (returnItem) => {
  try {
    await showConfirmDialog({
      title: '确认退货',
      message: `确定要确认退货单 ${returnItem.return_no} 吗？`
    });
    
    // 这里需要调用确认退货的API
    showToast('退货单已确认');
    
    // 更新本地状态
    returnItem.status = 'confirmed';
  } catch (error) {
    if (error !== 'cancel') {
      console.error('确认退货失败:', error);
      showToast('确认退货失败');
    }
  }
};

// 处理退货
const processReturn = async (returnItem) => {
  try {
    await showConfirmDialog({
      title: '处理退货',
      message: `确定要处理退货单 ${returnItem.return_no} 吗？`
    });
    
    // 这里需要调用处理退货的API
    showToast('退货单已开始处理');
    
    // 更新本地状态
    returnItem.status = 'processing';
  } catch (error) {
    if (error !== 'cancel') {
      console.error('处理退货失败:', error);
      showToast('处理退货失败');
    }
  }
};

onMounted(() => {
  loadReturnList();
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

.return-card {
  margin: $margin-md;
  margin-bottom: $margin-sm;
}

.return-item {
  padding: $padding-xs 0;
}

.return-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $margin-xs;
}

.return-no {
  font-size: $font-size-sm;
  color: $text-color-secondary;
}

.return-order {
  font-size: $font-size-sm;
  color: $primary-color;
  margin-bottom: $margin-xs;
}

.return-customer {
  font-size: $font-size-lg;
  font-weight: bold;
  margin-bottom: $margin-sm;
}

.return-details {
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

.return-items {
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

.return-actions {
  display: flex;
  gap: $margin-sm;
  
  .van-button {
    flex: 1;
  }
}
</style>
