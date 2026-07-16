import pathlib

content = """\
(function () {
  var TELEGRAM_URL = 'https://t.me/nexvaultsupport';
  var API_URL = '/api/chatbot/chat';

  var css = `
    #nv-bot-bubble {
      position: fixed; bottom: 24px; right: 24px; z-index: 9999;
      width: 54px; height: 54px; border-radius: 50%;
      background: linear-gradient(135deg, #0ea5e9, #38bdf8);
      box-shadow: 0 0 24px rgba(14,165,233,0.5);
      cursor: pointer; display: flex; align-items: center; justify-content: center;
      border: none; transition: transform 0.2s, box-shadow 0.2s; color: #010208; font-size: 1.4rem;
    }
    #nv-bot-bubble:hover { transform: scale(1.1); box-shadow: 0 0 36px rgba(14,165,233,0.7); }
    #nv-bot-badge {
      position: absolute; top: -3px; right: -3px;
      background: #ef4444; color: #fff; border-radius: 50%;
      width: 18px; height: 18px; font-size: 10px; font-weight: 700;
      display: none; align-items: center; justify-content: center;
      font-family: sans-serif; border: 2px solid #010208;
    }
    #nv-bot-window {
      position: fixed; bottom: 90px; right: 24px; z-index: 9998;
      width: 340px; max-height: 500px;
      background: rgba(3,7,18,0.98); border: 1px solid rgba(14,165,233,0.25);
      border-radius: 10px; box-shadow: 0 8px 40px rgba(0,0,0,0.5);
      display: none; flex-direction: column; overflow: hidden;
      font-family: 'Rajdhani', 'Segoe UI', sans-serif;
      backdrop-filter: blur(20px);
    }
    #nv-bot-window.open { display: flex; }
    #nv-bot-header {
      padding: 14px 16px; display: flex; align-items: center; gap: 10px;
      border-bottom: 1px solid rgba(14,165,233,0.15);
      background: rgba(14,165,233,0.05);
    }
    .nvb-avatar {
      width: 34px; height: 34px; border-radius: 50%;
      background: linear-gradient(135deg, #f59e0b, #fbbf24);
      display: flex; align-items: center; justify-content: center;
      font-weight: 900; color: #010208; font-size: 0.75rem; flex-shrink: 0;
      font-family: 'Orbitron', monospace;
    }
    .nvb-title { color: #f0f9ff; font-size: 0.85rem; font-weight: 700; font-family: 'Orbitron', monospace; }
    .nvb-status { font-size: 0.65rem; color: #22c55e; font-family: monospace; }
    #nv-bot-close { margin-left: auto; background: none; border: none; color: #94a3b8; cursor: pointer; font-size: 1.1rem; }
    #nv-bot-close:hover { color: #f0f9ff; }
    #nv-bot-msgs {
      flex: 1; overflow-y: auto; padding: 12px;
      display: flex; flex-direction: column; gap: 10px;
      min-height: 180px; max-height: 280px;
    }
    #nv-bot-msgs::-webkit-scrollbar { width: 4px; }
    #nv-bot-msgs::-webkit-scrollbar-track { background: transparent; }
    #nv-bot-msgs::-webkit-scrollbar-thumb { background: rgba(14,165,233,0.3); border-radius: 2px; }
    .nvb-msg { display: flex; gap: 8px; align-items: flex-end; }
    .nvb-msg.user { flex-direction: row-reverse; }
    .nvb-bubble {
      max-width: 80%; padding: 9px 12px; border-radius: 12px;
      font-size: 0.88rem; line-height: 1.5; color: #f0f9ff;
      background: rgba(14,165,233,0.1); border: 1px solid rgba(14,165,233,0.15);
    }
    .nvb-msg.user .nvb-bubble {
      background: linear-gradient(135deg, #0ea5e9, #38bdf8);
      color: #010208; border: none; border-bottom-right-radius: 3px;
    }
    .nvb-msg.bot .nvb-bubble { border-bottom-left-radius: 3px; }
    .nvb-tg-btn {
      display: inline-flex; align-items: center; gap: 6px;
      margin-top: 8px; padding: 7px 14px; border-radius: 6px;
      background: #0088cc; color: #fff; font-size: 0.8rem; font-weight: 600;
      text-decoration: none; border: none; cursor: pointer;
    }
    .nvb-tg-btn:hover { background: #0077b6; }
    .nvb-tg-small {
      display: inline-flex; align-items: center; gap: 5px;
      margin-top: 7px; padding: 5px 10px; border-radius: 6px;
      background: rgba(0,136,204,0.15); color: #38bdf8;
      font-size: 0.75rem; text-decoration: none;
      border: 1px solid rgba(0,136,204,0.3);
    }
    .nvb-typing {
      display: flex; gap: 4px; padding: 10px 14px;
      background: rgba(14,165,233,0.08); border: 1px solid rgba(14,165,233,0.15);
      border-radius: 12px; border-bottom-left-radius: 3px; width: fit-content;
    }
    .nvb-dot {
      width: 6px; height: 6px; border-radius: 50%; background: #38bdf8;
      animation: nvbBounce 1.2s infinite ease-in-out;
    }
    .nvb-dot:nth-child(2) { animation-delay: 0.2s; }
    .nvb-dot:nth-child(3) { animation-delay: 0.4s; }
    @keyframes nvbBounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-6px)} }
    #nv-bot-quickbtns { padding: 8px 12px 0; display: flex; flex-wrap: wrap; gap: 6px; }
    .nvb-quick {
      padding: 4px 10px; border-radius: 14px; font-size: 0.75rem; cursor: pointer;
      background: rgba(14,165,233,0.08); border: 1px solid rgba(14,165,233,0.2);
      color: #38bdf8; white-space: nowrap; transition: background 0.15s;
    }
    .nvb-quick:hover { background: rgba(14,165,233,0.18); }
    #nv-bot-inputrow {
      padding: 10px 12px; border-top: 1px solid rgba(14,165,233,0.12);
      display: flex; gap: 8px; align-items: center;
    }
    #nv-bot-input {
      flex: 1; padding: 8px 14px; border-radius: 20px; font-size: 0.85rem;
      background: rgba(14,165,233,0.05); border: 1px solid rgba(14,165,233,0.2);
      color: #f0f9ff; outline: none; font-family: inherit;
    }
    #nv-bot-input::placeholder { color: #475569; }
    #nv-bot-input:focus { border-color: rgba(14,165,233,0.5); }
    #nv-bot-send {
      width: 36px; height: 36px; border-radius: 50%; border: none;
      background: linear-gradient(135deg, #0ea5e9, #38bdf8);
      cursor: pointer; color: #010208; font-size: 1rem; flex-shrink: 0;
      transition: transform 0.15s;
    }
    #nv-bot-send:hover { transform: scale(1.08); }
    @media (max-width: 400px) {
      #nv-bot-window { width: calc(100vw - 20px); right: 10px; bottom: 80px; }
      #nv-bot-bubble { bottom: 16px; right: 16px; }
    }
  `;

  var quickReplies = ['Investment plans', 'How to deposit', 'Withdraw funds', 'KYC verification', 'Minimum deposit'];

  function init() {
    var style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);

    var bubble = document.createElement('button');
    bubble.id = 'nv-bot-bubble';
    bubble.setAttribute('aria-label', 'Open support chat');
    bubble.innerHTML = '&#128172;<span id="nv-bot-badge"></span>';
    document.body.appendChild(bubble);

    var win = document.createElement('div');
    win.id = 'nv-bot-window';
    win.innerHTML =
      '<div id="nv-bot-header">' +
        '<div class="nvb-avatar">NV</div>' +
        '<div><div class="nvb-title">NEXVAULT SUPPORT</div><div class="nvb-status">&#9679; Online 24/7</div></div>' +
        '<button id="nv-bot-close" aria-label="Close">&#10005;</button>' +
      '</div>' +
      '<div id="nv-bot-quickbtns">' +
        quickReplies.map(function(q){ return '<button class="nvb-quick">' + q + '</button>'; }).join('') +
      '</div>' +
      '<div id="nv-bot-msgs"></div>' +
      '<div id="nv-bot-inputrow">' +
        '<input id="nv-bot-input" type="text" placeholder="Ask me anything..." maxlength="300" autocomplete="off"/>' +
        '<button id="nv-bot-send" aria-label="Send">&#10148;</button>' +
      '</div>';
    document.body.appendChild(win);

    var msgs = document.getElementById('nv-bot-msgs');
    var input = document.getElementById('nv-bot-input');
    var badge = document.getElementById('nv-bot-badge');
    var opened = false;

    function openBot() {
      win.classList.add('open');
      badge.style.display = 'none';
      opened = true;
      if (msgs.children.length === 0) {
        setTimeout(function() {
          botMsg('Hello! Welcome to NexVault. I am your 24/7 support assistant.<br>Ask me about plans, deposits, withdrawals, KYC, or anything else!', false);
        }, 350);
      }
      setTimeout(function(){ input.focus(); }, 300);
    }

    function closeBot() { win.classList.remove('open'); }

    bubble.addEventListener('click', function() {
      win.classList.contains('open') ? closeBot() : openBot();
    });
    document.getElementById('nv-bot-close').addEventListener('click', closeBot);
    document.getElementById('nv-bot-send').addEventListener('click', handleSend);
    input.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') { e.preventDefault(); handleSend(); }
    });
    document.querySelectorAll('.nvb-quick').forEach(function(btn) {
      btn.addEventListener('click', function() {
        userMsg(btn.textContent);
        fetchReply(btn.textContent);
      });
    });

    function userMsg(text) {
      var d = document.createElement('div');
      d.className = 'nvb-msg user';
      d.innerHTML = '<div class="nvb-bubble">' + text + '</div>';
      msgs.appendChild(d);
      msgs.scrollTop = msgs.scrollHeight;
    }

    function botMsg(html, withTg) {
      var d = document.createElement('div');
      d.className = 'nvb-msg bot';
      var bub = document.createElement('div');
      bub.className = 'nvb-bubble';
      bub.innerHTML = html;
      if (withTg) {
        var a = document.createElement('div');
        a.innerHTML = '<br><a href="' + TELEGRAM_URL + '" target="_blank" rel="noopener" class="nvb-tg-small">&#9992; Chat with live agent</a>';
        bub.appendChild(a);
      }
      d.appendChild(bub);
      msgs.appendChild(d);
      msgs.scrollTop = msgs.scrollHeight;
    }

    function botTgMsg(html, url) {
      var d = document.createElement('div');
      d.className = 'nvb-msg bot';
      var bub = document.createElement('div');
      bub.className = 'nvb-bubble';
      bub.innerHTML = html;
      var a = document.createElement('div');
      a.innerHTML = '<br><a href="' + (url || TELEGRAM_URL) + '" target="_blank" rel="noopener" class="nvb-tg-btn">&#9992; Open Telegram Chat</a>';
      bub.appendChild(a);
      d.appendChild(bub);
      msgs.appendChild(d);
      msgs.scrollTop = msgs.scrollHeight;
    }

    function showTyping() {
      var d = document.createElement('div');
      d.className = 'nvb-msg bot'; d.id = 'nvb-typing';
      d.innerHTML = '<div class="nvb-typing"><div class="nvb-dot"></div><div class="nvb-dot"></div><div class="nvb-dot"></div></div>';
      msgs.appendChild(d); msgs.scrollTop = msgs.scrollHeight;
    }
    function hideTyping() { var el = document.getElementById('nvb-typing'); if(el) el.remove(); }

    async function fetchReply(text) {
      showTyping();
      try {
        var res = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: text })
        });
        var data = await res.json();
        hideTyping();
        if (data.type === 'telegram' || data.type === 'fallback') {
          botTgMsg(data.reply, data.telegramUrl);
        } else {
          botMsg(data.reply, data.showTelegram || false);
        }
      } catch(e) {
        hideTyping();
        botTgMsg('Sorry, I am having trouble connecting. Please reach us on Telegram!');
      }
    }

    function handleSend() {
      var text = input.value.trim();
      if (!text) return;
      input.value = '';
      userMsg(text);
      fetchReply(text);
    }

    setTimeout(function() {
      if (!opened) { badge.style.display = 'flex'; badge.textContent = '1'; }
    }, 4000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else { init(); }
})();
"""

import pathlib
pathlib.Path('server/public/chat-widget.js').write_text(content, encoding='utf-8')
print('Done: server/public/chat-widget.js created')
