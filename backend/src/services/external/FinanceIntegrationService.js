const db = require('../../config/db');
const SystemConfigService = require('../system/SystemConfigService');
const arModel = require('../../models/ar');
const apModel = require('../../models/ap');
const financeModel = require('../../models/finance');
const taxModel = require('../../models/tax');
const { financeConfig } = require('../../config/financeConfig');
const { getUserIdByIdentifier } = require('../../utils/userUtils');
const logger = require('../../utils/logger');

class FinanceIntegrationService {
  /**
   * 验证必需的财务配置
   */
  static async validateRequiredConfigs(keys) {
    const { accountingConfig } = require('../../config/accountingConfig');
    for (const key of keys) {
      const code = accountingConfig.getAccountCode(key);
      if (!code) {
        throw new Error(`缺少必需的财务配置: ${key}，请先在财务设置中配置`);
      }
      const [rows] = await db.pool.execute('SELECT id FROM gl_accounts WHERE account_code = ?', [code]);
      if (rows.length === 0) {
        throw new Error(`相关的财务科目不存在: ${code}，请前往会计科目页面配置后再试！`);
      }
    }
  }

  /**
   * 获取会计科目ID
   */
  static async getAccountIdByKey(key) {
    const { accountingConfig } = require('../../config/accountingConfig');
    const code = accountingConfig.getAccountCode(key);
    if (!code) return null;
    const [rows] = await db.pool.execute('SELECT id FROM gl_accounts WHERE account_code = ?', [code]);
    return rows.length > 0 ? rows[0].id : null;
  }

  /**
   * 获取当前打开的会计期间
   */
  static async getCurrentPeriod(connection, date = null) {
    const targetDate = date || new Date().toISOString().split('T')[0];
    const [periods] = await connection.execute(
      'SELECT id FROM gl_periods WHERE is_closed = 0 AND start_date <= ? AND end_date >= ?',
      [targetDate, targetDate]
    );

    if (periods.length === 0) {
      throw new Error(`找不到包含日期 ${targetDate} 的已打开会计期间`);
    }

    return periods[0];
  }

  /**
   * 加载系统配置到内存
   */
  static async loadConfigurations() {
    await financeConfig.loadFromDatabase(db);
  }

  /**
   * 生成业务单据编号
   */
  static async generateInvoiceNumber(prefix, connection) {
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const [rows] = await connection.execute(
      `SELECT invoice_number 
       FROM ${prefix === 'AR' ? 'ar_invoices' : 'ap_invoices'} 
       WHERE invoice_number LIKE ? 
       ORDER BY id DESC LIMIT 1`,
      [`${prefix}${dateStr}%`]
    );

    let sequence = 1;
    if (rows.length > 0) {
      const lastSequence = parseInt(rows[0].invoice_number.slice(-3), 10);
      if (!isNaN(lastSequence)) {
        sequence = lastSequence + 1;
      }
    }

    return `${prefix}${dateStr}${sequence.toString().padStart(3, '0')}`;
  }

  // ==================== 销售模块集成 ====================

