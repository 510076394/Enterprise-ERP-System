/**
 * ScheduledTaskService.js
 * @description 服务层文件
 * @date 2025-08-27
 * @version 1.0.0
 */

const { logger } = require('../../utils/logger');
const cron = require('node-cron');
const DepreciationService = require('./DepreciationService');
const PeriodEndService = require('./PeriodEndService');
const InventoryConsistencyService = require('./InventoryConsistencyService');
const InventoryAlertService = require('./InventoryAlertService');

/**
 * 定时任务调度服务
 * 处理财务相关的定时自动化任务
 */
class ScheduledTaskService {
  static tasks = new Map();

  /**
   * 启动所有定时任务
   */
  static startAllTasks() {
    // 每月1日自动计提折旧
    this.scheduleMonthlyDepreciation();

    // 每月末自动期末结转提醒
    this.schedulePeriodEndReminder();

    // 每天凌晨3点执行库存数据一致性检查
    this.scheduleInventoryConsistencyCheck();

    // 每天上午9点执行库存预警检查并自动生成采购申请
    this.scheduleLowStockAlertCheck();

    // 每周一上午9点执行批次过期预警检查
    this.scheduleBatchExpiryCheck();
  }

  /**
   * 停止所有定时任务
   */
  static stopAllTasks() {
    this.tasks.forEach((task, name) => {
      task.stop();
    });

    this.tasks.clear();
  }

  /**
   * 调度月度折旧计提任务
   * 每月1日凌晨2点执行
   */
  static scheduleMonthlyDepreciation() {
    const task = cron.schedule(
      '0 2 1 * *',
      async () => {
        try {
          const currentDate = new Date();
          const lastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
          const periodMonth = lastMonth.toISOString().slice(0, 7); // YYYY-MM

          const result = await DepreciationService.calculateMonthlyDepreciation(periodMonth);

          // 可以在这里添加通知逻辑，比如发送邮件或系统通知
          await this.sendNotification(
            '月度折旧计提',
            `${periodMonth} 月度折旧计提完成，共计提 ${result.assetCount} 项资产，总金额: ${result.totalDepreciation}`
          );
        } catch (error) {
          logger.error('月度折旧计提任务失败:', error);
          await this.sendErrorNotification('月度折旧计提失败', error.message);
        }
      },
      {
        scheduled: false,
        timezone: 'Asia/Shanghai',
      }
    );

    task.start();
    this.tasks.set('monthlyDepreciation', task);
  }

  /**
   * 调度期末结转提醒任务
   * 每月最后一天晚上8点提醒
   */
  static schedulePeriodEndReminder() {
    const task = cron.schedule(
      '0 20 28-31 * *',
      async () => {
        try {
          const today = new Date();
          const tomorrow = new Date(today);
          tomorrow.setDate(today.getDate() + 1);

          // 检查明天是否是下个月（即今天是月末）
          if (tomorrow.getMonth() !== today.getMonth()) {
            const currentMonth = today.toISOString().slice(0, 7);

            await this.sendNotification(
              '期末结转提醒',
              `${currentMonth} 月即将结束，请及时进行期末结转操作。`
            );
          }
        } catch (error) {
          logger.error('期末结转提醒任务失败:', error);
        }
      },
      {
        scheduled: false,
        timezone: 'Asia/Shanghai',
      }
    );

    task.start();
    this.tasks.set('periodEndReminder', task);
  }

  /**
   * 调度库存数据一致性检查任务
   * 每天凌晨3点执行
   */
  static scheduleInventoryConsistencyCheck() {
    const task = cron.schedule(
      '0 3 * * *',
      async () => {
        try {
          logger.info('开始执行库存数据一致性检查...');

          const report = await InventoryConsistencyService.runFullConsistencyCheck();

          // 如果发现问题，发送通知
          if (report.overallStatus === 'ISSUES_FOUND') {
            const issues = [];

            if (report.negativeStock.count > 0) {
              issues.push(`发现 ${report.negativeStock.count} 个负库存记录`);
            }

            if (report.quantityConsistency.issueCount > 0) {
              issues.push(`发现 ${report.quantityConsistency.issueCount} 条数量不一致的记录`);

              // 自动修复数量不一致问题
              try {
                const fixResult = await InventoryConsistencyService.fixQuantityConsistency();
                issues.push(`已自动修复 ${fixResult.fixedCount} 条数量不一致记录`);
              } catch (fixError) {
                issues.push(`自动修复失败: ${fixError.message}`);
              }
            }

            await this.sendNotification(
              '库存数据一致性检查报告',
              `检查时间: ${report.checkTime}\n问题详情:\n${issues.join('\n')}`
            );
          } else {
            logger.info('库存数据一致性检查完成，未发现问题');
          }
        } catch (error) {
          logger.error('库存数据一致性检查任务失败:', error);
          await this.sendErrorNotification('库存数据一致性检查失败', error.message);
        }
      },
      {
        scheduled: false,
        timezone: 'Asia/Shanghai',
      }
    );

    task.start();
    this.tasks.set('inventoryConsistencyCheck', task);
    logger.info('库存数据一致性检查定时任务已启动 (每天凌晨3点执行)');
  }

