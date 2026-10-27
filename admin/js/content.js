// Admin module: content. Loaded as a classic script for legacy handler compatibility.
// ---------- 公告 ----------
// ---------- 編輯視窗共用 ----------
function showModal(id) { bootstrap.Modal.getOrCreateInstance(document.getElementById(id)).show(); }
function hideModal(id) { var m = bootstrap.Modal.getInstance(document.getElementById(id)); if (m) m.hide(); }
// 排程上架／下架狀態標籤
function schedLabel(r) {
  var t = new Date().toLocaleDateString('en-CA'); // 本地 YYYY-MM-DD
  var out = '';
  if (r.publishFrom && r.publishFrom > t) out += '<span class="badge bg-warning text-dark me-1"><i class="bi bi-clock me-1"></i>排程上架 ' + esc(r.publishFrom) + '</span>';
  if (r.publishUntil) out += '<span class="badge ' + (r.publishUntil < t ? 'bg-secondary' : 'bg-light text-dark border') + ' me-1">' + (r.publishUntil < t ? '已下架 ' : '下架 ') + esc(r.publishUntil) + '</span>';
  return out;
}
function openAnnounce(r) {
  if (r) editAnnounce(r); else resetAnnounce();
  document.getElementById('an-modal-title').textContent = r ? '編輯公告' : '新增公告';
  showModal('announceModal');
}
function loadAnnounce() {
  call('listAnnouncements').then(function (rows) {
    cacheEditRecords('announcement', rows, 'id');
    document.getElementById('an-list').innerHTML = rows.map(function (r) {
      return '<div class="card mb-2 shadow-sm border-0"><div class="card-body py-2">' +
        '<div class="d-flex justify-content-between align-items-start"><b>' + (r.pinned === 'true' ? '<i class="bi bi-pin-angle-fill text-warning me-1"></i>' : '') + esc(r.title) + '</b><small class="text-muted flex-shrink-0 ms-2">' + esc(r.date) + '</small></div>' +
        '<div class="small text-muted mt-1" style="white-space:pre-wrap;max-height:3rem;overflow:hidden">' + esc(r.body) + '</div>' +
        (r.attachmentUrl ? '<div class="small text-primary mt-1"><i class="bi bi-paperclip me-1"></i>' + esc(r.attachmentLabel || '附件') + '</div>' : '') +
        (schedLabel(r) ? '<div class="mt-1">' + schedLabel(r) + '</div>' : '') +
        '<div class="mt-2">' + editRecordButton('announcement', r.id, true) + ' ' +
        '<button class="btn btn-sm btn-outline-danger" data-ui-action="delAnnounce" data-id="' + esc(r.id) + '"><i class="bi bi-trash me-1"></i>刪除</button></div>' +
        '</div></div>';
    }).join('') || '<p class="text-muted">尚無公告，點右上角「新增公告」。</p>';
  });
}
function editAnnounce(r) {
  document.getElementById('an-id').value = r.id;
  document.getElementById('an-title').value = r.title;
  document.getElementById('an-title-en').value = r.titleEn || '';
  document.getElementById('an-date').value = r.date;
  document.getElementById('an-body').value = r.body;
  document.getElementById('an-body-en').value = r.bodyEn || '';
  document.getElementById('an-attachment-url').value = r.attachmentUrl || '';
  document.getElementById('an-attachment-label').value = r.attachmentLabel || '';
  document.getElementById('an-attachment-label-en').value = r.attachmentLabelEn || '';
  document.getElementById('an-pinned').checked = r.pinned === 'true';
  document.getElementById('an-atitle').value = r.authorTitle || '';
  document.getElementById('an-aname').value = r.authorName || '';
  document.getElementById('an-from').value = r.publishFrom || '';
  document.getElementById('an-until').value = r.publishUntil || '';
}
function resetAnnounce() {
  ['an-id', 'an-title', 'an-title-en', 'an-date', 'an-body', 'an-body-en', 'an-from', 'an-until', 'an-attachment-url', 'an-attachment-label', 'an-attachment-label-en'].forEach(function (i) { document.getElementById(i).value = ''; });
  document.getElementById('an-pinned').checked = false;
  document.getElementById('an-atitle').value = (MEPROF && MEPROF.title) || '';
  document.getElementById('an-aname').value = (MEPROF && MEPROF.name) || '';
}
function saveAnnounce() {
  call('saveAnnouncement', {
    id: document.getElementById('an-id').value, title: document.getElementById('an-title').value,
    titleEn: document.getElementById('an-title-en').value,
    date: document.getElementById('an-date').value, body: document.getElementById('an-body').value,
    bodyEn: document.getElementById('an-body-en').value,
    attachmentUrl: document.getElementById('an-attachment-url').value,
    attachmentLabel: document.getElementById('an-attachment-label').value,
    attachmentLabelEn: document.getElementById('an-attachment-label-en').value,
    pinned: document.getElementById('an-pinned').checked,
    authorTitle: document.getElementById('an-atitle').value, authorName: document.getElementById('an-aname').value,
    publishFrom: document.getElementById('an-from').value, publishUntil: document.getElementById('an-until').value
  }).then(function () { notify('已儲存'); hideModal('announceModal'); loadAnnounce(); });
}
function delAnnounce(id) { if (confirm('確定刪除？')) call('deleteAnnouncement', id).then(function () { loadAnnounce(); }); }

// ---------- 行事曆 ----------
function openCal(r) {
  if (r) editCal(r); else resetCal();
  document.getElementById('cal-modal-title').textContent = r ? '編輯行事曆' : '新增行事曆';
  showModal('calModal');
}
function loadCal() {
  call('listCalendars').then(function (rows) {
    cacheEditRecords('calendar', rows, 'id');
    document.getElementById('cal-list').innerHTML = rows.map(function (r) {
      return '<div class="card mb-2 shadow-sm border-0"><div class="card-body py-2"><b><i class="bi bi-calendar3 me-1 text-secondary"></i>' + esc(r.title) + '</b>' +
        '<div class="small text-muted text-truncate">' + esc(r.embedUrl) + '</div>' +
        '<div class="mt-2">' + editRecordButton('calendar', r.id, true) + ' ' +
        '<button class="btn btn-sm btn-outline-danger" data-ui-action="delCal" data-id="' + esc(r.id) + '"><i class="bi bi-trash me-1"></i>刪除</button></div></div></div>';
    }).join('') || '<p class="text-muted">尚未設定，點右上角「新增行事曆」。</p>';
  });
}
function editCal(r) { document.getElementById('cal-id').value = r.id; document.getElementById('cal-title').value = r.title; document.getElementById('cal-url').value = r.embedUrl; }
function resetCal() { ['cal-id', 'cal-title', 'cal-url'].forEach(function (i) { document.getElementById(i).value = ''; }); }
function saveCal() {
  call('saveCalendar', { id: document.getElementById('cal-id').value, title: document.getElementById('cal-title').value, embedUrl: document.getElementById('cal-url').value })
    .then(function () { notify('已儲存'); hideModal('calModal'); loadCal(); });
}
function delCal(id) { if (confirm('確定刪除？')) call('deleteCalendar', id).then(function () { loadCal(); }); }
