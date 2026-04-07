/**
 * 菜单管理 Composable
 * 封装菜单管理的业务逻辑
 * @date 2025-10-17
 */

import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { systemApi } from '@/services/api'
import { usePermissionStore } from '@/stores/permissionStore'

export function useMenuManagement() {
  const permissionStore = usePermissionStore()
  const menuFormRef = ref(null)

  // 菜单表单
  const menuForm = ref({
    id: null,
    name: '',
    path: '',
    component: '',
    permission: '',
    type: 1,
    status: 1,
    icon: '',
    parent_id: null,
    sort_order: 0
  })

  // 表单验证规则
  const menuRules = {
    name: [
      { required: true, message: '请输入菜单名称', trigger: 'blur' },
      { min: 1, max: 50, message: '菜单名称长度在 1 到 50 个字符', trigger: 'blur' }
    ],
    path: [
      { min: 0, max: 100, message: '菜单路径长度不能超过 100 个字符', trigger: 'blur' }
    ],
    permission: [
      { min: 0, max: 100, message: '权限编码长度不能超过 100 个字符', trigger: 'blur' }
    ]
  }

  /**
   * 加载菜单列表
   */
  const loadMenus = async () => {
    try {
      permissionStore.setLoading('menuList', true)
      const response = await systemApi.getMenuList()
      if (response.data && Array.isArray(response.data)) {
        permissionStore.setMenuList(response.data)
        ElMessage.success('菜单列表加载成功')
      }
    } catch (error) {
      ElMessage.error('加载菜单列表失败：' + error.message)
    } finally {
      permissionStore.setLoading('menuList', false)
    }
  }

  /**
   * 显示新增菜单对话框
   */
  const showAddMenuDialog = (parentId = null) => {
    resetMenuForm()
    menuForm.value.parent_id = parentId
    permissionStore.openDialog('menuDialog')
  }

  /**
   * 编辑菜单
   */
  const handleEditMenu = (row) => {
    Object.assign(menuForm.value, {
      id: row.id,
      name: row.name,
      path: row.path || '',
      component: row.component || '',
      permission: row.permission || '',
      type: row.type || 1,
      status: row.status || 1,
      icon: row.icon || '',
      parent_id: row.parent_id || null,
      sort_order: row.sort_order || 0
    })
    permissionStore.openDialog('menuDialog')
  }

  /**
   * 切换菜单状态
   */
  const handleToggleMenuStatus = async (row) => {
    try {
      const newStatus = row.status === 1 ? 0 : 1
      const statusText = newStatus === 1 ? '启用' : '禁用'

      await ElMessageBox.confirm(
        `确定要${statusText}菜单"${row.name}"吗？`,
        '提示',
        { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }
      )

      await systemApi.updateMenu(row.id, { status: newStatus })
      row.status = newStatus
      ElMessage.success(`已${statusText}菜单`)
    } catch (error) {
      if (error !== 'cancel') {
        ElMessage.error('更新菜单状态失败：' + error.message)
      }
    }
  }

  /**
   * 保存菜单
   */
  const saveMenu = async () => {
    try {
      await menuFormRef.value?.validate()

      const payload = {
        name: menuForm.value.name,
        path: menuForm.value.path,
        component: menuForm.value.component,
        permission: menuForm.value.permission,
        type: menuForm.value.type,
        status: menuForm.value.status,
        icon: menuForm.value.icon,
        parent_id: menuForm.value.parent_id,
        sort_order: menuForm.value.sort_order
      }

      if (menuForm.value.id) {
        await systemApi.updateMenu(menuForm.value.id, payload)
        ElMessage.success('菜单更新成功')
      } else {
        await systemApi.createMenu(payload)
        ElMessage.success('菜单创建成功')
      }

      permissionStore.openDialog('menuDialog', false)
      await loadMenus()
    } catch (error) {
      if (error.message !== '取消') {
        ElMessage.error('保存菜单失败：' + error.message)
      }
    }
  }

  /**
   * 删除菜单
   */
  const deleteMenu = async (id) => {
    try {
      const menu = permissionStore.menuList.find(m => m.id === id)
      const menuName = menu?.name || '该菜单'

      await ElMessageBox.confirm(
        `确定要删除菜单"${menuName}"吗？此操作不可撤销。`,
        '删除确认',
        { confirmButtonText: '删除', cancelButtonText: '取消', type: 'error' }
      )

      await systemApi.deleteMenu(id)
      ElMessage.success('菜单删除成功')
      await loadMenus()
    } catch (error) {
      if (error !== 'cancel') {
        ElMessage.error('删除菜单失败：' + error.message)
      }
    }
  }

  /**
   * 重置表单
   */
  const resetMenuForm = () => {
    menuFormRef.value?.clearValidate()
    menuForm.value = {
      id: null,
      name: '',
      path: '',
      component: '',
      permission: '',
      type: 1,
      status: 1,
      icon: '',
      parent_id: null,
      sort_order: 0
    }
  }

  return {
    menuFormRef,
    menuForm,
    menuRules,
    loadMenus,
    showAddMenuDialog,
    handleEditMenu,
    handleToggleMenuStatus,
    saveMenu,
    deleteMenu,
    resetMenuForm
  }
}
