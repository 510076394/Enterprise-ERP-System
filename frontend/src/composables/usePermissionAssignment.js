/**
 * 权限分配 Composable
 * 封装权限分配的业务逻辑
 * @date 2025-10-17
 */

import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { systemApi } from '@/services/api'
import { usePermissionStore } from '@/stores/permissionStore'

export function usePermissionAssignment() {
  const permissionStore = usePermissionStore()
  const treeRef = ref(null)

  // 树形数据
  const treeData = ref([])
  const defaultCheckedKeys = ref([])
  const loading = ref(false)

  // 树形配置
  const treeProps = {
    children: 'children',
    label: 'name'
  }

  /**
   * 获取角色权限树
   */
  const loadRolePermissions = async (roleId) => {
    if (!roleId) {
      return
    }

    try {
      loading.value = true

      // 获取菜单树
      const menuResponse = await systemApi.getMenuList()
      if (menuResponse.data) {
        treeData.value = buildMenuTree(menuResponse.data)
      }

      // 获取角色已分配的权限
      const permResponse = await systemApi.getRolePermissions(roleId)
      if (permResponse.data) {
        defaultCheckedKeys.value = Array.isArray(permResponse.data) 
          ? permResponse.data 
          : []
      }

      // 确保树已渲染后再设置选中项
      setTimeout(() => {
        if (treeRef.value) {
          treeRef.value.setCheckedKeys(defaultCheckedKeys.value)
        }
      }, 100)

      ElMessage.success('权限加载成功')
    } catch (error) {
      ElMessage.error('加载权限失败：' + error.message)
    } finally {
      loading.value = false
    }
  }

  /**
   * 构建菜单树
   */
  const buildMenuTree = (menus) => {
    const menuMap = {}
    const roots = []

    // 创建映射
    menus.forEach(menu => {
      menuMap[menu.id] = {
        ...menu,
        children: []
      }
    })

    // 构建树
    menus.forEach(menu => {
      const node = menuMap[menu.id]
      if (menu.parent_id === null || menu.parent_id === 0) {
        roots.push(node)
      } else if (menuMap[menu.parent_id]) {
        menuMap[menu.parent_id].children.push(node)
      }
    })

    return roots
  }

  /**
   * 保存权限分配
   */
  const savePermissions = async (roleId) => {
    if (!roleId) {
      ElMessage.error('请先选择角色')
      return
    }

    try {
      const checkedKeys = treeRef.value?.getCheckedKeys() || []
      
      await ElMessageBox.confirm(
        `确定要分配 ${checkedKeys.length} 个权限吗？`,
        '确认分配',
        { confirmButtonText: '确定', cancelButtonText: '取消', type: 'info' }
      )

      loading.value = true
      await systemApi.setRolePermissions(roleId, checkedKeys)
      
      // 更新本地状态
      defaultCheckedKeys.value = checkedKeys
      
      ElMessage.success('权限分配成功')
      permissionStore.setTreeRenderFlag(!permissionStore.treeRenderFlag)
    } catch (error) {
      if (error !== 'cancel') {
        ElMessage.error('权限分配失败：' + error.message)
      }
    } finally {
      loading.value = false
    }
  }

  /**
   * 全选
   */
  const selectAll = () => {
    const allNodeIds = []
    const traverse = (nodes) => {
      nodes.forEach(node => {
        allNodeIds.push(node.id)
        if (node.children?.length) {
          traverse(node.children)
        }
      })
    }
    traverse(treeData.value)
    
    if (treeRef.value) {
      treeRef.value.setCheckedKeys(allNodeIds)
    }
  }

  /**
   * 取消全选
   */
  const clearSelection = () => {
    if (treeRef.value) {
      treeRef.value.setCheckedKeys([])
    }
  }

  /**
   * 反选
   */
  const reverseSelection = () => {
    const currentCheckedKeys = treeRef.value?.getCheckedKeys() || []
    const allNodeIds = []
    
    const traverse = (nodes) => {
      nodes.forEach(node => {
        allNodeIds.push(node.id)
        if (node.children?.length) {
          traverse(node.children)
        }
      })
    }
    traverse(treeData.value)

    const reverseKeys = allNodeIds.filter(id => !currentCheckedKeys.includes(id))
    
    if (treeRef.value) {
      treeRef.value.setCheckedKeys(reverseKeys)
    }
  }

  /**
   * 已选权限数
   */
  const selectedCount = computed(() => {
    return treeRef.value?.getCheckedKeys().length || 0
  })

  /**
   * 总权限数
   */
  const totalCount = computed(() => {
    let count = 0
    const traverse = (nodes) => {
      nodes.forEach(node => {
        count++
        if (node.children?.length) {
          traverse(node.children)
        }
      })
    }
    traverse(treeData.value)
    return count
  })

  return {
    treeRef,
    treeData,
    defaultCheckedKeys,
    loading,
    treeProps,
    loadRolePermissions,
    savePermissions,
    selectAll,
    clearSelection,
    reverseSelection,
    selectedCount,
    totalCount
  }
}
