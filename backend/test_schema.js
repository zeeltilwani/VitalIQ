const { Pool } = require('pg');
require('dotenv').config();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function test() {
  const res = await pool.query("SELECT data_type FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'last_logged_date';");
  console.log("Column type:", res.rows[0].data_type);
  pool.end();
}
test();
