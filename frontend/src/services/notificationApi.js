/**
 * 通知API服务
 */

import { api } from './api';

export default {
  /**
   * 获取通知列表
   */
  getNotifications(params) {
    return api.get('/api/notifications', { params });
  },

  /**
   * 获取未读通知数量
   */
  getUnreadCount() {
    return api.get('/api/notifications/unread-count');
  },

  /**
   * 标记通知为已读
   */
  markAsRead(id) {
    return api.put(`/api/notifications/${id}/read`);
  },

  /**
   * 批量标记为已读
   */
  markAllAsRead(ids = []) {
    return api.put('/api/notifications/mark-all-read', { ids });
  },

  /**
   * 删除通知
   */
  deleteNotification(id) {
    return api.delete(`/api/notifications/${id}`);
  },

  /**
   * 创建通知
   */
  createNotification(data) {
    return api.post('/api/notifications', data);
  },

  /**
   * 批量创建通知
   */
  createBatchNotifications(notifications) {
    return api.post('/api/notifications/batch', { notifications });
  }
};

