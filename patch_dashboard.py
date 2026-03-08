path = r'C:\Users\hp\Documents\aurum-capital\server\public\dashboard.html'
with open(path,'r',encoding='utf-8') as f: txt=f.read()
txt=txt.replace('\r\n','\n')
s=txt.find('async function submitDeposit() {')
e=txt.find('async function submitWithdraw() {')
print('start:',s,'end:',e)
new=("async function submitDeposit() {\n"
"  if (!selectedPlan) { showToast('Select a plan first', true); return; }\n"
"  const amount = parseFloat(document.getElementById('deposit-amount').value);\n"
"  const method = document.getElementById('payment-method').value;\n"
"  if (!amount || amount < selectedPlan.min) { showToast('Minimum: $'+selectedPlan.min, true); return; }\n"
"  if (amount > selectedPlan.max) { showToast('Maximum: $'+selectedPlan.max, true); return; }\n"
"  if (!method) { showToast('Select payment method', true); return; }\n"
"  const wallets = window._wallets || [];\n"
"  const wallet = wallets.find(w => w.method === method);\n"
"  document.getElementById('wm-amount').textContent = '$' + amount.toLocaleString('en',{minimumFractionDigits:2});\n"
"  document.getElementById('wm-plan').textContent = selectedPlan.name.toUpperCase() + ' VAULT - ' + selectedPlan.roi + '% ROI';\n"
"  document.getElementById('wm-method-label').textContent = wallet ? wallet.label : method.toUpperCase();\n"
"  document.getElementById('wm-address').textContent = wallet ? wallet.address : 'Contact support';\n"
"  window._pendingDeposit = { amount, plan_name: selectedPlan.name, payment_method: method };\n"
"  document.getElementById('wallet-modal').style.display = 'flex';\n"
"}\n"
"function closeWalletModal() { document.getElementById('wallet-modal').style.display = 'none'; }\n"
"function copyWalletAddr() { navigator.clipboard.writeText(document.getElementById('wm-address').textContent).then(() => showToast('Address copied!')); }\n"
"async function confirmDeposit() {\n"
"  const btn = document.getElementById('wm-confirm-btn');\n"
"  btn.textContent = 'SUBMITTING...'; btn.disabled = true;\n"
"  const { amount, plan_name, payment_method } = window._pendingDeposit;\n"
"  try {\n"
"    const res = await fetch(API+'/transactions/deposit', {\n"
"      method: 'POST',\n"
"      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer '+token },\n"
"      body: JSON.stringify({ amount, plan_name, payment_method })\n"
"    });\n"
"    const data = await res.json();\n"
"    if (res.ok) { closeWalletModal(); showToast('Deposit submitted!'); loadUserData(); loadTransactions(); showPage('overview'); }\n"
"    else { showToast(data.message||'Deposit failed',true); btn.textContent='I HAVE SENT PAYMENT'; btn.disabled=false; }\n"
"  } catch(e) { showToast('Network error',true); btn.textContent='I HAVE SENT PAYMENT'; btn.disabled=false; }\n"
"}\n")
modal=(
'<div id="wallet-modal" style="display:none;position:fixed;inset:0;background:rgba(1,2,8,0.92);'
'backdrop-filter:blur(12px);z-index:9000;align-items:center;justify-content:center">'
'<div style="background:rgba(3,7,18,0.99);border:1px solid rgba(14,165,233,0.25);border-radius:6px;padding:32px;max-width:480px;width:90%">'
'<div style="font-size:0.9rem;font-weight:700;color:#f0f9ff;margin-bottom:6px">SEND PAYMENT</div>'
'<div style="font-size:0.65rem;color:#94a3b8;margin-bottom:20px">Send exact amount to complete deposit</div>'
'<div style="padding:14px;background:rgba(245,158,11,0.05);border:1px solid rgba(245,158,11,0.2);border-radius:4px;margin-bottom:16px">'
'<div style="display:flex;justify-content:space-between;margin-bottom:8px">'
'<span style="font-size:0.65rem;color:#94a3b8">AMOUNT</span>'
'<span id="wm-amount" style="font-size:1rem;font-weight:900;color:#fbbf24"></span></div>'
'<div style="display:flex;justify-content:space-between">'
'<span style="font-size:0.65rem;color:#94a3b8">PLAN</span>'
'<span id="wm-plan" style="font-size:0.75rem;color:#f0f9ff"></span></div></div>'
'<div style="font-size:0.65rem;color:#94a3b8;margin-bottom:4px">METHOD</div>'
'<div id="wm-method-label" style="font-size:0.75rem;color:#38bdf8;margin-bottom:10px"></div>'
'<div style="font-size:0.65rem;color:#94a3b8;margin-bottom:6px">SEND TO ADDRESS</div>'
'<div style="display:flex;gap:8px;margin-bottom:16px">'
'<div id="wm-address" style="font-family:monospace;font-size:0.8rem;color:#38bdf8;word-break:break-all;'
'padding:12px;background:rgba(14,165,233,0.05);border:1px solid rgba(14,165,233,0.2);border-radius:4px;flex:1"></div>'
'<button onclick="copyWalletAddr()" style="padding:10px 14px;background:rgba(14,165,233,0.1);'
'border:1px solid rgba(14,165,233,0.3);color:#38bdf8;font-size:0.65rem;border-radius:4px;cursor:pointer">COPY</button></div>'
'<div style="padding:10px;border-left:3px solid #f59e0b;font-size:0.8rem;color:#94a3b8;margin-bottom:20px">'
'Send exact amount. Admin verifies within 24hrs.</div>'
'<div style="display:flex;gap:10px">'
'<button onclick="closeWalletModal()" style="flex:1;padding:12px;background:transparent;'
'border:1px solid rgba(148,163,184,0.2);color:#94a3b8;font-size:0.7rem;border-radius:2px;cursor:pointer">CANCEL</button>'
'<button onclick="confirmDeposit()" id="wm-confirm-btn" style="flex:2;padding:12px;'
'background:linear-gradient(135deg,#f59e0b,#fbbf24);color:#010208;font-size:0.75rem;font-weight:700;'
'border:none;border-radius:2px;cursor:pointer">I HAVE SENT PAYMENT</button>'
'</div></div></div>')
txt=txt[:s]+new+txt[e:]
txt=txt.replace('</body>',modal+'\n</body>')
with open(path,'w',encoding='utf-8') as f: f.write(txt)
print('SUCCESS')
print('submitDeposit:',txt.count('submitDeposit'))
print('wallet-modal:',txt.count('wallet-modal'))
print('confirmDeposit:',txt.count('confirmDeposit'))
print('size:',len(txt))
