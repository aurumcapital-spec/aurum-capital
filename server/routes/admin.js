const express = require("express");
const router = express.Router();
const { pool } = require("../db");
const { auth, adminAuth } = require("../middleware/auth");
const { sendEmail, emails } = require("../utils/email");

router.get("/stats", auth, adminAuth, async (req, res) => {
  try {
    const [users, aum, deposits, withdrawals, pendingWith, pendingKyc, recent] = await Promise.all([
      pool.query("SELECT COUNT(*) FROM users"),
      pool.query("SELECT COALESCE(SUM(amount),0) as total FROM investments WHERE status='active'"),
      pool.query("SELECT COALESCE(SUM(amount),0) as total FROM transactions WHERE type='deposit' AND status='approved'"),
      pool.query("SELECT COALESCE(SUM(amount),0) as total FROM transactions WHERE type='withdrawal' AND status='approved'"),
      pool.query("SELECT COUNT(*) FROM transactions WHERE type='withdrawal' AND status='pending'"),
      pool.query("SELECT COUNT(*) FROM users WHERE kyc_status='pending'"),
      pool.query("SELECT t.*,u.full_name as user_name FROM transactions t JOIN users u ON u.id=t.user_id ORDER BY t.created_at DESC LIMIT 10")
    ]);
    res.json({ total_users:parseInt(users.rows[0].count), aum:parseFloat(aum.rows[0].total), total_deposits:parseFloat(deposits.rows[0].total), total_withdrawals:parseFloat(withdrawals.rows[0].total), pending_withdrawals:parseInt(pendingWith.rows[0].count), pending_kyc:parseInt(pendingKyc.rows[0].count), recent_activity:recent.rows });
  } catch (err) { console.error(err); res.status(500).json({ message:"Server error" }); }
});

router.get("/users", auth, adminAuth, async (req, res) => {
  try {
    const r = await pool.query("SELECT u.*, (SELECT COALESCE(SUM(amount),0) FROM transactions WHERE user_id=u.id AND type='deposit' AND status='approved') as total_deposited FROM users u ORDER BY u.created_at DESC");
    res.json({ users: r.rows.map(u => { delete u.password_hash; return u; }) });
  } catch (err) { res.status(500).json({ message:"Server error" }); }
});

router.post("/users/:id/toggle", auth, adminAuth, async (req, res) => {
  try { await pool.query("UPDATE users SET is_active=NOT is_active WHERE id=$1", [req.params.id]); res.json({ message:"Updated" }); }
  catch (err) { res.status(500).json({ message:"Server error" }); }
});

router.post("/users/:id/credit", auth, adminAuth, async (req, res) => {
  const { amount, type, note } = req.body;
  if (!amount || amount <= 0) return res.status(400).json({ message:"Invalid amount" });
  try {
    const col = type==="profit"?"total_profit":type==="referral"?"referral_earnings":"balance";
    await pool.query("UPDATE users SET "+col+"="+col+"+$1 WHERE id=$2", [amount, req.params.id]);
    await pool.query("INSERT INTO transactions (user_id,type,amount,status,reference,plan_name,created_at) VALUES ($1,'credit',$2,'completed',$3,$4,NOW())", [req.params.id, amount, "ADMIN-CREDIT-"+Date.now(), note||"Admin credit"]);
    const user = await pool.query("SELECT email,full_name FROM users WHERE id=$1", [req.params.id]);
    try { await sendEmail(user.rows[0].email,"Balance Credited","<p>Hi "+user.rows[0].full_name+", $"+Number(amount).toLocaleString()+" has been credited to your account.</p>"); } catch(e) {}
    res.json({ message:"Credited" });
  } catch (err) { console.error(err); res.status(500).json({ message:"Server error" }); }
});

router.get("/transactions", auth, adminAuth, async (req, res) => {
  try {
    const r = await pool.query("SELECT t.*,u.full_name as user_name,u.email as user_email FROM transactions t JOIN users u ON u.id=t.user_id ORDER BY t.created_at DESC LIMIT 200");
    res.json({ transactions: r.rows });
  } catch (err) { res.status(500).json({ message:"Server error" }); }
});

