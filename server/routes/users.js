const router = require("express").Router();
const db     = require("../db/db");
const auth   = require("../middleware/auth");

router.get("/me", auth, async (req, res) => {
  try {
    const r = await db.query(
      "SELECT id,name,email,balance,profit,plan,status,country,phone,created_at FROM users WHERE id=$1",
      [req.user.id]
    );
    res.json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put("/me", auth, async (req, res) => {
  try {
    const { name, phone, country } = req.body;
    await db.query("UPDATE users SET name=$1,phone=$2,country=$3 WHERE id=$4",
      [name, phone, country, req.user.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
