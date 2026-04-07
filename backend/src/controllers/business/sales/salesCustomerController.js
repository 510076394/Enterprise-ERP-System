/**
 * salesCustomerController.js
 * @description 销售模块 - 客户相关控制器
 * @date 2026-01-07
 * @version 1.0.0
 */

const { ResponseHandler } = require('../../../utils/responseHandler');
const { logger } = require('../../../utils/logger');
const db = require('../../../config/db');
const SalesDao = require('../../../database/salesDao');
const customerService = require('../../../services/customerService');
const materialService = require('../../../services/materialService');

/**
 * 获取客户列表（简化版，不分页）
 */
exports.getCustomersList = async (req, res) => {
  try {
    // 获取所有客户，不分页
    const result = await customerService.getAllCustomers(1, 1000);

    // 返回客户列表，直接返回items数组
    res.json(result.items || []);
  } catch (error) {
    logger.error('Error getting customers list:', error);
    ResponseHandler.error(res, 'Error getting customers list', 'SERVER_ERROR', 500, error);
  }
};

/**
 * 获取产品列表
 */
exports.getProductsList = async (req, res) => {
  try {
    // 不使用type过滤，获取所有物料
    const products = await materialService.getAllMaterials(1, 1000);

    // materialService.getAllMaterials 返回 { data, pagination }
    const items = products?.data || products?.list || products?.items || [];
    res.json(items);
  } catch (error) {
    logger.error('Error getting products list:', error);
    ResponseHandler.error(res, 'Error getting products list', 'SERVER_ERROR', 500, error);
  }
};

/**
 * 获取客户列表（带搜索分页）
 */
exports.getCustomers = async (req, res) => {
  try {
    const { keyword, limit = 50 } = req.query;

    let query =
      'SELECT id, name, code, contact_person, contact_phone, address FROM customers WHERE 1=1';
    const params = [];

    // 如果有搜索关键词，添加搜索条件
    if (keyword && keyword.trim()) {
      query += ' AND (name LIKE ? OR code LIKE ?)';
      const searchTerm = `%${keyword.trim()}%`;
      params.push(searchTerm, searchTerm);
    }

    query += ' ORDER BY name ASC';

    // 添加限制条数
    if (limit) {
      query += ' LIMIT ?';
      params.push(parseInt(limit));
    }

    const { getConnection } = require('../../../config/db');
    const connection = await getConnection();

    try {
      const [customers] = await connection.query(query, params);

      // 格式化返回数据
      const formattedCustomers = customers.map((customer) => ({
        id: customer.id,
        name: customer.name,
        code: customer.code,
        contact_person: customer.contact_person,
        contact: customer.contact_person, // 兼容字段
        contact_phone: customer.contact_phone,
        phone: customer.contact_phone, // 兼容字段
        delivery_address: customer.delivery_address,
        address: customer.delivery_address, // 兼容字段
      }));

      ResponseHandler.success(res, formattedCustomers, '操作成功');
    } finally {
      connection.release();
    }
  } catch (error) {
    logger.error('Error getting customers:', error);
    ResponseHandler.error(res, 'Error getting customers', 'SERVER_ERROR', 500, error);
  }
};

/**
 * 获取单个客户详情
 */
exports.getCustomer = async (req, res) => {
  try {
    const customerId = req.params.id;

    const { getConnection } = require('../../../config/db');
    const connection = await getConnection();

    try {
      const [customers] = await connection.query(
        'SELECT id, name, code, contact_person, contact_phone, delivery_address FROM customers WHERE id = ?',
        [customerId]
      );

      if (customers.length === 0) {
        return ResponseHandler.error(res, 'Customer not found', 'NOT_FOUND', 404);
      }

      const customer = customers[0];

      // 格式化返回数据
      const formattedCustomer = {
        id: customer.id,
        name: customer.name,
        code: customer.code,
        contact_person: customer.contact_person,
        contact: customer.contact_person, // 兼容字段
        contact_phone: customer.contact_phone,
        phone: customer.contact_phone, // 兼容字段
        delivery_address: customer.delivery_address,
        address: customer.delivery_address, // 兼容字段
      };

      ResponseHandler.success(res, formattedCustomer, '操作成功');
    } finally {
      connection.release();
    }
  } catch (error) {
    logger.error('Error getting customer:', error);
    ResponseHandler.error(res, 'Error getting customer', 'SERVER_ERROR', 500, error);
  }
};

/**
 * 创建客户
 */
exports.createCustomer = async (req, res) => {
  try {
    const customer = await SalesDao.createCustomer(req.body);
    ResponseHandler.success(res, customer, '创建成功', 201);
  } catch (error) {
    logger.error('Error creating customer:', error);
    ResponseHandler.error(res, 'Error creating customer', 'SERVER_ERROR', 500, error);
  }
};

/**
 * 更新客户
 */
exports.updateCustomer = async (req, res) => {
  try {
    const customer = await SalesDao.updateCustomer(req.params.id, req.body);
    res.json(customer);
  } catch (error) {
    logger.error('Error updating customer:', error);
    ResponseHandler.error(res, 'Error updating customer', 'SERVER_ERROR', 500, error);
  }
};
