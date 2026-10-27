// Admin module: core. Loaded as a classic script for legacy handler compatibility.
// ---------- 設定 + 登入 ----------
// 測試區偵測：部署在 Cloudflare Pages 測試站時自動改打 staging Worker（資料為試算表副本）
var IS_STAGING = location.hostname.indexOf('ntu-coss-staging') !== -1;
var WORKER_URL = IS_STAGING
  ? 'https://ntu-coss-api-staging.ntusssa2.workers.dev'
  : 'https://ntu-coss-api.ntusssa2.workers.dev';
if (IS_STAGING) {
  document.body.insertAdjacentHTML('afterbegin',
    '<div class="text-center py-1 fw-bold text-white" style="background:#c9302c"><i class="bi bi-exclamation-triangle-fill me-1" aria-hidden="true"></i>測試區後台（staging）— 這裡操作的是測試資料，不影響正式網站</div>');
}
var CLIENT_ID = '980997931795-8aq3kc0ca3eqovdocb01o646f4effrgi.apps.googleusercontent.com';
// 擁有者判定一律以後端 getMe().owner 為準（OWNER_ADMINS 只存在 Worker，前端不再列出任何 email）
var TOKEN = null, ME = '', MEPROF = null;

function loadBuildVersion() {
  fetch('/version.json', { cache: 'no-store' }).then(function (response) {
    if (!response.ok) throw new Error('version unavailable');
    return response.json();
  }).then(function (info) {
    document.querySelectorAll('[data-build-version]').forEach(function (element) {
      element.textContent = info.display || info.version || '未知';
      if (info.commit) element.title = 'Commit ' + info.commit;
    });
  }).catch(function () {
    document.querySelectorAll('[data-build-version]').forEach(function (element) { element.textContent = '開發版'; });
  });
}
loadBuildVersion();

// 用 Bootstrap 的 d-none/d-flex 切換（.d-flex 帶 !important，不能只改 style.display）
function showGate(msg) {
  document.getElementById('app').classList.add('d-none');
  var pn = document.getElementById('public-nav'); if (pn) pn.classList.remove('d-none');
  var g = document.getElementById('signin-gate');
  g.classList.remove('d-none'); g.classList.add('d-flex');
  document.getElementById('gate-msg').textContent = msg || '';
}
function enterApp() {
  try { google.accounts.id.cancel(); } catch (e) {}   // 收掉殘留的 Google 提示
  var g = document.getElementById('signin-gate');
  g.classList.remove('d-flex'); g.classList.add('d-none');
  var pn = document.getElementById('public-nav'); if (pn) pn.classList.add('d-none');
  document.getElementById('app').classList.remove('d-none');
}
var TOKEN_KEY = 'coss_admin_token';
// 解出 JWT 的 exp（秒）；失敗回 0
function tokenExp(t) {
  try { var p = JSON.parse(atob(t.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))); return Number(p.exp) || 0; } catch (e) { return 0; }
}
function tokenValid(t) { return !!t && tokenExp(t) * 1000 > Date.now() + 5000; }
function saveToken(t) { try { sessionStorage.setItem(TOKEN_KEY, t); } catch (e) {} }
function clearToken() { try { sessionStorage.removeItem(TOKEN_KEY); } catch (e) {} }

// 用一個有效 token 進入後台（登入成功或重新整理後復原皆走這裡）
function useToken(token) {
  TOKEN = token;
  document.getElementById('gate-msg').textContent = '驗證中…';
  return call('whoami').then(function (email) {
    ME = String(email || '').toLowerCase();
    document.getElementById('admin-email').textContent = email;
    saveToken(token);
    enterApp();
    return call('getMe').then(function (p) {
      MEPROF = p || {};
      var g = ((MEPROF.title || '') + ' ' + (MEPROF.name || '')).trim();
      document.getElementById('greet').textContent = g || MEPROF.email || '管理員';
      resetAnnounce(); resetEv();
      applyOwnerUI();
      applyPagePerms(MEPROF.pages);
      goTab('#t-dashboard');
    }).catch(function () { goTab('#t-dashboard'); });
  }).catch(function (e) {
    TOKEN = null; clearToken();
    showGate('登入失敗：' + (e && e.message ? e.message : e));
  });
}
function onSignIn(resp) {
  if (!resp || !resp.credential) { showGate('未取得 Google 憑證，請重試。'); return; }
  useToken(resp.credential);
}
function signOut() {
  TOKEN = null; clearToken();
  try { google.accounts.id.disableAutoSelect(); } catch (e) {}
  showGate('已登出。');
}
window.addEventListener('load', function () {
  // 重新整理：若 session 內仍有未過期的 token，直接復原登入，免重新登入
  var saved = null;
  try { saved = sessionStorage.getItem(TOKEN_KEY); } catch (e) {}
  if (tokenValid(saved)) useToken(saved); else clearToken();
  function tryInit() {
    if (!(window.google && google.accounts && google.accounts.id)) { setTimeout(tryInit, 200); return; }
    google.accounts.id.initialize({ client_id: CLIENT_ID, callback: onSignIn });
    google.accounts.id.renderButton(document.getElementById('gbtn'), { theme: 'outline', size: 'large', text: 'signin_with', shape: 'pill' });
  }
  tryInit();
});

