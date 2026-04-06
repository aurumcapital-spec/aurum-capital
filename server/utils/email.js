const https = require("https");

// ─────────────────────────────────────────────────────────────
// NEXVAULT PROFESSIONAL EMAIL SYSTEM
// ─────────────────────────────────────────────────────────────

const BASE_URL = process.env.APP_URL || "https://nexvault.org";

const wrap = (preheader, content) => `<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<meta http-equiv="X-UA-Compatible" content="IE=edge"/>
<meta name="x-apple-disable-message-reformatting"/>
<title>NexVault</title>
<style>
  body{margin:0;padding:0;background:#05090f;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif}
  @media only screen and (max-width:600px){.container{width:100%!important}.inner{padding:32px 20px!important}.stat-row td{font-size:12px!important}}
</style>
</head>
<body style="margin:0;padding:0;background:#05090f">
<span style="display:none;font-size:1px;color:#05090f;max-height:0;overflow:hidden;opacity:0">${preheader}</span>
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#05090f;min-height:100vh">
<tr><td align="center" style="padding:48px 16px">

  <!-- EMAIL CONTAINER -->
  <table class="container" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%">

    <!-- TOP BAR -->
    <tr><td style="background:linear-gradient(90deg,#0ea5e9,#38bdf8,#fbbf24);height:3px;border-radius:3px 3px 0 0"></td></tr>

    <!-- HEADER -->
    <tr><td style="background:linear-gradient(145deg,#0c1322 0%,#111827 50%,#0c1322 100%);padding:32px 48px;border-left:1px solid rgba(56,189,248,0.12);border-right:1px solid rgba(56,189,248,0.12)">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td>
          <div style="font-size:24px;font-weight:900;letter-spacing:2px;line-height:1">
            <span style="color:#38bdf8;font-family:Georgia,serif">NEX</span><span style="color:#fbbf24;font-family:Georgia,serif">VAULT</span>
          </div>
          <div style="font-size:9px;letter-spacing:5px;color:#334155;margin-top:5px;font-family:Courier New,monospace;text-transform:uppercase">Next Generation Wealth Vault</div>
        </td>
        <td align="right">
          <table cellpadding="0" cellspacing="0" border="0">
          <tr><td style="background:rgba(34,197,94,0.08);border:1px solid rgba(34,197,94,0.2);border-radius:100px;padding:5px 14px">
            <span style="color:#22c55e;font-size:9px;font-family:Courier New,monospace;letter-spacing:2px">● SECURE TRANSMISSION</span>
          </td></tr>
          </table>
        </td>
      </tr>
      </table>
    </td></tr>

    <!-- CONTENT -->
    <tr><td class="inner" style="background:#0c1322;padding:48px;border-left:1px solid rgba(56,189,248,0.12);border-right:1px solid rgba(56,189,248,0.12)">
      ${content}
    </td></tr>

    <!-- FOOTER -->
    <tr><td style="background:#080d18;padding:32px 48px;border:1px solid rgba(56,189,248,0.08);border-top:1px solid rgba(245,158,11,0.15);border-radius:0 0 8px 8px">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td style="padding-bottom:20px;border-bottom:1px solid rgba(56,189,248,0.06)">
          <div style="font-size:10px;color:#1e3a5f;font-family:Courier New,monospace;letter-spacing:2px;margin-bottom:10px">NEXVAULT SECURE COMMUNICATIONS</div>
          <div style="font-size:11px;color:#334155">
            <a href="${BASE_URL}" style="color:#38bdf8;text-decoration:none">nexvault.org</a>
            &nbsp;&nbsp;·&nbsp;&nbsp;
            <a href="mailto:support@nexvault.org" style="color:#38bdf8;text-decoration:none">support@nexvault.org</a>
            &nbsp;&nbsp;·&nbsp;&nbsp;
            <a href="${BASE_URL}/dashboard" style="color:#38bdf8;text-decoration:none">Dashboard</a>
          </div>
        </td>
      </tr>
      <tr><td style="padding-top:16px">
        <div style="font-size:10px;color:#1e3a5f;line-height:1.7">
          This is an automated message from NexVault. Please do not reply directly to this email. 
          If you need assistance, contact us at <a href="mailto:support@nexvault.org" style="color:#334155">support@nexvault.org</a>.
          <br/>© 2026 NexVault. All rights reserved. Your investments are managed securely.
        </div>
      </td></tr>
      </table>
    </td></tr>

    <!-- BOTTOM ACCENT -->
    <tr><td style="background:linear-gradient(90deg,transparent,rgba(56,189,248,0.3),rgba(245,158,11,0.3),transparent);height:1px"></td></tr>

  </table>
</td></tr>
</table>
</body></html>`;

