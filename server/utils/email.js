const https = require("https");

// ── MASTER EMAIL WRAPPER ─────────────────────────────────────
const wrap = (body, preheader = "") => `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<meta http-equiv="X-UA-Compatible" content="IE=edge"/>
<title>NexVault</title>
<!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
</head>
<body style="margin:0;padding:0;background:#060b18;font-family:'Segoe UI',Arial,sans-serif">
${preheader ? `<div style="display:none;max-height:0;overflow:hidden;font-size:1px;color:#060b18">${preheader}</div>` : ""}
<table width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(180deg,#060b18 0%,#0a1628 100%);min-height:100vh">
<tr><td align="center" style="padding:40px 20px">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%">

  <!-- HEADER -->
  <tr><td style="background:linear-gradient(135deg,#0a1628 0%,#0d1f3c 100%);border:1px solid rgba(14,165,233,0.25);border-bottom:none;border-radius:12px 12px 0 0;padding:32px 40px">
    <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td>
        <div style="font-size:28px;font-weight:900;letter-spacing:-0.5px;font-family:Georgia,serif">
          <span style="color:#38bdf8">NEX</span><span style="color:#fbbf24">VAULT</span>
        </div>
        <div style="font-size:10px;letter-spacing:4px;color:#4a6fa5;margin-top:4px;font-family:Courier New,monospace">NEXT GENERATION WEALTH VAULT</div>
      </td>
      <td align="right">
        <div style="background:rgba(34,197,94,0.1);border:1px solid rgba(34,197,94,0.3);border-radius:20px;padding:4px 12px;display:inline-block">
          <span style="color:#22c55e;font-size:10px;font-family:Courier New,monospace;letter-spacing:2px">● SYSTEM ONLINE</span>
        </div>
      </td>
    </tr>
    </table>
  </td></tr>

  <!-- GOLD LINE -->
  <tr><td style="background:linear-gradient(90deg,#f59e0b,#fbbf24,#f59e0b);height:2px"></td></tr>

  <!-- BODY -->
  <tr><td style="background:#0a1628;border:1px solid rgba(14,165,233,0.15);border-top:none;border-bottom:none;padding:48px 40px">
    ${body}
  </td></tr>

  <!-- FOOTER -->
  <tr><td style="background:linear-gradient(135deg,#060b18 0%,#0a1628 100%);border:1px solid rgba(14,165,233,0.15);border-top:1px solid rgba(245,158,11,0.2);border-radius:0 0 12px 12px;padding:28px 40px">
    <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td>
        <div style="font-size:11px;color:#4a6fa5;font-family:Courier New,monospace;margin-bottom:8px">NEXVAULT SECURE COMMUNICATIONS</div>
        <div style="font-size:11px;color:#2d4a6e">
          <a href="https://nexvault.org" style="color:#38bdf8;text-decoration:none">nexvault.org</a>
          &nbsp;·&nbsp;
          <a href="mailto:support@nexvault.org" style="color:#38bdf8;text-decoration:none">support@nexvault.org</a>
        </div>
      </td>
      <td align="right">
        <div style="font-size:10px;color:#2d4a6e;font-family:Courier New,monospace">© 2026 NEXVAULT<br/>ALL RIGHTS RESERVED</div>
      </td>
    </tr>
    <tr><td colspan="2" style="padding-top:16px;border-top:1px solid rgba(14,165,233,0.08);margin-top:16px">
      <div style="font-size:10px;color:#1e3a5f;line-height:1.6">This email was sent to you because you have an account with NexVault. If you did not create this account, please contact support immediately. Do not share your login credentials with anyone.</div>
    </td></tr>
    </table>
  </td></tr>

</table>
</td></tr>
</table>
</body></html>`;

// ── REUSABLE COMPONENTS ──────────────────────────────────────
const badge = (text, color = "#22c55e") =>
  `<span style="background:${color}1a;border:1px solid ${color}4d;border-radius:4px;padding:3px 10px;font-size:11px;font-family:Courier New,monospace;color:${color};letter-spacing:1px">${text}</span>`;

const statRow = (label, value, valueColor = "#f0f9ff") =>
  `<tr>
    <td style="padding:10px 0;border-bottom:1px solid rgba(14,165,233,0.08);font-size:11px;letter-spacing:2px;color:#4a6fa5;font-family:Courier New,monospace">${label}</td>
    <td style="padding:10px 0;border-bottom:1px solid rgba(14,165,233,0.08);font-size:14px;font-weight:700;color:${valueColor};text-align:right;font-family:Courier New,monospace">${value}</td>
  </tr>`;

