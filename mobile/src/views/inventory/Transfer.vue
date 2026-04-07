<!--
/**
 * Transfer.vue
 * @description 移动端应用文件
  * @date 2025-08-27
 * @version 1.0.0
 */
-->
<template>
  <div class="page-container">
    <NavBar
      title="库存调拨"
      left-arrow
      @click-left="onClickLeft"
    >
      <template #right>
        <Icon name="plus" size="18" @click="createTransfer" />
      </template>
    </NavBar>
    
    <div class="content-container">
      <!-- 搜索和筛选 -->
      <div class="search-filter">
        <Search
          v-model="searchValue"
          placeholder="搜索调拨单号或物料名称"
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
      
      <!-- 调拨单列表 -->
      <PullRefresh v-model="refreshing" @refresh="onRefresh">
        <List
          v-model:loading="loading"
          :finished="finished"
          finished-text="没有更多数据了"
          @load="onLoad"
        >
          <div v-if="transferList.length === 0 && !loading" class="empty-state">
            <Empty description="暂无调拨记录" />
          </div>
          
          <Card 
            v-for="transfer in transferList" 
            :key="transfer.id" 
            class="transfer-card"
            @click="viewTransferDetail(transfer.id)"
          >
            <div class="transfer-item">
              <div class="transfer-header">
                <span class="transfer-no">{{ transfer.transfer_no }}</span>
                <Tag :type="getTransferStatusType(transfer.status)" size="medium">
                  {{ getTransferStatusText(transfer.status) }}
                </Tag>
              </div>
              
              <div class="transfer-route">
                <div class="route-info">
                  <span class="from">{{ transfer.from_warehouse_name }}</span>
                  <Icon name="arrow" size="16" color="#999" />
                  <span class="to">{{ transfer.to_warehouse_name }}</span>
                </div>
              </div>
              
              <div class="transfer-details">
                <div class="detail-row">
                  <span class="label">调拨日期:</span>
                  <span class="value">{{ formatDate(transfer.transfer_date) }}</span>
                </div>
                <div class="detail-row" v-if="transfer.operator_name">
                  <span class="label">操作员:</span>
                  <span class="value">{{ transfer.operator_name }}</span>
                </div>
                <div class="detail-row" v-if="transfer.reason">
                  <span class="label">调拨原因:</span>
                  <span class="value">{{ transfer.reason }}</span>
                </div>
              </div>
              
              <div class="transfer-items" v-if="transfer.items && transfer.items.length > 0">
                <div class="items-title">调拨物料 ({{ transfer.items.length }}项)</div>
                <div class="items-list">
                  <div 
                    v-for="(item, index) in transfer.items.slice(0, 2)" 
                    :key="index"
                    class="item-row"
                  >
                    <span class="item-name">{{ item.material_name }}</span>
                    <span class="item-quantity">{{ item.quantity }} {{ item.unit_name }}</span>
                  </div>
                  <div v-if="transfer.items.length > 2" class="more-items">
                    还有 {{ transfer.items.length - 2 }} 项...
                  </div>
                </div>
              </div>
              
              <div class="transfer-progress" v-if="transfer.status === 'in_progress'">
                <div class="progress-info">
                  <span>调拨进度</span>
                  <span>{{ getTransferProgress(transfer) }}%</span>
                </div>
                <div class="progress-bar">
                  <div 
                    class="progress-fill" 
                    :style="{ width: getTransferProgress(transfer) + '%' }"
                  ></div>
                </div>
              </div>
              
              <div class="transfer-actions">
                <Button 
                  size="small" 
                  type="primary" 
                  plain
                  @click.stop="viewTransferDetail(transfer.id)"
                >
                  查看详情
                </Button>
                <Button 
                  v-if="transfer.status === 'draft'"
                  size="small" 
                  type="success" 
                  plain
                  @click.stop="confirmTransfer(transfer)"
                >
                  确认调拨
                </Button>
                <Button 
                  v-if="transfer.status === 'confirmed'"
                  size="small" 
                  type="warning" 
                  plain
                  @click.stop="executeTransfer(transfer)"
                >
                  执行调拨
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
import { inventoryApi } from '@/services/api';
import { formatDate } from '@/utils/date';
import { getTransferStatusText, getTransferStatusColor } from '@/constants/statusConstants';

const router = useRouter();
const searchValue = ref('');
const refreshing = ref(false);
const loading = ref(false);
const finished = ref(false);
const transferList = ref([]);
const activeTab = ref(0);

