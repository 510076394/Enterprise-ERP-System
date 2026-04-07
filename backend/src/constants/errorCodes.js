/**
 * 统一错误码定义
 * @description 规范化的错误码和错误信息
 * @date 2025-10-15
 * @version 1.0.0
 */

/**
 * 错误码格式：
 * - 系统级错误: SYS001-SYS999
 * - 生产模块: PROD001-PROD999
 * - 采购模块: PUR001-PUR999
 * - 库存模块: INV001-INV999
 * - 质量模块: QUA001-QUA999
 * - 财务模块: FIN001-FIN999
 */

// 系统级错误
const SystemErrors = {
  INTERNAL_ERROR: {
    code: 'SYS001',
    message: '服务器内部错误',
    httpStatus: 500,
  },
  DATABASE_ERROR: {
    code: 'SYS002',
    message: '数据库操作失败',
    httpStatus: 500,
  },
  TRANSACTION_ERROR: {
    code: 'SYS003',
    message: '事务处理失败',
    httpStatus: 500,
  },
  VALIDATION_ERROR: {
    code: 'SYS004',
    message: '数据验证失败',
    httpStatus: 400,
  },
  NOT_FOUND: {
    code: 'SYS404',
    message: '资源不存在',
    httpStatus: 404,
  },
  UNAUTHORIZED: {
    code: 'SYS401',
    message: '未授权访问',
    httpStatus: 401,
  },
  FORBIDDEN: {
    code: 'SYS403',
    message: '禁止访问',
    httpStatus: 403,
  },
  DUPLICATE_ENTRY: {
    code: 'SYS409',
    message: '记录已存在',
    httpStatus: 409,
  },
};

// 生产模块错误
const ProductionErrors = {
  BOM_NOT_FOUND: {
    code: 'PROD001',
    message: '未找到产品的BOM配置',
    httpStatus: 404,
  },
  BOM_EMPTY: {
    code: 'PROD002',
    message: 'BOM中没有物料明细',
    httpStatus: 400,
  },
  PLAN_NOT_FOUND: {
    code: 'PROD003',
    message: '生产计划不存在',
    httpStatus: 404,
  },
  PLAN_STATUS_INVALID: {
    code: 'PROD004',
    message: '生产计划状态不允许此操作',
    httpStatus: 400,
  },
  TASK_NOT_FOUND: {
    code: 'PROD005',
    message: '生产任务不存在',
    httpStatus: 404,
  },
  TASK_STATUS_INVALID: {
    code: 'PROD006',
    message: '任务状态不允许此操作',
    httpStatus: 400,
  },
  PROCESS_NOT_FOUND: {
    code: 'PROD007',
    message: '生产工序不存在',
    httpStatus: 404,
  },
  PROCESS_STATUS_INVALID: {
    code: 'PROD008',
    message: '工序状态不允许此操作',
    httpStatus: 400,
  },
  MATERIAL_SHORTAGE: {
    code: 'PROD009',
    message: '物料库存不足',
    httpStatus: 400,
  },
  REPORT_NOT_FOUND: {
    code: 'PROD010',
    message: '报工记录不存在',
    httpStatus: 404,
  },
  DUPLICATE_PLAN_CODE: {
    code: 'PROD011',
    message: '计划编号已存在',
    httpStatus: 409,
  },
  DUPLICATE_TASK_CODE: {
    code: 'PROD012',
    message: '任务编号已存在',
    httpStatus: 409,
  },
  CODE_GENERATION_FAILED: {
    code: 'PROD013',
    message: '编号生成失败',
    httpStatus: 500,
  },
  INVALID_QUANTITY: {
    code: 'PROD014',
    message: '数量无效',
    httpStatus: 400,
  },
  INVALID_DATE_RANGE: {
    code: 'PROD015',
    message: '日期范围无效',
    httpStatus: 400,
  },
};

// 采购模块错误
const PurchaseErrors = {
  REQUISITION_NOT_FOUND: {
    code: 'PUR001',
    message: '采购申请不存在',
    httpStatus: 404,
  },
  ORDER_NOT_FOUND: {
    code: 'PUR002',
    message: '采购订单不存在',
    httpStatus: 404,
  },
  SUPPLIER_NOT_FOUND: {
    code: 'PUR003',
    message: '供应商不存在',
    httpStatus: 404,
  },
  INVALID_PRICE: {
    code: 'PUR004',
    message: '价格无效',
    httpStatus: 400,
  },
};

