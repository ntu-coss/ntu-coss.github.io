// Admin module: facilities. Loaded as a classic script for legacy handler compatibility.
// ---------- 場地 ----------
function vname(v) { return v === '3F' ? '3F 學開' : '207 微學開'; }
function loadVenuePending() {
  call('listVenueBookings', { status: 'pending' }).then(function (rows) {
    document.getElementById('venue-pending').innerHTML = rows.length ? '<table class="table table-sm table-bordered align-middle"><thead><tr><th>場地</th><th>單位/聯絡人</th><th>事由</th><th>企劃書</th><th>系級/學號</th><th>時間</th><th>操作</th></tr></thead><tbody>' +
      rows.map(function (r) {
        var prop = r.proposalUrl ? '<a href="' + esc(r.proposalUrl) + '" target="_blank" rel="noreferrer">檢視</a>' : '<span class="text-muted">—</span>';
        return '<tr><td>' + vname(r.venue) + '</td><td>' + esc(r.org) + '<br>' + esc(r.contactName) + '</td><td>' + esc(r.purpose) + '</td><td>' + prop + '</td><td>' + esc(r.dept) + '<br>' + esc(r.studentId) + '</td><td>' + fmt(r.startISO) + '<br>~ ' + fmt(r.endISO) + '</td>' +
          '<td><button class="btn btn-sm btn-success" data-ui-action="approveB" data-id="' + esc(r.id) + '">核准</button> ' +
          '<button class="btn btn-sm btn-danger" data-ui-action="rejectB" data-id="' + esc(r.id) + '">拒絕</button></td></tr>';
      }).join('') + '</tbody></table>' : '<p class="text-muted">沒有待審核申請。</p>';
  });
}
function approveB(id) { call('approveBooking', id).then(function () { notify('已核准並寄信'); loadVenuePending(); loadVenueAll(); }); }
function rejectB(id) { var reason = prompt('拒絕原因（選填）：') || ''; call('rejectBooking', id, reason).then(function () { notify('已拒絕'); loadVenuePending(); loadVenueAll(); }); }
function loadVenueAll() {
  var f = document.getElementById('venue-filter').value;
  call('listVenueBookings', f ? { status: f } : {}).then(function (rows) {
    VENUE_ROWS = {}; rows.forEach(function (r) { VENUE_ROWS[r.id] = r; });
    document.getElementById('venue-all').innerHTML = rows.length ? '<table class="table table-sm table-striped align-middle"><thead><tr><th>場地</th><th>聯絡人</th><th>學號／帳號</th><th>時間</th><th>狀態</th><th></th></tr></thead><tbody>' +
      rows.map(function (r) {
        return '<tr><td>' + vname(r.venue) + '</td><td>' + esc(r.contactName) + '</td><td>' + esc(r.studentId) + '</td><td>' + fmt(r.startISO) + ' ~ ' + fmt(r.endISO) + '</td>' +
          '<td><span class="badge bg-' + (r.status === 'approved' ? 'success' : r.status === 'pending' ? 'warning text-dark' : 'secondary') + '">' + r.status + '</span></td>' +
          '<td class="text-nowrap"><button class="btn btn-sm btn-outline-primary me-1" data-ui-action="editBooking" data-id="' + esc(r.id) + '">編輯</button>' +
          '<button class="btn btn-sm btn-outline-danger" data-ui-action="delB" data-id="' + esc(r.id) + '">刪除</button></td></tr>';
      }).join('') + '</tbody></table>' : '<p class="text-muted">無紀錄。</p>';
  });
}
function delB(id) { if (confirm('刪除此預約？（不會刪除行事曆事件）')) call('deleteVenueBooking', id).then(function () { loadVenueAll(); }); }

