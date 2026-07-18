import pathlib

path = pathlib.Path('server/public/admin.html')
content = path.read_text(encoding='utf-8')

# Fix: hide sidebar and main initially, show only after successful auth check
old_sidebar = '<aside class="sidebar">'
new_sidebar = '<aside class="sidebar" style="display:none">'

old_main = '<div class="main">'
new_main = '<div class="main" style="display:none">'

if 'class="sidebar" style="display:none"' not in content:
    content = content.replace(old_sidebar, new_sidebar, 1)
    content = content.replace(old_main, new_main, 1)
    print('Sidebar and main hidden initially')
else:
    print('Already hidden')

# Fix hideAdminLoginOverlay to also init socket chat
old_hide = """function hideAdminLoginOverlay(){
  document.getElementById("admin-login-overlay").style.display="none";
  document.querySelector(".sidebar").style.display="flex";
  document.querySelector(".main").style.display="flex";
}"""

new_hide = """function hideAdminLoginOverlay(){
  const overlay = document.getElementById("admin-login-overlay");
  if(overlay) overlay.style.display="none";
  document.querySelector(".sidebar").style.display="flex";
  document.querySelector(".main").style.display="flex";
}"""

if old_hide in content:
    content = content.replace(old_hide, new_hide)
    print('hideAdminLoginOverlay fixed')

# Fix DOMContentLoaded to also init chat after successful load
old_dom = """window.addEventListener("DOMContentLoaded",async()=>{
  const ok=await checkAdminAccess();
  if(ok){loadOverview();loadUsers();loadTransactionsList();}
});"""

new_dom = """window.addEventListener("DOMContentLoaded",async()=>{
  const ok=await checkAdminAccess();
  if(ok){
    loadOverview();
    loadUsers();
    loadTransactionsList();
    setTimeout(initAdminChat, 800);
  }
});"""

if old_dom in content:
    content = content.replace(old_dom, new_dom)
    print('DOMContentLoaded fixed')
else:
    print('DOMContentLoaded pattern not found - checking...')
    if 'if(ok){loadOverview' in content:
        content = content.replace(
            'if(ok){loadOverview();loadUsers();loadTransactionsList();}',
            'if(ok){loadOverview();loadUsers();loadTransactionsList();setTimeout(initAdminChat,800);}'
        )
        print('Applied inline fix')

path.write_text(content, encoding='utf-8')
print('Done')
