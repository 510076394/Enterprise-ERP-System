/**
 * Prometheus 监控中间件
 * @description 自动记录 HTTP 请求指标
 * @date 2025-12-30
 */

const prometheusService = require('../services/monitoring/PrometheusService');

/**
 * Prometheus 监控中间件
 * 记录每个 HTTP 请求的指标
 */
const prometheusMiddleware = (req, res, next) => {
  const startTime = Date.now();

  // 监听响应完成事件
  res.on('finish', () => {
    const duration = (Date.now() - startTime) / 1000; // 转换为秒
    const method = req.method;
    const route = req.route ? req.route.path : req.path;
    const statusCode = res.statusCode;

    // 记录 HTTP 请求指标
    prometheusService.recordHttpRequest(method, route, statusCode, duration);

    // 如果是错误响应，记录错误指标
    if (statusCode >= 400) {
      const errorType = statusCode >= 500 ? 'server_error' : 'client_error';
      const errorCode = statusCode.toString();
      prometheusService.recordError(errorType, errorCode);
    }
  });

  next();
};

module.exports = prometheusMiddleware;
