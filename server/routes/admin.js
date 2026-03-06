const express = require("express");
const router = express.Router();
const { pool } = require("../db");
const { auth, adminAuth } = require("../middleware/auth");
const { sendEmail } = require("../utils/email");

// GET /api/admin/stats
router.get("/stats", auth, adminAuth, async (req, res) => {
  try {
    const [users, aum, deposits, withdrawals, pendingWith, pendingKyc, recent] = await Promise.all([
      pool.query("SELECT COUNT(*) FROM users"),
      pool.query("SELECT COALESCE(SUM(amount),0) as total FROM investments WHERE status='active'"),
      pool.query("SELECT COALESCE(SUM(amount),0) as total FROM transactions WHERE type='deposit' AND status='approved'"),
      pool.query("SELECT COALESCE(SUM(amount),0) as total FROM transactions WHERE type='withdrawal' AND status='approved'"),
      pool.query("SELECT COUNT(*) FROM transactions WHERE type='withdrawal' AND status='pending'"),
      pool.query("SELECT COUNT(*) FROM users WHERE kyc_status='pending'"),
      pool.query(`SELECT t.*, u.full_name as user_name FROM transactions t 
                  JOIN users u ON u.id=t.user_id ORDER BY t.created_at DESC LIMIT 10`)
    ]);
    res.json({
      total_users: parseInt(users.rows[0].count),
      aum: parseFloat(aum.rows[0].total),
      total_deposits: parseFloat(deposits.rows[0].total),
      total_withdrawals: parseFloat(withdrawals.rows[0].total),
      pending_withdrawals: parseInt(pendingWith.rows[0].count),
      pending_kyc: parseInt(pendingKyc.rows[0].count),
      recent_activity: recent.rows
    });
  } catch (err) { console.error(err); res.status(500).json({ message: "Server error" }); }
});

// GET /api/admin/users
router.get("/users", auth, adminAuth, async (req, res) => {
  try {
    const r = await pool.query(`
      SELECT u.*, 
        (SELECT COALESCE(SUM(amount),0) FROM transactions WHERE user_id=u.id AND type='deposit' AND status='approved') as total_deposited
      FROM users u ORDER BY u.created_at DESC`);
    res.json({ users: r.rows.map(u => { delete u.password_hash; return u; }) });
  } catch (err) { res.status(500).json({ message: "Server error" }); }
});

// POST /api/admin/users/:id/toggle
router.post("/users/:id/toggle", auth, adminAuth, async (req, res) => {
  try {
    await pool.query("UPDATE users SET is_active = NOT is_active WHERE id=$1", [req.params.id]);
    res.json({ message: "User status toggled" });
  } catch (err) { res.status(500).json({ message: "Server error" }); }
});

// POST /api/admin/users/:id/credit
router.post("/users/:id/credit", auth, adminAuth, async (req, res) => {
  const { amount, type, note } = req.body;
  if (!amount || amount <= 0) return res.status(400).json({ message: "Invalid amount" });
  try {
    const col = type === 'profit' ? 'total_profit' : type === 'referral' ? 'referral_earnings' : 'balance';
    await pool.query(`UPDATE users SET ${col} = ${col} + $1 WHERE id=$2`, [amount, req.params.id]);
    await pool.query(
      `INSERT INTO transactions (user_id, type, amount, status, reference, plan_name, created_at)
       VALUES ($1,'credit',$2,'completed',$3,$4,NOW())`,
      [req.params.id, amount, `ADMIN-CREDIT-${Date.now()}`, note || 'Admin credit']
    );
    const user = await pool.query("SELECT email, full_name FROM users WHERE id=$1", [req.params.id]);
    try {
      await sendEmail(user.rows[0].email, "Balance Credited to Your Vault 💰",
        `<h3>Good news, ${user.rows[0].full_name}!</h3><p>$${amount.toLocaleString()} has been credited to your NexVault account.</p><p>Type: ${type.toUpperCase()}</p>${note ? `<p>Note: ${note}</p>` : ''}<p>Log in to your dashboard to view your updated balance.</p>`
      );
    } catch(e) {}
    res.json({ message: "Balance credited successfully" });
  } catch (err) { console.error(err); res.status(500).json({ message: "Server error" }); }
});

// GET /api/admin/transactions
router.get("/transactions", auth, adminAuth, async (req, res) => {
  try {
    const r = await pool.query(`
      SELECT t.*, u.full_name as user_name, u.email as user_email 
      FROM transactions t JOIN users u ON u.id=t.user_id 
      ORDER BY t.created_at DESC LIMIT 200`);
    res.json({ transactions: r.rows });
  } catch (err) { res.status(500).json({ message: "Server error" }); }
});

