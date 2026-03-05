const router = require("express").Router();
const db     = require("../db/db");
const auth   = require("../middleware/auth");
const admin  = require("../middleware/admin");

router.use(auth, admin);

router.get("/users", async (req, res) => {
  try {
    const r = await db.query(
      "SELECT id,name,email,balance,profit,plan,role,status,country,created_at FROM users ORDER BY created_at DESC"
    );
    res.json(r.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.patch("/users/:id/balance", async (req, res) => {
  try {
    const { balance } = req.body;
    await db.query("UPDATE users SET balance=$1 WHERE id=$2", [balance, req.params.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.patch("/users/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    await db.query("UPDATE users SET status=$1 WHERE id=$2", [status, req.params.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get("/transactions", async (req, res) => {
  try {
    const r = await db.query(
      `SELECT t.*,u.name AS user_name,u.email AS user_email
       FROM transactions t JOIN users u ON t.user_id=u.id
       ORDER BY t.created_at DESC`
    );
    res.json(r.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.patch("/transactions/:id", async (req, res) => {
  try {
    const { status } = req.body;
    const tx = await db.query("SELECT * FROM transactions WHERE id=$1", [req.params.id]);
    const t  = tx.rows[0];
    if (!t) return res.status(404).json({ error: "Not found" });
    await db.query("UPDATE transactions SET status=$1 WHERE id=$2", [status, req.params.id]);
    if (status === "approved" && t.type === "deposit")
      await db.query("UPDATE users SET balance=balance+$1 WHERE id=$2", [t.amount, t.user_id]);
    if (status === "approved" && t.type === "withdrawal")
      await db.query("UPDATE users SET balance=balance-$1 WHERE id=$2", [t.amount, t.user_id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post("/plans", async (req, res) => {
  try {
    const { name, roi_percent, duration, min_amount, max_amount } = req.body;
    const r = await db.query(
      "INSERT INTO plans (name,roi_percent,duration,min_amount,max_amount) VALUES ($1,$2,$3,$4,$5) RETURNING *",
      [name, roi_percent, duration, min_amount, max_amount]
    );
    res.json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put("/plans/:id", async (req, res) => {
  try {
    const { name, roi_percent, duration, min_amount, max_amount, active } = req.body;
    await db.query(
      "UPDATE plans SET name=$1,roi_percent=$2,duration=$3,min_amount=$4,max_amount=$5,active=$6 WHERE id=$7",
      [name, roi_percent, duration, min_amount, max_amount, active, req.params.id]
    );
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get("/stats", async (req, res) => {
  try {
    const [users, txs, aum] = await Promise.all([
      db.query("SELECT COUNT(*) AS total, COUNT(CASE WHEN status='active' THEN 1 END) AS active FROM users"),
      db.query("SELECT COUNT(*) AS pending FROM transactions WHERE status='pending'"),
      db.query("SELECT COALESCE(SUM(balance),0) AS total_aum FROM users"),
    ]);
    res.json({
      totalUsers:  users.rows[0].total,
      activeUsers: users.rows[0].active,
      pendingTxs:  txs.rows[0].pending,
      totalAUM:    aum.rows[0].total_aum,
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
