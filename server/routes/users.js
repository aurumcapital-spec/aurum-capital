// ============================================================
// routes/users.js
// ============================================================
const express = require("express");
const router = express.Router();
const { pool } = require("../db");
const { auth } = require("../middleware/auth");

// GET /api/users/me
router.get("/me", auth, async (req, res) => {
  try {
    const r = await pool.query(`
      SELECT u.*, 
        COALESCE(SUM(CASE WHEN t.type='deposit' AND t.status='approved' THEN t.amount ELSE 0 END),0) as total_deposited,
        (SELECT COUNT(*) FROM users WHERE referred_by = u.id) as referral_count,
        (SELECT COALESCE(SUM(amount),0) FROM referral_earnings WHERE user_id = u.id AND status='paid') as referral_earnings,
        (SELECT COALESCE(SUM(amount),0) FROM referral_earnings WHERE user_id = u.id AND status='pending') as referral_pending,
        (SELECT amount FROM investments WHERE user_id = u.id AND status='active' LIMIT 1) as active_investment,
        (SELECT plan_name FROM investments WHERE user_id = u.id AND status='active' LIMIT 1) as plan,
        (SELECT roi_percent FROM investments WHERE user_id = u.id AND status='active' LIMIT 1) as plan_roi,
        (SELECT duration_days FROM investments WHERE user_id = u.id AND status='active' LIMIT 1) as plan_duration,
        (SELECT EXTRACT(DAY FROM NOW()-start_date) FROM investments WHERE user_id = u.id AND status='active' LIMIT 1) as days_elapsed,
        (SELECT COUNT(*)>0 FROM investments WHERE user_id = u.id AND status='active') as active_plan
      FROM users u
      LEFT JOIN transactions t ON t.user_id = u.id
      WHERE u.id = $1 GROUP BY u.id`, [req.user.id]);
    if (!r.rows.length) return res.status(404).json({ message: "User not found" });
    const user = r.rows[0];
    delete user.password_hash;
    res.json(user);
  } catch (err) { console.error(err); res.status(500).json({ message: "Server error" }); }
});

// PUT /api/users/profile
router.put("/profile", auth, async (req, res) => {
  const { full_name, phone, country } = req.body;
  try {
    await pool.query("UPDATE users SET full_name=$1, phone=$2, country=$3 WHERE id=$4", [full_name, phone, country, req.user.id]);
    res.json({ message: "Profile updated" });
  } catch (err) { res.status(500).json({ message: "Server error" }); }
});


// POST /api/users/kyc - Submit KYC documents
router.post("/kyc", auth, async (req, res) => {
  const { document_type, document_data, selfie_data } = req.body;
  if (!document_type || !document_data) return res.status(400).json({ message: "Document type and file required." });
  if (document_data.length > 5000000) return res.status(400).json({ message: "File too large. Max 3MB." });
  try {
    await pool.query(`CREATE TABLE IF NOT EXISTS kyc_documents (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL,
      document_type TEXT,
      document_data TEXT,
      selfie_data TEXT,
      status TEXT DEFAULT 'pending',
      submitted_at TIMESTAMPTZ DEFAULT NOW(),
      reviewed_at TIMESTAMPTZ,
      note TEXT
    )`);
    await pool.query("DELETE FROM kyc_documents WHERE user_id=$1", [req.user.id]);
    await pool.query(
      "INSERT INTO kyc_documents (user_id, document_type, document_data, selfie_data) VALUES ($1,$2,$3,$4)",
      [req.user.id, document_type, document_data, selfie_data||null]
    );
    await pool.query("UPDATE users SET kyc_status='pending' WHERE id=$1", [req.user.id]);
    res.json({ message: "KYC submitted successfully. Under review within 24hrs." });
  } catch(err) { console.error(err); res.status(500).json({ message: "Server error" }); }
});

// GET /api/users/kyc - Get KYC status
router.get("/kyc", auth, async (req, res) => {
  try {
    const r = await pool.query("SELECT status, document_type, submitted_at, note FROM kyc_documents WHERE user_id=$1 ORDER BY submitted_at DESC LIMIT 1", [req.user.id]);
    const user = await pool.query("SELECT kyc_status FROM users WHERE id=$1", [req.user.id]);
    res.json({ kyc_status: user.rows[0]?.kyc_status || 'unverified', submission: r.rows[0] || null });
  } catch(err) { res.status(500).json({ message: "Server error" }); }
});

module.exports = router;
