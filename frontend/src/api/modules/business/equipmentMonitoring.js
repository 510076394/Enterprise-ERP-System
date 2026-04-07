/**
 * 设备监控相关API
 */

import request from '@/utils/request'

export const equipmentMonitoringAPI = {
  /**
   * 获取设备列表
   */
  getEquipmentList(params = {}) {
    return request({
      url: '/equipment-monitoring/equipment',
      method: 'get',
      params
    })
  },

  /**
   * 获取设备详细信息
   */
  getEquipmentDetail(id) {
    return request({
      url: `/equipment-monitoring/equipment/${id}`,
      method: 'get'
    })
  },

  /**
   * 获取设备实时数据
   */
  getEquipmentRealTimeData(id, timeRange = '1h') {
    return request({
      url: `/equipment-monitoring/equipment/${id}/realtime-data`,
      method: 'get',
      params: { timeRange }
    })
  },

  /**
   * 获取设备健康状态
   */
  getEquipmentHealth(id) {
    return request({
      url: `/equipment-monitoring/equipment/${id}/health`,
      method: 'get'
    })
  },

  /**
   * 更新设备状态
   */
  updateEquipmentStatus(id, data) {
    return request({
      url: `/equipment-monitoring/equipment/${id}/status`,
      method: 'put',
      data
    })
  },

  /**
   * 记录设备数据
   */
  recordEquipmentData(id, data) {
    return request({
      url: `/equipment-monitoring/equipment/${id}/data`,
      method: 'post',
      data
    })
  },

  /**
   * 批量记录设备数据
   */
  batchRecordEquipmentData(id, dataPoints) {
    return request({
      url: `/equipment-monitoring/equipment/${id}/data/batch`,
      method: 'post',
      data: { dataPoints }
    })
  },

  /**
   * 获取设备报警列表
   */
  getEquipmentAlarms(params = {}) {
    return request({
      url: '/equipment-monitoring/alarms',
      method: 'get',
      params
    })
  },

  /**
   * 确认报警
   */
  acknowledgeAlarm(id, note = '') {
    return request({
      url: `/equipment-monitoring/alarms/${id}/acknowledge`,
      method: 'put',
      data: { note }
    })
  },

  /**
   * 解决报警
   */
  resolveAlarm(id, resolutionNote) {
    return request({
      url: `/equipment-monitoring/alarms/${id}/resolve`,
      method: 'put',
      data: { resolutionNote }
    })
  },

  /**
   * 获取设备统计信息
   */
  getStatistics() {
    return request({
      url: '/equipment-monitoring/statistics',
      method: 'get'
    })
  }
}
