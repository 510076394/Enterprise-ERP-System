ALTER TABLE pricing_strategy_fields ADD COLUMN is_additive TINYINT DEFAULT 1 COMMENT '是否参与成本计算: 1-参与, 0-不参与';
