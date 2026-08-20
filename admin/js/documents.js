// Admin module: documents. Loaded as a classic script for legacy handler compatibility.
// ---------- 列印 / PDF ----------
// 內嵌字型，使列印結果不受本機字型影響（標楷體＝LXGW WenKai TC）
var PRINT_FONTS = [
  'https://cdn.jsdelivr.net/npm/lxgw-wenkai-tc-webfont/style.css'
];
function printDoc(title, innerHtml, extraCss) {
  var w = window.open('', '_blank');
  if (!w) { notify('請允許彈出視窗，以匯出 PDF', false); return; }
  var links = PRINT_FONTS.map(function (u) { return '<link rel="stylesheet" href="' + u + '">'; }).join('');
  var css = '@page{size:A4;margin:2cm;} body{font-family:"LXGW WenKai TC","DFKai-SB","BiauKai","標楷體",serif;color:#000;line-height:1.8;} ' +
    'table{width:100%;border-collapse:collapse;} th,td{border:1px solid #000;padding:8px;} h2{text-align:center;margin:0 0 12px;} ' + (extraCss || '');
  w.document.write('<!DOCTYPE html><html lang="zh-Hant"><head><meta charset="UTF-8">' + links + '<title>' + esc(title) + '</title><style>' + css + '</style></head><body>' + innerHtml + '</body></html>');
  w.document.close(); w.focus();
  var go = function () { try { w.print(); } catch (e) {} };
  setTimeout(function () {
    if (w.document.fonts && w.document.fonts.ready) { w.document.fonts.ready.then(function () { setTimeout(go, 200); }); }
    else { go(); }
  }, 500);
}
function signInSheet() {
  var ev = window.__regEvent; if (!ev) return;
  call('listRegistrations', ev.id).then(function (rows) {
    var trs = '';
    rows.forEach(function (r, i) {
      var sig = r.checkinAt ? '<span style="color:#0a7d2c">已線上簽到 ' + esc(fmt(r.checkinAt)) + '</span>' : '';
      trs += '<tr><td style="text-align:center">' + (i + 1) + '</td><td>' + esc(r.name) + '</td><td>' + esc(r.dept) + '</td><td>' + sig + '</td></tr>';
    });
    for (var k = 0; k < 8; k++) trs += '<tr><td style="text-align:center">' + (rows.length + k + 1) + '</td><td></td><td></td><td></td></tr>';
    var body = '<h2>' + esc(ev.title) + '　簽到表</h2>' +
      '<table><thead><tr><th style="width:56px">編號</th><th>姓名</th><th style="width:24%">系級</th><th style="width:38%">簽到時間／親簽</th></tr></thead><tbody>' + trs + '</tbody></table>';
    printDoc(ev.title + ' 簽到表', body, 'td{height:42px;}');
  });
}
function rocDate(iso) {
  if (!iso) return '';
  var d = new Date(iso + 'T00:00:00');
  if (isNaN(d)) return iso;
  return '中華民國 ' + (d.getFullYear() - 1911) + ' 年 ' + (d.getMonth() + 1) + ' 月 ' + d.getDate() + ' 日';
}
function gwToggle() {
  var anno = ['公告', '令'].indexOf(document.getElementById('gw-type').value) !== -1;
  document.querySelectorAll('#t-gongwen .gw-han').forEach(function (el) { el.classList.toggle('d-none', anno); });
  document.querySelectorAll('#t-gongwen .gw-anno').forEach(function (el) { el.classList.toggle('d-none', !anno); });
}
// ===== 機關印信 / 職名章 設定 =====
var __seals = [];
function loadSeals() {
  call('listSeals').then(function (rows) {
    __seals = rows || [];
    cacheEditRecords('seal', __seals, 'id');
    var sel = document.getElementById('gw-seal-id');
    if (sel) {
      var cur = sel.value;
      sel.innerHTML = '<option value="">（無）</option>' + __seals.map(function (s) { return '<option value="' + esc(s.id) + '">' + esc(s.name) + '</option>'; }).join('');
      if (cur) sel.value = cur; else if (__seals.length) sel.value = __seals[0].id;
    }
    document.getElementById('seal-list').innerHTML = __seals.length ? '<table class="table table-sm table-bordered align-middle" style="max-width:760px"><thead><tr><th>排序</th><th>名稱</th><th>檔案</th><th>操作</th></tr></thead><tbody>' +
      __seals.map(function (s) {
        return '<tr><td>' + esc(s.order) + '</td><td>' + esc(s.name) + '</td><td class="small text-muted text-truncate" style="max-width:240px">' + esc(s.fileId) + '</td>' +
          '<td>' + editRecordButton('seal', s.id, false) + ' ' +
          '<button class="btn btn-sm btn-outline-danger" data-ui-action="delSeal" data-id="' + esc(s.id) + '">刪除</button></td></tr>';
      }).join('') + '</tbody></table>' : '<p class="text-muted small">尚無機關印信，請於上方新增。</p>';
  });
  // 我的職名章
  var ms = document.getElementById('myseal-status');
  if (MEPROF && MEPROF.jobSeal) { document.getElementById('myseal-file').value = MEPROF.jobSeal; if (ms) ms.textContent = '目前已設定職名章。'; }
  else if (ms) ms.textContent = '尚未設定職名章。';
}
function saveSealUI() {
  var name = document.getElementById('seal-name').value.trim();
  var file = document.getElementById('seal-file').value.trim();
  if (!name || !file) { notify('請填寫名稱與 Drive 連結', false); return; }
  call('saveSeal', { id: document.getElementById('seal-id').value || '', name: name, fileId: file, order: document.getElementById('seal-order').value || '0' })
    .then(function () { hideModal('sealModal'); notify('已儲存印信'); resetSealForm(); loadSeals(); });
}
function openSealModal() {
  resetSealForm();
  showModal('sealModal');
}
function editSeal(s) {
  resetSealForm();
  document.getElementById('seal-modal-title').innerHTML = '<i class="bi bi-stamp me-2"></i>編輯機關印信';
  document.getElementById('seal-id').value = s.id || '';
  document.getElementById('seal-name').value = s.name || '';
  document.getElementById('seal-file').value = s.fileId || '';
  document.getElementById('seal-order').value = s.order || '0';
  showModal('sealModal');
}
function resetSealForm() {
  document.getElementById('seal-modal-title').innerHTML = '<i class="bi bi-stamp me-2"></i>新增機關印信';
  document.getElementById('seal-id').value = ''; document.getElementById('seal-name').value = '';
  document.getElementById('seal-file').value = ''; document.getElementById('seal-order').value = '0';
}
function delSeal(id) { if (confirm('刪除此印信？')) call('deleteSeal', id).then(function () { loadSeals(); }); }
function saveMyJobSeal() {
  var ref = document.getElementById('myseal-file').value.trim();
  call('setMyJobSeal', ref).then(function (r) { if (MEPROF) MEPROF.jobSeal = r && r.jobSeal; notify('已儲存職名章'); loadSeals(); });
}

