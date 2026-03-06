require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: process.env.FRONTEND_URL || "*" }));
app.use(express.json());
app.use("/api/auth", rateLimit({ windowMs: 15 * 60 * 1000, max: 20 }));

app.use("/api/auth",         require("./routes/auth"));
app.use("/api/users",        require("./routes/users"));
app.use("/api/transactions", require("./routes/transactions"));
app.use("/api/plans",        require("./routes/plans"));
app.use("/api/admin",        require("./routes/admin"));

const fs = require("fs");
const landingPath = path.join(__dirname, "public/landing.html");

app.get("/", (req, res) => {
  res.sendFile(landingPath);
});

app.get("/health", (req, res) => res.json({ status: "ok", time: new Date() }));
app.listen(PORT, () => console.log("API running on port " + PORT));