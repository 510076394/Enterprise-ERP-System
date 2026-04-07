/**
 * 编号生成器工具
 * @description 统一的编号生成逻辑，支持并发控制
 * @date 2025-10-15
 * @version 1.0.0
 */

const { logger } = require('./logger');

/**
 * 生成下一个唯一编号
 * @param {Connection} connection - 数据库连接（事务中）
 * @param {string} prefix - 编号前缀（如：SCT, SC）
 * @param {string} table - 表名
 * @param {string} codeField - 编号字段名，默认为'code'
 * @param {number} seqLength - 序号长度，默认为3
 * @param {string} dateFormat - 日期格式：'YYMMDD'(默认) 或 'YYYYMMDD'
 * @returns {Promise<string>} 生成的唯一编号
 */
async function generateNextCode(
  connection,
  prefix,
  table,
  codeField = 'code',
  seqLength = 3,
  dateFormat = 'YYMMDD'
) {
  try {
    // 生成日期字符串
    const now = new Date();
    let dateStr;

    if (dateFormat === 'YYYYMMDD') {
      const year = now.getFullYear().toString();
      const month = (now.getMonth() + 1).toString().padStart(2, '0');
      const day = now.getDate().toString().padStart(2, '0');
      dateStr = `${year}${month}${day}`;
    } else {
      // 默认 YYMMDD
      dateStr = now.toISOString().slice(2, 10).replace(/-/g, '');
    }

    const prefixWithDate = `${prefix}${dateStr}`;
    const prefixLength = prefixWithDate.length;

    // 使用 FOR UPDATE 锁定行，防止并发问题
    const [rows] = await connection.query(
      `
      SELECT IFNULL(MAX(CAST(SUBSTRING(??, ?) AS UNSIGNED)), 0) as max_seq
      FROM ??
      WHERE BINARY LEFT(??, ?) = BINARY ?
      FOR UPDATE
    `,
      [codeField, prefixLength + 1, table, codeField, prefixLength, prefixWithDate]
    );

    const maxSeq = parseInt(rows[0]?.max_seq || 0, 10);
    const newSeq = maxSeq + 1;
    const code = `${prefixWithDate}${String(newSeq).padStart(seqLength, '0')}`;

    logger.debug(`生成编号: ${code}`, {
      prefix,
      table,
      maxSeq,
      newSeq,
    });

    return code;
  } catch (error) {
    logger.error('生成编号失败:', error);
    throw new Error(`编号生成失败: ${error.message}`);
  }
}

/**
 * 验证编号是否唯一
 * @param {Connection} connection - 数据库连接
 * @param {string} code - 待验证的编号
 * @param {string} table - 表名
 * @param {string} codeField - 编号字段名
 * @returns {Promise<boolean>} 是否唯一
 */
async function validateCodeUnique(connection, code, table, codeField = 'code') {
  try {
    const [rows] = await connection.query('SELECT COUNT(*) as count FROM ?? WHERE ?? = ?', [
      table,
      codeField,
      code,
    ]);

    // MySQL返回的count可能是字符串，需要转换为数字
    return parseInt(rows[0].count, 10) === 0;
  } catch (error) {
    logger.error('验证编号唯一性失败:', {
      error: error.message,
      table,
      codeField,
      code,
      stack: error.stack,
    });
    throw error; // 向上抛出错误，而不是返回false
  }
}

/**
 * 生成带重试的唯一编号
 * @param {Connection} connection - 数据库连接
 * @param {string} prefix - 编号前缀
 * @param {string} table - 表名
 * @param {Object} options - 配置选项
 * @returns {Promise<string>} 生成的唯一编号
 */
