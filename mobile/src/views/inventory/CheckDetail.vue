<!--
/**
 * CheckDetail.vue
 * @description 移动端应用文件
  * @date 2025-08-27
 * @version 1.0.0
 */
-->
<template>
  <div class="page-container">
    <NavBar
      title="盘点单详情"
      left-arrow
      @click-left="onClickLeft"
    />
    
    <div class="content-container">
      <div v-if="loading" class="loading-container">
        <Loading type="spinner" color="#1989fa" />
        <p class="loading-text">加载中...</p>
      </div>
      
      <template v-else>
        <!-- 基本信息 -->
        <div class="card">
          <div class="card-header">
            <div class="check-no">{{ checkDetail.check_no }}</div>
            <Tag 
              :type="getStatusType(checkDetail.status)" 
              size="medium"
            >
              {{ getStatusText(checkDetail.status) }}
            </Tag>
          </div>
          
          <div class="card-content">
            <div class="info-row">
              <span class="label">盘点日期：</span>
              <span class="value">{{ checkDetail.check_date }}</span>
            </div>
            <div class="info-row">
              <span class="label">盘点类型：</span>
              <span class="value">{{ getCheckTypeText(checkDetail.check_type) }}</span>
            </div>
            <div class="info-row">
              <span class="label">仓库/库区：</span>
              <span class="value">{{ checkDetail.warehouse }}</span>
            </div>
            <div class="info-row">
              <span class="label">创建人：</span>
              <span class="value">{{ checkDetail.creator || '-' }}</span>
            </div>
            <div class="info-row" v-if="checkDetail.status === 'completed'">
              <span class="label">盘点结果：</span>
              <span class="value" :class="getResultClass(checkDetail.profit_loss)">
                {{ getResultText(checkDetail.profit_loss) }}
              </span>
            </div>
          </div>
        </div>
        
        <!-- 描述和备注 -->
        <div class="card">
          <div class="card-header">描述与备注</div>
          <div class="card-content">
            <div class="info-block">
              <div class="info-title">盘点描述</div>
              <div class="info-content">{{ checkDetail.description || '无' }}</div>
            </div>
            <div class="info-block">
              <div class="info-title">备注</div>
              <div class="info-content">{{ checkDetail.remarks || '无' }}</div>
            </div>
          </div>
        </div>
        
        <!-- 物料明细 -->
        <div class="card">
          <div class="card-header">
            <div class="flex justify-between align-center">
              <span>物料明细</span>
              <span class="item-count">共 {{ checkDetail.items?.length || 0 }} 项</span>
            </div>
          </div>
          
          <div v-if="!checkDetail.items || checkDetail.items.length === 0" class="empty-tips">
            暂无物料明细
          </div>
          
          <div v-else class="card-content p-xs">
            <div 
              v-for="(item, index) in checkDetail.items" 
              :key="index" 
              class="material-item"
            >
              <div class="material-header">
                <span class="material-code">{{ item.material_code }}</span>
                <span 
                  class="diff-quantity" 
                  :class="getDiffClass(item.book_qty, item.actual_qty)"
                >
                  {{ getDiffText(item.book_qty, item.actual_qty) }}
                </span>
              </div>
              
              <div class="material-name">{{ item.material_name }}</div>
              
              <div class="material-info">
                <div class="info-col">
                  <div class="info-label">账面数量</div>
                  <div class="info-value">{{ item.book_qty }} {{ item.unit_name }}</div>
                </div>
                <div class="info-col">
                  <div class="info-label">实盘数量</div>
                  <div class="info-value">{{ item.actual_qty }} {{ item.unit_name }}</div>
                </div>
              </div>
              
              <div class="material-remark" v-if="item.remarks">
                <div class="info-label">备注</div>
                <div class="info-value">{{ item.remarks }}</div>
              </div>
            </div>
          </div>
        </div>
      </template>
      
      <!-- 底部操作栏 -->
      <div class="bottom-action-bar">
        <template v-if="checkDetail.status === 'draft'">
          <Button 
            type="primary" 
            size="small" 
            @click="editCheck"
          >编辑</Button>
          <Button 
            type="success" 
            size="small" 
            @click="updateStatus('in_progress')"
          >开始盘点</Button>
        </template>
        <template v-if="checkDetail.status === 'in_progress'">
          <Button 
            type="success" 
            size="small" 
            @click="updateStatus('completed')"
          >完成盘点</Button>
        </template>
        <template v-if="checkDetail.status === 'completed' && checkDetail.profit_loss !== 0">
          <Button 
            type="warning" 
            size="small" 
            @click="adjustInventory"
          >调整库存</Button>
        </template>
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
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { NavBar, Tag, Loading, Button, Dialog, showToast } from 'vant';
import { inventoryApi } from '@/services/api';

const router = useRouter();
const route = useRoute();
const loading = ref(true);
const checkDetail = ref({});
const confirmDialogVisible = ref(false);
const confirmMessage = ref('');
const currentAction = ref(null);

