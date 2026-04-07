<!--
/**
 * Index.vue
 * @description 移动端应用文件
  * @date 2025-08-27
 * @version 1.0.0
 */
-->
<template>
  <div class="page-container">
    <NavBar
      title="销售管理"
      left-arrow
      @click-left="onClickLeft"
    />
    
    <div class="content-container">
      <!-- 统计卡片 -->
      <div class="stats-cards">
        <div class="stats-card">
          <div class="stats-value">{{ statistics.totalOrders || 0 }}</div>
          <div class="stats-label">销售订单</div>
        </div>
        <div class="stats-card">
          <div class="stats-value">{{ statistics.totalAmount || 0 }}</div>
          <div class="stats-label">销售金额</div>
        </div>
        <div class="stats-card">
          <div class="stats-value">{{ statistics.pendingOrders || 0 }}</div>
          <div class="stats-label">待处理</div>
        </div>
        <div class="stats-card">
          <div class="stats-value">{{ statistics.completedOrders || 0 }}</div>
          <div class="stats-label">已完成</div>
        </div>
      </div>
      
      <!-- 功能菜单 -->
      <div class="function-menu">
        <div class="menu-section">
          <div class="section-title">销售订单</div>
          <div class="menu-grid">
            <div class="menu-item" @click="navigateTo('/sales/orders')">
              <Icon name="notes-o" size="24" color="#5E7BF6" />
              <span>销售订单</span>
            </div>
            <div class="menu-item" @click="navigateTo('/sales/orders/new')">
              <Icon name="plus" size="24" color="#2CCFB0" />
              <span>新建订单</span>
            </div>
          </div>
        </div>
        
        <div class="menu-section">
          <div class="section-title">销售出库</div>
          <div class="menu-grid">
            <div class="menu-item" @click="navigateTo('/sales/outbound')">
              <Icon name="send-gift-o" size="24" color="#FF6B6B" />
              <span>销售出库</span>
            </div>
            <div class="menu-item" @click="navigateTo('/sales/outbound/new')">
              <Icon name="add-o" size="24" color="#FF9F45" />
              <span>新建出库</span>
            </div>
          </div>
        </div>
        
        <div class="menu-section">
          <div class="section-title">售后管理</div>
          <div class="menu-grid">
            <div class="menu-item" @click="navigateTo('/sales/returns')">
              <Icon name="revoke" size="24" color="#A48BE0" />
              <span>销售退货</span>
            </div>
            <div class="menu-item" @click="navigateTo('/sales/exchanges')">
              <Icon name="exchange" size="24" color="#FFC759" />
              <span>销售换货</span>
            </div>
          </div>
        </div>
        
        <div class="menu-section">
          <div class="section-title">客户管理</div>
          <div class="menu-grid">
            <div class="menu-item" @click="navigateTo('/sales/customers')">
              <Icon name="friends-o" size="24" color="#5E7BF6" />
              <span>客户管理</span>
            </div>
            <div class="menu-item" @click="navigateTo('/sales/quotations')">
              <Icon name="chart-trending-o" size="24" color="#2CCFB0" />
              <span>报价统计</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 最近订单 -->
      <div class="recent-orders" v-if="recentOrders.length > 0">
        <div class="section-header">
          <h3>最近订单</h3>
          <span class="more-link" @click="navigateTo('/sales/orders')">查看全部</span>
        </div>
        
        <Card v-for="order in recentOrders" :key="order.id" class="order-card">
          <div class="order-item" @click="navigateTo(`/sales/orders/${order.id}`)">
            <div class="order-header">
              <span class="order-no">{{ order.order_no }}</span>
              <Tag :type="getOrderStatusType(order.status)" size="medium">
                {{ getOrderStatusText(order.status) }}
              </Tag>
            </div>
            <div class="order-customer">{{ order.customer_name }}</div>
            <div class="order-details">
              <div class="order-info">
                <span class="label">订单金额:</span>
                <span class="value">¥{{ formatAmount(order.total_amount) }}</span>
              </div>
              <div class="order-info">
                <span class="label">订单日期:</span>
                <span class="value">{{ formatDate(order.order_date) }}</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { NavBar, Icon, Card, Tag, showToast } from 'vant';
