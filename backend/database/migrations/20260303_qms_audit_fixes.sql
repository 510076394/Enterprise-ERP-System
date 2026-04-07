-- ============================================================
-- QMS 审计修复 — 综合迁移脚本
-- 日期: 2026-03-03
-- 内容:
--   Fix 2: quality_inspection_measurements 子表
--   Fix 3: 量具台账 + 校准记录
--   Fix 4: SPC 控制图数据
--   Fix 5: 供应商质量计分卡
-- ============================================================

-- =========================================
-- Fix 2: 检验测量数据动态子表
-- 替代 quality_inspection_items 中 measure_1~measure_6
-- =========================================
CREATE TABLE IF NOT EXISTS quality_inspection_measurements (
  id            INT AUTO_INCREMENT PRIMARY KEY COMMENT '主键',
  item_id       INT NOT NULL                  COMMENT '关联检验项目 ID (quality_inspection_items.id)',
  sample_no     SMALLINT NOT NULL DEFAULT 1   COMMENT '样本序号 (1,2,3...N)',
  measured_value DECIMAL(15,6) DEFAULT NULL   COMMENT '实测值',
  is_qualified  TINYINT(1) DEFAULT NULL       COMMENT '是否合格 (1=合格, 0=不合格, NULL=未判定)',
  measured_at   DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '测量时间',
  measured_by   VARCHAR(50) DEFAULT NULL       COMMENT '测量人',
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_item_id (item_id),
  INDEX idx_sample_no (item_id, sample_no),
  CONSTRAINT fk_measurement_item FOREIGN KEY (item_id)
    REFERENCES quality_inspection_items(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='检验测量数据子表 — 每条对应一个样本的单次测量';

-- 迁移历史数据：将 measure_1~measure_6 拆入新表
INSERT IGNORE INTO quality_inspection_measurements (item_id, sample_no, measured_value)
SELECT id, 1, measure_1 FROM quality_inspection_items WHERE measure_1 IS NOT NULL;
INSERT IGNORE INTO quality_inspection_measurements (item_id, sample_no, measured_value)
SELECT id, 2, measure_2 FROM quality_inspection_items WHERE measure_2 IS NOT NULL;
INSERT IGNORE INTO quality_inspection_measurements (item_id, sample_no, measured_value)
SELECT id, 3, measure_3 FROM quality_inspection_items WHERE measure_3 IS NOT NULL;
INSERT IGNORE INTO quality_inspection_measurements (item_id, sample_no, measured_value)
SELECT id, 4, measure_4 FROM quality_inspection_items WHERE measure_4 IS NOT NULL;
INSERT IGNORE INTO quality_inspection_measurements (item_id, sample_no, measured_value)
SELECT id, 5, measure_5 FROM quality_inspection_items WHERE measure_5 IS NOT NULL;
INSERT IGNORE INTO quality_inspection_measurements (item_id, sample_no, measured_value)
SELECT id, 6, measure_6 FROM quality_inspection_items WHERE measure_6 IS NOT NULL;

-- 注: 暂不删除旧列，保留兼容期
-- ALTER TABLE quality_inspection_items DROP COLUMN measure_1, DROP COLUMN measure_2, ...;

-- =========================================
-- Fix 3: 量具台账与校准管理
-- =========================================
CREATE TABLE IF NOT EXISTS gauges (
  id             INT AUTO_INCREMENT PRIMARY KEY COMMENT '主键',
  gauge_no       VARCHAR(50)  NOT NULL UNIQUE  COMMENT '量具编号',
  gauge_name     VARCHAR(100) NOT NULL         COMMENT '量具名称',
  gauge_type     VARCHAR(50)  DEFAULT NULL     COMMENT '量具类型 (游标卡尺/千分尺/量块/CMM/...)',
  model          VARCHAR(100) DEFAULT NULL     COMMENT '型号规格',
  manufacturer   VARCHAR(100) DEFAULT NULL     COMMENT '制造商',
  serial_number  VARCHAR(100) DEFAULT NULL     COMMENT '出厂编号',
  measurement_range VARCHAR(100) DEFAULT NULL  COMMENT '测量范围',
  accuracy       VARCHAR(50)  DEFAULT NULL     COMMENT '精度等级',
  resolution     VARCHAR(50)  DEFAULT NULL     COMMENT '分辨力',
  location       VARCHAR(100) DEFAULT NULL     COMMENT '存放位置',
  custodian      VARCHAR(50)  DEFAULT NULL     COMMENT '保管人',
  status         ENUM('in_use','calibrating','repaired','scrapped','idle')
                 DEFAULT 'idle'                COMMENT '使用状态',
  purchase_date  DATE DEFAULT NULL             COMMENT '购置日期',
  last_calibration_date DATE DEFAULT NULL      COMMENT '上次校准日期',
  next_calibration_date DATE DEFAULT NULL      COMMENT '下次校准日期',
  calibration_cycle_days INT DEFAULT 365       COMMENT '校准周期 (天)',
  note           TEXT DEFAULT NULL             COMMENT '备注',
  created_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_status (status),
  INDEX idx_next_cal (next_calibration_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='量具台账';

CREATE TABLE IF NOT EXISTS gauge_calibration_records (
  id               INT AUTO_INCREMENT PRIMARY KEY COMMENT '主键',
  gauge_id         INT NOT NULL                   COMMENT '关联量具ID',
  calibration_no   VARCHAR(50) NOT NULL UNIQUE    COMMENT '校准记录编号',
  calibration_type ENUM('internal','external') DEFAULT 'internal' COMMENT '校准类型',
  calibration_date DATE NOT NULL                  COMMENT '校准日期',
  next_due_date    DATE DEFAULT NULL              COMMENT '下次到期日期',
  calibrated_by    VARCHAR(50) DEFAULT NULL       COMMENT '校准人/机构',
  result           ENUM('qualified','unqualified','limited') DEFAULT NULL COMMENT '校准结果',
  certificate_no   VARCHAR(100) DEFAULT NULL      COMMENT '证书编号',
  standard_used    VARCHAR(200) DEFAULT NULL      COMMENT '使用的标准器',
  temperature      DECIMAL(5,1) DEFAULT NULL      COMMENT '环境温度 (°C)',
  humidity         DECIMAL(5,1) DEFAULT NULL       COMMENT '环境湿度 (%RH)',
  deviation        DECIMAL(15,6) DEFAULT NULL      COMMENT '偏差值',
  uncertainty      DECIMAL(15,6) DEFAULT NULL      COMMENT '不确定度',
  note             TEXT DEFAULT NULL               COMMENT '备注',
  attachment_url   VARCHAR(500) DEFAULT NULL       COMMENT '证书附件路径',
  created_at       DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at       DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_gauge_id (gauge_id),
  INDEX idx_cal_date (calibration_date),
  CONSTRAINT fk_cal_gauge FOREIGN KEY (gauge_id)
    REFERENCES gauges(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='量具校准记录';

-- =========================================
-- Fix 4: SPC 控制图数据
-- =========================================
CREATE TABLE IF NOT EXISTS spc_control_plans (
  id               INT AUTO_INCREMENT PRIMARY KEY COMMENT '主键',
  plan_no          VARCHAR(50)  NOT NULL UNIQUE  COMMENT '控制计划编号',
  plan_name        VARCHAR(100) NOT NULL         COMMENT '控制计划名称',
  product_id       INT DEFAULT NULL              COMMENT '产品ID',
  product_code     VARCHAR(50) DEFAULT NULL      COMMENT '产品编码',
  product_name     VARCHAR(100) DEFAULT NULL     COMMENT '产品名称',
  process_id       INT DEFAULT NULL              COMMENT '工序ID',
  process_name     VARCHAR(50) DEFAULT NULL      COMMENT '工序名称',
  characteristic   VARCHAR(100) NOT NULL         COMMENT '监控特性 (如: 外径尺寸)',
  usl              DECIMAL(15,6) DEFAULT NULL    COMMENT '规格上限 (USL)',
  lsl              DECIMAL(15,6) DEFAULT NULL    COMMENT '规格下限 (LSL)',
  target_value     DECIMAL(15,6) DEFAULT NULL    COMMENT '目标值',
  subgroup_size    INT DEFAULT 5                 COMMENT '子组大小 (n)',
  chart_type       ENUM('xbar_r','xbar_s','imr','p','np','c','u')
                   DEFAULT 'xbar_r'              COMMENT '控制图类型',
  is_active        TINYINT(1) DEFAULT 1          COMMENT '是否启用',
  note             TEXT DEFAULT NULL              COMMENT '备注',
  created_at       DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at       DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_product (product_id),
  INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='SPC 控制计划';

CREATE TABLE IF NOT EXISTS spc_data_points (
  id              INT AUTO_INCREMENT PRIMARY KEY COMMENT '主键',
  plan_id         INT NOT NULL                   COMMENT '关联控制计划ID',
  subgroup_no     INT NOT NULL                   COMMENT '子组序号',
  sample_no       SMALLINT NOT NULL              COMMENT '子组内样本序号',
  measured_value  DECIMAL(15,6) NOT NULL         COMMENT '实测值',
  measured_at     DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '测量时间',
  measured_by     VARCHAR(50) DEFAULT NULL       COMMENT '测量人',
  batch_no        VARCHAR(50) DEFAULT NULL       COMMENT '关联批次号',
  inspection_id   INT DEFAULT NULL               COMMENT '关联检验单ID',
  created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_plan_subgroup (plan_id, subgroup_no),
  CONSTRAINT fk_spc_plan FOREIGN KEY (plan_id)
    REFERENCES spc_control_plans(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='SPC 数据采集点';

-- =========================================
-- Fix 5: 供应商质量计分卡
-- =========================================
CREATE TABLE IF NOT EXISTS supplier_quality_scores (
  id                INT AUTO_INCREMENT PRIMARY KEY COMMENT '主键',
  supplier_id       INT NOT NULL                   COMMENT '供应商ID',
  period            VARCHAR(7) NOT NULL            COMMENT '统计周期 YYYY-MM',
  -- 来料检验指标
  total_lots        INT DEFAULT 0                  COMMENT '来料批次总数',
  accepted_lots     INT DEFAULT 0                  COMMENT '合格批次数',
  rejected_lots     INT DEFAULT 0                  COMMENT '拒收批次数',
  total_qty         DECIMAL(15,2) DEFAULT 0        COMMENT '来料总数量',
  defect_qty        DECIMAL(15,2) DEFAULT 0        COMMENT '不良数量',
  ppm               DECIMAL(10,2) DEFAULT 0        COMMENT 'PPM (不良率 百万分比)',
  lot_accept_rate   DECIMAL(5,2) DEFAULT 0         COMMENT '批次合格率 (%)',
  -- 交付指标
  total_deliveries  INT DEFAULT 0                  COMMENT '交货批次总数',
  on_time_deliveries INT DEFAULT 0                 COMMENT '准时交货批次数',
  delivery_rate     DECIMAL(5,2) DEFAULT 0         COMMENT '准时交货率 (%)',
  -- 8D 响应时效
  total_8d_reports  INT DEFAULT 0                  COMMENT '8D 报告总数',
  closed_8d_on_time INT DEFAULT 0                  COMMENT '按时关闭数',
  avg_8d_days       DECIMAL(5,1) DEFAULT 0         COMMENT '平均 8D 关闭天数',
  -- 综合评分
  quality_score     DECIMAL(5,2) DEFAULT 0         COMMENT '质量得分 (0-100)',
  delivery_score    DECIMAL(5,2) DEFAULT 0         COMMENT '交付得分 (0-100)',
  response_score    DECIMAL(5,2) DEFAULT 0         COMMENT '响应得分 (0-100)',
  total_score       DECIMAL(5,2) DEFAULT 0         COMMENT '综合得分 (0-100)',
  grade             ENUM('A','B','C','D')
                    DEFAULT 'C'                     COMMENT '等级评定 A/B/C/D',
  note              TEXT DEFAULT NULL               COMMENT '评审备注',
  created_at        DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at        DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_supplier_period (supplier_id, period),
  INDEX idx_period (period),
  INDEX idx_grade (grade)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='供应商质量计分卡 (月度)';