// 返回上一页
const onClickLeft = () => {
  router.push('/inventory/check');
};

// 编辑盘点单
const editCheck = () => {
  router.push(`/inventory/check/${checkDetail.value.id}/edit`);
};

// 更新盘点单状态
const updateStatus = (status) => {
  confirmMessage.value = `确定要将盘点单状态更新为"${getStatusText(status)}"吗？`;
  currentAction.value = { type: 'updateStatus', status };
  confirmDialogVisible.value = true;
};

// 调整库存
const adjustInventory = () => {
  confirmMessage.value = '确定要根据盘点结果调整库存吗？';
  currentAction.value = { type: 'adjustInventory' };
  confirmDialogVisible.value = true;
};

// 确认操作
const handleConfirm = async () => {
  try {
    if (currentAction.value.type === 'updateStatus') {
      await inventoryApi.updateCheckStatus(checkDetail.value.id, currentAction.value.status);
      showToast('状态更新成功');
    } else if (currentAction.value.type === 'adjustInventory') {
      await inventoryApi.adjustInventory(checkDetail.value.id);
      showToast('库存调整成功');
    }
    
    // 刷新详情
    await loadCheckDetail();
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

// 获取盘点结果文本
const getResultText = (profitLoss) => {
  if (!profitLoss) return '无差异';
  return profitLoss > 0 ? `盘盈 +${profitLoss}` : `盘亏 ${profitLoss}`;
};

// 获取盘点结果样式
const getResultClass = (profitLoss) => {
  if (!profitLoss) return '';
  return profitLoss > 0 ? 'profit-text' : 'loss-text';
};

// 计算数量差异
const getDiffText = (bookQty, actualQty) => {
  if (bookQty === undefined || actualQty === undefined) return '0';
  const diff = actualQty - bookQty;
  return diff > 0 ? `+${diff}` : `${diff}`;
};

// 获取差异样式
const getDiffClass = (bookQty, actualQty) => {
  if (bookQty === undefined || actualQty === undefined) return '';
  
  const diff = actualQty - bookQty;
  if (diff > 0) return 'profit-text';
  if (diff < 0) return 'loss-text';
  return '';
};

// 加载盘点单详情
const loadCheckDetail = async () => {
  try {
    loading.value = true;
    const id = route.params.id;
    
    const response = await inventoryApi.getCheckDetail(id);
    if (response && response.data) {
      checkDetail.value = response.data;
    } else {
      showToast('获取盘点单详情失败');
      router.push('/inventory/check');
    }
  } catch (error) {
    console.error('获取盘点单详情失败:', error);
    showToast('获取盘点单详情失败');
    router.push('/inventory/check');
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadCheckDetail();
});
</script>

<style lang="scss" scoped>
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
}

.loading-text {
  margin-top: $margin-sm;
  color: $text-color-secondary;
}

.check-no {
  font-weight: bold;
  font-size: $font-size-lg;
}

.info-row {
  display: flex;
  margin-bottom: $margin-xs;
  
  &:last-child {
    margin-bottom: 0;
  }
  
  .label {
    color: $text-color-secondary;
    min-width: 80px;
  }
  
  .value {
    flex: 1;
    color: $text-color;
  }
}

.info-block {
  margin-bottom: $margin-md;
  
  &:last-child {
    margin-bottom: 0;
  }
  
  .info-title {
    font-size: $font-size-sm;
    color: $text-color-secondary;
    margin-bottom: $margin-xs;
  }
  
  .info-content {
    color: $text-color;
    word-break: break-all;
  }
}

.item-count {
  font-size: $font-size-sm;
  color: $text-color-secondary;
}

.empty-tips {
  padding: $padding-md;
  text-align: center;
  color: $text-color-secondary;
}

.material-item {
  background-color: #f9f9f9;
  border-radius: $border-radius-md;
  padding: $padding-md;
  margin-bottom: $margin-sm;
  
  &:last-child {
    margin-bottom: 0;
  }
}

.material-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $margin-xs;
}

.material-code {
  font-size: $font-size-sm;
  color: $text-color-secondary;
}

.diff-quantity {
  font-weight: bold;
}

.material-name {
  font-weight: bold;
  margin-bottom: $margin-sm;
}

.material-info {
  display: flex;
  justify-content: space-between;
}

.info-col {
  flex: 1;
}

.info-label {
  font-size: $font-size-xs;
  color: $text-color-secondary;
  margin-bottom: 2px;
}

.info-value {
  color: $text-color;
}

.material-remark {
  margin-top: $margin-sm;
  padding-top: $margin-sm;
  border-top: 1px dashed $border-color;
}

.bottom-action-bar {
  display: flex;
  justify-content: flex-end;
  padding: $padding-sm;
  
  button {
    margin-left: $margin-xs;
  }
}

.dialog-content {
  padding: $padding-md 0;
  text-align: center;
}
</style> 