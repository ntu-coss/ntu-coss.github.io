// Admin module: app. Loaded as a classic script for legacy handler compatibility.
// ---------- 分頁切換（手動控制，避免跨群組殘留） ----------
function runTabLoad(t) {
  if (t === '#t-dashboard') loadDashboard();
  if (t === '#t-updates') loadStagingUpdatesPage();
  if (t === '#t-home') loadHero();
  if (t === '#t-announce') loadAnnounce();
  if (t === '#t-quicklookup') loadStudentLookup();
  if (t === '#t-events') loadEvents();
  if (t === '#t-roster') loadSettings();
  if (t === '#t-gongwen') loadGongwen();
  if (t === '#t-meeting') loadMeeting();
  if (t === '#t-calendar') loadCal();
  if (t === '#t-venue') { loadVenuePending(); loadVenueAll(); }
  if (t === '#t-vset') { loadClosed(); loadSettings(); }
  if (t === '#t-locker') loadLocker();
  if (t === '#t-equipment') loadEquipment();
  if (t === '#t-petition') loadPetitions();
  if (t === '#t-email') loadEmail();
  if (t === '#t-pagetext') loadPageTexts();
  if (t === '#t-db') loadDb();
  if (t === '#t-dbreview') loadDbReview();
  if (t === '#t-system') loadSettings();
  if (t === '#t-admins' && isOwner()) { loadSettings(); loadAdmins(); }
  if (t === '#t-audit' && isOwner()) loadAudit();
}
function goTab(t) {
  if ((t === '#t-admins' || t === '#t-audit') && !isOwner()) {
    notify('此頁面僅限系統擁有者存取。', 'warning');
    return;
  }
  document.querySelectorAll('#app .tab-pane').forEach(function (p) { p.classList.remove('show', 'active'); });
  var pane = document.querySelector(t);
  if (pane) pane.classList.add('show', 'active');
  document.querySelectorAll('#sidebar [data-tab]').forEach(function (b) { b.classList.remove('active'); });
  var btn = document.querySelector('#sidebar [data-tab="' + t + '"]'); if (btn) btn.classList.add('active');
  runTabLoad(t);
  var oc = bootstrap.Offcanvas.getInstance(document.getElementById('sidebar')); if (oc) oc.hide();
}
document.getElementById('sidebar').addEventListener('click', function (e) {
  var btn = e.target.closest('[data-tab]');
  if (btn) goTab(btn.getAttribute('data-tab'));
});

// 初始載入由登入成功後的 onSignIn() 觸發

// Preserve a shareable activity URL without reloading scripts or signing in again.
function handleEventNavigation(event) {
  if(event.defaultPrevented || event.button!==0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || !TOKEN)return;
  var anchor=event.target.closest && event.target.closest('a[href]');
  if(!anchor || anchor.target || anchor.hasAttribute('download'))return;
  var url=new URL(anchor.href,location.href);
  if(url.origin!==location.origin || url.pathname!=='/admin/' || !(url.searchParams.has('event') || url.searchParams.get('tab')==='events'))return;
  event.preventDefault();
  if(!new URLSearchParams(location.search).has('event'))history.replaceState(null,'','/admin/?tab=events');
  history.pushState(null,'',url.pathname+url.search);goTab('#t-events');
}
document.addEventListener('click',handleEventNavigation);
window.addEventListener('popstate',function(){
  if(!TOKEN)return;
  var params=new URLSearchParams(location.search);
  goTab(params.has('event')||params.get('tab')==='events'?'#t-events':'#t-dashboard');
});