async function generateUniqueCodeWithRetry(connection, prefix, table, options = {}) {
  const { codeField = 'code', seqLength = 3, dateFormat = 'YYMMDD', maxRetries = 3 } = options;

  let attempts = 0;
  let lastError;

  while (attempts < maxRetries) {
    try {
      const code = await generateNextCode(
        connection,
        prefix,
        table,
        codeField,
        seqLength,
        dateFormat
      );

      // 验证唯一性
      const isUnique = await validateCodeUnique(connection, code, table, codeField);

      if (isUnique) {
        return code;
      }

      logger.warn(`编号已存在，重试中... (${attempts + 1}/${maxRetries})`, { code });
      attempts++;

      // 短暂延迟后重试
      await new Promise((resolve) => setTimeout(resolve, 50 * attempts));
    } catch (error) {
      lastError = error;
      attempts++;
      logger.error(`生成编号失败，重试中... (${attempts}/${maxRetries})`, {
        error: error.message,
        prefix,
        table,
        codeField,
        stack: error.stack,
      });

      if (attempts < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, 100 * attempts));
      }
    }
  }

  throw new Error(`编号生成失败，已重试${maxRetries}次: ${lastError?.message || '未知错误'}`);
}

/**
 * 常用编号生成快捷方法
 */
const CodeGenerators = {
  /**
   * 生成生产任务编号 (SCT + YYMMDD + 3位序号)
   */
  async generateTaskCode(connection) {
    return generateUniqueCodeWithRetry(connection, 'SCT', 'production_tasks', {
      codeField: 'code',
    });
  },

  /**
   * 生成生产计划编号 (PP + YYMMDD + 3位序号)
   * 注意：统一使用 PP 前缀（原 SC 已废弃）
   */
  async generatePlanCode(connection) {
    return generateUniqueCodeWithRetry(connection, 'PP', 'production_plans', {
      codeField: 'code',
    });
  },

  /**
   * 生成检验单编号 (FQC + YYYYMMDD + 3位序号)
   */
  async generateInspectionCode(connection, type = 'final') {
    const prefix = type === 'final' ? 'FQC' : 'IQC';
    return generateUniqueCodeWithRetry(connection, prefix, 'quality_inspections', {
      dateFormat: 'YYYYMMDD',
    });
  },

  /**
   * 生成采购申请编号 (PR + YYMMDD + 3位序号)
   */
  async generatePurchaseRequisitionCode(connection) {
    return generateUniqueCodeWithRetry(connection, 'PR', 'purchase_requisitions', {
      codeField: 'requisition_number',
    });
  },

  /**
   * 生成检验模板编号 (IT + YYMMDD + 3位序号)
   */
  async generateTemplateCode(connection) {
    return generateUniqueCodeWithRetry(connection, 'IT', 'inspection_templates', {
      codeField: 'template_code',
      dateFormat: 'YYMMDD',
    });
  },

  // ========== 销售模块 ==========

  /**
   * 生成销售订单编号 (DD + YYMMDD + 3位序号)
   */
  async generateSalesOrderCode(connection) {
    return generateUniqueCodeWithRetry(connection, 'DD', 'sales_orders', {
      codeField: 'order_no',
    });
  },

  /**
   * 生成销售出库单编号 (SO + YYMMDD + 3位序号)
   */
  async generateOutboundCode(connection) {
    return generateUniqueCodeWithRetry(connection, 'SO', 'sales_outbound', {
      codeField: 'outbound_no',
    });
  },

  /**
   * 生成销售退货单编号 (SR + YYMMDD + 3位序号)
   */
  async generateSalesReturnCode(connection) {
    return generateUniqueCodeWithRetry(connection, 'SR', 'sales_returns', {
      codeField: 'return_no',
    });
  },

  // ========== 采购模块 ==========

  /**
   * 生成采购订单编号 (PO + YYMMDD + 3位序号)
   */
  async generatePurchaseOrderCode(connection) {
    return generateUniqueCodeWithRetry(connection, 'PO', 'purchase_orders', {
      codeField: 'order_no',
    });
  },

  /**
   * 生成采购收货单编号 (GR + YYMMDD + 3位序号)
   */
  async generateReceiptCode(connection) {
    return generateUniqueCodeWithRetry(connection, 'GR', 'purchase_receipts', {
      codeField: 'receipt_no',
    });
  },

  /**
   * 生成采购退货单编号 (RT + YYMMDD + 3位序号)
   */
  async generatePurchaseReturnCode(connection) {
    return generateUniqueCodeWithRetry(connection, 'RT', 'purchase_returns', {
      codeField: 'return_no',
    });
  },

  // ========== 库存模块 ==========

  /**
   * 生成装箱单编号 (PL + YYMMDD + 3位序号)
   */
  async generatePackingListCode(connection) {
    return generateUniqueCodeWithRetry(connection, 'PL', 'packing_lists', {
      codeField: 'packing_list_no',
    });
  },

  /**
   * 生成库存交易流水编号 (TR + YYMMDD + 3位序号)
   */
  async generateTransactionCode(connection) {
    return generateUniqueCodeWithRetry(connection, 'TR', 'inventory_transactions', {
      codeField: 'transaction_no',
    });
  },

  /**
   * 生成库存调整单编号 (TZ + YYYYMMDD + 3位序号)
   */
  async generateAdjustmentCode(connection) {
    return generateUniqueCodeWithRetry(connection, 'TZ', 'inventory_ledger', {
      codeField: 'reference_no',
      dateFormat: 'YYYYMMDD',
    });
  },

  /**
   * 生成库存调拨单编号 (DB + YYYYMMDD + 3位序号)
   * 注意：原前缀 TR 已改为 DB，避免与库存交易流水冲突
   */
  async generateTransferCode(connection) {
    return generateUniqueCodeWithRetry(connection, 'DB', 'inventory_transfers', {
      codeField: 'transfer_no',
      dateFormat: 'YYYYMMDD',
    });
  },

  /**
   * 生成库存出库单编号 (OUT + YYYYMMDD + 3位序号)
   */
  async generateInventoryOutboundCode(connection) {
    return generateUniqueCodeWithRetry(connection, 'OUT', 'inventory_outbound', {
      codeField: 'outbound_no',
      dateFormat: 'YYYYMMDD',
    });
  },

  // ========== 外委加工模块 ==========

  /**
   * 生成外委加工单编号 (WW + YYMMDD + 3位序号)
   */
  async generateProcessingCode(connection) {
    return generateUniqueCodeWithRetry(connection, 'WW', 'outsourced_processings', {
      codeField: 'processing_no',
    });
  },

  /**
   * 生成外委加工入库单编号 (WWRK + YYMMDD + 3位序号)
   */
  async generateProcessingReceiptCode(connection) {
    return generateUniqueCodeWithRetry(connection, 'WWRK', 'outsourced_processing_receipts', {
      codeField: 'receipt_no',
    });
  },
};

