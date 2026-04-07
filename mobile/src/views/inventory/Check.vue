<!--
/**
 * Check.vue
 * @description 移动端应用文件
  * @date 2025-08-27
 * @version 1.0.0
 */
-->
<template>
  <div class="page-container">
    <NavBar
      title="库存盘点"
      left-arrow
      @click-left="onClickLeft"
    >
      <template #right>
        <div class="header-actions">
          <Icon name="scan" size="18" @click="openScanner" class="action-icon" />
          <Icon name="plus" size="18" @click="createCheck" class="action-icon" />
        </div>
      </template>
    </NavBar>
    
    <div class="content-container">
      <!-- 搜索 -->
      <Search
        v-model="searchValue"
        placeholder="输入盘点单号"
        @search="onSearch"
        shape="round"
        show-action
      />
      
      <!-- 状态统计 -->
      <div class="status-stats">
        <div class="stat-item" :class="{ active: currentStatus === '' }" @click="filterByStatus('')">
          <div class="stat-value">{{ checkStats.total || 0 }}</div>
          <div class="stat-label">全部</div>
        </div>
        <div class="stat-item" :class="{ active: currentStatus === 'draft' }" @click="filterByStatus('draft')">
          <div class="stat-value">{{ checkStats.draftCount || 0 }}</div>
          <div class="stat-label">草稿</div>
        </div>
        <div class="stat-item" :class="{ active: currentStatus === 'in_progress' }" @click="filterByStatus('in_progress')">
          <div class="stat-value">{{ checkStats.pendingCount || 0 }}</div>
          <div class="stat-label">进行中</div>
        </div>
        <div class="stat-item" :class="{ active: currentStatus === 'completed' }" @click="filterByStatus('completed')">
          <div class="stat-value">{{ checkStats.completeCount || 0 }}</div>
          <div class="stat-label">已完成</div>
        </div>
      </div>
      
      <!-- 盘点单列表 -->
      <PullRefresh v-model="refreshing" @refresh="onRefresh">
        <List
          v-model:loading="loading"
          :finished="finished"
          finished-text="没有更多盘点单"
          @load="onLoad"
        >
          <div v-if="checkList.length === 0 && !loading" class="empty-state">
            <Empty description="暂无盘点单" />
          </div>
          
          <div v-for="item in checkList" :key="item.id" class="check-item" @click="viewCheckDetail(item.id)">
            <Card class="check-card">
              <div class="check-header">
                <div class="check-no">{{ item.check_no }}</div>
                <Tag 
                  :type="getStatusType(item.status)" 
                  size="medium"
                >
                  {{ getStatusText(item.status) }}
                </Tag>
              </div>
              
              <div class="check-info">
                <div class="info-row">
                  <span class="label">盘点类型:</span>
                  <span class="value">{{ getCheckTypeText(item.check_type) }}</span>
                </div>
                <div class="info-row">
                  <span class="label">仓库/库区:</span>
                  <span class="value">{{ item.warehouse }}</span>
                </div>
                <div class="info-row">
                  <span class="label">盘点日期:</span>
                  <span class="value">{{ item.check_date }}</span>
                </div>
                <div class="info-row">
                  <span class="label">盘点物料:</span>
                  <span class="value">{{ item.item_count || 0 }}种</span>
                </div>
              </div>
              
              <div class="check-actions" v-if="item.status !== 'cancelled'">
                <template v-if="item.status === 'draft'">
                  <Button 
                    size="small" 
                    type="primary" 
                    @click.stop="editCheck(item.id)"
                  >编辑</Button>
                  <Button 
                    size="small" 
                    type="success" 
                    @click.stop="updateStatus(item.id, 'in_progress')"
                  >开始盘点</Button>
                </template>
                <template v-else-if="item.status === 'in_progress'">
                  <Button 
                    size="small" 
                    type="success" 
                    @click.stop="updateStatus(item.id, 'completed')"
                  >完成盘点</Button>
                </template>
                <template v-else-if="item.status === 'completed' && item.profit_loss !== 0">
                  <Button 
                    size="small" 
                    type="warning" 
                    @click.stop="adjustInventory(item.id)"
                  >调整库存</Button>
                </template>
              </div>
            </Card>
          </div>
        </List>
      </PullRefresh>
      
      <!-- 新建按钮 -->
      <div class="fab-button">
        <Button 
          type="primary" 
          icon="plus"
          size="large"
          round
          @click="createNewCheck"
        />
      </div>
    </div>
    
    <!-- 确认对话框 -->
    <Dialog 
      v-model:show="confirmDialogVisible"
      title="确认操作"
      show-cancel-button
      @confirm="handleConfirm"
    >
      <div class="dialog-content">
        {{ confirmMessage }}
      </div>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { NavBar, Search, Empty, Card, Tag, Button, PullRefresh, List, Dialog, showToast } from 'vant';
