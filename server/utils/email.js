const nodemailer = require("nodemailer");
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});
const sendEmail = async (to, subject, htmlBody) => {
  if (!process.env.SMTP_USER) { console.log(`[EMAIL SKIPPED] To: ${to} | Subject: ${subject}`); return; }
  await transporter.sendMail({
    from: `"NexVault" <${process.env.SMTP_USER}>`, to, subject,
    html: `<div style="font-family:Arial,sans-serif;max-width:600px;background:#010208;color:#f0f9ff;padding:40px;border:1px solid rgba(14,165,233,0.2)"><div style="font-family:monospace;font-size:1.4rem;font-weight:900;margin-bottom:24px"><span style="color:#38bdf8">NEX</span><span style="color:#fbbf24">VAULT</span></div>${htmlBody}<div style="margin-top:40px;padding-top:20px;border-top:1px solid rgba(14,165,233,0.1);font-size:0.8rem;color:#94a3b8">© 2030 NexVault</div></div>`
  });
};
module.exports = { sendEmail };