router.post("/transactions/:id/approve", auth, adminAuth, async (req, res) => {
  try {
    const tx = await pool.query("SELECT * FROM transactions WHERE id=$1", [req.params.id]);
    if (!tx.rows.length) return res.status(404).json({ message:"Not found" });
    const t = tx.rows[0];
    await pool.query("UPDATE transactions SET status='approved' WHERE id=$1", [req.params.id]);
    if (t.type==="deposit") {
      const plans = { bronze:{roi:20,days:15}, silver:{roi:35,days:30}, gold:{roi:50,days:60}, platinum:{roi:60,days:90} };
      const plan = plans[t.plan_name?.toLowerCase()] || {roi:20,days:15};
      await pool.query("INSERT INTO investments (user_id,plan_name,amount,roi_percent,duration_days,status,start_date,end_date) VALUES ($1,$2,$3,$4,$5,'active',NOW(),NOW()+INTERVAL '"+plan.days+" days')", [t.user_id,t.plan_name,t.amount,plan.roi,plan.days]);
      await pool.query("UPDATE users SET current_plan=$1 WHERE id=$2", [t.plan_name, t.user_id]);
      const refUser = await pool.query("SELECT referred_by FROM users WHERE id=$1", [t.user_id]);
      if (refUser.rows[0]?.referred_by) {
        const commission = parseFloat(t.amount)*0.05;
        await pool.query("UPDATE users SET referral_earnings=referral_earnings+$1 WHERE id=$2", [commission, refUser.rows[0].referred_by]);
        await pool.query("INSERT INTO referral_earnings (user_id,from_user_id,amount,status) VALUES ($1,$2,$3,'paid')", [refUser.rows[0].referred_by, t.user_id, commission]);
      }
    } else if (t.type==="withdrawal") {
      await pool.query("UPDATE users SET balance=GREATEST(balance-$1,0) WHERE id=$2", [t.amount, t.user_id]);
    }
    const user = await pool.query("SELECT email,full_name FROM users WHERE id=$1", [t.user_id]);
    try { await sendEmail(user.rows[0].email, t.type==="deposit"?"Deposit Confirmed!":"Withdrawal Processed!", "<p>Hi "+user.rows[0].full_name+",</p><p>Your "+t.type+" of $"+Number(t.amount).toLocaleString()+" has been processed.</p>"); } catch(e) {}
    res.json({ message:"Approved" });
  } catch (err) { console.error(err); res.status(500).json({ message:"Server error" }); }
});

router.post("/transactions/:id/reject", auth, adminAuth, async (req, res) => {
  try { await pool.query("UPDATE transactions SET status='rejected' WHERE id=$1", [req.params.id]); res.json({ message:"Rejected" }); }
  catch (err) { res.status(500).json({ message:"Server error" }); }
});

router.get("/wallets", auth, adminAuth, async (req, res) => {
  try { const r = await pool.query("SELECT * FROM wallet_addresses ORDER BY created_at DESC"); res.json({ wallets: r.rows }); }
  catch (err) { res.status(500).json({ message:"Server error" }); }
});

router.post("/wallets", auth, adminAuth, async (req, res) => {
  const { method, label, address, network } = req.body;
  if (!method||!address) return res.status(400).json({ message:"Method and address required" });
  try {
    const r = await pool.query("INSERT INTO wallet_addresses (method,label,address,network,is_active,created_at) VALUES ($1,$2,$3,$4,true,NOW()) RETURNING *", [method, label||method, address, network||""]);
    res.status(201).json({ message:"Wallet added", wallet: r.rows[0] });
  } catch (err) { console.error(err); res.status(500).json({ message:"Server error" }); }
});

router.put("/wallets/:id", auth, adminAuth, async (req, res) => {
  const { label, address, network, is_active } = req.body;
  try { await pool.query("UPDATE wallet_addresses SET label=$1,address=$2,network=$3,is_active=$4 WHERE id=$5", [label,address,network,is_active,req.params.id]); res.json({ message:"Updated" }); }
  catch (err) { res.status(500).json({ message:"Server error" }); }
});

