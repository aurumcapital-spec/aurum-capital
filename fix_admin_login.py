import pathlib

path = pathlib.Path('server/public/admin.html')
content = path.read_text(encoding='utf-8')

# ── 1. Replace the token check and add admin login overlay ───────────────────
old_auth = """const API="/api",token=localStorage.getItem("nexvault_token");
if(!token)window.location.href="/login";"""

new_auth = """const API="/api";
let token=localStorage.getItem("nexvault_token");

// ── ADMIN AUTH GATE ──────────────────────────────────────────
async function checkAdminAccess(){
  if(!token){showAdminLoginOverlay();return false;}
  try{
    const r=await fetch(API+"/auth/verify",{headers:{Authorization:"Bearer "+token}});
    const d=await r.json();
    if(!d.valid||d.user.role!=="admin"){
      localStorage.removeItem("nexvault_token");
      showAdminLoginOverlay();
      return false;
    }
    hideAdminLoginOverlay();
    return true;
  }catch(e){showAdminLoginOverlay();return false;}
}

function showAdminLoginOverlay(){
  document.getElementById("admin-login-overlay").style.display="flex";
  document.querySelector(".sidebar").style.display="none";
  document.querySelector(".main").style.display="none";
}

function hideAdminLoginOverlay(){
  document.getElementById("admin-login-overlay").style.display="none";
  document.querySelector(".sidebar").style.display="flex";
  document.querySelector(".main").style.display="flex";
}

async function adminLoginSubmit(){
  const email=document.getElementById("admin-email").value.trim();
  const password=document.getElementById("admin-password").value;
  const btn=document.getElementById("admin-login-btn");
  const err=document.getElementById("admin-login-error");
  if(!email||!password){err.textContent="Enter email and password.";err.style.display="block";return;}
  btn.textContent="AUTHENTICATING...";btn.disabled=true;err.style.display="none";
  try{
    const r=await fetch(API+"/auth/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email,password})});
    const d=await r.json();
    if(!r.ok){err.textContent=d.message||"Login failed.";err.style.display="block";btn.textContent="ACCESS VAULT";btn.disabled=false;return;}
    if(d.user&&d.user.role!=="admin"&&!(d.token&&await verifyAdminToken(d.token))){
      err.textContent="Access denied. Admin credentials required.";err.style.display="block";btn.textContent="ACCESS VAULT";btn.disabled=false;return;
    }
    token=d.token;
    localStorage.setItem("nexvault_token",token);
    const check=await checkAdminAccess();
    if(check){window.location.reload();}
    else{err.textContent="Access denied. Not an admin account.";err.style.display="block";btn.textContent="ACCESS VAULT";btn.disabled=false;}
  }catch(e){err.textContent="Server error. Try again.";err.style.display="block";btn.textContent="ACCESS VAULT";btn.disabled=false;}
}

async function verifyAdminToken(t){
  try{const r=await fetch(API+"/auth/verify",{headers:{Authorization:"Bearer "+t}});const d=await r.json();return d.valid&&d.user.role==="admin";}
  catch(e){return false;}
}

document.addEventListener("keydown",function(e){if(e.key==="Enter"&&document.getElementById("admin-login-overlay").style.display!=="none")adminLoginSubmit();});"""

if 'showAdminLoginOverlay' not in content:
    content = content.replace(old_auth, new_auth)
    print('Auth gate added')
else:
    print('Auth gate already exists')

# ── 2. Replace DOMContentLoaded to check admin first ─────────────────────────
old_load = 'window.addEventListener("DOMContentLoaded",()=>{loadOverview();loadUsers();loadTransactionsList();});'
new_load = '''window.addEventListener("DOMContentLoaded",async()=>{
  const ok=await checkAdminAccess();
  if(ok){loadOverview();loadUsers();loadTransactionsList();}
});'''

if 'checkAdminAccess' not in content or old_load in content:
    content = content.replace(old_load, new_load)
    print('DOMContentLoaded patched')
else:
    print('DOMContentLoaded already patched')

