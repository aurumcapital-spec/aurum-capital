import pathlib

path = pathlib.Path('server/public/admin.html')
content = path.read_text(encoding='utf-8')

# ── 1. Add Visitors nav item after the wallets nav ────────────────────────────
old_nav = '    <button class="nav-item" id="nav-settings" onclick="showPage(\'settings\')">⚙ Settings</button>'
new_nav = '''    <button class="nav-item" id="nav-visitors" onclick="showPage(\'visitors\')">🌍 Visitors <span class="nav-count" id="visitors-nav-count">0</span></button>
    <button class="nav-item" id="nav-settings" onclick="showPage(\'settings\')">⚙ Settings</button>'''

if 'nav-visitors' not in content:
    content = content.replace(old_nav, new_nav)
    print('Nav item added')
else:
    print('Nav item already exists')

# ── 2. Add Visitors page before closing </div> of content ────────────────────
visitors_page = '''
      <!-- VISITORS PAGE -->
      <div class="page" id="page-visitors">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px">
          <div>
            <div style="font-family:Orbitron,monospace;font-size:1rem;font-weight:700">Site Visitors</div>
            <div style="font-size:0.8rem;color:#94a3b8;margin-top:4px">Real-time visitor tracking with country flags</div>
          </div>
          <div style="display:flex;gap:10px;align-items:center">
            <div style="background:rgba(34,197,94,0.08);border:1px solid rgba(34,197,94,0.2);border-radius:4px;padding:6px 14px;font-family:monospace;font-size:0.75rem;color:#22c55e">
              <span id="visitors-page-count">0</span> TOTAL VISITORS
            </div>
            <button onclick="clearVisitorLog()" style="padding:6px 14px;background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.2);border-radius:4px;color:#ef4444;font-family:monospace;font-size:0.7rem;cursor:pointer">CLEAR LOG</button>
          </div>
        </div>
        <div class="card" style="padding:0;overflow:hidden">
          <div style="padding:14px 16px;border-bottom:1px solid rgba(14,165,233,0.1);display:flex;gap:10px;align-items:center">
            <input id="visitor-search" type="text" placeholder="Search by country, city or IP..." onkeyup="filterVisitors()" style="flex:1;padding:8px 12px;background:rgba(14,165,233,0.04);border:1px solid rgba(14,165,233,0.15);border-radius:4px;color:#f0f9ff;font-size:0.85rem;outline:none"/>
            <select id="visitor-filter" onchange="filterVisitors()" style="padding:8px 12px;background:rgba(14,165,233,0.04);border:1px solid rgba(14,165,233,0.15);border-radius:4px;color:#f0f9ff;font-size:0.85rem;outline:none;cursor:pointer">
              <option value="all">All Pages</option>
              <option value="/">Landing</option>
              <option value="/login">Login</option>
              <option value="/register">Register</option>
              <option value="/dashboard">Dashboard</option>
            </select>
          </div>
          <table style="width:100%;border-collapse:collapse">
            <thead>
              <tr style="border-bottom:1px solid rgba(14,165,233,0.12)">
                <th style="padding:10px 16px;font-family:Share Tech Mono,monospace;font-size:0.6rem;color:#94a3b8;text-align:left;letter-spacing:0.15em">FLAG</th>
                <th style="padding:10px 16px;font-family:Share Tech Mono,monospace;font-size:0.6rem;color:#94a3b8;text-align:left;letter-spacing:0.15em">COUNTRY</th>
                <th style="padding:10px 16px;font-family:Share Tech Mono,monospace;font-size:0.6rem;color:#94a3b8;text-align:left;letter-spacing:0.15em">CITY</th>
                <th style="padding:10px 16px;font-family:Share Tech Mono,monospace;font-size:0.6rem;color:#94a3b8;text-align:left;letter-spacing:0.15em">IP ADDRESS</th>
                <th style="padding:10px 16px;font-family:Share Tech Mono,monospace;font-size:0.6rem;color:#94a3b8;text-align:left;letter-spacing:0.15em">PAGE</th>
                <th style="padding:10px 16px;font-family:Share Tech Mono,monospace;font-size:0.6rem;color:#94a3b8;text-align:left;letter-spacing:0.15em">ISP</th>
                <th style="padding:10px 16px;font-family:Share Tech Mono,monospace;font-size:0.6rem;color:#94a3b8;text-align:left;letter-spacing:0.15em">TIME</th>
              </tr>
            </thead>
            <tbody id="visitors-table-body">
              <tr><td colspan="7" style="text-align:center;padding:40px;color:#94a3b8;font-family:monospace;font-size:0.75rem">No visitors yet. Waiting for traffic...</td></tr>
            </tbody>
          </table>
        </div>
      </div>
'''

