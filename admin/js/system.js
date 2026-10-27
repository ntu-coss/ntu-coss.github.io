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
    document.getElementById('set-deposit').value = m.locker_deposit || '500';
    if (document.getElementById('set-receipt')) document.getElementById('set-receipt').value = m.locker_receipt_next || '1';
    document.getElementById('wl-toggle').checked = String(m.v207_use_whitelist) === 'true';
    if (document.getElementById('lk-roster')) document.getElementById('lk-roster').checked = String(m.locker_use_roster) === 'true';
    if (document.getElementById('set-privacy')) document.getElementById('set-privacy').value = m.privacy_content || '';
    if (document.getElementById('set-privacy-en')) document.getElementById('set-privacy-en').value = m.privacy_content_en || '';
    if (document.getElementById('notify-venue')) document.getElementById('notify-venue').value = m.notify_venue_emails || '';
    if (document.getElementById('notify-equipment')) document.getElementById('notify-equipment').value = m.notify_equipment_emails || '';
    if (document.getElementById('notify-db')) document.getElementById('notify-db').value = m.notify_db_upload_emails || '';
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
      document.getElementById('rules-3f-en').value = m.rules_venue_3F_en || VENUE_RULES_DEFAULT['3F_en'];
      document.getElementById('rules-207-en').value = m.rules_venue_207_en || VENUE_RULES_DEFAULT['207_en'];
    }
  });
}
var VENUE_RULES_DEFAULT = {
  '3F': '## 3F 學習開放空間借用規則\n\n1. 借用對象限本院院、系、所學生會，不得轉讓他人使用。\n2. 最遲應於使用日的**前一週星期三**前送出申請，並經院學生會審核。\n3. 開放時間為每日 07:00–22:00；線上申請以同一日時段為限。\n4. 本院與院內各系所活動有優先使用權。借用單位、事由及企劃書連結為必填。\n5. 使用期間應維持適當音量、環境整潔與人員安全；場地用畢應立即復原。\n6. 因使用不當造成設施毀損，借用單位應負損害賠償責任；個人財物請自行保管。\n\n> 本頁為借用摘要；如有疑義，以[國立臺灣大學社會科學院學習開放空間管理辦法](https://homepage.ntu.edu.tw/~coss/rules/LearningCommons.pdf)為準。',
  '207': '## 207（東側二樓學習開放空間）借用規則\n\n1. 僅供本院系所學生會辦理學術與學習活動使用，**不含社團**；不得轉讓他人或改作其他用途。\n2. 不影響教學、研究與行政工作時，平日開放 18:00–22:00；假日得於 22:00 前使用。本校年假期間不外借。\n3. 線上申請以同一日時段為限；符合白名單與時段規定者由系統即時核准。\n4. 使用後應復原並維持環境整潔、適當音量；因使用不當造成設施毀損者應負賠償責任。\n5. 不得用於違法、妨害公序良俗、影響環境安寧、政黨活動、與申請不符、外拍或商業拍攝等情形。\n6. 個人財物請自行保管。經勸導二次後再違規，本院得停止使用，並自使用日起兩年內不得再用。\n\n> 本頁為借用摘要；如有疑義，以[國立臺灣大學社會科學院東側二樓開放空間管理辦法](https://homepage.ntu.edu.tw/~coss/rules/Openspace%28E-2F%29.pdf)為準。',
  '3F_en': '## 3F Learning Commons — Booking Rules\n\n1. The venue may be booked only by the student associations of the College or its departments and graduate institutes. A booking may not be transferred.\n2. Submit the request no later than **Wednesday of the week preceding the use date**. Approval by the College student association is required.\n3. The venue is open daily from 07:00 to 22:00. Each online request must begin and end on the same day.\n4. Events organized by the College or its departments and institutes have priority. Organization, purpose, and a proposal link are required.\n5. Keep noise at an appropriate level, maintain cleanliness and participant safety, and restore the venue immediately after use.\n6. The borrowing organization is liable for damage caused by improper use. Users are responsible for their personal property.\n\n> This is a summary. If there is any discrepancy, the official [NTU College of Social Sciences Learning Commons Regulations](https://homepage.ntu.edu.tw/~coss/rules/LearningCommons.pdf) prevail.',
  '207_en': '## Room 207 (East-side 2F Learning Commons) — Booking Rules\n\n1. The venue is only for academic and learning activities organized by student associations of departments and institutes in the College. **Student clubs are excluded.** The booking may not be transferred or used for another purpose.\n2. When teaching, research, and administrative work are not affected, use is permitted from 18:00 to 22:00 on weekdays and until 22:00 on holidays. The venue is unavailable during the University annual holiday.\n3. Each online request must begin and end on the same day. Requests satisfying the allowlist and time rules are approved immediately by the system.\n4. Restore and clean the venue after use and keep noise at an appropriate level. Users are liable for damage caused by improper use.\n5. Illegal or disruptive use, political-party activities, use inconsistent with the request, location shoots, and commercial filming are prohibited.\n6. Users are responsible for their personal property. After two warnings, a further violation may result in termination and a two-year ban.\n\n> This is a summary. If there is any discrepancy, the official [NTU College of Social Sciences East-side 2F Open Space Regulations](https://homepage.ntu.edu.tw/~coss/rules/Openspace%28E-2F%29.pdf) prevail.'
};
function saveVenueBookingRules() {
  Promise.all([
    call('saveSetting', 'rules_venue_3F', document.getElementById('rules-3f').value),
    call('saveSetting', 'rules_venue_207', document.getElementById('rules-207').value),
    call('saveSetting', 'rules_venue_3F_en', document.getElementById('rules-3f-en').value),
    call('saveSetting', 'rules_venue_207_en', document.getElementById('rules-207-en').value),
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
function saveReviewNotificationSettings() {
  Promise.all([
    call('saveSetting', 'notify_venue_emails', document.getElementById('notify-venue').value),
    call('saveSetting', 'notify_equipment_emails', document.getElementById('notify-equipment').value),
    call('saveSetting', 'notify_db_upload_emails', document.getElementById('notify-db').value),
  ]).then(function () { notify('已儲存審核通知收件人'); });
}
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
var PAGE_LABELS = { home: '首頁橫幅', announce: '公告', events: '活動', calendar: '行事曆', venue: '場地審核', vset: '場地設定', locker: '院櫃', equipment: '設備借用', petition: '陳情', roster: '學生名單', email: '信件範本', pagetext: '頁面說明', db: '資料庫設定', dbreview: '檔案審核', gongwen: '公文', meeting: '開會簽到表', system: '系統設定' };
function pageOf(btn) { return (btn.getAttribute('data-tab') || '').replace('#t-', ''); }
function applyPagePerms(pages) {
  var all = pages === 'all' || isOwner();
  document.querySelectorAll('#sidebar [data-tab]').forEach(function (b) {
    if (b.id === 'tab-audit-li' || b.id === 'tab-admins-li') return; // 由 applyOwnerUI 控制
    if (pageOf(b) === 'dashboard') return; // 後台首頁永遠顯示
    if (pageOf(b) === 'updates') { b.classList.toggle('d-none', !IS_STAGING); return; }
    var ok = all || (Array.isArray(pages) && pages.indexOf(pageOf(b)) !== -1);
    b.classList.toggle('d-none', !ok);
  });
  document.querySelectorAll('#navacc .accordion-item').forEach(function (item) {
    item.classList.toggle('d-none', !item.querySelector('.list-group-item-action:not(.d-none)'));
  });
}
function canPage(p) {
  if (p === 'updates') return IS_STAGING;
  if (isOwner()) return true;
  var pg = MEPROF && MEPROF.pages;
  if (pg === 'all' || !pg) return true;
  return Array.isArray(pg) && pg.indexOf(p) !== -1;
}
// ---------- 後台首頁（總覽） ----------
var DASH_CARDS = [
  { tab: '#t-updates', page: 'updates', icon: 'bi-journal-text', color: '#355070', title: '測試區更新紀錄', desc: '本次調整內容與使用方式' },
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
  { tab: '#t-db', page: 'db', icon: 'bi-database', color: '#2a9d8f', title: '資料庫設定', desc: '系所、課程白名單與公告' },
  { tab: '#t-dbreview', page: 'dbreview', icon: 'bi-inbox', color: '#457b9d', title: '檔案審核', desc: '各系考古題上傳審核' },
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
  }).catch(function () {}).finally(function () { loadStagingUpdateNotice(box); });
}
function stagingMarkdownHtml(markdown) {
  var html = '', list = '';
  function closeList() { if (list) { html += '</' + list + '>'; list = ''; } }
  String(markdown || '').split(/\r?\n/).forEach(function (line) {
    var heading = line.match(/^(#{1,3})\s+(.+)$/);
    var check = line.match(/^- \[([ xX])\]\s+(.+)$/);
    var bullet = line.match(/^-\s+(.+)$/);
    var ordered = line.match(/^\d+\.\s+(.+)$/);
    if (heading) { closeList(); var level = Math.min(6, heading[1].length + 3); html += '<h' + level + '>' + esc(heading[2]) + '</h' + level + '>'; }
    else if (check || bullet) {
      if (list !== 'ul') { closeList(); list = 'ul'; html += '<ul>'; }
      html += '<li>' + (check ? (check[1].trim() ? '已完成：' : '待處理：') + esc(check[2]) : esc(bullet[1])) + '</li>';
    } else if (ordered) {
      if (list !== 'ol') { closeList(); list = 'ol'; html += '<ol>'; }
      html += '<li>' + esc(ordered[1]) + '</li>';
    } else if (!line.trim()) closeList();
    else { closeList(); html += '<p>' + esc(line) + '</p>'; }
  });
  closeList();
  return html;
}
function loadStagingUpdateNotice(box) {
  if (!IS_STAGING || !box) return;
  fetch('/STAGING_UPDATES.md', { cache: 'no-store' }).then(function (response) {
    if (!response.ok) throw new Error('updates unavailable');
    return response.text();
  }).then(function (markdown) {
    var el = document.createElement('div');
    el.className = 'dash-notice dash-notice--info staging-update-notice';
    el.innerHTML = '<div class="dn-title"><i class="bi bi-journal-text me-1" aria-hidden="true"></i>測試區更新紀錄</div>' +
      '<p class="mb-2">本次調整內容及使用方式整理如下。</p>' +
      '<details><summary class="fw-semibold">展開完整更新內容</summary><div class="staging-update-markdown mt-3">' + stagingMarkdownHtml(markdown) + '</div></details>' +
      '<a class="btn btn-sm btn-outline-secondary mt-3" href="/STAGING_UPDATES.md" target="_blank" rel="noreferrer"><i class="bi bi-file-earmark-text me-1"></i>開啟文字版</a>';
    box.appendChild(el);
  }).catch(function () {});
}
function loadStagingUpdatesPage() {
  var box = document.getElementById('staging-updates-page');
  if (!box) return;
  if (!IS_STAGING) { box.innerHTML = '<p class="text-muted mb-0">更新紀錄只在測試區後台顯示。</p>'; return; }
  box.innerHTML = '<p class="text-muted mb-0">載入中……</p>';
  fetch('/STAGING_UPDATES.md', { cache: 'no-store' }).then(function (response) {
    if (!response.ok) throw new Error('updates unavailable');
    return response.text();
  }).then(function (markdown) {
    box.innerHTML = stagingMarkdownHtml(markdown);
  }).catch(function () {
    box.innerHTML = '<div class="alert alert-warning mb-0">暫時無法載入更新紀錄，請使用右上角「開啟文字版」。</div>';
  });
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
  if (canPage('dbreview')) defs.push({ label: '待審核檔案', color: '#457b9d', tab: '#t-dbreview', icon: 'bi-inbox', get: function () { return call('listDbSubmissions', 'pending').then(function (r) { return (r || []).length; }); } });
  if (!defs.length) { el.innerHTML = ''; return; }
  el.innerHTML = defs.map(function (d) { return dashStatTile('…', d.label, d.color, d.tab, d.icon); }).join('');
  defs.forEach(function (d, i) {
    d.get().then(function (n) { var nodes = el.querySelectorAll('.dash-stat .num'); if (nodes[i]) nodes[i].textContent = n; })
      .catch(function () { var nodes = el.querySelectorAll('.dash-stat .num'); if (nodes[i]) nodes[i].textContent = '-'; });
  });
}
var PERM_PAGES = ['home', 'announce', 'events', 'calendar', 'venue', 'vset', 'locker', 'equipment', 'petition', 'roster', 'email', 'pagetext', 'db', 'dbreview', 'gongwen', 'meeting', 'system'];
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
      '<table class="table table-sm table-bordered align-middle mb-0"><thead><tr><th>姓名</th><th>職稱</th><th>Email</th><th>可存取頁面</th><th>資料庫系所</th><th>最後登入</th><th></th></tr></thead><tbody>' +
      list.map(function (a) {
        var actions = (!a.owner)
          ? editRecordButton('admin', a.email, false) + ' ' +
            '<button class="btn btn-sm btn-outline-danger" data-ui-action="rmAdm" data-email="' + esc(a.email) + '">移除</button>'
          : '<span class="badge bg-dark">擁有者</span>';
        var dbScope = (!a.dbDepts || a.dbDepts === 'all') ? '<span class="badge bg-success">全部</span>' : esc(a.dbDepts);
        return '<tr><td>' + esc(a.name) + '</td><td>' + esc(a.title) + '</td><td>' + esc(a.email) + '</td><td>' + (a.owner ? '<span class="badge bg-dark">全部</span>' : permLabel(a.pages)) + '</td><td>' + dbScope + '</td><td>' + fmtLogin(a.lastLogin) + '</td><td>' + actions + '</td></tr>';
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
  var dbAll = !a.dbDepts || a.dbDepts === 'all';
  document.getElementById('adm-db-all').checked = dbAll;
  var dbSet = dbAll ? [] : a.dbDepts.split(',');
  document.querySelectorAll('.adm-db-dept').forEach(function (c) { c.disabled = dbAll; c.checked = dbSet.indexOf(c.value) !== -1; });
  showModal('adminModal');
}
function openAdminModal() {
  resetAdmForm();
  showModal('adminModal');
}
function toggleAdminDbDeptScope(all) {
  document.querySelectorAll('.adm-db-dept').forEach(function (c) { c.disabled = all; });
}
function resetAdmForm() {
  document.getElementById('admin-modal-title').innerHTML = '<i class="bi bi-person-plus me-2"></i>新增管理員';
  ['adm-email', 'adm-name', 'adm-title'].forEach(function (i) { document.getElementById(i).value = ''; });
  document.getElementById('adm-email').readOnly = false;
  document.getElementById('adm-all').checked = false;
  document.getElementById('adm-perms').classList.remove('d-none');
  document.querySelectorAll('#adm-perms .perm-chk').forEach(function (c) { c.checked = false; });
  document.getElementById('adm-db-all').checked = true;
  document.querySelectorAll('.adm-db-dept').forEach(function (c) { c.checked = false; });
  toggleAdminDbDeptScope(true);
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
  var dbDepts = 'all';
  if (!document.getElementById('adm-db-all').checked) {
    dbDepts = Array.from(document.querySelectorAll('.adm-db-dept:checked')).map(function (c) { return c.value; });
    if (pages !== 'all' && (pages.indexOf('db') !== -1 || pages.indexOf('dbreview') !== -1) && !dbDepts.length) { notify('資料庫權限需至少選擇一個系所', false); return; }
  }
  var obj = { email: email, name: document.getElementById('adm-name').value, title: document.getElementById('adm-title').value, pages: pages, dbDepts: dbDepts };
  call('addAdmin', obj).then(function () { hideModal('adminModal'); resetAdmForm(); loadAdmins(); notify('已儲存管理員權限'); });
}
function rmAdm(e) { if (confirm('移除管理員 ' + e + '？')) call('removeAdmin', e).then(loadAdmins); }
// ---------- 操作紀錄（每頁 50 筆） ----------
function loadAudit(page) {
  call('listAudit', page || 0).then(function (res) {
    var rows = res.rows || [];
    var body = rows.length
      ? '<div class="admin-table-scroll"><table class="table table-sm table-striped align-middle"><thead><tr><th>時間</th><th>審核者</th><th>操作</th><th>內容</th></tr></thead><tbody>' +
        rows.map(function (r) {
          return '<tr><td class="small text-nowrap">' + fmt(r.time) + '</td><td class="small">' + esc(r.actor) + '</td><td><code>' + esc(r.action) + '</code></td><td class="small text-muted" style="word-break:break-all">' + esc(r.target) + '</td></tr>';
        }).join('') + '</tbody></table></div>'
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