// 库存模块错误
const InventoryErrors = {
  MATERIAL_NOT_FOUND: {
    code: 'INV001',
    message: '物料不存在',
    httpStatus: 404,
  },
  INSUFFICIENT_STOCK: {
    code: 'INV002',
    message: '库存不足',
    httpStatus: 400,
  },
  WAREHOUSE_NOT_FOUND: {
    code: 'INV003',
    message: '仓库不存在',
    httpStatus: 404,
  },
  LOCATION_NOT_FOUND: {
    code: 'INV004',
    message: '库位不存在',
    httpStatus: 404,
  },
};

// 质量模块错误
const QualityErrors = {
  INSPECTION_NOT_FOUND: {
    code: 'QUA001',
    message: '检验单不存在',
    httpStatus: 404,
  },
  TEMPLATE_NOT_FOUND: {
    code: 'QUA002',
    message: '检验模板不存在',
    httpStatus: 404,
  },
  INSPECTION_INCOMPLETE: {
    code: 'QUA003',
    message: '检验未完成',
    httpStatus: 400,
  },
};

// 财务模块错误
const FinanceErrors = {
  ACCOUNT_NOT_FOUND: {
    code: 'FIN001',
    message: '科目不存在',
    httpStatus: 404,
  },
  VOUCHER_NOT_FOUND: {
    code: 'FIN002',
    message: '凭证不存在',
    httpStatus: 404,
  },
  INVALID_AMOUNT: {
    code: 'FIN003',
    message: '金额无效',
    httpStatus: 400,
  },
  UNBALANCED_ENTRY: {
    code: 'FIN004',
    message: '借贷不平衡',
    httpStatus: 400,
  },
};

/**
 * 根据数据库错误代码获取对应的错误信息
 * @param {Error} error - 数据库错误对象
 * @returns {Object} 错误信息对象
 */
function mapDatabaseError(error) {
  if (!error || !error.code) {
    return SystemErrors.DATABASE_ERROR;
  }

  switch (error.code) {
    case 'ER_DUP_ENTRY':
      return SystemErrors.DUPLICATE_ENTRY;

    case 'ER_NO_REFERENCED_ROW':
    case 'ER_NO_REFERENCED_ROW_2':
      return {
        code: 'SYS005',
        message: '关联数据不存在',
        httpStatus: 400,
      };

    case 'ER_ROW_IS_REFERENCED':
    case 'ER_ROW_IS_REFERENCED_2':
      return {
        code: 'SYS006',
        message: '数据被引用，无法删除',
        httpStatus: 400,
      };

    case 'ER_BAD_NULL_ERROR':
      return {
        code: 'SYS007',
        message: '必填字段不能为空',
        httpStatus: 400,
      };

    case 'ER_DATA_TOO_LONG':
      return {
        code: 'SYS008',
        message: '数据长度超过限制',
        httpStatus: 400,
      };

    case 'ER_CHECK_CONSTRAINT_VIOLATED':
      if (error.sqlMessage && error.sqlMessage.includes('check_dates')) {
        return ProductionErrors.INVALID_DATE_RANGE;
      }
      return {
        code: 'SYS009',
        message: '数据约束违反',
        httpStatus: 400,
      };

    case 'ECONNREFUSED':
      return {
        code: 'SYS010',
        message: '数据库连接失败',
        httpStatus: 503,
      };

    default:
      return SystemErrors.DATABASE_ERROR;
  }
}

/**
 * 创建标准化错误对象
 * @param {Object} errorDef - 错误定义
 * @param {Object} details - 额外的错误详情
 * @returns {Object} 标准化错误对象
 */
function createError(errorDef, details = {}) {
  return {
    code: errorDef.code,
    message: details.message || errorDef.message,
    httpStatus: errorDef.httpStatus,
    details: details.details || null,
    timestamp: new Date().toISOString(),
  };
}

module.exports = {
  SystemErrors,
  ProductionErrors,
  PurchaseErrors,
  InventoryErrors,
  QualityErrors,
  FinanceErrors,
  mapDatabaseError,
  createError,
};