// ===== pdf-lib 公文產生器 =====
var GW_FONT_URL = 'https://cdn.jsdelivr.net/gh/lxgw/LxgwWenkaiTC@v1.520/fonts/TTF/LXGWWenKaiTC-Regular.ttf';
var __gwFont = null, __gwLibs = null;
function loadScriptOnce(src) {
  return new Promise(function (res, rej) {
    if (document.querySelector('script[data-src="' + src + '"]')) { res(); return; }
    var s = document.createElement('script'); s.src = src; s.setAttribute('data-src', src);
    s.onload = res; s.onerror = function () { rej(new Error('載入失敗：' + src)); };
    document.head.appendChild(s);
  });
}
function gwLibs() {
  if (__gwLibs) return __gwLibs;
  __gwLibs = loadScriptOnce('https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js')
    .then(function () { return loadScriptOnce('https://cdn.jsdelivr.net/npm/@pdf-lib/fontkit@1.1.1/dist/fontkit.umd.min.js'); });
  return __gwLibs;
}
function gwFontBytes() {
  if (__gwFont) return Promise.resolve(__gwFont);
  return fetch(GW_FONT_URL).then(function (r) { if (!r.ok) throw new Error('字型下載失敗'); return r.arrayBuffer(); }).then(function (b) { __gwFont = b; return b; });
}
function dataUrlToBytes(d) { var b = atob(d.split(',')[1]); var u = new Uint8Array(b.length); for (var i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); return u; }

