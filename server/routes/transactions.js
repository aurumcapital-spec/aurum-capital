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

// POST /api/transactions/deposit
router.post("/deposit", auth, async (req, res) => {
  const { amount, plan_name, payment_method } = req.body;
  const plans = { bronze:{roi:5,min:500,max:4999,days:30}, silver:{roi:8,min:5000,max:24999,days:60}, gold:{roi:12,min:25000,max:99999,days:90}, platinum:{roi:18,min:100000,max:999999,days:180} };
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

    // Notify admin
    const user = await pool.query("SELECT full_name, email FROM users WHERE id=$1", [req.user.id]);
    try {
      await sendEmail(process.env.ADMIN_EMAIL || "admin@nexvault.io", "New Deposit Request 📈",
        `<h3>New Deposit Request</h3><p>User: ${user.rows[0].full_name} (${user.rows[0].email})</p><p>Amount: $${amount.toLocaleString()}</p><p>Plan: ${plan_name.toUpperCase()} VAULT</p><p>Method: ${payment_method}</p><p>Reference: ${ref}</p>`
      );
    } catch(e) {}

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
    const available = parseFloat(user.balance) + parseFloat(user.total_profit);
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
