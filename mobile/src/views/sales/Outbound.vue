<!--
/**
 * Outbound.vue
 * @description 移动端应用文件
  * @date 2025-08-27
 * @version 1.0.0
 */
-->
<template>
  <div class="page-container">
    <NavBar
      title="销售出库"
      left-arrow
      @click-left="onClickLeft"
    >
      <template #right>
        <Icon name="plus" size="18" @click="createOutbound" />
      </template>
    </NavBar>
    
    <div class="content-container">
      <!-- 搜索和筛选 -->
      <div class="search-filter">
        <Search
          v-model="searchValue"
          placeholder="搜索出库单号或订单号"
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
      
      <!-- 出库单列表 -->
      <PullRefresh v-model="refreshing" @refresh="onRefresh">
        <List
          v-model:loading="loading"
          :finished="finished"
          finished-text="没有更多数据了"
          @load="onLoad"
        >
          <div v-if="outboundList.length === 0 && !loading" class="empty-state">
            <Empty description="暂无销售出库单" />
          </div>
          
          <Card 
            v-for="outbound in outboundList" 
            :key="outbound.id" 
            class="outbound-card"
            @click="viewOutboundDetail(outbound.id)"
          >
            <div class="outbound-item">
              <div class="outbound-header">
                <span class="outbound-no">{{ outbound.outbound_no }}</span>
                <Tag :type="getOutboundStatusType(outbound.status)" size="medium">
                  {{ getOutboundStatusText(outbound.status) }}
                </Tag>
              </div>
              
              <div class="outbound-order" v-if="outbound.order_no">
                关联订单: {{ outbound.order_no }}
              </div>
              
              <div class="outbound-customer">{{ outbound.customer_name }}</div>
              
              <div class="outbound-details">
                <div class="detail-row">
                  <span class="label">出库日期:</span>
                  <span class="value">{{ formatDate(outbound.delivery_date) }}</span>
                </div>
                <div class="detail-row" v-if="outbound.total_amount">
                  <span class="label">出库金额:</span>
                  <span class="value amount">¥{{ formatAmount(outbound.total_amount) }}</span>
                </div>
                <div class="detail-row" v-if="outbound.receiver">
                  <span class="label">收货人:</span>
                  <span class="value">{{ outbound.receiver }}</span>
                </div>
                <div class="detail-row" v-if="outbound.contact_phone">
                  <span class="label">联系电话:</span>
                  <span class="value">{{ outbound.contact_phone }}</span>
                </div>
              </div>
              
              <div class="outbound-items" v-if="outbound.items && outbound.items.length > 0">
                <div class="items-title">出库物料 ({{ outbound.items.length }}项)</div>
                <div class="items-list">
                  <div 
                    v-for="(item, index) in outbound.items.slice(0, 2)" 
                    :key="index"
                    class="item-row"
                  >
                    <span class="item-name">{{ item.material_name }}</span>
                    <span class="item-quantity">{{ item.quantity }} {{ item.unit_name }}</span>
                  </div>
                  <div v-if="outbound.items.length > 2" class="more-items">
                    还有 {{ outbound.items.length - 2 }} 项...
                  </div>
                </div>
              </div>
              
              <div class="outbound-actions">
                <Button 
                  size="small" 
                  type="primary" 
                  plain
                  @click.stop="viewOutboundDetail(outbound.id)"
                >
                  查看详情
                </Button>
                <Button 
                  v-if="outbound.status === 'draft'"
                  size="small" 
                  type="success" 
                  plain
                  @click.stop="confirmOutbound(outbound)"
                >
                  确认出库
                </Button>
                <Button 
                  v-if="outbound.status === 'confirmed'"
                  size="small" 
                  type="warning" 
                  plain
                  @click.stop="shipOutbound(outbound)"
                >
                  发货
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
const outboundList = ref([]);
const activeTab = ref(0);

