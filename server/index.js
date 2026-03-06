require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 8080;

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: process.env.FRONTEND_URL || "*" }));
app.use(express.json());

// Rate limiting
app.use("/api/auth", rateLimit({ windowMs: 15 * 60 * 1000, max: 20, message: { message: "Too many requests, try again later." } }));

// API Routes
app.use("/api/auth",         require("./routes/auth"));
app.use("/api/users",        require("./routes/users"));
app.use("/api/transactions", require("./routes/transactions"));
app.use("/api/plans",        require("./routes/plans"));
app.use("/api/admin",        require("./routes/admin"));

// Serve HTML pages
const pub = (file) => (req, res) => res.sendFile(path.join(__dirname, "public", file));
app.get("/",          pub("landing.html"));
app.get("/login",     pub("login.html"));
app.get("/register",  pub("register.html"));
app.get("/dashboard", pub("dashboard.html"));
app.get("/admin",     pub("admin.html"));

app.get("/health", (req, res) => res.json({ status: "ok", time: new Date() }));

app.listen(PORT, () => console.log(`API running on port ${PORT}`));

