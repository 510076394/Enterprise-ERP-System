/**
 * AuditLogService.js
 * @description 记录系统所有高风险修改动作的“操作黑匣子”。凡走过必留痕。
 */

const db = require('../../config/db');
const { logger } = require('../../utils/logger');

class AuditLogService {
  /**
   * 记录审计日志
   * @param {Object} params
   * @param {string} params.operator_id - 操作员ID
   * @param {string} params.operator_name - 操作员名称
   * @param {string} params.action - 操作类型 (CREATE/UPDATE/DELETE/APPROVE)
   * @param {string} params.module - 模块 (sales_order, purchase_order 等)
   * @param {string} params.target_table - 修改的底层表名
   * @param {string} params.target_id - 修改的主键ID
   * @param {string} params.target_no - 业务编号
   * @param {Object} params.old_payload - 原本的数据JSON
   * @param {Object} params.new_payload - 新修改的数据JSON
   * @param {string} params.ip_address - 操作IP
   * @param {string} params.user_agent - 终端浏览器信息
   * @param {string} params.remarks - 重要说明
   */
  static async log(params, connection = null) {
    try {
      const conn = connection || (await db.pool.getConnection());
      try {
        await conn.execute(
          `INSERT INTO sys_audit_logs (
            operator_id, operator_name, action, module, target_table, 
            target_id, target_no, old_payload, new_payload, 
            ip_address, user_agent, remarks, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
          [
            params.operator_id || 'SYSTEM',
            params.operator_name || 'System Auto',
            params.action || 'UNKNOWN',
            params.module || 'UNKNOWN',
            params.target_table || 'UNKNOWN',
            String(params.target_id || ''),
            params.target_no || '',
            params.old_payload ? JSON.stringify(params.old_payload) : null,
            params.new_payload ? JSON.stringify(params.new_payload) : null,
            params.ip_address || '',
            params.user_agent || '',
            params.remarks || ''
          ]
        );
      } finally {
        if (!connection) conn.release();
      }
    } catch (err) {
      // 审计日志报错绝不能阻断业务流程！记录最底层日志告警。
      logger.error('💥 [审计日志埋点失败] AuditLogService.log 严重异常:', err);
    }
  }
}

module.exports = AuditLogService;
