/**
 * 即时通讯常量配置
 * @description 抽取分类、状态等配置为公共常量，便于复用和维护
 */

// 通讯分类
export const COMMUNICATION_CATEGORIES = [
    { value: 'update', label: '更新日志', type: 'primary' },
    { value: 'guide', label: '操作指南', type: 'success' },
    { value: 'specification', label: '技术规范', type: 'warning' },
    { value: 'announcement', label: '公告', type: 'danger' }
]

// 通讯状态
export const COMMUNICATION_STATUS = [
    { value: 'published', label: '已发布', type: 'success' },
    { value: 'draft', label: '草稿', type: 'info' },
    { value: 'archived', label: '已归档', type: 'warning' }
]

// 可见性选项
export const VISIBILITY_OPTIONS = [
    { value: 'public', label: '公开（所有人可见）', icon: 'View' },
    { value: 'private', label: '私有（仅抄送人可见）', icon: 'Lock' }
]

// 常用标签
export const COMMON_TAGS = [
    '系统更新', '功能优化', '问题修复', '新功能', '操作指南', '最佳实践'
]

// 辅助函数
export const getCategoryType = (category) => {
    const found = COMMUNICATION_CATEGORIES.find(c => c.value === category)
    return found?.type || 'info'
}

export const getCategoryLabel = (category) => {
    const found = COMMUNICATION_CATEGORIES.find(c => c.value === category)
    return found?.label || category
}

export const getStatusType = (status) => {
    const found = COMMUNICATION_STATUS.find(s => s.value === status)
    return found?.type || 'info'
}

export const getStatusLabel = (status) => {
    const found = COMMUNICATION_STATUS.find(s => s.value === status)
    return found?.label || status
}
