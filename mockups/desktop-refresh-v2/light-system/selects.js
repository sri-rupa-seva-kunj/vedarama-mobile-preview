// Shared select UI. The original form control remains the source of truth.
(() => {
  let serial=0, active=null, typed='', typedAt=0;
  const entries=new WeakMap();
  function labelFor(select){
    if(select.getAttribute('aria-label'))return select.getAttribute('aria-label');
    return [...select.labels||[]].map(label=>{const copy=label.cloneNode(true);copy.querySelectorAll('select,.veda-select').forEach(e=>e.remove());return copy.textContent.trim();}).join(' ')||'Выберите значение';
  }
  function sync(select){
    const entry=entries.get(select);if(!entry)return;
    entry.value.textContent=select.selectedOptions[0]?.textContent||'Выберите…';
    entry.button.disabled=select.disabled;
    entry.button.setAttribute('aria-label',labelFor(select)+': '+entry.value.textContent);
    entry.button.setAttribute('aria-required',String(select.required));
  }
  function close(focus=false){
    if(!active)return;const {button,menu}=active;active=null;
    button.setAttribute('aria-expanded','false');button.removeAttribute('aria-activedescendant');
    menu.remove();if(focus&&button.isConnected)button.focus({preventScroll:true});
  }
  function highlight(index){
    if(!active)return;active.index=index;
    active.menu.querySelectorAll('[role=option]').forEach((item,i)=>item.classList.toggle('is-focused',i===index));
    const row=active.menu.children[index];
    if(row){active.button.setAttribute('aria-activedescendant',row.id);row.scrollIntoView({block:'nearest'});}
  }
  function choose(index){
    if(!active)return;const {select,button}=active, option=select.options[index];
    if(!option||option.disabled||option.parentElement.disabled)return;
    const id=select.id,changed=select.selectedIndex!==index;select.selectedIndex=index;close();sync(select);
    if(changed){select.dispatchEvent(new Event('input',{bubbles:true}));select.dispatchEvent(new Event('change',{bubbles:true}));}
    // Some prototype views replace their form when the scope changes.
    queueMicrotask(()=>{enhance(document);const target=select.isConnected?button:entries.get(document.getElementById(id))?.button;target?.focus({preventScroll:true});});
  }
  function open(select){
    const entry=entries.get(select);if(select.disabled)return;
    if(active?.select===select){close();return;}close();sync(select);
    const menu=document.createElement('div');menu.className='veda-select-menu';menu.id=entry.button.getAttribute('aria-controls');menu.setAttribute('role','listbox');menu.setAttribute('aria-label',labelFor(select));menu.setAttribute('popover','manual');
    [...select.options].forEach((option,i)=>{
      const row=document.createElement('div');row.className='veda-select-option';row.id=menu.id+'-'+i;row.setAttribute('role','option');row.setAttribute('aria-selected',String(option.selected));
      row.setAttribute('aria-disabled',String(option.disabled||!!option.parentElement.disabled));
      const text=document.createElement('span');text.textContent=option.textContent;row.append(text);
      if(option.selected){const check=document.createElement('span');check.className='veda-select-check';check.setAttribute('aria-hidden','true');check.textContent='✓';row.append(check);}
      row.onpointerdown=e=>e.preventDefault();row.onclick=()=>choose(i);menu.append(row);
    });
    (select.closest('dialog[open]')||document.body).append(menu);
    const rect=entry.button.getBoundingClientRect(),viewport=visualViewport;
    const height=viewport?.height||innerHeight,top=viewport?.offsetTop||0,width=viewport?.width||innerWidth;
    const below=height+top-rect.bottom-12,above=rect.top-top-12,up=below<180&&above>below;
    menu.style.width=Math.min(Math.max(rect.width,210),width-24)+'px';
    menu.style.maxHeight=Math.min(300,Math.max(80,up?above:below))+'px';
    menu.style.left=Math.max(12,Math.min(rect.left,width-parseFloat(menu.style.width)-12))+'px';
    if(menu.showPopover)menu.showPopover();
    menu.style.top=(up?rect.top-menu.getBoundingClientRect().height-6:rect.bottom+6)+'px';
    active={...entry,select,menu,index:select.selectedIndex};typed='';entry.button.focus({preventScroll:true});
    entry.button.setAttribute('aria-expanded','true');highlight(select.selectedIndex);
  }
  function move(delta,edge){
    const enabled=[...active.select.options].map((o,i)=>!o.disabled&&!o.parentElement.disabled?i:-1).filter(i=>i>=0);
    if(!enabled.length)return;
    const index=edge==='first'?enabled[0]:edge==='last'?enabled.at(-1):enabled[(enabled.indexOf(active.index)+delta+enabled.length)%enabled.length];highlight(index);
  }
  function enhance(root){
    root.querySelectorAll('select').forEach(select=>{
      if(entries.has(select)){sync(select);return;}
      const wrap=document.createElement('span');wrap.className='veda-select';
      const button=document.createElement('button');button.type='button';button.className='veda-select-trigger';button.setAttribute('role','combobox');button.setAttribute('aria-haspopup','listbox');button.setAttribute('aria-expanded','false');button.setAttribute('aria-controls','veda-options-'+(++serial));
      const value=document.createElement('span');value.className='veda-select-value';button.append(value);
      const arrow=document.createElement('span');arrow.className='veda-select-arrow';arrow.setAttribute('aria-hidden','true');button.append(arrow);
      select.after(wrap);wrap.append(button);select.classList.add('veda-native-select');select.tabIndex=-1;select.setAttribute('aria-hidden','true');
      entries.set(select,{button,value});sync(select);
      button.onclick=()=>open(select);
      button.onkeydown=e=>{
        if(e.key==='Escape'&&active){e.preventDefault();e.stopPropagation();close(true);return;}
        if(e.key==='Tab'){close();return;}
        if(['ArrowDown','ArrowUp','Home','End'].includes(e.key)){e.preventDefault();if(active?.select!==select)open(select);else move(e.key==='ArrowUp'?-1:1,e.key==='Home'?'first':e.key==='End'?'last':null);return;}
        if((e.key==='Enter'||e.key===' ')&&active?.select===select){e.preventDefault();choose(active.index);return;}
        if(e.key.length===1&&!e.ctrlKey&&!e.metaKey&&!e.altKey&&e.key!==' '){e.preventDefault();if(active?.select!==select)open(select);typed=Date.now()-typedAt>800?e.key:typed+e.key;typedAt=Date.now();const i=[...select.options].findIndex(o=>!o.disabled&&!o.parentElement.disabled&&o.textContent.toLocaleLowerCase().startsWith(typed.toLocaleLowerCase()));if(i>=0)highlight(i);}
      };
      select.addEventListener('change',()=>sync(select));
      select.addEventListener('invalid',e=>{e.preventDefault();button.focus();});
    });
    if(active&&!active.select.isConnected)close();
  }
  document.addEventListener('pointerdown',e=>{if(active&&!active.menu.contains(e.target)&&!active.button.contains(e.target))close();},true);
  document.addEventListener('focusin',e=>{if(active&&e.target!==active.button&&!active.menu.contains(e.target))close();});
  document.addEventListener('scroll',e=>{if(active&&e.target!==active.menu&&!active.menu.contains(e.target))close();},true);
  document.addEventListener('close',()=>close(),true);
  window.addEventListener('resize',()=>close());
  visualViewport?.addEventListener('resize',()=>close());
  document.addEventListener('reset',()=>setTimeout(()=>enhance(document),0));
  // Dynamic views and modal forms share the same component automatically.
  new MutationObserver(records=>{
    if(records.some(r=>[...r.addedNodes].some(n=>n.nodeType===1&&(n.matches('select')||n.querySelector('select')))))enhance(document);
    for(const r of records)if(r.target instanceof HTMLSelectElement)sync(r.target);
    if(active&&!active.select.isConnected)close();
  }).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['disabled','required']});
  enhance(document);
})();
