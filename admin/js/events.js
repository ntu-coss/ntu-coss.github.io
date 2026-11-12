// Admin module: events. Loaded as a classic script for legacy handler compatibility.
// ---------- 首頁（橫幅 + 活動） ----------
function loadHero() {
  call('getSettingsAll').then(function (rows) {
    var m = {}; rows.forEach(function (r) { m[r.key] = r.value; });
    document.getElementById('hero-image').value = m.home_hero_image || '';
    document.getElementById('hero-height').value = m.home_hero_height || '220';
    document.getElementById('hero-color').value = m.home_title_color || '#1d3557';
  });
}
function saveHero() {
  Promise.all([
    call('saveSetting', 'home_hero_image', document.getElementById('hero-image').value),
    call('saveSetting', 'home_hero_height', document.getElementById('hero-height').value),
    call('saveSetting', 'home_title_color', document.getElementById('hero-color').value),
  ]).then(function () { notify('已儲存橫幅設定'); });
}
function openEvent(r) {
  if (r) editEv(r); else resetEv();
  document.getElementById('ev-modal-title').textContent = r ? '編輯活動' : '新增活動';
  showModal('eventModal');
}
function loadEvents() {
  call('listEvents').then(function (rows) {
    cacheEditRecords('event', rows, 'id');
    document.getElementById('ev-list').innerHTML = rows.length ? rows.map(function (r) {
      return '<div class="card mb-2 shadow-sm border-0"><div class="card-body py-2 d-flex align-items-center gap-2">' +
        (r.image ? '<img src="' + esc(r.image) + '" style="width:64px;height:48px;object-fit:cover;border-radius:6px">' : '<div style="width:64px;height:48px;border-radius:6px;background:#eef1f6;display:flex;align-items:center;justify-content:center"><i class="bi bi-image text-secondary"></i></div>') +
        '<div class="flex-grow-1"><b>' + esc(r.title) + '</b> ' + (String(r.published) === 'true' ? '<span class="badge bg-success">已發布</span>' : '<span class="badge bg-secondary">未發布</span>') +
        (String(r.signupOpen) === 'true' ? ' <span class="badge bg-info text-dark">開放報名</span>' : '') +
        (r.checkinMode ? ' <span class="badge bg-warning text-dark">簽到中</span>' : '') +
        '<div class="small text-muted">' + esc(r.date) + '　排序：' + esc(r.order) + '</div>' +
        (schedLabel(r) ? '<div class="mt-1">' + schedLabel(r) + '</div>' : '') + '</div>' +
        editRecordButton('event', r.id, true) + ' ' +
        (String(r.published) === 'true' ? '<button class="btn btn-sm btn-outline-secondary" data-ui-action="copyEventLink" data-slug="' + esc(r.slug || r.id) + '"><i class="bi bi-link-45deg me-1"></i>複製連結</button> ' : '') +
        (r.checkinMode ? '<button class="btn btn-sm btn-outline-warning" data-ui-action="showCheckinQR" data-slug="' + esc(r.slug || r.id) + '" data-title="' + esc(r.title) + '"><i class="bi bi-qr-code me-1"></i>簽到 QR</button> ' : '') +
        (r.formUrl || r.responseSheetUrl || String(r.signupOpen) === 'true' || String(r.signupRoster) === 'true' || r.checkinMode ? '<button class="btn btn-sm btn-outline-success" data-ui-action="viewRegs" data-id="' + esc(r.id) + '" data-title="' + esc(r.title) + '"><i class="bi bi-people me-1"></i>報名／簽到名單</button> ' : '') +
        '<button class="btn btn-sm btn-outline-danger" data-ui-action="delEv" data-id="' + esc(r.id) + '"><i class="bi bi-trash me-1"></i>刪除</button>' +
        '</div></div>';
    }).join('') : '<p class="text-muted">尚無活動，點右上角「新增活動」。</p>';
  });
}
function evObj() {
  return {
    id: document.getElementById('ev-id').value || '',
    title: document.getElementById('ev-title').value,
    titleEn: document.getElementById('ev-title-en').value,
    image: document.getElementById('ev-image').value,
    date: document.getElementById('ev-date').value,
    summary: document.getElementById('ev-summary').value,
    summaryEn: document.getElementById('ev-summary-en').value,
    body: document.getElementById('ev-body').value,
    bodyEn: document.getElementById('ev-body-en').value,
    order: document.getElementById('ev-order').value,
    published: document.getElementById('ev-published').checked,
    signupOpen: document.getElementById('ev-signup').checked,
    signupRoster: document.getElementById('ev-signuproster').checked,
    authorTitle: document.getElementById('ev-atitle').value,
    authorName: document.getElementById('ev-aname').value,
    publishFrom: document.getElementById('ev-from').value,
    publishUntil: document.getElementById('ev-until').value,
    slug: document.getElementById('ev-slug').value,
    formUrl: document.getElementById('ev-formUrl').value,
    responseSheetUrl: document.getElementById('ev-responseSheetUrl').value,
    responseSheetTab: document.getElementById('ev-responseSheetTab').value,
    responseNameColumn: document.getElementById('ev-responseNameColumn').value,
    responseStudentIdColumn: document.getElementById('ev-responseStudentIdColumn').value,
    responseEmailColumn: document.getElementById('ev-responseEmailColumn').value,
    responseDeptColumn: document.getElementById('ev-responseDeptColumn').value,
    checkinMode: document.getElementById('ev-checkin').value,
  };
}
function saveEv() {
  if (!document.getElementById('ev-title').value.trim()) { notify('請填寫標題', false); return; }
  call('saveEvent', evObj()).then(function () { notify('已儲存'); hideModal('eventModal'); loadEvents(); });
}
function editEv(r) {
  document.getElementById('ev-id').value = r.id || '';
  document.getElementById('ev-title').value = r.title || '';
  document.getElementById('ev-title-en').value = r.titleEn || '';
  document.getElementById('ev-image').value = r.image || '';
  document.getElementById('ev-date').value = r.date || '';
  document.getElementById('ev-summary').value = r.summary || '';
  document.getElementById('ev-summary-en').value = r.summaryEn || '';
  document.getElementById('ev-body').value = r.body || '';
  document.getElementById('ev-body-en').value = r.bodyEn || '';
  document.getElementById('ev-order').value = r.order || '0';
  document.getElementById('ev-published').checked = String(r.published) === 'true';
  document.getElementById('ev-signup').checked = String(r.signupOpen) === 'true';
  document.getElementById('ev-signuproster').checked = String(r.signupRoster) === 'true';
  document.getElementById('ev-atitle').value = r.authorTitle || '';
  document.getElementById('ev-aname').value = r.authorName || '';
  document.getElementById('ev-from').value = r.publishFrom || '';
  document.getElementById('ev-until').value = r.publishUntil || '';
  document.getElementById('ev-slug').value = r.slug || '';
  document.getElementById('ev-checkin').value = r.checkinMode || '';
  document.getElementById('ev-formUrl').value = r.formUrl || '';
  document.getElementById('ev-responseSheetUrl').value = r.responseSheetUrl || '';
  document.getElementById('ev-responseSheetTab').value = r.responseSheetTab || '';
  document.getElementById('ev-responseNameColumn').value = r.responseNameColumn || '';
  document.getElementById('ev-responseStudentIdColumn').value = r.responseStudentIdColumn || '';
  document.getElementById('ev-responseEmailColumn').value = r.responseEmailColumn || '';
  document.getElementById('ev-responseDeptColumn').value = r.responseDeptColumn || '';

}
function resetEv() {
  ['ev-id', 'ev-title', 'ev-title-en', 'ev-image', 'ev-date', 'ev-summary', 'ev-summary-en', 'ev-body', 'ev-body-en', 'ev-from', 'ev-until', 'ev-slug'].forEach(function (id) { document.getElementById(id).value = ''; });
  document.getElementById('ev-order').value = '0';
  document.getElementById('ev-published').checked = true;
  document.getElementById('ev-signup').checked = false;
  document.getElementById('ev-signuproster').checked = false;
  document.getElementById('ev-checkin').value = '';
  document.getElementById('ev-formUrl').value = '';
  document.getElementById('ev-responseSheetUrl').value = '';
  document.getElementById('ev-responseSheetTab').value = '';
  document.getElementById('ev-responseNameColumn').value = '';
  document.getElementById('ev-responseStudentIdColumn').value = '';
  document.getElementById('ev-responseEmailColumn').value = '';
  document.getElementById('ev-responseDeptColumn').value = '';

  document.getElementById('ev-atitle').value = (MEPROF && MEPROF.title) || '';
  document.getElementById('ev-aname').value = (MEPROF && MEPROF.name) || '';
}
function delEv(id) { if (confirm('刪除此活動？')) call('deleteEvent', id).then(function () { loadEvents(); }); }
function copyEventLink(slugOrId) {
  var url = location.origin + '/event?id=' + encodeURIComponent(slugOrId);
  function done() { notify('已複製連結：' + url); }
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(url).then(done).catch(function () { prompt('複製此活動連結：', url); });
  } else { prompt('複製此活動連結：', url); }
}
function checkinUrlOf(slugOrId) { return location.origin + '/checkin?e=' + encodeURIComponent(slugOrId); }
function showCheckinQR(slugOrId, title) {
  var url = checkinUrlOf(slugOrId);
  document.getElementById('qr-title').textContent = title;
  document.getElementById('qr-url').value = url;
  var box = document.getElementById('qr-box');
  box.innerHTML = '';
  if (typeof QRCode === 'undefined') { box.textContent = 'QR 元件載入失敗，請改用下方連結。'; }
  else { new QRCode(box, { text: url, width: 240, height: 240, correctLevel: QRCode.CorrectLevel.M }); }
  bootstrap.Modal.getOrCreateInstance(document.getElementById('checkinQRModal')).show();
}
function copyCheckinUrl() {
  var url = document.getElementById('qr-url').value;
  if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url).then(function () { notify('已複製連結'); });
  else prompt('複製簽到連結：', url);
}
function printCheckinQR() {
  var title = document.getElementById('qr-title').textContent;
  var url = document.getElementById('qr-url').value;
  var img = document.querySelector('#qr-box img') || document.querySelector('#qr-box canvas');
  var src = img ? (img.tagName === 'CANVAS' ? img.toDataURL('image/png') : img.src) : '';
  var body = '<div style="text-align:center;font-family:sans-serif">' +
    '<h1 style="margin:0 0 8px">' + esc(title) + '</h1>' +
    '<h2 style="margin:0 0 24px;font-weight:normal">活動簽到</h2>' +
    (src ? '<img src="' + src + '" style="width:340px;height:340px">' : '') +
    '<p style="margin-top:20px;font-size:18px">掃描 QR Code 進行簽到</p>' +
    '<p style="color:#555;word-break:break-all">' + esc(url) + '</p></div>';
  printDoc(title + ' 簽到 QR', body, 'th,td{border:none;}');
}
function viewRegs(eventId, title) {
  window.__regEvent = { id: eventId, title: title };
  call('listRegistrations', eventId).then(function (rows) {
    window.__regRows = rows; window.__quickCandidate = null;
    var withEmail = rows.filter(function (r) { return r.email; }).length;
    var checkedIn = rows.filter(function (r) { return r.checkinAt; }).length;
    var html = '<div class="d-flex justify-content-between align-items-center mb-1"><h6 class="mb-0">報名／簽到名單：' + esc(title) + '（' + rows.length + ' 人，已簽到 ' + checkedIn + ' 人）</h6>' +
      '<div><button class="btn btn-sm btn-outline-dark me-1" data-ui-action="signInSheet">簽到表 (PDF)</button>' +
      '<button class="btn btn-sm btn-outline-secondary" data-ui-action="closeEventRegs">關閉</button></div></div>';
    html += '<div id="event-service-alerts" role="status"></div><div class="card mb-2"><div class="card-body"><button type="button" class="btn btn-outline-primary mb-2" data-ui-action="syncEventResponses">同步表單回覆</button><label for="quick-checkin" class="form-label d-block">快速簽到：輸入完整姓名或學號，按 Enter 確認，再按 Enter 簽到</label><input id="quick-checkin" class="form-control" autocomplete="off"><div id="quick-checkin-status" class="mt-2" role="status"></div></div></div>';
    html += '<div class="card mb-2"><div class="card-body py-2" style="max-width:820px">' +
      '<div class="fw-bold mb-1">發信給報名者（' + withEmail + ' 人有填 Email）</div>' +
      '<input id="reg-subj" class="form-control form-control-sm mb-1" placeholder="主旨">' +
      '<textarea id="reg-body" class="form-control form-control-sm mb-1" rows="4" placeholder="內文（可自由編輯）"></textarea>' +
      '<button class="btn btn-sm btn-primary" data-ui-action="sendRegMail">寄送</button></div></div>';
    html += rows.length
      ? '<div class="admin-table-scroll"><table class="table table-sm table-striped align-middle"><thead><tr><th>#</th><th>姓名</th><th>學號</th><th>Email</th><th>系級</th><th>來源</th><th>簽到</th><th>備註</th><th>時間</th><th></th></tr></thead><tbody>' +
        rows.map(function (r, i) {
          var ci = r.checkinAt ? '<span class="badge bg-success"><i class="bi bi-check-lg me-1" aria-hidden="true"></i>' + fmt(r.checkinAt) + '</span>' : '<span class="text-muted small">—</span>';
          return '<tr><td>' + (i + 1) + '</td><td>' + esc(r.name) + '</td><td>' + esc(r.studentId) + '</td><td class="small">' + esc(r.email) + '</td><td>' + esc(r.dept) + '</td><td>' + esc(r.source) + '</td><td class="small text-nowrap">' + ci + '</td><td class="small">' + esc(r.note) + '</td><td class="small text-nowrap">' + fmt(r.createdAt) + '</td>' +
            '<td>' + (!r.checkinAt ? '<button class="btn btn-sm btn-outline-success me-1" data-ui-action="manualEventCheckin" data-id="' + esc(r.id) + '">簽到</button>' : '') + '<button class="btn btn-sm btn-outline-danger" data-ui-action="delReg" data-id="' + esc(r.id) + '">刪除</button></td></tr>';
        }).join('') + '</tbody></table></div>'
      : '<p class="text-muted">尚無人報名。</p>';
    document.getElementById('ev-regs').innerHTML = html;
    document.getElementById('quick-checkin').addEventListener('input', function () { window.__quickCandidate = null; document.getElementById('quick-checkin-status').textContent = ''; });
    document.getElementById('quick-checkin').addEventListener('keydown', quickEventCheckin);
    call('listServiceAlerts').then(function (alerts) { document.getElementById('event-service-alerts').textContent = alerts.length ? '服務警示：' + alerts.slice(0, 5).map(function(a) { return a.createdAt + ' ' + a.service + '：' + a.message; }).join('；') : ''; });
  });
}
function sendRegMail() {
  var ev = window.__regEvent; if (!ev) return;
  var subj = document.getElementById('reg-subj').value, body = document.getElementById('reg-body').value;
  if (!subj.trim() || !body.trim()) { notify('請填寫主旨與內文', false); return; }
  if (!confirm('確定寄送給所有有填 Email 的報名者？')) return;
  call('emailRegistrants', ev.id, subj, body).then(function (res) { notify('已確認寄送 ' + res.sent + ' 人；結果未確認 ' + (res.unconfirmed || 0) + ' 人；未寄送 ' + (res.notSent || 0) + ' 人。' + (res.error || ''), !res.error); });
}
function delReg(id) { var ev = window.__regEvent; if (confirm('刪除此筆報名？')) call('deleteRegistration', id).then(function () { viewRegs(ev.id, ev.title); }); }

