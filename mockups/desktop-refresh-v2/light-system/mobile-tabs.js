// Mobile overview uses the same workspace state as desktop tabs.
(() => {
 const api=window.workspaceTabs;if(!api)return;
 const controls=document.createElement('div');controls.className='mobile-tab-controls';
 controls.innerHTML='<span id="mobile-current-tab"></span><button id="mobile-tabs-button" aria-label="Открыть вкладки" aria-haspopup="dialog" aria-controls="mobile-tabs-overview"><span class="mobile-tab-count">1</span></button>';
 $('.workspace-tabs').after(controls);
 const overview=document.createElement('dialog');overview.id='mobile-tabs-overview';overview.setAttribute('aria-labelledby','mobile-tabs-heading');
 overview.innerHTML='<header class="mobile-tabs-heading"><h1 id="mobile-tabs-heading">Вкладки <span id="mobile-overview-count"></span></h1><button id="mobile-tabs-done">Готово</button></header><div class="mobile-tabs-grid"></div><footer class="mobile-tabs-footer"><button id="mobile-tab-create" class="gold-button">'+icon('plus')+'Новая вкладка</button></footer><span class="sr-only" id="mobile-tabs-status" role="status"></span>';
 document.body.append(overview);drawIcons(overview);
 let historyEntry=false,afterClose=null;
 function syncButton(){const data=api.overview(),active=data.tabs.find(t=>t.id===data.activeId);$('#mobile-current-tab').textContent=active?.title||'Ведарама';$('.mobile-tab-count').textContent=data.tabs.length;$('#mobile-tabs-button').setAttribute('aria-label','Открыть вкладки · '+data.tabs.length);return data;}
 function render(){
  const data=syncButton(),grid=$('.mobile-tabs-grid');$('#mobile-overview-count').textContent=data.tabs.length;
  grid.innerHTML=data.tabs.map(t=>`<article class="mobile-tab-card ${t.id===data.activeId?'is-current':''}"><button class="mobile-tab-open" data-mobile-tab-open="${t.id}" aria-label="Открыть вкладку: ${escapeText(t.title)}" ${t.id===data.activeId?'aria-current="page"':''}><span class="mobile-tab-card-title">${icon(t.icon)}<strong>${escapeText(t.title)}</strong></span><span class="mobile-tab-preview mobile-tab-preview-${t.section}"><span class="mobile-tab-preview-icon">${icon(t.icon)}</span><strong>${escapeText(t.preview)}</strong><span>${escapeText(t.detail===t.preview?'':t.detail)}</span>${t.context?'<small>'+escapeText(t.context)+'</small>':''}</span><span class="mobile-tab-card-status">${t.id===data.activeId?icon('check')+'Текущая вкладка':'Открыть вкладку'}</span></button><button class="mobile-tab-remove" data-mobile-tab-close="${t.id}" aria-label="Закрыть вкладку: ${escapeText(t.title)}">${icon('close')}</button></article>`).join('');
  drawIcons(grid);
  grid.querySelectorAll('[data-mobile-tab-open]').forEach(b=>b.onclick=()=>dismiss(()=>api.activate(b.dataset.mobileTabOpen)));
  grid.querySelectorAll('[data-mobile-tab-close]').forEach(b=>b.onclick=()=>{const id=b.dataset.mobileTabClose,index=data.tabs.findIndex(t=>t.id===id);api.close(id);render();const buttons=[...grid.querySelectorAll('[data-mobile-tab-close]')];buttons[Math.min(index,buttons.length-1)]?.focus({preventScroll:true});$('#mobile-tabs-status').textContent=data.tabs.length===1?'Последняя вкладка закрыта. Создана новая вкладка.':'Вкладка закрыта';});
 }
 function finish(){overview.close();historyEntry=false;const action=afterClose;afterClose=null;action?.();syncButton();if(!action)$('#mobile-tabs-button').focus({preventScroll:true});}
 function dismiss(action){afterClose=action||null;if(historyEntry&&history.state?.vedaramaTabOverview)history.back();else finish();}
 function open(push=true){if(innerWidth>700||overview.open)return;document.activeElement?.blur();render();overview.showModal();$('#mobile-tabs-button').setAttribute('aria-expanded','true');
  if(push){try{history.pushState({...history.state,vedaramaTabOverview:true},'',location.href);historyEntry=true;}catch{historyEntry=false;}}else historyEntry=!!history.state?.vedaramaTabOverview;
 }
 $('#mobile-tabs-button').onclick=()=>open();$('#mobile-tabs-done').onclick=()=>dismiss();$('#mobile-tab-create').onclick=()=>dismiss(()=>api.create());
 overview.addEventListener('cancel',e=>{e.preventDefault();dismiss();});overview.addEventListener('close',()=>$('#mobile-tabs-button').setAttribute('aria-expanded','false'));
 window.addEventListener('popstate',()=>{if(overview.open&&!history.state?.vedaramaTabOverview)finish();else if(history.state?.vedaramaTabOverview)open(false);});
 window.addEventListener('resize',()=>{if(innerWidth>700&&overview.open)dismiss();});
 document.addEventListener('workspace-tabs-change',()=>{syncButton();if(overview.open)render();});
 document.addEventListener('click',()=>queueMicrotask(syncButton));
 syncButton();if(history.state?.vedaramaTabOverview){if(innerWidth<=700)open(false);else {const clean={...history.state};delete clean.vedaramaTabOverview;history.replaceState(clean,'',location.href);}}
})();