// ---------- 共用 ----------
function notify(msg, state) {
  var c = document.getElementById('toast');
  var allowed = ['success', 'danger', 'warning', 'info'];
  var type = state === false ? 'danger' : (allowed.indexOf(state) !== -1 ? state : 'success');
  var meta = {
    success: { title: '操作完成', icon: 'bi-check-lg', duration: 3600 },
    danger: { title: '操作失敗', icon: 'bi-exclamation-octagon', duration: 6500 },
    warning: { title: '請注意', icon: 'bi-exclamation-triangle', duration: 5200 },
    info: { title: '處理中', icon: 'bi-info-circle', duration: 4500 },
  }[type];
  var el = document.createElement('div');
  el.className = 'admin-notice admin-notice--' + type;
  el.setAttribute('role', type === 'danger' ? 'alert' : 'status');
  var iconWrap = document.createElement('span');
  iconWrap.className = 'admin-notice__icon';
  iconWrap.setAttribute('aria-hidden', 'true');
  iconWrap.innerHTML = '<i class="bi ' + meta.icon + '"></i>';
  var content = document.createElement('div');
  var title = document.createElement('div');
  title.className = 'admin-notice__title';
  title.textContent = meta.title;
  var text = document.createElement('div');
  text.className = 'admin-notice__message';
  text.textContent = String(msg == null ? '' : msg);
  content.appendChild(title);
  content.appendChild(text);
  var close = document.createElement('button');
  close.type = 'button';
  close.className = 'admin-notice__close';
  close.setAttribute('aria-label', '關閉通知');
  close.innerHTML = '<i class="bi bi-x-lg" aria-hidden="true"></i>';
  var progress = document.createElement('span');
  progress.className = 'admin-notice__progress';
  progress.setAttribute('aria-hidden', 'true');
  progress.style.setProperty('--notice-duration', meta.duration + 'ms');
  el.appendChild(iconWrap);
  el.appendChild(content);
  el.appendChild(close);
  el.appendChild(progress);
  c.appendChild(el);
  var hide = function () {
    if (!el.isConnected || el.classList.contains('is-hiding')) return;
    el.classList.add('is-hiding');
    setTimeout(function () { el.remove(); }, 220);
  };
  close.addEventListener('click', hide);
  setTimeout(hide, meta.duration);
}
function call(name) {
  var args = Array.prototype.slice.call(arguments, 1);
  var ctrl = new AbortController();
  var timer = setTimeout(function () { ctrl.abort(); }, 60000);
  return fetch(WORKER_URL + '/api/admin', {
    method: 'POST',
    signal: ctrl.signal,
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + TOKEN },
    body: JSON.stringify({ action: name, args: args }),
  }).then(function (r) {
    return r.json().catch(function () { return {}; }).then(function (data) {
      if (r.status === 401) { TOKEN = null; clearToken(); showGate(data.error || '登入已過期，請重新登入。'); throw new Error(data.error || '未登入'); }
      if (!r.ok) { notify(data.error || ('HTTP ' + r.status), false); throw new Error(data.error || ('HTTP ' + r.status)); }
      return data.result;
    });
  }, function (err) {
    var message = err && err.name === 'AbortError' ? '連線逾時（60 秒無回應）。' : ('連線失敗：' + (err && err.message || err));
    notify(message, false);
    throw new Error(message);
  }).finally(function () { clearTimeout(timer); });
}
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]; }); }
function fmt(iso) { var d = new Date(iso); return isNaN(d) ? esc(iso) : d.toLocaleString('zh-TW', { hour12: false }); }

