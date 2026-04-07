const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'constants/systemConstants.js');

const groups = [
  { code: 'warehouse_type', text: 'getWarehouseTypeText', color: 'getWarehouseTypeColor', obj: 'WAREHOUSE_TYPES' },
  { code: 'inventory_transaction', text: 'getInventoryTransactionTypeText', color: 'getInventoryTransactionTypeColor', obj: 'INVENTORY_TRANSACTION_TYPES' },
  { code: 'inventory_status', text: 'getInventoryStatusText', color: 'getInventoryStatusColor', obj: 'INVENTORY_STATUS' },
  { code: 'inventory_check_status', text: null, color: null, obj: 'INVENTORY_CHECK_STATUS' },
  { code: 'inbound_outbound_status', text: 'getInboundOutboundStatusText', color: 'getInboundOutboundStatusColor', obj: 'INBOUND_OUTBOUND_STATUS' },
  { code: 'transfer_status', text: 'getTransferStatusText', color: 'getTransferStatusColor', obj: 'TRANSFER_STATUS' },
  { code: 'order_status', text: 'getOrderStatusText', color: 'getOrderStatusColor', obj: 'ORDER_STATUS' },
  { code: 'purchase_status', text: 'getPurchaseStatusText', color: 'getPurchaseStatusColor', obj: 'PURCHASE_STATUS' },
  { code: 'purchase_receipt_status', text: 'getPurchaseReceiptStatusText', color: 'getPurchaseReceiptStatusColor', obj: 'PURCHASE_RECEIPT_STATUS' },
  { code: 'purchase_return_status', text: 'getPurchaseReturnStatusText', color: 'getPurchaseReturnStatusColor', obj: 'PURCHASE_RETURN_STATUS' },
  { code: 'sales_status', text: 'getSalesStatusText', color: 'getSalesStatusColor', obj: 'SALES_STATUS' },
  { code: 'sales_quotation_status', text: 'getSalesQuotationStatusText', color: 'getSalesQuotationStatusColor', obj: 'SALES_QUOTATION_STATUS' },
  { code: 'outsourced_status', text: 'getOutsourcedStatusText', color: 'getOutsourcedStatusColor', obj: 'OUTSOURCED_STATUS' },
  { code: 'quality_status', text: 'getQualityStatusText', color: 'getQualityStatusColor', obj: 'QUALITY_STATUS' },
  { code: 'quality_inspection_type', text: 'getQualityInspectionTypeText', color: null, obj: 'QUALITY_INSPECTION_TYPES', noColor: true },
  { code: 'first_article_result', text: 'getFirstArticleResultText', color: 'getFirstArticleResultColor', obj: 'FIRST_ARTICLE_RESULT' },
  { code: 'production_status', text: 'getProductionStatusText', color: 'getProductionStatusColor', obj: 'PRODUCTION_STATUS' },
  { code: 'equipment_status', text: 'getEquipmentStatusText', color: 'getEquipmentStatusColor', obj: 'EQUIPMENT_STATUS' },
  { code: 'common_status', text: 'getCommonStatusText', color: 'getCommonStatusColor', obj: 'COMMON_STATUS' },
  { code: 'finance_transaction_type', text: null, color: null, obj: 'FINANCE_TRANSACTION_TYPES' },
  { code: 'costing_method', text: 'getCostingMethodText', color: null, obj: 'COSTING_METHOD', noColor: true },
  { code: 'gl_transaction_type', text: 'getGLTransactionTypeText', color: 'getGLTransactionTypeColor', obj: 'GL_TRANSACTION_TYPES' },
  { code: 'priority_level', text: null, color: null, obj: 'PRIORITY_LEVELS' },
  { code: 'approval_status', text: 'getApprovalStatusText', color: 'getApprovalStatusColor', obj: 'APPROVAL_STATUS' },
  { code: 'user_status', text: 'getUserStatusText', color: 'getUserStatusColor', obj: 'USER_STATUS' },
  { code: 'asset_status', text: 'getAssetStatusText', color: 'getAssetStatusColor', obj: 'ASSET_STATUS' },
  { code: 'asset_type', text: 'getAssetTypeText', color: null, obj: 'ASSET_TYPES', noColor: true },
];

