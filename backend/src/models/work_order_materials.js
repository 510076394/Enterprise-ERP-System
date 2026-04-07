/**
 * 工单物料模型
 */

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const WorkOrderMaterial = sequelize.define(
    'WorkOrderMaterial',
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
      material_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '物料ID',
      },
      batch_number: {
        type: DataTypes.STRING(50),
        comment: '批次号',
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
      unit: {
        type: DataTypes.STRING(20),
        comment: '单位',
      },
      status: {
        type: DataTypes.ENUM('pending', 'issued', 'returned'),
        defaultValue: 'pending',
        comment: '状态',
      },
    },
    {
      tableName: 'work_order_materials',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  // 关联模型
  WorkOrderMaterial.associate = function (models) {
    // 与工单的关联
    if (models.WorkOrder) {
      WorkOrderMaterial.belongsTo(models.WorkOrder, { foreignKey: 'work_order_id' });
    }

    // 与物料的关联
    if (models.Material) {
      WorkOrderMaterial.belongsTo(models.Material, { foreignKey: 'material_id' });
    }
  };

  return WorkOrderMaterial;
};
