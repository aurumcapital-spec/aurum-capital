import pathlib, re

path = pathlib.Path('server/public/dashboard.html')
content = path.read_text(encoding='utf-8')

# ── 1. REPLACE entire old chat block (bubble + window + socket script) ────────
old_chat_start = '<style>.chat-bubble{'
old_chat_end = 'handleResize();\n</script>'

start_idx = content.find(old_chat_start)
end_idx = content.find(old_chat_end)

if start_idx == -1 or end_idx == -1:
    print('ERROR: Could not find old chat block markers')
    print('start found:', start_idx != -1)
    print('end found:', end_idx != -1)
else:
    end_idx += len(old_chat_end)
    new_chat = '''<script>
// ── BOT CHAT ──────────────────────────────────────────────────────────────────
(function () {
  var TELEGRAM_URL = 'https://t.me/nextvaultsupport';
  var API_URL = '/api/chatbot/chat';
  var css = "#nv-bot-bubble{position:fixed;bottom:24px;right:24px;z-index:9999;width:54px;height:54px;border-radius:50%;background:linear-gradient(135deg,#0ea5e9,#38bdf8);box-shadow:0 0 24px rgba(14,165,233,0.5);cursor:pointer;display:flex;align-items:center;justify-content:center;border:none;color:#010208;font-size:1.4rem;transition:transform 0.2s}" +
    "#nv-bot-bubble:hover{transform:scale(1.1)}" +
    "#nv-bot-badge{position:absolute;top:-3px;right:-3px;background:#ef4444;color:#fff;border-radius:50%;width:18px;height:18px;font-size:10px;font-weight:700;display:none;align-items:center;justify-content:center;font-family:sans-serif;border:2px solid #010208}" +
    "#nv-bot-window{position:fixed;bottom:90px;right:24px;z-index:9998;width:340px;max-height:500px;background:rgba(3,7,18,0.98);border:1px solid rgba(14,165,233,0.25);border-radius:10px;box-shadow:0 8px 40px rgba(0,0,0,0.5);display:none;flex-direction:column;overflow:hidden;font-family:Rajdhani,Segoe UI,sans-serif;backdrop-filter:blur(20px)}" +
    "#nv-bot-window.open{display:flex}" +
    "#nv-bot-header{padding:14px 16px;display:flex;align-items:center;gap:10px;border-bottom:1px solid rgba(14,165,233,0.15);background:rgba(14,165,233,0.05)}" +
    ".nvb-avatar{width:34px;height:34px;border-radius:50%;background:linear-gradient(135deg,#f59e0b,#fbbf24);display:flex;align-items:center;justify-content:center;font-weight:900;color:#010208;font-size:0.75rem;flex-shrink:0}" +
    ".nvb-title{color:#f0f9ff;font-size:0.85rem;font-weight:700;font-family:Orbitron,monospace}" +
    ".nvb-online{font-size:0.65rem;color:#22c55e;font-family:monospace}" +
    "#nv-bot-close{margin-left:auto;background:none;border:none;color:#94a3b8;cursor:pointer;font-size:1.1rem}" +
    "#nv-bot-msgs{flex:1;overflow-y:auto;padding:12px;display:flex;flex-direction:column;gap:10px;min-height:180px;max-height:280px}" +
    ".nvb-msg{display:flex;gap:8px;align-items:flex-end}" +
    ".nvb-msg.user{flex-direction:row-reverse}" +
    ".nvb-bubble{max-width:82%;padding:9px 12px;border-radius:12px;font-size:0.88rem;line-height:1.5;color:#f0f9ff;background:rgba(14,165,233,0.1);border:1px solid rgba(14,165,233,0.15)}" +
    ".nvb-msg.user .nvb-bubble{background:linear-gradient(135deg,#0ea5e9,#38bdf8);color:#010208;border:none;border-bottom-right-radius:3px}" +
    ".nvb-msg.bot .nvb-bubble{border-bottom-left-radius:3px}" +
    ".nvb-tg-btn{display:inline-flex;align-items:center;gap:6px;margin-top:8px;padding:7px 14px;border-radius:6px;background:#0088cc;color:#fff;font-size:0.8rem;font-weight:600;text-decoration:none}" +
    ".nvb-tg-small{display:inline-flex;align-items:center;gap:5px;margin-top:7px;padding:5px 10px;border-radius:6px;background:rgba(0,136,204,0.15);color:#38bdf8;font-size:0.75rem;text-decoration:none;border:1px solid rgba(0,136,204,0.3)}" +
    ".nvb-typing{display:flex;gap:4px;padding:10px 14px;background:rgba(14,165,233,0.08);border:1px solid rgba(14,165,233,0.15);border-radius:12px;border-bottom-left-radius:3px;width:fit-content}" +
    ".nvb-dot{width:6px;height:6px;border-radius:50%;background:#38bdf8;animation:nvbB 1.2s infinite ease-in-out}" +
    ".nvb-dot:nth-child(2){animation-delay:0.2s}.nvb-dot:nth-child(3){animation-delay:0.4s}" +
    "@keyframes nvbB{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-6px)}}" +
    "#nv-bot-quickbtns{padding:8px 12px 0;display:flex;flex-wrap:wrap;gap:6px}" +
    ".nvb-quick{padding:4px 10px;border-radius:14px;font-size:0.75rem;cursor:pointer;background:rgba(14,165,233,0.08);border:1px solid rgba(14,165,233,0.2);color:#38bdf8;white-space:nowrap}" +
    "#nv-bot-inputrow{padding:10px 12px;border-top:1px solid rgba(14,165,233,0.12);display:flex;gap:8px;align-items:center}" +
    "#nv-bot-input{flex:1;padding:8px 14px;border-radius:20px;font-size:0.85rem;background:rgba(14,165,233,0.05);border:1px solid rgba(14,165,233,0.2);color:#f0f9ff;outline:none;font-family:inherit}" +
    "#nv-bot-input::placeholder{color:#475569}" +
    "#nv-bot-input:focus{border-color:rgba(14,165,233,0.5)}" +
    "#nv-bot-send{width:36px;height:36px;border-radius:50%;border:none;background:linear-gradient(135deg,#0ea5e9,#38bdf8);cursor:pointer;color:#010208;font-size:1rem;flex-shrink:0}" +
    "@media(max-width:480px){#nv-bot-window{width:calc(100vw - 20px);right:10px;bottom:80px}#nv-bot-bubble{bottom:16px;right:16px}}";

  var quickReplies = ['Investment plans','How to deposit','Withdraw funds','KYC verification','Minimum deposit','Talk to agent'];

  function init() {
    var s = document.createElement('style'); s.textContent = css; document.head.appendChild(s);

    var bubble = document.createElement('button');
    bubble.id = 'nv-bot-bubble';
    bubble.setAttribute('aria-label','Open support chat');
    bubble.innerHTML = '&#128172;<span id="nv-bot-badge"></span>';
    document.body.appendChild(bubble);

    var win = document.createElement('div');
    win.id = 'nv-bot-window';
    win.innerHTML =
      '<div id="nv-bot-header"><div class="nvb-avatar">NV</div>' +
      '<div><div class="nvb-title">NEXVAULT SUPPORT</div><div class="nvb-online">&#9679; Online 24/7 — Bot + Live Agent</div></div>' +
      '<button id="nv-bot-close">&#10005;</button></div>' +
      '<div id="nv-bot-quickbtns">' + quickReplies.map(function(q){return '<button class="nvb-quick">'+q+'</button>';}).join('') + '</div>' +
      '<div id="nv-bot-msgs"></div>' +
      '<div id="nv-bot-inputrow"><input id="nv-bot-input" type="text" placeholder="Ask me anything..." maxlength="300" autocomplete="off"/>' +
      '<button id="nv-bot-send">&#10148;</button></div>';
    document.body.appendChild(win);

    var msgs = document.getElementById('nv-bot-msgs');
    var input = document.getElementById('nv-bot-input');
    var badge = document.getElementById('nv-bot-badge');
    var opened = false;

    function openBot() {
      win.classList.add('open'); badge.style.display = 'none'; opened = true;
      if (!msgs.children.length) {
        setTimeout(function(){
          botMsg('Hello! Welcome to NexVault. I am your 24/7 support assistant.<br><br>I can guide you on how to invest, deposit, withdraw and more. Or click <b>Talk to agent</b> to reach a live person on Telegram!', false);
        }, 350);
      }
      setTimeout(function(){ input.focus(); }, 300);
    }
    function closeBot() { win.classList.remove('open'); }

    bubble.addEventListener('click', function(){ win.classList.contains('open') ? closeBot() : openBot(); });
    document.getElementById('nv-bot-close').addEventListener('click', closeBot);
    document.getElementById('nv-bot-send').addEventListener('click', handleSend);
    input.addEventListener('keydown', function(e){ if(e.key==='Enter'){e.preventDefault();handleSend();} });
    document.querySelectorAll('.nvb-quick').forEach(function(btn){
      btn.addEventListener('click', function(){ userMsg(btn.textContent); fetchReply(btn.textContent); });
    });

    function userMsg(text) {
      var d = document.createElement('div'); d.className = 'nvb-msg user';
      d.innerHTML = '<div class="nvb-bubble">'+text+'</div>';
      msgs.appendChild(d); msgs.scrollTop = msgs.scrollHeight;
    }
    function botMsg(html, withTg) {
      var d = document.createElement('div'); d.className = 'nvb-msg bot';
      var b = document.createElement('div'); b.className = 'nvb-bubble'; b.innerHTML = html;
      if (withTg) { b.innerHTML += '<br><a href="'+TELEGRAM_URL+'" target="_blank" rel="noopener" class="nvb-tg-small">&#9992; Chat with live agent</a>'; }
      d.appendChild(b); msgs.appendChild(d); msgs.scrollTop = msgs.scrollHeight;
    }
    function botTgMsg(html, url) {
      var d = document.createElement('div'); d.className = 'nvb-msg bot';
      var b = document.createElement('div'); b.className = 'nvb-bubble';
      b.innerHTML = html + '<br><a href="'+(url||TELEGRAM_URL)+'" target="_blank" rel="noopener" class="nvb-tg-btn">&#9992; Open Telegram Chat</a>';
      d.appendChild(b); msgs.appendChild(d); msgs.scrollTop = msgs.scrollHeight;
    }
    function showTyping() {
      var d = document.createElement('div'); d.className = 'nvb-msg bot'; d.id = 'nvb-typing';
      d.innerHTML = '<div class="nvb-typing"><div class="nvb-dot"></div><div class="nvb-dot"></div><div class="nvb-dot"></div></div>';
      msgs.appendChild(d); msgs.scrollTop = msgs.scrollHeight;
    }
    function hideTyping() { var el=document.getElementById('nvb-typing'); if(el) el.remove(); }

    async function fetchReply(text) {
      showTyping();
      try {
        var res = await fetch(API_URL, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({message:text}) });
        var data = await res.json();
        hideTyping();
        if (data.type==='telegram'||data.type==='fallback') { botTgMsg(data.reply, data.telegramUrl); }
        else { botMsg(data.reply, data.showTelegram||false); }
      } catch(e) { hideTyping(); botTgMsg('Sorry, having trouble connecting. Reach us on Telegram!'); }
    }
    function handleSend() {
      var text = input.value.trim(); if(!text) return;
      input.value = ''; userMsg(text); fetchReply(text);
    }
    setTimeout(function(){ if(!opened){badge.style.display='flex';badge.textContent='1';} }, 4000);
  }

  if (document.readyState==='loading') { document.addEventListener('DOMContentLoaded',init); } else { init(); }
})();
</script>

<script>
function toggleMobileSidebar() {
  const sidebar = document.querySelector('.sidebar');
  const overlay = document.getElementById('mobile-overlay');
  sidebar.classList.toggle('open');
  overlay.classList.toggle('open');
}
document.querySelectorAll('.nav-item').forEach(btn => {
  btn.addEventListener('click', () => {
    if (window.innerWidth <= 768) {
      document.querySelector('.sidebar').classList.remove('open');
      document.getElementById('mobile-overlay').classList.remove('open');
    }
  });
});
function updateMobileAvatar(initials) {
  const mob = document.getElementById('mobile-avatar');
  if (mob) mob.textContent = initials;
}
function handleResize() {
  const main = document.querySelector('.main');
  if (window.innerWidth <= 768) { main.style.paddingTop = '56px'; }
  else { main.style.paddingTop = '0'; }
}
window.addEventListener('resize', handleResize);
handleResize();
</script>'''

    content = content[:start_idx] + new_chat + content[end_idx:]
    print('Chat block replaced successfully')

