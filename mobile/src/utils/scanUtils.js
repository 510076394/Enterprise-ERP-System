/**
 * 扫码工具类
 * 用于处理不同类型的扫码结果和数据解析
 */

// 扫码类型枚举
export const SCAN_TYPES = {
  MATERIAL: 'material',           // 物料编码
  LOCATION: 'location',           // 库位编码
  CUSTOMER: 'customer',           // 客户编码
  SUPPLIER: 'supplier',           // 供应商编码
  ORDER: 'order',                 // 订单编码
  BATCH: 'batch',                 // 批次编码
  SERIAL: 'serial',               // 序列号
  UNKNOWN: 'unknown'              // 未知类型
};

// 编码前缀映射
const CODE_PREFIXES = {
  'M': SCAN_TYPES.MATERIAL,      // M开头为物料
  'L': SCAN_TYPES.LOCATION,      // L开头为库位
  'C': SCAN_TYPES.CUSTOMER,      // C开头为客户
  'S': SCAN_TYPES.SUPPLIER,      // S开头为供应商
  'SO': SCAN_TYPES.ORDER,        // SO开头为销售订单
  'PO': SCAN_TYPES.ORDER,        // PO开头为采购订单
  'B': SCAN_TYPES.BATCH,         // B开头为批次
  'SN': SCAN_TYPES.SERIAL        // SN开头为序列号
};

/**
 * 解析扫码结果
 * @param {string} code - 扫码得到的字符串
 * @returns {Object} 解析结果
 */
export function parseScanCode(code) {
  if (!code || typeof code !== 'string') {
    return {
      type: SCAN_TYPES.UNKNOWN,
      code: '',
      data: null,
      error: '无效的扫码结果'
    };
  }

  const trimmedCode = code.trim().toUpperCase();
  
  try {
    // 尝试解析JSON格式的二维码
    if (trimmedCode.startsWith('{') && trimmedCode.endsWith('}')) {
      return parseJsonCode(trimmedCode);
    }
    
    // 解析带前缀的编码
    const prefixResult = parsePrefixCode(trimmedCode);
    if (prefixResult.type !== SCAN_TYPES.UNKNOWN) {
      return prefixResult;
    }
    
    // 解析纯数字编码
    if (/^\d+$/.test(trimmedCode)) {
      return {
        type: SCAN_TYPES.UNKNOWN,
        code: trimmedCode,
        data: { id: trimmedCode },
        error: null
      };
    }
    
    // 默认处理
    return {
      type: SCAN_TYPES.UNKNOWN,
      code: trimmedCode,
      data: { raw: trimmedCode },
      error: null
    };
    
  } catch (error) {
    return {
      type: SCAN_TYPES.UNKNOWN,
      code: trimmedCode,
      data: null,
      error: error.message
    };
  }
}

/**
 * 解析JSON格式的二维码
 * @param {string} code - JSON字符串
 * @returns {Object} 解析结果
 */
function parseJsonCode(code) {
  try {
    const data = JSON.parse(code);
    
    // 根据JSON中的type字段确定类型
    if (data.type && SCAN_TYPES[data.type.toUpperCase()]) {
      return {
        type: SCAN_TYPES[data.type.toUpperCase()],
        code: data.code || data.id || '',
        data: data,
        error: null
      };
    }
    
    // 根据字段推断类型
    if (data.material_code || data.materialCode) {
      return {
        type: SCAN_TYPES.MATERIAL,
        code: data.material_code || data.materialCode,
        data: data,
        error: null
      };
    }
    
    if (data.location_code || data.locationCode) {
      return {
        type: SCAN_TYPES.LOCATION,
        code: data.location_code || data.locationCode,
        data: data,
        error: null
      };
    }
    
    return {
      type: SCAN_TYPES.UNKNOWN,
      code: JSON.stringify(data),
      data: data,
      error: null
    };
    
  } catch (error) {
    return {
      type: SCAN_TYPES.UNKNOWN,
      code: code,
      data: null,
      error: 'JSON解析失败'
    };
  }
}

/**
 * 解析带前缀的编码
 * @param {string} code - 编码字符串
 * @returns {Object} 解析结果
 */
function parsePrefixCode(code) {
  for (const [prefix, type] of Object.entries(CODE_PREFIXES)) {
    if (code.startsWith(prefix)) {
      const actualCode = code.substring(prefix.length);
      return {
        type: type,
        code: actualCode,
        data: { 
          prefix: prefix,
          code: actualCode,
          fullCode: code
        },
        error: null
      };
    }
  }
  
  return {
    type: SCAN_TYPES.UNKNOWN,
    code: code,
    data: { raw: code },
    error: null
  };
}

/**
 * 生成二维码数据
 * @param {string} type - 数据类型
 * @param {Object} data - 数据对象
 * @returns {string} 二维码字符串
 */
export function generateQRCode(type, data) {
  const qrData = {
    type: type,
    timestamp: Date.now(),
    ...data
  };
  
  return JSON.stringify(qrData);
}