// ─── UI COMPONENTS ───────────────────────────────────────────

const hero = (icon, title, subtitle, color="#38bdf8") => `
<div style="text-align:center;margin-bottom:40px">
  <div style="display:inline-block;background:${color}15;border:1px solid ${color}30;border-radius:50%;width:64px;height:64px;line-height:64px;font-size:28px;margin-bottom:20px">${icon}</div>
  <h1 style="margin:0 0 10px;font-size:28px;font-weight:800;color:#f1f5f9;letter-spacing:-0.5px;line-height:1.2">${title}</h1>
  <div style="font-size:11px;letter-spacing:4px;color:${color};font-family:Courier New,monospace;text-transform:uppercase">${subtitle}</div>
</div>`;

const p = (text) => `<p style="font-size:15px;color:#94a3b8;line-height:1.8;margin:0 0 24px">${text}</p>`;

const statsCard = (rows, accentColor="#0ea5e9") => `
<div style="background:#080d18;border:1px solid rgba(56,189,248,0.1);border-radius:8px;overflow:hidden;margin:28px 0">
  <div style="background:linear-gradient(90deg,${accentColor}15,transparent);border-bottom:1px solid rgba(56,189,248,0.08);padding:14px 20px">
    <span style="font-size:9px;letter-spacing:4px;color:${accentColor};font-family:Courier New,monospace">● TRANSACTION DETAILS</span>
  </div>
  <table class="stat-row" width="100%" cellpadding="0" cellspacing="0" border="0" style="padding:8px">
    ${rows.map((r,i) => `
    <tr style="background:${i%2===0?'transparent':'rgba(56,189,248,0.02)'}">
      <td style="padding:14px 20px;font-size:11px;letter-spacing:2px;color:#475569;font-family:Courier New,monospace;border-bottom:1px solid rgba(56,189,248,0.05)">${r[0]}</td>
      <td style="padding:14px 20px;font-size:14px;font-weight:700;color:${r[2]||'#e2e8f0'};text-align:right;font-family:Courier New,monospace;border-bottom:1px solid rgba(56,189,248,0.05)">${r[1]}</td>
    </tr>`).join('')}
  </table>
</div>`;

const bigStat = (label, value, color="#22c55e") => `
<div style="background:${color}08;border:1px solid ${color}20;border-radius:8px;padding:28px;text-align:center;margin:28px 0">
  <div style="font-size:10px;letter-spacing:4px;color:${color}99;font-family:Courier New,monospace;margin-bottom:12px">${label}</div>
  <div style="font-size:40px;font-weight:900;color:${color};font-family:Courier New,monospace;letter-spacing:-1px">${value}</div>
</div>`;

const alertBox = (text, color="#f59e0b") => `
<div style="background:${color}0a;border-left:3px solid ${color};border-radius:0 6px 6px 0;padding:16px 20px;margin:28px 0">
  <div style="font-size:13px;color:#94a3b8;line-height:1.7">${text}</div>
</div>`;

const checklist = (items, color="#22c55e") => `
<div style="background:#080d18;border:1px solid rgba(56,189,248,0.1);border-radius:8px;padding:20px 24px;margin:28px 0">
  ${items.map(item => `<div style="font-size:13px;color:#64748b;font-family:Courier New,monospace;padding:8px 0;border-bottom:1px solid rgba(56,189,248,0.05)"><span style="color:${color};margin-right:12px">✓</span>${item}</div>`).join('')}
</div>`;

const cta = (text, url, color="#f59e0b") => `
<div style="text-align:center;margin-top:36px">
  <a href="${url}" style="display:inline-block;background:linear-gradient(135deg,${color},#fbbf24);color:#030712;font-weight:800;font-size:13px;letter-spacing:2px;text-decoration:none;padding:16px 40px;border-radius:6px;font-family:Courier New,monospace;text-transform:uppercase">${text} &rarr;</a>
  <div style="font-size:10px;color:#334155;margin-top:12px;font-family:Courier New,monospace">SECURED BY SSL · NEXVAULT.ORG</div>
</div>`;

const divider = () => `<div style="border-top:1px solid rgba(56,189,248,0.08);margin:32px 0"></div>`;

