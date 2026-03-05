const router = require("express").Router();
const db     = require("../db/db");
const auth   = require("../middleware/auth");

router.get("/", auth, async (req, res) => {
  try {
    const r = await db.query(
      "SELECT * FROM transactions WHERE user_id=$1 ORDER BY created_at DESC",
      [req.user.id]
    );
    res.json(r.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post("/deposit", auth, async (req, res) => {
  try {
    const { amount, method } = req.body;
    if (!amount || amount <= 0)
      return res.status(400).json({ error: "Invalid amount" });
    const r = await db.query(
      "INSERT INTO transactions (user_id,type,amount,method) VALUES ($1,'deposit',$2,$3) RETURNING *",
      [req.user.id, amount, method]
    );
    res.json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post("/withdraw", auth, async (req, res) => {
  try {
    const { amount, method } = req.body;
    const u = await db.query("SELECT balance FROM users WHERE id=$1", [req.user.id]);
    if (u.rows[0].balance < amount)
      return res.status(400).json({ error: "Insufficient balance" });
    const r = await db.query(
      "INSERT INTO transactions (user_id,type,amount,method) VALUES ($1,'withdrawal',$2,$3) RETURNING *",
      [req.user.id, amount, method]
    );
    res.json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