/**
 * 验证扫码结果
 * @param {Object} scanResult - 扫码解析结果
 * @param {string} expectedType - 期望的类型
 * @returns {Object} 验证结果
 */
export function validateScanResult(scanResult, expectedType = null) {
  const result = {
    isValid: false,
    message: '',
    data: scanResult
  };
  
  if (!scanResult || scanResult.error) {
    result.message = scanResult?.error || '扫码结果无效';
    return result;
  }
  
  if (expectedType && scanResult.type !== expectedType) {
    result.message = `期望扫描${getTypeDisplayName(expectedType)}，但扫描到${getTypeDisplayName(scanResult.type)}`;
    return result;
  }
  
  if (!scanResult.code) {
    result.message = '扫码结果为空';
    return result;
  }
  
  result.isValid = true;
  result.message = '扫码成功';
  return result;
}

/**
 * 获取类型显示名称
 * @param {string} type - 类型
 * @returns {string} 显示名称
 */
export function getTypeDisplayName(type) {
  const typeNames = {
    [SCAN_TYPES.MATERIAL]: '物料',
    [SCAN_TYPES.LOCATION]: '库位',
    [SCAN_TYPES.CUSTOMER]: '客户',
    [SCAN_TYPES.SUPPLIER]: '供应商',
    [SCAN_TYPES.ORDER]: '订单',
    [SCAN_TYPES.BATCH]: '批次',
    [SCAN_TYPES.SERIAL]: '序列号',
    [SCAN_TYPES.UNKNOWN]: '未知类型'
  };
  
  return typeNames[type] || '未知类型';
}

/**
 * 格式化扫码结果用于显示
 * @param {Object} scanResult - 扫码解析结果
 * @returns {Object} 格式化结果
 */
export function formatScanResult(scanResult) {
  if (!scanResult) {
    return {
      title: '无效结果',
      subtitle: '',
      details: []
    };
  }
  
  const typeName = getTypeDisplayName(scanResult.type);
  
  const formatted = {
    title: `${typeName}: ${scanResult.code}`,
    subtitle: scanResult.error || '',
    details: []
  };
  
  if (scanResult.data) {
    // 根据类型添加详细信息
    switch (scanResult.type) {
      case SCAN_TYPES.MATERIAL:
        if (scanResult.data.name) {
          formatted.details.push({ label: '物料名称', value: scanResult.data.name });
        }
        if (scanResult.data.specification) {
          formatted.details.push({ label: '规格', value: scanResult.data.specification });
        }
        break;
        
      case SCAN_TYPES.LOCATION:
        if (scanResult.data.warehouse) {
          formatted.details.push({ label: '仓库', value: scanResult.data.warehouse });
        }
        if (scanResult.data.area) {
          formatted.details.push({ label: '区域', value: scanResult.data.area });
        }
        break;
        
      case SCAN_TYPES.BATCH:
        if (scanResult.data.production_date) {
          formatted.details.push({ label: '生产日期', value: scanResult.data.production_date });
        }
        if (scanResult.data.expiry_date) {
          formatted.details.push({ label: '过期日期', value: scanResult.data.expiry_date });
        }
        break;
    }
  }
  
  return formatted;
}

/**
 * 扫码历史管理
 */
export class ScanHistory {
  constructor() {
    this.storageKey = 'scan_history';
    this.maxItems = 100;
  }
  
  // 添加扫码记录
  add(scanResult) {
    const history = this.getAll();
    const newItem = {
      id: Date.now(),
      timestamp: Date.now(),
      type: scanResult.type,
      code: scanResult.code,
      data: scanResult.data
    };
    
    // 去重
    const filtered = history.filter(item => 
      !(item.type === newItem.type && item.code === newItem.code)
    );
    
    filtered.unshift(newItem);
    
    // 限制数量
    const limited = filtered.slice(0, this.maxItems);
    
    this.save(limited);
    return newItem;
  }
  
  // 获取所有历史记录
  getAll() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('获取扫码历史失败:', error);
      return [];
    }
  }
  
  // 根据类型获取历史记录
  getByType(type) {
    return this.getAll().filter(item => item.type === type);
  }
  
  // 搜索历史记录
  search(keyword) {
    const history = this.getAll();
    const lowerKeyword = keyword.toLowerCase();
    
    return history.filter(item => 
      item.code.toLowerCase().includes(lowerKeyword) ||
      (item.data && JSON.stringify(item.data).toLowerCase().includes(lowerKeyword))
    );
  }
  
  // 删除历史记录
  remove(id) {
    const history = this.getAll();
    const filtered = history.filter(item => item.id !== id);
    this.save(filtered);
  }
  
  // 清空历史记录
  clear() {
    localStorage.removeItem(this.storageKey);
  }
  
  // 保存历史记录
  save(history) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(history));
    } catch (error) {
      console.error('保存扫码历史失败:', error);
    }
  }
}

// 创建全局扫码历史实例
export const scanHistory = new ScanHistory();
