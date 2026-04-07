// 该文件已被废弃并重写，统一使用 src/config/db.js 提供的唯一连接池
const db = require('../config/db');

module.exports = {
  pool: db.pool,
  query: db.query,
  getConnection: db.getConnection,
  getClient: db.getClient
};
