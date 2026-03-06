const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "nexvault_secret_2030";
const auth = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) return res.status(401).json({ message: "Unauthorized" });
  try { req.user = jwt.verify(header.split(" ")[1], JWT_SECRET); next(); }
  catch { res.status(401).json({ message: "Invalid or expired token" }); }
};
const adminAuth = (req, res, next) => {
  if (req.user.role !== "admin") return res.status(403).json({ message: "Admin access required" });
  next();
};
module.exports = { auth, adminAuth };
