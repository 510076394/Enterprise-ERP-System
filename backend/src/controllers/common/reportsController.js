/**
 * reportsController.js
 * @description 控制器文件
 * @date 2025-08-27
 * @version 1.0.0
 */

const { ResponseHandler } = require('../../utils/responseHandler');
const { logger } = require('../../utils/logger');

const db = require('../../config/db');

/**
 * 财务报表控制器
 */
const reportsController = {
  /**
   * 获取资产负债表
   */
  getBalanceSheet: async (req, res) => {
    try {
      const { reportDate, compareDate, level = 0, unit = 1 } = req.query;

      if (!reportDate) {
        return ResponseHandler.error(res, '请提供报表日期', 'BAD_REQUEST', 400);
      }

      // 模拟资产负债表数据
      const balanceSheetData = {
        reportDate,
        compareDate,
        unit: parseInt(unit),
        items: [
          {
            id: 1,
            name: '资产',
            code: '1',
            level: 0,
            isTitle: true,
            amount: 5000000 / unit,
            compareAmount: compareDate ? 4500000 / unit : null,
            children: [
              {
                id: 2,
                name: '流动资产',
                code: '1.1',
                level: 1,
                isTitle: true,
                amount: 3000000 / unit,
                compareAmount: compareDate ? 2800000 / unit : null,
                children: [
                  {
                    id: 3,
                    name: '货币资金',
                    code: '1001',
                    amount: 1000000 / unit,
                    compareAmount: compareDate ? 800000 / unit : null,
                    level: 2,
                  },
                  {
                    id: 4,
                    name: '应收账款',
                    code: '1122',
                    amount: 800000 / unit,
                    compareAmount: compareDate ? 750000 / unit : null,
                    level: 2,
                  },
                  {
                    id: 5,
                    name: '预付账款',
                    code: '1123',
                    amount: 300000 / unit,
                    compareAmount: compareDate ? 280000 / unit : null,
                    level: 2,
                  },
                  {
                    id: 6,
                    name: '存货',
                    code: '1405',
                    amount: 900000 / unit,
                    compareAmount: compareDate ? 970000 / unit : null,
                    level: 2,
                  },
                ],
              },
              {
                id: 7,
                name: '非流动资产',
                code: '1.2',
                level: 1,
                isTitle: true,
                amount: 2000000 / unit,
                compareAmount: compareDate ? 1700000 / unit : null,
                children: [
                  {
                    id: 8,
                    name: '固定资产',
                    code: '1601',
                    amount: 1800000 / unit,
                    compareAmount: compareDate ? 1600000 / unit : null,
                    level: 2,
                  },
                  {
                    id: 9,
                    name: '累计折旧',
                    code: '1602',
                    amount: -300000 / unit,
                    compareAmount: compareDate ? -200000 / unit : null,
                    level: 2,
                  },
                  {
                    id: 10,
                    name: '无形资产',
                    code: '1701',
                    amount: 500000 / unit,
                    compareAmount: compareDate ? 300000 / unit : null,
                    level: 2,
                  },
                ],
              },
            ],
          },
          {
            id: 100,
            name: '负债和所有者权益',
            code: '2',
            level: 0,
            isTitle: true,
            amount: 5000000 / unit,
            compareAmount: compareDate ? 4500000 / unit : null,
            children: [
              {
                id: 101,
                name: '流动负债',
                code: '2.1',
                level: 1,
                isTitle: true,
                amount: 1500000 / unit,
                compareAmount: compareDate ? 1400000 / unit : null,
                children: [
                  {
                    id: 102,
                    name: '应付账款',
                    code: '2202',
                    amount: 600000 / unit,
                    compareAmount: compareDate ? 550000 / unit : null,
                    level: 2,
                  },
                  {
                    id: 103,
                    name: '预收账款',
                    code: '2203',
                    amount: 400000 / unit,
                    compareAmount: compareDate ? 380000 / unit : null,
                    level: 2,
                  },
                  {
                    id: 104,
                    name: '应付职工薪酬',
                    code: '2211',
                    amount: 300000 / unit,
                    compareAmount: compareDate ? 280000 / unit : null,
                    level: 2,
                  },
                  {
                    id: 105,
                    name: '应交税费',
                    code: '2221',
                    amount: 200000 / unit,
                    compareAmount: compareDate ? 190000 / unit : null,
                    level: 2,
                  },
                ],
              },
              {
                id: 106,
                name: '所有者权益',
                code: '3',
                level: 1,
                isTitle: true,
                amount: 3500000 / unit,
                compareAmount: compareDate ? 3100000 / unit : null,
                children: [
                  {
                    id: 107,
                    name: '实收资本',
                    code: '3001',
                    amount: 2000000 / unit,
                    compareAmount: compareDate ? 2000000 / unit : null,
                    level: 2,
                  },
                  {
                    id: 108,
                    name: '资本公积',
                    code: '3002',
                    amount: 500000 / unit,
                    compareAmount: compareDate ? 400000 / unit : null,
                    level: 2,
                  },
                  {
                    id: 109,
                    name: '盈余公积',
                    code: '3101',
                    amount: 300000 / unit,
                    compareAmount: compareDate ? 250000 / unit : null,
                    level: 2,
                  },
                  {
                    id: 110,
                    name: '未分配利润',
                    code: '3104',
                    amount: 700000 / unit,
                    compareAmount: compareDate ? 450000 / unit : null,
                    level: 2,
                  },
                ],
              },
            ],
          },
        ],
      };

      ResponseHandler.success(res, balanceSheetData, '操作成功');
    } catch (error) {
      ResponseHandler.error(res, '获取资产负债表失败', 'SERVER_ERROR', 500, error);
    }
  },

  /**
   * 获取利润表
   */
  getIncomeStatement: async (req, res) => {
    try {
      const {
        startDate,
        endDate,
        compareStartDate,
        compareEndDate,
        level = 0,
        unit = 1,
      } = req.query;

      if (!startDate || !endDate) {
        return ResponseHandler.error(res, '请提供开始日期和结束日期', 'BAD_REQUEST', 400);
      }

      // 模拟利润表数据
      const incomeStatementData = {
        startDate,
        endDate,
        compareStartDate,
        compareEndDate,
        unit: parseInt(unit),
        items: [
          {
            id: 1,
            name: '营业收入',
            code: '6001',
            level: 0,
            amount: 8000000 / unit,
            compareAmount: compareStartDate ? 7200000 / unit : null,
            children: [
              {
                id: 2,
                name: '主营业务收入',
                code: '6001',
                amount: 7500000 / unit,
                compareAmount: compareStartDate ? 6800000 / unit : null,
                level: 1,
              },
              {
                id: 3,
                name: '其他业务收入',
                code: '6051',
                amount: 500000 / unit,
                compareAmount: compareStartDate ? 400000 / unit : null,
                level: 1,
              },
            ],
          },
          {
            id: 4,
            name: '营业成本',
            code: '6401',
            level: 0,
            amount: -4800000 / unit,
            compareAmount: compareStartDate ? -4320000 / unit : null,
            children: [
              {
                id: 5,
                name: '主营业务成本',
                code: '6401',
                amount: -4500000 / unit,
                compareAmount: compareStartDate ? -4080000 / unit : null,
                level: 1,
              },
              {
                id: 6,
                name: '其他业务成本',
                code: '6402',
                amount: -300000 / unit,
                compareAmount: compareStartDate ? -240000 / unit : null,
                level: 1,
              },
            ],
          },
          {
            id: 7,
            name: '毛利润',
            code: 'GROSS_PROFIT',
            level: 0,
            amount: 3200000 / unit,
            compareAmount: compareStartDate ? 2880000 / unit : null,
            isCalculated: true,
          },
          {
            id: 8,
            name: '期间费用',
            code: 'PERIOD_EXPENSES',
            level: 0,
            amount: -1800000 / unit,
            compareAmount: compareStartDate ? -1620000 / unit : null,
            children: [
              {
                id: 9,
                name: '销售费用',
                code: '6601',
                amount: -800000 / unit,
                compareAmount: compareStartDate ? -720000 / unit : null,
                level: 1,
              },
              {
                id: 10,
                name: '管理费用',
                code: '6602',
                amount: -600000 / unit,
                compareAmount: compareStartDate ? -540000 / unit : null,
                level: 1,
              },
              {
                id: 11,
                name: '财务费用',
                code: '6603',
                amount: -400000 / unit,
                compareAmount: compareStartDate ? -360000 / unit : null,
                level: 1,
              },
            ],
          },
          {
            id: 12,
            name: '营业利润',
            code: 'OPERATING_PROFIT',
            level: 0,
            amount: 1400000 / unit,
            compareAmount: compareStartDate ? 1260000 / unit : null,
            isCalculated: true,
          },
          {
            id: 13,
            name: '营业外收入',
            code: '6111',
            level: 0,
            amount: 100000 / unit,
            compareAmount: compareStartDate ? 80000 / unit : null,
          },
          {
            id: 14,
            name: '营业外支出',
            code: '6701',
            level: 0,
            amount: -50000 / unit,
            compareAmount: compareStartDate ? -40000 / unit : null,
          },
          {
            id: 15,
            name: '利润总额',
            code: 'TOTAL_PROFIT',
            level: 0,
            amount: 1450000 / unit,
            compareAmount: compareStartDate ? 1300000 / unit : null,
            isCalculated: true,
          },
          {
            id: 16,
            name: '所得税费用',
            code: '6801',
            level: 0,
            amount: -362500 / unit,
            compareAmount: compareStartDate ? -325000 / unit : null,
          },
          {
            id: 17,
            name: '净利润',
            code: 'NET_PROFIT',
            level: 0,
            amount: 1087500 / unit,
            compareAmount: compareStartDate ? 975000 / unit : null,
            isCalculated: true,
          },
        ],
      };

      ResponseHandler.success(res, incomeStatementData, '操作成功');
    } catch (error) {
      ResponseHandler.error(res, '获取利润表失败', 'SERVER_ERROR', 500, error);
    }
  },

  /**
   * 获取出纳报表（现金流量表改为出纳报表）
   */
  getCashFlow: async (req, res) => {
    try {
      const { reportMonth, unit = 1 } = req.query;

      if (!reportMonth) {
        return ResponseHandler.error(res, '请提供报表月份', 'BAD_REQUEST', 400);
      }

      // 解析报表月份 (格式: 2025-08)
      const [year, month] = reportMonth.split('-');
      const reportYear = parseInt(year);
      const reportMonthNum = parseInt(month);

      // 计算上月和本月的日期范围
      const currentMonthStartStr = `${reportYear}-${month.padStart(2, '0')}-01`;

      // 计算当月最后一天
      const nextMonth = reportMonthNum === 12 ? 1 : reportMonthNum + 1;
      const nextYear = reportMonthNum === 12 ? reportYear + 1 : reportYear;
      const currentMonthEndStr = new Date(nextYear, nextMonth - 1, 0).toISOString().split('T')[0];

      // 计算上月日期范围
      const lastMonth = reportMonthNum === 1 ? 12 : reportMonthNum - 1;
      const lastYear = reportMonthNum === 1 ? reportYear - 1 : reportYear;
      const lastMonthStartStr = `${lastYear}-${lastMonth.toString().padStart(2, '0')}-01`;
      const lastMonthEndStr = new Date(reportYear, reportMonthNum - 1, 0)
        .toISOString()
        .split('T')[0];

      logger.info('日期范围:', {
        lastMonthStart: lastMonthStartStr,
        lastMonthEnd: lastMonthEndStr,
        currentMonthStart: currentMonthStartStr,
        currentMonthEnd: currentMonthEndStr,
      });

      const cashierReportData = [];

      // 1. 获取现金数据
      const cashData = await reportsController.getCashData(
        lastMonthStartStr,
        lastMonthEndStr,
        currentMonthStartStr,
        currentMonthEndStr
      );
      cashierReportData.push(cashData);

      // 2. 获取银行账户数据
      const bankData = await reportsController.getBankAccountsData(
        lastMonthStartStr,
        lastMonthEndStr,
        currentMonthStartStr,
        currentMonthEndStr
      );
      cashierReportData.push(...bankData);

      ResponseHandler.success(res, cashierReportData, '操作成功');
    } catch (error) {
      logger.error('获取出纳报表失败:', error);
      ResponseHandler.error(res, '获取出纳报表失败', 'SERVER_ERROR', 500, error);
    }
  },

  /**
   * 获取现金数据
   */
  getCashData: async (lastMonthStart, lastMonthEnd, currentMonthStart, currentMonthEnd) => {
    try {
      // 获取上月末现金余额（上月所有现金交易的累计）
      const [lastMonthResult] = await db.pool.execute(
        `
        SELECT
          COALESCE(SUM(CASE WHEN transaction_type = 'income' THEN amount ELSE -amount END), 0) as balance
        FROM cash_transactions
        WHERE transaction_date <= ?
      `,
        [lastMonthEnd]
      );

      // 获取本月现金收入
      const [currentMonthIncome] = await db.pool.execute(
        `
        SELECT COALESCE(SUM(amount), 0) as income
        FROM cash_transactions
        WHERE transaction_type = 'income'
        AND transaction_date >= ? AND transaction_date <= ?
      `,
        [currentMonthStart, currentMonthEnd]
      );

      // 获取本月现金支出
      const [currentMonthExpense] = await db.pool.execute(
        `
        SELECT COALESCE(SUM(amount), 0) as expense
        FROM cash_transactions
        WHERE transaction_type = 'expense'
        AND transaction_date >= ? AND transaction_date <= ?
      `,
        [currentMonthStart, currentMonthEnd]
      );

      const lastMonthBalance = parseFloat(lastMonthResult[0].balance) || 0;
      const monthIncome = parseFloat(currentMonthIncome[0].income) || 0;
      const monthExpense = parseFloat(currentMonthExpense[0].expense) || 0;
      const currentBalance = lastMonthBalance + monthIncome - monthExpense;

      logger.info('现金数据:', {
        lastMonthBalance,
        monthIncome,
        monthExpense,
        currentBalance,
      });

      return {
        id: 1,
        name: '现金',
        type: 'cash',
        lastMonthBalance: lastMonthBalance,
        currentMonthIncome: monthIncome,
        currentMonthExpense: monthExpense,
        currentMonthBalance: currentBalance,
      };
    } catch (error) {
      logger.error('获取现金数据失败:', error);
      // 返回默认值
      return {
        id: 1,
        name: '现金',
        type: 'cash',
        lastMonthBalance: 0,
        currentMonthIncome: 0,
        currentMonthExpense: 0,
        currentMonthBalance: 0,
      };
    }
  },

  /**
   * 获取银行账户数据
   */
  getBankAccountsData: async (lastMonthStart, lastMonthEnd, currentMonthStart, currentMonthEnd) => {
    try {
      // 获取所有活跃的银行账户
      const [bankAccounts] = await db.pool.execute(`
        SELECT id, account_name, bank_name, currency_code, current_balance
        FROM bank_accounts
        WHERE is_active = true
        ORDER BY bank_name, account_name
      `);

      const bankData = [];
      let accountIndex = 2; // 从2开始，因为现金是1

      for (const account of bankAccounts) {
        // 获取上月末银行账户余额
        const [lastMonthBalance] = await db.pool.execute(
          `
          SELECT
            COALESCE(SUM(CASE WHEN transaction_type IN ('存款', '转入', '利息') THEN amount
                             WHEN transaction_type IN ('取款', '转出', '费用') THEN -amount
                             ELSE 0 END), 0) as balance
          FROM bank_transactions
          WHERE bank_account_id = ? AND transaction_date <= ?
        `,
          [account.id, lastMonthEnd]
        );

        // 获取本月银行收入
        const [currentMonthIncome] = await db.pool.execute(
          `
          SELECT COALESCE(SUM(amount), 0) as income
          FROM bank_transactions
          WHERE bank_account_id = ?
          AND transaction_type IN ('存款', '转入', '利息')
          AND transaction_date >= ? AND transaction_date <= ?
        `,
          [account.id, currentMonthStart, currentMonthEnd]
        );

        // 获取本月银行支出
        const [currentMonthExpense] = await db.pool.execute(
          `
          SELECT COALESCE(SUM(amount), 0) as expense
          FROM bank_transactions
          WHERE bank_account_id = ?
          AND transaction_type IN ('取款', '转出', '费用')
          AND transaction_date >= ? AND transaction_date <= ?
        `,
          [account.id, currentMonthStart, currentMonthEnd]
        );

        const lastBalance = parseFloat(lastMonthBalance[0].balance) || 0;
        const monthIncome = parseFloat(currentMonthIncome[0].income) || 0;
        const monthExpense = parseFloat(currentMonthExpense[0].expense) || 0;
        const currentBalance = lastBalance + monthIncome - monthExpense;

        // 构建账户名称
        let accountDisplayName = `银行存款（${account.bank_name}`;
        if (account.currency_code && account.currency_code !== 'CNY') {
          accountDisplayName += ` ${account.currency_code}`;
        }
        if (account.account_name && account.account_name !== account.bank_name) {
          accountDisplayName += ` ${account.account_name}`;
        }
        accountDisplayName += '）';

        bankData.push({
          id: accountIndex++,
          name: accountDisplayName,
          type: 'bank',
          bank: account.bank_name,
          currency: account.currency_code || 'CNY',
          lastMonthBalance: lastBalance,
          currentMonthIncome: monthIncome,
          currentMonthExpense: monthExpense,
          currentMonthBalance: currentBalance,
        });
      }

      return bankData;
    } catch (error) {
      logger.error('获取银行账户数据失败:', error);
      // 返回空数组
      return [];
    }
  },
};

module.exports = reportsController;
