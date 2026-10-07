// One search workspace; sources and search methods are independent choices.
(() => {
 const sourceNames={books:'Книги',dictionaries:'Словари',word:'Пословник'};
 Object.assign(defaultSearchPrefs,{sources:['books'],dictionaryCategory:'all',wordField:'both'});
 function normalize(){
  searchPrefs.sources=Array.isArray(searchPrefs.sources)?searchPrefs.sources.filter(s=>sourceNames[s]):['books'];
  if(!searchPrefs.sources.length)searchPrefs.sources=['books'];
  searchPrefs.dictionaryCategory||='all';searchPrefs.wordField||='both';
 }
 normalize();
 const glossary=[
  {id:'karmani',word:'karmaṇi',aliases:'karmani कर्मणि кармани',translation:'в действии',verse:47},
  {id:'adhikara',word:'adhikāraḥ',aliases:'adhikarah अधिकारः адхикарах',translation:'право',verse:47},
  {id:'phalesu',word:'phaleṣu',aliases:'phalesu फलेषु пхалешу',translation:'к плодам',verse:47},
  {id:'kadacana',word:'kadācana',aliases:'kadacana कदाचन кадачана',translation:'когда-либо',verse:47}
 ];
 const fold=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('ru');
 function matches(text,query,match){const terms=searchTerms(query,match).map(fold).filter(Boolean),value=fold(text);return terms.length&&(match==='any'?terms.some(t=>value.includes(t)):terms.every(t=>value.includes(t)));}
 const sourcesOf=run=>run.sources?.length?run.sources:['books'];
 const hasTexts=run=>sourcesOf(run).some(s=>s==='books'||s==='word');
 const scopeHasBook=run=>run.scope!=='shelf'||saved.shelves.find(s=>s.id===run.shelf)?.books.includes(BOOK);
 function dictionaryRows(run){return refEntries.filter(e=>run.dictionaryCategory==='all'||!run.dictionaryCategory||e.category===run.dictionaryCategory).map(e=>({source:'dictionaries',id:e.id,title:e.title,text:e.definition+' '+e.body,search:e.title+' '+e.original+' '+e.definition+' '+e.body,entry:e}));}
 function wordRows(run){return scopeHasBook(run)?glossary.map(e=>({source:'word',id:e.id,title:e.word,text:e.translation,search:run.wordField==='word'?e.word+' '+e.aliases:run.wordField==='translation'?e.translation:e.word+' '+e.aliases+' '+e.translation,entry:e})):[];}
 const originalMatches=matchedSearchRows;
 matchedSearchRows=function(run){
  const list=[];
  if(sourcesOf(run).includes('books'))list.push(...originalMatches(run).map(r=>({...r,source:'books'})));
  if(sourcesOf(run).includes('dictionaries'))list.push(...dictionaryRows(run).filter(r=>matches(r.search,run.literal,run.match)));
  if(sourcesOf(run).includes('word'))list.push(...wordRows(run).filter(r=>matches(r.search,run.literal,run.match)));
  return list;
 };
 function settingsMarkup(){return `<div class="unified-source-filters">${searchPrefs.sources.includes('dictionaries')?`<label>Категория словаря<select id="dictionary-category"><option value="all">Все категории</option><option value="terms">Термины</option><option value="people">Личности</option><option value="places">Места</option></select></label>`:''}${searchPrefs.sources.includes('word')?`<label>В пословнике искать<select id="word-search-field"><option value="both">Слово и перевод</option><option value="word">Санскритское слово</option><option value="translation">Перевод слова</option></select></label>`:''}</div>`;}
 const originalRender=renderSearch;
 renderSearch=function(){
  normalize();originalRender();
  const form=$('#library-search-form');
  $('.library-query-row').insertAdjacentHTML('afterend',`<fieldset class="unified-search-sources"><legend>Источники поиска</legend><div>${Object.entries(sourceNames).map(([id,name])=>`<label><input type="checkbox" data-search-source-kind="${id}" ${searchPrefs.sources.includes(id)?'checked':''}>${name}</label>`).join('')}</div><p>Выберите один или несколько источников.</p></fieldset>`);
  form.insertAdjacentHTML('beforeend',settingsMarkup());
  if($('#dictionary-category'))$('#dictionary-category').value=searchPrefs.dictionaryCategory;
  if($('#word-search-field'))$('#word-search-field').value=searchPrefs.wordField;
  const textSources=hasTexts(searchPrefs);
  $('.search-scope-label').hidden=!textSources;
  $('#shelf-search-label').hidden=!textSources||searchPrefs.scope!=='shelf';
  $('.search-scope-label>span').textContent='Книги для поиска';
  $('#search-scope option[value=all]').textContent='Все книги';
  $('#library-query').placeholder=searchPrefs.sources.length===1&&searchPrefs.sources[0]==='word'?'Санскритское слово или его перевод…':searchPrefs.sources.length===1&&searchPrefs.sources[0]==='dictionaries'?'Термин, имя, место или вопрос…':'Слово, фраза или вопрос…';
  $('.search-demo-hint').textContent='Пример библиотеки: БГ 2.47, словарные статьи и пословный перевод. ИИ-поиск демонстрационный.';
  document.querySelectorAll('[data-search-source-kind]').forEach(b=>b.onchange=()=>{
   captureSearchInput();const selected=[...document.querySelectorAll('[data-search-source-kind]:checked')].map(x=>x.dataset.searchSourceKind);
   if(!selected.length){b.checked=true;toast('Выберите хотя бы один источник.');return;}
   searchPrefs.sources=selected;saveSearchPrefs();dirtySearch();renderSearch();$('[data-search-source-kind="'+b.dataset.searchSourceKind+'"]').focus({preventScroll:true});
  });
  for(const [id,key]of [['dictionary-category','dictionaryCategory'],['word-search-field','wordField']])if($('#'+id))$('#'+id).onchange=e=>{captureSearchInput();searchPrefs[key]=e.target.value;saveSearchPrefs();dirtySearch();};
  // Keep primary choices together and all source-specific filters in one compact row.
  const choices=document.createElement('div');choices.className='unified-search-selection';
  const sourceField=$('.unified-search-sources'),methods=$('.search-mode-row'),filters=$('.search-extra');
  sourceField.before(choices);choices.append(sourceField,methods);
  sourceField.querySelector('p').className='sr-only';
  methods.insertAdjacentHTML('afterbegin','<span class="unified-search-legend">Способ поиска</span>');
  const scope=$('.search-scope-label');filters.prepend(scope);
  $('.unified-source-filters').querySelectorAll('label').forEach(label=>filters.append(label));
  $('.unified-source-filters').remove();
  if($('#search-ai-model')){
   const modelLabel=$('#search-ai-model').closest('label'),modelGroup=document.createElement('div');modelGroup.className='unified-model-option';
   filters.append(modelGroup);modelGroup.append(modelLabel,$('#search-manage-models'));
   $('#search-manage-models').innerHTML=icon('settings');$('#search-manage-models').setAttribute('aria-label','Подключить и настроить модели');$('#search-manage-models').title='Мои модели';
  }
  $('.search-mode-description').textContent=searchMode==='exact'?'Точные совпадения в выбранных источниках.':searchMode==='ai'?'Ответ на вопрос со ссылками на выбранные источники.':'Точные совпадения и ИИ-ответ показаны отдельно.';
  drawIcons(form);window.vedaSelects?.enhance?.(form);
 };
 runSearch=function(){
  captureSearchInput();normalize();if(!searchQuery.trim()){$('#library-query').focus();return;}
  if(searchMode==='both'&&searchSeparate&&!searchLiteral.trim()){$('#literal-query').focus();return;}
  if(hasTexts(searchPrefs)&&searchPrefs.scope==='shelf'&&!searchPrefs.shelf){$('#search-shelf').focus();toast('Выберите полку для поиска.');return;}
  searchMode=safeSearchMode(searchMode);
  searchRun={...searchPrefs,sources:[...searchPrefs.sources],blocks:[...searchPrefs.blocks],query:searchQuery.trim(),literal:searchMode==='both'&&searchSeparate?searchLiteral.trim():searchQuery.trim(),mode:searchMode};
  searchDirty=false;searchResultTab=searchMode==='ai'?'ai':'exact';$('#search-dirty').hidden=true;$('.global-search input').value=searchQuery;renderSearchResults();
 };
 function rowMarkup(row,run,ai=false){
  if(row.source==='books')return `<article class="exact-result"><div class="result-location"><span>Бхагавад-гита · 2.47</span><small>${row.title}</small></div><p>${highlightSearch(row.text,ai?[]:searchTerms(run.literal,run.match))}</p><button class="result-open" data-search-source="${row.block}">Открыть место ${icon('forward')}</button></article>`;
  if(row.source==='dictionaries')return `<article class="exact-result dictionary-search-result"><div class="result-location"><strong>${highlightSearch(row.title,ai?[]:searchTerms(run.literal,run.match))}</strong><small>${{terms:'Термин',people:'Личность',places:'Место'}[row.entry.category]}</small></div><p class="dictionary-original">${escapeText(row.entry.original)}</p><p>${highlightSearch(row.entry.definition,ai?[]:searchTerms(run.literal,run.match))}</p><button class="result-open" data-dictionary-result="${row.id}">Открыть статью ${icon('forward')}</button></article>`;
  return `<article class="exact-result word-search-result"><div class="result-location"><strong lang="sa-Latn">${highlightSearch(row.title,ai?[]:searchTerms(run.literal,run.match))}</strong><small>Пословный перевод</small></div><p>${highlightSearch(row.text,ai?[]:searchTerms(run.literal,run.match))}</p><button class="result-open" data-word-result="${row.id}">Бхагавад-гита · 2.${row.entry.verse} ${icon('forward')}</button></article>`;
 }
 exactResultMarkup=function(run,rows){return `<section class="exact-results result-pane"><div class="result-heading"><h2>${icon('search')}Точные совпадения</h2><span>${rows.length}</span></div><p class="result-description">«${escapeText(run.literal)}» · ${run.match==='phrase'?'точная фраза':run.match==='all'?'все слова':'любое слово'}</p>${sourcesOf(run).map(s=>{const group=rows.filter(r=>r.source===s);return `<section class="unified-result-group" data-result-source="${s}"><h3>${sourceNames[s]}<small>${group.length}</small></h3>${group.length?group.map(row=>rowMarkup(row,run)).join(''):'<p class="unified-no-results">Совпадений нет. Попробуйте другой запрос или настройки.</p>'}</section>`;}).join('')}</section>`;};
 aiResultMarkup=function(run){
  const candidates=[];
  if(sourcesOf(run).includes('books')&&scopeHasBook(run))candidates.push(...searchCorpus.filter(r=>run.blocks.includes(r.block)&&['translation','comment'].includes(r.block)).map(r=>({...r,source:'books',search:r.text})));
  if(sourcesOf(run).includes('dictionaries'))candidates.push(...dictionaryRows(run));
  if(sourcesOf(run).includes('word'))candidates.push(...wordRows(run));
  const terms=fold(run.query).split(/\s+/).filter(t=>t.length>3).map(t=>t.replace(/[?.,!]/g,''));
  const rows=candidates.filter(r=>terms.some(t=>fold(r.search).includes(t)||(/карм|karma|действ/.test(t)&&/карм|karma|действ/.test(fold(r.search))))).slice(0,4);
  return `<section class="ai-search-results result-pane"><div class="result-heading"><h2>${icon('spark')}ИИ-поиск</h2><span>Демо</span></div><p class="result-description">${escapeText(searchModelLabel(run.model))} · ${sourcesOf(run).map(s=>sourceNames[s]).join(', ')}</p>${rows.length?`<div class="ai-search-answer"><span class="answer-label">ПРИМЕР ВЫДАЧИ</span><h3>Связанные источники</h3><p>Здесь будет ответ на вопрос «${escapeText(run.query)}» с опорой на выбранные источники.</p>${rows.map(row=>`<div class="unified-ai-source"><span class="unified-source-tag">${sourceNames[row.source]}</span>${rowMarkup(row,run,true)}</div>`).join('')}<button id="discuss-search" class="outline-button">${icon('spark')}Обсудить в чате</button></div>`:'<div class="search-empty"><h3>Связанные источники не найдены</h3><p>Попробуйте другой запрос или включите дополнительные источники.</p></div>'}<p class="ai-search-disclaimer">Пример оформления выдачи. Модель не вызывается.</p></section>`;
 };
 function backLink(){document.querySelectorAll('.back-to-search').forEach(e=>e.remove());$('.book-scroll').insertAdjacentHTML('afterbegin','<button class="back-to-search" id="back-to-search">'+icon('back')+'К результатам поиска</button>');$('#back-to-search').onclick=()=>{document.querySelectorAll('.back-to-search').forEach(e=>e.remove());showSection('search');};drawIcons($('#back-to-search'));}
 function openVerse(n,block='gloss'){showSection('read');const el=$('#reader-verse-'+n+' [data-block="'+block+'"]');if(el)el.hidden=false;backLink();readerJump(n);requestAnimationFrame(()=>readerJump(n));}
 function openArticle(id){const e=refEntries.find(e=>e.id===id);if(!e)return;
  simpleDialog(e.title,`<article class="unified-dictionary-article"><p class="dictionary-original">${escapeText(e.original)}</p><h3>${escapeText(e.definition)}</h3><p>${escapeText(e.body)}</p>${e.link?'<button id="dictionary-book-source" class="outline-button">'+icon('book')+'Бхагавад-гита · 2.47</button>':''}</article>`);
  if($('#dictionary-book-source'))$('#dictionary-book-source').onclick=()=>{$('#dialog').close();openVerse(47,'translation');};
 }
 const originalResults=renderSearchResults;
 renderSearchResults=function(){
  originalResults();const root=$('#search-results');
  if(!searchRun){root.innerHTML=`<div class="search-start"><h2>Один поиск по всей библиотеке</h2><p>Находите тексты в книгах, значения в словарях и слова в пословнике.</p><div class="search-examples">${(searchPrefs.sources.length===1&&searchPrefs.sources[0]==='word'?['karmaṇi','в действии']:['карма','действие']).map(q=>`<button data-unified-example="${escapeText(q)}">${escapeText(q)}</button>`).join('')}</div></div>`;root.querySelectorAll('[data-unified-example]').forEach(b=>b.onclick=()=>{searchQuery=b.dataset.unifiedExample;$('#library-query').value=searchQuery;runSearch();});}
  else{const run=searchRun;$('.search-results-summary>span:first-child').textContent='Результаты · '+sourcesOf(run).map(s=>sourceNames[s]).join(', ')+(hasTexts(run)?' · '+searchScopeLabel(run.scope,run.shelf):'');}
  root.querySelectorAll('[data-dictionary-result]').forEach(b=>b.onclick=()=>openArticle(b.dataset.dictionaryResult));
  root.querySelectorAll('[data-word-result]').forEach(b=>b.onclick=()=>openVerse(glossary.find(e=>e.id===b.dataset.wordResult).verse));
  if($('#discuss-search'))$('#discuss-search').onclick=()=>{const query=searchRun.query;openTool('ai','page');question.value=query;updateQuestion();fitChatInput();};
  drawIcons(root);
 };
 const originalSettings=openSearchSettings;
 openSearchSettings=function(){
  normalize();originalSettings();const p=$('#search-preferences-form');
  p.querySelector('p').textContent='Настройки выбранных источников. Они сохраняются вместе с поиском в этой вкладке.';
  $('.search-pref-blocks').hidden=!searchPrefs.sources.includes('books');
  p.querySelector('.editor-actions').insertAdjacentHTML('beforebegin',settingsMarkup().replaceAll('dictionary-category','pref-dictionary-category').replaceAll('word-search-field','pref-word-search-field'));
  if($('#pref-dictionary-category'))$('#pref-dictionary-category').value=searchPrefs.dictionaryCategory;
  if($('#pref-word-search-field'))$('#pref-word-search-field').value=searchPrefs.wordField;
  const submit=p.onsubmit;p.onsubmit=e=>{if(!p.querySelector('[data-search-block]:checked')){submit(e);return;}if($('#pref-dictionary-category'))searchPrefs.dictionaryCategory=$('#pref-dictionary-category').value;if($('#pref-word-search-field'))searchPrefs.wordField=$('#pref-word-search-field').value;submit(e);};
 };
 const previousShow=showSection;
 showSection=function(next,resetPanel=true){
  if(next==='references'){normalize();searchPrefs.sources=['dictionaries'];searchPrefs.dictionaryCategory='all';searchQuery='';searchRun=null;searchDirty=false;saveSearchPrefs();next='search';}
  previousShow(next,resetPanel);
  if(next==='new'){const b=$('[data-start-section=references]');if(b){b.querySelector('strong').textContent='Словари';b.querySelector('small').textContent='Поиск терминов, имён и мест';}}
 };
 $('#references-button').hidden=true;
 $('.global-search input').placeholder='Поиск по книгам, словарям и пословнику';
 $('.global-search input').setAttribute('aria-label','Общий поиск по библиотеке');
 const previousMore=openMore;openMore=function(){previousMore();const b=$('[data-menu=references]');if(b)b.hidden=true;};
 const requested=new URLSearchParams(location.search).get('sources');
 if(requested){const choices=requested.split(',').filter(s=>sourceNames[s]);if(choices.length){searchPrefs.sources=choices;searchRun=null;searchDirty=false;}}
 if(section==='references')showSection('references');else if(section==='search')renderSearch();
})();
