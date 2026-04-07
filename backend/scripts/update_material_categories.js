const { DATABASE_CONFIG } = require('../src/config/database-config');
const mysql = require('mysql2/promise');

(async () => {
    let connection;
    try {
        connection = await mysql.createConnection(DATABASE_CONFIG);

        const [categories] = await connection.query('SELECT id, code, name FROM categories');
        console.log('Available categories:', categories);

        const typeMap = {};
        categories.forEach(cat => {
            typeMap[cat.code] = cat.id;
        });

        let totalUpdated = 0;

        // 1 -> 产成品 (FIN)
        if (typeMap['FIN']) {
            const [res] = await connection.query('UPDATE materials SET category_id = ? WHERE code LIKE "1%"', [typeMap['FIN']]);
            console.log(`Updated to 产成品(FIN): ${res.affectedRows}`);
            totalUpdated += res.affectedRows;
        }

        // 2 -> 半成品 (SEMI)
        if (typeMap['SEMI']) {
            const [res] = await connection.query('UPDATE materials SET category_id = ? WHERE code LIKE "2%"', [typeMap['SEMI']]);
            console.log(`Updated to 半成品(SEMI): ${res.affectedRows}`);
            totalUpdated += res.affectedRows;
        }

        // 3 -> 零部件 (PART)
        if (typeMap['PART']) {
            const [res] = await connection.query('UPDATE materials SET category_id = ? WHERE code LIKE "3%"', [typeMap['PART']]);
            console.log(`Updated to 零部件(PART): ${res.affectedRows}`);
            totalUpdated += res.affectedRows;
        }

        // 4 -> 包装物 (PKG)
        if (typeMap['PKG']) {
            const [res] = await connection.query('UPDATE materials SET category_id = ? WHERE code LIKE "4%"', [typeMap['PKG']]);
            console.log(`Updated to 包装物(PKG): ${res.affectedRows}`);
            totalUpdated += res.affectedRows;
        }

        console.log(`Successfully updated ${totalUpdated} materials in total.`);
    } catch (error) {
        console.error('Error fetching data:', error);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
})();
