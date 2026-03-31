const nodemailer = require('./node_modules/nodemailer');

const t = nodemailer.createTransport({
  host: '52.25.137.212',
  port: 587,
  secure: false,
  auth: {
    user: 'support@nexvault.org',
    pass: 'Realworld@09876'
  },
  tls: {
    rejectUnauthorized: false
  },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 10000
});

t.verify((err, success) => {
  if (err) {
    console.error('VERIFY FAILED:', err.message);
  } else {
    console.log('Server is ready, sending...');
    t.sendMail({
      from: 'support@nexvault.org',
      to: 'support@nexvault.org',
      subject: 'NexVault Test',
      html: '<h2>It works!</h2>'
    })
    .then(() => console.log('EMAIL SENT!'))
    .catch(e => console.error('SEND FAILED:', e.message));
  }
});
