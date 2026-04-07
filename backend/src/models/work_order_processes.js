/**
 * 工单工序模型
 */

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const WorkOrderProcess = sequelize.define(
    'WorkOrderProcess',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      work_order_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '工单ID',
      },
      process_id: {
        type: DataTypes.INTEGER,
        comment: '工艺ID',
      },
      process_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: '工序名称',
      },
      process_code: {
        type: DataTypes.STRING(50),
        comment: '工序代码',
      },
      sequence: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '顺序',
      },
      status: {
        type: DataTypes.ENUM('pending', 'in_progress', 'completed', 'skipped'),
        defaultValue: 'pending',
        comment: '状态',
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
      equipment_id: {
        type: DataTypes.INTEGER,
        comment: '设备ID',
      },
      remarks: {
        type: DataTypes.TEXT,
        comment: '备注',
      },
    },
    {
      tableName: 'work_order_processes',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  // 关联模型
  WorkOrderProcess.associate = function (models) {
    // 与工单的关联
    if (models.WorkOrder) {
      WorkOrderProcess.belongsTo(models.WorkOrder, { foreignKey: 'work_order_id' });
    }

    // 与设备的关联
    if (models.Equipment) {
      WorkOrderProcess.belongsTo(models.Equipment, { foreignKey: 'equipment_id' });
    }
  };

  return WorkOrderProcess;
};
