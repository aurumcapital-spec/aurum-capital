const nodemailer = require("nodemailer");
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "mail.privateemail.com",
  port: parseInt(process.env.SMTP_PORT || "465"),
  secure: process.env.SMTP_PORT === "465" || process.env.SMTP_SECURE === "true",
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 15000,
});

const wrap = (body) => `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#010208;color:#f0f9ff;border:1px solid rgba(14,165,233,0.2)">
  <div style="padding:24px 32px;border-bottom:1px solid rgba(14,165,233,0.15);background:rgba(14,165,233,0.03)">
    <span style="font-family:monospace;font-size:1.4rem;font-weight:900"><span style="color:#38bdf8">NEX</span><span style="color:#fbbf24">VAULT</span></span>
  </div>
  <div style="padding:32px">${body}</div>
  <div style="padding:20px 32px;border-top:1px solid rgba(14,165,233,0.1);font-size:0.75rem;color:#94a3b8;text-align:center">
    © 2026 NexVault · <a href="https://nexvault.org" style="color:#38bdf8;text-decoration:none">nexvault.org</a> · support@nexvault.org
  </div>
</div>`;

const btn = (text, url) => `<a href="${url}" style="display:inline-block;padding:12px 28px;background:linear-gradient(135deg,#f59e0b,#fbbf24);color:#010208;font-weight:700;font-family:monospace;font-size:0.85rem;text-decoration:none;border-radius:2px;margin-top:16px">${text}</a>`;

const sendEmail = async (to, subject, htmlBody) => {
  if (!process.env.SMTP_USER) { console.log(`[EMAIL SKIPPED] To: ${to} | Subject: ${subject}`); return; }
  try {
    await transporter.sendMail({
      from: `"NexVault" <${process.env.SMTP_USER}>`, to, subject,
      html: wrap(htmlBody)
    });
    console.log(`[EMAIL SENT] To: ${to} | Subject: ${subject}`);
  } catch(e) { console.error(`[EMAIL ERROR] ${e.message}`); }
};

// ── EMAIL TEMPLATES ──────────────────────────────────────────

