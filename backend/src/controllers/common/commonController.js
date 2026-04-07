/**
 * commonController.js
 * @description 通用数据控制器
 * @date 2026-01-23
 * @version 1.0.0
 */

const { ResponseHandler } = require('../../utils/responseHandler');
const { logger } = require('../../utils/logger');
const { pool } = require('../../config/db');

const commonController = {
  /**
   * 获取枚举/字典数据
   * @param {string} type - 枚举类型
   */
  async getEnums(req, res) {
    try {
      const { type } = req.params;
      let data = [];

      switch (type) {
        case 'production_group':
          // 生产组实际上是部门表中的数据
          // 以后可能会根据部门类型过滤，这里暂时返回所有部门或者特定类型的部门
          const [groups] = await pool.query(
            'SELECT id, name, code FROM departments WHERE status = 1'
          );
          data = groups.map((g) => ({
            id: g.id,
            name: g.name,
            code: g.code,
            value: g.id, // 兼容某些前端组件可能用的 value 字段
            label: g.name,
          }));
          break;

        case 'material_category':
          // 这是一个示例，如果有其他硬编码的字典，可以在这里添加
          // 如果 material_category 有专门的表，应该去查表
          // 目前 baseDataApi.getCategories() 已经在前端使用了专门的接口，这里仅作备用
          break;

        default:
          return ResponseHandler.error(res, `未知的枚举类型: ${type}`, 'BAD_REQUEST', 400);
      }

      ResponseHandler.success(res, data, '获取枚举数据成功');
    } catch (error) {
      logger.error(`获取枚举[${req.params.type}]失败:`, error);
      ResponseHandler.error(res, error.message, 'SERVER_ERROR', 500, error);
    }
  },
};

module.exports = commonController;
