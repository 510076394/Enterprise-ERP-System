/**
 * todoParticipant.js
 * @description 待办事项参与者数据模型
 * @date 2025-10-16
 * @version 1.0.0
 */

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const TodoParticipant = sequelize.define(
    'TodoParticipant',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      todoId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'todo_id',
        references: {
          model: 'todos',
          key: 'id',
        },
        comment: '任务ID',
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'user_id',
        references: {
          model: 'users',
          key: 'id',
        },
        comment: '参与者用户ID',
      },
      role: {
        type: DataTypes.ENUM('creator', 'participant'),
        allowNull: false,
        defaultValue: 'participant',
        comment: '角色：creator创建者，participant参与者',
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: 'created_at',
        comment: '添加时间',
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: 'updated_at',
        comment: '更新时间',
      },
    },
    {
      tableName: 'todo_participants',
      timestamps: true,
      underscored: false,
      indexes: [
        {
          name: 'uk_todo_user',
          unique: true,
          fields: ['todo_id', 'user_id'],
        },
        {
          name: 'idx_todo_id',
          fields: ['todo_id'],
        },
        {
          name: 'idx_user_id',
          fields: ['user_id'],
        },
      ],
    }
  );

  TodoParticipant.associate = (models) => {
    // 与待办事项表关联
    if (models.Todo) {
      TodoParticipant.belongsTo(models.Todo, {
        foreignKey: 'todoId',
        as: 'todo',
      });
    }

    // 与用户表关联
    if (models.User) {
      TodoParticipant.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user',
      });
    }
  };

  return TodoParticipant;
};
