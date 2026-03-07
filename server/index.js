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
const chatMessages = {};
const onlineAdmins = new Set();
const onlineUsers = new Map();
io.on("connection", (socket) => {
  let user = null;
  try { user = jwt.verify(socket.handshake.auth.token, JWT_SECRET); } catch(e) { socket.disconnect(); return; }
  socket.userId = user.id; socket.userRole = user.role; socket.userName = user.full_name || user.email;
  if (user.role === "admin") {
    onlineAdmins.add(socket.id); socket.join("admins");
    socket.emit("chat_list", Object.keys(chatMessages).map(uid => ({ userId: uid, messages: chatMessages[uid], unread: (chatMessages[uid]||[]).filter(m=>!m.read&&m.from!=="admin").length })));
  } else {
    onlineUsers.set(String(user.id), socket.id); socket.join("user_"+user.id);
    if (!chatMessages[user.id]) chatMessages[user.id] = [];
    socket.emit("chat_history", chatMessages[user.id]);
    io.to("admins").emit("user_online", { userId: user.id, name: socket.userName });
  }
  socket.on("user_message", (data) => {
    if (!user || user.role === "admin") return;
    const msg = { id: Date.now(), from: "user", userId: user.id, userName: socket.userName, text: data.text, time: new Date().toISOString(), read: false };
    if (!chatMessages[user.id]) chatMessages[user.id] = [];
    chatMessages[user.id].push(msg);
    io.to("admins").emit("new_message", { userId: user.id, userName: socket.userName, message: msg });
  });
  socket.on("admin_message", (data) => {
    if (!user || user.role !== "admin") return;
    const msg = { id: Date.now(), from: "admin", text: data.text, time: new Date().toISOString(), read: true };
    if (!chatMessages[data.userId]) chatMessages[data.userId] = [];
    chatMessages[data.userId].push(msg);
    io.to("user_"+data.userId).emit("admin_reply", msg);
    socket.emit("message_sent", { userId: data.userId, message: msg });
  });
  socket.on("mark_read", (data) => { if (chatMessages[data.userId]) chatMessages[data.userId].forEach(m=>{ if(m.from!=="admin") m.read=true; }); });
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
app.get("/health", (req,res) => res.json({ status:"ok" }));
server.listen(PORT, () => console.log("NexVault on port "+PORT));
