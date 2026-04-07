require('dotenv').config();
const db = require('../src/config/db');

async function check() {
  try {
    const [cols] = await db.pool.execute('DESCRIBE nonconforming_products');
    console.log('--- 字段列表 ---');
    cols.forEach(c => console.log(c.Field + ' (' + c.Type + ')'));
  } catch(e) {
    console.error(e.message);
  }
  process.exit(0);
}
check();
