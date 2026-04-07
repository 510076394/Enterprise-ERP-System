/**
 * 工单管理模型
 */

const { DataTypes } = require('sequelize');
const logger = require('../utils/logger');
const db = require('../config/db');

module.exports = (sequelize) => {
  const WorkOrder = sequelize.define(
    'WorkOrder',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      order_no: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        comment: '工单编号',
      },
      product_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '产品ID',
      },
      plan_quantity: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        comment: '计划数量',
      },
      actual_quantity: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
        comment: '实际数量',
      },
      batch_number: {
        type: DataTypes.STRING(50),
        comment: '批次号',
      },
      workshop_id: {
        type: DataTypes.INTEGER,
        comment: '车间ID',
      },
      status: {
        type: DataTypes.ENUM('planned', 'in_progress', 'completed', 'canceled'),
        defaultValue: 'planned',
        comment: '状态',
      },
      plan_start_date: {
        type: DataTypes.DATE,
        comment: '计划开始日期',
      },
      plan_end_date: {
        type: DataTypes.DATE,
        comment: '计划结束日期',
      },
      actual_start_date: {
        type: DataTypes.DATE,
        comment: '实际开始日期',
      },
      actual_end_date: {
        type: DataTypes.DATE,
        comment: '实际结束日期',
      },
      created_by: {
        type: DataTypes.INTEGER,
        comment: '创建人',
      },
      remarks: {
        type: DataTypes.TEXT,
        comment: '备注',
      },
    },
    {
      tableName: 'work_orders',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  // 关联模型
  WorkOrder.associate = function (models) {
    // 与产品的关联
    if (models.Product) {
      WorkOrder.belongsTo(models.Product, { foreignKey: 'product_id' });
    }

    // 与车间的关联
    if (models.Workshop) {
      WorkOrder.belongsTo(models.Workshop, { foreignKey: 'workshop_id' });
    }

    // 与工单物料的关联
    if (models.WorkOrderMaterial) {
      WorkOrder.hasMany(models.WorkOrderMaterial, { foreignKey: 'work_order_id' });
    }

    // 与工单工序的关联
    if (models.WorkOrderProcess) {
      WorkOrder.hasMany(models.WorkOrderProcess, { foreignKey: 'work_order_id' });
    }
  };

  /**
   * @deprecated 工单相关表结构已迁移至 Knex 迁移文件 20260312000002 管理，此函数保留为空操作
   */
  WorkOrder.createTable = async function () {
    // 表结构由 migrations/20260312000002_baseline_business_tables.js 管理
    logger.info('工单表结构由 Knex 迁移管理，跳过建表');
    return true;
  };

  WorkOrder.findByMaterialAndBatch = async function (materialCode, batchNumber) {
    try {
      const [rows] = await db.query(
        `
        SELECT 
          wo.id, wo.order_no, wo.status,
          wom.material_id, wom.batch_number, wom.plan_quantity, wom.actual_quantity,
          m.code as material_code, m.name as material_name
        FROM 
          work_orders wo
        JOIN 
          work_order_materials wom ON wo.id = wom.work_order_id
        JOIN 
          materials m ON wom.material_id = m.id
        WHERE 
          m.code = ? AND wom.batch_number = ?
        LIMIT 5
      `,
        [materialCode, batchNumber]
      );

      return rows;
    } catch (error) {
      throw error;
    }
  };

  return WorkOrder;
};
