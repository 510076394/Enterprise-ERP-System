/**
 * cash/Transfer.js
 * @description 资金调拨管理模型
 * @date 2026-01-23
 * @version 1.0.0
 */

const logger = require('../../utils/logger');
const db = require('../../config/db');
const financeModel = require('../finance');

class FundTransferModel {
  /**
   * 资金调拨（从一个银行账户转账到另一个银行账户）
   */
  static async transferFunds(transferData) {
    const connection = await db.pool.getConnection();
    try {
      await connection.beginTransaction();

      // 获取源账户和目标账户信息
      const [sourceAccounts] = await connection.execute(
        'SELECT * FROM bank_accounts WHERE id = ?',
        [transferData.from_account_id]
      );
      if (sourceAccounts.length === 0) {
        throw new Error(`源银行账户ID ${transferData.from_account_id} 不存在`);
      }

      const [targetAccounts] = await connection.execute(
        'SELECT * FROM bank_accounts WHERE id = ?',
        [transferData.to_account_id]
      );
      if (targetAccounts.length === 0) {
        throw new Error(`目标银行账户ID ${transferData.to_account_id} 不存在`);
      }

      const sourceAccount = sourceAccounts[0];
      const targetAccount = targetAccounts[0];

      // 检查源账户余额是否充足
      if (parseFloat(sourceAccount.current_balance) < parseFloat(transferData.amount)) {
        throw new Error('源账户余额不足');
      }

      // 创建源账户转出交易
      const [fromResult] = await connection.execute(
        `INSERT INTO bank_transactions 
        (transaction_number, bank_account_id, transaction_date, transaction_type, 
         amount, reference_number, description, is_reconciled, related_party) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          transferData.transaction_number + '-OUT',
          transferData.from_account_id,
          transferData.transaction_date,
          '转出',
          transferData.amount,
          transferData.reference_number || null,
          `资金调拨到 ${targetAccount.bank_name} ${targetAccount.account_name}${transferData.description ? ': ' + transferData.description : ''}`,
          false,
          `${targetAccount.bank_name} ${targetAccount.account_name}`,
        ]
      );

      // 创建目标账户转入交易
      const [toResult] = await connection.execute(
        `INSERT INTO bank_transactions 
        (transaction_number, bank_account_id, transaction_date, transaction_type, 
         amount, reference_number, description, is_reconciled, related_party) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          transferData.transaction_number + '-IN',
          transferData.to_account_id,
          transferData.transaction_date,
          '转入',
          transferData.amount,
          transferData.reference_number || null,
          `资金调拨自 ${sourceAccount.bank_name} ${sourceAccount.account_name}${transferData.description ? ': ' + transferData.description : ''}`,
          false,
          `${sourceAccount.bank_name} ${sourceAccount.account_name}`,
        ]
      );

      // 更新源账户和目标账户余额
      await connection.execute(
        'UPDATE bank_accounts SET current_balance = current_balance - ? WHERE id = ?',
        [transferData.amount, transferData.from_account_id]
      );

      await connection.execute(
        'UPDATE bank_accounts SET current_balance = current_balance + ? WHERE id = ?',
        [transferData.amount, transferData.to_account_id]
      );

      // 如果提供了会计分录信息，创建资金调拨会计分录
      if (transferData.gl_entry) {
        const entryData = {
          entry_number: transferData.gl_entry.entry_number,
          entry_date: transferData.transaction_date,
          posting_date: transferData.transaction_date,
          document_type: '资金调拨',
          document_number: transferData.transaction_number,
          period_id: transferData.gl_entry.period_id,
          description: `资金调拨: ${sourceAccount.bank_name} ${sourceAccount.account_name} -> ${targetAccount.bank_name} ${targetAccount.account_name}`,
          created_by: transferData.gl_entry.created_by,
        };

        // 资金调拨分录明细
        const entryItems = [
          // 借：目标银行账户
          {
            account_id: transferData.gl_entry.to_account_id,
            debit_amount: transferData.amount,
            credit_amount: 0,
            description: `资金调拨到 ${targetAccount.bank_name} ${targetAccount.account_name}`,
          },
          // 贷：源银行账户
          {
            account_id: transferData.gl_entry.from_account_id,
            debit_amount: 0,
            credit_amount: transferData.amount,
            description: `资金调拨自 ${sourceAccount.bank_name} ${sourceAccount.account_name}`,
          },
        ];

        // 创建会计分录
        await financeModel.createEntry(entryData, entryItems, connection);
      }

      await connection.commit();
      return {
        from_transaction_id: fromResult.insertId,
        to_transaction_id: toResult.insertId,
      };
    } catch (error) {
      await connection.rollback();
      logger.error('资金调拨失败，事务已回滚:', error);
      throw error;
    } finally {
      connection.release();
    }
  }
}

module.exports = FundTransferModel;