// 状态标签
const statusTabs = [
  { label: '全部', value: '' },
  { label: '草稿', value: 'draft' },
  { label: '已确认', value: 'confirmed' },
  { label: '调拨中', value: 'in_progress' },
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

// 创建调拨单
const createTransfer = () => {
  showToast('功能开发中');
};

// 搜索
const onSearch = (val) => {
  searchValue.value = val;
  resetList();
  loadTransferList();
};

// 切换标签
const switchTab = (index) => {
  activeTab.value = index;
  resetList();
  loadTransferList();
};

// 下拉刷新
const onRefresh = () => {
  resetList();
  loadTransferList().finally(() => {
    refreshing.value = false;
    showToast('刷新成功');
  });
};

// 重置列表
const resetList = () => {
  transferList.value = [];
  pagination.page = 1;
  finished.value = false;
};

// 加载更多
const onLoad = () => {
  loadTransferList();
};

// 加载调拨单列表
const loadTransferList = async () => {
  if (loading.value) return;
  
  loading.value = true;
  try {
    const params = {
      page: pagination.page,
      limit: pagination.limit,
      search: searchValue.value || undefined,
      status: statusTabs[activeTab.value].value || undefined
    };
    
    const response = await inventoryApi.getTransferList(params);
    
    if (response.data && response.data.items) {
      transferList.value = [...transferList.value, ...response.data.items];
      pagination.total = response.data.total || 0;
      finished.value = transferList.value.length >= pagination.total;
    } else {
      finished.value = true;
    }
    
    pagination.page++;
  } catch (error) {
    console.error('获取调拨单列表失败:', error);
    showToast('获取调拨单列表失败');
    finished.value = true;
  } finally {
    loading.value = false;
  }
};

// 获取调拨单状态类型（使用统一常量）
const getTransferStatusType = (status) => {
  return getTransferStatusColor(status);
};

// 计算调拨进度
const getTransferProgress = (transfer) => {
  if (!transfer.total_quantity || transfer.total_quantity === 0) return 0;
  const percent = Math.round((transfer.transferred_quantity || 0) / transfer.total_quantity * 100);
  return Math.min(percent, 100);
};

// 查看调拨单详情
const viewTransferDetail = (id) => {
  router.push(`/inventory/transfer/${id}`);
};

// 确认调拨
const confirmTransfer = async (transfer) => {
  try {
    await showConfirmDialog({
      title: '确认调拨',
      message: `确定要确认调拨单 ${transfer.transfer_no} 吗？`
    });
    
    await inventoryApi.updateTransferStatus(transfer.id, 'confirmed');
    showToast('调拨单已确认');
    
    // 更新本地状态
    transfer.status = 'confirmed';
  } catch (error) {
    if (error !== 'cancel') {
      console.error('确认调拨失败:', error);
      showToast('确认调拨失败');
    }
  }
};

// 执行调拨
const executeTransfer = async (transfer) => {
  try {
    await showConfirmDialog({
      title: '执行调拨',
      message: `确定要执行调拨单 ${transfer.transfer_no} 吗？`
    });
    
    await inventoryApi.updateTransferStatus(transfer.id, 'in_progress');
    showToast('调拨单已开始执行');
    
    // 更新本地状态
    transfer.status = 'in_progress';
  } catch (error) {
    if (error !== 'cancel') {
      console.error('执行调拨失败:', error);
      showToast('执行调拨失败');
    }
  }
};

onMounted(() => {
  loadTransferList();
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

.transfer-card {
  margin: $margin-md;
  margin-bottom: $margin-sm;
}

.transfer-item {
  padding: $padding-xs 0;
}

.transfer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $margin-xs;
}

.transfer-no {
  font-size: $font-size-sm;
  color: $text-color-secondary;
}

.transfer-route {
  margin-bottom: $margin-sm;
  
  .route-info {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: $margin-sm;
    
    .from, .to {
      font-size: $font-size-md;
      font-weight: bold;
      color: $primary-color;
    }
  }
}

.transfer-details {
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
    }
  }
}

.transfer-items {
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

.transfer-progress {
  margin-bottom: $margin-md;
  
  .progress-info {
    display: flex;
    justify-content: space-between;
    font-size: $font-size-sm;
    margin-bottom: 4px;
  }
  
  .progress-bar {
    height: 4px;
    background-color: #f0f0f0;
    border-radius: 2px;
    overflow: hidden;
    
    .progress-fill {
      height: 100%;
      background-color: $primary-color;
      transition: width 0.3s ease;
    }
  }
}

.transfer-actions {
  display: flex;
  gap: $margin-sm;
  
  .van-button {
    flex: 1;
  }
}
</style>
