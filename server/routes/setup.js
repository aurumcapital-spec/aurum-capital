const express = require("express");
const router = express.Router();
const { pool } = require("../db");

router.get("/setup-db", async (req, res) => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY, full_name VARCHAR(100),
        email VARCHAR(100) UNIQUE NOT NULL, password_hash VARCHAR(255) NOT NULL,
        phone VARCHAR(30), country VARCHAR(60),
        balance DECIMAL(15,2) DEFAULT 0, total_profit DECIMAL(15,2) DEFAULT 0,
        referral_earnings DECIMAL(15,2) DEFAULT 0,
        referral_code VARCHAR(10) UNIQUE, referred_by INT,
        current_plan VARCHAR(20), kyc_status VARCHAR(20) DEFAULT 'unverified',
        is_active BOOLEAN DEFAULT true, role VARCHAR(10) DEFAULT 'user',
        created_at TIMESTAMP DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY, user_id INT NOT NULL,
        type VARCHAR(20) NOT NULL, amount DECIMAL(15,2) NOT NULL,
        plan_name VARCHAR(20), payment_method VARCHAR(30),
        wallet_address TEXT, status VARCHAR(20) DEFAULT 'pending',
        reference VARCHAR(60), created_at TIMESTAMP DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS investments (
        id SERIAL PRIMARY KEY, user_id INT NOT NULL,
        plan_name VARCHAR(20) NOT NULL, amount DECIMAL(15,2) NOT NULL,
        roi_percent DECIMAL(5,2) NOT NULL, duration_days INT NOT NULL,
        profit_earned DECIMAL(15,2) DEFAULT 0, status VARCHAR(20) DEFAULT 'active',
        start_date TIMESTAMP DEFAULT NOW(), end_date TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS referral_earnings (
        id SERIAL PRIMARY KEY, user_id INT NOT NULL,
        from_user_id INT NOT NULL, amount DECIMAL(15,2) NOT NULL,
        status VARCHAR(20) DEFAULT 'pending', created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    res.json({ message: "ALL TABLES CREATED!" });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get("/setup-db/promote-admin", async (req, res) => {
  const { email } = req.query;
  try {
    await pool.query("UPDATE users SET role='admin' WHERE email=$1", [email]);
    res.json({ message: "User promoted to admin: " + email });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