import { salesApi } from '@/services/api';
import { formatDate } from '@/utils/date';

const router = useRouter();
const statistics = ref({});
const recentOrders = ref([]);

// 返回首页
const onClickLeft = () => {
  router.push('/');
};

// 导航到指定页面
const navigateTo = (path) => {
  if (path.includes('new') || path.includes('customers') || path.includes('quotations') || path.includes('exchanges')) {
    showToast('功能开发中');
    return;
  }
  router.push(path);
};

import { getSalesStatusText, getSalesStatusColor } from '@/constants/systemConstants'

// 获取订单状态类型（使用统一常量）
const getOrderStatusType = (status) => {
  return getSalesStatusColor(status) || 'default';
};

// 获取订单状态文本（使用统一常量）
const getOrderStatusText = (status) => {
  return getSalesStatusText(status);
};

// 格式化金额
const formatAmount = (amount) => {
  if (!amount) return '0.00';
  return parseFloat(amount).toFixed(2);
};

// 获取统计数据
const getStatistics = async () => {
  try {
    const response = await salesApi.getSalesStatistics();
    if (response.data) {
      statistics.value = response.data;
    }
  } catch (error) {
    console.error('获取销售统计数据失败:', error);
  }
};

// 获取最近订单
const getRecentOrders = async () => {
  try {
    const response = await salesApi.getSalesOrders({ 
      page: 1, 
      limit: 5,
      sort: 'created_at',
      order: 'desc'
    });
    if (response.data && response.data.items) {
      recentOrders.value = response.data.items;
    }
  } catch (error) {
    console.error('获取最近订单失败:', error);
  }
};

onMounted(() => {
  getStatistics();
  getRecentOrders();
});
</script>

<style lang="scss" scoped>
.stats-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: $margin-sm;
  margin: $margin-md;
}

.stats-card {
  background-color: white;
  padding: $padding-md;
  border-radius: $border-radius-md;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  
  .stats-value {
    font-size: 18px;
    font-weight: bold;
    color: $primary-color;
    margin-bottom: 4px;
  }
  
  .stats-label {
    font-size: $font-size-xs;
    color: $text-color-secondary;
  }
}

.function-menu {
  margin: $margin-md;
}

.menu-section {
  background-color: white;
  border-radius: $border-radius-md;
  margin-bottom: $margin-md;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  
  .section-title {
    padding: $padding-md;
    font-size: $font-size-md;
    font-weight: bold;
    border-bottom: 1px solid $border-color;
    background-color: #f8f9fa;
  }
  
  .menu-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    
    .menu-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: $padding-lg;
      border-right: 1px solid $border-color;
      border-bottom: 1px solid $border-color;
      
      &:nth-child(2n) {
        border-right: none;
      }
      
      &:nth-last-child(-n+2) {
        border-bottom: none;
      }
      
      span {
        margin-top: $margin-xs;
        font-size: $font-size-sm;
        color: $text-color;
      }
    }
  }
}

.recent-orders {
  margin: $margin-md;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $margin-md;
  
  h3 {
    font-size: $font-size-lg;
    margin: 0;
  }
  
  .more-link {
    font-size: $font-size-sm;
    color: $primary-color;
  }
}

.order-card {
  margin-bottom: $margin-md;
}

.order-item {
  padding: $padding-xs 0;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $margin-xs;
}

.order-no {
  font-size: $font-size-sm;
  color: $text-color-secondary;
}

.order-customer {
  font-size: $font-size-lg;
  font-weight: bold;
  margin-bottom: $margin-sm;
}

.order-details {
  display: flex;
  justify-content: space-between;
}

.order-info {
  .label {
    font-size: $font-size-xs;
    color: $text-color-secondary;
    margin-right: 4px;
  }
  
  .value {
    font-size: $font-size-sm;
    color: $text-color;
  }
}
</style>
