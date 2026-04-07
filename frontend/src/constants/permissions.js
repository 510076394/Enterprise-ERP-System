/**
 * 权限管理相关常量配置
 */

/**
 * 权限操作延迟时间配置（毫秒）
 */
export const PERMISSION_DELAYS = {
  // 树组件渲染延迟
  TREE_RENDER_DELAY: 200,
  
  // 权限状态应用延迟
  PERMISSION_APPLY_DELAY: 300,
  
  // 节点展开延迟
  NODE_EXPAND_DELAY: 100,
  
  // DOM更新等待时间
  DOM_UPDATE_DELAY: 50,
  
  // 重试间隔
  RETRY_DELAY: 500
};

/**
 * 权限树配置
 */
export const TREE_CONFIG = {
  // 默认展开所有节点
  DEFAULT_EXPAND_ALL: true,
  
  // 严格模式（父子节点不关联）
  CHECK_STRICTLY: true,
  
  // 高亮当前节点
  HIGHLIGHT_CURRENT: true,
  
  // 点击节点不展开
  EXPAND_ON_CLICK_NODE: false,
  
  // 展开后渲染
  RENDER_AFTER_EXPAND: false
};

/**
 * 缓存配置
 */
export const CACHE_CONFIG = {
  // 角色权限缓存过期时间（毫秒）
  ROLE_PERMISSIONS_EXPIRE: 30 * 60 * 1000, // 30分钟
  
  // 菜单数据缓存过期时间（毫秒）
  MENU_CACHE_EXPIRE: 60 * 60 * 1000, // 1小时
  
  // 用户权限缓存过期时间（毫秒）
  USER_PERMISSIONS_EXPIRE: 30 * 60 * 1000, // 30分钟
  
  // 最大重试次数
  MAX_RETRY_COUNT: 3
};

/**
 * API响应状态码
 */
export const API_STATUS = {
  SUCCESS: 200,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  SERVER_ERROR: 500
};

/**
 * 权限类型枚举
 */
export const PERMISSION_TYPES = {
  DIRECTORY: 0,  // 目录
  MENU: 1,       // 菜单
  BUTTON: 2      // 按钮
};

/**
 * 权限状态枚举
 */
export const PERMISSION_STATUS = {
  DISABLED: 0,   // 禁用
  ENABLED: 1     // 启用
};

/**
 * 角色状态枚举
 */
export const ROLE_STATUS = {
  DISABLED: 0,   // 禁用
  ENABLED: 1     // 启用
};

/**
 * 菜单类型标签配置
 */
export const MENU_TYPE_TAGS = {
  [PERMISSION_TYPES.DIRECTORY]: {
    type: 'primary',
    text: '目录'
  },
  [PERMISSION_TYPES.MENU]: {
    type: 'success',
    text: '菜单'
  },
  [PERMISSION_TYPES.BUTTON]: {
    type: 'warning',
    text: '按钮'
  }
};

/**
 * 错误消息配置
 */
export const ERROR_MESSAGES = {
  // 网络错误
  NETWORK_ERROR: '网络连接失败，请检查网络设置',
  
  // 权限错误
  PERMISSION_DENIED: '权限不足，无法执行此操作',
  PERMISSION_LOAD_FAILED: '加载权限数据失败',
  PERMISSION_SAVE_FAILED: '保存权限设置失败',
  
  // 数据错误
  DATA_INVALID: '数据格式不正确',
  DATA_LOAD_FAILED: '数据加载失败',
  DATA_SAVE_FAILED: '数据保存失败',
  
  // 菜单错误
  MENU_LOAD_FAILED: '菜单数据加载失败',
  MENU_TREE_INVALID: '菜单树结构无效',
  
  // 角色错误
  ROLE_NOT_FOUND: '角色不存在',
  ROLE_LOAD_FAILED: '角色数据加载失败',
  
  // 通用错误
  UNKNOWN_ERROR: '未知错误，请稍后重试',
  OPERATION_FAILED: '操作失败，请稍后重试'
};

/**
 * 成功消息配置
 */
export const SUCCESS_MESSAGES = {
  PERMISSION_SAVED: '权限设置保存成功',
  PERMISSION_UPDATED: '权限更新成功',
  ROLE_CREATED: '角色创建成功',
  ROLE_UPDATED: '角色更新成功',
  ROLE_DELETED: '角色删除成功',
  MENU_IMPORTED: '菜单数据导入成功',
  MENU_REFRESHED: '菜单数据刷新成功',
  DATA_LOADED: '数据加载成功'
};

/**
 * 确认消息配置
 */
export const CONFIRM_MESSAGES = {
  DELETE_ROLE: '确认要删除这个角色吗？删除后不可恢复。',
  IMPORT_MENU: '确认要导入完整的菜单数据吗？这将覆盖现有的菜单配置。',
  CLEAR_CACHE: '确认要清除所有缓存数据吗？',
  RESET_PERMISSIONS: '确认要重置权限设置吗？'
};



/**
 * 性能监控配置
 */
export const PERFORMANCE_CONFIG = {
  // 慢操作阈值（毫秒）
  SLOW_OPERATION_THRESHOLD: 1000,
  
  // 内存使用监控间隔（毫秒）
  MEMORY_MONITOR_INTERVAL: 5000,
  
  // 是否启用性能监控
  ENABLE_MONITORING: process.env.NODE_ENV === 'development'
};
