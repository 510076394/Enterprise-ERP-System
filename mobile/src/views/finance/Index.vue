<!--
/**
 * Index.vue
 * @description 移动端应用文件
  * @date 2025-08-27
 * @version 1.0.0
 */
-->
<template>
  <div class="finance-page">
    <NavBar title="财务管理" left-arrow @click-left="$router.go(-1)" />
    
    <div class="content-container">
      <!-- 财务概览卡片 -->
      <div class="overview-cards">
        <div class="overview-card">
          <div class="card-icon">
            <Icon name="balance-o" size="24" color="#5E7BF6" />
          </div>
          <div class="card-content">
            <div class="card-value">¥{{ formatMoney(statistics.totalAssets) }}</div>
            <div class="card-label">总资产</div>
          </div>
        </div>
        
        <div class="overview-card">
          <div class="card-icon">
            <Icon name="gold-coin-o" size="24" color="#FF6B6B" />
          </div>
          <div class="card-content">
            <div class="card-value">¥{{ formatMoney(statistics.totalRevenue) }}</div>
            <div class="card-label">本月收入</div>
          </div>
        </div>
        
        <div class="overview-card">
          <div class="card-icon">
            <Icon name="shopping-cart-o" size="24" color="#2CCFB0" />
          </div>
          <div class="card-content">
            <div class="card-value">¥{{ formatMoney(statistics.totalExpense) }}</div>
            <div class="card-label">本月支出</div>
          </div>
        </div>
        
        <div class="overview-card">
          <div class="card-icon">
            <Icon name="chart-trending-o" size="24" color="#FF9F45" />
          </div>
          <div class="card-content">
            <div class="card-value">¥{{ formatMoney(statistics.netProfit) }}</div>
            <div class="card-label">净利润</div>
          </div>
        </div>
      </div>

      <!-- 快捷操作 -->
      <div class="quick-actions">
        <div class="section-title">快捷操作</div>
        <div class="actions-grid">
          <div class="action-item" @click="navigateTo('/finance/gl/entries/create')">
            <div class="action-icon">
              <Icon name="add-o" size="20" color="#5E7BF6" />
            </div>
            <span class="action-text">新建凭证</span>
          </div>
          
          <div class="action-item" @click="navigateTo('/finance/ar/receipts/create')">
            <div class="action-icon">
              <Icon name="gold-coin-o" size="20" color="#2CCFB0" />
            </div>
            <span class="action-text">收款登记</span>
          </div>
          
          <div class="action-item" @click="navigateTo('/finance/ap/payments/create')">
            <div class="action-icon">
              <Icon name="shopping-cart-o" size="20" color="#FF6B6B" />
            </div>
            <span class="action-text">付款登记</span>
          </div>
          
          <div class="action-item" @click="navigateTo('/finance/cash/transactions/create')">
            <div class="action-icon">
              <Icon name="exchange" size="20" color="#FF9F45" />
            </div>
            <span class="action-text">银行交易</span>
          </div>
        </div>
      </div>

      <!-- 功能模块 -->
      <div class="function-modules">
        <div class="section-title">功能模块</div>
        
        <!-- 总账管理 -->
        <div class="module-group">
          <div class="group-title">
            <Icon name="balance-list-o" size="16" color="#5E7BF6" />
            <span>总账管理</span>
          </div>
          <div class="module-items">
            <div class="module-item" @click="navigateTo('/finance/gl/accounts')">
              <div class="item-content">
                <div class="item-title">会计科目</div>
                <div class="item-desc">科目设置与管理</div>
              </div>
              <Icon name="arrow" size="14" color="#c8c9cc" />
            </div>
            
            <div class="module-item" @click="navigateTo('/finance/gl/entries')">
              <div class="item-content">
                <div class="item-title">会计凭证</div>
                <div class="item-desc">凭证录入与查询</div>
              </div>
              <div class="item-badge">
                <Badge :content="pendingEntries" v-if="pendingEntries > 0" />
              </div>
              <Icon name="arrow" size="14" color="#c8c9cc" />
            </div>
            
            <div class="module-item" @click="navigateTo('/finance/gl/periods')">
              <div class="item-content">
                <div class="item-title">会计期间</div>
                <div class="item-desc">期间管理与结账</div>
              </div>
              <Icon name="arrow" size="14" color="#c8c9cc" />
            </div>
          </div>
        </div>

        <!-- 应收管理 -->
        <div class="module-group">
          <div class="group-title">
            <Icon name="gold-coin-o" size="16" color="#2CCFB0" />
            <span>应收管理</span>
          </div>
          <div class="module-items">
            <div class="module-item" @click="navigateTo('/finance/ar/invoices')">
              <div class="item-content">
                <div class="item-title">应收账款</div>
                <div class="item-desc">客户应收管理</div>
              </div>
              <Icon name="arrow" size="14" color="#c8c9cc" />
            </div>
            
            <div class="module-item" @click="navigateTo('/finance/ar/receipts')">
              <div class="item-content">
                <div class="item-title">收款管理</div>
                <div class="item-desc">收款登记与核销</div>
              </div>
              <Icon name="arrow" size="14" color="#c8c9cc" />
            </div>
            
            <div class="module-item" @click="navigateTo('/finance/ar/aging')">
              <div class="item-content">
                <div class="item-title">账龄分析</div>
                <div class="item-desc">应收账龄统计</div>
              </div>
              <Icon name="arrow" size="14" color="#c8c9cc" />
            </div>
          </div>
        </div>

        <!-- 应付管理 -->
        <div class="module-group">
          <div class="group-title">
            <Icon name="shopping-cart-o" size="16" color="#FF6B6B" />
            <span>应付管理</span>
          </div>
          <div class="module-items">
            <div class="module-item" @click="navigateTo('/finance/ap/invoices')">
              <div class="item-content">
                <div class="item-title">应付账款</div>
                <div class="item-desc">供应商应付管理</div>
              </div>
              <Icon name="arrow" size="14" color="#c8c9cc" />
            </div>
            
            <div class="module-item" @click="navigateTo('/finance/ap/payments')">
              <div class="item-content">
                <div class="item-title">付款管理</div>
                <div class="item-desc">付款登记与核销</div>
              </div>
              <Icon name="arrow" size="14" color="#c8c9cc" />
            </div>
            
            <div class="module-item" @click="navigateTo('/finance/ap/aging')">
              <div class="item-content">
                <div class="item-title">账龄分析</div>
                <div class="item-desc">应付账龄统计</div>
              </div>
              <Icon name="arrow" size="14" color="#c8c9cc" />
            </div>
          </div>
        </div>

        <!-- 固定资产 -->
        <div class="module-group">
          <div class="group-title">
            <Icon name="home-o" size="16" color="#A48BE0" />
            <span>固定资产</span>
          </div>
          <div class="module-items">
            <div class="module-item" @click="navigateTo('/finance/assets/list')">
              <div class="item-content">
                <div class="item-title">资产清单</div>
                <div class="item-desc">固定资产管理</div>
              </div>
              <Icon name="arrow" size="14" color="#c8c9cc" />
            </div>
            
            <div class="module-item" @click="navigateTo('/finance/assets/depreciation')">
              <div class="item-content">
                <div class="item-title">折旧管理</div>
                <div class="item-desc">折旧计算与处理</div>
              </div>
              <Icon name="arrow" size="14" color="#c8c9cc" />
            </div>
          </div>
        </div>

        <!-- 出纳管理 -->
        <div class="module-group">
          <div class="group-title">
            <Icon name="credit-pay" size="16" color="#FFC759" />
            <span>出纳管理</span>
          </div>
          <div class="module-items">
            <div class="module-item" @click="navigateTo('/finance/cash/accounts')">
              <div class="item-content">
                <div class="item-title">银行账户</div>
                <div class="item-desc">账户信息管理</div>
              </div>
              <Icon name="arrow" size="14" color="#c8c9cc" />
            </div>

            <div class="module-item" @click="navigateTo('/finance/cash/bank-transactions')">
              <div class="item-content">
                <div class="item-title">银行交易</div>
                <div class="item-desc">银行流水管理</div>
              </div>
              <Icon name="arrow" size="14" color="#c8c9cc" />
            </div>

            <div class="module-item" @click="navigateTo('/finance/cash/cash-transactions')">
              <div class="item-content">
                <div class="item-title">现金交易</div>
                <div class="item-desc">现金流水管理</div>
              </div>
              <Icon name="arrow" size="14" color="#c8c9cc" />
            </div>

            <div class="module-item" @click="navigateTo('/finance/cash/reconciliation')">
              <div class="item-content">
                <div class="item-title">银行对账</div>
                <div class="item-desc">对账单核对</div>
              </div>
              <Icon name="arrow" size="14" color="#c8c9cc" />
            </div>

            <div class="module-item" @click="navigateTo('/finance/reports/cash-flow')">
              <div class="item-content">
                <div class="item-title">出纳报表</div>
                <div class="item-desc">出纳月报表</div>
              </div>
              <Icon name="arrow" size="14" color="#c8c9cc" />
            </div>
          </div>
        </div>

        <!-- 财务报表 -->
        <div class="module-group">
          <div class="group-title">
            <Icon name="chart-trending-o" size="16" color="#FF8A80" />
            <span>财务报表</span>
          </div>
          <div class="module-items">
            <div class="module-item" @click="navigateTo('/finance/reports/balance-sheet')">
              <div class="item-content">
                <div class="item-title">资产负债表</div>
                <div class="item-desc">资产负债状况</div>
              </div>
              <Icon name="arrow" size="14" color="#c8c9cc" />
            </div>
            
            <div class="module-item" @click="navigateTo('/finance/reports/income-statement')">
              <div class="item-content">
                <div class="item-title">利润表</div>
                <div class="item-desc">收入支出分析</div>
              </div>
              <Icon name="arrow" size="14" color="#c8c9cc" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { NavBar, Icon, Badge, showToast } from 'vant';