// 編輯按鈕只保存資料列的 key；完整物件留在記憶體，不再序列化進
// onclick HTML，避免引號/HTML entity 交錯造成 XSS 或按鈕失效。
var EDIT_RECORDS = Object.create(null);
function cacheEditRecords(kind, rows, keyField) {
  var records = Object.create(null);
  (rows || []).forEach(function (row) { records[String(row[keyField])] = row; });
  EDIT_RECORDS[kind] = records;
}
function editRecordButton(kind, key, icon) {
  return '<button type="button" class="btn btn-sm btn-outline-primary" data-edit-kind="' +
    esc(kind) + '" data-edit-key="' + esc(key) + '">' +
    (icon ? '<i class="bi bi-pencil me-1"></i>' : '') + '編輯</button>';
}
document.addEventListener('click', function (event) {
  var target = event.target && event.target.closest ? event.target.closest('[data-edit-kind][data-edit-key]') : null;
  if (target) {
    var kind = target.getAttribute('data-edit-kind');
    var key = target.getAttribute('data-edit-key');
    var row = EDIT_RECORDS[kind] && EDIT_RECORDS[kind][key];
    var handlers = {
      announcement: openAnnounce,
      calendar: openCal,
      equipment: editEquip,
      admin: editAdm,
      event: openEvent,
      seal: editSeal,
    };
    if (!row || !handlers[kind]) { notify('資料已更新，請重新載入後再試。', false); return; }
    handlers[kind](row);
    return;
  }

  var actionTarget = event.target && event.target.closest ? event.target.closest('[data-ui-action]') : null;
  if (!actionTarget) return;
  var action = actionTarget.getAttribute('data-ui-action');
  var actions = {
    delAnnounce: function () { delAnnounce(actionTarget.dataset.id); },
    delCal: function () { delCal(actionTarget.dataset.id); },
    openDbDept: function () { openDbDept(actionTarget.dataset.id); },
    openDbCourses: function () { openDbCourses(actionTarget.dataset.id); },
    delDbDept: function () { delDbDept(actionTarget.dataset.id); },
    openDbPost: function () { openDbPost(actionTarget.dataset.id); },
    delDbPost: function () { delDbPost(actionTarget.dataset.id); },
    approveDbSubmission: function () { approveDbSubmission(actionTarget.dataset.id); },
    rejectDbSubmission: function () { rejectDbSubmission(actionTarget.dataset.id); },
    previewDbSubmission: function () { previewDbSubmission(actionTarget.dataset.id); },
    retryDbCleanup: function () { retryDbCleanup(actionTarget.dataset.id); },
    approveB: function () { approveB(actionTarget.dataset.id); },
    rejectB: function () { rejectB(actionTarget.dataset.id); },
    resetVenueBooking: function () { resetVenueBooking(actionTarget.dataset.id); },
    editBooking: function () { editBooking(actionTarget.dataset.id); },
    delB: function () { delB(actionTarget.dataset.id); },
    delClosed: function () { delClosed(actionTarget.dataset.id); },
    lockerDetail: function () { lockerDetail(Number(actionTarget.dataset.number)); },
    removeZone: function () { removeZone(Number(actionTarget.dataset.index)); },
    toggleOpen: function () { toggleOpen(Number(actionTarget.dataset.number), actionTarget.dataset.open === 'true'); },
    completeLk: function () { completeLk(Number(actionTarget.dataset.number)); },
    returnLk: function () { returnLk(Number(actionTarget.dataset.number)); },
    clearLk: function () { clearLk(Number(actionTarget.dataset.number)); },
    manualBorrow: function () { manualBorrow(Number(actionTarget.dataset.number)); },
    saveReceipt: function () { saveReceipt(Number(actionTarget.dataset.number)); },
    delEquip: function () { delEquip(actionTarget.dataset.id); },
    approveEqb: function () { approveEqb(actionTarget.dataset.id); },
    rejectEqb: function () { rejectEqb(actionTarget.dataset.id); },
    pickupEqb: function () { pickupEqb(actionTarget.dataset.id); },
    returnEqb: function () { returnEqb(actionTarget.dataset.id); },
    undoEqb: function () { undoEqb(actionTarget.dataset.id); },
    delEqb: function () { delEqb(actionTarget.dataset.id); },
    goTab: function () { goTab(actionTarget.dataset.tab); },
    rmAdm: function () { rmAdm(actionTarget.dataset.email); },
    loadAudit: function () { loadAudit(Number(actionTarget.dataset.page)); },
    petStatus: function () { petStatus(actionTarget.dataset.id, actionTarget.dataset.status); },
    petDel: function () { petDel(actionTarget.dataset.id); },
    openEmail: function () { openEmailTemplate(actionTarget.dataset.key); },
    openPageText: function () { openPageText(actionTarget.dataset.key); },
    copyEventLink: function () { copyEventLink(actionTarget.dataset.slug); },
    showCheckinQR: function () { showCheckinQR(actionTarget.dataset.slug, actionTarget.dataset.title); },
    viewRegs: function () { viewRegs(actionTarget.dataset.id, actionTarget.dataset.title); },
    delEv: function () { delEv(actionTarget.dataset.id); },
    signInSheet: function () { signInSheet(); },
    closeEventRegs: function () { document.getElementById('ev-regs').innerHTML = ''; },
    sendRegMail: function () { sendRegMail(); },
    delReg: function () { delReg(actionTarget.dataset.id); },
    delSeal: function () { delSeal(actionTarget.dataset.id); },
    delMeetingAttendee: function () { delMeetingAttendee(actionTarget.dataset.id); },
  };
  if (actions[action]) actions[action]();
});
document.addEventListener('change', function (event) {
  var target = event.target;
  if (target && target.getAttribute('data-ui-change') === 'toggleEquip') {
    toggleEquip(target.dataset.id, target.checked);
  }
});
