/**
 * 角色模型 - 基于数据库的实现
 */

const { pool } = require('../config/db');
const logger = require('../utils/logger');
const DBManager = require('../utils/dbManager');

/**
 * 获取所有角色
 * @returns {Promise<Array>} 角色列表
 */
const getRoles = async () => {
  try {
    const [rows] = await pool.execute('SELECT * FROM roles ORDER BY id ASC');
    return rows;
  } catch (error) {
    logger.error('获取角色列表失败:', error);
    throw error;
  }
};

/**
 * 根据角色ID获取角色信息
 * @param {number} roleId 角色ID
 * @returns {Promise<Object|null>} 角色信息
 */
const getRole = async (roleId) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM roles WHERE id = ?', [roleId]);
    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    logger.error(`获取角色信息失败，角色ID: ${roleId}`, error);
    throw error;
  }
};

/**
 * 创建新角色
 * @param {Object} roleData 角色数据
 * @returns {Promise<Object>} 新创建的角色
 */
const createRole = async (roleData) => {
  try {
    const { name, code, description, status = 1 } = roleData;

    // 检查角色编码是否已存在
    if (code) {
      const [existingRoles] = await pool.execute('SELECT id FROM roles WHERE code = ?', [code]);
      if (existingRoles.length > 0) {
        throw new Error('角色编码已存在');
      }
    }

    const [result] = await pool.execute(
      'INSERT INTO roles (name, code, description, status, created_at) VALUES (?, ?, ?, ?, NOW())',
      [name, code || null, description || '', status]
    );

    // 返回新创建的角色信息
    const newRole = {
      id: result.insertId,
      name,
      code: code || null,
      description: description || '',
      status,
      created_at: new Date(),
    };

    return newRole;
  } catch (error) {
    logger.error('创建角色失败:', error);
    throw error;
  }
};

/**
 * 更新角色信息
 * @param {number} roleId 角色ID
 * @param {Object} roleData 角色数据
 * @returns {Promise<Object|null>} 更新后的角色
 */
const updateRole = async (roleId, roleData) => {
  try {
    const { name, code, description, status } = roleData;

    // 检查角色是否存在
    const [existingRoles] = await pool.execute('SELECT * FROM roles WHERE id = ?', [roleId]);

    if (existingRoles.length === 0) {
      return null;
    }

    // 如果更新编码，检查是否与其他角色冲突
    if (code && code !== existingRoles[0].code) {
      const [codeConflict] = await pool.execute('SELECT id FROM roles WHERE code = ? AND id != ?', [
        code,
        roleId,
      ]);
      if (codeConflict.length > 0) {
        throw new Error('角色编码已存在');
      }
    }

    // 构建更新字段
    const updateFields = [];
    const updateValues = [];

    if (name !== undefined) {
      updateFields.push('name = ?');
      updateValues.push(name);
    }
    if (code !== undefined) {
      updateFields.push('code = ?');
      updateValues.push(code);
    }
    if (description !== undefined) {
      updateFields.push('description = ?');
      updateValues.push(description);
    }
    if (status !== undefined) {
      updateFields.push('status = ?');
      updateValues.push(status);
    }

    if (updateFields.length === 0) {
      return existingRoles[0]; // 没有字段需要更新
    }

    updateFields.push('updated_at = NOW()');
    updateValues.push(roleId);

    await pool.execute(`UPDATE roles SET ${updateFields.join(', ')} WHERE id = ?`, updateValues);

    // 返回更新后的角色信息
    const [updatedRoles] = await pool.execute('SELECT * FROM roles WHERE id = ?', [roleId]);

    return updatedRoles[0];
  } catch (error) {
    logger.error(`更新角色失败，角色ID: ${roleId}`, error);
    throw error;
  }
};

/**
 * 删除角色
 * @param {number} roleId 角色ID
 * @returns {Promise<boolean>} 是否删除成功
 */
const deleteRole = async (roleId) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // 检查角色是否存在
    const [existingRoles] = await connection.execute('SELECT id FROM roles WHERE id = ?', [roleId]);

    if (existingRoles.length === 0) {
      await connection.rollback();
      return false;
    }

    // 检查是否有用户使用此角色
    const [userRoles] = await connection.execute(
      'SELECT COUNT(*) as count FROM user_roles WHERE role_id = ?',
      [roleId]
    );

    if (userRoles[0].count > 0) {
      await connection.rollback();
      throw new Error('无法删除角色：仍有用户使用此角色');
    }

    // 删除角色菜单关联
    await connection.execute('DELETE FROM role_menus WHERE role_id = ?', [roleId]);

    // 删除角色
    const [result] = await connection.execute('DELETE FROM roles WHERE id = ?', [roleId]);

    await connection.commit();
    return result.affectedRows > 0;
  } catch (error) {
    await connection.rollback();
    logger.error(`删除角色失败，角色ID: ${roleId}`, error);
    throw error;
  } finally {
    connection.release();
  }
};

/**
 * 获取角色的菜单权限
 * @param {number} roleId 角色ID
 * @returns {Promise<Array>} 菜单ID列表
 */
const getRoleMenus = async (roleId) => {
  try {
    const [rows] = await pool.execute(
      'SELECT menu_id FROM role_menus WHERE role_id = ? ORDER BY menu_id',
      [roleId]
    );
    return rows.map((row) => row.menu_id);
  } catch (error) {
    logger.error(`获取角色菜单失败，角色ID: ${roleId}`, error);
    throw error;
  }
};

/**
 * 分配角色菜单/权限
 * ✅ 已集成事务处理
 * @param {number} roleId - 角色ID
 * @param {Array} menuIds - 菜单ID数组
 * @returns {Promise<boolean>} 是否成功
 */
const setRoleMenus = async (roleId, menuIds = []) => {
  try {
    // ✅ 使用事务处理确保数据一致性
    const result = await DBManager.executeTransaction(async (connection) => {
      // 步骤1: 先删除该角色的所有菜单关联
      const [deleteResult] = await connection.execute('DELETE FROM role_menus WHERE role_id = ?', [
        roleId,
      ]);
      logger.info(`[事务] 删除角色 ${roleId} 的菜单关联: ${deleteResult.affectedRows} 行`);

      // 步骤2: 如果有新的菜单ID，则插入新关联
      if (menuIds.length > 0) {
        const values = menuIds.map(() => '(?, ?)').join(',');
        const params = [];

        for (const menuId of menuIds) {
          params.push(roleId, menuId);
        }

        const [insertResult] = await connection.execute(
          `INSERT INTO role_menus (role_id, menu_id) VALUES ${values}`,
          params
        );
        logger.info(`[事务] 为角色 ${roleId} 添加菜单关联: ${insertResult.affectedRows} 行`);
      }

      return true;
    });

    logger.info(`[事务成功] 角色 ${roleId} 的菜单关联更新完成`);

    // ✅ 修复: 不在这里清除缓存,由调用方(system.js)统一清除
    // 避免重复清除导致日志误导

    return result;
  } catch (error) {
    logger.error('[事务失败] 设置角色菜单失败:', error);
    throw error;
  }
};

module.exports = {
  getRoles,
  getRole,
  createRole,
  updateRole,
  deleteRole,
  getRoleMenus,
  setRoleMenus,
};