function syncEventResponses() { var ev = window.__regEvent; if (!ev) return; call('syncEventResponses', ev.id).then(function(r) { notify('同步完成，新增 ' + r.added + ' 人；略過空白或重複 ' + r.skipped + ' 筆'); viewRegs(ev.id, ev.title); }); }
function manualEventCheckin(id) { var ev = window.__regEvent; if (!ev) return; call('checkinRegistration', ev.id, id).then(function(r) { notify(r.already ? r.name + ' 已簽到，未重複登記' : r.name + ' 簽到完成'); viewRegs(ev.id, ev.title); }); }
function quickEventCheckin(event) {
  if (event.key !== 'Enter' || event.repeat || event.isComposing) return;
  event.preventDefault();
  var input = event.currentTarget, value = input.value.trim().toLowerCase(), box = document.getElementById('quick-checkin-status');
  if (input.disabled || !value) return;
  var matches = (window.__regRows || []).filter(function(r) { return String(r.studentId || '').trim().toLowerCase() === value || String(r.name || '').trim().toLowerCase() === value; });
  if (matches.length !== 1) { window.__quickCandidate = null; box.textContent = matches.length ? '姓名重複，請輸入學號或使用名單的簽到按鈕。' : '查無此人，請先同步表單回覆或確認輸入。'; return; }
  var row = matches[0];
  if (row.checkinAt) { box.textContent = row.name + ' 已簽到，無需重複。'; return; }
  if (window.__quickCandidate !== row.id) { window.__quickCandidate = row.id; box.textContent = '確認：' + row.name + '（' + row.studentId + '），再按 Enter 簽到。'; return; }
  input.disabled = true; window.__quickCandidate = null;
  call('checkinRegistration', window.__regEvent.id, row.id).then(function() { row.checkinAt = new Date().toISOString(); box.textContent = row.name + ' 簽到完成'; input.value = ''; }).finally(function() { input.disabled = false; input.focus(); });
}
