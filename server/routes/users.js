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

module.exports = router;
