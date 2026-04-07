/**
 * 基线迁移 - 审批工作流表
 * @description 审批规则、审批流程、审批步骤
 */

exports.up = async function(knex) {
  // 审批规则表
  await knex.raw(`
    CREATE TABLE IF NOT EXISTS approval_rules (
      id INT AUTO_INCREMENT PRIMARY KEY,
      approval_type VARCHAR(50) NOT NULL,
      step_order INT NOT NULL,
      approver_id INT,
      approver_name VARCHAR(100),
      approver_role VARCHAR(50) NOT NULL,
      min_amount DECIMAL(15,2) DEFAULT 0,
      max_amount DECIMAL(15,2),
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX (approval_type),
      INDEX (approver_id)
    )
  `);

  // 审批流程表
  await knex.raw(`
    CREATE TABLE IF NOT EXISTS approval_flows (
      id INT AUTO_INCREMENT PRIMARY KEY,
      approval_type VARCHAR(50) NOT NULL,
      business_id INT NOT NULL,
      business_number VARCHAR(100),
      amount DECIMAL(15,2),
      description TEXT,
      submitter_id INT NOT NULL,
      submitter_name VARCHAR(100),
      status ENUM('pending', 'approved', 'rejected', 'cancelled') DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX (approval_type),
      INDEX (submitter_id),
      INDEX (status)
    )
  `);

  // 审批步骤表
  await knex.raw(`
    CREATE TABLE IF NOT EXISTS approval_steps (
      id INT AUTO_INCREMENT PRIMARY KEY,
      flow_id INT NOT NULL,
      step_order INT NOT NULL,
      approver_id INT NOT NULL,
      approver_name VARCHAR(100),
      approver_role VARCHAR(50),
      status ENUM('pending', 'approved', 'rejected', 'cancelled') DEFAULT 'pending',
      approved_at TIMESTAMP NULL,
      comments TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (flow_id) REFERENCES approval_flows(id) ON DELETE CASCADE,
      INDEX (flow_id),
      INDEX (approver_id),
      INDEX (status)
    )
  `);
};

exports.down = async function(knex) {
  const tables = ['approval_steps', 'approval_flows', 'approval_rules'];
  for (const table of tables) {
    await knex.raw(`DROP TABLE IF EXISTS \`${table}\``);
  }
};