router.delete("/wallets/:id", auth, adminAuth, async (req, res) => {
  try { await pool.query("DELETE FROM wallet_addresses WHERE id=$1", [req.params.id]); res.json({ message:"Deleted" }); }
  catch (err) { res.status(500).json({ message:"Server error" }); }
});

router.post("/run-roi", auth, adminAuth, async (req, res) => {
  try {
    const investments = await pool.query("SELECT * FROM investments WHERE status='active' AND end_date>NOW()");
    let credited = 0;
    for (const inv of investments.rows) {
      const dailyROI = (parseFloat(inv.amount)*(inv.roi_percent/100))/inv.duration_days;
      await pool.query("UPDATE users SET total_profit=total_profit+$1 WHERE id=$2", [dailyROI, inv.user_id]);
      await pool.query("INSERT INTO transactions (user_id,type,amount,plan_name,status,reference,created_at) VALUES ($1,'profit',$2,$3,'completed',$4,NOW())", [inv.user_id, dailyROI, inv.plan_name, "ROI-"+Date.now()]);
      credited++;
    }
    await pool.query("UPDATE investments SET status='completed' WHERE status='active' AND end_date<=NOW()");
    res.json({ message:"ROI credited to "+credited+" investments." });
  } catch (err) { console.error(err); res.status(500).json({ message:"Server error" }); }
});


// GET /api/admin/kyc - Get all pending KYC
router.get("/kyc", auth, adminAuth, async (req, res) => {
  try {
    await pool.query(`CREATE TABLE IF NOT EXISTS kyc_documents (
      id SERIAL PRIMARY KEY, user_id INTEGER NOT NULL, document_type TEXT,
      document_data TEXT, selfie_data TEXT, status TEXT DEFAULT 'pending',
      submitted_at TIMESTAMPTZ DEFAULT NOW(), reviewed_at TIMESTAMPTZ, note TEXT
    )`);
    const r = await pool.query(`
      SELECT k.*, u.full_name, u.email FROM kyc_documents k
      JOIN users u ON u.id=k.user_id
      ORDER BY k.submitted_at DESC
    `);
    res.json({ kyc: r.rows });
  } catch(err) { res.status(500).json({ message: "Server error" }); }
});

// POST /api/admin/kyc/:id/approve
router.post("/kyc/:id/approve", auth, adminAuth, async (req, res) => {
  try {
    const k = await pool.query("UPDATE kyc_documents SET status='approved', reviewed_at=NOW() WHERE id=$1 RETURNING user_id", [req.params.id]);
    if (!k.rows.length) return res.status(404).json({ message: "Not found" });
    await pool.query("UPDATE users SET kyc_status='verified' WHERE id=$1", [k.rows[0].user_id]);
    try {
      const u = await pool.query("SELECT email, full_name FROM users WHERE id=$1", [k.rows[0].user_id]);
      if (u.rows.length) await sendEmail(u.rows[0].email, "KYC Verified - Full Access Unlocked ✅",
        "<h2 style='color:#22c55e'>KYC Verified!</h2><p>Hi " + u.rows[0].full_name + ", your identity has been verified. You now have full access to all NexVault features including unlimited withdrawals.</p><a href='https://nexvault.org/dashboard' style='display:inline-block;padding:12px 24px;background:#f59e0b;color:#010208;font-weight:700;text-decoration:none;border-radius:2px;margin-top:16px'>Go to Dashboard</a>"
      );
    } catch(e) {}
    res.json({ message: "KYC approved" });
  } catch(err) { res.status(500).json({ message: "Server error" }); }
});

// POST /api/admin/kyc/:id/reject
router.post("/kyc/:id/reject", auth, adminAuth, async (req, res) => {
  const { note } = req.body;
  try {
    const k = await pool.query("UPDATE kyc_documents SET status='rejected', reviewed_at=NOW(), note=$1 WHERE id=$2 RETURNING user_id", [note||'', req.params.id]);
    if (!k.rows.length) return res.status(404).json({ message: "Not found" });
    await pool.query("UPDATE users SET kyc_status='rejected' WHERE id=$1", [k.rows[0].user_id]);
    res.json({ message: "KYC rejected" });
  } catch(err) { res.status(500).json({ message: "Server error" }); }
});

module.exports = router;