anchor = '<!-- VISITOR LOG TABLE (in overview) -->'
if 'page-visitors' not in content:
    content = content.replace(anchor, visitors_page + '\n' + anchor)
    print('Visitors page added')
else:
    print('Visitors page already exists')

# ── 3. Patch showPage() to handle visitors tab ───────────────────────────────
old_show = "function showPage(p){"
new_show = """function showPage(p){
  if(p==='visitors'){renderVisitorsTable(_visitorLog);}"""

if "if(p==='visitors')" not in content:
    content = content.replace(old_show, new_show)
    print('showPage patched')
else:
    print('showPage already patched')

# ── 4. Patch updateVisitorLog to also update the visitors page ────────────────
old_update = "function updateVisitorLog(data) {"
new_update = """function updateVisitorLog(data) {
  // Update visitors nav badge
  const nb = document.getElementById('visitors-nav-count');
  if (nb) { nb.textContent = _visitorLog.length + 1; }
  const pc = document.getElementById('visitors-page-count');
  if (pc) { pc.textContent = _visitorLog.length + 1; }"""

if "visitors-nav-count" not in content:
    content = content.replace(old_update, new_update)
    print('updateVisitorLog patched')
else:
    print('updateVisitorLog already patched')

# ── 5. Add renderVisitorsTable and filterVisitors functions before </script> at end ──
new_funcs = """
function renderVisitorsTable(data) {
  const tb = document.getElementById('visitors-table-body');
  if (!tb) return;
  if (!data || !data.length) {
    tb.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:40px;color:#94a3b8;font-family:monospace;font-size:0.75rem">No visitors yet. Waiting for traffic...</td></tr>';
    return;
  }
  tb.innerHTML = data.map(function(v) {
    const pageLabel = v.page === '/' ? 'Landing' : (v.page || '/').replace('/','').charAt(0).toUpperCase() + (v.page || '/').replace('/','').slice(1);
    const pageColor = v.page === '/dashboard' ? '#22c55e' : v.page === '/register' ? '#f59e0b' : '#38bdf8';
    return '<tr style="border-bottom:1px solid rgba(14,165,233,0.05)">' +
      '<td style="padding:12px 16px;font-size:1.4rem">' + (v.flag || '🌍') + '</td>' +
      '<td style="padding:12px 16px;font-size:0.85rem;color:#f0f9ff;font-weight:600">' + (v.country || 'Unknown') + '</td>' +
      '<td style="padding:12px 16px;font-size:0.82rem;color:#94a3b8">' + (v.city || 'Unknown') + (v.region ? ', ' + v.region : '') + '</td>' +
      '<td style="padding:12px 16px;font-family:monospace;font-size:0.78rem;color:#38bdf8">' + (v.ip || 'Unknown') + '</td>' +
      '<td style="padding:12px 16px"><span style="padding:2px 8px;border-radius:3px;font-family:monospace;font-size:0.65rem;background:rgba(14,165,233,0.08);border:1px solid rgba(14,165,233,0.15);color:' + pageColor + '">' + pageLabel + '</span></td>' +
      '<td style="padding:12px 16px;font-size:0.78rem;color:#64748b;max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + (v.isp || '—') + '</td>' +
      '<td style="padding:12px 16px;font-family:monospace;font-size:0.72rem;color:#64748b">' + (v.time || '—') + '</td>' +
      '</tr>';
  }).join('');
}

function filterVisitors() {
  const q = (document.getElementById('visitor-search').value || '').toLowerCase();
  const pg = document.getElementById('visitor-filter').value;
  const filtered = _visitorLog.filter(function(v) {
    const matchQ = !q || (v.country||'').toLowerCase().includes(q) || (v.city||'').toLowerCase().includes(q) || (v.ip||'').includes(q);
    const matchP = pg === 'all' || v.page === pg;
    return matchQ && matchP;
  });
  renderVisitorsTable(filtered);
}

function clearVisitorLog() {
  if (!confirm('Clear all visitor logs?')) return;
  _visitorLog = [];
  _visitorCount = 0;
  document.getElementById('visitor-count').textContent = '0';
  const nb = document.getElementById('visitors-nav-count');
  if (nb) nb.textContent = '0';
  const pc = document.getElementById('visitors-page-count');
  if (pc) pc.textContent = '0';
  renderVisitorsTable([]);
}
"""

anchor_end = "setInterval(pollVisitors, 10000);"
if 'renderVisitorsTable' not in content:
    content = content.replace(anchor_end, anchor_end + new_funcs)
    print('Visitor table functions added')
else:
    print('Visitor table functions already exist')

path.write_text(content, encoding='utf-8')
print('Done: admin.html updated')
