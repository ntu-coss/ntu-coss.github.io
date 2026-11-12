// Local SVG paths; decorative icons always retain adjacent text labels.
function adminIcon(name) {
  var paths={edit:'<path d="m16 3 5 5-12 12H4v-5zM14 5l5 5"/>',link:'<path d="m10 13 4-4M8 16l-2 2a4 4 0 0 1-6-6l4-4a4 4 0 0 1 6 0M16 8l2-2a4 4 0 0 1 6 6l-4 4a4 4 0 0 1-6 0" transform="translate(1 0) scale(.9)"/>',checkin:'<path d="M9 11h12M9 17h12M3 10l1 1 2-2M3 16l1 1 2-2M9 5h12"/>',mail:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 6 9 7 9-7"/>',sync:'<path d="M20 7a9 9 0 0 0-15-2L2 8m0-5v5h5M4 17a9 9 0 0 0 15 2l3-3m0 5v-5h-5"/>',columns:'<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 9v12M15 9v12"/>',file:'<path d="M6 3h9l4 4v14H6zM14 3v5h5M9 13h7M9 17h7"/>',qr:'<path d="M3 3h6v6H3zM15 3h6v6h-6zM3 15h6v6H3zM15 15h3v3h-3zM21 15v6h-3M12 3v3M3 12h6M12 12h9M12 18v3"/>',trash:'<path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7M14 10v7"/>',back:'<path d="m10 5-7 7 7 7M3 12h18"/>'};
  return '<svg class="admin-svg me-1" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(paths[name]||paths.file)+'</svg>';
}
function eventToolbarIcons(html) {
  var labels={'編輯':'edit','複製活動連結':'link','快速簽到':'checkin','發信':'mail','同步名單':'sync','欄位對應':'columns','簽到表 PDF':'file','簽到 QR':'qr','刪除活動':'trash','返回活動列表':'back'};
  return html.replace(/(<(?:button|a)\b[^>]*>)([^<]+)(<\/(?:button|a)>)/g,function(_,start,label,end){return start+(labels[label]?adminIcon(labels[label]):'')+label+end;});
}
