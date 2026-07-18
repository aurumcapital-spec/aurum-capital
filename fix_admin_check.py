import pathlib

path = pathlib.Path('server/public/admin.html')
content = path.read_text(encoding='utf-8')

# Fix: don't check d.user.role (it's not in login response)
# Instead just store the token and let checkAdminAccess verify via /verify endpoint
old_check = """    if(!r.ok){err.textContent=d.message||"Login failed.";err.style.display="block";btn.textContent="ACCESS VAULT";btn.disabled=false;return;}
    if(d.user&&d.user.role!=="admin"&&!(d.token&&await verifyAdminToken(d.token))){
      err.textContent="Access denied. Admin credentials required.";err.style.display="block";btn.textContent="ACCESS VAULT";btn.disabled=false;return;
    }
    token=d.token;
    localStorage.setItem("nexvault_token",token);
    const check=await checkAdminAccess();
    if(check){window.location.reload();}
    else{err.textContent="Access denied. Not an admin account.";err.style.display="block";btn.textContent="ACCESS VAULT";btn.disabled=false;}"""

new_check = """    if(!r.ok){err.textContent=d.message||"Login failed.";err.style.display="block";btn.textContent="ACCESS VAULT";btn.disabled=false;return;}
    if(!d.token){err.textContent="Login failed. No token received.";err.style.display="block";btn.textContent="ACCESS VAULT";btn.disabled=false;return;}
    token=d.token;
    localStorage.setItem("nexvault_token",token);
    const check=await checkAdminAccess();
    if(check){window.location.reload();}
    else{
      localStorage.removeItem("nexvault_token");
      token=null;
      err.textContent="Access denied. Admin credentials required.";
      err.style.display="block";
      btn.textContent="ACCESS VAULT";
      btn.disabled=false;
    }"""

if 'd.user&&d.user.role' in content:
    content = content.replace(old_check, new_check)
    print('Admin login check fixed')
else:
    print('Pattern not found - trying alternative')
    # Try a broader replace
    content = content.replace(
        'if(d.user&&d.user.role!=="admin"&&!(d.token&&await verifyAdminToken(d.token))){',
        'if(false){'
    )
    print('Applied fallback fix')

path.write_text(content, encoding='utf-8')
print('Done')
