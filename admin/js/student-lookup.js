var STUDENT_LOOKUP_PICKER=null, STUDENT_LOOKUP_RESULTS=[], STUDENT_LOOKUP_BUSY=false, STUDENT_LOOKUP_QUERY='';
function loadStudentLookup() {
  var input=document.getElementById('student-lookup-query'),list=document.getElementById('student-lookup-candidates');
  if(STUDENT_LOOKUP_PICKER)return;
  STUDENT_LOOKUP_PICKER=createCandidatePicker({input:input,list:list,getItems:function(query){query=query.trim().toLowerCase();return query===STUDENT_LOOKUP_QUERY ? STUDENT_LOOKUP_RESULTS : query?STUDENT_LOOKUP_RESULTS.filter(function(p){return p.name.toLowerCase().includes(query)||p.studentId.includes(query);}):[];},
    label:function(p){return (p.name||'未填姓名')+'（'+(p.studentId||'無學號，請確認紀錄')+'）・'+p.records.length+' 筆紀錄';},
    onSelect:function(person){
      var box=document.getElementById('student-lookup-details');box.innerHTML='';if(!person)return;
      var statuses={pending:'待審核',approved:'已核准',rejected:'未核准',borrowed:'借用中',available:'可借用',returned:'已歸還',picked_up:'已領取',cancelled:'已取消'};
      var heading=document.createElement('h3');heading.className='h5 mt-3';heading.textContent=(person.name||'未填姓名')+' '+person.studentId;box.appendChild(heading);
      var table=document.createElement('table');table.className='table table-striped';table.innerHTML='<thead><tr><th>類別</th><th>項目</th><th>狀態</th><th>時間</th></tr></thead>';
      var body=document.createElement('tbody');person.records.forEach(function(r){var row=document.createElement('tr');[r.type,r.title,statuses[r.status]||r.status,r.time?fmt(r.time):'—'].forEach(function(v){var cell=document.createElement('td');cell.textContent=v;row.appendChild(cell);});body.appendChild(row);});table.appendChild(body);box.appendChild(table);
    },onEmptyEnter:function(){runStudentLookup(false);}});
  document.getElementById('student-lookup-search').onclick=function(){runStudentLookup(false);};
  document.getElementById('student-lookup-refresh').onclick=function(){runStudentLookup(true);};
}
function runStudentLookup(refresh){
  if(STUDENT_LOOKUP_BUSY)return;
  var query=document.getElementById('student-lookup-query').value.trim(),status=document.getElementById('student-lookup-status');
  if(!query){status.textContent='請輸入姓名或學號。';return;}
  var lookupToken=TOKEN;STUDENT_LOOKUP_BUSY=true;status.textContent='查詢中…';
  call('studentQuickLookup',query,refresh).then(function(result){
    if(TOKEN!==lookupToken)return;
    if(document.getElementById('student-lookup-query').value.trim()!==query)return;
    STUDENT_LOOKUP_QUERY=query.toLowerCase();STUDENT_LOOKUP_RESULTS=result.candidates;STUDENT_LOOKUP_PICKER.refresh();
    status.textContent=(result.candidates.length?'請選擇候選人。':'查無符合且有權限查看的紀錄。')+'資料更新時間：'+fmt(result.updatedAt)+(result.truncated?'；候選人超過 100 位，請縮小查詢。':result.candidates.length>30?'；清單顯示前 30 位，請縮小查詢。':'');
  }).finally(function(){STUDENT_LOOKUP_BUSY=false;});
}

function resetStudentLookup() {
  STUDENT_LOOKUP_RESULTS=[];STUDENT_LOOKUP_QUERY='';
  if(STUDENT_LOOKUP_PICKER)STUDENT_LOOKUP_PICKER.clear();
  var box=document.getElementById('student-lookup-details');if(box)box.innerHTML='';
  var status=document.getElementById('student-lookup-status');if(status)status.textContent='';
}
