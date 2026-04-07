/**
 * 追溯过程模型
 */

const { DataTypes } = require('sequelize');
const logger = require('../utils/logger');

module.exports = (sequelize) => {
  const TraceabilityProcess = sequelize.define(
    'TraceabilityProcess',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      traceability_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '追溯记录ID',
      },
      process_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: '过程名称',
      },
      process_code: {
        type: DataTypes.STRING(50),
        comment: '过程代码',
      },
      operator: {
        type: DataTypes.STRING(50),
        comment: '操作人',
      },
      start_time: {
        type: DataTypes.DATE,
        comment: '开始时间',
      },
      end_time: {
        type: DataTypes.DATE,
        comment: '结束时间',
      },
      duration: {
        type: DataTypes.INTEGER,
        comment: '持续时间(秒)',
      },
      status: {
        type: DataTypes.ENUM('pending', 'in_progress', 'completed', 'failed'),
        defaultValue: 'pending',
        comment: '状态',
      },
      equipment_code: {
        type: DataTypes.STRING(50),
        comment: '设备编码',
      },
      equipment_name: {
        type: DataTypes.STRING(100),
        comment: '设备名称',
      },
      parameters: {
        type: DataTypes.TEXT,
        comment: '过程参数(JSON格式)',
        get() {
          const value = this.getDataValue('parameters');
          return value ? JSON.parse(value) : null;
        },
        set(value) {
          this.setDataValue('parameters', value ? JSON.stringify(value) : null);
        },
      },
      workshop_id: {
        type: DataTypes.INTEGER,
        comment: '车间ID',
      },
      remarks: {
        type: DataTypes.TEXT,
        comment: '备注',
      },
    },
    {
      tableName: 'traceability_process',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  /**
   * @deprecated 追溯过程表结构已迁移至 Knex 迁移文件 20260312000009 管理，此函数保留为空操作
   */
  TraceabilityProcess.createTable = async function () {
    // 表结构由 migrations/20260312000009_baseline_misc_tables.js 管理
    logger.info('追溯过程表结构由 Knex 迁移管理，跳过建表');
    return true;
  };

  /**
   * @deprecated process_code 列已迁移至 Knex 迁移文件 20260312000009 管理
   */
  TraceabilityProcess.addProcessCodeField = async function () {
    // 列由 migrations/20260312000009_baseline_misc_tables.js 管理
    return true;
  };

  TraceabilityProcess.findByTraceabilityId = async function (traceabilityId) {
    return await this.findAll({
      where: { traceability_id: traceabilityId },
      order: [['start_time', 'ASC']],
    });
  };

  return TraceabilityProcess;
};
