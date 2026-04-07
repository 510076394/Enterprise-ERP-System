<!--
/**
 * Accounts.vue
 * @description 移动端应用文件
  * @date 2025-08-27
 * @version 1.0.0
 */
-->
<template>
  <div class="accounts-page">
    <NavBar title="会计科目" left-arrow @click-left="$router.go(-1)">
      <template #right>
        <Icon name="plus" size="18" @click="showCreateDialog = true" />
      </template>
    </NavBar>
    
    <div class="content-container">
      <!-- 搜索栏 -->
      <div class="search-section">
        <Search 
          v-model="searchKeyword" 
          placeholder="搜索科目代码或名称"
          @search="handleSearch"
          @clear="handleClear"
        />
      </div>

      <!-- 科目类型筛选 -->
      <div class="filter-section">
        <div class="filter-tabs">
          <div 
            v-for="type in accountTypes" 
            :key="type.value"
            class="filter-tab"
            :class="{ active: selectedType === type.value }"
            @click="selectType(type.value)"
          >
            {{ type.label }}
          </div>
        </div>
      </div>

      <!-- 科目列表 -->
      <div class="accounts-list">
        <PullRefresh v-model="refreshing" @refresh="onRefresh">
          <List
            v-model:loading="loading"
            :finished="finished"
            finished-text="没有更多了"
            @load="onLoad"
          >
            <div v-for="account in accounts" :key="account.id" class="account-item">
              <div class="account-info" @click="viewAccount(account)">
                <div class="account-header">
                  <div class="account-code">{{ account.account_code }}</div>
                  <div class="account-type-badge" :class="getTypeBadgeClass(account.account_type)">
                    {{ getTypeLabel(account.account_type) }}
                  </div>
                </div>
                <div class="account-name">{{ account.account_name }}</div>
                <div class="account-details">
                  <span class="balance">余额: ¥{{ formatMoney(account.balance || 0) }}</span>
                  <span class="status" :class="{ active: account.is_active }">
                    {{ account.is_active ? '启用' : '停用' }}
                  </span>
                </div>
              </div>
              <div class="account-actions">
                <Icon name="edit" size="16" @click="editAccount(account)" />
              </div>
            </div>
          </List>
        </PullRefresh>
      </div>
    </div>

    <!-- 新建/编辑科目弹窗 -->
    <Popup v-model:show="showCreateDialog" position="bottom" :style="{ height: '80%' }">
      <div class="create-dialog">
        <div class="dialog-header">
          <div class="dialog-title">{{ editingAccount ? '编辑科目' : '新建科目' }}</div>
          <Icon name="cross" size="18" @click="closeDialog" />
        </div>
        
        <div class="dialog-content">
          <Form @submit="handleSubmit">
            <Field
              v-model="formData.account_code"
              name="account_code"
              label="科目代码"
              placeholder="请输入科目代码"
              :rules="[{ required: true, message: '请输入科目代码' }]"
            />
            
            <Field
              v-model="formData.account_name"
              name="account_name"
              label="科目名称"
              placeholder="请输入科目名称"
              :rules="[{ required: true, message: '请输入科目名称' }]"
            />
            
            <Field
              name="account_type"
              label="科目类型"
              placeholder="请选择科目类型"
              readonly
              :value="getTypeLabel(formData.account_type)"
              @click="showTypePicker = true"
              :rules="[{ required: true, message: '请选择科目类型' }]"
            />
            
            <Field
              v-model="formData.parent_code"
              name="parent_code"
              label="上级科目"
              placeholder="请输入上级科目代码（可选）"
            />
            
            <Field
              v-model="formData.description"
              name="description"
              label="科目说明"
              type="textarea"
              placeholder="请输入科目说明（可选）"
              rows="3"
            />
            
            <div class="form-item">
              <div class="form-label">是否启用</div>
              <Switch v-model="formData.is_active" />
            </div>
            
            <div class="form-actions">
              <Button type="default" @click="closeDialog">取消</Button>
              <Button type="primary" native-type="submit" :loading="submitting">
                {{ editingAccount ? '更新' : '创建' }}
              </Button>
            </div>
          </Form>
        </div>
      </div>
    </Popup>

    <!-- 科目类型选择器 -->
    <Popup v-model:show="showTypePicker" position="bottom">
      <Picker
        :columns="accountTypeOptions"
        @confirm="onTypeConfirm"
        @cancel="showTypePicker = false"
      />
    </Popup>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { 
  NavBar, Icon, Search, PullRefresh, List, Popup, Form, Field, 
  Button, Switch, Picker, showToast, showConfirmDialog 
} from 'vant';
import { financeApi } from '@/services/api';

const router = useRouter();

// 响应式数据
const accounts = ref([]);
const loading = ref(false);
const finished = ref(false);
const refreshing = ref(false);
const searchKeyword = ref('');
const selectedType = ref('');
const showCreateDialog = ref(false);
const showTypePicker = ref(false);
const editingAccount = ref(null);
const submitting = ref(false);

// 表单数据
const formData = reactive({
  account_code: '',
  account_name: '',
  account_type: '',
  parent_code: '',
  description: '',
  is_active: true
});

// 科目类型配置
const accountTypes = [
  { label: '全部', value: '' },
  { label: '资产', value: 'assets' },
  { label: '负债', value: 'liabilities' },
  { label: '所有者权益', value: 'equity' },
  { label: '成本', value: 'costs' },
  { label: '收入', value: 'revenue' },
  { label: '费用', value: 'expenses' }
];

const accountTypeOptions = accountTypes.filter(type => type.value !== '').map(type => ({
  text: type.label,
  value: type.value
}));

// 计算属性
const getTypeLabel = (type) => {
  const typeItem = accountTypes.find(item => item.value === type);
  return typeItem ? typeItem.label : type;
};

