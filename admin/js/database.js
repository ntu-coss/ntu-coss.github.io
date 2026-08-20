// Admin module: database. Loaded as a classic script for legacy handler compatibility.
// ---------- 社科院資料庫 ----------
var DB_DEPTS = {}, DB_POSTS = {}, DB_COURSES = [];
function loadDb() { loadDbDepts(); loadDbPosts(); }
function loadDbDepts() {
  call('listDbDepts').then(function (rows) {
    DB_DEPTS = {};
    rows.forEach(function (r) { DB_DEPTS[r.id] = r; });
    document.getElementById('db-dept-list').innerHTML = rows.length
      ? '<div class="table-responsive"><table class="table table-sm table-bordered align-middle"><thead><tr><th>系所</th><th>代碼</th><th>Drive 資料夾</th><th>課程顯示</th><th>狀態</th><th>操作</th></tr></thead><tbody>' +
      rows.map(function (r) {
        var folder = r.folderId
          ? '<a href="https://drive.google.com/drive/folders/' + esc(r.folderId) + '" target="_blank" rel="noreferrer">開啟</a>'
          : '<span class="text-warning">未設定</span>';
        var ids = [];
        try { ids = JSON.parse(r.courseAllowlist || '[]'); } catch (e) {}
        var courseMode = r.courseMode === 'allowlist'
          ? '<span class="badge bg-primary">白名單 ' + (Array.isArray(ids) ? ids.length : 0) + ' 門</span>'
          : '<span class="badge bg-light text-dark border">全部顯示</span>';
        var on = String(r.enabled) === 'true'
          ? '<span class="badge bg-success">啟用</span>'
          : '<span class="badge bg-secondary">停用</span>';
        return '<tr><td><div class="fw-semibold">' + esc(r.name) + '</div>' +
          (r.uploadUrl ? '<a class="small" href="' + esc(r.uploadUrl) + '" target="_blank" rel="noreferrer">上傳表單</a>' : '') +
          '</td><td><code>' + esc(r.code) + '</code></td><td>' + folder + '</td><td>' + courseMode + '</td><td>' + on + '</td>' +
          '<td class="text-nowrap"><button class="btn btn-sm btn-outline-primary" data-ui-action="openDbDept" data-id="' + esc(r.id) + '" title="編輯系所" aria-label="編輯系所"><i class="bi bi-pencil"></i></button> ' +
          '<button class="btn btn-sm btn-outline-secondary" data-ui-action="openDbCourses" data-id="' + esc(r.id) + '" title="課程顯示設定" aria-label="課程顯示設定"><i class="bi bi-journal-check"></i></button> ' +
          '<button class="btn btn-sm btn-outline-danger" data-ui-action="delDbDept" data-id="' + esc(r.id) + '" title="刪除系所" aria-label="刪除系所"><i class="bi bi-trash"></i></button></td></tr>';
      }).join('') + '</tbody></table></div>'
      : '<p class="text-muted">尚未設定任何系所，點右上角「新增系所」。</p>';
  });
}
function openDbDept(id) {
  var r = id ? DB_DEPTS[id] : null;
  document.getElementById('db-dept-modal-title').textContent = r ? '編輯系所' : '新增系所';
  document.getElementById('db-dept-id').value = r ? r.id : '';
  document.getElementById('db-dept-name').value = r ? r.name : '';
  document.getElementById('db-dept-code').value = r ? r.code : '';
  document.getElementById('db-dept-order').value = r ? (r.order || 0) : 0;
  document.getElementById('db-dept-folder').value = r ? (r.folderId || '') : '';
  document.getElementById('db-dept-upload').value = r ? (r.uploadUrl || '') : '';
  document.getElementById('db-dept-enabled').checked = r ? String(r.enabled) === 'true' : true;
  showModal('dbDeptModal');
}
function saveDbDept() {
  call('saveDbDept', {
    id: document.getElementById('db-dept-id').value,
    name: document.getElementById('db-dept-name').value,
    code: document.getElementById('db-dept-code').value,
    order: document.getElementById('db-dept-order').value,
    folderId: document.getElementById('db-dept-folder').value,
    uploadUrl: document.getElementById('db-dept-upload').value,
    enabled: document.getElementById('db-dept-enabled').checked,
  }).then(function () {
    notify('已儲存，記得按「立即重建網站」才會生效');
    hideModal('dbDeptModal');
    loadDbDepts();
  });
}
function delDbDept(id) {
  if (confirm('確定刪除此系所？資料庫站下次重建後就會消失。')) {
    call('deleteDbDept', id).then(function () { loadDbDepts(); });
  }
}
function openDbCourses(id) {
  var dept = DB_DEPTS[id];
  if (!dept) { notify('找不到此系所，請重新載入後再試。', false); return; }
  document.getElementById('db-course-dept-id').value = id;
  document.getElementById('db-course-dept').textContent = dept.name || dept.code || '';
  document.getElementById('db-course-list').innerHTML =
    '<div class="text-center text-muted py-4"><span class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>讀取課程中</div>';
  document.getElementById('db-course-missing').innerHTML = '';
  showModal('dbCourseModal');
  call('listDbCourses', id).then(function (result) {
    DB_COURSES = result.courses || [];
    document.getElementById('db-course-mode').value = result.mode === 'allowlist' ? 'allowlist' : 'all';
    document.getElementById('db-course-list').innerHTML = DB_COURSES.length
      ? DB_COURSES.map(function (course) {
        return '<label class="list-group-item d-flex gap-3 align-items-start">' +
          '<input class="form-check-input mt-1 db-course-toggle" type="checkbox" value="' + esc(course.id) + '"' + (course.enabled ? ' checked' : '') + ' />' +
          '<span class="flex-grow-1"><span class="fw-semibold d-block">' + esc(course.name) + '</span>' +
          '<span class="small text-muted">Drive ID：' + esc(course.id) + '</span></span></label>';
      }).join('')
      : '<div class="alert alert-warning mb-0">根資料夾下沒有可用的課程資料夾。</div>';
    document.getElementById('db-course-missing').innerHTML = (result.missingIds || []).length
      ? '<div class="alert alert-warning small py-2">原白名單有 ' + result.missingIds.length + ' 筆資料夾已不在 Drive 根目錄；再次儲存時會自動移除。</div>'
      : '';
    updateDbCourseModeUI();
  }).catch(function () {
    DB_COURSES = [];
    document.getElementById('db-course-list').innerHTML =
      '<div class="alert alert-danger mb-0">無法讀取課程資料夾。請確認 Drive 根資料夾已分享給服務帳戶後再試。</div>';
  });
}
function updateDbCourseModeUI() {
  var allowlist = document.getElementById('db-course-mode').value === 'allowlist';
  document.querySelectorAll('.db-course-toggle').forEach(function (input) { input.disabled = !allowlist; });
}
function toggleDbCourses(enabled) {
  document.getElementById('db-course-mode').value = 'allowlist';
  document.querySelectorAll('.db-course-toggle').forEach(function (input) {
    input.disabled = false;
    input.checked = enabled;
  });
}
function saveDbCoursePolicy() {
  var deptId = document.getElementById('db-course-dept-id').value;
  var mode = document.getElementById('db-course-mode').value;
  var allowed = Array.from(document.querySelectorAll('.db-course-toggle:checked')).map(function (input) { return input.value; });
  if (mode === 'allowlist' && !allowed.length && !confirm('白名單目前是空的，重建後此系將不顯示任何課程。確定儲存？')) return;
  call('saveDbCoursePolicy', deptId, mode, allowed).then(function (result) {
    notify(mode === 'allowlist' ? '已儲存課程白名單，共 ' + result.count + ' 門課程。' : '已改為顯示全部課程。');
    hideModal('dbCourseModal');
    loadDbDepts();
  });
}
function rebuildDb() {
  if (!confirm('要現在重建資料庫網站嗎？約 2～3 分鐘後生效。')) return;
  call('triggerDbRebuild').then(function () { notify('已送出重建，請於數分鐘後查看'); });
}

