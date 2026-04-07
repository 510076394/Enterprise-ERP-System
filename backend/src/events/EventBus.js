/**
 * EventBus.js
 * @description 应用全局事件总线
 * 基于 Node.js EventEmitter，用于解耦业务模块间的依赖调用（如出库后通知财务记账）
 * @date 2025-03-07
 */

const EventEmitter = require('events');
const { logger } = require('../utils/logger');

// 自定义 EventBus 类，扩展默认 EventEmitter 功能
class EventBus extends EventEmitter {
    constructor() {
        super();
        // 增加最大监听器数量限制，防止内存泄漏
        this.setMaxListeners(50);
    }

    // 重写 emit，增加自动日志追踪
    emit(eventName, ...args) {
        logger.debug(`[EventBus] 发送事件: ${eventName}`);
        try {
            return super.emit(eventName, ...args);
        } catch (error) {
            logger.error(`[EventBus] 派发事件 ${eventName} 时发生错误:`, error);
            return false;
        }
    }
}

// 导出单例，确保全系统共用同一个事件中心
const eventBus = new EventBus();

module.exports = eventBus;