  /**
   * 从销售订单自动生成应收发票
   */
  static async generateARInvoiceFromSalesOrder(salesOrder) {
    const autoGenerate = await SystemConfigService.get('auto_generate_ar_invoice', true);
    if (!autoGenerate) return { skipped: true, message: '功能已关闭' };

    const connection = await db.pool.getConnection();
    try {
      await connection.beginTransaction();

      await this.validateRequiredConfigs(['ACCOUNTS_RECEIVABLE', 'SALES_REVENUE']);
      await this.loadConfigurations();
      
      // 添加防杜绝双重生成校验
      const [existing] = await connection.execute(
        'SELECT id FROM ar_invoices WHERE source_type = ? AND source_id = ?',
        ['sales_order', salesOrder.id]
      );
      if (existing.length > 0) {
        await connection.rollback();
        return { skipped: true, message: '已存在对应单据的应收发票' };
      }

      const invoiceNumber = await this.generateInvoiceNumber('AR', connection);

      const [orderItems] = await connection.execute(
        `SELECT soi.material_id, soi.quantity, soi.unit_price, m.name as material_name, m.code as material_code
         FROM sales_order_items soi
         LEFT JOIN materials m ON soi.material_id = m.id
         WHERE soi.order_id = ?`,
        [salesOrder.id]
      );

      if (orderItems.length === 0) {
        await connection.rollback();
        return { skipped: true, message: '订单无明细' };
      }

      const totalAmount = orderItems.reduce((sum, item) => {
        return sum + parseFloat(item.quantity || 0) * parseFloat(item.unit_price || 0);
      }, 0);

      const paymentTermDays = financeConfig.get('invoice.defaultPaymentTermDays', 30);
      const invoiceDate = new Date();
      const dueDate = new Date(invoiceDate);
      dueDate.setDate(dueDate.getDate() + paymentTermDays);
      const invoiceDateStr = invoiceDate.toISOString().split('T')[0];

      const receivableAccountId = await this.getAccountIdByKey('ACCOUNTS_RECEIVABLE');
      const incomeAccountId = await this.getAccountIdByKey('SALES_REVENUE');
      const currentPeriod = await this.getCurrentPeriod(connection, invoiceDateStr);
      const createdByIdentifier = financeConfig.get('system.defaultCreator', 'system');
      const createdBy = await getUserIdByIdentifier(connection, createdByIdentifier);

      const invoiceData = {
        invoice_number: invoiceNumber,
        customer_id: salesOrder.customer_id || null,
        invoice_date: invoiceDateStr,
        due_date: dueDate.toISOString().split('T')[0],
        total_amount: totalAmount,
        currency_code: salesOrder.currency || financeConfig.get('invoice.defaultCurrency', 'CNY'),
        exchange_rate: salesOrder.exchange_rate || financeConfig.get('invoice.defaultExchangeRate', 1.0),
        status: '已确认',
        terms: financeConfig.get('invoice.defaultPaymentTermsText', '30天付款'),
        notes: `由销售订单 ${salesOrder.order_no} 自动生成`,
        source_type: 'sales_order',
        source_id: salesOrder.id || null,
        customer_name: salesOrder.customer_name || null,
        gl_entry: {
          period_id: currentPeriod?.id ?? null,
          receivable_account_id: receivableAccountId,
          income_account_id: incomeAccountId,
          created_by: createdBy,
        },
      };

      const invoiceItems = orderItems.map(item => ({
        product_id: item.material_id,
        product_name: item.material_name || item.material_code,
        description: `销售商品 ${item.material_name || item.material_code}`,
        quantity: parseFloat(item.quantity || 0),
        unit_price: parseFloat(item.unit_price || 0),
        amount: parseFloat(item.quantity || 0) * parseFloat(item.unit_price || 0),
      }));

      invoiceData.items = invoiceItems;
      const invoiceId = await arModel.createInvoice(invoiceData, connection);
      await connection.commit();
      return { invoiceId, invoiceNumber, amount: totalAmount };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * 生成销售红字发票
   */
  static async generateARCreditNoteFromSalesReturn(salesReturn) {
    const autoGenerate = await SystemConfigService.get('auto_generate_ar_credit_note', true);
    if (!autoGenerate) return { skipped: true, message: '功能已关闭' };

    const connection = await db.pool.getConnection();
    try {
      await connection.beginTransaction();
      await this.validateRequiredConfigs(['ACCOUNTS_RECEIVABLE', 'SALES_REVENUE']);
      
      let customerId = salesReturn.customer_id;
      let customerName = salesReturn.customer_name;
      if (!customerId && salesReturn.order_id) {
        const [orderRows] = await connection.execute(
          `SELECT so.customer_id, c.name AS customer_name
           FROM sales_orders so
           LEFT JOIN customers c ON so.customer_id = c.id
           WHERE so.id = ?`,
          [salesReturn.order_id]
        );
        if (orderRows.length > 0) {
          customerId = orderRows[0].customer_id;
          customerName = orderRows[0].customer_name || customerName;
        }
      }
      if (!customerId) {
        await connection.rollback();
        return { skipped: true, message: '无法获取客户信息' };
      }

      await this.loadConfigurations();
      
      const [existing] = await connection.execute(
        'SELECT id FROM ar_invoices WHERE source_type = ? AND source_id = ?',
        ['sales_return', salesReturn.id]
      );
      if (existing.length > 0) {
        await connection.rollback();
        return { skipped: true, message: '已存在对应单据的应收红字发票' };
      }

      const invoiceNumber = await this.generateInvoiceNumber('AR', connection);

      const [returnItems] = await connection.execute(
        `SELECT sri.product_id as material_id, m.name as material_name, m.code as material_code,
                sri.quantity as return_quantity,
                COALESCE(soi.unit_price, m.price, 0) AS unit_price
         FROM sales_return_items sri
         LEFT JOIN materials m ON sri.product_id = m.id
         LEFT JOIN sales_returns sr ON sri.return_id = sr.id
         LEFT JOIN sales_orders so ON sr.order_id = so.id
         LEFT JOIN sales_order_items soi ON so.id = soi.order_id AND sri.product_id = soi.material_id
         WHERE sri.return_id = ?`,
        [salesReturn.id]
      );

      if (returnItems.length === 0) {
        await connection.rollback();
        return { skipped: true, message: '无物料明细' };
      }

      const totalAmount = returnItems.reduce((sum, item) => sum + parseFloat(item.return_quantity || 0) * parseFloat(item.unit_price || 0), 0);
      const creditNoteAmount = -Math.abs(totalAmount);
      if (totalAmount === 0) {
        await connection.rollback();
        return { skipped: true, message: '退货金额为0' };
      }

      const invoiceDate = salesReturn.return_date ? new Date(salesReturn.return_date) : new Date();
      const invoiceDateStr = invoiceDate.toISOString().split('T')[0];
      const currentPeriod = await this.getCurrentPeriod(connection, invoiceDateStr);
      const receivableAccountId = await this.getAccountIdByKey('ACCOUNTS_RECEIVABLE');
      const incomeAccountId = await this.getAccountIdByKey('SALES_REVENUE');

      const invoiceData = {
        invoice_number: invoiceNumber,
        customer_id: customerId || null,
        invoice_date: invoiceDateStr,
        due_date: invoiceDateStr,
        total_amount: creditNoteAmount,
        currency_code: 'CNY',
        exchange_rate: 1.0,
        status: '已确认',
        notes: `【红字发票】销售退货单 ${salesReturn.return_no} 冲减`,
        source_type: 'sales_return',
        source_id: salesReturn.id || null,
        customer_name: customerName || null,
        gl_entry: { period_id: currentPeriod?.id ?? null, receivable_account_id: receivableAccountId, income_account_id: incomeAccountId },
        items: returnItems.map(item => ({
          product_id: item.material_id,
          product_name: item.material_name || item.material_code,
          description: `退货冲减 ${item.material_name || item.material_code}`,
          quantity: -parseFloat(item.return_quantity || 0),
          unit_price: parseFloat(item.unit_price || 0),
          amount: -parseFloat(item.return_quantity || 0) * parseFloat(item.unit_price || 0),
        }))
      };

      const invoiceId = await arModel.createInvoice(invoiceData, connection);
      await connection.commit();
      return { invoiceId, invoiceNumber, amount: creditNoteAmount };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  // ==================== 采购模块集成 ====================

  /**
   * 生成应付发票
   */
  static async generateAPInvoiceFromPurchaseReceipt(purchaseReceipt, userId = null) {
    const autoGenerate = await SystemConfigService.get('auto_generate_ap_invoice', true);
    if (!autoGenerate) return { skipped: true, message: '功能已关闭' };

    const connection = await db.pool.getConnection();
    try {
      await connection.beginTransaction();
      await this.validateRequiredConfigs(['ACCOUNTS_PAYABLE', 'GR_IR']);
      await this.loadConfigurations();
      
      const [existing] = await connection.execute(
        'SELECT id FROM ap_invoices WHERE source_type = ? AND source_id = ?',
        ['purchase_receipt', purchaseReceipt.id]
      );
      if (existing.length > 0) {
        await connection.rollback();
        return { skipped: true, message: '已存在对应单据的应付发票' };
      }

      const invoiceNumber = await this.generateInvoiceNumber('AP', connection);

      const [receiptItems] = await connection.execute(
        `SELECT pri.material_id, pri.qualified_quantity as quantity, COALESCE(poi.price, m.cost_price, m.price, 0) as price, m.name as material_name, m.code as material_code
         FROM purchase_receipt_items pri
         LEFT JOIN purchase_receipts pr ON pri.receipt_id = pr.id
         LEFT JOIN purchase_orders po ON pr.order_id = po.id
         LEFT JOIN purchase_order_items poi ON po.id = poi.order_id AND pri.material_id = poi.material_id
         LEFT JOIN materials m ON pri.material_id = m.id
         WHERE pri.receipt_id = ?`,
        [purchaseReceipt.id]
      );

      if (receiptItems.length === 0) {
        await connection.rollback();
        return { skipped: true, message: '无明细' };
      }

      const totalAmount = receiptItems.reduce((sum, item) => sum + parseFloat(item.quantity || 0) * parseFloat(item.price || 0), 0);
      const invoiceDateStr = purchaseReceipt.receipt_date || new Date().toISOString().split('T')[0];
      const currentPeriod = await this.getCurrentPeriod(connection, invoiceDateStr);
      const payableAccountId = await this.getAccountIdByKey('ACCOUNTS_PAYABLE');
      const purchaseCostAccountId = await this.getAccountIdByKey('GR_IR');
      const createdBy = await getUserIdByIdentifier(connection, userId || purchaseReceipt.operator || 'system');

      const invoiceData = {
        invoice_number: invoiceNumber,
        supplier_id: purchaseReceipt.supplier_id || null,
        invoice_date: invoiceDateStr,
        due_date: invoiceDateStr,
        total_amount: totalAmount,
        currency_code: 'CNY',
        exchange_rate: 1.0,
        status: '已确认',
        notes: `由采购入库单 ${purchaseReceipt.receipt_no} 自动生成`,
        source_type: 'purchase_receipt',
        source_id: purchaseReceipt.id || null,
        supplier_name: purchaseReceipt.supplier_name || null,
        gl_entry: { period_id: currentPeriod?.id ?? null, payable_account_id: payableAccountId, purchase_cost_account_id: purchaseCostAccountId, created_by: createdBy },
        items: receiptItems.map(item => ({
          material_id: item.material_id,
          material_name: item.material_name || item.material_code,
          description: `采购物资 ${item.material_name || item.material_code}`,
          quantity: parseFloat(item.quantity || 0),
          unit_price: parseFloat(item.price || 0),
          amount: parseFloat(item.quantity || 0) * parseFloat(item.price || 0),
        }))
      };

      const invoiceId = await apModel.createInvoice(invoiceData, connection);
      await connection.commit();
      return { invoiceId, invoiceNumber, amount: totalAmount };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * 生成采购红字发票
   */
  static async generateAPCreditNoteFromPurchaseReturn(purchaseReturn) {
    const autoGenerate = await SystemConfigService.get('auto_generate_ap_credit_note', true);
    if (!autoGenerate) return { skipped: true, message: '功能已关闭' };

    const connection = await db.pool.getConnection();
    try {
      await connection.beginTransaction();
      await this.validateRequiredConfigs(['ACCOUNTS_PAYABLE', 'GR_IR']);
      await this.loadConfigurations();
      
      const [existing] = await connection.execute(
        'SELECT id FROM ap_invoices WHERE source_type = ? AND source_id = ?',
        ['purchase_return', purchaseReturn.id]
      );
      if (existing.length > 0) {
        await connection.rollback();
        return { skipped: true, message: '已存在对应单据的应付红字发票' };
      }

      const invoiceNumber = await this.generateInvoiceNumber('AP', connection);

      const [returnItems] = await connection.execute(
        `SELECT pri.material_id, pri.material_name, pri.material_code,
                pri.return_quantity, pri.price,
                COALESCE(pri.price, poi.price, m.cost_price, m.price, 0) AS unit_price
         FROM purchase_return_items pri
         LEFT JOIN purchase_returns pr ON pri.return_id = pr.id
         LEFT JOIN purchase_receipts prec ON pr.receipt_id = prec.id
         LEFT JOIN purchase_orders po ON prec.order_id = po.id
         LEFT JOIN purchase_order_items poi ON po.id = poi.order_id AND pri.material_id = poi.material_id
         LEFT JOIN materials m ON pri.material_id = m.id
         WHERE pri.return_id = ?`,
        [purchaseReturn.id]
      );

      if (returnItems.length === 0) {
        await connection.rollback();
        return { skipped: true, message: '无明细' };
      }

      const totalAmount = returnItems.reduce((sum, item) => sum + parseFloat(item.return_quantity || 0) * parseFloat(item.unit_price || 0), 0);
      const creditNoteAmount = -Math.abs(totalAmount);
      if (totalAmount === 0) {
        await connection.rollback();
        return { skipped: true, message: '金额为0' };
      }

      const invoiceDateStr = (purchaseReturn.return_date ? new Date(purchaseReturn.return_date) : new Date()).toISOString().split('T')[0];
      const currentPeriod = await this.getCurrentPeriod(connection, invoiceDateStr);
      const payableAccountId = await this.getAccountIdByKey('ACCOUNTS_PAYABLE');
      const purchaseCostAccountId = await this.getAccountIdByKey('GR_IR');

      const invoiceData = {
        invoice_number: invoiceNumber,
        supplier_id: purchaseReturn.supplier_id || null,
        invoice_date: invoiceDateStr,
        due_date: invoiceDateStr,
        total_amount: creditNoteAmount,
        currency_code: 'CNY',
        exchange_rate: 1.0,
        status: '已确认',
        notes: `【红字发票】采购退货单 ${purchaseReturn.return_no} 冲减`,
        source_type: 'purchase_return',
        source_id: purchaseReturn.id || null,
        supplier_name: purchaseReturn.supplier_name || null,
        gl_entry: { period_id: currentPeriod?.id ?? null, payable_account_id: payableAccountId, purchase_cost_account_id: purchaseCostAccountId },
        items: returnItems.map(item => ({
          material_id: item.material_id,
          material_name: item.material_name || item.material_code,
          description: `退货冲减 ${item.material_name || item.material_code}`,
          quantity: -parseFloat(item.return_quantity || 0),
          unit_price: parseFloat(item.unit_price || 0),
          amount: -parseFloat(item.return_quantity || 0) * parseFloat(item.unit_price || 0),
        }))
      };

      const invoiceId = await apModel.createInvoice(invoiceData, connection);
      await connection.commit();
      return { invoiceId, invoiceNumber, amount: creditNoteAmount };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  // ==================== 销售成本分录生成 ====================

  /**
   * 生成销售成本结转分录
   */
  static async generateCostEntryFromSalesOutbound(salesOutbound) {
    const autoGenerate = await SystemConfigService.get('auto_generate_sales_cost_entry', true);
    if (!autoGenerate) return { skipped: true, message: '功能已关闭' };

    const connection = await db.pool.getConnection();
    try {
      await connection.beginTransaction();
      
      // 防重复：通过 document_type + document_number 检查是否已生成过成本分录
      const [existing] = await connection.execute(
        'SELECT id FROM gl_entries WHERE document_type = ? AND document_number = ?',
        ['sales_outbound', salesOutbound.outbound_no]
      );
      if (existing.length > 0) {
        await connection.rollback();
        return { skipped: true, message: '已存在对应单据的成本分录' };
      }

      await this.validateRequiredConfigs(['COST_OF_GOODS_SOLD', 'INVENTORY']);
      
      const [outboundItems] = await connection.execute(
        `SELECT soi.product_id, soi.quantity, m.cost_price, m.price, m.name as material_name
         FROM sales_outbound_items soi 
         LEFT JOIN materials m ON soi.product_id = m.id
         WHERE soi.outbound_id = ?`,
        [salesOutbound.id]
      );

      if (outboundItems.length === 0) {
        await connection.rollback();
        return { skipped: true, message: '无明细' };
      }

      const totalCost = outboundItems.reduce((sum, item) => sum + parseFloat(item.quantity || 0) * parseFloat(item.cost_price || item.price || 0), 0);
      if (totalCost <= 0) {
        await connection.rollback();
        return { skipped: true, message: '成本为0' };
      }

      const currentPeriod = await this.getCurrentPeriod(connection, salesOutbound.delivery_date || new Date().toISOString().split('T')[0]);
      const cogsAccountId = await this.getAccountIdByKey('COST_OF_GOODS_SOLD');
      const inventoryAccountId = await this.getAccountIdByKey('INVENTORY');
      const createdBy = await getUserIdByIdentifier(connection, salesOutbound.created_by || 'system');

      const entryData = {
        period_id: currentPeriod.id || null,
        entry_date: salesOutbound.delivery_date || new Date().toISOString().split('T')[0],
        document_type: 'sales_outbound',
        document_number: salesOutbound.outbound_no || null,
        description: `销售成本结转 - 销售出库单 ${salesOutbound.outbound_no}`,
        created_by: createdBy || null,
      };

      const entryItems = [
        { account_id: cogsAccountId, debit_amount: totalCost, credit_amount: 0, description: `销售成本 - ${salesOutbound.outbound_no}` },
        { account_id: inventoryAccountId, debit_amount: 0, credit_amount: totalCost, description: `库存减少 - ${salesOutbound.outbound_no}` },
      ];

      const entryId = await financeModel.createEntry(entryData, entryItems, connection);
      const [entries] = await connection.execute('SELECT entry_number FROM gl_entries WHERE id = ?', [entryId]);
      const entryNumber = entries.length > 0 ? entries[0].entry_number : null;

      await connection.execute('UPDATE gl_entries SET is_posted = true WHERE id = ?', [entryId]);
      await connection.commit();
      
      return { entryId, entryNumber, amount: totalCost };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  // ==================== 税务发票生成 ====================

  /**
   * 生成销项发票
   */
  static async generateOutputTaxInvoiceFromSalesOutbound(salesOutbound, userId = null) {
    const connection = await db.pool.getConnection();
    try {
      await connection.beginTransaction();
      
      const [existing] = await connection.execute(
        'SELECT id FROM tax_invoices WHERE related_document_type = ? AND related_document_id = ?',
        ['销售出库单', salesOutbound.id]
      );
      if (existing.length > 0) {
        await connection.rollback();
        return { skipped: true, message: '已存在对应单据的销项发票' };
      }

      const invoiceNumber = `待补录-${salesOutbound.outbound_no}`;

      // 查询出库明细，并回溯订单明细获取售价（出库单 price 可能为0）
      const [outboundItems] = await connection.execute(
        `SELECT soi.quantity, 
                COALESCE(NULLIF(soi.price, 0), soitm.unit_price, m.price, 0) AS price
         FROM sales_outbound_items soi
         LEFT JOIN sales_outbound so ON soi.outbound_id = so.id
         LEFT JOIN sales_order_items soitm ON so.order_id = soitm.order_id AND soi.product_id = soitm.material_id
         LEFT JOIN materials m ON soi.product_id = m.id
         WHERE soi.outbound_id = ?`,
        [salesOutbound.id]
      );

      const amountExcludingTax = outboundItems.reduce((sum, item) => sum + parseFloat(item.quantity || 0) * parseFloat(item.price || 0), 0);
      const taxRate = 13.0;
      const taxAmount = amountExcludingTax * (taxRate / 100);
      const totalAmount = amountExcludingTax + taxAmount;

      const invoiceData = {
        invoice_type: '销项',
        invoice_number: invoiceNumber,
        invoice_code: null,
        invoice_date: salesOutbound.outbound_date || new Date().toISOString().split('T')[0],
        customer_id: salesOutbound.customer_id || null,
        supplier_id: null,
        supplier_or_customer_name: salesOutbound.customer_name || null,
        supplier_tax_number: null,
        amount_excluding_tax: amountExcludingTax.toFixed(2),
        tax_rate: taxRate,
        tax_amount: taxAmount.toFixed(2),
        total_amount: totalAmount.toFixed(2),
        status: '未认证',
        related_document_type: '销售出库单',
        related_document_id: salesOutbound.id,
        remark: `自动生成 - 销售出库单: ${salesOutbound.outbound_no}`,
        created_by: userId || salesOutbound.created_by || 0,
      };

      const invoiceId = await taxModel.createTaxInvoice(invoiceData, connection);
      await connection.commit();
      return { invoiceId, invoiceNumber, totalAmount: totalAmount.toFixed(2) };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * 生成进项发票
   */
  static async generateInputTaxInvoiceFromPurchaseReceipt(purchaseReceipt, userId = null) {
    const connection = await db.pool.getConnection();
    try {
      await connection.beginTransaction();
      
      const [existing] = await connection.execute(
        'SELECT id FROM tax_invoices WHERE related_document_type = ? AND related_document_id = ?',
        ['采购入库单', purchaseReceipt.id]
      );
      if (existing.length > 0) {
        await connection.rollback();
        return { skipped: true, message: '已存在对应单据的进项发票' };
      }

      const invoiceNumber = `待补录-${purchaseReceipt.receipt_no}`;

      const [receiptItems] = await connection.execute(
        `SELECT pri.qualified_quantity, COALESCE(poi.price, m.cost_price, m.price, 0) as price
         FROM purchase_receipt_items pri
         JOIN purchase_receipts pr ON pri.receipt_id = pr.id
         LEFT JOIN purchase_orders po ON pr.order_id = po.id
         LEFT JOIN purchase_order_items poi ON po.id = poi.order_id AND pri.material_id = poi.material_id
         LEFT JOIN materials m ON pri.material_id = m.id
         WHERE pri.receipt_id = ?`,
        [purchaseReceipt.id]
      );

      const amountExcludingTax = receiptItems.reduce((sum, item) => sum + parseFloat(item.qualified_quantity || 0) * parseFloat(item.price || 0), 0);
      const taxRate = 13.0;
      const taxAmount = amountExcludingTax * (taxRate / 100);
      const totalAmount = amountExcludingTax + taxAmount;

      const invoiceData = {
        invoice_type: '进项',
        invoice_number: invoiceNumber,
        invoice_code: null,
        invoice_date: purchaseReceipt.receipt_date || new Date().toISOString().split('T')[0],
        supplier_id: purchaseReceipt.supplier_id || null,
        customer_id: null,
        supplier_or_customer_name: purchaseReceipt.supplier_name || null,
        supplier_tax_number: null,
        amount_excluding_tax: amountExcludingTax.toFixed(2),
        tax_rate: taxRate,
        tax_amount: taxAmount.toFixed(2),
        total_amount: totalAmount.toFixed(2),
        status: '未认证',
        related_document_type: '采购入库单',
        related_document_id: purchaseReceipt.id,
        remark: `自动生成 - 采购入库单: ${purchaseReceipt.receipt_no}`,
        created_by: userId || purchaseReceipt.created_by || 0,
      };

      const invoiceId = await taxModel.createTaxInvoice(invoiceData, connection);
      await connection.commit();
      return { invoiceId, invoiceNumber, totalAmount: totalAmount.toFixed(2) };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  // ==================== 外委加工分录生成 ====================
  // (外委发料分录在这一版本被精简或与当前无需防重复的核心功能保持一致)
}

module.exports = FinanceIntegrationService;
