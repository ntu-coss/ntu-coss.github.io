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
    var eventId = new URLSearchParams(location.search).get('event');
    if (eventId) { var chosen=rows.find(function(r){return r.id===eventId;});document.getElementById('ev-list').innerHTML='';document.getElementById('ev-list').previousElementSibling.classList.add('d-none'); if(!chosen){document.getElementById('ev-regs').textContent='找不到活動或無存取權。';return;}viewRegs(chosen.id,chosen.title);return; }
    document.getElementById('ev-list').innerHTML = rows.length ? rows.map(function (r) {
      return '<div class="card mb-2 shadow-sm border-0"><div class="card-body py-2 d-flex align-items-center gap-2">' +
        (r.image ? '<img src="' + esc(r.image) + '" style="width:64px;height:48px;object-fit:cover;border-radius:6px">' : '<div style="width:64px;height:48px;border-radius:6px;background:#eef1f6;display:flex;align-items:center;justify-content:center"><i class="bi bi-image text-secondary"></i></div>') +
        '<div class="flex-grow-1"><a href="/admin/?event=' + encodeURIComponent(r.id) + '" class="fw-bold">' + esc(r.title) + '</a> ' + (String(r.published) === 'true' ? '<span class="badge bg-success">已發布</span>' : '<span class="badge bg-secondary">未發布</span>') +
        (String(r.signupOpen) === 'true' ? ' <span class="badge bg-info text-dark">開放報名</span>' : '') +
        (r.checkinMode ? ' <span class="badge bg-warning text-dark">簽到中</span>' : '') +
        '<div class="small text-muted">' + esc(r.date) + '　排序：' + esc(r.order) + '</div>' +
        (schedLabel(r) ? '<div class="mt-1">' + schedLabel(r) + '</div>' : '') + '</div>' +
        editRecordButton('event', r.id, true) + ' ' +
        (String(r.published) === 'true' ? '<button class="btn btn-sm btn-outline-secondary" data-ui-action="copyEventLink" data-slug="' + esc(r.slug || r.id) + '"><i class="bi bi-link-45deg me-1"></i>複製連結</button> ' : '') +
        (r.checkinMode ? '<button class="btn btn-sm btn-outline-warning" data-ui-action="showCheckinQR" data-slug="' + esc(r.slug || r.id) + '" data-title="' + esc(r.title) + '"><i class="bi bi-qr-code me-1"></i>簽到 QR</button> ' : '') +
        (r.formUrl || r.responseSheetUrl || String(r.signupOpen) === 'true' || String(r.signupRoster) === 'true' || r.checkinMode ? '<a class="btn btn-sm btn-outline-success" href="/admin/?event=' + encodeURIComponent(r.id) + '">管理活動</a> ' : '') +
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
    walkinEnabled: document.getElementById('ev-walkinEnabled').checked,
    walkinFields: Array.from(document.querySelectorAll('.ev-walkin-field:checked')).map(function(e) { return e.value; }),
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
  document.getElementById('ev-checkin').value = r.checkinMode ? 'match' : '';
  document.getElementById('ev-walkinEnabled').checked = r.walkinEnabled == null || r.walkinEnabled === '' ? r.checkinMode === 'walkin' : String(r.walkinEnabled) === 'true';
  var fields; try { fields = JSON.parse(r.walkinFields); } catch(e) {}
  document.querySelectorAll('.ev-walkin-field').forEach(function(e) { e.checked = !Array.isArray(fields) || fields.indexOf(e.value) !== -1; });
  document.getElementById('ev-formUrl').value = r.formUrl || '';
  document.getElementById('ev-responseSheetUrl').value = r.responseSheetUrl || '';

}
function resetEv() {
  ['ev-id', 'ev-title', 'ev-title-en', 'ev-image', 'ev-date', 'ev-summary', 'ev-summary-en', 'ev-body', 'ev-body-en', 'ev-from', 'ev-until', 'ev-slug'].forEach(function (id) { document.getElementById(id).value = ''; });
  document.getElementById('ev-order').value = '0';
  document.getElementById('ev-published').checked = true;
  document.getElementById('ev-signup').checked = false;
  document.getElementById('ev-signuproster').checked = false;
  document.getElementById('ev-checkin').value = '';
  document.getElementById('ev-walkinEnabled').checked = false;
  document.querySelectorAll('.ev-walkin-field').forEach(function(e) { e.checked = true; });
  document.getElementById('ev-formUrl').value = '';
  document.getElementById('ev-responseSheetUrl').value = '';

  document.getElementById('ev-atitle').value = (MEPROF && MEPROF.title) || '';
  document.getElementById('ev-aname').value = (MEPROF && MEPROF.name) || '';
}
function delEv(id) { if (confirm('刪除此活動？')) call('deleteEvent', id).then(function () { if(new URLSearchParams(location.search).has('event'))location.href='/admin/?tab=events';else loadEvents(); }); }
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
    var record = EDIT_RECORDS.event && EDIT_RECORDS.event[eventId];
    var html = '<a href="/admin/?tab=events" class="btn btn-outline-secondary btn-sm mb-3">返回活動列表</a><h1 class="h4">'+esc(title)+'</h1><p class="text-muted">共 '+rows.length+' 人，已簽到 '+checkedIn+' 人</p><div class="d-flex flex-wrap gap-2 mb-3">'+editRecordButton('event',eventId,true)+(record ? '<button class="btn btn-outline-secondary" data-ui-action="copyEventLink" data-slug="'+esc(record.slug||eventId)+'">複製活動連結</button>' : '')+'<button class="btn btn-primary" data-ui-action="openQuickEventCheckin">快速簽到</button><button class="btn btn-outline-primary" data-ui-action="openEventMail">發信</button><button class="btn btn-outline-secondary" data-ui-action="syncEventResponses">同步名單</button><button class="btn btn-outline-secondary" data-ui-action="openEventMapping">欄位對應</button><button class="btn btn-outline-secondary" data-ui-action="signInSheet">簽到表 PDF</button>'+(record && record.checkinMode ? '<button class="btn btn-outline-secondary" data-ui-action="showCheckinQR" data-slug="'+esc(record.slug||eventId)+'" data-title="'+esc(title)+'">簽到 QR</button>' : '')+'<button class="btn btn-outline-danger" data-ui-action="delEv" data-id="'+esc(eventId)+'">刪除活動</button></div><div id="event-service-alerts" role="status"></div>';
    html += rows.length
      ? '<div class="admin-table-scroll"><table class="table table-sm table-striped align-middle"><thead><tr><th>#</th><th>姓名</th><th>學號</th><th>Email</th><th>系級</th><th>身份別</th><th>來源</th><th>簽到</th><th>備註</th><th>時間</th><th></th></tr></thead><tbody>' +
        rows.map(function (r, i) {
          var ci = r.checkinAt ? '<span class="badge bg-success"><i class="bi bi-check-lg me-1" aria-hidden="true"></i>' + fmt(r.checkinAt) + '</span>' : '<span class="text-muted small">—</span>';
          return '<tr><td>' + (i + 1) + '</td><td>' + esc(r.name) + '</td><td>' + esc(r.studentId) + '</td><td class="small">' + esc(r.email) + '</td><td>' + esc(r.dept) + '</td><td>' + esc(({student:'學生',staff:'教職員',public:'社會人士'})[r.identity] || '') + '</td><td>' + esc(r.source) + '</td><td class="small text-nowrap">' + ci + '</td><td class="small">' + esc(r.note) + '</td><td class="small text-nowrap">' + fmt(r.createdAt) + '</td>' +
            '<td>' + (!r.checkinAt ? '<button class="btn btn-sm btn-outline-success me-1" data-ui-action="manualEventCheckin" data-id="' + esc(r.id) + '">簽到</button>' : '') + '<button class="btn btn-sm btn-outline-danger" data-ui-action="delReg" data-id="' + esc(r.id) + '">刪除</button></td></tr>';
        }).join('') + '</tbody></table></div>'
      : '<p class="text-muted">尚無人報名。</p>';
    document.getElementById('ev-regs').innerHTML = html;
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

function syncEventResponses() {
  var ev=window.__regEvent;if(!ev)return Promise.resolve();
  return call('getEventResponseColumns',ev.id,'').then(function(data){
    if(!data.tabs.length){notify('請先編輯活動，設定回覆試算表連結。',false);return;}
    var name=data.event.responseNameColumn || '姓名';
    if(data.event.responseSheetTab!==data.tab || !data.headers.includes(name)){
      showModal('eventMappingModal');return loadEventColumnMapping(data.tab);
    }
    return call('syncEventResponses',ev.id).then(function(r){notify('同步完成，新增 '+r.added+' 人；略過空白或重複 '+r.skipped+' 筆');viewRegs(ev.id,ev.title);return true;});
  });
}
function manualEventCheckin(id) { var ev = window.__regEvent; if (!ev) return; call('checkinRegistration', ev.id, id).then(function(r) { notify(r.already ? r.name + ' 已簽到，未重複登記' : r.name + ' 簽到完成'); viewRegs(ev.id, ev.title); }); }
function openQuickEventCheckin() {
  var input=document.getElementById('quick-checkin'), list=document.getElementById('quick-checkin-candidates'), status=document.getElementById('quick-checkin-status');
  var button=document.getElementById('quick-checkin-confirm');input.value='';input.disabled=false;status.textContent='';button.disabled=true;
  var picker=createCandidatePicker({input:input,list:list,getItems:function(query){query=query.trim().toLowerCase();return query ? (window.__regRows||[]).filter(function(r){return String(r.name||'').toLowerCase().includes(query)||String(r.studentId||'').toLowerCase().includes(query);}):[];},
    label:function(r){return (r.name||'未填姓名')+'（'+(r.studentId||'無學號')+'）'+(r.checkinAt?' 已簽到':' 未簽到');},
    onSelect:function(r){button.disabled=!r||!!r.checkinAt;status.textContent=r?(r.name+' '+(r.studentId||'')+(r.checkinAt?' 已簽到，無需重複。':'：再按 Enter 或按下確認簽到。')):'';},
    onConfirm:commit});
  function commit(row){if(!row||row.checkinAt||input.disabled)return;input.disabled=true;button.disabled=true;
    call('checkinRegistration',window.__regEvent.id,row.id).then(function(result){row.checkinAt=new Date().toISOString();picker.clear();status.textContent=row.name+(result.already?' 已簽到':' 簽到完成');}).finally(function(){input.disabled=false;button.disabled=!picker.selected() || !!picker.selected().checkinAt;input.focus();});}
  button.onclick=function(){commit(picker.selected());};
  var modal=document.getElementById('quickEventCheckinModal');modal.addEventListener('shown.bs.modal',function(){input.focus();},{once:true});showModal('quickEventCheckinModal');
}
function openEventMail(){document.getElementById('reg-mail-count').textContent=(window.__regRows||[]).filter(function(r){return r.email;}).length+' 人有填 Email；密件副本仍計入收件人額度。';showModal('eventMailModal');}
function openEventMapping(){showModal('eventMappingModal');loadEventColumnMapping();}
function loadEventColumnMapping(tab) {
  var eventId = window.__regEvent.id;
  return call('getEventResponseColumns', eventId, tab || '').then(function(data) {
    var box = document.getElementById('event-column-mapping');
    if (!box || window.__regEvent.id !== eventId) return;
    if (!data.tabs.length) { box.innerHTML = '<p class="text-muted small">尚未設定回覆試算表連結，可在編輯活動中填寫。</p>'; return; }
    var labels = {responseNameColumn:'姓名',responseStudentIdColumn:'學號',responseEmailColumn:'Email',responseDeptColumn:'系級'};
    var defaults = {responseNameColumn:'姓名',responseStudentIdColumn:'學號',responseEmailColumn:'電子郵件地址',responseDeptColumn:'系級'};
    var html = '<div class="card"><div class="card-body"><h6>試算表欄位對應</h6><div class="row g-2"><div class="col-12"><label for="event-response-tab" class="form-label">回覆工作表</label><select id="event-response-tab" class="form-select">' + data.tabs.map(function(t) { return '<option'+(t === data.tab ? ' selected' : '')+'>'+esc(t)+'</option>'; }).join('') + '</select></div>';
    Object.keys(labels).forEach(function(key) {
      var selected = data.event[key] == null ? defaults[key] : data.event[key];
      html += '<div class="col-6 col-lg-3"><label for="mapping-'+key+'" class="form-label">'+labels[key]+'</label><select id="mapping-'+key+'" class="form-select"><option value="">'+(key === 'responseNameColumn' ? '請選擇' : '不匯入')+'</option>'+data.headers.filter(Boolean).map(function(h) {return '<option value="'+esc(h)+'"'+(h === selected ? ' selected' : '')+'>'+esc(h)+'</option>';}).join('')+'</select></div>';
    });
    html += '</div><button type="button" class="btn btn-outline-primary mt-3" data-ui-action="saveEventColumnMapping">儲存欄位對應</button><button type="button" class="btn btn-primary mt-3 ms-2" data-ui-action="saveEventColumnMappingAndSync">儲存並同步名單</button><p class="form-text mb-0">儲存後按「同步表單回覆」。姓名必須對應，其他欄位可不匯入。</p></div></div>';
    box.innerHTML = html;
    document.getElementById('event-response-tab').onchange = function() { loadEventColumnMapping(this.value); };
  }).catch(function() { var box=document.getElementById('event-column-mapping'); if(box)box.textContent='無法載入回覆試算表欄位，請確認共用權限及連結。'; });
}
function saveEventColumnMapping(syncAfterSave) {
  var config = { responseSheetTab: document.getElementById('event-response-tab').value };
  ['responseNameColumn','responseStudentIdColumn','responseEmailColumn','responseDeptColumn'].forEach(function(key) { config[key] = document.getElementById('mapping-'+key).value; });
  return call('saveEventResponseColumns', window.__regEvent.id, config).then(function() {
    if(syncAfterSave) return syncEventResponses().then(function(synced){if(synced===true)hideModal('eventMappingModal');});
    notify('欄位對應已儲存');
  });
}