// 状态标签
const statusTabs = [
  { label: '全部', value: '' },
  { label: '草稿', value: 'draft' },
  { label: '已确认', value: 'confirmed' },
  { label: '已发货', value: 'shipped' },
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

// 创建出库单
const createOutbound = () => {
  showToast('功能开发中');
};

// 搜索
const onSearch = (val) => {
  searchValue.value = val;
  resetList();
  loadOutboundList();
};

// 切换标签
const switchTab = (index) => {
  activeTab.value = index;
  resetList();
  loadOutboundList();
};

// 下拉刷新
const onRefresh = () => {
  resetList();
  loadOutboundList().finally(() => {
    refreshing.value = false;
    showToast('刷新成功');
  });
};

// 重置列表
const resetList = () => {
  outboundList.value = [];
  pagination.page = 1;
  finished.value = false;
};

// 加载更多
const onLoad = () => {
  loadOutboundList();
};

// 加载出库单列表
const loadOutboundList = async () => {
  if (loading.value) return;
  
  loading.value = true;
  try {
    const params = {
      page: pagination.page,
      limit: pagination.limit,
      search: searchValue.value || undefined,
      status: statusTabs[activeTab.value].value || undefined
    };
    
    const response = await salesApi.getSalesOutbound(params);
    
    if (response.data && response.data.items) {
      outboundList.value = [...outboundList.value, ...response.data.items];
      pagination.total = response.data.total || 0;
      finished.value = outboundList.value.length >= pagination.total;
    } else {
      finished.value = true;
    }
    
    pagination.page++;
  } catch (error) {
    console.error('获取销售出库单列表失败:', error);
    showToast('获取销售出库单列表失败');
    finished.value = true;
  } finally {
    loading.value = false;
  }
};

// 获取出库单状态类型
const getOutboundStatusType = (status) => {
  const statusMap = {
    'draft': 'default',
    'confirmed': 'primary',
    'shipped': 'warning',
    'completed': 'success',
    'cancelled': 'danger'
  };
  return statusMap[status] || 'default';
};

// 获取出库单状态文本
const getOutboundStatusText = (status) => {
  const statusMap = {
    'draft': '草稿',
    'confirmed': '已确认',
    'shipped': '已发货',
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

// 查看出库单详情
const viewOutboundDetail = (id) => {
  router.push(`/sales/outbound/${id}`);
};

// 确认出库
const confirmOutbound = async (outbound) => {
  try {
    await showConfirmDialog({
      title: '确认出库',
      message: `确定要确认出库单 ${outbound.outbound_no} 吗？`
    });
    
    // 这里需要调用确认出库的API
    showToast('出库单已确认');
    
    // 更新本地状态
    outbound.status = 'confirmed';
  } catch (error) {
    if (error !== 'cancel') {
      console.error('确认出库失败:', error);
      showToast('确认出库失败');
    }
  }
};

// 发货
const shipOutbound = async (outbound) => {
  try {
    await showConfirmDialog({
      title: '确认发货',
      message: `确定要发货出库单 ${outbound.outbound_no} 吗？`
    });
    
    // 这里需要调用发货的API
    showToast('出库单已发货');
    
    // 更新本地状态
    outbound.status = 'shipped';
  } catch (error) {
    if (error !== 'cancel') {
      console.error('发货失败:', error);
      showToast('发货失败');
    }
  }
};

onMounted(() => {
  loadOutboundList();
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

.outbound-card {
  margin: $margin-md;
  margin-bottom: $margin-sm;
}

.outbound-item {
  padding: $padding-xs 0;
}

.outbound-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $margin-xs;
}

.outbound-no {
  font-size: $font-size-sm;
  color: $text-color-secondary;
}

.outbound-order {
  font-size: $font-size-sm;
  color: $primary-color;
  margin-bottom: $margin-xs;
}

.outbound-customer {
  font-size: $font-size-lg;
  font-weight: bold;
  margin-bottom: $margin-sm;
}

.outbound-details {
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

.outbound-items {
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

.outbound-actions {
  display: flex;
  gap: $margin-sm;
  
  .van-button {
    flex: 1;
  }
}
</style>
