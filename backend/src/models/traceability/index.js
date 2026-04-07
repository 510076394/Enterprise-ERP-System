/**
 * traceability/index.js
 * @description 追溯管理模型统一入口
 * @date 2026-01-23
 * @version 2.0.0 (Refactored)
 */

const Core = require('./Core');
const Query = require('./Query');
const Builder = require('./Builder');
const Handler = require('./Handler');

/**
 * 追溯管理模型
 * 聚合了Core, Query, Builder, Handler的功能，保持向后兼容
 */
class Traceability {
  // ==================== 核心CRUD功能 (Core) ====================

  static getTraceabilityRecords(filters, page, pageSize) {
    return Core.getTraceabilityRecords(filters, page, pageSize);
  }

  static getTraceabilityById(id) {
    return Core.getTraceabilityById(id);
  }

  static createTraceability(data) {
    return Core.createTraceability(data);
  }

  static updateTraceability(id, data) {
    return Core.updateTraceability(id, data);
  }

  static deleteTraceability(id) {
    return Core.deleteTraceability(id);
  }

  static getProcessRecords(traceabilityId) {
    return Core.getProcessRecords(traceabilityId);
  }

  static getMaterialRecords(traceabilityId) {
    return Core.getMaterialRecords(traceabilityId);
  }

  static getQualityRecords(traceabilityId) {
    return Core.getQualityRecords(traceabilityId);
  }

  // ==================== 高级查询功能 (Query) ====================

  static getFullTraceability(type, code, batchNumber) {
    return Query.getFullTraceability(type, code, batchNumber);
  }

  static getForwardTraceability(materialCode, batchNumber) {
    return Query.getForwardTraceability(materialCode, batchNumber);
  }

  static getBackwardTraceability(productCode, batchNumber) {
    return Query.getBackwardTraceability(productCode, batchNumber);
  }

  // ==================== 图谱构建功能 (Builder) ====================

  static _buildTraceabilityNodes(
    type,
    purchaseRecords,
    productionRecords,
    qualityRecords,
    outboundRecords,
    materialsRecords
  ) {
    return Builder.buildNodes(
      type,
      purchaseRecords,
      productionRecords,
      qualityRecords,
      outboundRecords,
      materialsRecords
    );
  }

  static _buildTraceabilityLinks(
    type,
    purchaseRecords,
    productionRecords,
    qualityRecords,
    outboundRecords,
    materialsRecords
  ) {
    return Builder.buildLinks(
      type,
      purchaseRecords,
      productionRecords,
      qualityRecords,
      outboundRecords,
      materialsRecords
    );
  }

  // ==================== 业务处理功能 (Handler) ====================

  static handleAutoTraceability(triggerType, data) {
    return Handler.handleAutoTraceability(triggerType, data);
  }

  // 私有处理方法如果不希望暴露，可以省略，或作为私有辅助方法
  static _handlePurchaseTraceability(data) {
    // 委托给Handler (注意Handler中该方法是内部使用的，这里为了兼容原来可能的调用)
    return Handler._handlePurchaseTraceability(data);
  }

  static _handleProductionTraceability(data) {
    // 委托给Handler
    return Handler._handleProductionTraceability(data);
  }
}

module.exports = Traceability;