const ctaBtn = (text, url, color = "#f59e0b") =>
  `<table cellpadding="0" cellspacing="0" style="margin-top:32px">
    <tr><td style="background:linear-gradient(135deg,${color},#fbbf24);border-radius:6px;padding:1px">
      <a href="${url}" style="display:block;padding:14px 32px;background:linear-gradient(135deg,${color},#fbbf24);border-radius:5px;color:#010208;font-weight:800;font-size:13px;text-decoration:none;letter-spacing:1px;font-family:Courier New,monospace;text-align:center">${text} →</a>
    </td></tr>
  </table>`;

const alertBox = (text, color = "#f59e0b") =>
  `<div style="background:${color}0d;border-left:3px solid ${color};border-radius:0 6px 6px 0;padding:14px 18px;margin:24px 0;font-size:12px;color:#94a3b8;line-height:1.7">${text}</div>`;

const heading = (text, sub = "") =>
  `<div style="margin-bottom:28px">
    <h1 style="margin:0 0 8px;font-size:26px;font-weight:900;color:#f0f9ff;letter-spacing:-0.5px;font-family:Georgia,serif">${text}</h1>
    ${sub ? `<div style="font-size:13px;color:#4a6fa5;font-family:Courier New,monospace;letter-spacing:1px">${sub}</div>` : ""}
  </div>`;

const divider = () => `<div style="border-top:1px solid rgba(14,165,233,0.1);margin:28px 0"></div>`;

