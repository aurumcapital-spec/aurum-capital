const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { pool } = require("../db");
const { sendEmail } = require("../utils/email");

const JWT_SECRET = process.env.JWT_SECRET || "nexvault_secret_2030";

// REGISTER
router.post("/register", async (req, res) => {
  const { full_name, email, password, phone, country, referral_code } = req.body;
  if (!email || !password || !full_name) return res.status(400).json({ message: "Name, email and password required." });
  if (password.length < 8) return res.status(400).json({ message: "Password must be at least 8 characters." });

  try {
    const exists = await pool.query("SELECT id FROM users WHERE email = $1", [email.toLowerCase()]);
    if (exists.rows.length) return res.status(409).json({ message: "Email already registered." });

    const hashed = await bcrypt.hash(password, 12);
    const myRefCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    // Handle referral
    let referredBy = null;
    if (referral_code) {
      const refUser = await pool.query("SELECT id FROM users WHERE referral_code = $1", [referral_code.toUpperCase()]);
      if (refUser.rows.length) referredBy = refUser.rows[0].id;
    }

    const result = await pool.query(
      `INSERT INTO users (full_name, email, password_hash, phone, country, referral_code, referred_by, balance, total_profit, is_active, kyc_status, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,0,0,true,'unverified',NOW()) RETURNING id, full_name, email, referral_code`,
      [full_name, email.toLowerCase(), hashed, phone || null, country || null, myRefCode, referredBy]
    );
    const user = result.rows[0];

    const token = jwt.sign({ id: user.id, email: user.email, role: "user" }, JWT_SECRET, { expiresIn: "7d" });

    // Welcome email (non-blocking)
    setImmediate(() => {
      sendEmail(user.email, "Welcome to NexVault! Your Vault is Ready 🏦",
        "<h2 style='color:#fbbf24'>Welcome to NexVault, " + full_name + "!</h2>" +
        "<p style='color:#94a3b8'>Your vault has been created successfully. Start investing and growing your wealth today.</p>" +
        "<div style='padding:16px;background:rgba(14,165,233,0.05);border:1px solid rgba(14,165,233,0.15);border-radius:4px;margin:20px 0'>" +
        "<div style='font-size:0.7rem;color:#94a3b8;margin-bottom:4px'>YOUR REFERRAL CODE</div>" +
        "<div style='font-family:monospace;font-size:1.2rem;color:#38bdf8;font-weight:700'>" + myRefCode + "</div>" +
        "<div style='font-size:0.75rem;color:#94a3b8;margin-top:4px'>Share to earn 5% on every referral deposit</div></div>" +
        "<a href='https://nexvault.org/dashboard' style='display:inline-block;padding:12px 24px;background:#f59e0b;color:#010208;font-weight:700;text-decoration:none;border-radius:2px;margin-top:16px'>Launch Your Vault</a>"
      ).then(() => console.log("[EMAIL] Welcome sent to", user.email))
       .catch(e => console.log("[EMAIL ERROR] Welcome:", e.message));
    });

    res.status(201).json({ token, user: { id: user.id, full_name: user.full_name, email: user.email, referral_code: user.referral_code } });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Server error. Please try again." });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: "Email and password required." });

  try {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email.toLowerCase()]);
    if (!result.rows.length) return res.status(401).json({ message: "Invalid email or password." });

    const user = result.rows[0];
    if (!user.is_active) return res.status(403).json({ message: "Account suspended. Contact support." });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ message: "Invalid email or password." });

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role || "user" }, JWT_SECRET, { expiresIn: "7d" });

    // Send login alert email
    try {
      const loginTime = new Date().toLocaleString('en-US', { timeZone: 'UTC' }) + ' UTC';
      const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'Unknown';
      await sendEmail(user.email, "New Login Detected - NexVault 🔐",
        "<h2 style='color:#38bdf8'>Security Alert</h2><p>Hi " + user.full_name + ", a new login was detected on your NexVault account.</p><p style='color:#94a3b8'>Time: " + loginTime + "<br/>If this wasn't you, contact support@nexvault.org immediately.</p>"
      );
    } catch(e) {}
    res.json({
      token,
      user: {
        id: user.id, full_name: user.full_name, email: user.email,
        balance: user.balance, total_profit: user.total_profit,
        plan: user.current_plan, referral_code: user.referral_code,
        kyc_status: user.kyc_status
      }
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error. Please try again." });
  }
});

// VERIFY TOKEN
router.get("/verify", async (req, res) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ valid: false });
  try {
    const decoded = jwt.verify(auth.split(" ")[1], JWT_SECRET);
    res.json({ valid: true, user: decoded });
  } catch {
    res.status(401).json({ valid: false });
  }
});


// GOOGLE OAUTH
router.get("/google", (req, res) => {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: process.env.APP_URL + "/auth/google/callback",
    response_type: "code",
    scope: "openid email profile",
    access_type: "offline",
    prompt: "select_account"
  });
  res.redirect("https://accounts.google.com/o/oauth2/v2/auth?" + params);
});

router.get("/google/callback", async (req, res) => {
  const { code } = req.query;
  if (!code) return res.redirect("/login?error=google_failed");
  try {
    // Exchange code for tokens
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: process.env.APP_URL + "/auth/google/callback",
        grant_type: "authorization_code"
      })
    });
    const tokens = await tokenRes.json();
    if (!tokens.access_token) return res.redirect("/login?error=google_failed");

    // Get user info
    const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: "Bearer " + tokens.access_token }
    });
    const gUser = await userRes.json();
    if (!gUser.email) return res.redirect("/login?error=google_failed");

    // Check if user exists
    let user = await pool.query("SELECT * FROM users WHERE email=$1", [gUser.email.toLowerCase()]);
    
    if (!user.rows.length) {
      // Register new user
      const myRefCode = Math.random().toString(36).substring(2,8).toUpperCase();
      const result = await pool.query(
        `INSERT INTO users (full_name, email, password_hash, referral_code, balance, total_profit, is_active, kyc_status, created_at)
         VALUES ($1,$2,$3,$4,0,0,true,'unverified',NOW()) RETURNING *`,
        [gUser.name || gUser.email.split("@")[0], gUser.email.toLowerCase(), "GOOGLE_AUTH_" + gUser.id, myRefCode]
      );
      user = { rows: [result.rows[0]] };
    }

    const u = user.rows[0];
    if (!u.is_active) return res.redirect("/login?error=account_suspended");

    const token = jwt.sign({ id: u.id, email: u.email, role: u.role || "user" }, JWT_SECRET, { expiresIn: "7d" });
    
    // Redirect to dashboard with token
    res.send(`<!DOCTYPE html><html><head><script>
      localStorage.setItem('nexvault_token', '${token}');
      window.location.href = '/dashboard';
    </script></head><body>Redirecting...</body></html>`);
  } catch(err) {
    console.error("Google OAuth error:", err);
    res.redirect("/login?error=google_failed");
  }
});

module.exports = router;
