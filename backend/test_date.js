const { Pool } = require('pg');
require('dotenv').config();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function test() {
  const res = await pool.query('SELECT current_date as cd');
  console.log("DB CURRENT_DATE:", res.rows[0].cd, typeof res.rows[0].cd, res.rows[0].cd instanceof Date);
  const str = res.rows[0].cd.toISOString();
  console.log("ISO String:", str);
  pool.end();
}
test();