const refBox = (code) => `
<div style="background:linear-gradient(135deg,rgba(14,165,233,0.05),rgba(245,158,11,0.05));border:1px solid rgba(56,189,248,0.15);border-radius:8px;padding:24px;text-align:center;margin:28px 0">
  <div style="font-size:9px;letter-spacing:5px;color:#475569;font-family:Courier New,monospace;margin-bottom:12px">YOUR REFERRAL CODE</div>
  <div style="font-size:32px;font-weight:900;color:#38bdf8;font-family:Courier New,monospace;letter-spacing:8px">${code}</div>
  <div style="font-size:11px;color:#475569;margin-top:10px">Share & earn <strong style="color:#fbbf24">5% commission</strong> on every referral deposit</div>
</div>`;

// ─── EMAIL TEMPLATES ─────────────────────────────────────────

const templates = {

  welcome: (name, refCode) => ({
    subject: `Welcome to NexVault, ${name} — Your Vault is Ready 🏦`,
    html: wrap(
      `Welcome to NexVault — your investment vault is activated and ready`,
      hero("🏦", `Welcome, ${name}!`, "Account Activated · Vault Initialized", "#38bdf8") +
      p(`Your NexVault account has been successfully created. You now have access to our institutional-grade investment platform, trusted by thousands of investors worldwide.`) +
      refBox(refCode) +
      divider() +
      `<div style="font-size:9px;letter-spacing:4px;color:#38bdf8;font-family:Courier New,monospace;margin-bottom:16px">AVAILABLE INVESTMENT PLANS</div>` +
      statsCard([
        ["BRONZE VAULT", "20% ROI · 15 Days · From $100", "#fbbf24"],
        ["SILVER VAULT", "35% ROI · 30 Days · From $500", "#94a3b8"],
        ["GOLD VAULT", "50% ROI · 60 Days · From $5,000", "#fbbf24"],
        ["PLATINUM VAULT", "60% ROI · 90 Days · From $25,000", "#38bdf8"],
      ]) +
      alertBox("💡 <strong style='color:#f1f5f9'>Pro Tip:</strong> Complete your KYC verification to unlock unlimited withdrawals and access to our highest-yield Platinum tier.") +
      cta("LAUNCH YOUR VAULT", `${BASE_URL}/dashboard`)
    )
  }),

  loginAlert: (name, time, ip) => ({
    subject: `Security Alert — New Login to Your NexVault Account`,
    html: wrap(
      `New login detected on your NexVault account`,
      hero("🔐", "New Login Detected", "Security Alert · Immediate Review Recommended", "#ef4444") +
      p(`Hi <strong style="color:#f1f5f9">${name}</strong>, we detected a new sign-in to your NexVault account. Review the details below.`) +
      statsCard([
        ["DATE & TIME", time, "#e2e8f0"],
        ["IP ADDRESS", ip, "#38bdf8"],
        ["DEVICE", "Web Browser", "#e2e8f0"],
        ["STATUS", "✓ AUTHORIZED", "#22c55e"],
      ], "#ef4444") +
      alertBox("⚠️ <strong style='color:#f1f5f9'>Was this you?</strong> If you did not sign in, your account may be compromised. Change your password immediately and contact <a href='mailto:support@nexvault.org' style='color:#f59e0b'>support@nexvault.org</a>.") +
      cta("SECURE MY ACCOUNT", `${BASE_URL}/dashboard`, "#ef4444")
    )
  }),

  depositReceived: (name, amount, plan, method) => ({
    subject: `Deposit Received — $${Number(amount).toLocaleString()} Pending Verification`,
    html: wrap(
      `Your $${Number(amount).toLocaleString()} deposit is under review`,
      hero("📥", "Deposit Received", "Pending Admin Verification · Up to 24 Hours", "#f59e0b") +
      p(`Hi <strong style="color:#f1f5f9">${name}</strong>, we have received your deposit request. Our compliance team will verify and activate your investment within 24 hours.`) +
      statsCard([
        ["AMOUNT", `$${Number(amount).toLocaleString()}`, "#fbbf24"],
        ["INVESTMENT PLAN", `${(plan||"").toUpperCase()} VAULT`, "#e2e8f0"],
        ["PAYMENT METHOD", (method||"").toUpperCase(), "#e2e8f0"],
        ["STATUS", "⏳ PENDING VERIFICATION", "#f59e0b"],
        ["ESTIMATED ACTIVATION", "Within 24 Hours", "#94a3b8"],
      ], "#f59e0b") +
      alertBox("📌 <strong style='color:#f1f5f9'>Important:</strong> Do not send another payment. Once verified, you will receive a confirmation email and your investment will begin generating returns immediately.") +
      cta("VIEW DASHBOARD", `${BASE_URL}/dashboard`)
    )
  }),

  depositApproved: (name, amount, plan, roi, days) => ({
    subject: `🚀 Investment Activated — Your ${(plan||"").toUpperCase()} VAULT is Live!`,
    html: wrap(
      `Your investment is active and generating returns`,
      hero("🚀", "Investment Activated!", `${(plan||"").toUpperCase()} Vault · Generating Returns Now`, "#22c55e") +
      p(`Congratulations <strong style="color:#f1f5f9">${name}</strong>! Your deposit has been verified and your investment is now active. Your vault is generating returns every day.`) +
      bigStat("TOTAL VALUE AT MATURITY", `$${(Number(amount)*(1+roi/100)).toLocaleString()}`, "#22c55e") +
      statsCard([
        ["AMOUNT INVESTED", `$${Number(amount).toLocaleString()}`, "#fbbf24"],
        ["INVESTMENT PLAN", `${(plan||"").toUpperCase()} VAULT`, "#e2e8f0"],
        ["RETURN ON INVESTMENT", `${roi}%`, "#22c55e"],
        ["INVESTMENT DURATION", `${days} Days`, "#e2e8f0"],
        ["DAILY PROFIT", `$${((Number(amount)*(roi/100))/days).toFixed(2)}`, "#38bdf8"],
        ["PROFIT AT MATURITY", `$${(Number(amount)*(roi/100)).toLocaleString()}`, "#22c55e"],
        ["STATUS", "✓ ACTIVE & RUNNING", "#22c55e"],
      ], "#22c55e") +
      alertBox("📈 <strong style='color:#f1f5f9'>Your vault is running.</strong> Daily profits are automatically credited to your balance. You can track your investment progress in real-time from your dashboard.") +
      cta("TRACK MY INVESTMENT", `${BASE_URL}/dashboard`)
    )
  }),

  withdrawalApproved: (name, amount, method) => ({
    subject: `💸 Withdrawal Approved — $${Number(amount).toLocaleString()} is Being Processed`,
    html: wrap(
      `Your withdrawal has been approved and is processing`,
      hero("💸", "Withdrawal Approved", "Funds Processing · Expected Within 24 Hours", "#22c55e") +
      p(`Hi <strong style="color:#f1f5f9">${name}</strong>, your withdrawal request has been reviewed and approved by our finance team. Your funds are now being processed.`) +
      statsCard([
        ["WITHDRAWAL AMOUNT", `$${Number(amount).toLocaleString()}`, "#fbbf24"],
        ["PAYMENT METHOD", (method||"").toUpperCase(), "#e2e8f0"],
        ["APPROVAL STATUS", "✓ APPROVED", "#22c55e"],
        ["PROCESSING TIME", "1 — 24 Hours", "#94a3b8"],
        ["TRANSACTION FEE", "None", "#22c55e"],
      ], "#22c55e") +
      alertBox("⏱️ <strong style='color:#f1f5f9'>Processing times:</strong> Crypto withdrawals typically process within 1-3 hours. Bank transfers may take up to 24 hours. If you have not received funds after 24 hours, contact <a href='mailto:support@nexvault.org' style='color:#f59e0b'>support@nexvault.org</a>.") +
      cta("VIEW TRANSACTION HISTORY", `${BASE_URL}/dashboard`)
    )
  }),

  kycApproved: (name) => ({
    subject: `✅ KYC Verified — Full Access Unlocked on NexVault`,
    html: wrap(
      `Your identity has been verified — full access unlocked`,
      hero("✅", "Identity Verified!", "KYC Complete · Premium Access Unlocked", "#22c55e") +
      p(`Congratulations <strong style="color:#f1f5f9">${name}</strong>! Your identity verification has been completed successfully. You now have full premium access to all NexVault features.`) +
      checklist([
        "Unlimited withdrawal amounts — no caps",
        "Access to Gold & Platinum high-yield investment tiers",
        "Priority customer support — dedicated response",
        "Enhanced referral commission rates",
        "Verified investor badge on your profile",
        "Advanced portfolio analytics & reporting",
      ]) +
      cta("ACCESS PREMIUM FEATURES", `${BASE_URL}/dashboard`)
    )
  }),

  kycRejected: (name, reason) => ({
    subject: `KYC Update Required — Action Needed on Your NexVault Account`,
    html: wrap(
      `Your KYC documents need to be resubmitted`,
      hero("⚠️", "KYC Update Required", "Document Resubmission Needed · Action Required", "#ef4444") +
      p(`Hi <strong style="color:#f1f5f9">${name}</strong>, we were unable to verify your identity documents. Please review the reason below and resubmit with the correct documentation.`) +
      statsCard([
        ["SUBMISSION STATUS", "✗ REQUIRES UPDATE", "#ef4444"],
        ["REASON", reason || "Document unclear or incomplete", "#94a3b8"],
        ["NEXT STEP", "Resubmit Documents", "#f59e0b"],
      ], "#ef4444") +
      `<div style="font-size:9px;letter-spacing:4px;color:#38bdf8;font-family:Courier New,monospace;margin:28px 0 16px">RESUBMISSION CHECKLIST</div>` +
      checklist([
        "Document is valid, current, and not expired",
        "All four corners of ID are clearly visible",
        "Photo is sharp — no blur, glare, or shadows",
        "File size is under 3MB (JPG, PNG, or PDF)",
        "Selfie clearly shows face alongside the document",
        "Name on document matches your NexVault account",
      ], "#f59e0b") +
      cta("RESUBMIT MY DOCUMENTS", `${BASE_URL}/dashboard`, "#ef4444")
    )
  }),

  roiCredited: (name, amount, plan, totalProfit) => ({
    subject: `💰 Daily Profit Credited — +$${Number(amount).toFixed(2)} Added to Your Vault`,
    html: wrap(
      `Your daily investment return has been credited`,
      hero("💰", "Profit Credited!", `Daily Return · ${(plan||"").toUpperCase()} Vault`, "#fbbf24") +
      p(`Hi <strong style="color:#f1f5f9">${name}</strong>, your daily investment return has been automatically credited to your NexVault balance.`) +
      bigStat("TODAY'S PROFIT", `+$${Number(amount).toFixed(2)}`, "#22c55e") +
      statsCard([
        ["DAILY RETURN", `+$${Number(amount).toFixed(2)}`, "#22c55e"],
        ["ACTIVE PLAN", `${(plan||"").toUpperCase()} VAULT`, "#e2e8f0"],
        ["TOTAL PROFIT EARNED", `$${Number(totalProfit).toLocaleString()}`, "#fbbf24"],
        ["PROFIT STATUS", "✓ CREDITED TO BALANCE", "#22c55e"],
      ], "#fbbf24") +
      alertBox("📊 <strong style='color:#f1f5f9'>Compounding your wealth:</strong> Reinvest your profits to maximize your returns. Upgrade to a higher vault tier to earn up to 60% ROI.") +
      cta("VIEW MY PORTFOLIO", `${BASE_URL}/dashboard`)
    )
  }),

};

