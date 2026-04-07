/**
 * 废除早期的 traceability 系统表结构
 */
exports.up = async function(knex) {
  await knex.raw(`DROP TABLE IF EXISTS traceability_operation_logs;`);
  await knex.raw(`DROP TABLE IF EXISTS traceability_process;`);
  await knex.raw(`DROP TABLE IF EXISTS traceability_material;`);
  await knex.raw(`DROP TABLE IF EXISTS traceability;`);
};

exports.down = async function(knex) {
  // 由于数据难以恢复且业务已过渡到 batch_traceability_relations，
  // 这里的 down 仅做表结构占位创建，不恢复数据
  await knex.raw(`
    CREATE TABLE IF NOT EXISTS traceability (
      id VARCHAR(50) PRIMARY KEY,
      type VARCHAR(50),
      code VARCHAR(100),
      product_id INT,
      batch_number VARCHAR(100),
      status VARCHAR(20),
      created_by INT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      remarks TEXT
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
  
  await knex.raw(`
    CREATE TABLE IF NOT EXISTS traceability_material (
      id INT AUTO_INCREMENT PRIMARY KEY,
      traceability_id VARCHAR(50),
      material_id INT,
      batch_number VARCHAR(100),
      supplier_id INT,
      quantity DECIMAL(10,2),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await knex.raw(`
    CREATE TABLE IF NOT EXISTS traceability_process (
      id INT AUTO_INCREMENT PRIMARY KEY,
      traceability_id VARCHAR(50),
      process_id INT,
      operator_id INT,
      equipment_id INT,
      start_time DATETIME,
      end_time DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await knex.raw(`
    CREATE TABLE IF NOT EXISTS traceability_operation_logs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      traceability_id VARCHAR(50),
      operation VARCHAR(50),
      operator_id INT,
      result VARCHAR(20),
      details TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
};
