const express = require('express');
const router = express.Router();

const TELEGRAM_URL = 'https://t.me/nexvaultsupport';

const faqs = [
  { keywords: ['minimum','min deposit','least','start investing'], answer: 'The minimum deposit at NexVault is $100 for our Bronze plan. You can start earning 20% ROI in just 15 days.' },
  { keywords: ['plans','packages','investment plan','tiers'], answer: 'We have 4 plans: Bronze 20% ROI 15 days $100-$999, Silver 35% ROI 30 days $500-$4999, Gold 50% ROI 60 days $5000-$24999, Platinum 60% ROI 90 days $25000-$500000.' },
  { keywords: ['roi','returns','profit','earn','interest','percentage'], answer: 'ROI ranges from 20% to 60% depending on your plan. Profits are credited daily to your dashboard balance.' },
  { keywords: ['withdraw','withdrawal','cashout','payout','cash out'], answer: 'Withdrawals are processed within 24 hours. Go to your dashboard, click Withdraw, enter your wallet address. Minimum withdrawal is $50.' },
  { keywords: ['how long','duration','days','maturity','period'], answer: 'Plans run 15 to 90 days. Bronze: 15 days, Silver: 30 days, Gold: 60 days, Platinum: 90 days.' },
  { keywords: ['kyc','verify','verification','identity','document','id card'], answer: 'KYC is required before withdrawals. Upload a valid government ID in the Profile section of your dashboard. Verification takes up to 24 hours.' },
  { keywords: ['register','sign up','create account','join','get started'], answer: 'Click Register on the homepage, fill in your name, email and password. You will get a welcome email and can start investing immediately.' },
  { keywords: ['login','sign in','forgot password','reset password'], answer: 'Visit nexvault.org/login and enter your email and password. Use Forgot Password if needed and check your email for a reset link.' },
  { keywords: ['crypto','bitcoin','btc','ethereum','eth','usdt','trc20','wallet','payment method'], answer: 'We accept Bitcoin BTC, Ethereum ETH, and USDT TRC20/ERC20. Your deposit wallet address is shown in the dashboard after selecting a plan.' },
  { keywords: ['safe','secure','legit','trust','real','scam','reliable'], answer: 'NexVault uses SSL encryption, JWT authentication, and KYC verification. Our support team is reachable 24/7 via Telegram.' },
  { keywords: ['referral','refer','affiliate','commission','bonus'], answer: 'Earn 5% commission on every deposit made by investors you refer. Find your referral link in the Referral section of your dashboard.' },
  { keywords: ['google','google login','oauth'], answer: 'Yes, you can sign in with Google. Click Continue with Google on the login or register page.' },
  { keywords: ['contact','email support','reach us','help'], answer: 'Email us at support@nexvault.org or click the Telegram button below to chat with a live agent right now.' },
  { keywords: ['reinvest','compound','roll over'], answer: 'Yes! When your plan matures you can reinvest your balance into any plan from your dashboard to compound your returns.' },
  { keywords: ['dashboard','balance','portfolio'], answer: 'Your dashboard shows live balance, ROI earned, active investments, and transaction history. Log in at nexvault.org/login.' },
  { keywords: ['deposit','fund account','add money','top up'], answer: 'Go to Dashboard, click Deposit and Invest, choose your plan, enter the amount, pick your crypto, and send to the wallet address shown.' }
];

function findAnswer(message) {
  const msg = message.toLowerCase();
  for (const faq of faqs) {
    for (const kw of faq.keywords) {
      if (msg.includes(kw)) return faq.answer;
    }
  }
  return null;
}

router.post('/chat', (req, res) => {
  const { message } = req.body;
  if (!message || typeof message !== 'string') return res.json({ type: 'error', reply: 'Invalid message.' });
  const msg = message.toLowerCase().trim();

  if (/^(hi|hello|hey|good morning|good evening|good afternoon|hola|sup|howdy)/.test(msg)) {
    return res.json({ type: 'text', reply: 'Hello! Welcome to NexVault. I am your 24/7 support assistant. Ask me about investment plans, deposits, withdrawals, KYC, or anything else!' });
  }

  if (/human|agent|real person|live support|live chat|talk to someone|speak to|staff|operator/.test(msg)) {
    return res.json({ type: 'telegram', reply: 'Connecting you to a live agent now! Our team is on Telegram and responds within minutes.', telegramUrl: TELEGRAM_URL });
  }

  const answer = findAnswer(message);
  if (answer) return res.json({ type: 'text', reply: answer, showTelegram: true });

  return res.json({ type: 'fallback', reply: 'I am not sure about that one. Our live agents on Telegram can help you instantly!', telegramUrl: TELEGRAM_URL });
});

module.exports = router;
