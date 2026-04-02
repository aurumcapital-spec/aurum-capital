const https = require("https");

const sendEmail = async (to, subject, htmlBody) => {
  if (!process.env.RESEND_API_KEY) {
    console.log("[EMAIL SKIPPED] No RESEND_API_KEY. To:", to, "Subject:", subject);
    return;
  }
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

  const payload = JSON.stringify({
    from: "NexVault <support@nexvault.org>",
    to: [to],
    subject,
    html: wrap(htmlBody)
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
          console.log("[EMAIL SENT] To:", to, "Subject:", subject);
          resolve(data);
        } else {
          console.log("[EMAIL ERROR]", res.statusCode, data);
          reject(new Error("Resend error: " + data));
        }
      });
    });
    req.on("error", reject);
    req.setTimeout(15000, () => { req.destroy(); reject(new Error("Request timeout")); });
    req.write(payload);
    req.end();
  });
};

module.exports = { sendEmail, emails: {} };
