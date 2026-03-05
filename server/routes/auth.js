const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt    = require("jsonwebtoken");
const db     = require("../db/db");

router.post("/register", async (req, res) => {
  try {
    const { name, email, password, country, phone } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ error: "Name, email and password required" });
    const exists = await db.query("SELECT id FROM users WHERE email=$1", [email]);
    if (exists.rows.length)
      return res.status(400).json({ error: "Email already registered" });
    const hash   = await bcrypt.hash(password, 12);
    const result = await db.query(
      "INSERT INTO users (name,email,password,country,phone) VALUES ($1,$2,$3,$4,$5) RETURNING id,name,email,role,balance,plan",
      [name, email, hash, country, phone]
    );
    const user  = result.rows[0];
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.json({ token, user });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await db.query("SELECT * FROM users WHERE email=$1", [email]);
    const user   = result.rows[0];
    if (!user)                       return res.status(400).json({ error: "Invalid credentials" });
    if (user.status === "suspended") return res.status(403).json({ error: "Account suspended" });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ error: "Invalid credentials" });
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });
    const { password: _, ...safeUser } = user;
    res.json({ token, user: safeUser });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
