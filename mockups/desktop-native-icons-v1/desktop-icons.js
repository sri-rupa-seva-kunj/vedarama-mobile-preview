// This variant uses SVG files from the native desktop QML application.
(() => {
 // Keep the order of shared sections from LeftMenu.qml; new tools follow Favorites.
 const rail=$('.rail'),bottom=$('.rail-bottom');
 const langButtons=['Книги на русском','Книги на английском','Книги на санскрите'].map(label=>$('.rail [aria-label="'+label+'"]'));
 const divider=()=>document.createElement('hr');
 const railSettings=document.createElement('button');railSettings.id='rail-settings';railSettings.className='rail-item';railSettings.setAttribute('aria-label','Настройки');railSettings.dataset.tip='Настройки';railSettings.onclick=()=>openDialog('settings');
 bottom.prepend(railSettings);
 const ordered=[...langButtons,divider(),$('#search-section-button'),$('.rail [data-nav=ai]'),$('#references-button'),$('.rail [data-dialog=converter]'),divider(),$('.rail [data-dialog=shelves]'),$('.rail [data-dialog=bookmarks]'),$('.rail [data-view=notes]')];
 const railScroll=document.createElement('div');railScroll.className='rail-scroll';railScroll.setAttribute('aria-label','Разделы библиотеки');
 rail.querySelectorAll(':scope>hr').forEach(el=>el.remove());ordered.forEach(el=>railScroll.append(el));rail.prepend(railScroll);rail.append(bottom);
 $('.global-actions [data-dialog=settings]').classList.add('reading-global-settings');
 let sequence=0;
 const actionPaths={
  'note-new':'M5 2.5h10l4 4V10 M5 2.5V21h7 M15 2.5V7h4 M8 8h4 M8 12h3 M13 17l6-6 3 3-6 6-4 1Z M18 12l3 3',
  plug:'M8 2v5 M16 2v5 M6 7h12v5a6 6 0 0 1-12 0Z M12 18v4',
  edit:'m5 16 11-11 3 3-11 11-4 1Z M14 7l3 3 M4 21h16',
  trash:'M4 6h16 M9 6V3h6v3 M6 6l1 15h10l1-15 M10 10v7 M14 10v7',
  'note-stack':'M5 6h14v15H5Z M8 2.5h14v15 M8 10h8 M8 14h8 M8 18h5',
  'return-book':'M3 4h7l2 2 2-2h7v15h-7l-2 2-2-2H3Z M12 6v15 M17 9l-3 3 3 3 M14 12h6',
  'open-location':'M4 3h11v18H4Z M7 7h5 M7 11h4 M13 15h8 M18 12l3 3-3 3',
  'open-tab':'M8 3h13v13h-4 M8 3v4 M3 8h13v13H3Z M3 12h13 M5.5 10h3',
  'shelf-add':'M3 4v17h18V4 M3 13h18 M7 5v8 M11 5v8 M15 6l3 7 M7 17h10',
  'bookmark-add':'M6 3h12v18l-6-4-6 4Z M9 9h6 M12 6v6',
  'select-all':'M3 4h7v7H3Z m1.5 3 2 2 4-4 M14 5h7 M14 9h7 M3 15h7v7H3Z m1.5 3 2 2 4-4 M14 16h7 M14 20h7',
  reset:'M5 9a8 8 0 1 1-1 7 M5 3v6h6',
  'tab-blank':'M3 4h18v16H3Z M3 8h18 M6 6h3',
  'attach-text':'M5 3h11v5 M5 3v18h8 M8 7h4 M8 11h3 M18 9v9a3 3 0 0 1-6 0v-5a2 2 0 0 1 4 0v5a1 1 0 0 1-2 0v-4',
  send:'M3 4l18 8-18 8 4-8Z M7 12h14'
 };
 function svg(key){let code=desktopIconData[key];if(actionPaths[key])code='<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="'+actionPaths[key]+'" stroke="currentColor" stroke-width="1.2" stroke-linejoin="miter" stroke-linecap="square" vector-effect="non-scaling-stroke"/></svg>';
  if(key==='verse-list')code='<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><g fill="currentColor"><circle cx="5" cy="8" r="1.4"/><circle cx="12" cy="8" r="1.4"/><circle cx="19" cy="8" r="1.4"/><circle cx="5" cy="16" r="1.4"/><circle cx="12" cy="16" r="1.4"/><circle cx="19" cy="16" r="1.4"/></g></svg>';
  if(!code)return '';
  // The document and pencil share the create-note silhouette, optically centred.
  if(key==='note')code='<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g transform="translate(-1.5 .25)"><path d="'+actionPaths['note-new']+'" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linejoin="miter" vector-effect="non-scaling-stroke"/></g></svg>';
  if(key==='readingOff')code='<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.5 4.5h19v15h-19Z M2.5 8h19 M7.5 8v11.5 M10.5 11.5h8 M10.5 15h6" stroke="currentColor" stroke-width="1.2" stroke-linejoin="miter" vector-effect="non-scaling-stroke"/></svg>';
  if(key==='ai')code='<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g stroke="currentColor" stroke-width="1.2" stroke-linecap="butt" stroke-linejoin="miter"><path vector-effect="non-scaling-stroke" d="M3 3h18v14h-8l-6 4v-4H3Z"/><path vector-effect="non-scaling-stroke" d="M6.5 8h8 M9.5 12h8"/></g></svg>';
  if(key==='back'||key==='forward')code='<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="'+(key==='back'?'m15 5-7 7 7 7':'m9 5 7 7-7 7')+'" stroke="currentColor" stroke-width="1.4" stroke-linecap="butt" stroke-linejoin="miter"/></svg>';
  if(key==='down')code='<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="m5 8 7 7 7-7" stroke="currentColor" stroke-width="1.4" stroke-linecap="butt" stroke-linejoin="miter"/></svg>';
  if(key==='globe')code='<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g stroke="currentColor" stroke-width="1.4"><circle cx="12" cy="12" r="8.5"/><ellipse cx="12" cy="12" rx="3.8" ry="8.5"/><path d="M3.5 12h17"/></g></svg>';
  if(key==='search')code='<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g stroke="currentColor" stroke-width="1.1" stroke-linecap="square"><circle cx="10.5" cy="10.5" r="7"/><path d="m15.5 15.5 5.5 5.5"/></g></svg>';
  const boost={ru:.18,ruSelected:.18,en:.18,enSelected:.18,sa:.1,saSelected:.1,reference:.18,referenceSelected:.18,favorites:.18,favoritesSelected:.18,textSettings:.12,book:.12,settings:.1};
  if(boost[key])code=code.replace(/fill="currentColor"/g,'fill="currentColor" stroke="currentColor" stroke-width="'+boost[key]+'" stroke-linejoin="round" vector-effect="non-scaling-stroke"');
  const prefix='desktop-'+(++sequence)+'-';code=code.replace(/id="([^"]+)"/g,(_,id)=>'id="'+prefix+id+'"').replace(/url\(#([^)]+)\)/g,(_,id)=>'url(#'+prefix+id+')');return code.replace('<svg ','<svg class="desktop-app-icon" data-desktop-icon="'+key+'" aria-hidden="true" focusable="false" ');}
 const map={book:'book',search:'search',spark:'ai',bookmark:'favorites',note:'note',settings:'settings',help:'help',globe:'globe',plus:'plus',close:'close',back:'back',forward:'forward',down:'down'};
 function setIcon(el,key){if(!el||el.closest('.desktop-motion-ghost,.desktop-motion-mask'))return;if(el.querySelector(':scope>svg')?.dataset.desktopIcon!==key)el.innerHTML=svg(key);}
 function put(selector,key){setIcon(document.querySelector(selector),key);}
 function compactAi(){
  document.querySelectorAll('.continuous-verse-heading svg[data-desktop-icon=ai],.chapter-navigation svg[data-desktop-icon=ai],.context-actions svg[data-desktop-icon=ai]').forEach(el=>{
   if(el.dataset.compactAi==='true')return;el.dataset.compactAi='true';el.querySelector('g').innerHTML='<path vector-effect="non-scaling-stroke" d="M3 3h18v14h-8l-6 4v-4H3Z"/>';
  });
 }
 function action(selector,key){document.querySelectorAll(selector).forEach(button=>{if(button.closest('.desktop-motion-ghost,.desktop-motion-mask'))return;const mark=button.querySelector('i,svg');if(mark?.tagName.toLowerCase()==='i')setIcon(mark,key);else if(mark){if(mark.dataset.desktopIcon!==key)mark.outerHTML=svg(key);}else button.insertAdjacentHTML('afterbegin',svg(key));});}
 function decorate(){
  document.querySelectorAll('i[data-icon]').forEach(el=>{const key=map[el.dataset.icon];if(key)setIcon(el,key);});
  document.querySelectorAll('.tree i[data-icon=down]').forEach(el=>setIcon(el,'minus'));
  document.querySelectorAll('.tree i[data-icon=right]').forEach(el=>setIcon(el,'plus'));
  // Preserve the current expanded/collapsed state of the two working tree branches.
  for(const selector of ['.tree-root','.chapter.current']){const b=$(selector);setIcon(b.querySelector('i'),b.getAttribute('aria-expanded')==='false'?'plus':'minus');}
  const languages=[['Книги на русском','ru'],['Книги на английском','en'],['Книги на санскрите','sa']];
  for(const [label,key]of languages){const b=$('.rail [aria-label="'+label+'"]');setIcon(b,key+(b?.classList.contains('active')?'Selected':''));}
  put('#references-button i',$('#references-button').classList.contains('active')?'referenceSelected':'reference');
  put('#search-section-button i','search');
  const bookmark=$('.rail [data-dialog=bookmarks]');setIcon(bookmark,'favorites');
  const converter=$('.rail [data-dialog=converter]');setIcon(converter,'converter');
  put('.global-actions [data-dialog=settings]','settings');
  put('#rail-settings','settings');
  put('#focus i','reading');put('#exit-reading i','readingOff');
  for(const [id,key]of [['reading-ai','ai'],['reading-notes','note'],['reading-bookmarks','favorites'],['reading-appearance','textSettings']])put('#'+id,key);
  document.querySelectorAll('[data-dialog=settings] .aa').forEach(el=>setIcon(el,'textSettings'));
  document.querySelectorAll('[data-start-section=references] .new-tab-symbol').forEach(el=>setIcon(el,'reference'));
  document.querySelectorAll('.native-copy').forEach(el=>{if(!el.querySelector('[data-desktop-icon]'))el.insertAdjacentHTML('afterbegin',svg('copy'));});
  compactAi();
  action('[data-delete],[data-library-delete],[data-reading-bookmark-remove],[data-remove-bookmark]','trash');
  action('[data-edit],[data-library-edit]','edit');
  action('#add-note,#annotate-selection','note-new');
  action('#notes-panel .context-book','forward');
  action('.note-location','open-location');
  document.querySelectorAll('.note-source i[data-icon=book]').forEach(el=>el.remove());
  action('.note-source i[data-icon=forward]','forward');
  if(view==='notes')action('#tool-mode','note-stack');
  if(section==='saved')action('#saved-primary',savedTab==='notes'?'note-new':savedTab==='shelves'?'shelf-add':'bookmark-add');
  action('#search-books-all','select-all');action('#search-books-reset','reset');
  action('[data-linked-new]','open-tab');
  action('[data-linked-open]','tab-blank');
  document.querySelectorAll('[data-linked-language]').forEach(input=>{
   const label=input.nextElementSibling,name=({ru:'Русский',en:'English',sa:'Санскрит'})[input.value];
   input.setAttribute('aria-label',name);label.title=name;setIcon(label,input.value);
   if(input.value==='ru'||input.value==='en')label.querySelector('svg').setAttribute('viewBox','4 5 24 22');
  });
  action('.workspace-tab-select:has(svg[data-desktop-icon=plus])','tab-blank');
  action('#native-add-verse','attach-text');action('#ask-ai','send');
  action('#picker-manage,#new-model,#add-model,#start-model','plug');
  action('#reader-position i','verse-list');
  $('#reader-position')?.setAttribute('aria-label','Открыть список стихов');
 }
  // Reuse native SVG nodes; the former wrapper repainted the entire icon set on
  // every small update, invalidating layout repeatedly during a tab restore.
  drawIcons=function(root=document){root.querySelectorAll('i[data-icon]').forEach(el=>{if(!el.firstElementChild&&!el.closest('.desktop-motion-ghost,.desktop-motion-mask'))el.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="'+(icons[el.dataset.icon]||icons.book)+'"/></svg>';});decorate();};
 const previousSync=syncNavigation;syncNavigation=function(){previousSync();decorate();};
 for(const selector of ['.tree-root','.chapter.current'])$(selector).addEventListener('click',decorate);
 $('.review-bar>span').innerHTML='<b>Ведарама</b> · Десктоп · Оригинальные иконки приложения';
 descriptions.brief=['Десктопные иконки · компактное окно','<p>Поиск обозначен лупой и расположен выше ИИ. Для ИИ используется контур диалога со строками слева и справа, отличающийся от документа с карандашом у заметок.</p><p>При небольшой высоте окна разделы прокручиваются, а настройки и помощь остаются внизу. Подсказки доступны при наведении и с клавиатуры. В режиме чтения настройки остаются в верхней панели.</p><p>Поиск и ИИ демонстрационные. Локальные настройки этого варианта отделены от предыдущих макетов.</p><p><a href="gallery.html">Галерея экранов</a> · <a href="icon-reference.html">Исходные иконки</a></p>'];
 // Portal hints avoid being clipped by the independently scrolling section list.
 const hint=document.createElement('div');hint.className='rail-portal-tip';hint.id='rail-portal-tip';hint.role='tooltip';document.body.append(hint);let hinted=null;
 const hideHint=()=>{hint.classList.remove('visible');hinted?.removeAttribute('aria-describedby');hinted=null;};
 function showHint(button){hideHint();hinted=button;hint.textContent=button.dataset.tip||button.getAttribute('aria-label');const r=button.getBoundingClientRect();hint.style.left=(rail.getBoundingClientRect().right+8)+'px';hint.style.top=Math.max(8,Math.min(innerHeight-40,r.top+(r.height-32)/2))+'px';hint.classList.add('visible');button.setAttribute('aria-describedby',hint.id);}
 rail.querySelectorAll('button').forEach(b=>{b.removeAttribute('title');b.addEventListener('pointerenter',()=>showHint(b));b.addEventListener('pointerleave',hideHint);b.addEventListener('focus',()=>{b.scrollIntoView({block:'nearest',inline:'nearest'});if(b.matches(':focus-visible'))showHint(b);});b.addEventListener('blur',hideHint);b.addEventListener('click',hideHint);});
 railScroll.addEventListener('scroll',hideHint,{passive:true});window.addEventListener('resize',hideHint);document.addEventListener('keydown',e=>{if(e.key==='Escape')hideHint();});
 decorate();compactAi();
})();