# ── 3. Add admin login overlay HTML before </body> ───────────────────────────
login_overlay = """
<!-- ADMIN LOGIN OVERLAY -->
<div id="admin-login-overlay" style="display:none;position:fixed;inset:0;z-index:99999;background:#010208;align-items:center;justify-content:center;font-family:Rajdhani,sans-serif">
  <div style="width:100%;max-width:420px;padding:20px">

    <!-- Logo -->
    <div style="text-align:center;margin-bottom:36px">
      <div style="font-family:Orbitron,monospace;font-size:2rem;font-weight:900;letter-spacing:4px;margin-bottom:8px">
        <span style="color:#ef4444">NEX</span><span style="color:#fbbf24">VAULT</span>
      </div>
      <div style="font-size:0.7rem;letter-spacing:5px;color:#334155;font-family:monospace">ADMIN CONTROL PANEL</div>
    </div>

    <!-- Card -->
    <div style="background:rgba(3,7,18,0.98);border:1px solid rgba(239,68,68,0.2);border-radius:8px;padding:36px;box-shadow:0 0 60px rgba(239,68,68,0.08)">

      <!-- Top bar -->
      <div style="background:linear-gradient(90deg,#ef4444,#f59e0b);height:2px;border-radius:2px;margin-bottom:28px"></div>

      <div style="display:flex;align-items:center;gap:10px;margin-bottom:28px">
        <div style="width:36px;height:36px;border-radius:50%;background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);display:flex;align-items:center;justify-content:center;font-size:1rem">&#128274;</div>
        <div>
          <div style="font-family:Orbitron,monospace;font-size:0.85rem;font-weight:700;color:#f1f5f9">RESTRICTED ACCESS</div>
          <div style="font-size:0.7rem;color:#475569;font-family:monospace">Admin credentials required</div>
        </div>
        <div style="margin-left:auto;padding:3px 10px;background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.2);border-radius:10px;font-family:monospace;font-size:0.6rem;color:#ef4444">&#9679; SECURE</div>
      </div>

      <!-- Error -->
      <div id="admin-login-error" style="display:none;background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.2);border-left:3px solid #ef4444;border-radius:0 4px 4px 0;padding:10px 14px;margin-bottom:20px;font-size:0.82rem;color:#ef4444;font-family:monospace"></div>

      <!-- Email -->
      <div style="margin-bottom:16px">
        <label style="font-family:monospace;font-size:0.65rem;letter-spacing:3px;color:#475569;display:block;margin-bottom:8px">ADMIN EMAIL</label>
        <input id="admin-email" type="email" placeholder="admin@nexvault.io" autocomplete="username"
          style="width:100%;padding:12px 16px;background:rgba(239,68,68,0.04);border:1px solid rgba(239,68,68,0.2);border-radius:4px;color:#f0f9ff;font-size:0.95rem;outline:none;font-family:inherit;box-sizing:border-box"
          onfocus="this.style.borderColor='rgba(239,68,68,0.5)'" onblur="this.style.borderColor='rgba(239,68,68,0.2)'"/>
      </div>

      <!-- Password -->
      <div style="margin-bottom:24px">
        <label style="font-family:monospace;font-size:0.65rem;letter-spacing:3px;color:#475569;display:block;margin-bottom:8px">ADMIN PASSWORD</label>
        <input id="admin-password" type="password" placeholder="••••••••" autocomplete="current-password"
          style="width:100%;padding:12px 16px;background:rgba(239,68,68,0.04);border:1px solid rgba(239,68,68,0.2);border-radius:4px;color:#f0f9ff;font-size:0.95rem;outline:none;font-family:inherit;box-sizing:border-box"
          onfocus="this.style.borderColor='rgba(239,68,68,0.5)'" onblur="this.style.borderColor='rgba(239,68,68,0.2)'"/>
      </div>

      <!-- Button -->
      <button id="admin-login-btn" onclick="adminLoginSubmit()"
        style="width:100%;padding:14px;background:linear-gradient(135deg,#ef4444,#dc2626);color:#fff;font-family:Orbitron,monospace;font-size:0.75rem;font-weight:700;letter-spacing:3px;border:none;border-radius:4px;cursor:pointer;transition:opacity 0.2s"
        onmouseover="this.style.opacity='0.9'" onmouseout="this.style.opacity='1'">
        ACCESS VAULT &rarr;
      </button>

      <div style="text-align:center;margin-top:20px;font-family:monospace;font-size:0.65rem;color:#1e3a5f;letter-spacing:2px">
        NEXVAULT ADMIN &middot; AUTHORIZED PERSONNEL ONLY
      </div>
    </div>
  </div>
</div>
"""

if 'admin-login-overlay' not in content:
    content = content.replace('</body>', login_overlay + '\n</body>')
    print('Login overlay added')
else:
    print('Login overlay already exists')

path.write_text(content, encoding='utf-8')
print('Done: admin.html updated')
