const { Pool } = require('pg');
require('dotenv').config();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function test() {
  const res = await pool.query("SELECT tgname FROM pg_trigger WHERE tgrelid = 'users'::regclass OR tgrelid = 'food_logs'::regclass;");
  console.log("Triggers:", res.rows);
  pool.end();
}
test();