// ----- 編輯預約（含申請者資料 / 學號帳號 → 決定寄信地址）-----
var VENUE_ROWS = {};
function toLocalInput(iso) { var d = new Date(iso); if (isNaN(d)) return ''; var p = function (n) { return String(n).padStart(2, '0'); }; return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()) + 'T' + p(d.getHours()) + ':' + p(d.getMinutes()); }
function editBooking(id) {
  var r = VENUE_ROWS[id]; if (!r) return;
  document.getElementById('eb-id').value = id;
  document.getElementById('eb-contactName').value = r.contactName || '';
  document.getElementById('eb-dept').value = r.dept || '';
  document.getElementById('eb-studentId').value = r.studentId || '';
  document.getElementById('eb-org').value = r.org || '';
  document.getElementById('eb-purpose').value = r.purpose || '';
  document.getElementById('eb-start').value = toLocalInput(r.startISO);
  document.getElementById('eb-end').value = toLocalInput(r.endISO);
  document.getElementById('eb-3f').style.display = (r.venue === '3F') ? '' : 'none';
  document.getElementById('eb-overlay').style.display = 'flex';
}
function closeEditBooking() { document.getElementById('eb-overlay').style.display = 'none'; }
function saveBookingEdit() {
  var id = document.getElementById('eb-id').value;
  var acct = String(document.getElementById('eb-studentId').value || '').trim();
  if (!acct || ['無', 'none', 'n/a', 'na', '-'].indexOf(acct.toLowerCase()) !== -1) { alert('學號／帳號不可為空或「無」（寄信地址由此決定）。'); return; }
  var s = document.getElementById('eb-start').value, e = document.getElementById('eb-end').value;
  var obj = {
    contactName: document.getElementById('eb-contactName').value.trim(),
    dept: document.getElementById('eb-dept').value.trim(),
    studentId: acct.replace(/@ntu\.edu\.tw$/i, ''),
    org: document.getElementById('eb-org').value.trim(),
    purpose: document.getElementById('eb-purpose').value.trim(),
  };
  if (s) obj.startISO = new Date(s).toISOString();
  if (e) obj.endISO = new Date(e).toISOString();
  call('updateVenueBooking', id, obj).then(function () { notify('已更新'); closeEditBooking(); loadVenuePending(); loadVenueAll(); });
}

function loadClosed() {
  call('listClosed').then(function (rows) {
    document.getElementById('closed-list').innerHTML = rows.length ? '<table class="table table-sm"><tbody>' + rows.map(function (r) {
      return '<tr><td>' + vname(r.venue) + '</td><td>' + fmt(r.startISO) + ' ~ ' + fmt(r.endISO) + '</td><td>' + esc(r.reason) + '</td>' +
        '<td><button class="btn btn-sm btn-outline-danger" data-ui-action="delClosed" data-id="' + esc(r.id) + '">刪除</button></td></tr>';
    }).join('') + '</tbody></table>' : '<p class="text-muted">無封鎖時段。</p>';
  });
}
function addClosed() {
  var s = document.getElementById('cl-start').value, e = document.getElementById('cl-end').value;
  if (!s || !e) { notify('請填寫起訖時間', false); return; }
  call('addClosed', { venue: document.getElementById('cl-venue').value, startISO: new Date(s).toISOString(), endISO: new Date(e).toISOString(), reason: document.getElementById('cl-reason').value })
    .then(function () { notify('已新增'); loadClosed(); });
}
function delClosed(id) { call('deleteClosed', id).then(function () { loadClosed(); }); }

function allOpen(open) { call('setAllLockersOpen', open).then(function () { notify(open ? '已全部開放借用' : '已全部關閉'); loadLocker(); }); }
function searchLocker() {
  var sid = document.getElementById('lk-search').value;
  if (!sid) return;
  call('findLockerByStudent', sid).then(function (rows) {
    document.getElementById('lk-search-result').innerHTML = rows.length
      ? '<div class="alert alert-info py-2 mb-0">' + rows.map(function (r) {
          return '櫃位 <b>' + r.number + '</b>：' + esc(r.borrowerName) + '（' + esc(r.dept) + '）' +
            (r.completed === 'true'
              ? ' <span class="badge bg-success"><i class="bi bi-check-circle me-1" aria-hidden="true"></i>已完成借用</span>'
              : ' <span class="badge bg-warning text-dark"><i class="bi bi-hourglass-split me-1" aria-hidden="true"></i>未完成</span>');
        }).join('<br>') + '</div>'
      : '<div class="alert alert-warning py-2 mb-0">查無此學號借用中的櫃位。</div>';
  });
}

