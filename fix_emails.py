import pathlib

content = r'''const https = require("https");

const BASE_URL = process.env.APP_URL || "https://nexvault.org";

const wrap = (preheader, content) => `<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<meta http-equiv="X-UA-Compatible" content="IE=edge"/>
<title>NexVault</title>
<style>
body{margin:0;padding:0;background:#030712;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif}
@media only screen and (max-width:600px){.container{width:100%!important}.inner{padding:28px 18px!important}.hide-mobile{display:none!important}.stat-val{font-size:13px!important}}
</style>
</head>
<body style="margin:0;padding:0;background:#030712">
<span style="display:none;font-size:1px;color:#030712;max-height:0;overflow:hidden;opacity:0">${preheader}</span>
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#030712;min-height:100vh">
<tr><td align="center" style="padding:40px 16px">
<table class="container" width="620" cellpadding="0" cellspacing="0" border="0" style="max-width:620px;width:100%">

  <!-- GRADIENT TOP BAR -->
  <tr><td style="height:4px;background:linear-gradient(90deg,#0ea5e9 0%,#38bdf8 40%,#fbbf24 70%,#f59e0b 100%);border-radius:4px 4px 0 0"></td></tr>

  <!-- HEADER -->
  <tr><td style="background:linear-gradient(160deg,#0a1628 0%,#0d1f3c 50%,#0a1628 100%);padding:28px 44px;border-left:1px solid rgba(56,189,248,0.1);border-right:1px solid rgba(56,189,248,0.1)">
    <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
      <td>
        <div style="font-size:26px;font-weight:900;letter-spacing:3px;line-height:1;font-family:Georgia,serif">
          <span style="color:#38bdf8">NEX</span><span style="color:#fbbf24">VAULT</span>
        </div>
        <div style="font-size:8px;letter-spacing:5px;color:#1e40af;margin-top:6px;font-family:'Courier New',monospace;text-transform:uppercase">Next Generation Wealth Management</div>
      </td>
      <td align="right">
        <table cellpadding="0" cellspacing="0" border="0"><tr>
          <td style="background:rgba(34,197,94,0.08);border:1px solid rgba(34,197,94,0.25);border-radius:100px;padding:6px 16px">
            <span style="color:#22c55e;font-size:8px;font-family:'Courier New',monospace;letter-spacing:3px">&#9679; SSL SECURED</span>
          </td>
        </tr></table>
      </td>
    </tr></table>
  </td></tr>

  <!-- THIN SEPARATOR -->
  <tr><td style="background:linear-gradient(90deg,transparent,rgba(56,189,248,0.15),transparent);height:1px"></td></tr>

  <!-- MAIN CONTENT -->
  <tr><td class="inner" style="background:#0a1120;padding:44px;border-left:1px solid rgba(56,189,248,0.1);border-right:1px solid rgba(56,189,248,0.1)">
    ${content}
  </td></tr>

  <!-- DIVIDER -->
  <tr><td style="background:linear-gradient(90deg,transparent,rgba(245,158,11,0.2),transparent);height:1px"></td></tr>

  <!-- FOOTER -->
  <tr><td style="background:#06101e;padding:28px 44px;border:1px solid rgba(56,189,248,0.07);border-top:none;border-radius:0 0 6px 6px">
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr><td style="padding-bottom:18px;border-bottom:1px solid rgba(56,189,248,0.06)">
        <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
          <td>
            <div style="font-size:9px;color:#1e3a5f;font-family:'Courier New',monospace;letter-spacing:3px;margin-bottom:10px">NEXVAULT SECURE COMMUNICATIONS</div>
            <div style="font-size:11px;color:#334155;line-height:2">
              <a href="${BASE_URL}" style="color:#38bdf8;text-decoration:none">nexvault.org</a>
              &nbsp;&nbsp;&middot;&nbsp;&nbsp;
              <a href="mailto:support@nexvault.org" style="color:#38bdf8;text-decoration:none">support@nexvault.org</a>
              &nbsp;&nbsp;&middot;&nbsp;&nbsp;
              <a href="https://t.me/nextvaultsupport" style="color:#38bdf8;text-decoration:none">Telegram Support</a>
            </div>
          </td>
          <td align="right" class="hide-mobile">
            <div style="font-size:9px;color:#1e3a5f;font-family:'Courier New',monospace;text-align:right;line-height:2">
              <div style="color:#22c55e">&#9679; PLATFORM ONLINE</div>
              <div>24/7 SUPPORT</div>
            </div>
          </td>
        </tr></table>
      </td></tr>
      <tr><td style="padding-top:16px">
        <div style="font-size:10px;color:#1e3a5f;line-height:1.8">
          This is an automated secure message from NexVault. Do not reply directly to this email.<br/>
          For support: <a href="mailto:support@nexvault.org" style="color:#334155">support@nexvault.org</a> or <a href="https://t.me/nextvaultsupport" style="color:#334155">Telegram</a><br/>
          &copy; 2026 NexVault. All rights reserved. Investments managed with institutional-grade security.
        </div>
      </td></tr>
    </table>
  </td></tr>

  <tr><td style="background:linear-gradient(90deg,transparent,rgba(56,189,248,0.2),rgba(245,158,11,0.2),transparent);height:1px"></td></tr>

</table>
</td></tr>
</table>
</body></html>`;

// ── COMPONENTS ────────────────────────────────────────────────

const hero = (icon, title, subtitle, color="#38bdf8") => `
<div style="text-align:center;margin-bottom:36px;padding-bottom:32px;border-bottom:1px solid rgba(56,189,248,0.08)">
  <div style="display:inline-block;background:${color}12;border:1px solid ${color}25;border-radius:50%;width:72px;height:72px;line-height:72px;font-size:32px;margin-bottom:18px">${icon}</div>
  <h1 style="margin:0 0 10px;font-size:26px;font-weight:800;color:#f1f5f9;letter-spacing:-0.5px;line-height:1.25;font-family:Georgia,serif">${title}</h1>
  <div style="display:inline-block;background:${color}10;border:1px solid ${color}20;border-radius:100px;padding:5px 18px;margin-top:6px">
    <span style="font-size:9px;letter-spacing:4px;color:${color};font-family:'Courier New',monospace;text-transform:uppercase">${subtitle}</span>
  </div>
</div>`;

const p = (text) => `<p style="font-size:15px;color:#94a3b8;line-height:1.85;margin:0 0 22px">${text}</p>`;

const statsCard = (rows, accentColor="#0ea5e9", title="TRANSACTION DETAILS") => `
<div style="background:#060e1a;border:1px solid rgba(56,189,248,0.1);border-radius:8px;overflow:hidden;margin:28px 0">
  <div style="background:linear-gradient(90deg,${accentColor}12,transparent);border-bottom:1px solid rgba(56,189,248,0.08);padding:12px 20px;display:flex;align-items:center;gap:8px">
    <span style="font-size:8px;letter-spacing:4px;color:${accentColor};font-family:'Courier New',monospace">&#9679; ${title}</span>
  </div>
  <table width="100%" cellpadding="0" cellspacing="0" border="0">
    ${rows.map((r,i) => `
    <tr style="background:${i%2===0?"transparent":"rgba(56,189,248,0.015)"}">
      <td style="padding:13px 20px;font-size:10px;letter-spacing:2px;color:#475569;font-family:'Courier New',monospace;border-bottom:1px solid rgba(56,189,248,0.04);width:45%">${r[0]}</td>
      <td style="padding:13px 20px;font-size:13px;font-weight:700;color:${r[2]||"#cbd5e1"};text-align:right;font-family:'Courier New',monospace;border-bottom:1px solid rgba(56,189,248,0.04)" class="stat-val">${r[1]}</td>
    </tr>`).join("")}
  </table>
</div>`;

const bigStat = (label, value, sub, color="#22c55e") => `
<div style="background:${color}06;border:1px solid ${color}18;border-radius:10px;padding:32px;text-align:center;margin:28px 0;position:relative;overflow:hidden">
  <div style="position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,${color},transparent)"></div>
  <div style="font-size:9px;letter-spacing:5px;color:${color}80;font-family:'Courier New',monospace;margin-bottom:14px;text-transform:uppercase">${label}</div>
  <div style="font-size:42px;font-weight:900;color:${color};font-family:'Courier New',monospace;letter-spacing:-1px;line-height:1">${value}</div>
  ${sub ? `<div style="font-size:11px;color:#475569;margin-top:10px;font-family:'Courier New',monospace">${sub}</div>` : ""}
</div>`;

const alertBox = (text, color="#f59e0b") => `
<div style="background:${color}08;border:1px solid ${color}20;border-left:3px solid ${color};border-radius:0 8px 8px 0;padding:16px 20px;margin:24px 0">
  <div style="font-size:13px;color:#94a3b8;line-height:1.75">${text}</div>
</div>`;

const infoBox = (text, color="#38bdf8") => `
<div style="background:${color}06;border:1px solid ${color}15;border-radius:8px;padding:18px 22px;margin:24px 0">
  <div style="font-size:13px;color:#94a3b8;line-height:1.75">${text}</div>
</div>`;

const checklist = (items, color="#22c55e") => `
<div style="background:#060e1a;border:1px solid rgba(56,189,248,0.1);border-radius:8px;overflow:hidden;margin:24px 0">
  ${items.map((item,i) => `<div style="font-size:13px;color:#64748b;font-family:'Courier New',monospace;padding:12px 20px;border-bottom:${i<items.length-1?"1px solid rgba(56,189,248,0.04)":"none"};background:${i%2===0?"transparent":"rgba(56,189,248,0.015)"}"><span style="color:${color};margin-right:12px;font-weight:700">&#10003;</span>${item}</div>`).join("")}
</div>`;

const plansGrid = () => `
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:24px 0">
  <tr>
    <td width="48%" style="padding-right:8px">
      <div style="background:#060e1a;border:1px solid rgba(251,191,36,0.15);border-radius:8px;padding:16px;text-align:center">
        <div style="font-size:8px;letter-spacing:3px;color:#94a3b8;font-family:'Courier New',monospace;margin-bottom:6px">BRONZE</div>
        <div style="font-size:22px;font-weight:900;color:#fbbf24;font-family:'Courier New',monospace">20%</div>
        <div style="font-size:9px;color:#475569;font-family:'Courier New',monospace;margin-top:4px">15 DAYS &middot; FROM $100</div>
      </div>
    </td>
    <td width="48%" style="padding-left:8px">
      <div style="background:#060e1a;border:1px solid rgba(148,163,184,0.15);border-radius:8px;padding:16px;text-align:center">
        <div style="font-size:8px;letter-spacing:3px;color:#94a3b8;font-family:'Courier New',monospace;margin-bottom:6px">SILVER</div>
        <div style="font-size:22px;font-weight:900;color:#94a3b8;font-family:'Courier New',monospace">35%</div>
        <div style="font-size:9px;color:#475569;font-family:'Courier New',monospace;margin-top:4px">30 DAYS &middot; FROM $500</div>
      </div>
    </td>
  </tr>
  <tr><td height="12" colspan="2"></td></tr>
  <tr>
    <td width="48%" style="padding-right:8px">
      <div style="background:#060e1a;border:1px solid rgba(251,191,36,0.25);border-radius:8px;padding:16px;text-align:center">
        <div style="font-size:8px;letter-spacing:3px;color:#94a3b8;font-family:'Courier New',monospace;margin-bottom:6px">GOLD</div>
        <div style="font-size:22px;font-weight:900;color:#fbbf24;font-family:'Courier New',monospace">50%</div>
        <div style="font-size:9px;color:#475569;font-family:'Courier New',monospace;margin-top:4px">60 DAYS &middot; FROM $5,000</div>
      </div>
    </td>
    <td width="48%" style="padding-left:8px">
      <div style="background:linear-gradient(135deg,#060e1a,#0a1628);border:1px solid rgba(56,189,248,0.3);border-radius:8px;padding:16px;text-align:center;position:relative">
        <div style="position:absolute;top:-1px;left:50%;transform:translateX(-50%);background:#38bdf8;color:#030712;font-size:7px;letter-spacing:2px;font-family:'Courier New',monospace;padding:2px 10px;border-radius:0 0 6px 6px">TOP TIER</div>
        <div style="font-size:8px;letter-spacing:3px;color:#38bdf8;font-family:'Courier New',monospace;margin-bottom:6px;margin-top:8px">PLATINUM</div>
        <div style="font-size:22px;font-weight:900;color:#38bdf8;font-family:'Courier New',monospace">60%</div>
        <div style="font-size:9px;color:#475569;font-family:'Courier New',monospace;margin-top:4px">90 DAYS &middot; FROM $25,000</div>
      </div>
    </td>
  </tr>
</table>`;

const refBox = (code) => `
<div style="background:linear-gradient(135deg,rgba(14,165,233,0.05),rgba(245,158,11,0.05));border:1px solid rgba(56,189,248,0.15);border-radius:10px;padding:28px;text-align:center;margin:28px 0">
  <div style="font-size:8px;letter-spacing:5px;color:#475569;font-family:'Courier New',monospace;margin-bottom:14px">YOUR UNIQUE REFERRAL CODE</div>
  <div style="font-size:34px;font-weight:900;color:#38bdf8;font-family:'Courier New',monospace;letter-spacing:10px;background:rgba(56,189,248,0.06);border:1px solid rgba(56,189,248,0.12);border-radius:6px;padding:14px 20px;display:inline-block">${code}</div>
  <div style="font-size:12px;color:#475569;margin-top:14px">Share your link and earn <strong style="color:#fbbf24">5% commission</strong> on every deposit your referrals make</div>
  <div style="margin-top:14px;font-size:11px;color:#1e3a5f;font-family:'Courier New',monospace">nexvault.org/ref/${code}</div>
</div>`;

const cta = (text, url, color="#f59e0b") => `
<div style="text-align:center;margin-top:36px">
  <a href="${url}" style="display:inline-block;background:linear-gradient(135deg,${color},#fbbf24);color:#030712;font-weight:800;font-size:12px;letter-spacing:3px;text-decoration:none;padding:16px 44px;border-radius:6px;font-family:'Courier New',monospace;text-transform:uppercase">${text} &rarr;</a>
  <div style="font-size:9px;color:#1e3a5f;margin-top:12px;font-family:'Courier New',monospace;letter-spacing:2px">ENCRYPTED &middot; SSL SECURED &middot; NEXVAULT.ORG</div>
</div>`;

const divider = () => `<div style="border-top:1px solid rgba(56,189,248,0.07);margin:28px 0"></div>`;

const sectionTitle = (text, color="#38bdf8") => `
<div style="font-size:8px;letter-spacing:4px;color:${color};font-family:'Courier New',monospace;margin:28px 0 14px;text-transform:uppercase;display:flex;align-items:center;gap:8px">
  <span style="display:inline-block;width:20px;height:1px;background:${color}40;vertical-align:middle"></span>
  ${text}
  <span style="display:inline-block;width:20px;height:1px;background:${color}40;vertical-align:middle"></span>
</div>`;

// ── TEMPLATES ─────────────────────────────────────────────────

const templates = {

  welcome: (name, refCode) => ({
    subject: `Welcome to NexVault, ${name} — Your Investment Vault is Ready`,
    html: wrap(
      `Welcome to NexVault — your institutional-grade investment vault is now active`,
      hero("🏦", `Welcome, ${name}!`, "Account Activated · Vault Initialized", "#38bdf8") +
      p(`Your NexVault account has been successfully created and verified. You now have access to our institutional-grade automated investment platform — trusted by thousands of investors across 50+ countries.`) +
      infoBox(`<strong style="color:#f1f5f9">What is NexVault?</strong><br/>NexVault is a professional automated investment platform offering fixed-term plans with guaranteed ROI. Your funds are managed by our expert trading team and returns are credited daily to your account balance.`) +
      refBox(refCode) +
      divider() +
      sectionTitle("CHOOSE YOUR INVESTMENT PLAN") +
      plansGrid() +
      divider() +
      sectionTitle("YOUR QUICK START GUIDE") +
      checklist([
        "Step 1 — Complete KYC verification in your Profile section",
        "Step 2 — Navigate to Deposit & Invest on your dashboard",
        "Step 3 — Select your preferred investment plan",
        "Step 4 — Send crypto payment to the provided wallet address",
        "Step 5 — Admin confirms within 24hrs and your vault goes live",
        "Step 6 — Watch daily profits credited to your balance automatically",
      ], "#38bdf8") +
      alertBox(`&#128161; <strong style="color:#f1f5f9">Pro Tip:</strong> Complete your KYC verification first to unlock unlimited withdrawals, higher investment tiers, and priority support. It takes less than 5 minutes.`) +
      cta("LAUNCH MY VAULT", `${BASE_URL}/dashboard`)
    )
  }),

  loginAlert: (name, time, ip) => ({
    subject: `Security Alert — New Login to Your NexVault Account`,
    html: wrap(
      `A new login was detected on your NexVault account — please review`,
      hero("&#128274;", "Login Detected", "Security Notification · Review Immediately", "#ef4444") +
      p(`Hi <strong style="color:#f1f5f9">${name}</strong>, we detected a new sign-in to your NexVault account. If this was you, no action is required. If not, secure your account immediately.`) +
      statsCard([
        ["DATE & TIME", time, "#cbd5e1"],
        ["IP ADDRESS", ip, "#38bdf8"],
        ["PLATFORM", "NexVault Web", "#cbd5e1"],
        ["SESSION", "JWT Token Issued", "#cbd5e1"],
        ["STATUS", "&#10003; LOGIN SUCCESSFUL", "#22c55e"],
      ], "#ef4444", "LOGIN DETAILS") +
      alertBox(`<strong style="color:#f1f5f9">&#9888; Was this you?</strong> If you did not sign in from this IP address, your account may be compromised. Change your password immediately and contact us at <a href="mailto:support@nexvault.org" style="color:#f59e0b">support@nexvault.org</a> or on <a href="https://t.me/nextvaultsupport" style="color:#f59e0b">Telegram</a>.`, "#ef4444") +
      sectionTitle("SECURITY RECOMMENDATIONS", "#ef4444") +
      checklist([
        "Use a strong, unique password for NexVault",
        "Never share your login credentials with anyone",
        "Log out from devices you no longer use",
        "Contact support immediately if you notice unauthorized activity",
      ], "#ef4444") +
      cta("SECURE MY ACCOUNT", `${BASE_URL}/dashboard`, "#ef4444")
    )
  }),

  depositReceived: (name, amount, plan, method) => ({
    subject: `Deposit Received — $${Number(amount).toLocaleString()} Pending Verification`,
    html: wrap(
      `Your $${Number(amount).toLocaleString()} deposit is under review — activation within 24 hours`,
      hero("&#128229;", "Deposit Received!", "Pending Admin Verification · Up to 24 Hours", "#f59e0b") +
      p(`Hi <strong style="color:#f1f5f9">${name}</strong>, we have received your deposit and investment request. Our compliance team is reviewing your payment and will activate your vault within 24 hours.`) +
      bigStat("DEPOSIT AMOUNT", `$${Number(amount).toLocaleString()}`, "Pending verification") +
      statsCard([
        ["AMOUNT SUBMITTED", `$${Number(amount).toLocaleString()}`, "#fbbf24"],
        ["INVESTMENT PLAN", `${(plan||"").toUpperCase()} VAULT`, "#cbd5e1"],
        ["PAYMENT METHOD", (method||"CRYPTO").toUpperCase(), "#cbd5e1"],
        ["SUBMISSION TIME", new Date().toUTCString(), "#94a3b8"],
        ["REVIEW STATUS", "&#9203; UNDER REVIEW", "#f59e0b"],
        ["ESTIMATED ACTIVATION", "Within 24 Hours", "#94a3b8"],
      ], "#f59e0b", "DEPOSIT SUMMARY") +
      alertBox(`<strong style="color:#f1f5f9">&#128204; Important:</strong> Please do NOT send another payment. Your deposit is being processed. Once verified by our team, your investment will be activated and you will receive a confirmation email immediately.`) +
      sectionTitle("WHAT HAPPENS NEXT") +
      checklist([
        "Our compliance team reviews your payment on the blockchain",
        "Your investment plan is activated in your dashboard",
        "You receive a confirmation email with your investment details",
        "Daily ROI profits begin crediting to your balance automatically",
        "You can track everything in real-time from your dashboard",
      ], "#f59e0b") +
      cta("TRACK MY DEPOSIT", `${BASE_URL}/dashboard`)
    )
  }),

  depositApproved: (name, amount, plan, roi, days) => ({
    subject: `Investment Activated — Your ${(plan||"").toUpperCase()} VAULT is Now Live!`,
    html: wrap(
      `Your investment is live and generating daily returns — congratulations!`,
      hero("&#128640;", "Investment Activated!", `${(plan||"").toUpperCase()} Vault is Live`, "#22c55e") +
      p(`Congratulations <strong style="color:#f1f5f9">${name}</strong>! Your deposit has been verified and your ${(plan||"").toUpperCase()} VAULT investment is now active. Your vault is already generating daily returns.`) +
      bigStat("PROJECTED TOTAL RETURN", `$${(Number(amount)*(1+Number(roi)/100)).toLocaleString()}`, `After ${days} days at ${roi}% ROI`, "#22c55e") +
      statsCard([
        ["AMOUNT INVESTED", `$${Number(amount).toLocaleString()}`, "#fbbf24"],
        ["INVESTMENT PLAN", `${(plan||"").toUpperCase()} VAULT`, "#cbd5e1"],
        ["RETURN ON INVESTMENT", `${roi}%`, "#22c55e"],
        ["DURATION", `${days} Days`, "#cbd5e1"],
        ["DAILY PROFIT CREDIT", `$${((Number(amount)*(Number(roi)/100))/Number(days)).toFixed(2)}`, "#38bdf8"],
        ["TOTAL PROFIT AT MATURITY", `$${(Number(amount)*(Number(roi)/100)).toLocaleString()}`, "#22c55e"],
        ["MATURITY VALUE", `$${(Number(amount)*(1+Number(roi)/100)).toLocaleString()}`, "#fbbf24"],
        ["STATUS", "&#10003; ACTIVE & RUNNING", "#22c55e"],
      ], "#22c55e", "INVESTMENT BREAKDOWN") +
      infoBox(`<strong style="color:#f1f5f9">&#128200; Daily Compounding:</strong> Your daily profit of <strong style="color:#22c55e">$${((Number(amount)*(Number(roi)/100))/Number(days)).toFixed(2)}</strong> is automatically credited to your balance every 24 hours. Log in to your dashboard to track your live returns.`) +
      alertBox(`&#128293; <strong style="color:#f1f5f9">Maximize your returns:</strong> Reinvest your daily profits or refer friends to earn an additional <strong style="color:#fbbf24">5% commission</strong> on their deposits. Your referral link is available in your dashboard.`, "#22c55e") +
      cta("TRACK MY INVESTMENT", `${BASE_URL}/dashboard`)
    )
  }),

  withdrawalApproved: (name, amount, method) => ({
    subject: `Withdrawal Approved — $${Number(amount).toLocaleString()} is Being Processed`,
    html: wrap(
      `Your withdrawal of $${Number(amount).toLocaleString()} has been approved and is processing`,
      hero("&#128184;", "Withdrawal Approved!", "Funds Processing · Arriving Within 24 Hours", "#22c55e") +
      p(`Hi <strong style="color:#f1f5f9">${name}</strong>, great news! Your withdrawal request has been reviewed and approved by our finance team. Your funds are now being processed and sent to your wallet.`) +
      bigStat("WITHDRAWAL AMOUNT", `$${Number(amount).toLocaleString()}`, "Approved and processing") +
      statsCard([
        ["WITHDRAWAL AMOUNT", `$${Number(amount).toLocaleString()}`, "#fbbf24"],
        ["PAYMENT METHOD", (method||"CRYPTO").toUpperCase(), "#cbd5e1"],
        ["TRANSACTION FEE", "None — Zero Fees", "#22c55e"],
        ["APPROVAL STATUS", "&#10003; APPROVED", "#22c55e"],
        ["PROCESSING TIME", "1 — 24 Hours", "#94a3b8"],
        ["SUPPORT", "support@nexvault.org", "#38bdf8"],
      ], "#22c55e", "WITHDRAWAL DETAILS") +
      alertBox(`<strong style="color:#f1f5f9">&#8987; Processing times:</strong> Cryptocurrency withdrawals typically arrive within 1-3 hours. If you have not received your funds after 24 hours, please contact our support team at <a href="mailto:support@nexvault.org" style="color:#f59e0b">support@nexvault.org</a> or reach us instantly on <a href="https://t.me/nextvaultsupport" style="color:#f59e0b">Telegram</a>.`) +
      sectionTitle("AFTER YOUR WITHDRAWAL") +
      checklist([
        "Check your crypto wallet or bank account for the incoming transfer",
        "Allow up to 24 hours for blockchain confirmations",
        "Contact support immediately if funds are not received within 24 hours",
        "Consider reinvesting to continue growing your wealth on NexVault",
      ], "#22c55e") +
      cta("VIEW MY ACCOUNT", `${BASE_URL}/dashboard`)
    )
  }),

  kycApproved: (name) => ({
    subject: `KYC Verified — Full Premium Access Unlocked on NexVault`,
    html: wrap(
      `Your identity has been verified — full premium access is now active`,
      hero("&#9989;", "Identity Verified!", "KYC Complete · Premium Access Unlocked", "#22c55e") +
      p(`Congratulations <strong style="color:#f1f5f9">${name}</strong>! Your identity verification has been successfully completed. You now have full unrestricted access to all NexVault features and premium investment tiers.`) +
      bigStat("ACCOUNT STATUS", "VERIFIED", "Premium investor access active", "#22c55e") +
      sectionTitle("PREMIUM FEATURES NOW UNLOCKED") +
      checklist([
        "Unlimited withdrawal amounts — no daily caps or restrictions",
        "Access to Gold Vault — 50% ROI over 60 days",
        "Access to Platinum Vault — 60% ROI over 90 days (highest tier)",
        "Priority customer support — dedicated response within 1 hour",
        "Verified investor badge displayed on your profile",
        "Enhanced referral program — earn 5% on all referral deposits",
        "Advanced portfolio analytics and performance reporting",
        "Early access to new investment products and features",
      ]) +
      alertBox(`&#128640; <strong style="color:#f1f5f9">Ready to maximize returns?</strong> With your verified status, you can now access our highest-yield Platinum Vault offering 60% ROI. Log in to your dashboard to start your premium investment journey.`, "#22c55e") +
      cta("ACCESS PREMIUM VAULT", `${BASE_URL}/dashboard`)
    )
  }),

  kycRejected: (name, reason) => ({
    subject: `KYC Update Required — Resubmission Needed on Your NexVault Account`,
    html: wrap(
      `Your KYC documents need updating — please resubmit to unlock full access`,
      hero("&#9888;&#65039;", "Action Required", "KYC Resubmission Needed · Follow Steps Below", "#ef4444") +
      p(`Hi <strong style="color:#f1f5f9">${name}</strong>, our compliance team was unable to verify your submitted identity documents. Please review the reason below and resubmit with corrected documentation to unlock your full account access.`) +
      statsCard([
        ["VERIFICATION STATUS", "&#10007; REQUIRES UPDATE", "#ef4444"],
        ["REASON FOR REJECTION", reason || "Document unclear or incomplete", "#94a3b8"],
        ["RESUBMISSION DEADLINE", "No deadline — submit at your earliest", "#f59e0b"],
        ["NEXT STEP", "Resubmit via Profile & KYC", "#f59e0b"],
      ], "#ef4444", "VERIFICATION RESULT") +
      sectionTitle("RESUBMISSION CHECKLIST", "#ef4444") +
      checklist([
        "Government-issued ID is valid, current and not expired",
        "All four corners of the document are clearly visible in the photo",
        "Image is sharp — no blur, glare, shadows or cropping",
        "File is under 3MB in JPG, PNG or PDF format",
        "Name on document exactly matches your NexVault account name",
        "For selfie — face and document are both clearly visible together",
        "Do not submit screenshots of photos — use original files only",
      ], "#f59e0b") +
      alertBox(`&#128172; <strong style="color:#f1f5f9">Need help?</strong> If you are unsure what documents to submit or need assistance with your verification, our support team is available 24/7 at <a href="mailto:support@nexvault.org" style="color:#f59e0b">support@nexvault.org</a> or on <a href="https://t.me/nextvaultsupport" style="color:#f59e0b">Telegram</a>.`, "#ef4444") +
      cta("RESUBMIT MY DOCUMENTS", `${BASE_URL}/dashboard`, "#ef4444")
    )
  }),

  roiCredited: (name, amount, plan, totalProfit) => ({
    subject: `Daily Profit Credited — +$${Number(amount).toFixed(2)} Added to Your NexVault Balance`,
    html: wrap(
      `Your daily investment return of +$${Number(amount).toFixed(2)} has been credited to your account`,
      hero("&#128176;", "Profit Credited!", `Daily Return from ${(plan||"").toUpperCase()} Vault`, "#fbbf24") +
      p(`Hi <strong style="color:#f1f5f9">${name}</strong>, your daily investment return has been automatically calculated and credited to your NexVault balance. Your vault is working hard for you.`) +
      bigStat("TODAY'S PROFIT", `+$${Number(amount).toFixed(2)}`, `Total earned to date: $${Number(totalProfit).toLocaleString()}`, "#22c55e") +
      statsCard([
        ["DAILY PROFIT CREDITED", `+$${Number(amount).toFixed(2)}`, "#22c55e"],
        ["ACTIVE INVESTMENT PLAN", `${(plan||"").toUpperCase()} VAULT`, "#cbd5e1"],
        ["TOTAL PROFIT EARNED", `$${Number(totalProfit).toLocaleString()}`, "#fbbf24"],
        ["CREDIT TIME", new Date().toUTCString(), "#94a3b8"],
        ["PROFIT STATUS", "&#10003; CREDITED TO BALANCE", "#22c55e"],
      ], "#fbbf24", "PROFIT SUMMARY") +
      infoBox(`<strong style="color:#f1f5f9">&#128200; Your wealth is growing.</strong> Daily profits are credited automatically every 24 hours. Log in to your dashboard to view your live balance, track investment progress, and withdraw your earnings at any time.`) +
      alertBox(`&#9889; <strong style="color:#f1f5f9">Compound your returns:</strong> Reinvest your accumulated profits into a new plan to compound your earnings. Upgrade to a higher vault tier to earn up to <strong style="color:#fbbf24">60% ROI</strong> with our Platinum Vault.`, "#fbbf24") +
      cta("VIEW MY PORTFOLIO", `${BASE_URL}/dashboard`)
    )
  }),

};

// ── SEND ──────────────────────────────────────────────────────

const sendEmail = async (to, subject, html) => {
  if (!process.env.RESEND_API_KEY) { console.log("[EMAIL SKIPPED] No API key. To:", to); return; }
  const payload = JSON.stringify({ from: "NexVault <support@nexvault.org>", to: [to], subject, html });
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: "api.resend.com", path: "/emails", method: "POST",
      headers: { "Authorization": "Bearer " + process.env.RESEND_API_KEY, "Content-Type": "application/json", "Content-Length": Buffer.byteLength(payload) }
    }, (res) => {
      let data = "";
      res.on("data", c => data += c);
      res.on("end", () => {
        if (res.statusCode >= 200 && res.statusCode < 300) { console.log("[EMAIL SENT] To:", to); resolve(data); }
        else { console.log("[EMAIL ERROR]", res.statusCode, data); reject(new Error(data)); }
      });
    });
    req.on("error", reject);
    req.setTimeout(15000, () => { req.destroy(); reject(new Error("Timeout")); });
    req.write(payload); req.end();
  });
};

const sendTemplate = async (templateName, to, ...args) => {
  const t = templates[templateName];
  if (!t) { console.log("[EMAIL] Unknown template:", templateName); return; }
  const { subject, html } = t(...args);
  return sendEmail(to, subject, html);
};

module.exports = { sendEmail, sendTemplate, templates };
'''

pathlib.Path('server/utils/email.js').write_text(content, encoding='utf-8')
print('Done: server/utils/email.js updated')