import { inventoryApi } from '@/services/api';

const router = useRouter();
const searchValue = ref('');
const refreshing = ref(false);
const loading = ref(false);
const finished = ref(false);
const checkList = ref([]);
const currentStatus = ref('');
const confirmDialogVisible = ref(false);
const confirmMessage = ref('');
const currentAction = ref(null);
const actionItem = ref(null);

// 盘点单统计数据
const checkStats = ref({
  total: 0,
  draftCount: 0,
  pendingCount: 0,
  completeCount: 0,
  accuracyRate: 0,
  profitLossAmount: 0
});

// 分页参数
const pagination = reactive({
  page: 1,
  limit: 10,
  total: 0
});

// 状态选项
const statusOptions = [
  { value: 'draft', label: '草稿' },
  { value: 'in_progress', label: '进行中' },
  { value: 'completed', label: '已完成' },
  { value: 'cancelled', label: '已取消' }
];

// 盘点类型选项
const checkTypeOptions = [
  { value: 'cycle', label: '周期盘点' },
  { value: 'random', label: '随机盘点' },
  { value: 'full', label: '全面盘点' },
  { value: 'special', label: '专项盘点' }
];

// 返回上一页
const onClickLeft = () => {
  router.push('/inventory');
};

// 搜索
const onSearch = (val) => {
  searchValue.value = val;
  resetList();
  loadCheckList();
};

// 下拉刷新
const onRefresh = () => {
  resetList();
  loadCheckList().finally(() => {
    refreshing.value = false;
    showToast('刷新成功');
  });
};

// 筛选状态
const filterByStatus = (status) => {
  currentStatus.value = status;
  resetList();
  loadCheckList();
};

// 重置列表
const resetList = () => {
  checkList.value = [];
  pagination.page = 1;
  finished.value = false;
};

// 加载更多
const onLoad = () => {
  loadCheckList();
};

// 查看盘点单详情
const viewCheckDetail = (id) => {
  router.push(`/inventory/check/${id}`);
};

// 编辑盘点单
const editCheck = (id) => {
  router.push(`/inventory/check/${id}/edit`);
};

// 更新盘点单状态
const updateStatus = (id, status) => {
  confirmMessage.value = `确定要将盘点单状态更新为"${getStatusText(status)}"吗？`;
  currentAction.value = 'updateStatus';
  actionItem.value = { id, status };
  confirmDialogVisible.value = true;
};

// 调整库存
const adjustInventory = (id) => {
  confirmMessage.value = '确定要根据盘点结果调整库存吗？';
  currentAction.value = 'adjustInventory';
  actionItem.value = { id };
  confirmDialogVisible.value = true;
};

// 创建新的盘点单
const createNewCheck = () => {
  router.push('/inventory/check/new');
};

// 确认操作
const handleConfirm = async () => {
  try {
    if (currentAction.value === 'updateStatus') {
      await inventoryApi.updateCheckStatus(actionItem.value.id, actionItem.value.status);
      showToast('状态更新成功');
    } else if (currentAction.value === 'adjustInventory') {
      await inventoryApi.adjustInventory(actionItem.value.id);
      showToast('库存调整成功');
    }
    
    // 刷新列表
    resetList();
    await loadCheckList();
    await loadCheckStats();
  } catch (error) {
    console.error('操作失败:', error);
    showToast('操作失败：' + (error.message || '未知错误'));
  }
};

