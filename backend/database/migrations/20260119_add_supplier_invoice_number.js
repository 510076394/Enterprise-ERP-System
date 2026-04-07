const db = require('../src/config/db');
const { logger } = require('../src/utils/logger');

async function up() {
    const connection = await db.pool.getConnection();
    try {
        await connection.beginTransaction();

        // Check if column exists
        const [columns] = await connection.execute(
            `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'ap_invoices' AND COLUMN_NAME = 'supplier_invoice_number'`,
            [process.env.DB_NAME || 'mes']
        );

        if (columns.length === 0) {
            logger.info('Adding supplier_invoice_number column to ap_invoices table...');
            await connection.execute(
                `ALTER TABLE ap_invoices
         ADD COLUMN supplier_invoice_number VARCHAR(100) NULL COMMENT '供应商发票号' AFTER invoice_number`
            );
            logger.info('Column supplier_invoice_number added successfully.');
        } else {
            logger.info('Column supplier_invoice_number already exists.');
        }

        await connection.commit();
    } catch (error) {
        await connection.rollback();
        logger.error('Migration failed:', error);
        throw error;
    } finally {
        connection.release();
    }
}

async function down() {
    const connection = await db.pool.getConnection();
    try {
        await connection.beginTransaction();

        // Check if column exists
        const [columns] = await connection.execute(
            `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'ap_invoices' AND COLUMN_NAME = 'supplier_invoice_number'`,
            [process.env.DB_NAME || 'mes']
        );

        if (columns.length > 0) {
            logger.info('Dropping supplier_invoice_number column from ap_invoices table...');
            await connection.execute('ALTER TABLE ap_invoices DROP COLUMN supplier_invoice_number');
            logger.info('Column supplier_invoice_number dropped successfully.');
        }

        await connection.commit();
    } catch (error) {
        await connection.rollback();
        logger.error('Migration rollback failed:', error);
        throw error;
    } finally {
        connection.release();
    }
}

module.exports = { up, down };
