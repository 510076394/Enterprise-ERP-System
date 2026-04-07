/**
 * 消息框工具函数
 * 提供统一的确认对话框处理，正确处理用户取消操作
 */

import { ElMessageBox, ElMessage } from 'element-plus'

/**
 * 安全的确认对话框
 * 正确处理用户取消操作，不会将取消当作错误
 * 
 * @param {string} message - 确认消息
 * @param {string} title - 对话框标题
 * @param {Object} options - 其他选项
 * @returns {Promise<boolean>} - true表示用户确认，false表示用户取消
 */
export const safeConfirm = async (message, title = '确认操作', options = {}) => {
  const defaultOptions = {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
    ...options
  }

  try {
    await ElMessageBox.confirm(message, title, defaultOptions)
    return true // 用户确认
  } catch (error) {
    // 检查是否是用户取消操作
    if (error === 'cancel' || error.action === 'cancel') {
      return false // 用户取消，这是正常行为
    }
    // 如果是其他错误，重新抛出
    throw error
  }
}

/**
 * 带操作的确认对话框
 * 用户确认后执行指定的操作，取消时不执行任何操作
 * 
 * @param {string} message - 确认消息
 * @param {Function} action - 确认后要执行的操作
 * @param {string} title - 对话框标题
 * @param {Object} options - 其他选项
 * @param {string} successMessage - 操作成功后的提示消息
 * @param {string} errorMessage - 操作失败后的提示消息
 */
export const confirmAndExecute = async (
  message, 
  action, 
  title = '确认操作',
  options = {},
  successMessage = '操作成功',
  errorMessage = '操作失败'
) => {
  try {
    const confirmed = await safeConfirm(message, title, options)
    
    if (confirmed) {
      await action()
      if (successMessage) {
        ElMessage.success(successMessage)
      }
    }
    // 如果用户取消，不执行任何操作，也不显示消息
  } catch (error) {
    console.error('操作执行失败:', error)
    
    // 显示友好的错误消息
    let displayMessage = errorMessage
    if (error.response?.data?.message) {
      displayMessage += `: ${error.response.data.message}`
    } else if (error.message) {
      displayMessage += `: ${error.message}`
    }
    
    ElMessage.error(displayMessage)
  }
}

/**
 * 删除确认对话框
 * 专门用于删除操作的确认对话框
 * 
 * @param {string} itemName - 要删除的项目名称
 * @param {Function} deleteAction - 删除操作函数
 * @param {Object} options - 其他选项
 */
export const confirmDelete = async (itemName, deleteAction, options = {}) => {
  const message = `确定要删除${itemName}吗？此操作不可撤销。`
  const title = '确认删除'
  const successMessage = '删除成功'
  const errorMessage = '删除失败'
  
  await confirmAndExecute(
    message,
    deleteAction,
    title,
    { type: 'warning', ...options },
    successMessage,
    errorMessage
  )
}

/**
 * 状态更新确认对话框
 * 专门用于状态更新操作的确认对话框
 * 
 * @param {string} statusText - 状态文本
 * @param {Function} updateAction - 更新操作函数
 * @param {Object} options - 其他选项
 */
export const confirmStatusUpdate = async (statusText, updateAction, options = {}) => {
  const message = `确定要将状态更改为"${statusText}"吗？`
  const title = '确认操作'
  const successMessage = '状态更新成功'
  const errorMessage = '状态更新失败'
  
  await confirmAndExecute(
    message,
    updateAction,
    title,
    { type: 'warning', ...options },
    successMessage,
    errorMessage
  )
}

/**
 * 检查错误是否为用户取消操作
 * 
 * @param {any} error - 错误对象
 * @returns {boolean} - 是否为用户取消操作
 */
export const isUserCancel = (error) => {
  return error === 'cancel' || error.action === 'cancel'
}

export default {
  safeConfirm,
  confirmAndExecute,
  confirmDelete,
  confirmStatusUpdate,
  isUserCancel
}
