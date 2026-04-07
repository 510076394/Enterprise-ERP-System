/**
 * 20260119_finance_account_mapping.js
 * 创建财务科目映射配置表和系统配置
 */

const logger = require('../src/utils/logger');

exports.up = async function (db) {
    const client = await db.pool.getConnection();

    try {
        await client.beginTransaction();

        logger.info('[Migration] 开始执行：创建财务科目映射表');

        // 1. 创建财务科目映射配置表
        await client.execute(`
      CREATE TABLE IF NOT EXISTS finance_account_mapping (
        id INT PRIMARY KEY AUTO_INCREMENT,
        business_type VARCHAR(50) NOT NULL COMMENT '业务类型：purchase_invoice, purchase_payment, sales_invoice, sales_receipt',
        debit_account_id INT COMMENT '借方科目ID',
        credit_account_id INT COMMENT '贷方科目ID',
        supplier_category_id INT COMMENT '供应商分类ID（可选）',
        material_category_id INT COMMENT '物料分类ID（可选）',
        description VARCHAR(200) COMMENT '说明',
        is_default BOOLEAN DEFAULT FALSE COMMENT '是否默认配置',
        status BOOLEAN DEFAULT TRUE COMMENT '启用状态',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_business_type (business_type),
        INDEX idx_is_default (is_default, business_type),
        FOREIGN KEY (debit_account_id) REFERENCES accounts(id) ON DELETE SET NULL,
        FOREIGN KEY (credit_account_id) REFERENCES accounts(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='财务科目映射配置表';
    `);

        logger.info('[Migration] ✓ 财务科目映射表创建成功');

        // 2. 创建或更新 system_config 表
        const [tables] = await client.execute(
            "SHOW TABLES LIKE 'system_config'"
        );

        if (tables.length === 0) {
            logger.info('[Migration] 系统配置表不存在，创建中...');
            await client.execute(`
        CREATE TABLE system_config (
          id INT PRIMARY KEY AUTO_INCREMENT,
          config_key VARCHAR(100) UNIQUE NOT NULL COMMENT '配置键',
          config_value TEXT COMMENT '配置值',
          config_type VARCHAR(20) DEFAULT 'string' COMMENT '配置类型：string, number, boolean, json',
          description VARCHAR(200) COMMENT '配置说明',
          module VARCHAR(50) COMMENT '所属模块',
          is_system BOOLEAN DEFAULT FALSE COMMENT '是否系统配置',
          status BOOLEAN DEFAULT TRUE COMMENT '启用状态',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='系统配置表';
      `);
            logger.info('[Migration] ✓ 系统配置表创建成功');
        }

        // 3. 插入采购相关系统配置
        await client.execute(`
      INSERT INTO system_config (config_key, config_value, config_type, description, module, is_system)
      VALUES 
        ('auto_generate_ap_invoice', 'true', 'boolean', '采购入库时自动生成应付发票', 'purchase', false),
        ('auto_confirm_ap_invoice', 'false', 'boolean', '自动生成的应付发票是否自动确认（生成会计分录）', 'purchase', false)
      ON DUPLICATE KEY UPDATE 
        description = VALUES(description),
        module = VALUES(module);
    `);

        logger.info('[Migration] ✓ 系统配置数据插入成功');

        // 4. 创建默认的科目映射配置（如果 accounts 表有数据）
        const [accountsExist] = await client.execute(`
      SELECT COUNT(*) as count FROM accounts WHERE account_code IN ('1405', '2202', '6001', '1001')
    `);

        if (accountsExist[0].count >= 4) {
            logger.info('[Migration] 检测到会计科目数据，创建默认映射配置');

            // 获取科目ID
            const [inventoryAccount] = await client.execute(
                "SELECT id FROM accounts WHERE account_code = '1405' LIMIT 1"
            );
            const [payableAccount] = await client.execute(
                "SELECT id FROM accounts WHERE account_code = '2202' LIMIT 1"
            );
            const [costAccount] = await client.execute(
                "SELECT id FROM accounts WHERE account_code = '6001' LIMIT 1"
            );
            const [bankAccount] = await client.execute(
                "SELECT id FROM accounts WHERE account_code = '1001' LIMIT 1"
            );

            if (inventoryAccount.length > 0 && payableAccount.length > 0) {
                // 采购发票默认映射
                await client.execute(`
          INSERT INTO finance_account_mapping 
          (business_type, debit_account_id, credit_account_id, description, is_default)
          VALUES 
          ('purchase_invoice', ?, ?, '采购发票默认科目：借-库存商品/贷-应付账款', true)
          ON DUPLICATE KEY UPDATE description = VALUES(description);
        `, [inventoryAccount[0].id, payableAccount[0].id]);

                logger.info('[Migration] ✓ 采购发票默认映射创建成功');
            }

            if (payableAccount.length > 0 && bankAccount.length > 0) {
                // 采购付款默认映射
                await client.execute(`
          INSERT INTO finance_account_mapping 
          (business_type, debit_account_id, credit_account_id, description, is_default)
          VALUES 
          ('purchase_payment', ?, ?, '采购付款默认科目：借-应付账款/贷-银行存款', true)
        `, [payableAccount[0].id, bankAccount[0].id]);

                logger.info('[Migration] ✓ 采购付款默认映射创建成功');
            }
        } else {
            logger.info('[Migration] 会计科目数据不完整，跳过默认映射创建');
        }

        await client.commit();
        logger.info('[Migration] ✅ 财务科目映射配置迁移完成');

    } catch (error) {
        await client.rollback();
        logger.error('[Migration] ❌ 迁移失败:', error);
        throw error;
    } finally {
        client.release();
    }
};

exports.down = async function (db) {
    const client = await db.pool.getConnection();

    try {
        await client.beginTransaction();

        logger.info('[Migration] 开始回滚：删除财务科目映射表');

        // 删除系统配置
        await client.execute(`
      DELETE FROM system_config 
      WHERE config_key IN ('auto_generate_ap_invoice', 'auto_confirm_ap_invoice');
    `);

        // 删除表
        await client.execute('DROP TABLE IF EXISTS finance_account_mapping');

        await client.commit();
        logger.info('[Migration] ✅ 回滚完成');

    } catch (error) {
        await client.rollback();
        logger.error('[Migration] ❌ 回滚失败:', error);
        throw error;
    } finally {
        client.release();
    }
};