# ── 2. ADD MOBILE CSS fixes ───────────────────────────────────────────────────
mobile_css = """
@media(max-width:768px){
  body{font-size:14px}
  .content{padding:16px}
  .stats-grid{grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px}
  .stat-card{padding:14px}
  .stat-value{font-size:1.3rem!important}
  .stat-label{font-size:0.6rem}
  .stat-icon{font-size:1.1rem;top:12px;right:12px}
  .grid-2,.grid-3{grid-template-columns:1fr;gap:16px}
  .card{padding:16px}
  .card-title{font-size:0.78rem}
  .invest-plans{grid-template-columns:1fr 1fr;gap:10px}
  .invest-plan{padding:14px}
  .invest-plan-roi{font-size:1.2rem}
  .invest-plan-name{font-size:0.75rem}
  .btn{font-size:0.65rem;padding:10px 18px}
  .tx-table th{font-size:0.55rem;padding:6px 8px}
  .tx-table td{font-size:0.78rem;padding:8px}
  .tx-type{font-size:0.55rem;padding:2px 6px}
  .form-input,.form-select{font-size:0.9rem;padding:10px 12px}
  .referral-stats{grid-template-columns:1fr}
  .withdraw-info-row{font-size:0.82rem}
  .active-plan{padding:14px}
  .plan-amount{font-size:1.1rem}
  .page-title{font-size:0.8rem}
  .topbar{padding:12px 16px}
  .nav-item{padding:10px 16px;font-size:0.82rem}
  .sidebar-logo{padding:20px 16px}
  .logo-text{font-size:1rem}
  .user-name{font-size:0.7rem}
  .sidebar-footer{padding:14px 16px}
}
@media(max-width:400px){
  .stats-grid{grid-template-columns:1fr}
  .invest-plans{grid-template-columns:1fr}
  .stat-value{font-size:1.1rem!important}
}
"""

if '@media(max-width:768px)' not in content:
    content = content.replace('</style>', mobile_css + '\n</style>', 1)
    print('Mobile CSS added')
else:
    print('Mobile CSS already present')

path.write_text(content, encoding='utf-8')
print('Done: dashboard.html updated')