// ---------- 院櫃 ----------
function lockerCellHtml(num, map) {
  var l = map[num] || {};
  var cls = 'closed', label = '未開放';
  if (l.open === 'true') {
    if (l.status === 'borrowed') {
      if (l.completed === 'true') { cls = 'inuse'; label = '借用中'; }
      else { cls = 'pending'; label = '待繳費'; }
    } else { cls = 'avail'; label = '無人借用'; }
  }
  var sid = l.status === 'borrowed' ? esc(l.studentId) : '';
  return '<span class="grid-cell ' + cls + '" title="' + esc('櫃位 ' + num + (sid ? ' / ' + sid : '')) + '" data-ui-action="lockerDetail" data-number="' + num + '">' +
    '<b>' + num + '</b><small>' + label + '</small>' +
    (sid ? '<small class="sid">' + sid + '</small>' : '') + '</span>';
}
function loadLocker() {
  call('getLockerAdmin').then(function (d) {
    var map = {}; d.lockers.forEach(function (l) { map[Number(l.number)] = l; });
    window.__lockers = map;
    if (document.getElementById('lk-roster')) document.getElementById('lk-roster').checked = !!d.useRoster;
    window.__zones = d.zones || [];
    renderZoneEditor();
    var html = '';
    (d.zones || []).forEach(function (z) {
      var fromCol = Math.ceil(z.from / d.rows), toCol = Math.ceil(z.to / d.rows);
      html += '<div class="mb-3"><div class="fw-bold mb-1">' + esc(z.name) +
        ' <span class="badge bg-' + (z.open === false ? 'secondary' : 'success') + '">' +
        (z.open === false ? '未開放（前台隱藏）' : '開放中') + '</span>' +
        ' <small class="text-muted">#' + z.from + '~' + z.to + '</small></div>' +
        '<div class="grid-scroll"><div class="grid-inner">';
      for (var r = 1; r <= d.rows; r++) {            // 5 列，由上往下
        html += '<div class="grid-line">';
        for (var c = toCol; c >= fromCol; c--) {     // 由右往左
          var num = (c - 1) * d.rows + r;
          if (num < z.from || num > z.to) { html += '<span class="grid-cell empty"></span>'; continue; }
          html += lockerCellHtml(num, map);
        }
        html += '</div>';
      }
      html += '</div></div></div>';
    });
    document.getElementById('locker-grid').innerHTML = html || '<div class="text-muted">尚未設定任何區域。</div>';
  });
}
function renderZoneEditor() {
  var zs = window.__zones || [];
  document.getElementById('zone-editor').innerHTML = zs.map(function (z, i) {
    return '<div class="row g-2 align-items-center mb-2 zone-row">' +
      '<div class="col-12 col-md-4"><div class="input-group input-group-sm"><span class="input-group-text">區域</span><input class="form-control z-name" placeholder="區域名稱" value="' + esc(z.name || '') + '"></div></div>' +
      '<div class="col-4 col-md-2"><div class="input-group input-group-sm"><span class="input-group-text">起</span><input type="number" class="form-control z-from" value="' + z.from + '"></div></div>' +
      '<div class="col-4 col-md-2"><div class="input-group input-group-sm"><span class="input-group-text">迄</span><input type="number" class="form-control z-to" value="' + z.to + '"></div></div>' +
      '<div class="col-3 col-md-2"><div class="form-check"><input class="form-check-input z-open" type="checkbox" ' + (z.open === false ? '' : 'checked') + ' id="zopen' + i + '"><label class="form-check-label small" for="zopen' + i + '">開放借用</label></div></div>' +
      '<div class="col-auto"><button class="btn btn-sm btn-outline-danger" data-ui-action="removeZone" data-index="' + i + '">刪除</button></div>' +
      '</div>';
  }).join('') || '<div class="text-muted small mb-2">尚無區域，請新增。</div>';
}
function addZone() { (window.__zones = window.__zones || []).push({ name: '', from: 1, to: 5, open: true }); renderZoneEditor(); }
function removeZone(i) { window.__zones.splice(i, 1); renderZoneEditor(); }
function saveZones() {
  var zones = [];
  document.querySelectorAll('#zone-editor .zone-row').forEach(function (row) {
    zones.push({
      name: row.querySelector('.z-name').value,
      from: Number(row.querySelector('.z-from').value),
      to: Number(row.querySelector('.z-to').value),
      open: row.querySelector('.z-open').checked,
    });
  });
  call('saveLockerZones', zones).then(function () { notify('已儲存區域設定'); loadLocker(); });
}
function lockerModalHide() { var m = bootstrap.Modal.getInstance(document.getElementById('lockerModal')); if (m) m.hide(); }
function lockerDetail(num) {
  var l = window.__lockers[num] || { number: num };
  var borrowed = l.status === 'borrowed';
  var h = '<p class="mb-1">開放借用：<b>' + (l.open === 'true' ? '是' : '否') + '</b>　狀態：<b>' + (l.status || 'available') + '</b>' +
    (borrowed ? '<br>借用人：' + esc(l.borrowerName) + '（' + esc(l.dept) + ' / ' + esc(l.studentId) + '）' +
      '<br>完成借用(鑰匙+押金)：' + (l.completed === 'true' ? '是 ' + fmt(l.completedAt) : '否') +
      (l.receiptNo ? '<br>收據編號：<b class="fs-5">' + esc(l.receiptNo) + '</b>' : '') : '') + '</p>' +
    '<div class="d-flex flex-wrap gap-2 mb-2">' +
    '<button class="btn btn-sm btn-outline-secondary" data-ui-action="toggleOpen" data-number="' + num + '" data-open="' + (l.open === 'true' ? 'false' : 'true') + '">' + (l.open === 'true' ? '關閉借用' : '開放借用') + '</button>' +
    (borrowed && l.completed !== 'true' ? '<button class="btn btn-sm btn-warning" data-ui-action="completeLk" data-number="' + num + '">完成借用（領鑰匙+押金，派發收據）</button>' : '') +
    (borrowed ? '<button class="btn btn-sm btn-success" data-ui-action="returnLk" data-number="' + num + '">歸還（退押金+收鑰匙）</button>' : '') +
    (borrowed ? '<button class="btn btn-sm btn-outline-danger" data-ui-action="clearLk" data-number="' + num + '">清除借用</button>' : '') + '</div>' +
    '<hr><div class="row g-2"><div class="col"><div class="input-group input-group-sm"><span class="input-group-text">借用人</span><input id="ed-name" class="form-control" value="' + esc(l.borrowerName) + '"></div></div>' +
    '<div class="col"><div class="input-group input-group-sm"><span class="input-group-text">系級</span><input id="ed-dept" class="form-control" value="' + esc(l.dept) + '"></div></div>' +
    '<div class="col"><div class="input-group input-group-sm"><span class="input-group-text">學號</span><input id="ed-sid" class="form-control" value="' + esc(l.studentId) + '"></div></div>' +
    '<div class="col-auto"><button class="btn btn-sm btn-primary" data-ui-action="manualBorrow" data-number="' + num + '">手動設定為借出</button></div></div>' +
    '<small class="text-muted">手動設定可不受「一人一櫃」限制。</small>' +
    (borrowed ? '<hr><div class="input-group input-group-sm" style="max-width:340px"><span class="input-group-text">收據編號</span><input id="ed-receipt" class="form-control" value="' + esc(l.receiptNo || '') + '" placeholder="例：001"><button class="btn btn-primary" data-ui-action="saveReceipt" data-number="' + num + '">儲存收據編號</button></div>' : '');
  document.getElementById('locker-modal-title').textContent = '櫃位 ' + num;
  document.getElementById('locker-detail').innerHTML = h;
  bootstrap.Modal.getOrCreateInstance(document.getElementById('lockerModal')).show();
}
function toggleOpen(num, open) { call('toggleLockerOpen', num, open).then(function () { loadLocker(); lockerDetail(num); }); }
function completeLk(num) { call('completeLocker', num).then(function (rno) { notify('已完成借用，收據編號 ' + rno); loadLocker(); lockerDetail(num); }); }
function returnLk(num) { if (confirm('確認歸還並退押金？')) call('returnLocker', num).then(function () { notify('已歸還'); loadLocker(); lockerModalHide(); }); }
function clearLk(num) { if (confirm('清除此櫃位借用資料？')) call('clearLocker', num).then(function () { loadLocker(); lockerModalHide(); }); }
function manualBorrow(num) {
  call('editLocker', num, { status: 'borrowed', borrowerName: document.getElementById('ed-name').value, dept: document.getElementById('ed-dept').value, studentId: document.getElementById('ed-sid').value, open: 'true' })
    .then(function () { notify('已更新'); loadLocker(); lockerDetail(num); });
}
function saveReceipt(num) {
  call('editLocker', num, { receiptNo: document.getElementById('ed-receipt').value.trim() })
    .then(function () { notify('已更新收據編號'); loadLocker(); lockerDetail(num); });
}
function openLockerMail() {
  var map = window.__lockers || {};
  var borrowed = Object.keys(map).map(function (k) { return map[k]; })
    .filter(function (l) { return l.status === 'borrowed' && l.studentId; })
    .sort(function (a, b) { return Number(a.number) - Number(b.number); });
  if (!borrowed.length) { notify('目前沒有借用中且有學號的櫃位', false); return; }
  document.getElementById('lkmail-list').innerHTML = borrowed.map(function (l) {
    var paid = l.completed === 'true';
    var badge = paid ? '<span class="badge bg-success">已繳費</span>' : '<span class="badge bg-warning text-dark">待繳費</span>';
    return '<label class="list-group-item d-flex align-items-center gap-2">' +
      '<input class="form-check-input mt-0 lk-mail-chk" type="checkbox" value="' + l.number + '" data-paid="' + paid + '" checked>' +
      '<span>櫃位 <b>' + l.number + '</b> ' + badge + '　' + esc(l.borrowerName) + '（' + esc(l.dept) + ' / ' + esc(l.studentId) + '）' +
      '<span class="text-muted small"> → ' + esc(String(l.studentId).toLowerCase()) + '@ntu.edu.tw</span></span></label>';
  }).join('');
  document.getElementById('lkmail-subj').value = '';
  document.getElementById('lkmail-body').value = '';
  bootstrap.Modal.getOrCreateInstance(document.getElementById('lockerMailModal')).show();
}
function lkMailToggleAll(mode) {
  document.querySelectorAll('.lk-mail-chk').forEach(function (c) {
    var paid = c.getAttribute('data-paid') === 'true';
    c.checked = mode === 'all' ? true : mode === 'none' ? false : mode === 'paid' ? paid : !paid;
  });
}
function sendLockerMail() {
  var nums = Array.prototype.map.call(document.querySelectorAll('.lk-mail-chk:checked'), function (c) { return Number(c.value); });
  if (!nums.length) { notify('請至少選擇一個櫃位', false); return; }
  var subj = document.getElementById('lkmail-subj').value, body = document.getElementById('lkmail-body').value;
  if (!subj.trim() || !body.trim()) { notify('請填寫主旨與內文', false); return; }
  if (!confirm('確定寄送給選取的 ' + nums.length + ' 位借用者？\n（收件地址為學號@ntu.edu.tw）')) return;
  call('emailLockers', nums, subj, body).then(function (res) {
    notify('已寄送給 ' + (res && res.sent) + ' 人');
    var m = bootstrap.Modal.getInstance(document.getElementById('lockerMailModal')); if (m) m.hide();
  });
}