const router = useRouter();

// 统计数据
const statistics = ref({
  totalAssets: 0,
  totalRevenue: 0,
  totalExpense: 0,
  netProfit: 0
});

// 待处理凭证数量
const pendingEntries = ref(0);

// 格式化金额
const formatMoney = (amount) => {
  if (!amount) return '0.00';
  return Number(amount).toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

// 导航到指定页面
const navigateTo = (path) => {
  if (!path) {
    showToast('功能正在开发中');
    return;
  }
  router.push(path);
};

// 获取财务统计数据
const getFinanceStatistics = async () => {
  try {
    // 这里调用API获取财务统计数据
    // const response = await financeApi.getStatistics();
    // statistics.value = response.data;
    
    // 模拟数据
    statistics.value = {
      totalAssets: 12500000,
      totalRevenue: 850000,
      totalExpense: 620000,
      netProfit: 230000
    };
    
    pendingEntries.value = 5;
  } catch (error) {
    console.error('获取财务统计数据失败:', error);
  }
};

onMounted(() => {
  getFinanceStatistics();
});
</script>

<style lang="scss" scoped>
.finance-page {
  min-height: 100vh;
  background-color: $background-color;
}

.content-container {
  padding: 12px;
}

.overview-cards {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}

.overview-card {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

  .card-icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    background-color: #f8f9fa;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 12px;
  }

  .card-content {
    flex: 1;

    .card-value {
      font-size: 18px;
      font-weight: bold;
      color: $text-color;
      margin-bottom: 2px;
    }

    .card-label {
      font-size: 12px;
      color: $text-color-secondary;
    }
  }
}

