// Admin module: system. Loaded as a classic script for legacy handler compatibility.
// ---------- 系統設定 ----------
function loadSettings() {
  call('getSettingsAll').then(function (rows) {
    var m = {}; rows.forEach(function (r) { m[r.key] = r.value; });
    var def = m.venue_open_window_days || '30';
    if (document.getElementById('v3f-min')) {
      document.getElementById('v3f-min').value = m.v3f_min_days || '3';
      document.getElementById('v3f-win').value = m.v3f_window_days || def;
      document.getElementById('v207-min').value = m.v207_min_days || '0';
      document.getElementById('v207-win').value = m.v207_window_days || def;
    }
    document.getElementById('set-regfolder').value = m.regulations_folder_id || '';
    document.getElementById('set-deposit').value = m.locker_deposit || '100';
    if (document.getElementById('set-receipt')) document.getElementById('set-receipt').value = m.locker_receipt_next || '1';
    document.getElementById('wl-toggle').checked = String(m.v207_use_whitelist) === 'true';
    if (document.getElementById('lk-roster')) document.getElementById('lk-roster').checked = String(m.locker_use_roster) === 'true';
    if (document.getElementById('set-privacy')) document.getElementById('set-privacy').value = m.privacy_content || '';
    if (document.getElementById('sysnotice-content')) {
      document.getElementById('sysnotice-content').value = m.sysnotice_content || '';
      document.getElementById('sysnotice-active').checked = String(m.sysnotice_active) === 'true';
      document.getElementById('sysnotice-type').value = ['success', 'warning', 'danger'].indexOf(m.sysnotice_type) !== -1 ? m.sysnotice_type : 'info';
    }
    if (document.getElementById('gw-word')) {
      document.getElementById('gw-word').value = m.gw_doc_word || '社科院學生會';
      document.getElementById('gw-cat').value = m.gw_file_cat || '1';
      document.getElementById('gw-seq').value = m.gw_seq_next || '1';
      document.getElementById('gw-defsigner').value = m.gongwen_signer || '';
    }
    document.getElementById('wl-url').value = m.v207_whitelist_url || '';
    if (document.getElementById('rules-3f')) {
      document.getElementById('rules-3f').value = m.rules_venue_3F || VENUE_RULES_DEFAULT['3F'];
      document.getElementById('rules-207').value = m.rules_venue_207 || VENUE_RULES_DEFAULT['207'];
    }
  });
}
var VENUE_RULES_DEFAULT = {
  '3F': '## 3F 學開借用規則\n\n1. 借用需經學生會人工審核，核准後將以 Email 通知。\n2. 借用單位、事由、企劃書連結為必填。\n3. 使用後請維持場地整潔，並依規定歸還。\n\n> 送出申請即表示您已閱讀並同意以上規則。',
  '207': '## 207 微學開借用規則\n\n1. 207 微學開為線上即時核准。\n2. 借用限學生會白名單內單位（如有設定）。\n3. 使用後請維持場地整潔。\n\n> 送出申請即表示您已閱讀並同意以上規則。'
};
function saveVenueBookingRules() {
  Promise.all([
    call('saveSetting', 'rules_venue_3F', document.getElementById('rules-3f').value),
    call('saveSetting', 'rules_venue_207', document.getElementById('rules-207').value),
  ]).then(function () { notify('已儲存借用規則'); });
}
function saveVenueRules() {
  Promise.all([
    call('saveSetting', 'v3f_min_days', document.getElementById('v3f-min').value || '0'),
    call('saveSetting', 'v3f_window_days', document.getElementById('v3f-win').value || '30'),
    call('saveSetting', 'v207_min_days', document.getElementById('v207-min').value || '0'),
    call('saveSetting', 'v207_window_days', document.getElementById('v207-win').value || '30'),
  ]).then(function () { notify('已儲存借用區間'); });
}
function saveSetting(key, val) { call('saveSetting', key, val).then(function () { notify('已儲存'); }); }
function saveGwScheme() {
  Promise.all([
    call('saveSetting', 'gw_doc_word', document.getElementById('gw-word').value),
    call('saveSetting', 'gw_file_cat', document.getElementById('gw-cat').value),
    call('saveSetting', 'gw_seq_next', document.getElementById('gw-seq').value || '1'),
  ]).then(function () { notify('已儲存公文文號規範'); });
}
function isOwner() { return !!(MEPROF && MEPROF.owner); }
function applyOwnerUI() {
  var owner = isOwner();
  document.getElementById('tab-audit-li').classList.toggle('d-none', !owner);
  document.getElementById('tab-admins-li').classList.toggle('d-none', !owner);
  document.getElementById('admin-mgmt').classList.toggle('d-none', !owner);
}
// 頁面權限：依管理員可存取頁面顯示/隱藏側邊選單項目
var PAGE_LABELS = { home: '首頁橫幅', announce: '公告', events: '活動', calendar: '行事曆', venue: '場地審核', vset: '場地設定', locker: '院櫃', equipment: '設備借用', petition: '陳情', roster: '學生名單', email: '信件範本', pagetext: '頁面說明', db: '社科院資料庫', gongwen: '公文', meeting: '開會簽到表', system: '系統設定' };
function pageOf(btn) { return (btn.getAttribute('data-tab') || '').replace('#t-', ''); }
function applyPagePerms(pages) {
  var all = pages === 'all' || isOwner();
  document.querySelectorAll('#sidebar [data-tab]').forEach(function (b) {
    if (b.id === 'tab-audit-li' || b.id === 'tab-admins-li') return; // 由 applyOwnerUI 控制
    if (pageOf(b) === 'dashboard') return; // 後台首頁永遠顯示
    var ok = all || (Array.isArray(pages) && pages.indexOf(pageOf(b)) !== -1);
    b.classList.toggle('d-none', !ok);
  });
  document.querySelectorAll('#navacc .accordion-item').forEach(function (item) {
    item.classList.toggle('d-none', !item.querySelector('.list-group-item-action:not(.d-none)'));
  });
}
function canPage(p) {
  if (isOwner()) return true;
  var pg = MEPROF && MEPROF.pages;
  if (pg === 'all' || !pg) return true;
  return Array.isArray(pg) && pg.indexOf(p) !== -1;
}
// ---------- 後台首頁（總覽） ----------
var DASH_CARDS = [
  { tab: '#t-events', page: 'events', icon: 'bi-calendar-event', color: '#e76f51', title: '活動管理', desc: '首頁輪播、報名、簽到、發信' },
  { tab: '#t-announce', page: 'announce', icon: 'bi-megaphone', color: '#2a9d8f', title: '公告', desc: '發佈與編輯公告' },
  { tab: '#t-calendar', page: 'calendar', icon: 'bi-calendar3', color: '#457b9d', title: '行事曆', desc: '內嵌 Google 行事曆' },
  { tab: '#t-petition', page: 'petition', icon: 'bi-chat-left-text', color: '#9c6644', title: '陳情處理', desc: '學生陳情與意見' },
  { tab: '#t-venue', page: 'venue', icon: 'bi-hourglass-split', color: '#e9a000', title: '場地審核', desc: '3F／207 預約審核' },
  { tab: '#t-vset', page: 'vset', icon: 'bi-sliders', color: '#6d6875', title: '場地設定', desc: '借用區間、封鎖、檢核' },
  { tab: '#t-locker', page: 'locker', icon: 'bi-grid-3x3-gap', color: '#264653', title: '院櫃', desc: '櫃位借用與分區' },
  { tab: '#t-equipment', page: 'equipment', icon: 'bi-projector', color: '#0a9396', title: '設備借用', desc: '設備清單、審核、領用歸還' },
  { tab: '#t-home', page: 'home', icon: 'bi-image', color: '#ee9b00', title: '首頁橫幅', desc: '首頁標題背景設定' },
  { tab: '#t-pagetext', page: 'pagetext', icon: 'bi-card-text', color: '#7209b7', title: '頁面說明', desc: '各表單說明文字' },
  { tab: '#t-db', page: 'db', icon: 'bi-database', color: '#2a9d8f', title: '社科院資料庫', desc: '各系雲端連結與公告' },
  { tab: '#t-gongwen', page: 'gongwen', icon: 'bi-file-earmark-text', color: '#3a0ca3', title: '公文產生器', desc: '正式公文 PDF' },
  { tab: '#t-meeting', page: 'meeting', icon: 'bi-card-checklist', color: '#4361ee', title: '開會簽到表', desc: '幹部名單簽到表 PDF' },
  { tab: '#t-roster', page: 'roster', icon: 'bi-people', color: '#1d3557', title: '學生名單', desc: '名單查詢與來源設定' },
  { tab: '#t-email', page: 'email', icon: 'bi-envelope', color: '#bc6c25', title: '信件範本', desc: '通知信主旨與內文' },
  { tab: '#t-system', page: 'system', icon: 'bi-gear', color: '#495057', title: '系統設定', desc: '公開內容、押金與文號' },
  { tab: '#t-admins', page: 'system', ownerOnly: true, icon: 'bi-shield-lock', color: '#343a40', title: '系統管理員', desc: '管理員、權限與系統公告' },
];
function loadDashboard() {
  var name = (MEPROF && ((MEPROF.title || '') + ' ' + (MEPROF.name || '')).trim()) || (MEPROF && MEPROF.email) || '管理員';
  var ds = new Date().toLocaleDateString('zh-TW', { timeZone: 'Asia/Taipei', year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' });
  document.getElementById('dash-hero').innerHTML =
    '<h3><i class="bi bi-person-check me-2" aria-hidden="true"></i>' + esc(name) + '，您好</h3>' +
    '<div class="dash-date"><i class="bi bi-calendar3 me-1"></i>' + esc(ds) + '　社科院學生會後台</div>';
  document.getElementById('dash-cards').innerHTML = DASH_CARDS.filter(function (c) { return canPage(c.page) && (!c.ownerOnly || isOwner()); }).map(function (c) {
    return '<div class="col-6 col-md-4 col-lg-3"><div class="dash-card p-3 d-flex gap-3 align-items-start" data-ui-action="goTab" data-tab="' + esc(c.tab) + '">' +
      '<div class="icon" style="background:' + c.color + '"><i class="bi ' + c.icon + '"></i></div>' +
      '<div><div class="ttl">' + c.title + '</div><div class="desc">' + c.desc + '</div></div>' +
      '</div></div>';
  }).join('');
  loadDashStats();
  loadDashNotice();
}
function loadDashNotice() {
  var box = document.getElementById('dash-notice'); if (!box) return;
  box.innerHTML = '';
  call('getSysNotice').then(function (n) {
    if (!n || !n.active || !n.content) return;
    var dismissed = ''; try { dismissed = localStorage.getItem('coss_sysnotice_dismissed') || ''; } catch (e) {}
    if (dismissed && dismissed === (n.updatedAt || '')) return;
    var el = document.createElement('div');
    var type = ['success', 'warning', 'danger'].indexOf(n.type) !== -1 ? n.type : 'info';
    var meta = {
      info: { icon: 'bi-info-circle-fill', title: '系統公告' },
      success: { icon: 'bi-check-circle-fill', title: '完成通知' },
      warning: { icon: 'bi-exclamation-triangle-fill', title: '注意事項' },
      danger: { icon: 'bi-exclamation-octagon-fill', title: '緊急通知' },
    }[type];
    el.className = 'dash-notice dash-notice--' + type + ' position-relative';
    el.setAttribute('role', type === 'danger' ? 'alert' : 'status');
    el.innerHTML = '<button type="button" class="btn-close position-absolute" style="top:.8rem;right:.9rem" aria-label="關閉"></button>' +
      '<div class="dn-title"><i class="bi ' + meta.icon + ' me-1" aria-hidden="true"></i>' + meta.title + '</div>' +
      '<div class="dn-body">' + esc(n.content) + '</div>';
    el.querySelector('.btn-close').addEventListener('click', function () {
      try { localStorage.setItem('coss_sysnotice_dismissed', n.updatedAt || ''); } catch (e) {}
      box.innerHTML = '';
    });
    box.appendChild(el);
  }).catch(function () {});
}
function saveSysNotice() {
  var content = document.getElementById('sysnotice-content').value;
  var active = document.getElementById('sysnotice-active').checked;
  var type = document.getElementById('sysnotice-type').value;
  call('saveSysNotice', content, active, type).then(function () { notify('已儲存系統公告'); });
}
function dashStatTile(num, label, color, tab, icon) {
  return '<div class="col-6 col-md-4"><div class="dash-stat p-3 d-flex align-items-center justify-content-between" style="background:' + color + '" data-ui-action="goTab" data-tab="' + esc(tab) + '">' +
    '<div><div class="num">' + num + '</div><div class="lbl">' + label + '</div></div><i class="bi ' + icon + '"></i></div></div>';
}
function loadDashStats() {
  var el = document.getElementById('dash-stats');
  var defs = [];
  if (canPage('venue')) defs.push({ label: '待審核場地', color: '#e76f51', tab: '#t-venue', icon: 'bi-hourglass-split', get: function () { return call('listVenueBookings', { status: 'pending' }).then(function (r) { return (r || []).length; }); } });
  if (canPage('equipment')) defs.push({ label: '待審核設備', color: '#0a9396', tab: '#t-equipment', icon: 'bi-projector', get: function () { return call('listEquipmentBookings').then(function (r) { return (r || []).filter(function (x) { return x.status === 'pending'; }).length; }); } });
  if (canPage('petition')) defs.push({ label: '待處理陳情', color: '#9c6644', tab: '#t-petition', icon: 'bi-chat-left-text', get: function () { return call('listPetitions').then(function (r) { return (r || []).filter(function (x) { return x.status !== 'handled'; }).length; }); } });
  if (!defs.length) { el.innerHTML = ''; return; }
  el.innerHTML = defs.map(function (d) { return dashStatTile('…', d.label, d.color, d.tab, d.icon); }).join('');
  defs.forEach(function (d, i) {
    d.get().then(function (n) { var nodes = el.querySelectorAll('.dash-stat .num'); if (nodes[i]) nodes[i].textContent = n; })
      .catch(function () { var nodes = el.querySelectorAll('.dash-stat .num'); if (nodes[i]) nodes[i].textContent = '-'; });
  });
}
var PERM_PAGES = ['home', 'announce', 'events', 'calendar', 'venue', 'vset', 'locker', 'equipment', 'petition', 'roster', 'email', 'pagetext', 'db', 'gongwen', 'meeting', 'system'];
function renderPermChecks() {
  document.getElementById('adm-perms').innerHTML = PERM_PAGES.map(function (p) {
    return '<div class="form-check form-check-inline m-0"><input class="form-check-input perm-chk" type="checkbox" value="' + p + '" id="perm-' + p + '"><label class="form-check-label small" for="perm-' + p + '">' + (PAGE_LABELS[p] || p) + '</label></div>';
  }).join('');
}
function permLabel(pages) {
  if (!pages || pages === 'all') return '<span class="badge bg-success">完整權限</span>';
  return pages.split(',').filter(Boolean).map(function (p) { return '<span class="badge bg-light text-dark border me-1">' + (PAGE_LABELS[p] || p) + '</span>'; }).join('') || '<span class="text-muted small">未設定</span>';
}
function fmtLogin(iso) {
  if (!iso) return '<span class="text-muted small">尚未登入</span>';
  var d = new Date(iso); if (isNaN(d)) return esc(iso);
  try {
    return '<span class="small">' + d.toLocaleString('zh-TW', { timeZone: 'Asia/Taipei', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }) + '</span>';
  } catch (e) { return '<span class="small">' + esc(iso) + '</span>'; }
}
function loadAdmins() {
  if (!isOwner()) return;
  if (!document.querySelector('#adm-perms .perm-chk')) renderPermChecks();
  call('listAdmins').then(function (list) {
    cacheEditRecords('admin', list, 'email');
    document.getElementById('adm-list').innerHTML =
      '<table class="table table-sm table-bordered align-middle mb-0"><thead><tr><th>姓名</th><th>職稱</th><th>Email</th><th>可存取頁面</th><th>最後登入</th><th></th></tr></thead><tbody>' +
      list.map(function (a) {
        var actions = (!a.owner)
          ? editRecordButton('admin', a.email, false) + ' ' +
            '<button class="btn btn-sm btn-outline-danger" data-ui-action="rmAdm" data-email="' + esc(a.email) + '">移除</button>'
          : '<span class="badge bg-dark">擁有者</span>';
        return '<tr><td>' + esc(a.name) + '</td><td>' + esc(a.title) + '</td><td>' + esc(a.email) + '</td><td>' + (a.owner ? '<span class="badge bg-dark">全部</span>' : permLabel(a.pages)) + '</td><td>' + fmtLogin(a.lastLogin) + '</td><td>' + actions + '</td></tr>';
      }).join('') + '</tbody></table>';
  });
}
function editAdm(a) {
  resetAdmForm();
  document.getElementById('admin-modal-title').innerHTML = '<i class="bi bi-person-gear me-2"></i>編輯管理員';
  document.getElementById('adm-email').value = a.email || '';
  document.getElementById('adm-email').readOnly = true;
  document.getElementById('adm-name').value = a.name || '';
  document.getElementById('adm-title').value = a.title || '';
  if (!document.querySelector('#adm-perms .perm-chk')) renderPermChecks();
  var all = !a.pages || a.pages === 'all';
  document.getElementById('adm-all').checked = all;
  document.getElementById('adm-perms').classList.toggle('d-none', all);
  var set = all ? [] : a.pages.split(',');
  document.querySelectorAll('#adm-perms .perm-chk').forEach(function (c) { c.checked = set.indexOf(c.value) !== -1; });
  showModal('adminModal');
}
function openAdminModal() {
  resetAdmForm();
  showModal('adminModal');
}
function resetAdmForm() {
  document.getElementById('admin-modal-title').innerHTML = '<i class="bi bi-person-plus me-2"></i>新增管理員';
  ['adm-email', 'adm-name', 'adm-title'].forEach(function (i) { document.getElementById(i).value = ''; });
  document.getElementById('adm-email').readOnly = false;
  document.getElementById('adm-all').checked = false;
  document.getElementById('adm-perms').classList.remove('d-none');
  document.querySelectorAll('#adm-perms .perm-chk').forEach(function (c) { c.checked = false; });
}
function addAdm() {
  var email = document.getElementById('adm-email').value.trim();
  if (!email) { notify('請填寫 Email', false); return; }
  var pages;
  if (document.getElementById('adm-all').checked) { pages = 'all'; }
  else {
    pages = [];
    document.querySelectorAll('#adm-perms .perm-chk:checked').forEach(function (c) { pages.push(c.value); });
    if (!pages.length) { notify('請勾選可存取頁面，或選「完整權限」', false); return; }
  }
  var obj = { email: email, name: document.getElementById('adm-name').value, title: document.getElementById('adm-title').value, pages: pages };
  call('addAdmin', obj).then(function () { hideModal('adminModal'); resetAdmForm(); loadAdmins(); notify('已儲存管理員權限'); });
}
function rmAdm(e) { if (confirm('移除管理員 ' + e + '？')) call('removeAdmin', e).then(loadAdmins); }
// ---------- 操作紀錄（每頁 50 筆） ----------
function loadAudit(page) {
  call('listAudit', page || 0).then(function (res) {
    var rows = res.rows || [];
    var body = rows.length
      ? '<table class="table table-sm table-striped align-middle"><thead><tr><th>時間</th><th>審核者</th><th>操作</th><th>內容</th></tr></thead><tbody>' +
        rows.map(function (r) {
          return '<tr><td class="small text-nowrap">' + fmt(r.time) + '</td><td class="small">' + esc(r.actor) + '</td><td><code>' + esc(r.action) + '</code></td><td class="small text-muted" style="word-break:break-all">' + esc(r.target) + '</td></tr>';
        }).join('') + '</tbody></table>'
      : '<p class="text-muted">尚無紀錄。</p>';
    var from = res.total ? res.page * res.size + 1 : 0;
    var to = res.page * res.size + rows.length;
    var pager = '<div class="d-flex align-items-center gap-2 mb-2">' +
      '<button class="btn btn-sm btn-outline-secondary" ' + (res.page <= 0 ? 'disabled' : '') + ' data-ui-action="loadAudit" data-page="' + (res.page - 1) + '">上一頁</button>' +
      '<button class="btn btn-sm btn-outline-secondary" ' + (res.hasMore ? '' : 'disabled') + ' data-ui-action="loadAudit" data-page="' + (res.page + 1) + '">下一頁</button>' +
      '<span class="small text-muted">' + from + '–' + to + ' / 共 ' + res.total + ' 筆</span></div>';
    document.getElementById('audit-list').innerHTML = pager + body;
  });
}
// ---------- 學生名單查詢 ----------
function rosterSearch() {
  var sid = document.getElementById('roster-q').value.trim();
  if (!sid) return;
  call('rosterLookup', sid).then(function (r) {
    document.getElementById('roster-result').innerHTML = r.found
      ? '<div class="alert alert-success py-2 mb-0">「' + esc(sid) + '」<b>在</b>學生名單內。（名單共 ' + r.total + ' 筆）</div>'
      : '<div class="alert alert-warning py-2 mb-0">「' + esc(sid) + '」<b>不在</b>學生名單內。（名單共 ' + r.total + ' 筆）</div>';
  });
}

// ---------- 陳情 ----------
function petStatusBadge(s) { return s === 'handled' ? '<span class="badge bg-success">已處理</span>' : '<span class="badge bg-warning text-dark">未處理</span>'; }
function loadPetitions() {
  var f = document.getElementById('pet-filter').value;
  call('listPetitions').then(function (rows) {
    if (f) rows = rows.filter(function (r) { return r.status === f; });
    document.getElementById('pet-list').innerHTML = rows.length ? rows.map(function (r) {
      return '<div class="card mb-2"><div class="card-body py-2">' +
        '<div class="d-flex justify-content-between"><b>' + esc(r.subject) + '</b><small>' + fmt(r.createdAt) + '</small></div>' +
        '<div class="small text-muted mb-1">' + petStatusBadge(r.status) + ' 類別：' + esc(r.category || '-') + '　姓名：' + esc(r.name || '（匿名）') + '　聯絡：' + esc(r.contact || '-') + '</div>' +
        '<div style="white-space:pre-wrap">' + esc(r.content) + '</div>' +
        '<div class="mt-2">' +
          (r.status === 'handled'
            ? '<button class="btn btn-sm btn-outline-secondary" data-ui-action="petStatus" data-id="' + esc(r.id) + '" data-status="new">標記未處理</button> '
            : '<button class="btn btn-sm btn-success" data-ui-action="petStatus" data-id="' + esc(r.id) + '" data-status="handled">標記已處理</button> ') +
          '<button class="btn btn-sm btn-outline-danger" data-ui-action="petDel" data-id="' + esc(r.id) + '">刪除</button>' +
        '</div></div></div>';
    }).join('') : '<p class="text-muted">目前沒有陳情。</p>';
  });
}
function petStatus(id, s) { call('setPetitionStatus', id, s, '').then(function () { notify('已更新'); loadPetitions(); }); }
function petDel(id) { if (confirm('刪除此陳情？')) call('deletePetition', id).then(function () { loadPetitions(); }); }

// ---------- 信件範本 ----------
var EMAIL_TEMPLATE_CACHE = Object.create(null);
function loadEmail() {
  call('listEmailTemplates').then(function (rows) {
    EMAIL_TEMPLATE_CACHE = Object.create(null);
    rows.forEach(function (row) { EMAIL_TEMPLATE_CACHE[row.key] = row; });
    document.getElementById('email-list').innerHTML = '<div class="list-group">' + rows.map(function (r) {
      return '<div class="list-group-item d-flex justify-content-between align-items-center gap-3"><div class="min-w-0"><div class="fw-semibold">' + esc(r.label) + ' <code class="small">' + esc(r.key) + '</code></div><div class="small text-muted text-truncate">' + esc(r.subject || '（無主旨）') + '</div></div><button class="btn btn-sm btn-outline-primary text-nowrap" data-ui-action="openEmail" data-key="' + esc(r.key) + '"><i class="bi bi-pencil me-1"></i>編輯</button></div>';
    }).join('') + '</div>';
  });
}
function openEmailTemplate(key) {
  var row = EMAIL_TEMPLATE_CACHE[key];
  if (!row) { notify('找不到此信件範本，請重新載入。', false); return; }
  document.getElementById('em-key').value = row.key;
  document.getElementById('em-label').textContent = row.label + ' (' + row.key + ')';
  document.getElementById('em-subject').value = row.subject || '';
  document.getElementById('em-body').value = row.body || '';
  showModal('emailTemplateModal');
}
function saveEmail() {
  var key = document.getElementById('em-key').value;
  call('saveEmailTemplate', key, document.getElementById('em-subject').value, document.getElementById('em-body').value)
    .then(function () { hideModal('emailTemplateModal'); notify('範本已儲存'); loadEmail(); });
}

// ---------- 頁面說明 ----------
var PAGE_TEXT_CACHE = Object.create(null);
function loadPageTexts() {
  call('listPageTexts').then(function (rows) {
    PAGE_TEXT_CACHE = Object.create(null);
    rows.forEach(function (row) { PAGE_TEXT_CACHE[row.key] = row; });
    document.getElementById('pagetext-list').innerHTML = '<div class="list-group">' + rows.map(function (r) {
      var summary = String(r.value || '').replace(/\s+/g, ' ').trim();
      return '<div class="list-group-item d-flex justify-content-between align-items-center gap-3"><div class="min-w-0"><div class="fw-semibold">' + esc(r.label) + '</div><div class="small text-muted text-truncate">' + esc(summary || '（目前未設定）') + '</div></div><button class="btn btn-sm btn-outline-primary text-nowrap" data-ui-action="openPageText" data-key="' + esc(r.key) + '"><i class="bi bi-pencil me-1"></i>編輯</button></div>';
    }).join('') + '</div>';
  });
}
function openPageText(key) {
  var row = PAGE_TEXT_CACHE[key];
  if (!row) { notify('找不到此頁面說明，請重新載入。', false); return; }
  document.getElementById('pt-key').value = row.key;
  document.getElementById('page-text-modal-title').innerHTML = '<i class="bi bi-card-text me-2"></i>' + esc(row.label);
  document.getElementById('pt-value').value = row.value || '';
  showModal('pageTextModal');
}
function savePageText() {
  var key = document.getElementById('pt-key').value;
  call('saveSetting', key, document.getElementById('pt-value').value).then(function () { hideModal('pageTextModal'); notify('已儲存'); loadPageTexts(); });
}