// 获取状态文本
const getStatusText = (status) => {
  const statusMap = {
    'draft': '草稿',
    'in_progress': '进行中',
    'pending': '待审核',
    'completed': '已完成',
    'cancelled': '已取消'
  };
  return statusMap[status] || status;
};

// 获取状态颜色类型
const getStatusType = (status) => {
  const statusMap = {
    'draft': 'default',
    'in_progress': 'warning',
    'pending': 'primary',
    'completed': 'success',
    'cancelled': 'danger'
  };
  return statusMap[status] || 'default';
};

// 获取盘点类型文本
const getCheckTypeText = (type) => {
  const typeMap = {
    'cycle': '周期盘点',
    'random': '随机盘点',
    'full': '全面盘点',
    'special': '专项盘点'
  };
  return typeMap[type] || type;
};

// 加载盘点单列表
const loadCheckList = async () => {
  if (loading.value) return;
  
  loading.value = true;
  try {
    // 构建检索参数
    const params = {
      page: pagination.page,
      limit: pagination.limit,
      check_no: searchValue.value || undefined,
      status: currentStatus.value || undefined
    };
    
    const response = await inventoryApi.getCheckList(params);
    
    if (response.data && Array.isArray(response.data)) {
      // 兼容返回数组的情况
      checkList.value = [...checkList.value, ...response.data];
      finished.value = response.data.length < pagination.limit;
    } else if (response.data && response.data.items) {
      // 兼容返回分页对象的情况
      checkList.value = [...checkList.value, ...response.data.items];
      pagination.total = response.data.total || 0;
      finished.value = checkList.value.length >= pagination.total;
    } else {
      finished.value = true;
    }
    
    pagination.page++;
  } catch (error) {
    console.error('获取盘点单列表失败:', error);
    showToast('获取盘点单列表失败');
    finished.value = true;
  } finally {
    loading.value = false;
  }
};

// 加载盘点单统计数据
const loadCheckStats = async () => {
  try {
    const response = await inventoryApi.getCheckStatistics();
    if (response && response.data) {
      checkStats.value = response.data;
    }
  } catch (error) {
    console.error('获取盘点单统计数据失败:', error);
    // 使用默认值
    checkStats.value = {
      total: 0,
      draftCount: 0,
      pendingCount: 0,
      completeCount: 0,
      accuracyRate: 0,
      profitLossAmount: 0
    };
  }
};

onMounted(async () => {
  await loadCheckStats();
  await loadCheckList();
});
</script>

<style lang="scss" scoped>
.status-stats {
  display: flex;
  justify-content: space-between;
  margin: $margin-md 0;
  background-color: white;
  border-radius: $border-radius-md;
  padding: $padding-sm 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.stat-item {
  flex: 1;
  text-align: center;
  padding: $padding-sm 0;
  border-right: 1px solid $border-color;
  
  &:last-child {
    border-right: none;
  }
  
  &.active {
    background-color: rgba($primary-color, 0.1);
    
    .stat-value {
      color: $primary-color;
    }
  }
}

.stat-value {
  font-size: $font-size-lg;
  font-weight: bold;
  color: $text-color;
}

.stat-label {
  font-size: $font-size-xs;
  color: $text-color-secondary;
  margin-top: 4px;
}

.check-item {
  margin-bottom: $margin-sm;
}

.check-card {
  padding: 0;
}

.check-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: $padding-sm;
  border-bottom: 1px solid $border-color;
  background-color: #f9f9f9;
}

.check-no {
  font-weight: bold;
  color: $text-color;
}

.check-info {
  padding: $padding-md;
}

.info-row {
  display: flex;
  margin-bottom: 8px;
  
  &:last-child {
    margin-bottom: 0;
  }
  
  .label {
    color: $text-color-secondary;
    min-width: 80px;
  }
  
  .value {
    color: $text-color;
    flex: 1;
  }
}

.check-actions {
  display: flex;
  justify-content: flex-end;
  padding: $padding-xs $padding-md $padding-md;
  
  button {
    margin-left: $margin-xs;
  }
}

.fab-button {
  position: fixed;
  right: $padding-lg;
  bottom: 80px;
  z-index: 99;
}

.dialog-content {
  padding: $padding-md 0;
  text-align: center;
}
</style> 