/**
 * DLQService.js
 * @description 死信队列处理服务：专门负责捕获及补偿最终失败的异步业务逻辑
 */

const { logger } = require('../../utils/logger');
const db = require('../../config/db');

class DLQService {
  /**
   * 记录最终失败的异步任务
   */
  static async recordFailedJob(taskName, payload, error) {
    let connection;
    try {
      connection = await db.pool.getConnection();
      await connection.query(
        `INSERT INTO sys_failed_jobs (task_name, payload, error_message, error_stack, status) 
         VALUES (?, ?, ?, ?, 'pending')`,
        [
          taskName,
          JSON.stringify(payload),
          error.message || String(error),
          error.stack || '',
        ]
      );
      logger.error(`🚨 [DLQ 告警] 异步任务 "${taskName}" 全局失败并已落库，请系统管理员通过面板进行重放。`);
    } catch (dbError) {
      // 这里的 logger 真的是最后一道防线
      logger.error(`🔥 [DLQ 致命错误] 无法写入死信表以记录失败任务: ${dbError.message}`, {
        originalTask: taskName,
        payload,
      });
    } finally {
      if (connection) {
        connection.release();
      }
    }
  }

  /**
   * 提供给异步包裹器的一个重试执行模板
   */
  static runWithRetry(taskName, payload, taskFn, maxRetries = 3) {
    setImmediate(async () => {
      let retries = maxRetries;
      while (retries > 0) {
        try {
          await taskFn();
          break; // 成功退出
        } catch (err) {
          retries--;
          logger.warn(`⚠️ [异步重试] 任务 "${taskName}" 失败 (剩余试错机会: ${retries}): ${err.message}`);
          if (retries === 0) {
            // 极限超标，扔进死信表
            await this.recordFailedJob(taskName, payload, err);
          } else {
            // 指数级退避等待: 2s, 4s...
            const waitTime = (maxRetries - retries) * 2000;
            await new Promise(resolve => setTimeout(resolve, waitTime));
          }
        }
      }
    });
  }
}

module.exports = DLQService;
