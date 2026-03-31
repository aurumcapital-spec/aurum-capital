require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const path = require("path");
const jwt = require("jsonwebtoken");
const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });
const PORT = process.env.PORT || 8080;
const JWT_SECRET = process.env.JWT_SECRET || "nexvault_secret_2026";
app.set("trust proxy", 1);
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: "*" }));
app.use(express.json());
app.use("/api/auth", rateLimit({ windowMs: 15*60*1000, max: 20 }));
app.use("/api", rateLimit({ windowMs: 15*60*1000, max: 200 }));
app.use("/api/auth", require("./routes/auth"));
app.use("/api/users", require("./routes/users"));
app.use("/api/transactions", require("./routes/transactions"));
app.use("/api/admin", require("./routes/admin"));
app.use("/api/plans", require("./routes/plans"));
app.use("/api", require("./routes/setup"));
const { pool } = require("./db");
const onlineAdmins = new Set();
const onlineUsers = new Map();

// Ensure chat_messages table exists
pool.query(`CREATE TABLE IF NOT EXISTS chat_messages (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  user_name TEXT,
  from_role TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
)`).catch(e => console.error("Chat table error:", e));

async function getChatHistory(userId) {
  try {
    const r = await pool.query(
      "SELECT * FROM chat_messages WHERE user_id=$1 ORDER BY created_at ASC LIMIT 100",
      [userId]
    );
    return r.rows.map(row => ({
      id: row.id, from: row.from_role, userId: row.user_id,
      userName: row.user_name, text: row.message,
      time: row.created_at, read: row.is_read
    }));
  } catch(e) { return []; }
}

async function saveMessage(userId, userName, fromRole, text) {
  try {
    const r = await pool.query(
      "INSERT INTO chat_messages (user_id, user_name, from_role, message) VALUES ($1,$2,$3,$4) RETURNING *",
      [userId, userName, fromRole, text]
    );
    const row = r.rows[0];
    return { id: row.id, from: fromRole, userId, userName, text, time: row.created_at, read: false };
  } catch(e) { return { id: Date.now(), from: fromRole, userId, userName, text, time: new Date().toISOString(), read: false }; }
}

async function getAllChats() {
  try {
    const r = await pool.query(
      `SELECT DISTINCT ON (user_id) user_id, user_name FROM chat_messages WHERE from_role='user' ORDER BY user_id, created_at DESC`
    );
    const chats = [];
    for (const row of r.rows) {
      const msgs = await getChatHistory(row.user_id);
      const unread = msgs.filter(m => !m.read && m.from !== 'admin').length;
      chats.push({ userId: row.user_id, messages: msgs, unread });
    }
    return chats;
  } catch(e) { return []; }
}

io.on("connection", async (socket) => {
  let user = null;
  try { user = jwt.verify(socket.handshake.auth.token, JWT_SECRET); } catch(e) { socket.disconnect(); return; }
  socket.userId = user.id; socket.userRole = user.role; socket.userName = user.full_name || user.email;
  if (user.role === "admin") {
    onlineAdmins.add(socket.id); socket.join("admins");
    const chats = await getAllChats();
    socket.emit("chat_list", chats);
  } else {
    onlineUsers.set(String(user.id), socket.id); socket.join("user_"+user.id);
    const history = await getChatHistory(user.id);
    socket.emit("chat_history", history);
    io.to("admins").emit("user_online", { userId: user.id, name: socket.userName });
  }
  socket.on("user_message", async (data) => {
    if (!user || user.role === "admin") return;
    const msg = await saveMessage(user.id, socket.userName, "user", data.text);
    io.to("admins").emit("new_message", { userId: user.id, userName: socket.userName, message: msg });
  });
  socket.on("admin_message", async (data) => {
    if (!user || user.role !== "admin") return;
    const targetUser = await pool.query("SELECT full_name, email FROM users WHERE id=$1", [data.userId]).then(r=>r.rows[0]).catch(()=>null);
    const uName = targetUser ? (targetUser.full_name || targetUser.email) : "User #"+data.userId;
    const msg = await saveMessage(data.userId, uName, "admin", data.text);
    io.to("user_"+data.userId).emit("admin_reply", msg);
    socket.emit("message_sent", { userId: data.userId, message: msg });
  });
  socket.on("mark_read", async (data) => {
    try { await pool.query("UPDATE chat_messages SET is_read=true WHERE user_id=$1 AND from_role='user'", [data.userId]); } catch(e) {}
  });
  socket.on("disconnect", () => {
    onlineAdmins.delete(socket.id);
    if (user && user.role !== "admin") { onlineUsers.delete(String(user.id)); io.to("admins").emit("user_offline", { userId: user.id }); }
  });
});
app.get("/", (req,res) => res.sendFile(path.join(__dirname,"public","landing.html")));
app.get("/login", (req,res) => res.sendFile(path.join(__dirname,"public","login.html")));
app.get("/register", (req,res) => res.sendFile(path.join(__dirname,"public","register.html")));
app.get("/dashboard", (req,res) => res.sendFile(path.join(__dirname,"public","dashboard.html")));
app.get("/admin", (req,res) => res.sendFile(path.join(__dirname,"public","admin.html")));
app.use("/auth", require("./routes/auth"));
app.get("/health", (req,res) => res.json({ status:"ok" }));
server.listen(PORT, () => console.log("NexVault on port "+PORT));
// ─── AUTO ROI + INVESTMENT COMPLETION (runs every 24 hours) ───
async function runDailyROI() {
  try {
    console.log("[CRON] Running daily ROI...");
    // Complete expired investments first
    const expired = await pool.query(
      "UPDATE investments SET status='completed' WHERE status='active' AND end_date<=NOW() RETURNING user_id, plan_name, amount, roi_percent"
    );
    for (const inv of expired.rows) {
      await pool.query("UPDATE users SET current_plan=NULL WHERE id=$1 AND NOT EXISTS (SELECT 1 FROM investments WHERE user_id=$1 AND status='active')", [inv.user_id]);
      console.log("[CRON] Completed investment for user", inv.user_id);
    }

    // Credit daily ROI to active investments
    const investments = await pool.query(
      "SELECT * FROM investments WHERE status='active' AND end_date>NOW()"
    );
    let credited = 0;
    for (const inv of investments.rows) {
      const dailyROI = (parseFloat(inv.amount) * (inv.roi_percent / 100)) / inv.duration_days;
      await pool.query("UPDATE users SET balance=balance+$1, total_profit=total_profit+$1 WHERE id=$2", [dailyROI, inv.user_id]);
      await pool.query(
        "INSERT INTO transactions (user_id,type,amount,plan_name,status,reference,created_at) VALUES ($1,'profit',$2,$3,'completed',$4,NOW())",
        [inv.user_id, dailyROI, inv.plan_name, "ROI-AUTO-" + Date.now()]
      );
      credited++;
    }
    console.log("[CRON] ROI credited to", credited, "investments.");
  } catch(e) { console.error("[CRON] ROI error:", e.message); }
}

// Run immediately on startup, then every 24 hours
runDailyROI();
setInterval(runDailyROI, 24 * 60 * 60 * 1000);

