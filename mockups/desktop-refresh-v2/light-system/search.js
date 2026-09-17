// Search the actual sample text locally; AI responses are explicitly demonstrations.
const searchModes={exact:'Точный поиск',ai:'ИИ-поиск',both:'Точный поиск + ИИ-поиск'};
const defaultSearchPrefs={exact:true,ai:true,defaultMode:'both',scope:'all',shelf:'',match:'phrase',blocks:['original','gloss','translation','comment'],model:defaultModelId};
let searchPrefs={...defaultSearchPrefs,...saved.searchPreferences};
if(!availableModels().some(m=>m.id===searchPrefs.model)){searchPrefs.model=defaultModelId;saved.searchPreferences={...searchPrefs};persist();}
// Both methods are always available; remember the user's checked combination.
searchPrefs.exact=true;searchPrefs.ai=true;
function allowedSearchMode(mode){return mode==='both'?searchPrefs.exact&&searchPrefs.ai:mode==='ai'?searchPrefs.ai:searchPrefs.exact;}
function safeSearchMode(mode){return allowedSearchMode(mode)?mode:searchPrefs.exact?'exact':'ai';}
let searchMode=safeSearchMode(searchPrefs.defaultMode),searchQuery='',searchLiteral='',searchSeparate=false,searchRun=null,searchDirty=false,searchResultTab='exact',modelsFromSearch=false;
const searchBlockNames={original:'Оригинал',gloss:'Пословный перевод',translation:'Перевод',comment:'Комментарий'};
const searchCorpus=[...document.querySelectorAll('.book-page [data-block]')].map(el=>({block:el.dataset.block,title:searchBlockNames[el.dataset.block],text:[...el.querySelectorAll('p')].map(p=>{const clone=p.cloneNode(true);clone.querySelectorAll('button').forEach(b=>b.remove());return clone.textContent.trim();}).join(' ')}));
function searchModelOptions(value){return availableModels().map(m=>`<option value="${escapeText(m.id)}" ${m.id===value?'selected':''}>${escapeText(m.name)}</option>`).join('');}
function searchModelLabel(id){return availableModels().find(m=>m.id===id)?.name||featuredModels[0].name;}
function searchScopeLabel(scope,shelf){return scope==='book'?'Бхагавад-гита':scope==='shelf'?(saved.shelves.find(s=>s.id===shelf)?.name||'Полка не выбрана'):'Вся библиотека';}
const beforeSearchSection=showSection;
showSection=function(next,resetPanel=true){beforeSearchSection(next,resetPanel);if(next==='search')renderSearch();};
const beforeSearchDialog=openDialog;
openDialog=function(key){if(key==='search'){openSearch($('.global-search input').value);return;}beforeSearchDialog(key);};
function openSearch(query){if(typeof query==='string')searchQuery=query;showSection('search');if(searchQuery.trim())runSearch();else $('#library-query').focus();}
$('#search-form').onsubmit=e=>{e.preventDefault();openSearch($('.global-search input').value);};
$('.global-search input').placeholder='Точный и ИИ-поиск по библиотеке';
$('.global-search').insertAdjacentHTML('beforeend','<button type="submit" class="global-search-submit" aria-label="Открыть поиск">'+icon('forward')+'</button>');
$('.app-header').insertAdjacentHTML('beforeend','<button id="mobile-global-search" class="icon-button" aria-label="Поиск по библиотеке">'+icon('search')+'</button>');
$('#mobile-global-search').onclick=()=>openSearch();
const searchRail=document.createElement('button');searchRail.className='rail-item';searchRail.id='search-section-button';searchRail.setAttribute('aria-label','Поиск');searchRail.dataset.tip='Поиск';searchRail.innerHTML=icon('search');$('.rail hr').before(searchRail);searchRail.onclick=()=>openSearch();
const beforeSearchNavigation=syncNavigation;
syncNavigation=function(){beforeSearchNavigation();if(section==='search'){searchRail.classList.add('active');searchRail.setAttribute('aria-current','page');const b=$('[data-mobile="more"]');b.classList.add('active');b.setAttribute('aria-current','page');}else{searchRail.classList.remove('active');searchRail.removeAttribute('aria-current');}};
document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();e.stopImmediatePropagation();openSearch();$('#library-query').focus();}},true);
const beforeSearchMore=openMore;
openMore=function(){beforeSearchMore();$('.mobile-menu').insertAdjacentHTML('afterbegin','<button id="mobile-search-entry">'+icon('search')+'<span><strong>Поиск</strong><small>Точные совпадения и AI</small></span>'+icon('right')+'</button>');$('#mobile-search-entry').onclick=()=>{$('#dialog').close();openSearch();};drawIcons($('#mobile-search-entry'));};
function dirtySearch(){searchDirty=!!searchRun;const b=$('#search-dirty');if(b)b.hidden=!searchDirty;}
function saveSearchPrefs(){saved.searchPreferences={...searchPrefs,blocks:[...searchPrefs.blocks]};persist();}
function captureSearchInput(){if($('#library-query'))searchQuery=$('#library-query').value;if($('#literal-query'))searchLiteral=$('#literal-query').value;}
function renderSearch(){
  $('#workspace-panel').innerHTML=`<div class="search-page"><div class="search-page-heading"><div><span class="overline">БИБЛИОТЕКА</span><h1>Поиск</h1></div><button class="outline-button" id="search-settings">${icon('settings')}Настройки поиска</button></div><form id="library-search-form"><label for="library-query" class="sr-only">Поисковый запрос</label><div class="library-query-row">${icon('search')}<input id="library-query" type="search" maxlength="500" placeholder="Слово, точная фраза или вопрос…" value="${escapeText(searchQuery)}" required><button class="gold-button" type="submit">Найти ${icon('forward')}</button></div><div class="search-mode-row"><div class="search-mode-checks" role="group" aria-label="Способы поиска">${[['exact','Точный поиск'],['ai','ИИ-поиск']].map(([id,name])=>`<label><input type="checkbox" data-search-mode="${id}" ${searchMode===id||searchMode==='both'?'checked':''}>${name}</label>`).join('')}</div><label class="search-scope-label"><span>Где искать</span><select id="search-scope"><option value="all" ${searchPrefs.scope==='all'?'selected':''}>Вся библиотека</option><option value="book" ${searchPrefs.scope==='book'?'selected':''}>Открытая книга</option><option value="shelf" ${searchPrefs.scope==='shelf'?'selected':''}>Моя полка</option></select></label></div><p class="search-mode-description">${searchMode==='exact'?'Ищет буквальное совпадение. Результаты — фрагменты книги с подсветкой.':searchMode==='ai'?'Вопрос своими словами. Ответ AI и источники показаны отдельно от цитат.':'Один запуск — точные совпадения и AI-ответ. Результаты не смешиваются.'}</p><div class="search-extra"><label id="shelf-search-label" ${searchPrefs.scope==='shelf'?'':'hidden'}>Полка<select id="search-shelf"><option value="">Выберите полку</option>${saved.shelves.map(s=>`<option value="${escapeText(s.id)}" ${s.id===searchPrefs.shelf?'selected':''}>${escapeText(s.name)}</option>`).join('')}</select></label>${searchMode!=='ai'?`<label>Совпадение<select id="search-match"><option value="phrase" ${searchPrefs.match==='phrase'?'selected':''}>Точная фраза</option><option value="all" ${searchPrefs.match==='all'?'selected':''}>Все слова</option><option value="any" ${searchPrefs.match==='any'?'selected':''}>Любое слово</option></select></label>`:''}${searchMode!=='exact'?`<label>Модель для AI<select id="search-ai-model">${searchModelOptions(searchPrefs.model)}</select></label><button type="button" class="text-button" id="search-manage-models">Мои модели ${icon('right')}</button>`:''}</div>${searchMode==='both'?`<label class="separate-exact"><input type="checkbox" id="separate-exact" ${searchSeparate?'checked':''}>Указать отдельную фразу для точного поиска</label><label class="literal-query-label" ${searchSeparate?'':'hidden'} for="literal-query">Точная фраза<input id="literal-query" maxlength="500" placeholder="Например, привязанности" value="${escapeText(searchLiteral)}"></label>`:''}</form><p class="search-demo-hint">В макете поиск по тексту работает на БГ 2.47. AI-ответы демонстрационные.</p><div id="search-dirty" role="status" ${searchDirty?'':'hidden'}>Запрос или настройки изменены. Нажмите «Найти», чтобы обновить результаты.</div><div id="search-results"></div></div>`;
  $('#search-settings').onclick=openSearchSettings;
  $('#library-search-form').onsubmit=e=>{e.preventDefault();captureSearchInput();runSearch();};
  $('#library-query').oninput=()=>{searchQuery=$('#library-query').value;dirtySearch();};
  document.querySelectorAll('[data-search-mode]').forEach(b=>b.onchange=()=>{captureSearchInput();const selected=[...document.querySelectorAll('[data-search-mode]:checked')];if(!selected.length){b.checked=true;toast('Выберите хотя бы один способ поиска.');return;}searchMode=selected.length===2?'both':selected[0].dataset.searchMode;searchPrefs.defaultMode=searchMode;saveSearchPrefs();dirtySearch();renderSearch();$('[data-search-mode="'+b.dataset.searchMode+'"]').focus();});
  $('#search-scope').onchange=e=>{captureSearchInput();searchPrefs.scope=e.target.value;saveSearchPrefs();dirtySearch();renderSearch();};
  $('#search-shelf').onchange=e=>{searchPrefs.shelf=e.target.value;saveSearchPrefs();dirtySearch();};
  if($('#search-match'))$('#search-match').onchange=e=>{searchPrefs.match=e.target.value;saveSearchPrefs();dirtySearch();};
  if($('#search-ai-model'))$('#search-ai-model').onchange=e=>{searchPrefs.model=e.target.value;saveSearchPrefs();dirtySearch();};
  if($('#separate-exact'))$('#separate-exact').onchange=e=>{searchSeparate=e.target.checked;$('.literal-query-label').hidden=!searchSeparate;$('#literal-query').required=searchSeparate;dirtySearch();if(searchSeparate)$('#literal-query').focus();};
  if($('#literal-query')){$('#literal-query').required=searchSeparate;$('#literal-query').oninput=()=>{searchLiteral=$('#literal-query').value;dirtySearch();};}
  if($('#search-manage-models'))$('#search-manage-models').onclick=()=>{captureSearchInput();modelsFromSearch=true;openModels();};
  renderSearchResults();drawIcons($('#workspace-panel'));syncNavigation();
}
function searchTerms(query,match){return match==='phrase'?[query.trim()]:query.trim().split(/\s+/).filter(Boolean);}
function matchedSearchRows(run){
  if(run.scope==='shelf'&&!saved.shelves.find(s=>s.id===run.shelf)?.books.includes(BOOK))return [];
  const terms=searchTerms(run.literal,run.match).map(t=>t.toLocaleLowerCase('ru'));
  return searchCorpus.filter(row=>run.blocks.includes(row.block)&&terms.length&&(run.match==='any'?terms.some(t=>row.text.toLocaleLowerCase('ru').includes(t)):terms.every(t=>row.text.toLocaleLowerCase('ru').includes(t))));
}
function highlightSearch(text,terms){
  const lower=text.toLocaleLowerCase('ru'),ranges=[];
  terms.filter(Boolean).forEach(term=>{let at=0;const q=term.toLocaleLowerCase('ru');while((at=lower.indexOf(q,at))>=0){ranges.push([at,at+q.length]);at+=q.length;}});
  ranges.sort((a,b)=>a[0]-b[0]);const merged=[];ranges.forEach(r=>{const last=merged.at(-1);if(last&&r[0]<=last[1])last[1]=Math.max(last[1],r[1]);else merged.push(r);});
  let at=0,html='';for(const [a,b] of merged){html+=escapeText(text.slice(at,a))+'<mark>'+escapeText(text.slice(a,b))+'</mark>';at=b;}return html+escapeText(text.slice(at));
}
function runSearch(){
  captureSearchInput();if(!searchQuery.trim()){$('#library-query').focus();return;}
  if(searchMode==='both'&&searchSeparate&&!searchLiteral.trim()){$('#literal-query').focus();return;}
  if(searchPrefs.scope==='shelf'&&!searchPrefs.shelf){$('#search-shelf').focus();toast('Выберите полку для поиска.');return;}
  searchMode=safeSearchMode(searchMode);searchRun={...searchPrefs,blocks:[...searchPrefs.blocks],query:searchQuery.trim(),literal:searchMode==='both'&&searchSeparate?searchLiteral.trim():searchQuery.trim(),mode:searchMode};
  searchDirty=false;searchResultTab=searchMode==='ai'?'ai':'exact';$('#search-dirty').hidden=true;$('.global-search input').value=searchQuery;renderSearchResults();if(innerWidth<=700)$('#search-results').scrollIntoView({block:'start'});
}
function exactResultMarkup(run,rows){
  return `<section class="exact-results result-pane"><div class="result-heading"><h2>${icon('search')}Точные совпадения</h2><span>${rows.length}</span></div><p class="result-description">«${escapeText(run.literal)}» · ${run.match==='phrase'?'точная фраза':run.match==='all'?'все слова':'любое слово'}</p>${rows.length?rows.map(row=>`<article class="exact-result"><div class="result-location"><span>Бхагавад-гита · 2.47</span><small>${row.title}</small></div><p>${highlightSearch(row.text,searchTerms(run.literal,run.match))}</p><button class="result-open" data-search-source="${row.block}">Открыть место ${icon('forward')}</button></article>`).join(''):'<div class="search-empty"><h3>Точных совпадений нет</h3><p>Попробуйте короткую фразу или другой способ совпадения. Это не меняет результат ИИ-поиска.</p></div>'}</section>`;
}
function aiResultMarkup(run){
  const hasBook=run.scope!=='shelf'||saved.shelves.find(s=>s.id===run.shelf)?.books.includes(BOOK);
  const available=searchCorpus.filter(row=>hasBook&&run.blocks.includes(row.block));
  const supported=/действ|привязан|плод|карм|karma|прав|результат/i.test(run.query)&&available.some(r=>r.block==='comment'||r.block==='translation');
  return `<section class="ai-search-results result-pane"><div class="result-heading"><h2>${icon('spark')}ИИ-поиск</h2><span>Демо</span></div><p class="result-description">${escapeText(searchModelLabel(run.model))} · «${escapeText(run.query)}»</p>${supported?`<div class="ai-search-answer"><span class="answer-label">ПРИМЕР ОБОБЩЕНИЯ</span><h3>Действовать, не привязываясь к результату</h3><p>В показанном фрагменте действие связано с отношением к его плодам. Отказ от привязанности не равнозначен бездействию.</p><p class="answer-caption">Демонстрационный ответ по выбранным источникам, не прямая цитата.</p><h4>Источники</h4>${available.filter(r=>['comment','translation'].includes(r.block)).map((row,i)=>`<button class="ai-search-source" data-search-source="${row.block}"><b>${i+1}</b><span>Бхагавад-гита · 2.47<small>${row.title}</small></span>${icon('forward')}</button>`).join('')}<button class="outline-button" id="discuss-search">${icon('spark')}Обсудить в чате</button></div>`:`<div class="search-empty"><h3>Недостаточно источников для ответа</h3><p>В демонстрационном наборе показан один стих. Попробуйте вопрос о действии и привязанности или измените область поиска.</p></div>`}<p class="ai-search-disclaimer">Модель не вызывается. Этот блок показывает оформление AI-выдачи.</p></section>`;
}
function renderSearchResults(){
  const root=$('#search-results');if(!root)return;
  if(!searchRun){root.innerHTML='<div class="search-start"><div class="assistant-mark">'+icon('search')+'</div><h2>Найдите место или разберитесь в теме</h2><p>Точный поиск покажет слова в тексте. AI поможет сопоставить смысл и источники.</p><div class="search-examples"><button data-search-example="действие">действие</button><button data-search-example="Что значит действовать без привязанности?">Что значит действовать без привязанности?</button></div></div>';root.querySelectorAll('[data-search-example]').forEach(b=>b.onclick=()=>{searchQuery=b.dataset.searchExample;$('#library-query').value=searchQuery;runSearch();});drawIcons(root);return;}
  const run=searchRun,rows=matchedSearchRows(run);
  root.innerHTML=`<div class="search-results-summary"><span>Результаты · ${escapeText(searchScopeLabel(run.scope,run.shelf))}</span><span>${searchModes[run.mode]}</span><button id="edit-search-query">Изменить запрос</button></div>${run.mode==='both'?`<div class="search-result-tabs" role="group" aria-label="Результаты совместного поиска"><button data-result-tab="exact" aria-pressed="${searchResultTab==='exact'}">Совпадения <span>${rows.length}</span></button><button data-result-tab="ai" aria-pressed="${searchResultTab==='ai'}">AI-ответ</button></div>`:''}<div class="search-results-grid ${run.mode==='both'?'combined-results':''}" data-result-tab="${searchResultTab}">${run.mode!=='ai'?exactResultMarkup(run,rows):''}${run.mode!=='exact'?aiResultMarkup(run):''}</div>`;
  $('#edit-search-query').onclick=()=>{$('#workspace-panel').scrollTop=0;$('#library-query').focus({preventScroll:true});};
  root.querySelectorAll('button[data-result-tab]').forEach(b=>b.onclick=()=>{searchResultTab=b.dataset.resultTab;renderSearchResults();});
  root.querySelectorAll('[data-search-source]').forEach(b=>b.onclick=()=>{showSection('read');const block=$('[data-block="'+b.dataset.searchSource+'"]');if(block.hidden){block.hidden=false;toast('Раздел текста показан для просмотра результата.');}block.scrollIntoView({block:'center'});document.querySelectorAll('.back-to-search').forEach(x=>x.remove());$('.book-scroll').insertAdjacentHTML('afterbegin','<button class="back-to-search" id="back-to-search">'+icon('back')+'К результатам поиска</button>');$('#back-to-search').onclick=()=>{document.querySelectorAll('.back-to-search').forEach(x=>x.remove());showSection('search');};drawIcons($('.book-scroll'));});
  if($('#discuss-search'))$('#discuss-search').onclick=()=>{openTool('ai','page');if(!$('#ai-question').value.trim()){$('#ai-question').value=run.query;$('#ai-question').dispatchEvent(new Event('input',{bubbles:true}));}toast('Источники открыты в контексте БГ 2.47. Вопрос можно отправить в чат.');};
  drawIcons(root);
}
function openSearchSettings(){
  captureSearchInput();
  simpleDialog('Настройки поиска',`<form id="search-preferences-form"><p>Способы поиска выбираются чекбоксами рядом с запросом. Ваш выбор сохраняется.</p><fieldset class="search-pref-blocks"><legend>Искать в разделах текста</legend>${Object.entries(searchBlockNames).map(([id,name])=>`<label><span>${name}</span><input type="checkbox" data-search-block="${id}" ${searchPrefs.blocks.includes(id)?'checked':''}></label>`).join('')}</fieldset><p id="search-pref-error" role="alert" hidden></p><div class="editor-actions"><button type="button" id="cancel-search-prefs">Отмена</button><button class="gold-button" type="submit">Применить</button></div></form>`);
  $('#cancel-search-prefs').onclick=()=>$('#dialog').close();
  $('#search-preferences-form').onsubmit=e=>{e.preventDefault();const blocks=[...document.querySelectorAll('[data-search-block]:checked')].map(x=>x.dataset.searchBlock);if(!blocks.length){$('#search-pref-error').hidden=false;$('#search-pref-error').textContent='Выберите хотя бы один раздел текста.';return;}searchPrefs.blocks=blocks;saveSearchPrefs();dirtySearch();$('#dialog').close();renderSearch();};
}
const beforeSearchModels=renderModels;
renderModels=function(){beforeSearchModels();if(modelsFromSearch){$('#workspace-back').innerHTML=icon('back')+'К поиску';$('#workspace-back').onclick=()=>{modelsFromSearch=false;showSection('search');};drawIcons($('#workspace-back'));}};
const beforeSearchOpenModels=openModels;
openModels=function(add=false){modelsFromSearch=section==='search';beforeSearchOpenModels(add);};
drawIcons(searchRail);drawIcons($('#mobile-global-search'));drawIcons($('.global-search-submit'));
if(new URLSearchParams(location.search).get('section')==='search')openSearch(new URLSearchParams(location.search).get('q')||'');