const getTypeBadgeClass = (type) => {
  const classMap = {
    'assets': 'assets',
    'liabilities': 'liabilities', 
    'equity': 'equity',
    'costs': 'costs',
    'revenue': 'revenue',
    'expenses': 'expenses'
  };
  return classMap[type] || 'default';
};

// 格式化金额
const formatMoney = (amount) => {
  if (!amount) return '0.00';
  return Number(amount).toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

// 加载科目列表
const loadAccounts = async (isRefresh = false) => {
  if (isRefresh) {
    accounts.value = [];
    finished.value = false;
  }

  try {
    const params = {
      page: Math.floor(accounts.value.length / 20) + 1,
      limit: 20,
      search: searchKeyword.value,
      account_type: selectedType.value
    };

    const response = await financeApi.getAccounts(params);
    const newAccounts = response.data.accounts || [];
    
    if (isRefresh) {
      accounts.value = newAccounts;
    } else {
      accounts.value.push(...newAccounts);
    }
    
    finished.value = newAccounts.length < 20;
  } catch (error) {
    console.error('加载科目列表失败:', error);
    showToast('加载失败，请重试');
  } finally {
    loading.value = false;
    refreshing.value = false;
  }
};

// 事件处理
const onLoad = () => {
  loading.value = true;
  loadAccounts();
};

const onRefresh = () => {
  refreshing.value = true;
  loadAccounts(true);
};

const handleSearch = () => {
  loadAccounts(true);
};

const handleClear = () => {
  searchKeyword.value = '';
  loadAccounts(true);
};

const selectType = (type) => {
  selectedType.value = type;
  loadAccounts(true);
};

const viewAccount = (account) => {
  router.push(`/finance/gl/accounts/${account.id}`);
};

const editAccount = (account) => {
  editingAccount.value = account;
  Object.assign(formData, {
    account_code: account.account_code,
    account_name: account.account_name,
    account_type: account.account_type,
    parent_code: account.parent_code || '',
    description: account.description || '',
    is_active: account.is_active
  });
  showCreateDialog.value = true;
};

const closeDialog = () => {
  showCreateDialog.value = false;
  editingAccount.value = null;
  Object.assign(formData, {
    account_code: '',
    account_name: '',
    account_type: '',
    parent_code: '',
    description: '',
    is_active: true
  });
};

const onTypeConfirm = ({ selectedOptions }) => {
  formData.account_type = selectedOptions[0].value;
  showTypePicker.value = false;
};

const handleSubmit = async () => {
  submitting.value = true;
  
  try {
    if (editingAccount.value) {
      await financeApi.updateAccount(editingAccount.value.id, formData);
      showToast('科目更新成功');
    } else {
      await financeApi.createAccount(formData);
      showToast('科目创建成功');
    }
    
    closeDialog();
    loadAccounts(true);
  } catch (error) {
    console.error('保存科目失败:', error);
    showToast('保存失败，请重试');
  } finally {
    submitting.value = false;
  }
};

onMounted(() => {
  loadAccounts(true);
});
</script>

<style lang="scss" scoped>
.accounts-page {
  min-height: 100vh;
  background-color: $background-color;
}

.content-container {
  padding: 0 12px 12px;
}

.search-section {
  padding: 12px 0;
}

.filter-section {
  margin-bottom: 12px;

  .filter-tabs {
    display: flex;
    background: #fff;
    border-radius: 8px;
    padding: 4px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

    .filter-tab {
      flex: 1;
      text-align: center;
      padding: 8px 12px;
      font-size: 14px;
      color: $text-color-secondary;
      border-radius: 6px;
      transition: all 0.2s;

      &.active {
        background-color: $primary-color;
        color: #fff;
      }
    }
  }
}

.accounts-list {
  .account-item {
    background: #fff;
    border-radius: 8px;
    margin-bottom: 8px;
    padding: 16px;
    display: flex;
    align-items: center;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

    .account-info {
      flex: 1;

      .account-header {
        display: flex;
        align-items: center;
        margin-bottom: 8px;

        .account-code {
          font-size: 16px;
          font-weight: 600;
          color: $text-color;
          margin-right: 8px;
        }

        .account-type-badge {
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 10px;
          color: #fff;

          &.assets { background-color: #5E7BF6; }
          &.liabilities { background-color: #FF6B6B; }
          &.equity { background-color: #2CCFB0; }
          &.costs { background-color: #FF9F45; }
          &.revenue { background-color: #A48BE0; }
          &.expenses { background-color: #FFC759; }
          &.default { background-color: #c8c9cc; }
        }
      }

      .account-name {
        font-size: 14px;
        color: $text-color;
        margin-bottom: 8px;
      }

      .account-details {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .balance {
          font-size: 12px;
          color: $text-color-secondary;
        }

        .status {
          font-size: 12px;
          color: #ff4444;

          &.active {
            color: #00c853;
          }
        }
      }
    }

    .account-actions {
      margin-left: 12px;
      color: $text-color-secondary;
    }
  }
}

.create-dialog {
  height: 100%;
  display: flex;
  flex-direction: column;

  .dialog-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px;
    border-bottom: 1px solid $border-color;

    .dialog-title {
      font-size: 16px;
      font-weight: 600;
      color: $text-color;
    }
  }

  .dialog-content {
    flex: 1;
    padding: 16px;
    overflow-y: auto;

    .form-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 0;
      border-bottom: 1px solid $border-color;

      .form-label {
        font-size: 14px;
        color: $text-color;
      }
    }

    .form-actions {
      display: flex;
      gap: 12px;
      margin-top: 24px;

      .van-button {
        flex: 1;
      }
    }
  }
}
</style>
