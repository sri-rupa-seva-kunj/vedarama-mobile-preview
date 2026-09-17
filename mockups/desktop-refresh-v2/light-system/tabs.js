// A tab owns navigation, transient drafts and results; the library and theme are shared.
(() => {
  const STORE='vedarama-workspace-tabs-v1';
  const clone=value=>JSON.parse(JSON.stringify(value));
  const pageNames={new:'Новая вкладка',read:'Бхагавад-гита',references:'Справочники',ai:'AI-помощник',notes:'Заметки',saved:'Моя библиотека',search:'Поиск',models:'Мои модели',converter:'Транслитерация',activity:'Новости'};
  const pageIcons={new:'plus',read:'book',references:'book',ai:'spark',notes:'note',saved:'shelf',search:'search',models:'settings',converter:'globe',activity:'bell'};
  let tabs=[],currentId='',restoring=false,saveTimer,restoreGeneration=0,storageWarning=false;
  const bar=$('.tabs');bar.className='workspace-tabs';bar.setAttribute('aria-label','Рабочие вкладки');
  $('.app-header').after(bar);
  const area=$('.workarea');area.id='workspace-tab-content';area.setAttribute('role','tabpanel');
  const context=$('#ai-panel>.panel-context');
  // Give the context label a stable target without replacing its controls.
  const contextText=[...context.childNodes].find(n=>n.nodeType===Node.TEXT_NODE&&n.textContent.trim());
  const contextLabel=document.createElement('span');contextLabel.id='tab-chat-context';contextLabel.textContent=contextText?.textContent||'Бхагавад-гита · 2.47';
  if(contextText)contextText.replaceWith(contextLabel);else context.prepend(contextLabel);
  const current=()=>tabs.find(t=>t.id===currentId);
  function blankState(){return {
    section:'new',view:'read',toolMode:'panel',hasBook:false,backToSearch:false,classes:[],
    chat:{model:defaultModelId,question:'',turns:[],library:true,pinned:true},
    search:{prefs:clone(defaultSearchPrefs),mode:'both',query:'',literal:'',separate:false,run:null,dirty:false,resultTab:'exact'},
    reference:{category:'terms',query:'',active:'karma'},savedView:{tab:'shelves',shelf:null,query:''},
    converter:{from:'IAST',to:'Кириллица',text:''},catalog:{query:'',tab:'Категории'},
    note:{query:'',open:false,text:'',quote:'',editId:null,selectedQuote:''},
    model:{draft:freshModelDraft(),open:false,verified:false,returnMode:'page',fromSearch:false,advanced:false},
    activity:'all',globalQuery:'',newQuery:'',scroll:{book:0,workspace:0,chat:0,notes:0,catalog:0,workspaces:{}}
  };}
  function capture(){
    const state=current()?.state||blankState();
    const position=(selector,key)=>$(selector).clientHeight?$(selector).scrollTop:state.scroll[key];
    if($('#model-form'))readModelDraft();
    return {
      section,view,toolMode,hasBook:state.hasBook,backToSearch:!!$('.back-to-search'),
      classes:['tree-hidden','focus-mode','mobile-tree','reference-detail-open'].filter(c=>document.body.classList.contains(c)),
      chat:{model:saved.chatModel,question:question.value,turns:[...document.querySelectorAll('#ai-messages .ai-turn')].map(t=>({text:t.querySelector('.question-bubble').textContent,model:t.dataset.modelName||featuredModels[0].name})),library:$('#library-scope').checked,pinned:$('#context-pin').getAttribute('aria-pressed')==='true'},
      search:{prefs:clone(searchPrefs),mode:searchMode,query:$('#library-query')?.value??searchQuery,literal:$('#literal-query')?.value??searchLiteral,separate:searchSeparate,run:clone(searchRun),dirty:searchDirty,resultTab:searchResultTab},
      reference:{category:referenceCategory,query:referenceQuery,active:activeReference},
      savedView:{tab:savedTab,shelf:activeShelf,query:$('#bookmark-search')?.value??state.savedView.query},
      converter:clone(saved.converter||state.converter),catalog:{query:$('#catalog-search').value,tab:$('[data-catalog].selected')?.dataset.catalog||'Категории'},
      note:{query:$('#notes-search').value,open:!$('#note-editor').hidden,text:$('#note-text').value,quote:$('#note-quote').textContent,editId,selectedQuote},
      model:{draft:{...modelDraft},open:modelFormOpen,verified:modelVerified,returnMode:modelReturnMode,fromSearch:modelsFromSearch,advanced:$('.model-advanced')?.open??state.model.advanced},
      activity:activityTab,globalQuery:$('.global-search input').value,newQuery:$('#new-tab-query')?.value??state.newQuery,
      scroll:{book:position('.book-scroll','book'),workspace:position('#workspace-panel','workspace'),chat:position('#ai-scroll','chat'),notes:position('#notes-panel','notes'),catalog:position('.catalog','catalog'),workspaces:{...state.scroll.workspaces,...($('#workspace-panel').clientHeight?{[section]:$('#workspace-panel').scrollTop}:{})}}
    };
  }
  function checkpoint(){if(!restoring&&current())current().state=capture();}
  function persistTabs(){
    clearTimeout(saveTimer);checkpoint();
    // Credentials can remain in an in-memory draft during tab switches, never on disk.
    const data={version:1,currentId,tabs:tabs.map(t=>({...t,state:{...t.state,model:{...t.state.model,verified:false,draft:{...t.state.model.draft,key:''}}}}))};
    try{localStorage.setItem(STORE,JSON.stringify(data));}catch{if(!storageWarning){toast('Не удалось сохранить вкладки. Они доступны до закрытия окна.');storageWarning=true;}}
  }
  function scheduleSave(){if(restoring)return;clearTimeout(saveTimer);saveTimer=setTimeout(persistTabs,350);}
  function titleOf(tab){const s=tab.state;return s.section==='saved'?(s.savedView.tab==='bookmarks'?'Закладки':'Мои полки'):pageNames[s.section]||'Ведарама';}
  function detailOf(tab){const s=tab.state;if(s.section==='read')return s.view==='read'?'Глава 2 · Текст 47':s.view==='ai'?'Книга и AI':'Книга и заметки';if(s.section==='references')return refEntries.find(r=>r.id===s.reference.active)?.title||'';if(s.section==='search')return s.search.query;if(s.section==='ai')return availableModels().find(m=>m.id===s.chat.model)?.name||'';return '';}
  function renderTabs(){
    bar.innerHTML='<div class="workspace-tab-list" role="tablist" aria-label="Открытые вкладки">'+tabs.map(t=>`<div class="workspace-tab ${t.id===currentId?'is-current':''}"><button type="button" class="workspace-tab-select" role="tab" id="tab-${t.id}" data-switch-tab="${t.id}" aria-selected="${t.id===currentId}" aria-controls="workspace-tab-content" tabindex="${t.id===currentId?'0':'-1'}" title="${escapeText(titleOf(t)+(detailOf(t)?' · '+detailOf(t):''))}">${icon(pageIcons[t.state.section]||'book')}<span>${escapeText(titleOf(t))}</span></button><button type="button" class="workspace-tab-close" data-close-tab="${t.id}" aria-label="Закрыть вкладку: ${escapeText(titleOf(t))}">${icon('close')}</button></div>`).join('')+'</div><button class="icon-button" id="new-tab" aria-label="Новая вкладка" title="Новая вкладка · Ctrl / Cmd T">'+icon('plus')+'</button>';
    area.setAttribute('aria-labelledby','tab-'+currentId);drawIcons(bar);
    bar.querySelectorAll('[data-switch-tab]').forEach(b=>b.onclick=()=>switchTab(b.dataset.switchTab));
    bar.querySelectorAll('[data-close-tab]').forEach(b=>b.onclick=()=>closeTab(b.dataset.closeTab));
    $('#new-tab').onclick=newTab;
    ensureActiveTabVisible();
    bar.querySelector('.workspace-tab-list').onkeydown=e=>{
      const id=e.target.closest('[data-switch-tab]')?.dataset.switchTab;if(!id)return;
      let i=tabs.findIndex(t=>t.id===id);
      if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();i=e.key==='Home'?0:e.key==='End'?tabs.length-1:(i+(e.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;switchTab(tabs[i].id);$('#tab-'+currentId).focus();}
      if(e.key==='Delete'){e.preventDefault();closeTab(id);$('#tab-'+currentId).focus();}
    };
  }
  function ensureActiveTabVisible(){const list=bar.querySelector('.workspace-tab-list'),item=$('#tab-'+currentId)?.parentElement;if(!list||!item)return;const a=list.getBoundingClientRect(),b=item.getBoundingClientRect();if(b.right>a.right)list.scrollLeft+=b.right-a.right;if(b.left<a.left)list.scrollLeft-=a.left-b.left;}
  window.addEventListener('resize',()=>requestAnimationFrame(ensureActiveTabVisible));
  function updateCurrentTitle(){if(restoring||!current())return;current().state=capture();renderTabs();scheduleSave();}
  function updateContext(){
    const hasBook=current()?.state.hasBook;
    contextLabel.textContent=hasBook?'Бхагавад-гита · 2.47':'Вся библиотека';
    $('#context-pin').hidden=!hasBook;context.querySelector('.context-book').hidden=!hasBook;
    question.placeholder=hasBook?'Ваш вопрос по тексту…':'Ваш вопрос по библиотеке…';
    $('.ai-intro p').textContent=hasBook?'Обсудите текущий стих или найдите связанные места в книгах.':'Задайте вопрос о шастрах или найдите связанные места в библиотеке.';
    const prompts=hasBook?['Что означает действие без привязанности?','Сопоставить с БГ 2.48','Найти связанные места']:['Как понимать действие без привязанности?','Найти тексты о карма-йоге','Сопоставить действие и бездействие'];
    document.querySelectorAll('.suggestions button').forEach((b,i)=>{b.dataset.question=prompts[i];const text=[...b.childNodes].find(n=>n.nodeType===Node.TEXT_NODE);if(text)text.textContent=prompts[i];});
  }
  function renderNewTab(){
    $('#workspace-panel').innerHTML=`<section class="new-tab-page"><span class="overline">НОВАЯ ВКЛАДКА</span><h1>С чего начнём?</h1><p>Откройте книгу, найдите нужное место или задайте вопрос.</p><form id="new-tab-search" class="new-tab-search">${icon('search')}<input id="new-tab-query" type="search" aria-label="Поиск в новой вкладке" placeholder="Слово, фраза или вопрос…" required><button type="submit" class="gold-button">Найти${icon('forward')}</button></form><div class="new-tab-shortcuts">${[['read','book','Читать книгу','Бхагавад-гита · глава 2'],['references','book','Справочники','Термины, личности и места'],['ai','spark','Спросить AI','Новый разговор по библиотеке'],['saved','bookmark','Моя библиотека','Полки и сохранённые места']].map(([id,ico,title,caption])=>`<button data-start-section="${id}"><span class="new-tab-symbol">${icon(ico)}</span><strong>${title}</strong><small>${caption}</small>${icon('right')}</button>`).join('')}</div><div class="new-tab-other"><h2>Открыто в других вкладках</h2>${tabs.filter(t=>t.id!==currentId&&t.state.section!=='new').length?'<div class="new-tab-open-list">'+tabs.filter(t=>t.id!==currentId&&t.state.section!=='new').map(t=>`<button data-resume-tab="${t.id}">${icon(pageIcons[t.state.section]||'book')}<span>${escapeText(titleOf(t))}<small>${escapeText(detailOf(t))}</small></span>${icon('forward')}</button>`).join('')+'</div>':'<p>Здесь появятся ваши открытые книги и разделы.</p>'}</div><p class="new-tab-hint">У каждой вкладки своё место чтения, поиск и диалог. Переключайтесь — всё останется на месте.</p></section>`;
    drawIcons($('#workspace-panel'));
    $('#new-tab-query').value=current()?.state.newQuery||'';
    $('#new-tab-search').onsubmit=e=>{e.preventDefault();openSearch($('#new-tab-query').value);};
    document.querySelectorAll('[data-start-section]').forEach(b=>b.onclick=()=>showSection(b.dataset.startSection));
    document.querySelectorAll('[data-resume-tab]').forEach(b=>b.onclick=()=>switchTab(b.dataset.resumeTab));
  }
  const oldShowSection=showSection,oldOpenTool=openTool,oldSyncNavigation=syncNavigation;
  showSection=function(next,resetPanel=true){
    if(!restoring)checkpoint();
    if(!restoring&&next==='read'&&current())current().state.hasBook=true;
    document.body.classList.toggle('new-tab-open',next==='new');
    oldShowSection(next,resetPanel);if(next==='new')renderNewTab();
    if(!restoring)restoreVisibleScroll();updateContext();updateCurrentTitle();
  };
  openTool=function(next,mode='panel'){
    if(!restoring)checkpoint();
    if(current()&&!current().state.hasBook)mode='page';
    document.body.classList.remove('new-tab-open');oldOpenTool(next,mode);if(!restoring)restoreVisibleScroll();updateContext();updateCurrentTitle();
  };
  function restoreVisibleScroll(){const s=current()?.state.scroll;if(!s)return;if($('.book-scroll').clientHeight)$('.book-scroll').scrollTop=s.book;if($('#ai-scroll').clientHeight)$('#ai-scroll').scrollTop=s.chat;if($('#notes-panel').clientHeight)$('#notes-panel').scrollTop=s.notes;if($('#workspace-panel').clientHeight)$('#workspace-panel').scrollTop=s.workspaces?.[section]||0;}
  syncNavigation=function(){oldSyncNavigation();if(!restoring&&current()){current().state.section=section;current().state.view=view;current().state.toolMode=toolMode;}updateContext();};
  const oldToolModeClick=$('#tool-mode').onclick;
  $('#tool-mode').onclick=()=>{if(toolMode==='page'&&current())current().state.hasBook=true;oldToolModeClick();updateContext();updateCurrentTitle();};
  function restore(state){
    restoring=true;const generation=++restoreGeneration;
    if($('#dialog').open)$('#dialog').close();$('.toast').hidden=true;$('#selection-actions').hidden=true;
    for(const c of ['tree-hidden','focus-mode','mobile-tree','reference-detail-open'])document.body.classList.remove(c);
    const s=state;
    saved.chatModel=availableModels().some(m=>m.id===s.chat.model)?s.chat.model:defaultModelId;
    saved.converter=clone(s.converter);
    searchPrefs=clone(s.search.prefs);if(!availableModels().some(m=>m.id===searchPrefs.model))searchPrefs.model=defaultModelId;
    searchMode=s.search.mode;searchQuery=s.search.query;searchLiteral=s.search.literal;searchSeparate=s.search.separate;searchRun=clone(s.search.run);searchDirty=s.search.dirty;searchResultTab=s.search.resultTab;
    referenceCategory=s.reference.category;referenceQuery=s.reference.query;activeReference=s.reference.active;
    savedTab=s.savedView.tab;activeShelf=s.savedView.shelf;activityTab=s.activity;
    modelDraft={...s.model.draft};modelFormOpen=s.model.open;modelVerified=s.model.verified;modelReturnMode=s.model.returnMode;modelsFromSearch=s.model.fromSearch;
    $('.global-search input').value=s.globalQuery;
    document.querySelectorAll('.back-to-search').forEach(b=>b.remove());
    if(s.backToSearch){$('.book-scroll').insertAdjacentHTML('afterbegin','<button class="back-to-search" id="back-to-search">'+icon('back')+'К результатам поиска</button>');$('#back-to-search').onclick=()=>{document.querySelectorAll('.back-to-search').forEach(b=>b.remove());showSection('search');};drawIcons($('#back-to-search'));}
    $('#catalog-search').value=s.catalog.query;$('#catalog-search').dispatchEvent(new Event('input'));
    $('#notes-search').value=s.note.query;renderNotes();
    editId=saved.notes.some(n=>n.id===s.note.editId)?s.note.editId:null;selectedQuote=s.note.selectedQuote;
    $('#note-editor').hidden=!s.note.open;$('#note-text').value=s.note.text;$('#note-quote').textContent=s.note.quote;$('#note-quote').hidden=!s.note.quote;
    $('#ai-messages').replaceChildren();$('.ai-intro').hidden=false;$('.suggestions').hidden=false;
    for(const turn of s.chat.turns)appendChatTurn(turn.text,turn.model);
    question.value=s.chat.question;updateQuestion();$('#library-scope').checked=s.chat.library;
    $('#context-pin').setAttribute('aria-pressed',String(s.chat.pinned));$('#context-pin').textContent=s.chat.pinned?'Закреплён':'За чтением';
    showSection(s.section);
    if(s.section==='read'&&s.view!=='read')openTool(s.view,s.toolMode);
    if(s.section==='saved')renderSaved(s.savedView.query);
    if($('.model-advanced'))$('.model-advanced').open=s.model.advanced;
    for(const c of s.classes)document.body.classList.add(c);
    $('#focus').setAttribute('aria-pressed',String(s.classes.includes('focus-mode')));
    $('#toggle-tree').setAttribute('aria-expanded',String(!s.classes.includes('tree-hidden')));
    $('#toggle-tree').setAttribute('aria-label',s.classes.includes('tree-hidden')?'Показать дерево книг':'Скрыть дерево книг');
    refreshModelPicker();updateContext();fitChatInput();syncNavigation();
    const scroll=()=>{if(generation!==restoreGeneration)return;$('.book-scroll').scrollTop=s.scroll.book;$('#workspace-panel').scrollTop=s.scroll.workspace;$('#ai-scroll').scrollTop=s.scroll.chat;$('#notes-panel').scrollTop=s.scroll.notes;$('.catalog').scrollTop=s.scroll.catalog;};
    scroll();requestAnimationFrame(scroll);restoring=false;
  }
  function switchTab(id){
    if(id===currentId||!tabs.some(t=>t.id===id))return;
    const focusTab=bar.contains(document.activeElement);
    checkpoint();currentId=id;restore(current().state);renderTabs();persistTabs();
    if(focusTab)$('#tab-'+id)?.focus({preventScroll:true});ensureActiveTabVisible();
  }
  function newTab(){
    checkpoint();const tab={id:newId(),state:blankState()};tabs.push(tab);currentId=tab.id;
    restore(tab.state);renderTabs();persistTabs();$('#new-tab-query').focus({preventScroll:true});ensureActiveTabVisible();
  }
  function closeTab(id){
    const focusTab=bar.contains(document.activeElement);
    checkpoint();const index=tabs.findIndex(t=>t.id===id);if(index<0)return;
    const wasActive=id===currentId;tabs.splice(index,1);
    if(!tabs.length){newTab();return;}
    if(wasActive){currentId=tabs[Math.min(index,tabs.length-1)].id;restore(current().state);}
    if(section==='new')renderNewTab();renderTabs();persistTabs();if(focusTab)$('#tab-'+currentId)?.focus({preventScroll:true});
  }
  // Replace the old '+' action and intercept its legacy keyboard handler.
  document.addEventListener('keydown',e=>{
    if(!(e.ctrlKey||e.metaKey)||e.altKey)return;
    const key=e.key.toLowerCase();
    if(key==='t'&&!e.shiftKey){e.preventDefault();e.stopImmediatePropagation();newTab();}
    if(key==='w'&&!e.shiftKey){e.preventDefault();e.stopImmediatePropagation();closeTab(currentId);}
    if(e.key==='Tab'){e.preventDefault();e.stopImmediatePropagation();const i=tabs.findIndex(t=>t.id===currentId);switchTab(tabs[(i+(e.shiftKey?-1:1)+tabs.length)%tabs.length].id);}
  },true);
  document.addEventListener('input',scheduleSave);
  document.addEventListener('change',scheduleSave);
  document.addEventListener('click',()=>{if(!restoring)queueMicrotask(()=>{if(!restoring){checkpoint();const b=$('#tab-'+currentId);if(b){b.querySelector('span').textContent=titleOf(current());b.title=titleOf(current())+(detailOf(current())?' · '+detailOf(current()):'');}scheduleSave();}});});
  document.addEventListener('scroll',scheduleSave,true);
  window.addEventListener('pagehide',persistTabs);
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')persistTabs();});
  const params=new URLSearchParams(location.search),requested=params.get('section');
  let stored;try{stored=JSON.parse(localStorage.getItem(STORE));}catch{}
  if(stored?.version===1&&Array.isArray(stored.tabs)&&stored.tabs.length){
    try{
      tabs=stored.tabs.filter(t=>t.id&&t.state&&pageNames[t.state.section]).map(t=>({id:String(t.id).replace(/[^a-zA-Z0-9_-]/g,''),state:t.state}));
      if(!tabs.length)throw Error('Empty session');
      currentId=tabs.some(t=>t.id===stored.currentId)?stored.currentId:tabs[0].id;
      if(requested&&pageNames[requested]){const t={id:newId(),state:blankState()};t.state.section=requested;t.state.hasBook=requested==='read';tabs.push(t);currentId=t.id;}
      restore(current().state);
    }catch{tabs=[];currentId='';}
  }
  if(!tabs.length){const initial=blankState();initial.hasBook=true;const t={id:newId(),state:initial};tabs=[t];currentId=t.id;t.state=capture();if(requested&&pageNames[requested])showSection(requested);}
  if(requested){const url=new URL(location.href);url.searchParams.delete('section');url.searchParams.delete('q');try{history.replaceState(null,'',url);}catch{}}
  renderTabs();updateContext();persistTabs();
  descriptions.brief[0]='Ведарама · макет 05';
  descriptions.brief[1]='<p>Каждая вкладка — отдельное рабочее место: книги, справочники, AI и остальные разделы открываются внутри неё. Кнопка «+» начинает новую вкладку с чистым поиском и диалогом.</p><p>При переключении и после перезагрузки восстанавливаются раздел, положение чтения, результаты поиска, диалог и черновики. Полки, сохранённые заметки, подключения и тема общие для приложения.</p>'+descriptions.brief[1];
})();