function loadDbPosts() {
  call('listDbPosts').then(function (rows) {
    DB_POSTS = {};
    rows.forEach(function (r) { DB_POSTS[r.id] = r; });
    document.getElementById('db-post-list').innerHTML = rows.map(function (r) {
      var badges = (String(r.pinned) === 'true' ? '<span class="badge bg-danger me-1">置頂</span>' : '') +
        (String(r.published) === 'true' ? '' : '<span class="badge bg-secondary me-1">未發布</span>') + schedLabel(r);
      return '<div class="card mb-2 shadow-sm border-0"><div class="card-body py-2">' +
        '<b>' + badges + esc(r.title) + '</b>' +
        '<div class="small text-muted text-truncate">' + esc((r.content || '').slice(0, 120)) + '</div>' +
        '<div class="mt-2"><button class="btn btn-sm btn-outline-primary" data-ui-action="openDbPost" data-id="' + esc(r.id) + '"><i class="bi bi-pencil me-1"></i>編輯</button> ' +
        '<button class="btn btn-sm btn-outline-danger" data-ui-action="delDbPost" data-id="' + esc(r.id) + '"><i class="bi bi-trash me-1"></i>刪除</button></div></div></div>';
    }).join('') || '<p class="text-muted">尚無公告。</p>';
  });
}
function openDbPost(id) {
  var r = id ? DB_POSTS[id] : null;
  document.getElementById('db-post-modal-title').textContent = r ? '編輯公告' : '新增公告';
  document.getElementById('db-post-id').value = r ? r.id : '';
  document.getElementById('db-post-createdAt').value = r ? (r.createdAt || '') : '';
  document.getElementById('db-post-title').value = r ? r.title : '';
  document.getElementById('db-post-content').value = r ? (r.content || '') : '';
  document.getElementById('db-post-from').value = r ? (r.publishFrom || '') : new Date().toLocaleDateString('en-CA');
  document.getElementById('db-post-until').value = r ? (r.publishUntil || '') : '';
  document.getElementById('db-post-published').checked = r ? String(r.published) === 'true' : true;
  document.getElementById('db-post-pinned').checked = r ? String(r.pinned) === 'true' : false;
  showModal('dbPostModal');
}
function saveDbPost() {
  call('saveDbPost', {
    id: document.getElementById('db-post-id').value,
    createdAt: document.getElementById('db-post-createdAt').value,
    title: document.getElementById('db-post-title').value,
    content: document.getElementById('db-post-content').value,
    publishFrom: document.getElementById('db-post-from').value,
    publishUntil: document.getElementById('db-post-until').value,
    published: document.getElementById('db-post-published').checked,
    pinned: document.getElementById('db-post-pinned').checked,
  }).then(function () { notify('已儲存'); hideModal('dbPostModal'); loadDbPosts(); });
}
function delDbPost(id) { if (confirm('確定刪除？')) call('deleteDbPost', id).then(function () { loadDbPosts(); }); }
