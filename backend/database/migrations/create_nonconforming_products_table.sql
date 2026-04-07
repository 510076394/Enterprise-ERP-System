CREATE TABLE IF NOT EXISTS nonconforming_products (
  id INT PRIMARY KEY AUTO_INCREMENT,
  ncp_no VARCHAR(50) UNIQUE NOT NULL,

  inspection_id INT,
  inspection_no VARCHAR(50),
  material_id INT,
  material_code VARCHAR(50),
  material_name VARCHAR(200),
  batch_no VARCHAR(100),

  quantity DECIMAL(10,2) NOT NULL,
  unit VARCHAR(20),

  defect_type VARCHAR(100),
  defect_description TEXT,
  severity ENUM('minor', 'major', 'critical') DEFAULT 'minor',

  supplier_id INT,
  supplier_name VARCHAR(200),

  disposition ENUM('return', 'rework', 'scrap', 'use_as_is', 'pending') DEFAULT 'pending',
  disposition_reason TEXT,
  disposition_by VARCHAR(50),
  disposition_date DATETIME,

  handled_quantity DECIMAL(10,2) DEFAULT 0,
  handling_cost DECIMAL(10,2) DEFAULT 0,
  status ENUM('pending', 'processing', 'completed', 'closed') DEFAULT 'pending',

  current_location VARCHAR(100),
  isolation_area VARCHAR(100),

  responsible_party ENUM('supplier', 'internal', 'unknown') DEFAULT 'unknown',
  responsible_person VARCHAR(50),

  attachments JSON,
  note TEXT,

  created_by VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_by VARCHAR(50),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (inspection_id) REFERENCES quality_inspections(id) ON DELETE SET NULL,
  FOREIGN KEY (material_id) REFERENCES materials(id) ON DELETE SET NULL,
  FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL,

  INDEX idx_ncp_no (ncp_no),
  INDEX idx_inspection_id (inspection_id),
  INDEX idx_material_id (material_id),
  INDEX idx_status (status),
  INDEX idx_disposition (disposition),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS nonconforming_product_actions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  ncp_id INT NOT NULL,
  action_type ENUM('create', 'isolate', 'evaluate', 'dispose', 'close') NOT NULL,
  action_description TEXT,
  action_by VARCHAR(50),
  action_date DATETIME DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (ncp_id) REFERENCES nonconforming_products(id) ON DELETE CASCADE,
  INDEX idx_ncp_id (ncp_id),
  INDEX idx_action_date (action_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