// ── EMAIL TEMPLATES ──────────────────────────────────────────
const templates = {

  welcome: (name, refCode) => ({
    subject: "Welcome to NexVault — Your Vault is Ready 🏦",
    html: wrap(`
      ${heading("Welcome to NexVault", "ACCOUNT ACTIVATED · VAULT INITIALIZED")}
      <p style="color:#94a3b8;font-size:14px;line-height:1.8;margin:0 0 24px">Hi <strong style="color:#f0f9ff">${name}</strong>, your NexVault account has been created successfully. You now have access to our next-generation wealth vault platform.</p>
      <div style="background:rgba(14,165,233,0.05);border:1px solid rgba(14,165,233,0.15);border-radius:8px;padding:24px;margin:24px 0">
        <div style="font-size:10px;letter-spacing:3px;color:#4a6fa5;font-family:Courier New,monospace;margin-bottom:12px">YOUR REFERRAL CODE</div>
        <div style="font-size:28px;font-weight:900;color:#38bdf8;font-family:Courier New,monospace;letter-spacing:4px">${refCode}</div>
        <div style="font-size:11px;color:#4a6fa5;margin-top:8px">Share your code and earn <strong style="color:#fbbf24">5% commission</strong> on every referral deposit</div>
      </div>
      ${divider()}
      <div style="font-size:11px;letter-spacing:2px;color:#4a6fa5;font-family:Courier New,monospace;margin-bottom:16px">AVAILABLE INVESTMENT PLANS</div>
      <table width="100%" cellpadding="0" cellspacing="0">
        ${statRow("BRONZE VAULT", "20% ROI · 15 Days · From $100", "#fbbf24")}
        ${statRow("SILVER VAULT", "35% ROI · 30 Days · From $500", "#94a3b8")}
        ${statRow("GOLD VAULT", "50% ROI · 60 Days · From $5,000", "#fbbf24")}
        ${statRow("PLATINUM VAULT", "60% ROI · 90 Days · From $25,000", "#38bdf8")}
      </table>
      ${ctaBtn("LAUNCH YOUR VAULT", "https://nexvault.org/dashboard")}
    `, "Welcome to NexVault — Your account is ready")
  }),

  loginAlert: (name, time, ip) => ({
    subject: "New Login Detected — NexVault Security Alert 🔐",
    html: wrap(`
      ${heading("Security Alert", "NEW LOGIN DETECTED ON YOUR ACCOUNT")}
      <p style="color:#94a3b8;font-size:14px;line-height:1.8;margin:0 0 24px">Hi <strong style="color:#f0f9ff">${name}</strong>, we detected a new login to your NexVault account. If this was you, no action is needed.</p>
      <div style="background:rgba(239,68,68,0.05);border:1px solid rgba(239,68,68,0.2);border-radius:8px;padding:24px;margin:24px 0">
        <div style="font-size:10px;letter-spacing:3px;color:#ef4444;font-family:Courier New,monospace;margin-bottom:16px">● LOGIN DETAILS</div>
        <table width="100%" cellpadding="0" cellspacing="0">
          ${statRow("TIME", time, "#f0f9ff")}
          ${statRow("IP ADDRESS", ip, "#f0f9ff")}
          ${statRow("STATUS", "AUTHORIZED", "#22c55e")}
        </table>
      </div>
      ${alertBox("⚠️ If you did not log in, please contact us immediately at <a href='mailto:support@nexvault.org' style='color:#f59e0b'>support@nexvault.org</a> and change your password right away.")}
      ${ctaBtn("SECURE MY ACCOUNT", "https://nexvault.org/dashboard", "#ef4444")}
    `, "New login detected on your NexVault account")
  }),

  depositReceived: (name, amount, plan, method) => ({
    subject: `Deposit Received — $${Number(amount).toLocaleString()} Under Review`,
    html: wrap(`
      ${heading("Deposit Received", "PENDING ADMIN VERIFICATION")}
      <p style="color:#94a3b8;font-size:14px;line-height:1.8;margin:0 0 24px">Hi <strong style="color:#f0f9ff">${name}</strong>, we have received your deposit request. Our team will verify and activate your investment within 24 hours.</p>
      <div style="background:rgba(245,158,11,0.05);border:1px solid rgba(245,158,11,0.2);border-radius:8px;padding:24px;margin:24px 0">
        <div style="font-size:10px;letter-spacing:3px;color:#f59e0b;font-family:Courier New,monospace;margin-bottom:16px">● DEPOSIT SUMMARY</div>
        <table width="100%" cellpadding="0" cellspacing="0">
          ${statRow("AMOUNT", "$" + Number(amount).toLocaleString(), "#fbbf24")}
          ${statRow("PLAN", plan.toUpperCase() + " VAULT", "#f0f9ff")}
          ${statRow("PAYMENT METHOD", method.toUpperCase(), "#f0f9ff")}
          ${statRow("STATUS", "PENDING VERIFICATION", "#f59e0b")}
        </table>
      </div>
      ${alertBox("⏳ Our admin team verifies deposits within 24 hours. You will receive another email once your investment is activated. Do not send another payment.")}
      ${ctaBtn("VIEW DASHBOARD", "https://nexvault.org/dashboard")}
    `, "Your deposit is under review")
  }),

  depositApproved: (name, amount, plan, roi, days) => ({
    subject: `Investment Activated — ${plan.toUpperCase()} VAULT is Live 🚀`,
    html: wrap(`
      ${heading("Investment Activated!", "YOUR VAULT IS NOW GENERATING RETURNS")}
      <p style="color:#94a3b8;font-size:14px;line-height:1.8;margin:0 0 24px">Hi <strong style="color:#f0f9ff">${name}</strong>, great news! Your deposit has been verified and your investment is now active. Watch your returns grow daily.</p>
      <div style="background:rgba(34,197,94,0.05);border:1px solid rgba(34,197,94,0.2);border-radius:8px;padding:24px;margin:24px 0">
        <div style="font-size:10px;letter-spacing:3px;color:#22c55e;font-family:Courier New,monospace;margin-bottom:16px">● INVESTMENT DETAILS</div>
        <table width="100%" cellpadding="0" cellspacing="0">
          ${statRow("INVESTED", "$" + Number(amount).toLocaleString(), "#fbbf24")}
          ${statRow("PLAN", plan.toUpperCase() + " VAULT", "#f0f9ff")}
          ${statRow("ROI", roi + "%", "#22c55e")}
          ${statRow("DURATION", days + " DAYS", "#f0f9ff")}
          ${statRow("EXPECTED RETURN", "$" + (Number(amount) * (1 + roi/100)).toLocaleString(), "#22c55e")}
          ${statRow("DAILY PROFIT", "$" + ((Number(amount) * (roi/100)) / days).toFixed(2), "#38bdf8")}
        </table>
      </div>
      <div style="background:rgba(14,165,233,0.05);border:1px solid rgba(14,165,233,0.15);border-radius:8px;padding:20px;margin:24px 0;text-align:center">
        <div style="font-size:11px;color:#4a6fa5;font-family:Courier New,monospace;margin-bottom:8px">TOTAL VAULT VALUE AT MATURITY</div>
        <div style="font-size:36px;font-weight:900;color:#22c55e;font-family:Courier New,monospace">$${(Number(amount) * (1 + roi/100)).toLocaleString()}</div>
      </div>
      ${ctaBtn("TRACK MY INVESTMENT", "https://nexvault.org/dashboard")}
    `, "Your investment is now active and generating returns")
  }),

  withdrawalApproved: (name, amount, method) => ({
    subject: `Withdrawal Approved — $${Number(amount).toLocaleString()} Processing 💸`,
    html: wrap(`
      ${heading("Withdrawal Approved", "FUNDS ARE BEING PROCESSED")}
      <p style="color:#94a3b8;font-size:14px;line-height:1.8;margin:0 0 24px">Hi <strong style="color:#f0f9ff">${name}</strong>, your withdrawal request has been approved and your funds are being processed.</p>
      <div style="background:rgba(34,197,94,0.05);border:1px solid rgba(34,197,94,0.2);border-radius:8px;padding:24px;margin:24px 0">
        <div style="font-size:10px;letter-spacing:3px;color:#22c55e;font-family:Courier New,monospace;margin-bottom:16px">● WITHDRAWAL DETAILS</div>
        <table width="100%" cellpadding="0" cellspacing="0">
          ${statRow("AMOUNT", "$" + Number(amount).toLocaleString(), "#fbbf24")}
          ${statRow("METHOD", method.toUpperCase(), "#f0f9ff")}
          ${statRow("STATUS", "APPROVED & PROCESSING", "#22c55e")}
          ${statRow("ESTIMATED ARRIVAL", "1-24 HOURS", "#38bdf8")}
        </table>
      </div>
      ${alertBox("💡 Processing times vary by network. Bitcoin typically takes 1-3 hours. Bank transfers may take up to 24 hours. Contact support if you have not received funds after 24 hours.")}
      ${ctaBtn("VIEW TRANSACTIONS", "https://nexvault.org/dashboard")}
    `, "Your withdrawal has been approved")
  }),

  kycApproved: (name) => ({
    subject: "KYC Verified — Full Access Unlocked ✅",
    html: wrap(`
      ${heading("Identity Verified!", "FULL ACCESS NOW UNLOCKED")}
      <p style="color:#94a3b8;font-size:14px;line-height:1.8;margin:0 0 24px">Hi <strong style="color:#f0f9ff">${name}</strong>, your identity has been successfully verified. You now have full access to all NexVault premium features.</p>
      <div style="background:rgba(34,197,94,0.05);border:1px solid rgba(34,197,94,0.2);border-radius:8px;padding:24px;margin:24px 0">
        <div style="font-size:10px;letter-spacing:3px;color:#22c55e;font-family:Courier New,monospace;margin-bottom:16px">● UNLOCKED FEATURES</div>
        <div style="color:#22c55e;font-family:Courier New,monospace;font-size:12px;line-height:2">
          ✓ &nbsp;Unlimited withdrawal amounts<br/>
          ✓ &nbsp;Access to Gold &amp; Platinum investment tiers<br/>
          ✓ &nbsp;Priority customer support<br/>
          ✓ &nbsp;Higher referral commission rates<br/>
          ✓ &nbsp;Verified investor badge on profile
        </div>
      </div>
      ${ctaBtn("ACCESS PREMIUM FEATURES", "https://nexvault.org/dashboard")}
    `, "Your KYC verification is complete")
  }),

  kycRejected: (name, reason) => ({
    subject: "KYC Update Required — Action Needed",
    html: wrap(`
      ${heading("KYC Update Required", "PLEASE RESUBMIT YOUR DOCUMENTS")}
      <p style="color:#94a3b8;font-size:14px;line-height:1.8;margin:0 0 24px">Hi <strong style="color:#f0f9ff">${name}</strong>, we were unable to verify your identity documents. Please review the reason below and resubmit.</p>
      <div style="background:rgba(239,68,68,0.05);border:1px solid rgba(239,68,68,0.2);border-radius:8px;padding:24px;margin:24px 0">
        <div style="font-size:10px;letter-spacing:3px;color:#ef4444;font-family:Courier New,monospace;margin-bottom:12px">● REJECTION REASON</div>
        <p style="color:#f0f9ff;font-size:13px;margin:0;line-height:1.7">${reason || "Document was unclear, expired, or incomplete. Please ensure your ID is valid, fully visible, and all text is legible."}</p>
      </div>
      <div style="background:rgba(14,165,233,0.05);border:1px solid rgba(14,165,233,0.15);border-radius:8px;padding:20px;margin:24px 0">
        <div style="font-size:10px;letter-spacing:3px;color:#38bdf8;font-family:Courier New,monospace;margin-bottom:12px">● RESUBMISSION CHECKLIST</div>
        <div style="color:#94a3b8;font-family:Courier New,monospace;font-size:11px;line-height:2">
          □ &nbsp;Document is valid and not expired<br/>
          □ &nbsp;All four corners of the document are visible<br/>
          □ &nbsp;Photo is clear with no glare or blur<br/>
          □ &nbsp;File size is under 3MB<br/>
          □ &nbsp;Selfie clearly shows your face with the document
        </div>
      </div>
      ${ctaBtn("RESUBMIT DOCUMENTS", "https://nexvault.org/dashboard", "#ef4444")}
    `, "Your KYC documents need to be resubmitted")
  }),

  roiCredited: (name, amount, plan, totalProfit) => ({
    subject: `Daily Profit Credited — $${Number(amount).toFixed(2)} Added to Your Vault 💰`,
    html: wrap(`
      ${heading("Daily Profit Credited", "YOUR VAULT IS GROWING")}
      <p style="color:#94a3b8;font-size:14px;line-height:1.8;margin:0 0 24px">Hi <strong style="color:#f0f9ff">${name}</strong>, your daily investment return has been credited to your account.</p>
      <div style="background:rgba(34,197,94,0.05);border:1px solid rgba(34,197,94,0.2);border-radius:8px;padding:24px;margin:24px 0;text-align:center">
        <div style="font-size:11px;color:#4a6fa5;font-family:Courier New,monospace;margin-bottom:8px">TODAY'S PROFIT</div>
        <div style="font-size:42px;font-weight:900;color:#22c55e;font-family:Courier New,monospace">+$${Number(amount).toFixed(2)}</div>
        <div style="font-size:11px;color:#4a6fa5;font-family:Courier New,monospace;margin-top:8px">${plan.toUpperCase()} VAULT</div>
      </div>
      <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(14,165,233,0.03);border:1px solid rgba(14,165,233,0.1);border-radius:8px;padding:20px">
        <tr><td style="padding:20px">
          ${statRow("TODAY'S RETURN", "+$" + Number(amount).toFixed(2), "#22c55e")}
          ${statRow("TOTAL PROFIT EARNED", "$" + Number(totalProfit).toLocaleString(), "#fbbf24")}
          ${statRow("ACTIVE PLAN", plan.toUpperCase() + " VAULT", "#38bdf8")}
        </td></tr>
      </table>
      ${ctaBtn("VIEW MY PORTFOLIO", "https://nexvault.org/dashboard")}
    `, "Your daily profit has been credited")
  }),

};