  /**
   * 调度低库存预警检查任务
   * 每天上午9点执行，检查低库存并自动生成采购申请
   */
  static scheduleLowStockAlertCheck() {
    const task = cron.schedule(
      '0 9 * * *',
      async () => {
        try {
          logger.info('开始执行低库存预警检查...');

          const result = await InventoryAlertService.checkLowStockAndCreateRequisition({
            autoCreate: true,
            operator: 'system',
          });

          if (result.requisitionCreated) {
            await this.sendNotification(
              '低库存自动采购申请',
              `已自动创建采购申请 ${result.requisitionNo}，包含 ${result.itemCount} 个低库存物料`
            );
          }

          logger.info(`低库存预警检查完成: ${result.message}`);
        } catch (error) {
          logger.error('低库存预警检查任务失败:', error);
          await this.sendErrorNotification('低库存预警检查失败', error.message);
        }
      },
      {
        scheduled: false,
        timezone: 'Asia/Shanghai',
      }
    );

    task.start();
    this.tasks.set('lowStockAlertCheck', task);
    logger.info('低库存预警检查定时任务已启动 (每天上午9点执行)');
  }

  /**
   * 调度批次过期预警检查任务
   * 每周一上午9点执行
   */
  static scheduleBatchExpiryCheck() {
    const task = cron.schedule(
      '0 9 * * 1',
      async () => {
        try {
          logger.info('开始执行批次过期预警检查...');

          const result = await InventoryAlertService.checkBatchExpiry(30); // 提前30天预警

          if (result.expiringCount > 0) {
            await this.sendNotification(
              '批次过期预警',
              `发现 ${result.expired?.length || 0} 个已过期批次, ${result.expiringSoon?.length || 0} 个即将过期批次`
            );
          }

          logger.info(`批次过期预警检查完成: ${result.message}`);
        } catch (error) {
          logger.error('批次过期预警检查任务失败:', error);
          await this.sendErrorNotification('批次过期预警检查失败', error.message);
        }
      },
      {
        scheduled: false,
        timezone: 'Asia/Shanghai',
      }
    );

    task.start();
    this.tasks.set('batchExpiryCheck', task);
    logger.info('批次过期预警检查定时任务已启动 (每周一上午9点执行)');
  }

  /**
   * 手动执行低库存预警检查
   * @param {boolean} autoCreate 是否自动创建采购申请
   * @returns {Promise<Object>} 检查结果
   */
  static async executeLowStockAlertManually(autoCreate = false) {
    try {
      logger.info('手动执行低库存预警检查...');
      const result = await InventoryAlertService.checkLowStockAndCreateRequisition({
        autoCreate,
        operator: 'manual',
      });
      return result;
    } catch (error) {
      logger.error('手动低库存预警检查失败:', error);
      throw error;
    }
  }

  /**
   * 手动执行批次过期预警检查
   * @param {number} daysBeforeExpiry 提前天数
   * @returns {Promise<Object>} 检查结果
   */
  static async executeBatchExpiryManually(daysBeforeExpiry = 30) {
    try {
      logger.info('手动执行批次过期预警检查...');
      const result = await InventoryAlertService.checkBatchExpiry(daysBeforeExpiry);
      return result;
    } catch (error) {
      logger.error('手动批次过期预警检查失败:', error);
      throw error;
    }
  }

  /**
   * 手动执行库存数据一致性检查
   * @returns {Promise<Object>} 检查报告
   */
  static async executeInventoryConsistencyCheckManually() {
    try {
      logger.info('手动执行库存数据一致性检查...');
      const report = await InventoryConsistencyService.runFullConsistencyCheck();
      return report;
    } catch (error) {
      logger.error('手动库存数据一致性检查失败:', error);
      throw error;
    }
  }

  /**
   * 手动执行月度折旧计提
   * @param {string} periodMonth 折旧月份 (YYYY-MM)
   */
  static async executeDepreciationManually(periodMonth) {
    try {
      const result = await DepreciationService.calculateMonthlyDepreciation(periodMonth);

      return result;
    } catch (error) {
      logger.error('手动折旧计提失败:', error);
      throw error;
    }
  }

  /**
   * 手动执行期末结转
   * @param {number} periodId 期间ID
   */
  static async executePeriodEndManually(periodId) {
    try {
      const result = await PeriodEndService.executeAutoClosing(periodId);

      return result;
    } catch (error) {
      logger.error('手动期末结转失败:', error);
      throw error;
    }
  }

  /**
   * 发送通知
   * @param {string} title 通知标题
   * @param {string} message 通知内容
   */
  static async sendNotification(title, message) {
    try {
      // 这里可以集成邮件服务、短信服务或系统内通知

      // 示例：保存到系统通知表
      const db = require('../../config/db');
      await db.pool.execute(
        `INSERT INTO notifications (title, content, type, is_read, created_at) 
         VALUES (?, ?, 'finance_auto', 0, NOW())`,
        [title, message]
      );
    } catch (error) {
      logger.error('发送通知失败:', error);
    }
  }

  /**
   * 发送错误通知
   * @param {string} title 错误标题
   * @param {string} error 错误信息
   */
  static async sendErrorNotification(title, error) {
    try {
      logger.error(`错误通知: ${title} - ${error}`);

      // 示例：保存到系统通知表
      const db = require('../../config/db');
      await db.pool.execute(
        `INSERT INTO notifications (title, content, type, is_read, created_at) 
         VALUES (?, ?, 'finance_error', 0, NOW())`,
        [title, error]
      );
    } catch (err) {
      logger.error('发送错误通知失败:', err);
    }
  }

  /**
   * 获取任务状态
   */
  static getTaskStatus() {
    const status = {};

    this.tasks.forEach((task, name) => {
      status[name] = {
        running: task.running || false,
        scheduled: task.scheduled || false,
        destroyed: task.destroyed || false,
      };
    });

    return status;
  }

  /**
   * 重启特定任务
   * @param {string} taskName 任务名称
   */
  static restartTask(taskName) {
    const task = this.tasks.get(taskName);
    if (task) {
      task.stop();
      task.start();

      return true;
    }

    return false;
  }
}

module.exports = ScheduledTaskService;