// ─── SEND FUNCTION ───────────────────────────────────────────

const sendEmail = async (to, subject, html) => {
  if (!process.env.RESEND_API_KEY) {
    console.log("[EMAIL SKIPPED] No API key. To:", to);
    return;
  }
  const payload = JSON.stringify({ from: "NexVault <support@nexvault.org>", to: [to], subject, html });
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: "api.resend.com", path: "/emails", method: "POST",
      headers: { "Authorization": "Bearer " + process.env.RESEND_API_KEY, "Content-Type": "application/json", "Content-Length": Buffer.byteLength(payload) }
    }, (res) => {
      let data = "";
      res.on("data", c => data += c);
      res.on("end", () => {
        if (res.statusCode >= 200 && res.statusCode < 300) { console.log("[EMAIL SENT] To:", to, "| Subject:", subject); resolve(data); }
        else { console.log("[EMAIL ERROR]", res.statusCode, data); reject(new Error(data)); }
      });
    });
    req.on("error", reject);
    req.setTimeout(15000, () => { req.destroy(); reject(new Error("Timeout")); });
    req.write(payload);
    req.end();
  });
};

const sendTemplate = async (templateName, to, ...args) => {
  const t = templates[templateName];
  if (!t) { console.log("[EMAIL] Unknown template:", templateName); return; }
  const { subject, html } = t(...args);
  return sendEmail(to, subject, html);
};

module.exports = { sendEmail, sendTemplate, templates };