// POST /api/admin/transactions/:id/approve
router.post("/transactions/:id/approve", auth, adminAuth, async (req, res) => {
  try {
    const tx = await pool.query("SELECT * FROM transactions WHERE id=$1", [req.params.id]);
    if (!tx.rows.length) return res.status(404).json({ message: "Transaction not found" });
    const t = tx.rows[0];

    await pool.query("UPDATE transactions SET status='approved' WHERE id=$1", [req.params.id]);

    if (t.type === 'deposit') {
      // Create investment record
      const plans = { bronze:{roi:5,days:30}, silver:{roi:8,days:60}, gold:{roi:12,days:90}, platinum:{roi:18,days:180} };
      const plan = plans[t.plan_name?.toLowerCase()] || { roi: 5, days: 30 };
      await pool.query(
        `INSERT INTO investments (user_id, plan_name, amount, roi_percent, duration_days, status, start_date, end_date)
         VALUES ($1,$2,$3,$4,$5,'active',NOW(),NOW() + INTERVAL '${plan.days} days')
         ON CONFLICT DO NOTHING`,
        [t.user_id, t.plan_name, t.amount, plan.roi, plan.days]
      );
      // Update user current plan
      await pool.query("UPDATE users SET current_plan=$1 WHERE id=$2", [t.plan_name, t.user_id]);

      // Referral commission (5%)
      const refUser = await pool.query("SELECT referred_by FROM users WHERE id=$1", [t.user_id]);
      if (refUser.rows[0]?.referred_by) {
        const commission = parseFloat(t.amount) * 0.05;
        await pool.query("UPDATE users SET referral_earnings = referral_earnings + $1 WHERE id=$2", [commission, refUser.rows[0].referred_by]);
        await pool.query("INSERT INTO referral_earnings (user_id, from_user_id, amount, status) VALUES ($1,$2,$3,'paid')", [refUser.rows[0].referred_by, t.user_id, commission]);
      }
    } else if (t.type === 'withdrawal') {
      // Deduct from balance
      await pool.query("UPDATE users SET balance = GREATEST(balance - $1, 0) WHERE id=$2", [t.amount, t.user_id]);
    }

    // Notify user
    const user = await pool.query("SELECT email, full_name FROM users WHERE id=$1", [t.user_id]);
    const subject = t.type === 'deposit' ? "Deposit Confirmed! 📈" : "Withdrawal Processed! 💰";
    const body = t.type === 'deposit'
      ? `<h3>Your deposit of $${parseFloat(t.amount).toLocaleString()} to ${t.plan_name?.toUpperCase()} VAULT has been confirmed!</h3><p>Your investment is now active and generating returns.</p>`
      : `<h3>Your withdrawal of $${parseFloat(t.amount).toLocaleString()} has been processed!</h3><p>Funds sent to your ${t.payment_method} wallet. Allow 24 hours for confirmation.</p>`;
    try { await sendEmail(user.rows[0].email, subject, `<p>Hi ${user.rows[0].full_name},</p>${body}`); } catch(e) {}

    res.json({ message: "Transaction approved" });
  } catch (err) { console.error(err); res.status(500).json({ message: "Server error" }); }
});

// POST /api/admin/transactions/:id/reject
router.post("/transactions/:id/reject", auth, adminAuth, async (req, res) => {
  try {
    await pool.query("UPDATE transactions SET status='rejected' WHERE id=$1", [req.params.id]);
    res.json({ message: "Transaction rejected" });
  } catch (err) { res.status(500).json({ message: "Server error" }); }
});

// POST /api/admin/run-roi — Credit daily ROI to all active investments
router.post("/run-roi", auth, adminAuth, async (req, res) => {
  try {
    const investments = await pool.query("SELECT * FROM investments WHERE status='active' AND end_date > NOW()");
    let credited = 0;
    for (const inv of investments.rows) {
      const dailyROI = (parseFloat(inv.amount) * (inv.roi_percent / 100)) / inv.duration_days;
      await pool.query("UPDATE users SET total_profit = total_profit + $1 WHERE id=$2", [dailyROI, inv.user_id]);
      await pool.query(
        `INSERT INTO transactions (user_id, type, amount, plan_name, status, reference, created_at)
         VALUES ($1,'profit',$2,$3,'completed',$4,NOW())`,
        [inv.user_id, dailyROI, inv.plan_name, `ROI-${Date.now()}`]
      );
      credited++;
    }
    // Mark completed investments
    await pool.query("UPDATE investments SET status='completed' WHERE status='active' AND end_date <= NOW()");
    res.json({ message: `ROI credited to ${credited} investments.` });
  } catch (err) { console.error(err); res.status(500).json({ message: "Server error" }); }
});

module.exports = router;
