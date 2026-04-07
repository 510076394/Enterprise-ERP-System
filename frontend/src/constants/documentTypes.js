/**
 * 单据类型常量定义
 * @description 定义系统中所有单据类型的前缀和映射关系
 */

/**
 * 单据类型前缀映射
 * 根据单据号前缀判断单据类型
 */
export const DOCUMENT_TYPE_PREFIXES = {
  'SO': '销售出库单',
  'PO': '采购出库单',
  'GR': '采购入库单',
  'PR': '生产入库单',
  'MO': '生产出库单',
  'ADJ': '调整单',
  'TRF': '调拨单'
}

/**
 * 交易类型映射
 * 根据交易类型代码判断单据类型
 */
export const TRANSACTION_TYPE_MAP = {
  'sales_outbound': '销售出库单',
  'purchase_inbound': '采购入库单',
  'production_outbound': '生产出库单',
  'production_inbound': '生产入库单',
  'adjustment': '调整单',
  'transfer': '调拨单'
}

/**
 * 根据单据号获取单据类型
 * @param {string} documentNo - 单据号
 * @returns {string} 单据类型
 */
export function getDocumentTypeByNo(documentNo) {
  if (!documentNo || documentNo === '未知单据') {
    return '单据'
  }

  // 提取单据号前缀（如 SO251222001 -> SO 或 PR-2023 -> PR）
  let prefix = '';
  if (documentNo.includes('-')) {
    prefix = documentNo.split('-')[0].toUpperCase();
  } else {
    const match = documentNo.match(/^[a-zA-Z]+/);
    if (match) {
      prefix = match[0].toUpperCase();
    }
  }
  return DOCUMENT_TYPE_PREFIXES[prefix] || '单据'
}

/**
 * 根据交易类型获取单据类型
 * @param {string} transactionType - 交易类型
 * @returns {string} 单据类型
 */
export function getDocumentTypeByTransaction(transactionType) {
  return TRANSACTION_TYPE_MAP[transactionType] || '单据'
}

/**
 * 根据交易类型和单据号获取单据类型（智能判断）
 * @param {string} transactionType - 交易类型
 * @param {string} documentNo - 单据号
 * @returns {string} 单据类型
 */
export function getDocumentType(transactionType, documentNo) {
  // 优先根据单据号判断
  const typeByNo = getDocumentTypeByNo(documentNo)
  if (typeByNo !== '单据') {
    return typeByNo
  }

  // 其次根据交易类型判断
  return getDocumentTypeByTransaction(transactionType)
}