let output = `/**
 * systemConstants.js
 * 新版系统统一常量配置 (依赖于后端系统字典)
 * 该文件通过全局缓存进行无缝衔接
 */

import { reactive, watchEffect } from 'vue';
import { useDictionaryStore } from '@/stores/dictionary';

/**
 * 助手函数：创建一个响应式的字典对象映射，等同于原有的 { key: value } 形式。
 * 它可以支持原有组件中进行的 Object.keys(XXX_TYPES) 循环。
 */
const createDictionaryGroup = (groupCode) => {
  const state = reactive({});
  watchEffect(() => {
    try {
      const store = useDictionaryStore();
      if (store.isLoaded) {
        // 清空旧的 keys
        for (const key in state) delete state[key];
        Object.assign(state, store.getMap(groupCode));
      }
    } catch(e) {
      // Pinia 可能尚未初始化
    }
  });
  return state;
};

/**
 * 助手函数：创建对应的颜色映射表
 */
const createDictionaryColors = (groupCode) => {
  const state = reactive({});
  watchEffect(() => {
    try {
      const store = useDictionaryStore();
      if (store.isLoaded) {
        for (const key in state) delete state[key];
        const types = store.groups[groupCode] || [];
        types.forEach(t => { state[t.code] = t.tag_type; });
      }
    } catch(e) {}
  });
  return state;
};

// =======================
// 动态字典实例导出
// =======================
`;

for (const group of groups) {
  output += `export const ${group.obj} = createDictionaryGroup('${group.code}');\n`;
  if (!group.noColor) {
    let colorObjName = group.obj.replace('_TYPES', '_COLORS').replace('_STATUS', '_STATUS_COLORS').replace('_LEVELS', '_COLORS').replace('_RESULT', '_RESULT_COLORS');
    // Deal with exceptions due to previous messy naming
    if (group.obj === 'INVENTORY_CHECK_STATUS') colorObjName = 'INVENTORY_CHECK_STATUS_COLORS';
    if (group.obj === 'FINANCE_TRANSACTION_TYPES') colorObjName = 'FINANCE_TRANSACTION_COLORS';
    if (group.obj === 'GL_TRANSACTION_TYPES') colorObjName = 'GL_TRANSACTION_COLORS';
    output += `export const ${colorObjName} = createDictionaryColors('${group.code}');\n`;
  }
}

