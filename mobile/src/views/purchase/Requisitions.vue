<!--
/**
 * Requisitions.vue
 * @description 移动端应用文件
  * @date 2025-08-27
 * @version 1.0.0
 */
-->
<template>
  <div class="page-container">
    <NavBar
      title="采购申请"
      left-arrow
      @click-left="onClickLeft"
    >
      <template #right>
        <Icon name="plus" size="18" @click="createRequisition" />
      </template>
    </NavBar>
    
    <div class="content-container">
      <!-- 搜索和筛选 -->
      <div class="search-filter">
        <Search
          v-model="searchValue"
          placeholder="搜索申请单号或申请人"
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
      
      <!-- 申请单列表 -->
      <PullRefresh v-model="refreshing" @refresh="onRefresh">
        <List
          v-model:loading="loading"
          :finished="finished"
          finished-text="没有更多数据了"
          @load="onLoad"
        >
          <div v-if="requisitionList.length === 0 && !loading" class="empty-state">
            <Empty description="暂无采购申请" />
          </div>

          <Card
            v-for="requisition in requisitionList"
            :key="requisition.id"
            class="requisition-card"
            @click="viewRequisitionDetail(requisition.id)"
          >
            <div class="requisition-item">
              <div class="requisition-header">
                <span class="requisition-no">{{ requisition.requisition_number }}</span>
                <Tag :type="getRequisitionStatusType(requisition.status)" size="medium">
                  {{ getRequisitionStatusText(requisition.status) }}
                </Tag>
              </div>
              
              <div class="requisition-requester">申请人: {{ requisition.real_name }}</div>
              
              <div class="requisition-details">
                <div class="detail-row">
                  <span class="label">申请日期:</span>
                  <span class="value">{{ formatDate(requisition.request_date) }}</span>
                </div>
                <div class="detail-row" v-if="requisition.materials_count">
                  <span class="label">物料数量:</span>
                  <span class="value">{{ requisition.materials_count }} 项</span>
                </div>
                <div class="detail-row" v-if="requisition.total_amount">
                  <span class="label">预估金额:</span>
                  <span class="value amount">¥{{ formatAmount(requisition.total_amount) }}</span>
                </div>
                <div class="detail-row" v-if="requisition.remarks">
                  <span class="label">备注:</span>
                  <span class="value">{{ requisition.remarks }}</span>
                </div>
              </div>
              
              <div class="requisition-actions">
                <Button 
                  size="small" 
                  type="primary" 
                  plain
                  @click.stop="viewRequisitionDetail(requisition.id)"
                >
                  查看详情
                </Button>
                <Button 
                  v-if="requisition.status === 'draft'"
                  size="small" 
                  type="success" 
                  plain
                  @click.stop="submitRequisition(requisition)"
                >
                  提交申请
                </Button>
                <Button 
                  v-if="requisition.status === 'approved'"
                  size="small" 
                  type="warning" 
                  plain
                  @click.stop="createOrder(requisition)"
                >
                  创建订单
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
const requisitionList = ref([]);
const activeTab = ref(0);

// 状态标签
const statusTabs = [
  { label: '全部', value: '' },
  { label: '草稿', value: 'draft' },
  { label: '已提交', value: 'submitted' },
  { label: '已批准', value: 'approved' },
  { label: '已拒绝', value: 'rejected' },
  { label: '已完成', value: 'completed' }
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

// 创建申请
const createRequisition = () => {
  showToast('功能开发中');
};

// 搜索
const onSearch = (val) => {
  searchValue.value = val;
  resetList();
  loadRequisitionList();
};

// 切换标签
const switchTab = (index) => {
  activeTab.value = index;
  resetList();
  loadRequisitionList();
};

// 下拉刷新
const onRefresh = () => {
  resetList();
  loadRequisitionList().finally(() => {
    refreshing.value = false;
    showToast('刷新成功');
  });
};

// 重置列表
const resetList = () => {
  requisitionList.value = [];
  pagination.page = 1;
  finished.value = false;
};

// 加载更多
const onLoad = () => {
  loadRequisitionList();
};

// 加载申请单列表
const loadRequisitionList = async () => {
  if (loading.value) return;

  loading.value = true;
  try {
    const params = {
      page: pagination.page,
      pageSize: pagination.limit,
      requisitionNo: searchValue.value || undefined,
      status: statusTabs[activeTab.value].value || undefined
    };

    const response = await purchaseApi.getRequisitions(params);

    if (response.data && response.data.items) {
      requisitionList.value = [...requisitionList.value, ...response.data.items];
      pagination.total = response.data.total || 0;
      finished.value = requisitionList.value.length >= pagination.total;
    } else {
      finished.value = true;
    }

    pagination.page++;
  } catch (error) {
    console.error('获取采购申请列表失败:', error);
    showToast('获取采购申请列表失败');
    finished.value = true;
  } finally {
    loading.value = false;
  }
};

// 获取申请状态类型
const getRequisitionStatusType = (status) => {
  const statusMap = {
    'draft': 'default',
    'submitted': 'primary',
    'approved': 'success',
    'rejected': 'danger',
    'completed': 'success'
  };
  return statusMap[status] || 'default';
};

// 获取申请状态文本
const getRequisitionStatusText = (status) => {
  const statusMap = {
    'draft': '草稿',
    'submitted': '已提交',
    'approved': '已批准',
    'rejected': '已拒绝',
    'completed': '已完成'
  };
  return statusMap[status] || status;
};

// 格式化金额
const formatAmount = (amount) => {
  if (!amount) return '0.00';
  return parseFloat(amount).toFixed(2);
};

// 查看申请详情
const viewRequisitionDetail = (id) => {
  router.push(`/purchase/requisitions/${id}`);
};

// 提交申请
const submitRequisition = async (requisition) => {
  try {
    await showConfirmDialog({
      title: '提交申请',
      message: `确定要提交申请 ${requisition.requisition_number} 吗？`
    });
    
    await purchaseApi.updateRequisitionStatus(requisition.id, 'submitted');
    showToast('申请已提交');
    
    // 更新本地状态
    requisition.status = 'submitted';
  } catch (error) {
    if (error !== 'cancel') {
      console.error('提交申请失败:', error);
      showToast('提交申请失败');
    }
  }
};

// 创建订单
const createOrder = (requisition) => {
  router.push(`/purchase/orders/new?requisitionId=${requisition.id}`);
};

onMounted(() => {
  loadRequisitionList();
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

.requisition-card {
  margin: $margin-md;
  margin-bottom: $margin-sm;
}

.requisition-item {
  padding: $padding-xs 0;
}

.requisition-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $margin-xs;
}

.requisition-no {
  font-size: $font-size-sm;
  color: $text-color-secondary;
}

.requisition-requester {
  font-size: $font-size-lg;
  font-weight: bold;
  margin-bottom: $margin-sm;
}

.requisition-details {
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

.requisition-actions {
  display: flex;
  gap: $margin-sm;
  
  .van-button {
    flex: 1;
  }
}
</style>