const emails = {

  welcome: (name, refCode) => sendEmail(
    null, "Welcome to NexVault! Your Vault is Ready 🏦",
    `<h2 style="color:#fbbf24;margin:0 0 16px">Welcome, ${name}! 🎉</h2>
    <p style="color:#94a3b8;line-height:1.8">Your NexVault account has been created successfully. You now have access to our next-generation wealth vault platform.</p>
    <div style="padding:16px;background:rgba(14,165,233,0.05);border:1px solid rgba(14,165,233,0.15);border-radius:4px;margin:20px 0">
      <div style="font-size:0.7rem;color:#94a3b8;margin-bottom:4px">YOUR REFERRAL CODE</div>
      <div style="font-family:monospace;font-size:1.2rem;color:#38bdf8;font-weight:700">${refCode}</div>
      <div style="font-size:0.75rem;color:#94a3b8;margin-top:4px">Share to earn 5% on every referral deposit</div>
    </div>
    ${btn("Launch Your Vault", "https://nexvault.org/dashboard")}`
  ),

  loginAlert: (name, time, ip) => sendEmail(
    null, "New Login Detected - NexVault 🔐",
    `<h2 style="color:#38bdf8;margin:0 0 16px">Security Alert</h2>
    <p style="color:#94a3b8">Hi ${name}, a new login was detected on your NexVault account.</p>
    <div style="padding:16px;background:rgba(239,68,68,0.05);border:1px solid rgba(239,68,68,0.2);border-radius:4px;margin:20px 0">
      <div style="margin-bottom:8px"><span style="color:#94a3b8;font-size:0.7rem">TIME: </span><span style="font-family:monospace;color:#f0f9ff">${time}</span></div>
      <div><span style="color:#94a3b8;font-size:0.7rem">IP: </span><span style="font-family:monospace;color:#f0f9ff">${ip}</span></div>
    </div>
    <p style="color:#94a3b8;font-size:0.85rem">If this wasn't you, contact support immediately at support@nexvault.org</p>`
  ),

  depositReceived: (name, amount, plan, method) => sendEmail(
    null, `Deposit Received - $${amount} | NexVault`,
    `<h2 style="color:#fbbf24;margin:0 0 16px">Deposit Received ✅</h2>
    <p style="color:#94a3b8">Hi ${name}, we have received your deposit and it is currently under review.</p>
    <div style="padding:16px;background:rgba(245,158,11,0.05);border:1px solid rgba(245,158,11,0.2);border-radius:4px;margin:20px 0">
      <div style="display:flex;justify-content:space-between;margin-bottom:8px"><span style="color:#94a3b8;font-size:0.7rem">AMOUNT</span><span style="color:#fbbf24;font-weight:700;font-family:monospace">$${Number(amount).toLocaleString()}</span></div>
      <div style="display:flex;justify-content:space-between;margin-bottom:8px"><span style="color:#94a3b8;font-size:0.7rem">PLAN</span><span style="color:#f0f9ff;font-family:monospace">${plan} VAULT</span></div>
      <div style="display:flex;justify-content:space-between"><span style="color:#94a3b8;font-size:0.7rem">METHOD</span><span style="color:#f0f9ff;font-family:monospace">${method}</span></div>
    </div>
    <p style="color:#94a3b8;font-size:0.85rem">⏳ Admin verification takes up to 24 hours. You will receive another email once approved.</p>
    ${btn("View Dashboard", "https://nexvault.org/dashboard")}`
  ),

  depositApproved: (name, amount, plan, roi, days) => sendEmail(
    null, `Deposit Approved - Your Investment is Active! 🚀`,
    `<h2 style="color:#22c55e;margin:0 0 16px">Investment Activated! 🚀</h2>
    <p style="color:#94a3b8">Hi ${name}, your deposit has been approved and your investment is now active.</p>
    <div style="padding:16px;background:rgba(34,197,94,0.05);border:1px solid rgba(34,197,94,0.2);border-radius:4px;margin:20px 0">
      <div style="display:flex;justify-content:space-between;margin-bottom:8px"><span style="color:#94a3b8;font-size:0.7rem">INVESTED</span><span style="color:#fbbf24;font-weight:700;font-family:monospace">$${Number(amount).toLocaleString()}</span></div>
      <div style="display:flex;justify-content:space-between;margin-bottom:8px"><span style="color:#94a3b8;font-size:0.7rem">PLAN</span><span style="color:#f0f9ff;font-family:monospace">${plan} VAULT</span></div>
      <div style="display:flex;justify-content:space-between;margin-bottom:8px"><span style="color:#94a3b8;font-size:0.7rem">ROI</span><span style="color:#22c55e;font-family:monospace">${roi}%</span></div>
      <div style="display:flex;justify-content:space-between;margin-bottom:8px"><span style="color:#94a3b8;font-size:0.7rem">DURATION</span><span style="color:#f0f9ff;font-family:monospace">${days} days</span></div>
      <div style="display:flex;justify-content:space-between"><span style="color:#94a3b8;font-size:0.7rem">EXPECTED RETURN</span><span style="color:#22c55e;font-weight:700;font-family:monospace">$${(Number(amount)*(1+roi/100)).toLocaleString()}</span></div>
    </div>
    ${btn("Track Your Investment", "https://nexvault.org/dashboard")}`
  ),

  withdrawalApproved: (name, amount, method, address) => sendEmail(
    null, `Withdrawal Approved - $${amount} Sent 💸`,
    `<h2 style="color:#22c55e;margin:0 0 16px">Withdrawal Approved 💸</h2>
    <p style="color:#94a3b8">Hi ${name}, your withdrawal request has been approved and processed.</p>
    <div style="padding:16px;background:rgba(34,197,94,0.05);border:1px solid rgba(34,197,94,0.2);border-radius:4px;margin:20px 0">
      <div style="display:flex;justify-content:space-between;margin-bottom:8px"><span style="color:#94a3b8;font-size:0.7rem">AMOUNT</span><span style="color:#fbbf24;font-weight:700;font-family:monospace">$${Number(amount).toLocaleString()}</span></div>
      <div style="display:flex;justify-content:space-between;margin-bottom:8px"><span style="color:#94a3b8;font-size:0.7rem">METHOD</span><span style="color:#f0f9ff;font-family:monospace">${method}</span></div>
      <div style="display:flex;justify-content:space-between"><span style="color:#94a3b8;font-size:0.7rem">ADDRESS</span><span style="color:#38bdf8;font-family:monospace;font-size:0.75rem">${String(address).substring(0,20)}...</span></div>
    </div>
    <p style="color:#94a3b8;font-size:0.85rem">Funds should arrive within 1-24 hours depending on network congestion.</p>`
  ),

  kycApproved: (name) => sendEmail(
    null, "KYC Verified - Full Access Unlocked ✅",
    `<h2 style="color:#22c55e;margin:0 0 16px">KYC Verified! ✅</h2>
    <p style="color:#94a3b8">Hi ${name}, your identity has been verified successfully. You now have full access to all NexVault features.</p>
    <div style="padding:16px;background:rgba(34,197,94,0.05);border:1px solid rgba(34,197,94,0.2);border-radius:4px;margin:20px 0">
      <div style="color:#22c55e;font-family:monospace">✓ Unlimited withdrawals unlocked</div>
      <div style="color:#22c55e;font-family:monospace;margin-top:8px">✓ Higher investment tiers available</div>
      <div style="color:#22c55e;font-family:monospace;margin-top:8px">✓ Priority support access</div>
    </div>
    ${btn("Go to Dashboard", "https://nexvault.org/dashboard")}`
  ),

  kycRejected: (name, reason) => sendEmail(
    null, "KYC Review Update - Action Required",
    `<h2 style="color:#ef4444;margin:0 0 16px">KYC Update Required</h2>
    <p style="color:#94a3b8">Hi ${name}, your KYC submission needs attention.</p>
    <div style="padding:16px;background:rgba(239,68,68,0.05);border:1px solid rgba(239,68,68,0.2);border-radius:4px;margin:20px 0">
      <div style="font-size:0.7rem;color:#94a3b8;margin-bottom:8px">REASON</div>
      <div style="color:#f0f9ff">${reason || "Document unclear or incomplete. Please resubmit."}</div>
    </div>
    <p style="color:#94a3b8;font-size:0.85rem">Please resubmit your KYC documents from your profile page.</p>
    ${btn("Resubmit KYC", "https://nexvault.org/dashboard")}`
  ),

};

// Helper to send to specific user email
const sendTo = (email, templateFn, ...args) => {
  const emailFn = emails[templateFn];
  if (!emailFn) return;
  const promise = emailFn(...args);
  // Inject the recipient email
  return sendEmail(email, ...args);
};

module.exports = { sendEmail, emails };
