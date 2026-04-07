/**
 * 财务设置控制器
 * 用于管理财务模块的系统配置
 */

const { financeConfig, DEFAULT_FINANCE_CONFIG } = require('../../../config/financeConfig');
const db = require('../../../config/db');
const { logger } = require('../../../utils/logger');

/**
 * 获取财务配置
 */
const getSettings = async (req, res) => {
  try {
    // 从数据库加载最新配置
    await financeConfig.loadFromDatabase(db);
    const config = financeConfig.getAll();

    res.json({
      success: true,
      data: config,
      message: '获取财务配置成功',
    });
  } catch (error) {
    logger.error('获取财务配置失败:', error);
    res.status(500).json({
      success: false,
      message: '获取财务配置失败',
      error: error.message,
    });
  }
};

/**
 * 更新财务配置
 */
const updateSettings = async (req, res) => {
  try {
    const newConfig = req.body;

    // 验证配置
    if (!newConfig || typeof newConfig !== 'object') {
      return res.status(400).json({
        success: false,
        message: '无效的配置数据',
      });
    }

    // 加载现有配置
    await financeConfig.loadFromDatabase(db);

    // 合并配置
    const mergedConfig = financeConfig.deepMerge(financeConfig.getAll(), newConfig);

    // 保存到数据库
    await financeConfig.saveToDatabase(db, mergedConfig);

    // 重新加载配置
    financeConfig.clearCache();
    await financeConfig.loadFromDatabase(db);

    res.json({
      success: true,
      data: financeConfig.getAll(),
      message: '财务配置已更新',
    });
  } catch (error) {
    logger.error('更新财务配置失败:', error);
    res.status(500).json({
      success: false,
      message: '更新财务配置失败',
      error: error.message,
    });
  }
};

/**
 * 获取默认配置
 */
const getDefaultSettings = async (req, res) => {
  try {
    res.json({
      success: true,
      data: DEFAULT_FINANCE_CONFIG,
      message: '获取默认配置成功',
    });
  } catch (error) {
    logger.error('获取默认配置失败:', error);
    res.status(500).json({
      success: false,
      message: '获取默认配置失败',
      error: error.message,
    });
  }
};

/**
 * 重置为默认配置
 */
const resetSettings = async (req, res) => {
  try {
    // 清除数据库中的配置
    await db.pool.execute("DELETE FROM system_settings WHERE `key` = 'finance.config'");

    // 清除缓存
    financeConfig.clearCache();

    res.json({
      success: true,
      data: DEFAULT_FINANCE_CONFIG,
      message: '已重置为默认配置',
    });
  } catch (error) {
    logger.error('重置配置失败:', error);
    res.status(500).json({
      success: false,
      message: '重置配置失败',
      error: error.message,
    });
  }
};

module.exports = {
  getSettings,
  updateSettings,
  getDefaultSettings,
  resetSettings,
};