// ---------- 設備借用 ----------
function eqStatusBadge(s) {
  var m = { pending: ['warning text-dark', '待審核'], approved: ['info text-dark', '已核准待領用'],
    borrowed: ['primary', '借用中'], returned: ['success', '已歸還'], rejected: ['secondary', '已拒絕'] };
  var x = m[s] || ['secondary', s];
  return '<span class="badge bg-' + x[0] + '">' + x[1] + '</span>';
}
function loadEquipment() {
  loadEquipCatalog();
  loadEquipBookings();
}
// 設備清單（目錄）
function loadEquipCatalog() {
  call('listEquipment').then(function (rows) {
    cacheEditRecords('equipment', rows, 'id');
    document.getElementById('equip-list').innerHTML = rows.length ? '<table class="table table-sm table-bordered align-middle" style="max-width:720px"><thead><tr><th>排序</th><th>設備名稱</th><th>備註</th><th>開放</th><th>操作</th></tr></thead><tbody>' +
      rows.map(function (r) {
        var open = String(r.open) === 'true';
        return '<tr><td>' + esc(r.order) + '</td><td>' + esc(r.name) + '</td><td>' + esc(r.note || '') + '</td>' +
          '<td><div class="form-check form-switch m-0"><input class="form-check-input" type="checkbox" ' + (open ? 'checked' : '') + ' data-ui-change="toggleEquip" data-id="' + esc(r.id) + '"></div></td>' +
          '<td>' + editRecordButton('equipment', r.id, false) + ' ' +
          '<button class="btn btn-sm btn-outline-danger" data-ui-action="delEquip" data-id="' + esc(r.id) + '">刪除</button></td></tr>';
      }).join('') + '</tbody></table>' : '<p class="text-muted">尚無設備，請使用「新增設備」。</p>';
  });
}
function openEquipModal() {
  resetEquip();
  showModal('equipmentModal');
}
function saveEquip() {
  var name = document.getElementById('eq-name').value.trim();
  if (!name) { notify('請輸入設備名稱', false); return; }
  var obj = {
    id: document.getElementById('eq-id').value || '',
    name: name, note: document.getElementById('eq-note').value.trim(),
    order: document.getElementById('eq-order').value || '0',
    open: document.getElementById('eq-open').checked,
  };
  call('saveEquipment', obj).then(function () { hideModal('equipmentModal'); notify('已儲存設備'); resetEquip(); loadEquipCatalog(); });
}
function editEquip(r) {
  resetEquip();
  document.getElementById('equipment-modal-title').innerHTML = '<i class="bi bi-projector me-2"></i>編輯設備';
  document.getElementById('eq-id').value = r.id || '';
  document.getElementById('eq-name').value = r.name || '';
  document.getElementById('eq-note').value = r.note || '';
  document.getElementById('eq-order').value = r.order || '0';
  document.getElementById('eq-open').checked = String(r.open) === 'true';
  showModal('equipmentModal');
}
function resetEquip() {
  document.getElementById('equipment-modal-title').innerHTML = '<i class="bi bi-projector me-2"></i>新增設備';
  document.getElementById('eq-id').value = '';
  document.getElementById('eq-name').value = '';
  document.getElementById('eq-note').value = '';
  document.getElementById('eq-order').value = '0';
  document.getElementById('eq-open').checked = true;
}
function toggleEquip(id, open) { call('setEquipmentOpen', id, open).then(function () { notify(open ? '已開放借用' : '已關閉借用'); }); }
function delEquip(id) { if (confirm('刪除此設備？（不影響既有借用紀錄）')) call('deleteEquipment', id).then(function () { loadEquipCatalog(); }); }
// 借用紀錄
function loadEquipBookings() {
  call('listEquipmentBookings').then(function (rows) {
    var pend = rows.filter(function (r) { return r.status === 'pending'; });
    document.getElementById('eqb-pending').innerHTML = pend.length ? '<table class="table table-sm table-bordered align-middle"><thead><tr><th>設備</th><th>單位/姓名</th><th>系級/學號</th><th>事由</th><th>期間</th><th>操作</th></tr></thead><tbody>' +
      pend.map(function (r) {
        return '<tr><td>' + esc(r.equipmentName) + '</td><td>' + esc(r.unit || '-') + '<br>' + esc(r.borrowerName) + '</td><td>' + esc(r.dept) + '<br>' + esc(r.studentId) + '</td><td>' + esc(r.purpose) + '</td><td>' + esc(r.fromDate) + ' ~ ' + esc(r.toDate) + '</td>' +
          '<td><button class="btn btn-sm btn-success" data-ui-action="approveEqb" data-id="' + esc(r.id) + '">核准</button> ' +
          '<button class="btn btn-sm btn-danger" data-ui-action="rejectEqb" data-id="' + esc(r.id) + '">拒絕</button></td></tr>';
      }).join('') + '</tbody></table>' : '<p class="text-muted">沒有待審核申請。</p>';
    document.getElementById('eqb-list').innerHTML = rows.length ? '<table class="table table-sm table-striped align-middle"><thead><tr><th>設備</th><th>姓名</th><th>學號</th><th>狀態</th><th>操作</th></tr></thead><tbody>' +
      rows.map(function (r) {
        var actions = '';
        if (r.status === 'approved') actions += '<button class="btn btn-sm btn-warning" data-ui-action="pickupEqb" data-id="' + esc(r.id) + '">領用</button> ';
        if (r.status === 'borrowed') actions += '<button class="btn btn-sm btn-success" data-ui-action="returnEqb" data-id="' + esc(r.id) + '">歸還</button> ';
        actions += '<button class="btn btn-sm btn-outline-danger" data-ui-action="delEqb" data-id="' + esc(r.id) + '">刪除</button>';
        return '<tr><td>' + esc(r.equipmentName) + '</td><td>' + esc(r.borrowerName) + '</td><td>' + esc(r.studentId) + '</td><td>' + eqStatusBadge(r.status) + '</td><td>' + actions + '</td></tr>';
      }).join('') + '</tbody></table>' : '<p class="text-muted">無紀錄。</p>';
  });
}
function approveEqb(id) { call('approveEquipment', id).then(function () { notify('已核准並寄信'); loadEquipBookings(); }); }
function rejectEqb(id) { var reason = prompt('拒絕原因（選填）：') || ''; call('rejectEquipment', id, reason).then(function () { notify('已拒絕'); loadEquipBookings(); }); }
function pickupEqb(id) { call('pickupEquipment', id).then(function () { notify('已標記領用'); loadEquipBookings(); }); }
function returnEqb(id) { if (confirm('確認歸還？')) call('returnEquipment', id).then(function () { notify('已歸還'); loadEquipBookings(); }); }
function delEqb(id) { if (confirm('刪除此紀錄？')) call('deleteEquipment_booking', id).then(function () { loadEquipBookings(); }); }
