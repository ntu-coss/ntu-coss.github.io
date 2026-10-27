// Admin module: database. Loaded as a classic script for legacy handler compatibility.
// ---------- 社科院資料庫 ----------
var DB_DEPTS = {}, DB_POSTS = {}, DB_COURSES = [], DB_COURSEMAP = [];
function isGlobalDbManager() { return !MEPROF || !MEPROF.dbDepts || MEPROF.dbDepts === 'all' || MEPROF.owner; }
function loadDb() {
  var global = isGlobalDbManager();
  document.getElementById('db-global-actions').classList.toggle('d-none', !global);
  document.getElementById('db-global-posts').classList.toggle('d-none', !global);
  document.getElementById('db-scope-notice').classList.toggle('d-none', global);
  loadDbDepts();
  document.getElementById('db-native-settings').classList.toggle('d-none', !global);
  if (global) { loadDbPosts(); loadDbAutomationStatus(); loadNativeUploadSettings(); }
  else document.getElementById('db-automation-status').innerHTML = '';
}
function loadNativeUploadSettings() {
  call('getNativeUploadSettings').then(function (s) {
    document.getElementById('db-native-enabled').checked = s.enabled;
    document.getElementById('db-native-email-mode').value = s.emailMode || (s.requireNtuEmail ? 'verified' : 'required');
    document.getElementById('db-native-consent-zh').value = s.consentZh || '';
    document.getElementById('db-native-consent-en').value = s.consentEn || '';
    document.getElementById('db-native-status').textContent = '私有待審儲存：' + (s.storageReady ? '已設定' : '尚未設定') +
      '；驗證信：' + (s.mailReady ? '已設定' : '尚未設定') + '。PDF 上限 10 MB，待審檔案保存 30 天。';
  });
}
function saveNativeUploadSettings() {
  call('saveNativeUploadSettings', { enabled: document.getElementById('db-native-enabled').checked,
    emailMode: document.getElementById('db-native-email-mode').value,
    consentZh: document.getElementById('db-native-consent-zh').value,
    consentEn: document.getElementById('db-native-consent-en').value }).then(function () { notify('已儲存上傳設定'); loadNativeUploadSettings(); });
}
function loadDbAutomationStatus() {
  var box = document.getElementById('db-automation-status');
  box.innerHTML = '<div class="text-muted small"><span class="spinner-border spinner-border-sm me-1"></span>檢查 Drive 自動化連線…</div>';
  call('getDbAutomationStatus').then(function (status) {
    var item = function (provider) {
      var value = status && status[provider];
      if (!value) return '';
      return '<span class="badge me-1 bg-' + (value.configured ? 'success' : 'warning text-dark') + '">' +
        esc(value.label) + '：' + (value.configured ? '已連線' : '尚未設定') + '</span>';
    };
    box.innerHTML = '<div class="small">' + item('coss') + item('econ') + '</div>';
  }).catch(function () { box.innerHTML = '<div class="small text-warning">目前無法取得 Drive 自動化狀態。</div>'; });
}
function loadDbDepts() {
  call('listDbDepts').then(function (rows) {
    DB_DEPTS = {};
    rows.forEach(function (r) { DB_DEPTS[r.id] = r; });
    document.getElementById('db-dept-list').innerHTML = rows.length
      ? '<div class="table-responsive"><table class="table table-sm table-bordered align-middle"><thead><tr><th>系所</th><th>代碼</th><th>Drive／持有帳號</th><th>課程白名單</th><th>狀態</th><th>操作</th></tr></thead><tbody>' +
      rows.map(function (r) {
        var folder = r.folderId
          ? '<a href="https://drive.google.com/drive/folders/' + esc(r.folderId) + '" target="_blank" rel="noreferrer">開啟</a>'
          : '<span class="text-warning">未設定</span>';
        var ids = [];
        try { ids = JSON.parse(r.courseAllowlist || '[]'); } catch (e) {}
        var uploadIds = [];
        try { uploadIds = JSON.parse(r.uploadCourseAllowlist || '[]'); } catch (e) {}
        var courseMode = r.courseMode === 'allowlist'
          ? '<span class="badge bg-primary">瀏覽 ' + (Array.isArray(ids) ? ids.length : 0) + ' 門</span>'
          : '<span class="badge bg-light text-dark border">瀏覽：全部</span>';
        courseMode += '<br><span class="badge bg-success mt-1">上傳 ' + (Array.isArray(uploadIds) ? uploadIds.length : 0) + ' 門</span>';
        var on = String(r.enabled) === 'true'
          ? '<span class="badge bg-success">啟用</span>'
          : '<span class="badge bg-secondary">停用</span>';
        var actions = (isGlobalDbManager()
          ? '<button class="btn btn-sm btn-outline-primary" data-ui-action="openDbDept" data-id="' + esc(r.id) + '" title="編輯系所" aria-label="編輯系所"><i class="bi bi-pencil"></i></button> ' : '') +
          '<button class="btn btn-sm btn-outline-secondary" data-ui-action="openDbCourses" data-id="' + esc(r.id) + '"><i class="bi bi-journal-check me-1"></i>課程白名單</button> ' +
          (isGlobalDbManager() ? '<button class="btn btn-sm btn-outline-danger" data-ui-action="delDbDept" data-id="' + esc(r.id) + '" title="刪除系所" aria-label="刪除系所"><i class="bi bi-trash"></i></button>' : '');
        return '<tr><td><div class="fw-semibold">' + esc(r.name) + '</div>' +
          (r.uploadUrl ? '<a class="small" href="' + esc(r.uploadUrl) + '" target="_blank" rel="noreferrer">上傳表單</a>' : '') +
          '</td><td><code>' + esc(r.code) + '</code></td><td>' + folder + '<div class="small text-muted mt-1">' +
          (r.storageProvider === 'econ' || (!r.storageProvider && r.code === 'econ') ? '經濟系既有帳號持有' : '院學會新帳號持有') + '</div></td><td>' + courseMode + '</td><td>' + on + '</td>' +
          '<td class="text-nowrap">' + actions + '</td></tr>';
      }).join('') + '</tbody></table></div>'
      : '<p class="text-muted">尚未設定任何系所，點右上角「新增系所」。</p>';
  });
}
function initializeDbDepts() {
  call('initializeDbDepts').then(function (result) {
    var count = Number(result && result.count) || 0;
    notify(count ? '已補上 ' + count + ' 個缺少的系所設定。' : '四系設定已齊全，沒有新增資料。');
    loadDbDepts();
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
  document.getElementById('db-dept-intake').value = r ? (r.intakeFolderId || '') : '';
  document.getElementById('db-dept-reviewers').value = r ? (r.reviewerEmails || '') : '';
  document.getElementById('db-dept-storage').value = r ? (r.storageProvider || (r.code === 'econ' ? 'econ' : 'coss')) : 'coss';
  document.getElementById('db-dept-coursemap').value = r ? (r.courseMapCodes || '') : '';
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
    intakeFolderId: document.getElementById('db-dept-intake').value,
    reviewerEmails: document.getElementById('db-dept-reviewers').value,
    storageProvider: document.getElementById('db-dept-storage').value,
    courseMapCodes: document.getElementById('db-dept-coursemap').value,
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
  document.getElementById('db-course-map-result').innerHTML = '';
  document.getElementById('db-course-map-controls').classList.add('d-none');
  DB_COURSEMAP = [];
  showModal('dbCourseModal');
  call('listDbCourses', id).then(function (result) {
    DB_COURSES = result.courses || [];
    document.getElementById('db-course-mode').value = result.mode === 'allowlist' ? 'allowlist' : 'all';
    document.getElementById('db-course-list').innerHTML = DB_COURSES.length
      ? DB_COURSES.map(function (course) {
        return '<div class="list-group-item d-flex gap-3 align-items-start">' +
          '<span class="d-flex flex-column gap-1">' +
          '<label class="small text-primary"><input class="form-check-input me-1 db-course-toggle" type="checkbox" value="' + esc(course.id) + '"' + (course.enabled ? ' checked' : '') + ' />瀏覽</label>' +
          '<label class="small text-success"><input class="form-check-input me-1 db-course-upload-toggle" type="checkbox" value="' + esc(course.id) + '"' + (course.uploadEnabled ? ' checked' : '') + ' />上傳</label></span>' +
          '<span class="flex-grow-1"><span class="fw-semibold d-block">' + esc(displayDbCourseName(course.name)) + '</span>' +
          '<span class="small text-muted">Drive ID：' + esc(course.id) + '</span></span></div>';
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
function displayDbCourseName(name) {
  var original = String(name || '');
  var cleaned = original.replace(/^\s*(?:\[[^\]]+\]|\d{1,3}(?:(?:[-_.])\d{1,3})*)[-_.\s]*/, '');
  return cleaned || original;
}
function normalizeDbCourseName(name) {
  return displayDbCourseName(name).replace(/[\s（）()_・·-]/g, '').toLowerCase();
}
function loadDbCourseMap() {
  var deptId = document.getElementById('db-course-dept-id').value;
  var box = document.getElementById('db-course-map-result');
  box.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>讀取中…';
  call('listDbCourseMap', deptId).then(function (result) {
    var driveNames = new Set(DB_COURSES.map(function (c) { return normalizeDbCourseName(c.name); }));
    var catalog = result.courses || [];
    DB_COURSEMAP = catalog.map(function (course) {
      return Object.assign({}, course, { exists: driveNames.has(normalizeDbCourseName(course.name)) });
    });
    var matched = DB_COURSEMAP.filter(function (c) { return c.exists; });
    box.innerHTML = '班別代碼：<code>' + esc((result.classCodes || []).join(', ')) + '</code>；Coursemap 共 ' + catalog.length + ' 門，Drive 已有同名課程 ' + matched.length + ' 門。';
    document.getElementById('db-course-map-controls').classList.remove('d-none');
    document.getElementById('db-course-map-search').value = '';
    renderDbCourseMapCandidates();
  }).catch(function (err) { box.innerHTML = '<span class="text-danger">' + esc((err && err.message) || '讀取失敗') + '</span>'; });
}
function renderDbCourseMapCandidates() {
  var query = normalizeDbCourseName(document.getElementById('db-course-map-search').value);
  var rows = DB_COURSEMAP.filter(function (course) {
    return !query || normalizeDbCourseName(course.code + course.name).indexOf(query) !== -1;
  });
  document.getElementById('db-course-map-list').innerHTML = rows.length ? rows.slice(0, 300).map(function (course) {
    return '<label class="list-group-item d-flex align-items-start gap-2 ' + (course.exists ? 'text-muted' : '') + '">' +
      '<input class="form-check-input mt-1 db-course-map-toggle" type="checkbox" value="' + esc(course.code) + '" ' + (course.exists ? 'disabled' : '') + '>' +
      '<span><span class="fw-semibold">' + esc(course.name) + '</span> <code class="small">' + esc(course.code) + '</code>' +
      (course.exists ? '<span class="badge bg-light text-dark border ms-1">Drive 已有</span>' : '') + '</span></label>';
  }).join('') : '<div class="list-group-item text-muted">沒有符合的課程。</div>';
}
function createDbCoursesFromMap() {
  var deptId = document.getElementById('db-course-dept-id').value;
  var codes = Array.from(document.querySelectorAll('.db-course-map-toggle:checked')).map(function (input) { return input.value; });
  if (!codes.length) { notify('請至少勾選一門尚未建立的課程。', 'warning'); return; }
  if (!confirm('將建立 ' + codes.length + ' 個課程資料夾，並同時開放瀏覽與上傳。確定繼續？')) return;
  call('createDbCoursesFromMap', deptId, codes).then(function (result) {
    var message = '已處理 ' + result.count + ' 門（新建 ' + result.created + '、沿用 ' + result.reused + '）。';
    if (result.formSync && !result.formSync.ok) message += ' 共用表單尚未同步：' + (result.formSync.message || '請完成 Drive agent 設定。');
    notify(message, result.formSync && !result.formSync.ok ? 'warning' : 'success');
    openDbCourses(deptId);
    loadDbDepts();
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
  var uploadAllowed = Array.from(document.querySelectorAll('.db-course-upload-toggle:checked')).map(function (input) { return input.value; });
  if (mode === 'allowlist' && !allowed.length && !confirm('白名單目前是空的，重建後此系將不顯示任何課程。確定儲存？')) return;
  call('saveDbCoursePolicy', deptId, mode, allowed, uploadAllowed).then(function (result) {
    var message = (mode === 'allowlist' ? '已儲存瀏覽白名單 ' + result.count + ' 門' : '已改為顯示全部課程') + '；開放上傳 ' + result.uploadCount + ' 門。';
    if (result.formSync && !result.formSync.ok) message += ' 共用表單尚未同步：' + (result.formSync.message || '請手動同步。');
    notify(message, result.formSync && !result.formSync.ok ? 'warning' : 'success');
    hideModal('dbCourseModal');
    loadDbDepts();
  });
}
function syncDbUploadForm() {
  if (!confirm('要把四系目前「開放上傳」的課程同步到共用 Google Form 嗎？')) return;
  call('syncDbUploadForm').then(function (result) {
    var counts = result.counts || {};
    var summary = Object.keys(counts).map(function (code) { return code + ' ' + counts[code] + ' 門'; }).join('、');
    var message = '共用表單已同步' + (summary ? '：' + summary : '。');
    if ((result.missingItems || []).length) message += ' 找不到題目：' + result.missingItems.join('、') + '。';
    notify(message, (result.missingItems || []).length ? 'warning' : 'success');
    loadDbAutomationStatus();
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
  document.getElementById('db-post-title-en').value = r ? (r.titleEn || '') : '';
  document.getElementById('db-post-content').value = r ? (r.content || '') : '';
  document.getElementById('db-post-content-en').value = r ? (r.contentEn || '') : '';
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
    titleEn: document.getElementById('db-post-title-en').value,
    content: document.getElementById('db-post-content').value,
    contentEn: document.getElementById('db-post-content-en').value,
    publishFrom: document.getElementById('db-post-from').value,
    publishUntil: document.getElementById('db-post-until').value,
    published: document.getElementById('db-post-published').checked,
    pinned: document.getElementById('db-post-pinned').checked,
  }).then(function () { notify('已儲存'); hideModal('dbPostModal'); loadDbPosts(); });
}
function delDbPost(id) { if (confirm('確定刪除？')) call('deleteDbPost', id).then(function () { loadDbPosts(); }); }

function loadDbReview() {
  var global = isGlobalDbManager();
  document.getElementById('db-review-scope-notice').classList.toggle('d-none', global);
  loadDbReviewCourses();
  loadDbSubmissions();
}
function loadDbReviewCourses() {
  var box = document.getElementById('db-review-course-list');
  box.innerHTML = '<div class="text-muted small"><span class="spinner-border spinner-border-sm me-1" aria-hidden="true"></span>讀取課程白名單中…</div>';
  call('listDbReviewCourses').then(function (rows) {
    box.innerHTML = rows.length ? rows.map(function (r) {
      var browse = r.browseCourses || [], upload = r.uploadCourses || [];
      var courseBadges = function (courses, emptyText) {
        return courses.length ? courses.map(function (c) { return '<span class="badge bg-white text-dark border me-1 mb-1">' + esc(displayDbCourseName(c.name)) + '</span>'; }).join('') : '<span class="text-muted small">' + emptyText + '</span>';
      };
      return '<details class="border rounded p-2 mb-2"><summary class="fw-semibold">' + esc(r.deptName || r.deptCode) +
        ' <span class="badge bg-primary ms-1">瀏覽 ' + browse.length + '</span> <span class="badge bg-success">上傳 ' + upload.length + '</span></summary>' +
        (r.error ? '<div class="alert alert-warning small py-1 mt-2 mb-1">' + esc(r.error) + '</div>' : '') +
        '<div class="small fw-semibold mt-2 mb-1">開放瀏覽' + (r.browseMode === 'all' ? '（全部課程）' : '') + '</div><div>' + courseBadges(browse, '目前沒有開放瀏覽課程') + '</div>' +
        '<div class="small fw-semibold mt-2 mb-1">開放上傳</div><div>' + courseBadges(upload, '目前沒有開放上傳課程') + '</div></details>';
    }).join('') : '<div class="alert alert-light border text-muted">目前沒有可審核的系所。</div>';
  }).catch(function (err) {
    box.innerHTML = '<div class="alert alert-warning small">課程白名單讀取失敗：' + esc((err && err.message) || '請稍後再試') + '</div>';
  });
}

function loadDbSubmissions() {
  call('listDbSubmissions', 'actionable').then(function (rows) {
    document.getElementById('db-submission-list').innerHTML = rows.length ?
      '<div class="table-responsive"><table class="table table-sm table-bordered align-middle"><thead><tr><th>系所</th><th>課程</th><th>檔案</th><th>上傳者／備註</th><th>時間</th><th></th></tr></thead><tbody>' + rows.map(function (r) {
        var pending = r.status === 'pending' || r.status === 'transferring';
        return '<tr><td><code>' + esc(r.deptCode) + '</code></td><td>' + esc(displayDbCourseName(r.courseName)) + '</td><td>' +
          (pending ? '<button type="button" class="btn btn-sm btn-link p-0 text-start" data-ui-action="previewDbSubmission" data-id="' + esc(r.id) + '">' + esc(r.fileName) + '</button>' : esc(r.fileName)) +
          (r.cleanupStatus === 'pending' ? '<div><span class="badge bg-warning text-dark">' +
            (r.status === 'rejected' ? '已拒絕，暫存原檔待清理' : '經濟系副本已核准，暫存原檔待清理') + '</span></div>' : '') + '</td>' +
          '<td><div class="small">' + esc(r.uploaderEmail || '-') + '</div>' + (r.source === 'web' ? '<div class="small text-muted">' + (r.emailVerified ? '臺大信箱已驗證' : '信箱未驗證') + '；站內上傳</div>' : '') +
          (r.status === 'transferring' ? '<div class="small text-warning">傳送結果待確認，請五分鐘後重試核准，勿重複上傳。</div>' : '') +
          '<div class="small text-muted">' + esc(r.note || '') + '</div></td><td class="small text-nowrap">' + esc((r.createdAt || '').replace('T', ' ').slice(0, 16)) + '</td>' +
          '<td class="text-nowrap">' + (pending
            ? '<button class="btn btn-sm btn-success" data-ui-action="approveDbSubmission" data-id="' + esc(r.id) + '">核准</button> <button class="btn btn-sm btn-danger" data-ui-action="rejectDbSubmission" data-id="' + esc(r.id) + '">拒絕</button>'
            : '<button class="btn btn-sm btn-warning" data-ui-action="retryDbCleanup" data-id="' + esc(r.id) + '">重試清理暫存檔</button>') + '</td></tr>';
      }).join('') + '</tbody></table></div>' : '<div class="alert alert-light border text-muted">目前沒有待審核檔案。</div>';
  });
}
function previewDbSubmission(id) {
  var native = id.indexOf('web_') === 0;
  var popup = native ? null : window.open('', '_blank');
  if (popup) popup.document.body.textContent = '正在載入檔案…';
  fetch(WORKER_URL + '/api/admin/db-submission-file?id=' + encodeURIComponent(id), {
    headers: { Authorization: 'Bearer ' + TOKEN }, cache: 'no-store',
  }).then(function (response) {
    if (!response.ok) return response.json().catch(function () { return {}; }).then(function (data) { throw new Error(data.error || ('HTTP ' + response.status)); });
    return response.blob();
  }).then(function (blob) {
    var url = URL.createObjectURL(blob);
    if (native) {
      var link = document.createElement('a'); link.href = url; link.download = '待審檔案.pdf'; link.click();
    } else if (popup) popup.location.replace(url); else window.open(url, '_blank');
    setTimeout(function () { URL.revokeObjectURL(url); }, 300000);
  }).catch(function (error) {
    if (popup) popup.close();
    notify('檔案預覽失敗：' + (error && error.message || error), false);
  });
}
function approveDbSubmission(id) {
  if (!confirm('核准後會將檔案移入公開課程資料夾，確定繼續？')) return;
  call('approveDbSubmission', id).then(function () { notify('已核准並移入課程資料夾'); loadDbSubmissions(); });
}
function rejectDbSubmission(id) {
  var reason = prompt('拒絕原因（可留空；站內測試上傳暫不寄送通知）：');
  if (reason === null) return;
  call('rejectDbSubmission', id, reason).then(function (result) {
    notify(result && result.cleanupStatus === 'pending' ? '已拒絕；暫存原檔尚待清理，可稍後重試。' : '已拒絕並清理暫存原檔。', result && result.cleanupStatus === 'pending' ? 'warning' : 'success');
    loadDbSubmissions();
  });
}
function retryDbCleanup(id) {
  call('retryDbSubmissionCleanup', id).then(function () { notify('已清理院學會暫存原檔。'); loadDbSubmissions(); });
}
