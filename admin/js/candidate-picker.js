// Shared local candidate picker: no network calls on typing or arrow navigation.
function createCandidatePicker(options) {
  var input=options.input, list=options.list, items=[], active=0, chosen=null;
  input.setAttribute('role','combobox'); input.setAttribute('aria-autocomplete','list'); input.setAttribute('aria-controls',list.id);
  list.setAttribute('role','listbox');
  function choose(index) { if(!items[index])return; chosen=items[index]; active=index; render(); options.onSelect(chosen); }
  function render() {
    list.innerHTML=''; list.hidden=!items.length; input.setAttribute('aria-expanded',String(!!items.length));
    items.forEach(function(item,index) {
      var button=document.createElement('button'); button.type='button'; button.className='list-group-item list-group-item-action'+(index===active?' active':'');
      button.id=list.id+'-'+index;button.setAttribute('role','option');button.setAttribute('aria-selected',String(index===active));button.textContent=options.label(item);
      button.onmousedown=function(event){event.preventDefault();};button.onclick=function(){choose(index);input.focus();};list.appendChild(button);
    });
    if(items.length)input.setAttribute('aria-activedescendant',list.id+'-'+active);else input.removeAttribute('aria-activedescendant');
  }
  function refresh(){chosen=null;active=0;items=options.getItems(input.value).slice(0,30);render();options.onSelect(null);}
  input.oninput=refresh;
  input.onkeydown=function(event){
    if(event.isComposing||event.repeat||input.disabled)return;
    if(event.key==='ArrowDown'||event.key==='ArrowUp'){event.preventDefault();if(!items.length)return;chosen=null;active=(active+(event.key==='ArrowDown'?1:-1)+items.length)%items.length;options.onSelect(null);render();}
    else if(event.key==='Escape'){event.preventDefault();chosen=null;items=[];render();options.onSelect(null);}
    else if(event.key==='Enter'){event.preventDefault();if(chosen){if(options.onConfirm)options.onConfirm(chosen);}else if(items.length)choose(active);else if(options.onEmptyEnter)options.onEmptyEnter();}
  };
  return {refresh:refresh,selected:function(){return chosen;},clear:function(){input.value='';refresh();}};
}