async function genGongwen() {
  var v = function (id) { var el = document.getElementById(id); return el ? el.value.trim() : ''; };
  var type = v('gw-type');
  var anno = ['公告', '令'].indexOf(type) !== -1;
  try {
    notify('產生中…首次需下載字型，請稍候');
    await gwLibs();
    var P = window.PDFLib;
    var fontBytes = await gwFontBytes();

    // 先取得印信圖片（base64）
    var govSealId = document.getElementById('gw-seal').checked ? v('gw-seal-id') : '';
    var govSealRef = govSealId ? (((__seals.find(function (s) { return s.id === govSealId; })) || {}).fileId || '') : '';
    var jobSealRef = (!anno && document.getElementById('gw-jobseal').checked && MEPROF && MEPROF.jobSeal) ? MEPROF.jobSeal : '';
    var govSealImg = govSealRef ? await call('getSeal', govSealRef).catch(function () { notify('機關印信讀取失敗，將略過', false); return null; }) : null;
    var jobSealImg = jobSealRef ? await call('getSeal', jobSealRef).catch(function () { notify('職名章讀取失敗，將略過', false); return null; }) : null;

    var doc = await P.PDFDocument.create();
    doc.registerFontkit(window.fontkit);
    // subset:false — 子集化在 CJK 會漏字（字可複製但不顯示），改內嵌完整字型確保不缺字
    var font = await doc.embedFont(fontBytes, { subset: false });
    var black = P.rgb(0, 0, 0);

    var PW = 595.28, PH = 841.89, M = 56.7, LEFT = M, RIGHT = PW - M, CW = RIGHT - LEFT;
    var page = doc.addPage([PW, PH]);
    var y = PH - M;
    function newPage() { page = doc.addPage([PW, PH]); y = PH - M; }
    function ensure(h) { if (y - h < M) newPage(); }
    function tw(t, sz) { return font.widthOfTextAtSize(t, sz); }
    function text(t, x, sz, color) { page.drawText(t, { x: x, y: y - sz, size: sz, font: font, color: color || black }); }
    function wrap(s, sz, maxw) {
      var out = [];
      String(s == null ? '' : s).split('\n').forEach(function (para) {
        if (para === '') { out.push(''); return; }
        var line = '';
        for (var i = 0; i < para.length; i++) {
          var ch = para[i];
          if (line && tw(line + ch, sz) > maxw) { out.push(line); line = ch; } else line += ch;
        }
        out.push(line);
      });
      return out;
    }
    // 一般段落（自動換行 + 換頁）
    function block(s, x, sz, maxw, gap) {
      wrap(s, sz, maxw).forEach(function (ln) { ensure(sz * 1.7); text(ln, x, sz); y -= sz * 1.8; });
      if (gap) y -= gap;
    }
    // 懸掛縮排段落（主旨：／說明：…）
    function seg(label, val, sz) {
      if (!val) return;
      var lab = label + '：';
      var labW = tw(lab, sz), bx = LEFT + labW;
      var lines = wrap(val, sz, CW - labW);
      ensure(sz * 1.7);
      text(lab, LEFT, sz); text(lines[0] || '', bx, sz); y -= sz * 1.9;
      for (var i = 1; i < lines.length; i++) { ensure(sz * 1.7); text(lines[i], bx, sz); y -= sz * 1.9; }
      y -= sz * 0.5;
    }
    function metaLines(arr, sz) {
      arr.forEach(function (kv) {
        if (!kv[1]) return;
        String(kv[1]).split('\n').forEach(function (ln, i) { ensure(sz * 1.6); text((i === 0 ? kv[0] + '：' : '') + ln, LEFT, sz); y -= sz * 1.7; });
      });
    }
    function centerSpaced(t, sz) {
      // 置中＋字距（公文標題）
      var gap = sz * 0.35, total = 0, i;
      for (i = 0; i < t.length; i++) total += tw(t[i], sz) + (i ? gap : 0);
      var x = LEFT + (CW - total) / 2;
      ensure(sz * 1.6);
      for (i = 0; i < t.length; i++) { page.drawText(t[i], { x: x, y: y - sz, size: sz, font: font, color: black }); x += tw(t[i], sz) + gap; }
      y -= sz * 1.7;
    }
    // 檔號 / 保存年限（右上角）；佔用頂端一塊高度，標題往下避免重疊
    var topY = PH - M;
    if (v('gw-file') || v('gw-keep')) {
      var ts = 9;
      page.drawText('檔　號：' + v('gw-file'), { x: RIGHT - 160, y: topY - ts, size: ts, font: font, color: black });
      page.drawText('保存年限：' + v('gw-keep'), { x: RIGHT - 160, y: topY - ts * 2.4, size: ts, font: font, color: black });
      topY -= ts * 2.4 + 12; // 預留檔號區塊高度
    }
    y = topY - 6;

    // 機關名稱 + 文別（置中大字）
    centerSpaced('國立臺灣大學社會科學院學生會', 18);
    y -= 2; centerSpaced(type, 22); y -= 10;

    // 印信圖片內嵌工具
    async function embed(sealObj) {
      if (!sealObj) return null;
      var bytes = dataUrlToBytes(sealObj.dataUrl);
      return (sealObj.mime && sealObj.mime.indexOf('png') !== -1) ? await doc.embedPng(bytes) : await doc.embedJpg(bytes);
    }
    var govImg = await embed(govSealImg), jobImg = await embed(jobSealImg);

    if (anno) {
      // 公告：左側發文資訊，右側機關印信
      var metaTopY = y;
      metaLines([['發文日期', rocDate(v('gw-date'))], ['發文字號', v('gw-no')], ['附件', v('gw-attach')]], 12);
      if (govImg) {
        var gh = 120, gs = govImg.scale(gh / govImg.height);
        page.drawImage(govImg, { x: RIGHT - gs.width, y: metaTopY - gh, width: gs.width, height: gs.height });
        if (metaTopY - gh - 6 < y) y = metaTopY - gh - 6;
      }
      y -= 12;
      seg('主旨', v('gw-subject'), 14);
      seg('依據', v('gw-basis'), 14);
      seg('公告事項', v('gw-notice'), 14);
      if (v('gw-signer')) { y -= 18; centerSpaced(v('gw-signer'), 16); }
    } else {
      // 函：地址（右上）
      if (v('gw-addr') || v('gw-contact')) {
        var as = 10;
        if (v('gw-addr')) { ensure(as * 1.6); var a1 = '地址：' + v('gw-addr'); page.drawText(a1, { x: RIGHT - tw(a1, as), y: y - as, size: as, font: font, color: black }); y -= as * 1.7; }
        if (v('gw-contact')) { ensure(as * 1.6); var a2 = '聯絡方式：' + v('gw-contact'); page.drawText(a2, { x: RIGHT - tw(a2, as), y: y - as, size: as, font: font, color: black }); y -= as * 1.7; }
        y -= 6;
      }
      var mTopY = y;
      metaLines([['受文者', v('gw-to')], ['發文日期', rocDate(v('gw-date'))], ['發文字號', v('gw-no')],
        ['速別', v('gw-speed')], ['密等及解密條件或保密期限', v('gw-secret')], ['附件', v('gw-attach')]], 12);
      if (govImg) {
        var fh = 110, fs = govImg.scale(fh / govImg.height);
        page.drawImage(govImg, { x: RIGHT - fs.width, y: mTopY - fh, width: fs.width, height: fs.height });
        if (mTopY - fh - 6 < y) y = mTopY - fh - 6;
      }
      y -= 6;
      // 分隔線
      ensure(12); page.drawLine({ start: { x: LEFT, y: y }, end: { x: RIGHT, y: y }, thickness: 1, color: black }); y -= 14;
      seg('主旨', v('gw-subject'), 14);
      seg('說明', v('gw-body'), 14);
      if (v('gw-orig')) block('正本：' + v('gw-orig'), LEFT, 12, CW, 2);
      if (v('gw-copy')) block('副本：' + v('gw-copy'), LEFT, 12, CW, 2);
      // 署名：有職名章就只蓋章（不再寫職銜姓名）；否則置中署名文字
      if (jobImg) {
        var jh = 60, js = jobImg.scale(jh / jobImg.height);
        if (js.width > CW) { js = jobImg.scale(CW / jobImg.width); jh = js.height; }
        ensure(jh + 24); y -= 24;
        page.drawImage(jobImg, { x: LEFT + (CW - js.width) / 2, y: y - jh, width: js.width, height: js.height });
        y -= jh + 6;
      } else if (v('gw-signer')) {
        y -= 28; centerSpaced(v('gw-signer'), 18);
      }
    }

    var bytes = await doc.save();
    var blob = new Blob([bytes], { type: 'application/pdf' });
    var fname = (type + '_' + (v('gw-no') || v('gw-date') || '')).replace(/[\\/:*?"<>|\s]+/g, '_') || '公文';
    var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = fname + '.pdf';
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(a.href);
    notify('PDF 已下載');
  } catch (e) {
    notify('產生失敗：' + (e && e.message ? e.message : e), false);
  }
}
// 開會簽到表（pdf-lib，欄位：職稱／姓名／簽到／簽到時間；自動分頁）
async function genMeetingSignIn() {
  try {
    notify('產生中…首次需下載字型，請稍候');
    await gwLibs();
    var P = window.PDFLib;
    var fontBytes = await gwFontBytes();
    var doc = await P.PDFDocument.create();
    doc.registerFontkit(window.fontkit);
    var font = await doc.embedFont(fontBytes, { subset: false });
    var black = P.rgb(0, 0, 0);
    var PW = 595.28, PH = 841.89, M = 56.7, LEFT = M, RIGHT = PW - M, CW = RIGHT - LEFT;
    var title = document.getElementById('mtg-title').value.trim() || '開會簽到表';
    var dval = document.getElementById('mtg-date').value;
    var extra = Math.max(0, Math.min(60, Number(document.getElementById('mtg-rows').value) || 0));
    var roster = await call('listMeetingRoster').catch(function () { return []; });
    var bodyRows = (roster || []).map(function (p) { return [p.title || '', p.name || '', '', '']; });
    for (var bk = 0; bk < extra; bk++) bodyRows.push(['', '', '', '']);
    if (!bodyRows.length) bodyRows.push(['', '', '', '']);
    var cols = [['職稱', 0.18], ['姓名', 0.22], ['簽到', 0.30], ['簽到時間', 0.30]];
    var widths = cols.map(function (c) { return c[1] * CW; });
    function colX(i) { var x = LEFT; for (var k = 0; k < i; k++) x += widths[k]; return x; }
    function tw(t, sz) { return font.widthOfTextAtSize(t, sz); }
    var rowH = 30, headH = 30, page, y;
    function drawRow(vals, h, isHead) {
      var topY = y, botY = y - h;
      page.drawLine({ start: { x: LEFT, y: topY }, end: { x: RIGHT, y: topY }, thickness: 1, color: black });
      page.drawLine({ start: { x: LEFT, y: botY }, end: { x: RIGHT, y: botY }, thickness: 1, color: black });
      for (var i = 0; i <= cols.length; i++) { var x = (i < cols.length) ? colX(i) : RIGHT; page.drawLine({ start: { x: x, y: topY }, end: { x: x, y: botY }, thickness: 1, color: black }); }
      if (vals) { var sz = isHead ? 13 : 12; for (var j = 0; j < cols.length; j++) { var t = vals[j] || ''; if (t) page.drawText(t, { x: colX(j) + (widths[j] - tw(t, sz)) / 2, y: botY + (h - sz) / 2 + 1, size: sz, font: font, color: black }); } }
      y = botY;
    }
    function startPage(withTitle) {
      page = doc.addPage([PW, PH]); y = PH - M;
      if (withTitle) {
        var ts = 22; page.drawText(title, { x: LEFT + (CW - tw(title, ts)) / 2, y: y - ts, size: ts, font: font, color: black }); y -= ts + 14;
        if (dval) { page.drawText('會議日期：' + rocDate(dval), { x: LEFT, y: y - 12, size: 12, font: font, color: black }); y -= 24; }
      }
      drawRow(cols.map(function (c) { return c[0]; }), headH, true);
    }
    startPage(true);
    bodyRows.forEach(function (rv) {
      if (y - rowH < M) startPage(false);
      drawRow(rv, rowH, false);
    });
    var bytes = await doc.save();
    var blob = new Blob([bytes], { type: 'application/pdf' });
    var a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = title.replace(/[\\/:*?"<>|\s]+/g, '_') + '_簽到表.pdf';
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(a.href);
    notify('簽到表 PDF 已下載');
  } catch (e) {
    notify('產生失敗：' + (e && e.message ? e.message : e), false);
  }
}
function loadMeeting() {
  var md = document.getElementById('mtg-date'); if (md && !md.value) md.value = new Date().toISOString().slice(0, 10);
  call('listMeetingRoster').then(function (rows) {
    document.getElementById('mtg-roster').innerHTML = (rows && rows.length) ? '<table class="table table-sm table-bordered align-middle" style="max-width:560px"><thead><tr><th>職稱</th><th>姓名</th><th>來源</th><th></th></tr></thead><tbody>' +
      rows.map(function (p) {
        return '<tr><td>' + esc(p.title) + '</td><td>' + esc(p.name) + '</td><td>' + (p.custom ? '<span class="badge bg-info text-dark">自訂</span>' : '<span class="badge bg-secondary">幹部</span>') + '</td>' +
          '<td>' + (p.custom ? '<button class="btn btn-sm btn-outline-danger" data-ui-action="delMeetingAttendee" data-id="' + esc(p.id) + '">刪除</button>' : '') + '</td></tr>';
      }).join('') + '</tbody></table>' : '<p class="text-muted small">名單為空。</p>';
  });
}
function addMeetingAttendee() {
  var t = document.getElementById('mtg-att-title').value.trim();
  var n = document.getElementById('mtg-att-name').value.trim();
  if (!n) { notify('請填寫姓名', false); return; }
  call('saveMeetingAttendee', { title: t, name: n }).then(function () {
    document.getElementById('mtg-att-title').value = ''; document.getElementById('mtg-att-name').value = '';
    notify('已新增'); loadMeeting();
  });
}
function delMeetingAttendee(id) { if (confirm('刪除此列席者？')) call('deleteMeetingAttendee', id).then(function () { loadMeeting(); }); }

function autoGwNo() {
  call('nextGongwenNo').then(function (r) {
    document.getElementById('gw-no').value = r.no;
    document.getElementById('gw-file').value = r.file;
    notify('已帶入：' + r.no);
  });
}
function loadGongwen() {
  var gd = document.getElementById('gw-date'); if (!gd.value) gd.value = new Date().toISOString().slice(0, 10);
  gwToggle();
  loadSeals();
  var ct = document.getElementById('gw-contact');
  if (ct && !ct.value && MEPROF) ct.value = '承辦人：' + (MEPROF.name || '') + '　Email：ntusssa2@gmail.com';
  var s = document.getElementById('gw-signer');
  if (!s.value) {
    call('getSettingsAll').then(function (rows) {
      var m = {}; rows.forEach(function (r) { m[r.key] = r.value; });
      s.value = m.gongwen_signer || ((MEPROF ? ((MEPROF.title || '') + '　' + (MEPROF.name || '')).trim() : ''));
    });
  }
}
