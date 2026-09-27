// This variant uses SVG files from the native desktop QML application.
(() => {
 // Keep the order of shared sections from LeftMenu.qml; new tools follow Favorites.
 const rail=$('.rail'),bottom=$('.rail-bottom');
 const langButtons=['Книги на русском','Книги на английском','Книги на санскрите'].map(label=>$('.rail [aria-label="'+label+'"]'));
 const divider=()=>document.createElement('hr');
 const railSettings=document.createElement('button');railSettings.id='rail-settings';railSettings.className='rail-item';railSettings.setAttribute('aria-label','Настройки');railSettings.dataset.tip='Настройки';railSettings.onclick=()=>openDialog('settings');
 bottom.prepend(railSettings);
 const ordered=[...langButtons,divider(),$('#search-section-button'),$('.rail [data-nav=ai]'),$('#references-button'),$('.rail [data-dialog=converter]'),divider(),$('.rail [data-dialog=bookmarks]'),$('.rail [data-dialog=shelves]'),$('.rail [data-view=notes]')];
 const railScroll=document.createElement('div');railScroll.className='rail-scroll';railScroll.setAttribute('aria-label','Разделы библиотеки');
 rail.querySelectorAll(':scope>hr').forEach(el=>el.remove());ordered.forEach(el=>railScroll.append(el));rail.prepend(railScroll);rail.append(bottom);
 $('.global-actions [data-dialog=settings]').classList.add('reading-global-settings');
 let sequence=0;
 function svg(key){let code=desktopIconData[key];if(!code)return '';
  // The native note outline is filled and becomes too heavy when enlarged.
  // Retain its speech-note silhouette with a consistent screen-space stroke.
  if(key==='note')code='<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 3h18v14h-9l-5 4v-4H3Z M7 7h10 M7 11h6" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round" vector-effect="non-scaling-stroke"/></svg>';
  if(key==='ai')code='<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g stroke="currentColor" stroke-width="1.1" stroke-linecap="butt" stroke-linejoin="miter"><rect x="3" y="7" width="18" height="13" rx=".7"/><path d="M12 7V3.5 M10.5 3.5h3 M9 16.5h6"/></g><path d="M7.5 11h1.5v1.5H7.5Z M15 11h1.5v1.5H15Z" fill="currentColor"/></svg>';
  if(key==='search')code='<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g stroke="currentColor" stroke-width="1.1" stroke-linecap="square"><circle cx="10.5" cy="10.5" r="7"/><path d="m15.5 15.5 5.5 5.5"/></g></svg>';
  const boost={ru:.18,ruSelected:.18,en:.18,enSelected:.18,sa:.1,saSelected:.1,reference:.18,referenceSelected:.18,favorites:.18,favoritesSelected:.18,textSettings:.12,book:.12,settings:.1};
  if(boost[key])code=code.replace(/fill="currentColor"/g,'fill="currentColor" stroke="currentColor" stroke-width="'+boost[key]+'" stroke-linejoin="round" vector-effect="non-scaling-stroke"');
  const prefix='desktop-'+(++sequence)+'-';code=code.replace(/id="([^"]+)"/g,(_,id)=>'id="'+prefix+id+'"').replace(/url\(#([^)]+)\)/g,(_,id)=>'url(#'+prefix+id+')');return code.replace('<svg ','<svg class="desktop-app-icon" data-desktop-icon="'+key+'" aria-hidden="true" focusable="false" ');}
 const map={book:'book',search:'search',spark:'ai',bookmark:'favorites',note:'note',settings:'settings',help:'help',globe:'globe',plus:'plus',close:'close',back:'back',forward:'forward',down:'down'};
 function put(selector,key){const el=document.querySelector(selector);if(el)el.innerHTML=svg(key);}
 function decorate(){
  document.querySelectorAll('i[data-icon]').forEach(el=>{const key=map[el.dataset.icon];if(key)el.innerHTML=svg(key);});
  document.querySelectorAll('.tree i[data-icon=down]').forEach(el=>el.innerHTML=svg('minus'));
  document.querySelectorAll('.tree i[data-icon=right]').forEach(el=>el.innerHTML=svg('plus'));
  // Preserve the current expanded/collapsed state of the two working tree branches.
  for(const selector of ['.tree-root','.chapter.current']){const b=$(selector);b.querySelector('i').innerHTML=svg(b.getAttribute('aria-expanded')==='false'?'plus':'minus');}
  const languages=[['Книги на русском','ru'],['Книги на английском','en'],['Книги на санскрите','sa']];
  for(const [label,key]of languages){const b=$('.rail [aria-label="'+label+'"]');if(b)b.innerHTML=svg(key+(b.classList.contains('active')?'Selected':''));}
  put('#references-button i',$('#references-button').classList.contains('active')?'referenceSelected':'reference');
  put('#search-section-button i','search');
  const bookmark=$('.rail [data-dialog=bookmarks]');if(bookmark)bookmark.innerHTML=svg(bookmark.classList.contains('active')?'favoritesSelected':'favorites');
  const converter=$('.rail [data-dialog=converter]');if(converter)converter.innerHTML=svg('converter');
  put('.global-actions [data-dialog=settings]','settings');
  put('#rail-settings','settings');
  put('#focus i','reading');put('#exit-reading i','readingOff');
  for(const [id,key]of [['reading-ai','ai'],['reading-notes','note'],['reading-bookmarks','favorites'],['reading-appearance','textSettings']])put('#'+id,key);
  document.querySelectorAll('[data-dialog=settings] .aa').forEach(el=>el.innerHTML=svg('textSettings'));
  document.querySelectorAll('[data-start-section=references] .new-tab-symbol').forEach(el=>el.innerHTML=svg('reference'));
  document.querySelectorAll('.native-copy').forEach(el=>{if(!el.querySelector('[data-desktop-icon]'))el.insertAdjacentHTML('afterbegin',svg('copy'));});
 }
 const previousDraw=drawIcons;drawIcons=function(root=document){previousDraw(root);decorate();};
 const previousSync=syncNavigation;syncNavigation=function(){previousSync();decorate();};
 for(const selector of ['.tree-root','.chapter.current'])$(selector).addEventListener('click',decorate);
 $('.review-bar>span').innerHTML='<b>Ведарама</b> · Десктоп · Оригинальные иконки приложения';
 descriptions.brief=['Десктопные иконки · компактное окно','<p>Поиск обозначен лупой и расположен выше AI. Для AI используется тонкий контур робота, отличающийся от заметок.</p><p>При небольшой высоте окна разделы прокручиваются, а настройки и помощь остаются внизу. Подсказки доступны при наведении и с клавиатуры. В режиме чтения настройки остаются в верхней панели.</p><p>Поиск и AI демонстрационные. Локальные настройки этого варианта отделены от предыдущих макетов.</p><p><a href="gallery.html">Галерея экранов</a> · <a href="icon-reference.html">Исходные иконки</a></p>'];
 // Portal hints avoid being clipped by the independently scrolling section list.
 const hint=document.createElement('div');hint.className='rail-portal-tip';hint.id='rail-portal-tip';hint.role='tooltip';document.body.append(hint);let hinted=null;
 const hideHint=()=>{hint.classList.remove('visible');hinted?.removeAttribute('aria-describedby');hinted=null;};
 function showHint(button){hideHint();hinted=button;hint.textContent=button.dataset.tip||button.getAttribute('aria-label');const r=button.getBoundingClientRect();hint.style.left=(rail.getBoundingClientRect().right+8)+'px';hint.style.top=Math.max(8,Math.min(innerHeight-40,r.top+(r.height-32)/2))+'px';hint.classList.add('visible');button.setAttribute('aria-describedby',hint.id);}
 rail.querySelectorAll('button').forEach(b=>{b.removeAttribute('title');b.addEventListener('pointerenter',()=>showHint(b));b.addEventListener('pointerleave',hideHint);b.addEventListener('focus',()=>{b.scrollIntoView({block:'nearest',inline:'nearest'});if(b.matches(':focus-visible'))showHint(b);});b.addEventListener('blur',hideHint);b.addEventListener('click',hideHint);});
 railScroll.addEventListener('scroll',hideHint,{passive:true});window.addEventListener('resize',hideHint);document.addEventListener('keydown',e=>{if(e.key==='Escape')hideHint();});
 decorate();
})();
