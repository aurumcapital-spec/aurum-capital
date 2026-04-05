const { Pool } = require('pg');
const dst = new Pool({
  host: "aws-0-eu-west-1.pooler.supabase.com",
  port: 5432,
  database: "postgres",
  user: "postgres.kzhwiwbddpvkgvujnlsc",
  password: "Realworld@0987",
  ssl: { rejectUnauthorized: false }
});
console.log("Testing...");
dst.query("SELECT current_user").then(r => console.log("Connected! User:", r.rows[0].current_user)).catch(e => console.log("Error:", e.message)).finally(() => dst.end());