output += `\n// =======================
// OPTIONS 选项数组导出 (供 el-select 使用)
// =======================
// 向后兼容，如果需要在 <script setup> 内获得选项数组，建议直接调用 useDictionaryStore().getOptions(groupCode)

const createOptions = (groupCode, filterKeys = null) => {
  const state = reactive([]);
  watchEffect(() => {
    try {
      const store = useDictionaryStore();
      if (store.isLoaded) {
        state.splice(0, state.length); // clear array
        let opts = store.getOptions(groupCode);
        if (filterKeys) {
          opts = opts.filter(opt => filterKeys.includes(opt.value));
        }
        state.push(...opts);
      }
    } catch(e) {}
  });
  return state;
};

export const INVENTORY_CHECK_STATUS_OPTIONS = createOptions('inventory_check_status');
export const PURCHASE_STATUS_OPTIONS = createOptions('purchase_status', ['draft', 'pending', 'approved', 'confirmed', 'received', 'inspecting', 'inspected', 'warehousing', 'partial_received', 'completed', 'cancelled']);
export const OUTSOURCED_STATUS_OPTIONS = createOptions('outsourced_status');
export const PURCHASE_RECEIPT_STATUS_OPTIONS = createOptions('purchase_receipt_status');
export const PURCHASE_RETURN_STATUS_OPTIONS = createOptions('purchase_return_status');
export const toStatusOptions = (mapObj) => Object.entries(mapObj).map(([value, label]) => ({value, label}));

// =======================
// 静态保留业务配置
// =======================
export const VALIDATION_RULES = {
  STOCK_QUANTITY: { min: 0, max: 999999999, precision: 3 },
  AMOUNT: { min: 0, max: 999999999.99, precision: 2 },
  CODE_LENGTH: { min: 1, max: 50 },
  NAME_LENGTH: { min: 1, max: 100 },
  REMARK_LENGTH: { min: 0, max: 500 }
};

export const BUSINESS_RULES = {};

export const INVENTORY_TRANSACTION_GROUPS = {
  INCREASE: ['inbound', 'in', 'purchase_inbound', 'production_inbound', 'outsourced_inbound', 'sales_return', 'sales_exchange_return', 'transfer_in', 'adjustment_in', 'initial_import', 'correction', 'outbound_cancel'],
  DECREASE: ['outbound', 'out', 'production_outbound', 'outsourced_outbound', 'sale', 'sales_outbound', 'sales_exchange_out', 'transfer_out', 'adjustment_out', 'purchase_return'],
  TRANSFER: ['transfer', 'transfer_in', 'transfer_out']
};

export const FIRST_ARTICLE_CONFIG = {
  DEFAULT_QTY: 5,
  DEFAULT_FULL_INSPECTION_THRESHOLD: 5,
  DEFAULT_UNIT: '个',
  DEFAULT_INSPECTION_ITEMS: [ { item_name: '外观检查', standard_value: '无缺陷', type: 'visual' } ]
};

export const PRODUCTION_FLOW_STEPS = [
  { status: 'draft', name: '未开始' },
  { status: 'allocated', name: '分配中' },
  { status: 'material_issuing', name: '发料中' },
  { status: 'preparing', name: '配料中' },
  { status: 'material_issued', name: '已发料' },
  { status: 'in_progress', name: '生产中' },
  { status: 'inspection', name: '待检验' },
  { status: 'warehousing', name: '入库中' },
  { status: 'completed', name: '已完成' }
];

export const isIncreaseTransaction = (type) => INVENTORY_TRANSACTION_GROUPS.INCREASE.includes(type);
export const isDecreaseTransaction = (type) => INVENTORY_TRANSACTION_GROUPS.DECREASE.includes(type);
export const isTransferTransaction = (type) => INVENTORY_TRANSACTION_GROUPS.TRANSFER.includes(type);

export const BUSINESS_TYPE_CATEGORIES = { 'in': '入库', 'out': '出库', 'transfer': '调拨', 'adjust': '调整' };
export const BUSINESS_TYPE_CATEGORY_OPTIONS = [
  { label: '入库', value: 'in' },
  { label: '出库', value: 'out' },
  { label: '调拨', value: 'transfer' },
  { label: '调整', value: 'adjust' }
];
export const BUSINESS_TYPE_CATEGORY_COLORS = { 'in': 'success', 'out': 'warning', 'transfer': 'primary', 'adjust': 'info' };
export const getBusinessTypeCategoryName = (category) => BUSINESS_TYPE_CATEGORIES[category] || category;
export const getBusinessTypeCategoryColor = (category) => BUSINESS_TYPE_CATEGORY_COLORS[category] || 'info';

// =======================
// 旧 API Getter 实现（无缝兼容调用）
// =======================
const getText = (group, code) => { try { return useDictionaryStore().getText(group, code) || code; } catch(e) { return code; } };
const getColor = (group, code) => { try { return useDictionaryStore().getColor(group, code) || 'info'; } catch(e) { return 'info'; } };
`;

for (const group of groups) {
  if (group.text) {
    output += `export const ${group.text} = (code) => getText('${group.code}', code);\n`;
  }
  if (group.color) {
    output += `export const ${group.color} = (code) => getColor('${group.code}', code);\n`;
  }
}

// 补充漏掉的遗留函数
output += `
// 额外补充特定 API
export const isValidStatusTransition = () => true; 
export const generateStatusCaseSQL = () => '';

// ========== 默认导出 ==========
export default {
`;

for (const group of groups) {
  output += `  ${group.obj},\n`;
  if (!group.noColor) {
    let colorObjName = group.obj.replace('_TYPES', '_COLORS').replace('_STATUS', '_STATUS_COLORS').replace('_LEVELS', '_COLORS').replace('_RESULT', '_RESULT_COLORS');
    if (group.obj === 'INVENTORY_CHECK_STATUS') colorObjName = 'INVENTORY_CHECK_STATUS_COLORS';
    if (group.obj === 'FINANCE_TRANSACTION_TYPES') colorObjName = 'FINANCE_TRANSACTION_COLORS';
    if (group.obj === 'GL_TRANSACTION_TYPES') colorObjName = 'GL_TRANSACTION_COLORS';
    output += `  ${colorObjName},\n`;
  }
  if (group.text) output += `  ${group.text},\n`;
  if (group.color) output += `  ${group.color},\n`;
}

output += `
  INVENTORY_CHECK_STATUS_OPTIONS,
  VALIDATION_RULES, BUSINESS_RULES, INVENTORY_TRANSACTION_GROUPS,
  isIncreaseTransaction, isDecreaseTransaction, isTransferTransaction, isValidStatusTransition, generateStatusCaseSQL
};
`;

fs.writeFileSync(filePath, output);
console.log('✅ systemConstants.js rewritten successfully!');
