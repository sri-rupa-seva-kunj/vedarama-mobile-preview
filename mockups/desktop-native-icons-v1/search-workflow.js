// Search history and reader destinations for the local demonstration library.
(() => {
 const historyKey='vedarama-preview-search-history-v1',historyLimit=20;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)'),sources={books:'Книги',dictionaries:'Словари',word:'Пословник'};
 const languages={ru:'Русский',en:'English',sa:'Санскрит'};
 const copy=value=>JSON.parse(JSON.stringify(value)),text=value=>window.uiText?.(value)||value;
 const historyIcon=()=>'<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><g stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 5v5h5M4 9a8.5 8.5 0 1 1-.5 6"/><path d="M12 7v5l3.5 2"/></g></svg>';
 let history=[],modelRun=null;
 try{const stored=JSON.parse(localStorage.getItem(historyKey)||'[]');if(Array.isArray(stored))history=stored.filter(item=>item&&typeof item.id==='string'&&typeof item.run?.query==='string'&&item.run.query.length<=500&&Array.isArray(item.run.blocks)&&Array.isArray(item.run.sources)).slice(0,historyLimit);}catch{}
 function saveHistory(){try{localStorage.setItem(historyKey,JSON.stringify(history));}catch{}}
 function cleanRun(run){const value=copy(run);delete value.navigation;delete value.returnScroll;delete value.activeKey;delete value.aiDestinations;return value;}
 function remember(run){
  const value=cleanRun(run),signature=JSON.stringify({...value,id:undefined});
  history=history.filter(item=>JSON.stringify({...item.run,id:undefined})!==signature);
  history.unshift({id:'search-'+Date.now()+'-'+Math.random().toString(36).slice(2,7),created:Date.now(),run:value});history=history.slice(0,historyLimit);saveHistory();
 }
 function normalize(){searchPrefs.match='all';searchRun&&(searchRun.match='all');}
 normalize();
 const previousMatches=matchedSearchRows;
 matchedSearchRows=function(run){
  if(run.sources?.[0]!=='books')return previousMatches(run).map(row=>({...row,key:row.source+':'+row.id,language:'ru',verse:row.entry?.verse||47}));
  const terms=searchTerms(run.literal,'all').map(term=>term.toLocaleLowerCase()).filter(Boolean);
  const inScope=language=>!run.languages||run.languages.includes(language);
  return window.readerSearchRows().filter(row=>{
   if(!inScope(row.language)||!run.blocks.includes(row.block))return false;
   if(run.scope==='catalog'&&!(run.selectedCatalogBooks||[]).includes(row.language+':0'))return false;
   if(run.scope==='shelf'&&!saved.shelves.find(s=>s.id===run.shelf)?.books.includes(BOOK))return false;
   return terms.length&&terms.every(term=>row.text.toLocaleLowerCase().includes(term));
  }).map(row=>({...row,key:row.id}));
 };
 function excerpt(value,query){
  const term=searchTerms(query,'all').find(term=>value.toLocaleLowerCase().includes(term.toLocaleLowerCase())),at=term?value.toLocaleLowerCase().indexOf(term.toLocaleLowerCase()):0;
  const start=Math.max(0,at-85),end=Math.min(value.length,start+330);
  return (start?'…':'')+value.slice(start,end)+(end<value.length?'…':'');
 }
 function rowMarkup(row,run,ai=false){
  const key=row.key||row.source+':'+row.id,book=row.source==='dictionaries'?row.entry.title:row.book||'Бхагавад-гита';
  const section=row.source==='dictionaries'?({terms:'Термин',people:'Личность',places:'Место'})[row.entry.category]:row.title;
  const location=row.source==='dictionaries'?'Словари':`Глава ${row.chapter||2} · Текст ${row.verse||47}`;
  return `<article class="exact-result search-passage" data-result-key="${escapeText(key)}" ${run.activeKey===key?'data-active="true"':''}>
   <div class="search-passage-heading">${icon(row.source==='dictionaries'?'search':'book')}<h4>${escapeText(book)}</h4><span>${escapeText(languages[row.language]||'Русский')}</span></div>
   <div class="search-passage-address"><span>${escapeText(location)}</span><span>${escapeText(section||'Пословный перевод')}</span></div>
   <p class="search-result-excerpt" lang="${row.language==='sa'?'sa':row.language||'ru'}">${highlightSearch(excerpt(row.text,run.literal),ai?[]:searchTerms(run.literal,'all'))}</p>
   <button type="button" class="result-open" ${ai?`data-ai-destination="${escapeText(key)}"`:`data-open-result="${escapeText(key)}"`}>${row.source==='dictionaries'?'Открыть статью':'Открыть место'} ${icon('forward')}</button>
  </article>`;
 }
 exactResultMarkup=function(run,rows){
  const groups=new Map();rows.forEach(row=>{const key=row.source==='books'?row.book+'|'+row.language:row.source;if(!groups.has(key))groups.set(key,[]);groups.get(key).push(row);});
  return `<section class="exact-results result-pane"><div class="result-heading"><h2>${icon('search')}Точные совпадения</h2><span>${rows.length}</span></div>
   <p class="result-description search-user-query">«${escapeText(run.literal)}»</p>
   ${rows.length?[...groups.values()].map(group=>`<section class="search-book-results"><h3>${escapeText(group[0].source==='books'?group[0].book:sources[group[0].source])}<span>${group.length}</span></h3>${group.map(row=>rowMarkup(row,run)).join('')}</section>`).join(''):
    '<div class="search-empty"><h3>Ничего не найдено</h3><p>Попробуйте другой запрос, язык или область поиска.</p><button type="button" id="search-empty-edit" class="outline-button">Изменить запрос</button></div>'}
  </section>`;
 };
 // AI output is a separate, explicitly simulated source view; no provider is called.
 aiResultMarkup=function(run){
  if(!hasAiAccess())return '';
  const terms=run.query.toLocaleLowerCase().split(/\s+/).map(value=>value.replace(/[?.,!]/g,'')).filter(value=>value.length>3);
  let rows=run.sources?.[0]==='books'?window.readerSearchRows().filter(row=>(run.languages||['ru']).includes(row.language)&&run.blocks.includes(row.block)&&(run.scope!=='catalog'||run.selectedCatalogBooks?.includes(row.language+':0'))&&(run.scope!=='shelf'||saved.shelves.find(s=>s.id===run.shelf)?.books.includes(BOOK))):previousMatches({...run,literal:run.query,match:'any'});
  rows=rows.filter(row=>terms.some(term=>row.text.toLocaleLowerCase().includes(term))).slice(0,3).map(row=>({...row,key:row.source==='books'?row.id:row.source+':'+row.id}));
  run.aiDestinations=rows.map(row=>row.key);
  return `<section class="ai-search-results result-pane"><div class="result-heading"><h2>${icon('spark')}ИИ-поиск</h2><span>Демо</span></div><p class="result-description">${escapeText(searchModelLabel(run.model))}</p><div class="ai-search-answer"><span class="answer-label">ПРИМЕР ВЫДАЧИ</span><h3>Связанные источники</h3><p>Здесь будет ответ на вопрос со ссылками на выбранные источники.</p>${rows.length?rows.map(row=>rowMarkup(row,run,true)).join(''):'<p>Связанные источники не найдены</p>'}</div><p class="ai-search-disclaimer">Пример оформления выдачи. Модель не вызывается.</p></section>`;
 };
 function destinations(){
  if(!searchRun)return [];
  const exact=searchRun.mode==='ai'?[]:matchedSearchRows(searchRun);
  const aiKeys=new Set(searchRun.aiDestinations||[]),ai=searchRun.sources?.[0]==='books'?window.readerSearchRows().filter(row=>aiKeys.has(row.id)).map(row=>({...row,key:row.id})):previousMatches({...searchRun,match:'any',literal:searchRun.query}).map(row=>({...row,key:row.source+':'+row.id,verse:row.entry?.verse||47})).filter(row=>aiKeys.has(row.key));
  return [...exact,...ai.filter(row=>!exact.some(found=>found.key===row.key))];
 }
 function restoreList(){
  if(!searchRun)return;const run=searchRun;
  showSection('search');$('#workspace-panel').scrollTop=run.returnScroll||0;
  requestAnimationFrame(()=>{if(section!=='search'||searchRun!==run)return;$('#workspace-panel').scrollTop=run.returnScroll||0;const button=[...document.querySelectorAll('[data-open-result]')].find(button=>button.dataset.openResult===run.activeKey);button?.focus({preventScroll:true});});
 }
 function readerNavigation(){
  document.querySelectorAll('.search-reader-navigation,.back-to-search').forEach(node=>node.remove());
  if(section!=='read'||!searchRun?.navigation)return;
  const rows=destinations(),index=rows.findIndex(row=>row.key===searchRun.activeKey);if(index<0)return;
  const nav=document.createElement('nav');nav.className='search-reader-navigation';nav.setAttribute('aria-label',text('Навигация по результатам поиска'));
  nav.innerHTML=`<button type="button" class="back-to-search" id="back-to-search">${icon('back')}<span>К результатам поиска</span></button><span class="search-reader-query search-user-query">«${escapeText(searchRun.query)}»</span><div class="search-reader-steps"><button type="button" id="search-result-prev" class="icon-button" aria-label="Предыдущий результат" ${index===0?'disabled':''}>${icon('back')}</button><span>${index+1} / ${rows.length}</span><button type="button" id="search-result-next" class="icon-button" aria-label="Следующий результат" ${index===rows.length-1?'disabled':''}>${icon('forward')}</button></div><button type="button" id="search-navigation-close" class="icon-button" aria-label="Закрыть навигацию по результатам">${icon('close')}</button>`;
  $('.book-scroll').before(nav);$('#back-to-search').onclick=restoreList;
  $('#search-result-prev').onclick=()=>openResult(rows[index-1]);$('#search-result-next').onclick=()=>openResult(rows[index+1]);
  $('#search-navigation-close').onclick=()=>{searchRun.navigation=false;nav.remove();window.workspaceTabs?.refresh();};drawIcons(nav);
 }
 function openResult(row){
  if(!row||!searchRun)return;
  if(section==='search')searchRun.returnScroll=$('#workspace-panel').scrollTop;
  searchRun.activeKey=row.key;
  if(row.source==='dictionaries'){
   searchRun.navigation=false;
   const entry=row.entry;simpleDialog(entry.title,`<article class="unified-dictionary-article"><p class="dictionary-original">${escapeText(entry.original)}</p><h3>${escapeText(entry.definition)}</h3><p>${escapeText(entry.body)}</p><button type="button" id="dictionary-results-back" class="outline-button">${icon('back')}К результатам поиска</button></article>`);
   $('#dictionary-results-back').onclick=()=>{$('#dialog').close();restoreList();};return;
  }
  searchRun.navigation=true;
  document.querySelectorAll('.search-destination').forEach(node=>node.classList.remove('search-destination'));window.pageCarousel?.finish();showSection('read');
  window.readerRestore({...window.readerGetState(),verse:row.verse||47,edition:row.edition||'base',language:row.language||'ru',linkedOpen:false});
  const block=$('#reader-verse-'+(row.verse||47)+' '+(row.language&&row.language!=='ru'?'.edition-preview ':'')+'[data-block="'+(row.block||'gloss')+'"]');
  if(block)block.hidden=false;
  window.pagedReader?.restoreRoute();window.readerJump(row.verse||47);readerNavigation();
  const target=block?.querySelectorAll('p')[row.paragraph||0]||block;target?.classList.add('search-destination');
  const land=()=>{if(section!=='read'||searchRun.activeKey!==row.key)return;if(window.pagedReader?.overview().active)window.pagedReader.goToElement(target);else if(target){$('.book-scroll').scrollTop+=target.getBoundingClientRect().top-$('.book-scroll').getBoundingClientRect().top-24;}window.readerSyncContext?.();};
  requestAnimationFrame(land);window.workspaceTabs?.refresh();
 }
 function finishModel(){if(modelRun){try{modelRun.finish();}catch{modelRun.cancel();}modelRun=null;}}
 function modelVisibility(animate=false){
  const panel=$('.search-ai-options');if(!panel)return;
  const visible=hasAiAccess()&&searchMode!=='exact',before=panel.hidden?0:panel.getBoundingClientRect().height,opacity=panel.hidden?0:Number(getComputedStyle(panel).opacity);
  modelRun?.cancel();modelRun=null;
  panel.hidden=false;panel.inert=!visible;
  if(!visible&&panel.contains(document.activeElement))$('[data-search-mode=ai]')?.focus({preventScroll:true});
  const done=()=>{panel.hidden=!visible;panel.style.removeProperty('height');panel.style.removeProperty('opacity');document.dispatchEvent(new Event('desktop-layout-settled'));};
  if(!animate||reduced.matches){done();return;}
  panel.style.height=before+'px';panel.style.opacity=opacity;
  const run=panel.animate([{height:before+'px',opacity},{height:(visible?panel.scrollHeight:0)+'px',opacity:visible?1:0}],{duration:240,easing:'cubic-bezier(.22,.7,.2,1)',fill:'both'});modelRun=run;
  run.finished.then(()=>{if(modelRun!==run)return;modelRun=null;done();run.cancel();}).catch(()=>{});
 }
 function setMode(button){
  captureSearchInput();const checked=[...document.querySelectorAll('[data-search-mode]:checked')];
  if(!checked.length){button.checked=true;toast('Выберите хотя бы один способ поиска.');return;}
  searchMode=checked.length===2?'both':checked[0].dataset.searchMode;searchPrefs.defaultMode=searchMode;saveSearchPrefs();dirtySearch();
  $('.search-mode-description').textContent=text(searchMode==='exact'?'Точные совпадения в выбранных источниках.':searchMode==='ai'?'Ответ на вопрос со ссылками на выбранные источники.':'Точные совпадения и ИИ-ответ показаны отдельно.');modelVisibility(true);
 }
 function historyMeta(run){return [text(sources[run.sources[0]]||'Книги'),(run.languages||['ru']).map(language=>text(languages[language])).join(', '),text(run.scope==='catalog'?'Выбранные источники':searchScopeLabel(run.scope,run.shelf))].join(' · ');}
 function historyRow(item){return `<button type="button" class="search-history-row" data-history-search="${escapeText(item.id)}">${historyIcon()}<span><strong class="search-user-query">${escapeText(item.run.query)}</strong><small>${escapeText(historyMeta(item.run))}</small></span>${icon('forward')}</button>`;}
 function restoreHistory(id){
  const item=history.find(item=>item.id===id);if(!item)return;
  $('#dialog').open&&$('#dialog').close();const run=copy(item.run);
  searchPrefs={...defaultSearchPrefs,...run};delete searchPrefs.query;delete searchPrefs.literal;delete searchPrefs.mode;delete searchPrefs.id;delete searchPrefs.aiDestinations;
  searchMode=hasAiAccess()?run.mode:'exact';searchQuery=run.query;searchLiteral=run.literal;searchSeparate=run.literal!==run.query;searchPrefs.defaultMode=searchMode;normalize();saveSearchPrefs();
  showSection('search');runSearch();
 }
 function openHistory(){
  simpleDialog('История поиска',`<div class="search-history-dialog"><p>Выберите запрос, чтобы снова открыть результаты с прежней областью поиска.</p>${history.length?`<div class="search-history-list">${history.map(historyRow).join('')}</div><button type="button" id="clear-search-history" class="outline-button">Очистить историю</button>`:'<div class="search-history-empty">Здесь появятся ваши поисковые запросы.</div>'}</div>`);
  $('#dialog-body').querySelectorAll('[data-history-search]').forEach(button=>button.onclick=()=>restoreHistory(button.dataset.historySearch));
  if($('#clear-search-history'))$('#clear-search-history').onclick=()=>{history=[];saveHistory();openHistory();renderHistory();};drawIcons($('#dialog-body'));
 }
 function renderHistory(){
  const host=$('#search-history-preview');if(!host)return;
  host.innerHTML=`<div class="search-history-heading"><h2>История поиска</h2>${history.length?'<button type="button" id="search-history-all" class="text-button">Вся история '+icon('forward')+'</button>':''}</div>${history.length?history.slice(0,3).map(historyRow).join(''):'<p>Здесь появятся ваши поисковые запросы.</p>'}`;
  host.querySelectorAll('[data-history-search]').forEach(button=>button.onclick=()=>restoreHistory(button.dataset.historySearch));if($('#search-history-all'))$('#search-history-all').onclick=openHistory;drawIcons(host);
 }
 const previousRender=renderSearch;
 renderSearch=function(){
  finishModel();normalize();previousRender();
  const actions=document.createElement('div');actions.className='search-heading-actions';$('#search-settings').before(actions);actions.innerHTML='<button type="button" class="outline-button" id="search-history-open">'+historyIcon()+'История поиска</button>';actions.append($('#search-settings'));$('#search-history-open').onclick=openHistory;
  const model=$('.unified-model-option');if(model){const panel=document.createElement('div');panel.className='search-ai-options';panel.id='search-ai-options';$('#library-search-form').append(panel);panel.append(model);modelVisibility();}
  else{$('.separate-exact')?.remove();$('.literal-query-label')?.remove();}
  if($('.search-extra')&&!$('.search-extra').children.length)$('.search-extra').hidden=true;
  document.querySelectorAll('[data-search-mode]').forEach(button=>{button.onchange=()=>setMode(button);if(button.dataset.searchMode==='ai')button.setAttribute('aria-controls','search-ai-options');});
  $('.search-demo-hint').textContent=hasAiAccess()?'Пример библиотеки: БГ 2.46–50, словарные статьи и пословный перевод. ИИ-поиск демонстрационный.':'Пример библиотеки: БГ 2.46–50, словарные статьи и пословный перевод.';
  $('.search-page').insertAdjacentHTML('beforeend','<section id="search-history-preview" class="search-history-preview" aria-label="История поиска"></section>');renderHistory();drawIcons(actions);
 };
 const previousResults=renderSearchResults;
 renderSearchResults=function(){
  previousResults();const root=$('#search-results');if(!root||!searchRun)return;
  const rows=matchedSearchRows(searchRun),all=destinations();
  root.querySelectorAll('[data-open-result]').forEach(button=>button.onclick=()=>openResult(rows.find(row=>row.key===button.dataset.openResult)));
  root.querySelectorAll('[data-ai-destination]').forEach(button=>button.onclick=()=>openResult(all.find(row=>row.key===button.dataset.aiDestination)||previousMatches({...searchRun,match:'any',literal:searchRun.query}).find(row=>row.id===button.dataset.aiDestination)));
  if($('#search-empty-edit'))$('#search-empty-edit').onclick=()=>{$('#workspace-panel').scrollTop=0;$('#library-query').focus();};
  renderHistory();
 };
 const previousRun=runSearch;
 runSearch=function(){
  const before=searchRun;normalize();previousRun();if(searchRun===before)return;
  searchRun.id='run-'+Date.now();remember(searchRun);renderHistory();
  if(!reduced.matches)$('#search-results').animate([{opacity:0,translate:'0 8px'},{opacity:1,translate:'0 0'}],{duration:200,easing:'ease-out'});
  $('#search-results').scrollIntoView({block:'start',behavior:'instant'});
 };
 const previousShow=showSection;
 showSection=function(next,reset=true){finishModel();previousShow(next,reset);readerNavigation();};
 window.searchWorkflow={setMode,openHistory,restoreHistory,restoreReaderNavigation:readerNavigation,finish:finishModel,history:()=>copy(history)};
 window.addEventListener('resize',finishModel);reduced.addEventListener('change',()=>{if(reduced.matches)finishModel();});
 document.addEventListener('demo-account-change',()=>{finishModel();if(section==='search')renderSearch();});
 document.addEventListener('DOMContentLoaded',()=>{
  const query=new URLSearchParams(location.search).get('query');
  if(query&&section==='search'){const method=new URLSearchParams(location.search).get('method');if(method==='exact')searchMode='exact';openSearch(query);}
  else if(section==='search')renderSearch();readerNavigation();
 });
 if(section==='search')renderSearch();
})();
