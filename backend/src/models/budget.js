/**
 * 预算管理数据模型
 *
 * @module models/budget
 */

const db = require('../config/db');
const { logger } = require('../utils/logger');

const budgetModel = {
  // ==================== 预算主表操作 ====================

  /**
   * 创建预算
   * @param {Object} budgetData - 预算数据
   * @param {Array} details - 预算明细数组
   * @param {Object} connection - 数据库连接（可选）
   * @returns {Promise<number>} 预算ID
   */
  createBudget: async (budgetData, details = [], connection = null) => {
    const conn = connection || db.pool;
    const useTransaction = !connection;

    try {
      if (useTransaction) await conn.query('START TRANSACTION');

      const {
        budget_no,
        budget_name,
        budget_year,
        budget_type,
        department_id,
        start_date,
        end_date,
        total_amount,
        status = '草稿',
        description,
        created_by,
      } = budgetData;

      // 插入预算主表
      const [result] = await conn.execute(
        `
        INSERT INTO budgets (
          budget_no, budget_name, budget_year, budget_type, department_id,
          start_date, end_date, total_amount, status, description, created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
        [
          budget_no,
          budget_name,
          budget_year,
          budget_type,
          department_id,
          start_date,
          end_date,
          total_amount,
          status,
          description,
          created_by,
        ]
      );

      const budgetId = result.insertId;

      // 插入预算明细
      if (details && details.length > 0) {
        for (const detail of details) {
          await conn.execute(
            `
            INSERT INTO budget_details (
              budget_id, account_id, department_id, budget_amount,
              warning_threshold, description
            ) VALUES (?, ?, ?, ?, ?, ?)
          `,
            [
              budgetId,
              detail.account_id,
              detail.department_id || null,
              detail.budget_amount,
              detail.warning_threshold || 80.0,
              detail.description || null,
            ]
          );
        }
      }

      if (useTransaction) await conn.query('COMMIT');

      logger.info('预算创建成功', { budgetId, budget_no });
      return budgetId;
    } catch (error) {
      if (useTransaction) await conn.query('ROLLBACK');
      logger.error('创建预算失败:', error);
      throw error;
    }
  },

  /**
   * 获取预算列表
   * @param {Object} filters - 筛选条件
   * @returns {Promise<Array>} 预算列表
   */
  getBudgets: async (filters = {}) => {
    try {
      let query = `
        SELECT 
          b.*,
          d.name as department_name,
          u.real_name as creator_name,
          COALESCE(
            (
              SELECT SUM(gei.debit_amount - gei.credit_amount)
              FROM gl_entry_items gei
              JOIN gl_entries ge ON gei.entry_id = ge.id
              JOIN budget_details bd ON bd.budget_id = b.id AND bd.account_id = gei.account_id
              WHERE ge.entry_date BETWEEN b.start_date AND b.end_date
              AND ge.is_posted = 1
            ), 0
          ) as real_used_amount
        FROM budgets b
        LEFT JOIN departments d ON b.department_id = d.id
        LEFT JOIN users u ON b.created_by = u.id
        WHERE 1=1
      `;

      const params = [];

      if (filters.budget_year) {
        query += ' AND b.budget_year = ?';
        params.push(filters.budget_year);
      }

      if (filters.budget_type) {
        query += ' AND b.budget_type = ?';
        params.push(filters.budget_type);
      }

      if (filters.status) {
        query += ' AND b.status = ?';
        params.push(filters.status);
      }

      if (filters.department_id) {
        query += ' AND b.department_id = ?';
        params.push(filters.department_id);
      }

      if (filters.keyword) {
        query += ' AND (b.budget_no LIKE ? OR b.budget_name LIKE ?)';
        const keyword = `%${filters.keyword}%`;
        params.push(keyword, keyword);
      }

      query += ' ORDER BY b.created_at DESC';

      // 注意：LIMIT 和 OFFSET 不能使用参数绑定，必须直接嵌入 SQL
      if (filters.limit) {
        const limitNum = parseInt(filters.limit);
        const offsetNum = parseInt(filters.offset || 0);
        query += ` LIMIT ${limitNum} OFFSET ${offsetNum}`;
      }

      const [budgets] = await db.pool.execute(query, params);

      // 用实时计算的real_used_amount覆盖主表的used_amount
      const processedBudgets = budgets.map(b => ({
        ...b,
        used_amount: parseFloat(b.real_used_amount) || 0,
        remaining_amount: parseFloat(b.total_amount || 0) - (parseFloat(b.real_used_amount) || 0),
      }));

      return processedBudgets;
    } catch (error) {
      logger.error('获取预算列表失败:', error);
      throw error;
    }
  },

  /**
   * 获取预算总数
   * @param {Object} filters - 筛选条件
   * @returns {Promise<number>} 总数
   */
  getBudgetsCount: async (filters = {}) => {
    try {
      let query = 'SELECT COUNT(*) as total FROM budgets WHERE 1=1';
      const params = [];

      if (filters.budget_year) {
        query += ' AND budget_year = ?';
        params.push(filters.budget_year);
      }

      if (filters.budget_type) {
        query += ' AND budget_type = ?';
        params.push(filters.budget_type);
      }

      if (filters.status) {
        query += ' AND status = ?';
        params.push(filters.status);
      }

      if (filters.department_id) {
        query += ' AND department_id = ?';
        params.push(filters.department_id);
      }

      if (filters.keyword) {
        query += ' AND (budget_no LIKE ? OR budget_name LIKE ?)';
        const keyword = `%${filters.keyword}%`;
        params.push(keyword, keyword);
      }

      const [result] = await db.pool.execute(query, params);
      return result[0].total;
    } catch (error) {
      logger.error('获取预算总数失败:', error);
      throw error;
    }
  },

  /**
   * 根据ID获取预算详情
   * @param {number} id - 预算ID
   * @returns {Promise<Object>} 预算详情
   */
  getBudgetById: async (id) => {
    try {
      const [budgets] = await db.pool.execute(
        `
        SELECT
          b.*,
          d.name as department_name,
          u.real_name as creator_name,
          approver.real_name as approver_name
        FROM budgets b
        LEFT JOIN departments d ON b.department_id = d.id
        LEFT JOIN users u ON b.created_by = u.id
        LEFT JOIN users approver ON b.approved_by = approver.id
        WHERE b.id = ?
      `,
        [id]
      );

      if (budgets.length === 0) return null;

      const budget = budgets[0];

      // 获取预算明细，同时实时计算实际执行金额
      const [details] = await db.pool.execute(
        `
        SELECT
          bd.*,
          a.account_code,
          a.account_name,
          d.name as department_name,
          COALESCE(
            (
              SELECT SUM(gei.debit_amount - gei.credit_amount)
              FROM gl_entry_items gei
              JOIN gl_entries ge ON gei.entry_id = ge.id
              WHERE gei.account_id = bd.account_id
              AND ge.entry_date BETWEEN ? AND ?
              AND ge.is_posted = 1
            ), 0
          ) as actual_amount
        FROM budget_details bd
        LEFT JOIN gl_accounts a ON bd.account_id = a.id
        LEFT JOIN departments d ON bd.department_id = d.id
        WHERE bd.budget_id = ?
        ORDER BY bd.id
      `,
        [budget.start_date, budget.end_date, id]
      );

      // 用实时数据覆盖used_amount和remaining_amount
      let totalUsed = 0;
      budget.details = details.map(item => {
        const actual = parseFloat(item.actual_amount) || 0;
        const budgetAmt = parseFloat(item.budget_amount) || 0;
        totalUsed += actual;
        return {
          ...item,
          used_amount: actual,
          remaining_amount: budgetAmt - actual,
        };
      });

      // 主表也同步
      budget.used_amount = totalUsed;
      budget.remaining_amount = parseFloat(budget.total_amount || 0) - totalUsed;

      return budget;
    } catch (error) {
      logger.error('获取预算详情失败:', error);
      throw error;
    }
  },

  /**
   * 更新预算
   * @param {number} id - 预算ID
   * @param {Object} budgetData - 预算数据
   * @returns {Promise<boolean>} 是否成功
   */
  updateBudget: async (id, budgetData) => {
    try {
      const {
        budget_name,
        budget_year,
        budget_type,
        department_id,
        start_date,
        end_date,
        total_amount,
        status,
        description,
      } = budgetData;

      const [result] = await db.pool.execute(
        `
        UPDATE budgets
        SET budget_name = ?, budget_year = ?, budget_type = ?, department_id = ?,
            start_date = ?, end_date = ?, total_amount = ?, status = ?, description = ?
        WHERE id = ?
      `,
        [
          budget_name,
          budget_year,
          budget_type,
          department_id,
          start_date,
          end_date,
          total_amount,
          status,
          description,
          id,
        ]
      );

      logger.info('预算更新成功', { id });
      return result.affectedRows > 0;
    } catch (error) {
      logger.error('更新预算失败:', error);
      throw error;
    }
  },

  /**
   * 删除预算
   * @param {number} id - 预算ID
   * @returns {Promise<boolean>} 是否成功
   */
  deleteBudget: async (id) => {
    const connection = await db.pool.getConnection();
    try {
      await connection.beginTransaction();

      // 级联删除关联数据
      await connection.execute('DELETE FROM budget_warnings WHERE budget_id = ?', [id]);
      await connection.execute('DELETE FROM budget_execution WHERE budget_id = ?', [id]);
      await connection.execute('DELETE FROM budget_details WHERE budget_id = ?', [id]);
      const [result] = await connection.execute('DELETE FROM budgets WHERE id = ?', [id]);

      await connection.commit();
      logger.info('预算及关联数据删除成功', { id });
      return result.affectedRows > 0;
    } catch (error) {
      await connection.rollback();
      logger.error('删除预算失败:', error);
      throw error;
    } finally {
      connection.release();
    }
  },

  /**
   * 更新预算状态
   * @param {number} id - 预算ID
   * @param {string} status - 新状态
   * @param {Object} extraData - 额外数据（如审批人、审批时间）
   * @returns {Promise<boolean>} 是否成功
   */
  updateBudgetStatus: async (id, status, extraData = {}) => {
    try {
      let query = 'UPDATE budgets SET status = ?';
      const params = [status];

      if (extraData.approval_status) {
        query += ', approval_status = ?';
        params.push(extraData.approval_status);
      }

      if (extraData.approved_by) {
        query += ', approved_by = ?, approved_at = NOW()';
        params.push(extraData.approved_by);
      }

      query += ' WHERE id = ?';
      params.push(id);

      const [result] = await db.pool.execute(query, params);

      logger.info('预算状态更新成功', { id, status });
      return result.affectedRows > 0;
    } catch (error) {
      logger.error('更新预算状态失败:', error);
      throw error;
    }
  },

  // ==================== 预算明细操作 ====================

  /**
   * 更新预算明细的已使用金额
   * @param {number} detailId - 明细ID
   * @param {number} amount - 金额
   * @param {Object} connection - 数据库连接（可选）
   * @returns {Promise<boolean>} 是否成功
   */
  updateBudgetDetailUsedAmount: async (detailId, amount, connection = null) => {
    const conn = connection || db.pool;

    try {
      const [result] = await conn.execute(
        `
        UPDATE budget_details
        SET used_amount = used_amount + ?,
            remaining_amount = budget_amount - (used_amount + ?)
        WHERE id = ?
      `,
        [amount, amount, detailId]
      );

      logger.info('预算明细已使用金额更新成功', { detailId, amount });
      return result.affectedRows > 0;
    } catch (error) {
      logger.error('更新预算明细已使用金额失败:', error);
      throw error;
    }
  },

  /**
   * 获取预算明细
   * @param {number} budgetId - 预算ID
   * @returns {Promise<Array>} 明细列表
   */
  getBudgetDetails: async (budgetId) => {
    try {
      const [details] = await db.pool.execute(
        `
        SELECT
          bd.*,
          a.account_code,
          a.account_name,
          d.name as department_name
        FROM budget_details bd
        LEFT JOIN gl_accounts a ON bd.account_id = a.id
        LEFT JOIN departments d ON bd.department_id = d.id
        WHERE bd.budget_id = ?
        ORDER BY bd.id
      `,
        [budgetId]
      );

      return details;
    } catch (error) {
      logger.error('获取预算明细失败:', error);
      throw error;
    }
  },

  // ==================== 预算执行操作 ====================

  /**
   * 创建预算执行记录
   * @param {Object} executionData - 执行数据
   * @param {Object} connection - 数据库连接（可选）
   * @returns {Promise<number>} 执行ID
   */
  createBudgetExecution: async (executionData, connection = null) => {
    const conn = connection || db.pool;

    try {
      const {
        budget_id,
        budget_detail_id,
        execution_date,
        execution_amount,
        document_type,
        document_id,
        document_no,
        gl_entry_id,
        description,
        created_by,
      } = executionData;

      const [result] = await conn.execute(
        `
        INSERT INTO budget_execution (
          budget_id, budget_detail_id, execution_date, execution_amount,
          document_type, document_id, document_no, gl_entry_id, description, created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
        [
          budget_id,
          budget_detail_id,
          execution_date,
          execution_amount,
          document_type,
          document_id,
          document_no,
          gl_entry_id,
          description,
          created_by,
        ]
      );

      logger.info('预算执行记录创建成功', { executionId: result.insertId });
      return result.insertId;
    } catch (error) {
      logger.error('创建预算执行记录失败:', error);
      throw error;
    }
  },

  /**
   * 获取预算执行记录
   * @param {number} budgetId - 预算ID
   * @returns {Promise<Array>} 执行记录列表
   */
  getBudgetExecutions: async (budgetId) => {
    try {
      const [executions] = await db.pool.execute(
        `
        SELECT
          be.*,
          bd.account_id,
          a.account_code,
          a.account_name,
          u.real_name as creator_name
        FROM budget_execution be
        LEFT JOIN budget_details bd ON be.budget_detail_id = bd.id
        LEFT JOIN gl_accounts a ON bd.account_id = a.id
        LEFT JOIN users u ON be.created_by = u.id
        WHERE be.budget_id = ?
        ORDER BY be.execution_date DESC, be.created_at DESC
      `,
        [budgetId]
      );

      return executions;
    } catch (error) {
      logger.error('获取预算执行记录失败:', error);
      throw error;
    }
  },

  // ==================== 预算预警操作 ====================

  /**
   * 创建预算预警
   * @param {Object} warningData - 预警数据
   * @returns {Promise<number>} 预警ID
   */
  createBudgetWarning: async (warningData) => {
    try {
      const { budget_id, budget_detail_id, warning_type, warning_level, warning_message } =
        warningData;

      const [result] = await db.pool.execute(
        `
        INSERT INTO budget_warnings (
          budget_id, budget_detail_id, warning_type, warning_level, warning_message
        ) VALUES (?, ?, ?, ?, ?)
      `,
        [budget_id, budget_detail_id, warning_type, warning_level, warning_message]
      );

      logger.info('预算预警创建成功', { warningId: result.insertId });
      return result.insertId;
    } catch (error) {
      logger.error('创建预算预警失败:', error);
      throw error;
    }
  },

  /**
   * 获取预算预警列表
   * @param {Object} filters - 筛选条件
   * @returns {Promise<Array>} 预警列表
   */
  getBudgetWarnings: async (filters = {}) => {
    try {
      let query = `
        SELECT
          bw.*,
          b.budget_no,
          b.budget_name
        FROM budget_warnings bw
        LEFT JOIN budgets b ON bw.budget_id = b.id
        WHERE 1=1
      `;

      const params = [];

      if (filters.budget_id) {
        query += ' AND bw.budget_id = ?';
        params.push(filters.budget_id);
      }

      if (filters.is_read !== undefined) {
        query += ' AND bw.is_read = ?';
        params.push(filters.is_read);
      }

      query += ' ORDER BY bw.created_at DESC';

      const [warnings] = await db.pool.execute(query, params);

      return warnings;
    } catch (error) {
      logger.error('获取预算预警列表失败:', error);
      throw error;
    }
  },

  /**
   * 标记预警为已读
   * @param {number} id - 预警ID
   * @returns {Promise<boolean>} 是否成功
   */
  markWarningAsRead: async (id) => {
    try {
      const [result] = await db.pool.execute(
        'UPDATE budget_warnings SET is_read = TRUE WHERE id = ?',
        [id]
      );

      return result.affectedRows > 0;
    } catch (error) {
      logger.error('标记预警为已读失败:', error);
      throw error;
    }
  },
  /**
   * 获取预算执行分析
   * @param {number} budgetId - 预算ID
   * @returns {Promise<Object>} 预算执行分析报告
   */
  getBudgetAnalysis: async (budgetId) => {
    try {
      // 1. 获取预算主表信息
      const [budgets] = await db.pool.query('SELECT * FROM budgets WHERE id = ?', [budgetId]);
      if (budgets.length === 0) {
        throw new Error('预算不存在');
      }
      const budget = budgets[0];

      // 2. 获取预算明细，同时实时计算实际发生额（基于日期范围查询凭证明细表）
      const [details] = await db.pool.query(
        `
        SELECT 
          bd.*,
          a.account_code,
          a.account_name,
          COALESCE(
            (
              SELECT SUM(gei.debit_amount - gei.credit_amount)
              FROM gl_entry_items gei
              JOIN gl_entries ge ON gei.entry_id = ge.id
              WHERE gei.account_id = bd.account_id
              AND ge.entry_date BETWEEN ? AND ?
              AND ge.is_posted = 1
            ), 0
          ) as actual_amount_calc
        FROM budget_details bd
        LEFT JOIN gl_accounts a ON bd.account_id = a.id
        WHERE bd.budget_id = ?
      `,
        [budget.start_date, budget.end_date, budgetId]
      );

      // 3. 处理数据，计算差异和执行率
      const analysisDetails = details.map((item) => {
        // 使用实时计算的实际金额，如果想用缓存的 used_amount 也可以
        const actualAmount = parseFloat(item.actual_amount_calc) || 0;
        const budgetAmount = parseFloat(item.budget_amount) || 0;
        const variance = budgetAmount - actualAmount;
        const executionRate = budgetAmount !== 0 ? (actualAmount / budgetAmount) * 100 : 0;

        return {
          ...item,
          budget_amount: budgetAmount,
          actual_amount: actualAmount,
          variance: variance,
          execution_rate: parseFloat(executionRate.toFixed(2)),
          status: executionRate > 100 ? 'over_budget' : executionRate > 80 ? 'warning' : 'normal',
        };
      });

      // 4. 计算汇总数据
      const summary = analysisDetails.reduce(
        (acc, item) => {
          acc.total_budget += item.budget_amount;
          acc.total_actual += item.actual_amount;
          return acc;
        },
        { total_budget: 0, total_actual: 0 }
      );

      summary.total_variance = summary.total_budget - summary.total_actual;
      summary.total_execution_rate =
        summary.total_budget !== 0 ? (summary.total_actual / summary.total_budget) * 100 : 0;

      return {
        budget,
        details: analysisDetails,
        summary,
      };
    } catch (error) {
      logger.error('获取预算执行分析失败:', error);
      throw error;
    }
  },
};

module.exports = budgetModel;
