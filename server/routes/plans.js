const router = require("express").Router();
const db     = require("../db/db");

router.get("/", async (req, res) => {
  try {
    const r = await db.query("SELECT * FROM plans WHERE active=true ORDER BY min_amount");
    res.json(r.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
