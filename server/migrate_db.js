const { Pool } = require('pg');
const RAILWAY_URL = "postgresql://postgres:nHwGMKAlOHBcHIdonFdjdjWxHvjhSDgi@centerbeam.proxy.rlwy.net:14322/railway";
const src = new Pool({ connectionString: RAILWAY_URL, ssl: false });
const dst = new Pool({
  host: "aws-0-eu-west-1.pooler.supabase.com",
  port: 5432, database: "postgres",
  user: "postgres.kzhwiwbddpvkgvujnlsc",
  password: "Realworld@0987",
  ssl: { rejectUnauthorized: false }
});
const TABLES = ["users","wallet_addresses","transactions","investments","referral_earnings","chat_messages","kyc_documents"];
const SCHEMA = `
CREATE TABLE IF NOT EXISTS users (id SERIAL PRIMARY KEY, full_name TEXT, email TEXT UNIQUE NOT NULL, password_hash TEXT, phone TEXT, country TEXT, role TEXT DEFAULT 'user', balance NUMERIC DEFAULT 0, total_profit NUMERIC DEFAULT 0, current_plan TEXT, referral_code TEXT UNIQUE, referred_by INTEGER, kyc_status TEXT DEFAULT 'unverified', is_active BOOLEAN DEFAULT true, created_at TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE IF NOT EXISTS transactions (id SERIAL PRIMARY KEY, user_id INTEGER, type TEXT NOT NULL, amount NUMERIC NOT NULL, plan_name TEXT, payment_method TEXT, wallet_address TEXT, status TEXT DEFAULT 'pending', reference TEXT, note TEXT, created_at TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE IF NOT EXISTS investments (id SERIAL PRIMARY KEY, user_id INTEGER, plan_name TEXT, amount NUMERIC, roi_percent NUMERIC, duration_days INTEGER, status TEXT DEFAULT 'active', start_date TIMESTAMPTZ DEFAULT NOW(), end_date TIMESTAMPTZ);
CREATE TABLE IF NOT EXISTS wallet_addresses (id SERIAL PRIMARY KEY, method TEXT NOT NULL, label TEXT, address TEXT NOT NULL, network TEXT, is_active BOOLEAN DEFAULT true, created_at TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE IF NOT EXISTS referral_earnings (id SERIAL PRIMARY KEY, user_id INTEGER, referred_user_id INTEGER, amount NUMERIC, status TEXT DEFAULT 'pending', created_at TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE IF NOT EXISTS chat_messages (id SERIAL PRIMARY KEY, user_id INTEGER NOT NULL, user_name TEXT, from_role TEXT NOT NULL, message TEXT NOT NULL, is_read BOOLEAN DEFAULT FALSE, created_at TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE IF NOT EXISTS kyc_documents (id SERIAL PRIMARY KEY, user_id INTEGER NOT NULL, document_type TEXT, document_data TEXT, selfie_data TEXT, status TEXT DEFAULT 'pending', submitted_at TIMESTAMPTZ DEFAULT NOW(), reviewed_at TIMESTAMPTZ, note TEXT);
`;
async function migrate() {
  try {
    console.log("Creating schema...");
    await dst.query(SCHEMA);
    for (const table of TABLES) {
      try {
        const { rows } = await src.query(`SELECT * FROM ${table} ORDER BY id`);
        console.log(`\n${table}: ${rows.length} rows`);
        if (!rows.length) continue;
        await dst.query(`DELETE FROM ${table}`);
        let ok = 0;
        for (const row of rows) {
          const keys = Object.keys(row);
          const cols = keys.map(k => `"${k}"`).join(",");
          const vals = keys.map((_,i) => `$${i+1}`).join(",");
          try { await dst.query(`INSERT INTO ${table} (${cols}) VALUES (${vals}) ON CONFLICT DO NOTHING`, keys.map(k=>row[k])); ok++; } catch(e) { console.log("  Row error:",e.message); }
        }
        console.log(`  checkmark ${ok}/${rows.length} migrated`);
        try { const maxId=Math.max(...rows.map(r=>r.id)); await dst.query(`SELECT setval(pg_get_serial_sequence('${table}','id'),${maxId})`); } catch(e) {}
      } catch(e) { console.log(`${table} ERROR:`,e.message); }
    }
    console.log("\nMIGRATION COMPLETE!");
  } catch(e) { console.error("Failed:",e.message); }
  finally { await src.end(); await dst.end(); }
}
migrate();
