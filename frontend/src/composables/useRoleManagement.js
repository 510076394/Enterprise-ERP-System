/**
 * 角色管理 Composable
 * 封装角色管理的业务逻辑
 * @date 2025-10-17
 */

import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { systemApi } from '@/services/api'
import { usePermissionStore } from '@/stores/permissionStore'

export function useRoleManagement() {
  const permissionStore = usePermissionStore()
  const roleFormRef = ref(null)
  
  // 角色表单
  const roleForm = ref({
    id: null,
    name: '',
    code: '',
    description: '',
    status: 1
  })

  // 表单验证规则
  const roleRules = {
    name: [
      { required: true, message: '请输入角色名称', trigger: 'blur' },
      { min: 2, max: 50, message: '角色名称长度在 2 到 50 个字符', trigger: 'blur' }
    ],
    code: [
      { required: true, message: '请输入角色编码', trigger: 'blur' },
      { min: 2, max: 50, message: '角色编码长度在 2 到 50 个字符', trigger: 'blur' },
      { 
        pattern: /^[A-Z][A-Z0-9_]*$/, 
        message: '角色编码必须以大写字母开头，仅可包含大写字母、数字和下划线', 
        trigger: 'blur' 
      }
    ]
  }

  /**
   * 加载角色列表
   */
  const loadRoles = async () => {
    try {
      permissionStore.setLoading('roleList', true)
      const response = await systemApi.getRoleList()
      if (response.data && Array.isArray(response.data)) {
        permissionStore.setRoleList(response.data)
        ElMessage.success('角色列表加载成功')
      }
    } catch (error) {
      ElMessage.error('加载角色列表失败：' + error.message)
    } finally {
      permissionStore.setLoading('roleList', false)
    }
  }

  /**
   * 显示新增角色对话框
   */
  const showAddRoleDialog = () => {
    resetRoleForm()
    permissionStore.openDialog('roleDialog')
  }

  /**
   * 编辑角色
   */
  const handleEditRole = (row) => {
    Object.assign(roleForm.value, {
      id: row.id,
      name: row.name,
      code: row.code,
      description: row.description || '',
      status: row.status
    })
    permissionStore.openDialog('roleDialog')
  }

  /**
   * 切换角色状态
   */
  const handleToggleRoleStatus = async (row) => {
    try {
      const newStatus = row.status === 1 ? 0 : 1
      const statusText = newStatus === 1 ? '启用' : '禁用'
      
      await ElMessageBox.confirm(
        `确定要${statusText}角色"${row.name}"吗？`,
        '提示',
        { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }
      )

      await systemApi.updateRole(row.id, { status: newStatus })
      row.status = newStatus
      ElMessage.success(`已${statusText}角色`)
      permissionStore.setTreeRenderFlag(!permissionStore.treeRenderFlag)
    } catch (error) {
      if (error !== 'cancel') {
        ElMessage.error('更新角色状态失败：' + error.message)
      }
    }
  }

  /**
   * 保存角色
   */
  const saveRole = async () => {
    try {
      await roleFormRef.value?.validate()
      
      const payload = {
        name: roleForm.value.name,
        code: roleForm.value.code,
        description: roleForm.value.description,
        status: roleForm.value.status
      }

      if (roleForm.value.id) {
        await systemApi.updateRole(roleForm.value.id, payload)
        ElMessage.success('角色更新成功')
      } else {
        await systemApi.createRole(payload)
        ElMessage.success('角色创建成功')
      }

      permissionStore.openDialog('roleDialog', false)
      await loadRoles()
    } catch (error) {
      if (error.message !== '取消') {
        ElMessage.error('保存角色失败：' + error.message)
      }
    }
  }

  /**
   * 删除角色
   */
  const deleteRole = async (id) => {
    try {
      const role = permissionStore.roleList.find(r => r.id === id)
      const roleName = role?.name || '该角色'

      await ElMessageBox.confirm(
        `确定要删除角色"${roleName}"吗？此操作不可撤销。`,
        '删除确认',
        { confirmButtonText: '删除', cancelButtonText: '取消', type: 'error' }
      )

      await systemApi.deleteRole(id)
      ElMessage.success('角色删除成功')
      await loadRoles()
    } catch (error) {
      if (error !== 'cancel') {
        ElMessage.error('删除角色失败：' + error.message)
      }
    }
  }

  /**
   * 重置表单
   */
  const resetRoleForm = () => {
    roleFormRef.value?.clearValidate()
    roleForm.value = {
      id: null,
      name: '',
      code: '',
      description: '',
      status: 1
    }
  }

  return {
    roleFormRef,
    roleForm,
    roleRules,
    loadRoles,
    showAddRoleDialog,
    handleEditRole,
    handleToggleRoleStatus,
    saveRole,
    deleteRole,
    resetRoleForm
  }
}
