const express = require("express");
const router = express.Router();
const { pool } = require("../db");
const { auth } = require("../middleware/auth");
const { sendEmail } = require("../utils/email");

// GET /api/transactions
router.get("/", auth, async (req, res) => {
  try {
    const r = await pool.query(
      "SELECT * FROM transactions WHERE user_id=$1 ORDER BY created_at DESC LIMIT 50",
      [req.user.id]
    );
    res.json({ transactions: r.rows });
  } catch (err) { res.status(500).json({ message: "Server error" }); }
});

// GET /api/transactions/wallet-addresses — returns active wallets for deposit page
router.get("/wallet-addresses", auth, async (req, res) => {
  try {
    const r = await pool.query(
      "SELECT id, method, label, address, network FROM wallet_addresses WHERE is_active=true ORDER BY created_at ASC"
    );
    res.json({ wallets: r.rows });
  } catch (err) { res.status(500).json({ message: "Server error" }); }
});

// POST /api/transactions/deposit
router.post("/deposit", auth, async (req, res) => {
  const { amount, plan_name, payment_method } = req.body;
  const plans = {
    bronze:   { roi: 20, min: 100,   max: 999,    days: 15 },
    silver:   { roi: 35, min: 500,   max: 4999,   days: 30 },
    gold:     { roi: 50, min: 5000,  max: 24999,  days: 60 },
    platinum: { roi: 60, min: 25000, max: 500000, days: 90 }
  };
  const plan = plans[plan_name?.toLowerCase()];

  if (!plan) return res.status(400).json({ message: "Invalid plan selected." });
  if (!amount || amount < plan.min) return res.status(400).json({ message: `Minimum deposit for ${plan_name} is $${plan.min.toLocaleString()}` });
  if (amount > plan.max) return res.status(400).json({ message: `Maximum deposit for ${plan_name} is $${plan.max.toLocaleString()}` });

  try {
    const ref = "DEP-" + Date.now() + "-" + Math.random().toString(36).substring(2,6).toUpperCase();
    const r = await pool.query(
      `INSERT INTO transactions (user_id, type, amount, plan_name, payment_method, status, reference, created_at)
       VALUES ($1,'deposit',$2,$3,$4,'pending',$5,NOW()) RETURNING *`,
      [req.user.id, amount, plan_name, payment_method, ref]
    );

    // Send email non-blocking (fire and forget)
    pool.query("SELECT full_name, email FROM users WHERE id=$1", [req.user.id]).then(user => {
      sendEmail(process.env.SMTP_USER || "support@nexvault.org", "New Deposit Request 📈",
        "<h3>New Deposit Request</h3><p>User: " + user.rows[0].full_name + " (" + user.rows[0].email + ")</p><p>Amount: $" + Number(amount).toLocaleString() + "</p><p>Plan: " + plan_name.toUpperCase() + " VAULT</p><p>Method: " + payment_method + "</p><p>Reference: " + ref + "</p>"
      ).catch(e => console.log("Email error:", e.message));
      // Send confirmation to user
      sendEmail(user.rows[0].email, "Deposit Received - NexVault",
        "<h2 style='color:#fbbf24'>Deposit Received!</h2><p>Hi " + user.rows[0].full_name + ", we received your $" + Number(amount).toLocaleString() + " deposit for the " + plan_name.toUpperCase() + " VAULT plan.</p><p style='color:#94a3b8'>Admin will verify within 24 hours.</p><a href='https://nexvault.org/dashboard' style='display:inline-block;padding:12px 24px;background:#f59e0b;color:#010208;font-weight:700;text-decoration:none;border-radius:2px;margin-top:16px'>View Dashboard</a>"
      ).catch(e => console.log("Email error:", e.message));
    }).catch(e => console.log("User query error:", e.message));

    res.status(201).json({ message: "Deposit request submitted. Awaiting confirmation.", transaction: r.rows[0] });
  } catch (err) { console.error(err); res.status(500).json({ message: "Server error" }); }
});

// POST /api/transactions/withdraw
router.post("/withdraw", auth, async (req, res) => {
  const { amount, payment_method, wallet_address } = req.body;
  if (!amount || amount < 50) return res.status(400).json({ message: "Minimum withdrawal is $50." });
  if (!wallet_address) return res.status(400).json({ message: "Wallet address required." });

  try {
    const userRes = await pool.query("SELECT balance, total_profit FROM users WHERE id=$1", [req.user.id]);
    const user = userRes.rows[0];
    const available = parseFloat(user.balance) + parseFloat(user.total_profit || 0);
    if (amount > available) return res.status(400).json({ message: `Insufficient balance. Available: $${available.toLocaleString()}` });

    const ref = "WIT-" + Date.now() + "-" + Math.random().toString(36).substring(2,6).toUpperCase();
    const r = await pool.query(
      `INSERT INTO transactions (user_id, type, amount, payment_method, wallet_address, status, reference, created_at)
       VALUES ($1,'withdrawal',$2,$3,$4,'pending',$5,NOW()) RETURNING *`,
      [req.user.id, amount, payment_method, wallet_address, ref]
    );

    res.status(201).json({ message: "Withdrawal request submitted. Processing within 24 hours.", transaction: r.rows[0] });
  } catch (err) { console.error(err); res.status(500).json({ message: "Server error" }); }
});

module.exports = router;