// ── SEND FUNCTION ────────────────────────────────────────────
const sendEmail = async (to, subject, htmlBody) => {
  if (!process.env.RESEND_API_KEY) {
    console.log("[EMAIL SKIPPED] No RESEND_API_KEY. To:", to, "Subject:", subject);
    return;
  }

  const payload = JSON.stringify({
    from: "NexVault <support@nexvault.org>",
    to: [to],
    subject,
    html: htmlBody
  });

  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: "api.resend.com",
      path: "/emails",
      method: "POST",
      headers: {
        "Authorization": "Bearer " + process.env.RESEND_API_KEY,
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(payload)
      }
    }, (res) => {
      let data = "";
      res.on("data", chunk => data += chunk);
      res.on("end", () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log("[EMAIL SENT] To:", to, "| Subject:", subject);
          resolve(data);
        } else {
          console.log("[EMAIL ERROR]", res.statusCode, data);
          reject(new Error("Resend error: " + data));
        }
      });
    });
    req.on("error", reject);
    req.setTimeout(15000, () => { req.destroy(); reject(new Error("Timeout")); });
    req.write(payload);
    req.end();
  });
};

// ── TEMPLATE SENDER ──────────────────────────────────────────
const sendTemplate = async (templateName, to, ...args) => {
  const template = templates[templateName];
  if (!template) { console.log("[EMAIL] Unknown template:", templateName); return; }
  const { subject, html } = template(...args);
  return sendEmail(to, subject, html);
};

module.exports = { sendEmail, sendTemplate, templates, wrap };
