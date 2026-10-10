// Catalogue search scope, dense tab strips, and short compositor-only panel motion.
(() => {
 const sectionNames={shelves:'Полки',bookmarks:'Закладки',notes:'Заметки'};
 const sectionDescriptions={shelves:'Подборки книг для чтения и изучения.',bookmarks:'Сохранённые места в книгах.',notes:'Ваши мысли и выделения из текста.'};
 const beforeLibrary=renderSaved;
 renderSaved=function(query=''){
  beforeLibrary(query);
  if(section!=='saved')return;
  const heading=$('#workspace-panel .workspace-heading');
  if(heading&&!activeShelf){heading.querySelector('h1').textContent=sectionNames[savedTab];heading.querySelector('p').textContent=sectionDescriptions[savedTab];}
  $('#workspace-panel .workspace-controls .segmented')?.remove();
  $('#workspace-panel').classList.add('standalone-saved');
  if(savedTab==='shelves'&&!activeShelf){
   const filter=document.createElement('label');filter.className='search-box standalone-shelf-search';filter.innerHTML=icon('search')+'<input id="bookmark-search" type="search" aria-label="Найти полку" placeholder="Найти полку…">';$('#workspace-panel .workspace-controls').after(filter);
   const input=filter.querySelector('input');input.value=query;
   const apply=()=>{let count=0;$('#workspace-panel').querySelectorAll('.shelf-tile').forEach(tile=>{tile.hidden=!tile.textContent.toLocaleLowerCase('ru').includes(input.value.toLocaleLowerCase('ru'));if(!tile.hidden)count++;});let empty=$('#shelf-no-results');if(!empty){empty=document.createElement('p');empty.id='shelf-no-results';empty.textContent='Полки не найдены.';$('#workspace-panel .shelves-grid').after(empty);}empty.hidden=!!count;};input.oninput=apply;apply();drawIcons(filter);
  }
  if(savedTab==='bookmarks'&&$('#bookmark-search'))$('#bookmark-search').placeholder='Найти закладку…';
  if(savedTab==='notes'&&$('#bookmark-search'))$('#bookmark-search').setAttribute('aria-label','Найти заметку');
  if(heading){const actions=document.createElement('div');actions.className='standalone-section-actions';const back=heading.querySelector(':scope>button'),primary=$('#saved-primary');if(back)actions.append(back);if(primary)actions.append(primary);heading.append(actions);$('#workspace-panel .workspace-controls')?.remove();}
  drawIcons($('#workspace-panel'));
 };
 const beforeSection=showSection;
 showSection=function(next,resetPanel=true){$('#workspace-panel').classList.remove('standalone-saved');if(next!=='read')document.body.classList.remove('focus-catalog-open');beforeSection(next,resetPanel);if(next==='new'){
  const old=$('[data-start-section=saved]');if(old){old.querySelector('strong').textContent='Полки';old.querySelector('small').textContent='Подборки книг';old.querySelector('.new-tab-symbol').innerHTML=icon('shelf');}
  const shortcuts=$('.new-tab-shortcuts');if(shortcuts){shortcuts.insertAdjacentHTML('beforeend',`<button data-start-saved="bookmarks"><span class="new-tab-symbol">${icon('bookmark')}</span><strong>Закладки</strong><small>Сохранённые места</small>${icon('right')}</button><button data-start-saved="notes"><span class="new-tab-symbol">${icon('note')}</span><strong>Заметки</strong><small>Мысли и выделения</small>${icon('right')}</button>`);shortcuts.querySelectorAll('[data-start-saved]').forEach(b=>b.onclick=()=>{savedTab=b.dataset.startSaved;activeShelf=null;showSection('saved');});if(old)old.onclick=()=>{savedTab='shelves';activeShelf=null;showSection('saved');};drawIcons(shortcuts);}
 }};
 const beforeTool=openTool;openTool=function(next,mode='panel'){if(mode==='page')document.body.classList.remove('focus-catalog-open');beforeTool(next,mode);};
 if(section==='saved')renderSaved($('#bookmark-search')?.value||'');
 const beforeSearch=renderSearch;
 renderSearch=function(){
  searchSeparate=false;searchLiteral='';beforeSearch();
  $('#separate-exact')?.closest('label').remove();$('.literal-query-label')?.remove();
 };
 if(section==='search')renderSearch();
 const beforeDialog=openDialog;
 openDialog=function(key){
  beforeDialog(key);if(key!=='settings')return;
  const preview=$('.settings-preview');if(!preview)return;
  const verse=$('#reader-verse-47');
  const sample=block=>{const paragraph=verse.querySelector('[data-block='+block+'] p')?.cloneNode(true);paragraph?.querySelectorAll('button,.inline-note').forEach(n=>n.remove());return escapeText(paragraph?.textContent||'');};
  preview.innerHTML=`<span>ПРЕДПРОСМОТР · БГ 2.47</span><section class="preview-original"><h3>Санскрит</h3><p lang="sa" class="preview-devanagari">कर्मण्येवाधिकारस्ते मा फलेषु कदाचन ।<br>मा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि ॥</p><h3>Транслитерация</h3><p lang="sa-Latn" class="preview-iast">karmaṇy evādhikāras te mā phaleṣu kadācana<br>mā karma-phala-hetur bhūr mā te saṅgo ’stv akarmaṇi</p></section><section><h3>Пословный перевод</h3><p>${sample('gloss')}</p></section><section><h3>Перевод</h3><p class="preview-translation">${sample('translation')}</p></section><section><h3>Комментарий</h3><p>${sample('comment')}</p></section>`;
 };

 const bar=$('.workspace-tabs');let tabFrame=0;
 function updateTabs(){
  const list=bar.querySelector('.workspace-tab-list');if(!list)return;
  let overview=$('#tab-overview');
  if(!overview){overview=document.createElement('button');overview.id='tab-overview';overview.className='icon-button';overview.setAttribute('aria-label','Список всех вкладок');overview.title='Все вкладки';overview.innerHTML=icon('down');bar.append(overview);drawIcons(overview);
   overview.onclick=()=>{
    const snapshot=window.workspaceTabs.overview();simpleDialog('Открытые вкладки',`<div class="tab-overview-list">${snapshot.tabs.map(t=>`<button data-overview-tab="${t.id}" aria-current="${t.id===snapshot.activeId}">${icon(t.icon)}<span>${escapeText(t.title)}<small>${escapeText(t.detail||t.preview)}</small></span></button>`).join('')}</div>`);
    $('#dialog-body').querySelectorAll('[data-overview-tab]').forEach(b=>b.onclick=()=>{$('#dialog').close();window.workspaceTabs.activate(b.dataset.overviewTab);});drawIcons($('#dialog-body'));
   };
  }
  const count=list.children.length,compressed=count*190>bar.clientWidth-44;
  bar.classList.toggle('is-compressed',compressed);overview.hidden=!compressed;
  bar.style.setProperty('--compact-tab-width',Math.max(118,Math.min(190,(bar.clientWidth-88-48)/count))+'px');
  list.querySelectorAll('.workspace-tab-select').forEach(button=>{
   const label=button.querySelector('span');if(!label)return;
   button.dataset.fullLabel||=label.textContent;
   const full=button.dataset.fullLabel;
   const nextLabel=window.tabLabelMotion?window.tabLabelMotion.display(button,full):compressed?({'Новая вкладка':'Новая','ИИ-помощник':'ИИ','Мои полки':'Полки','Транслитерация':'Транслит.'}[full]||(full==='Бхагавад-гита'?'БГ'+(button.title.match(/Текст (\d+)/)?.[1]?' · 2.'+button.title.match(/Текст (\d+)/)[1]:''):full)):full;
   if(window.tabLabelMotion)window.tabLabelMotion.set(button,nextLabel,false);else label.textContent=nextLabel;
  });
  const max=list.scrollWidth-list.clientWidth;
  list.style.setProperty('--edge-left',list.scrollLeft>2?'22px':'0px');list.style.setProperty('--edge-right',max-list.scrollLeft>2?'22px':'0px');
  list.onscroll=scheduleTabs;
 }
 function scheduleTabs(){if(tabFrame)return;tabFrame=requestAnimationFrame(()=>{tabFrame=0;updateTabs();});}
 document.addEventListener('workspace-tabs-change',()=>{updateTabs();scheduleTabs();});
 new ResizeObserver(scheduleTabs).observe(bar);window.addEventListener('resize',scheduleTabs);updateTabs();

})();