.quick-actions {
  margin-bottom: 20px;

  .section-title {
    font-size: 16px;
    font-weight: 600;
    color: $text-color;
    margin-bottom: 12px;
    padding-left: 4px;
  }

  .actions-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
    background: #fff;
    border-radius: 12px;
    padding: 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  }

  .action-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 12px 8px;
    border-radius: 8px;
    transition: background-color 0.2s;

    &:active {
      background-color: #f8f9fa;
    }

    .action-icon {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      background-color: #f8f9fa;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 8px;
    }

    .action-text {
      font-size: 12px;
      color: $text-color;
      text-align: center;
    }
  }
}

.function-modules {
  .section-title {
    font-size: 16px;
    font-weight: 600;
    color: $text-color;
    margin-bottom: 12px;
    padding-left: 4px;
  }
}

.module-group {
  background: #fff;
  border-radius: 12px;
  margin-bottom: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

  .group-title {
    display: flex;
    align-items: center;
    padding: 16px;
    background-color: #f8f9fa;
    border-bottom: 1px solid $border-color;

    span {
      font-size: 14px;
      font-weight: 600;
      color: $text-color;
      margin-left: 8px;
    }
  }

  .module-items {
    .module-item {
      display: flex;
      align-items: center;
      padding: 16px;
      border-bottom: 1px solid $border-color;
      transition: background-color 0.2s;

      &:last-child {
        border-bottom: none;
      }

      &:active {
        background-color: #f8f9fa;
      }

      .item-content {
        flex: 1;

        .item-title {
          font-size: 14px;
          font-weight: 500;
          color: $text-color;
          margin-bottom: 2px;
        }

        .item-desc {
          font-size: 12px;
          color: $text-color-secondary;
        }
      }

      .item-badge {
        margin-right: 8px;
      }
    }
  }
}
</style>