/**
 * 生成检验模板编号 (兼容旧的调用方式)
 * @param {string} prefix - 编号前缀 (如: 'IT')
 * @param {Object} db - Sequelize模型对象
 */
async function generateTemplateCode(prefix, db) {
  try {
    // 生成日期字符串 YYMMDD
    const now = new Date();
    const dateStr = now.toISOString().slice(2, 10).replace(/-/g, '');

    const prefixWithDate = `${prefix}${dateStr}`;

    // 使用Sequelize查询获取今天的最大序号
    const templates = await db.InspectionTemplate.findAll({
      attributes: ['template_code'],
      where: {
        template_code: {
          [db.Sequelize.Op.like]: `${prefixWithDate}%`,
        },
      },
      raw: true,
    });

    // 找出最大序号
    let maxSeq = 0;
    templates.forEach((template) => {
      const code = template.template_code;
      if (code && code.startsWith(prefixWithDate)) {
        const seqStr = code.substring(prefixWithDate.length);
        const seq = parseInt(seqStr, 10);
        if (!isNaN(seq) && seq > maxSeq) {
          maxSeq = seq;
        }
      }
    });

    // 生成新编号
    const newSeq = maxSeq + 1;
    const code = `${prefixWithDate}${String(newSeq).padStart(3, '0')}`;

    logger.debug(`生成模板编号: ${code}`, { prefix, maxSeq, newSeq });

    return code;
  } catch (error) {
    logger.error('生成模板编号失败:', error);
    throw new Error(`模板编号生成失败: ${error.message}`);
  }
}

module.exports = {
  generateNextCode,
  validateCodeUnique,
  generateUniqueCodeWithRetry,
  generateTemplateCode,
  CodeGenerators,
};
