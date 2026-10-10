// Search scope reuses the reading catalogue, with selection controls beside its rows.
(() => {
 const source=document.querySelector('#book-catalog'),templates=[...source.querySelectorAll('.tree-book')];
 const books=templates.map(button=>button.textContent.trim()),widthKey='vedarama-search-catalog-width';
 let catalog=null,preferred=Number(localStorage.getItem(widthKey))||284,drag=null,frame=0,resizeObserver=null;
 const splitter=document.createElement('div');splitter.id='search-catalog-resizer';splitter.tabIndex=0;splitter.role='separator';splitter.hidden=true;
 splitter.setAttribute('aria-orientation','vertical');splitter.setAttribute('aria-label','Ширина каталога области поиска');splitter.setAttribute('aria-controls','search-scope-catalog');
 splitter.setAttribute('aria-description','Перетащите границу или используйте стрелки влево и вправо. Двойной щелчок возвращает исходную ширину.');document.body.append(splitter);
 function limits(){const min=innerWidth<=700?220:256;return {min,max:Math.max(min,Math.min(480,innerWidth-52-380))};}
 function applyWidth(value,save=false){const {min,max}=limits(),width=Math.round(Math.max(min,Math.min(max,value)));if(catalog)catalog.style.width=width+'px';splitter.setAttribute('aria-valuemin',min);splitter.setAttribute('aria-valuemax',max);splitter.setAttribute('aria-valuenow',width);splitter.setAttribute('aria-valuetext',width+' пикселей');if(save){preferred=width;localStorage.setItem(widthKey,width);}return width;}
 function placeSplitter(){
  frame=0;const visible=catalog?.isConnected&&section==='search'&&!catalog.hidden&&getComputedStyle(catalog).display!=='none';
  if(!visible){splitter.hidden=true;return;}applyWidth(preferred);
  const r=catalog.getBoundingClientRect(),slot=catalog.closest('.desktop-motion-slot');
  const incomplete=slot&&!drag&&Math.abs(slot.getBoundingClientRect().width-r.width)>1;
  // Keep the captured handle present while the catalogue width is being measured.
  splitter.hidden=!drag&&(innerWidth<=700||incomplete||!!window.workspaceMotionBusy||!!slot?.classList.contains('is-moving'));
  Object.assign(splitter.style,{left:(r.right-4)+'px',top:r.top+'px',height:r.height+'px'});
 }
 function schedule(){if(!frame)frame=requestAnimationFrame(placeSplitter);}
 function stopDrag(){drag=null;document.body.classList.remove('resizing-catalog');schedule();}
 splitter.addEventListener('pointerdown',event=>{if(event.button!==0||!catalog)return;event.preventDefault();splitter.focus({preventScroll:true});drag={id:event.pointerId,x:event.clientX,width:catalog.getBoundingClientRect().width};splitter.setPointerCapture(event.pointerId);document.body.classList.add('resizing-catalog');});
 document.addEventListener('pointermove',event=>{if(!drag||drag.id!==event.pointerId)return;applyWidth(drag.width+event.clientX-drag.x,true);window.desktopMotion?.flush();placeSplitter();});
 ['pointerup','pointercancel','lostpointercapture'].forEach(name=>splitter.addEventListener(name,stopDrag));
 ['pointerup','pointercancel'].forEach(name=>document.addEventListener(name,event=>{if(drag?.id===event.pointerId)stopDrag();}));
 splitter.addEventListener('dblclick',()=>{applyWidth(284,true);schedule();});
 splitter.addEventListener('keydown',event=>{if(!catalog||!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;event.preventDefault();const {min,max}=limits();applyWidth(event.key==='Home'?min:event.key==='End'?max:catalog.getBoundingClientRect().width+(event.key==='ArrowLeft'?-1:1)*(event.shiftKey?10:20),true);schedule();});
 new MutationObserver(schedule).observe(document.body,{attributes:true,attributeFilter:['class']});window.addEventListener('resize',schedule);document.addEventListener('desktop-layout-settled',schedule);
 function copy(element){const clone=element.cloneNode(true);[clone,...clone.querySelectorAll('*')].forEach(node=>{['id','data-dialog','data-catalog','data-verse','aria-controls','aria-describedby'].forEach(key=>node.removeAttribute(key));});return clone;}
 const oldScopeLabel=searchScopeLabel;searchScopeLabel=function(scope,shelf){return scope==='catalog'?`Выбрано книг: ${searchPrefs.selectedBooks?.length||0}`:oldScopeLabel(scope,shelf);};
 const beforeSearch=renderSearch;
 renderSearch=function(){
  resizeObserver?.disconnect();resizeObserver=null;stopDrag();
  if(catalog){catalog.closest('.desktop-motion-slot')?.remove();catalog.remove();catalog=null;}splitter.hidden=true;
  beforeSearch();const select=document.querySelector('#search-scope');if(!select)return;
  select.add(new Option('Выбрать книги…','catalog'));if(searchPrefs.scope==='catalog')select.value='catalog';window.vedaSelects?.enhance?.(document.querySelector('#library-search-form'));
  if(searchPrefs.scope!=='catalog'||document.querySelector('.search-scope-label').hidden)return;
  searchPrefs.selectedBooks=Array.isArray(searchPrefs.selectedBooks)?searchPrefs.selectedBooks.filter(book=>books.includes(book)):[BOOK];
  const picker=document.createElement('aside');catalog=picker;picker.id='search-scope-catalog';picker.className='catalog search-scope-catalog';picker.setAttribute('aria-label','Каталог книг для поиска');
  const heading=copy(source.querySelector('.catalog-title')),tabs=copy(source.querySelector('.catalog-tabs')),filter=copy(source.querySelector('.catalog-search'));
  heading.querySelector('h2').textContent='Каталог книг';const count=heading.querySelector(':scope>span');count.id='search-book-count';count.role='status';count.hidden=false;
  tabs.querySelectorAll('button').forEach((button,i)=>button.classList.toggle('selected',i===0));
  const close=heading.querySelector('button');close.id='search-catalog-close';close.setAttribute('aria-label','Закрыть каталог выбора книг');close.setAttribute('aria-controls',picker.id);
  filter.querySelector('input').id='search-book-filter';filter.querySelector('input').value='';
  const actions=document.createElement('div');actions.className='scope-selection-tools';actions.innerHTML='<button type="button" id="search-books-all">Выбрать все</button><button type="button" id="search-books-reset">Сбросить</button>';
  const tree=document.createElement('div');tree.className='tree';const root=copy(source.querySelector('.tree-root'));root.id='search-category-toggle';root.type='button';root.setAttribute('aria-expanded','true');
  const rootRow=document.createElement('div');rootRow.className='scope-tree-row';const category=document.createElement('input');category.type='checkbox';category.id='search-book-category';category.setAttribute('aria-label','Выбрать все книги категории «Священные писания»');rootRow.append(root,category);
  const children=document.createElement('div');children.className='scope-tree-children';root.setAttribute('aria-controls','search-category-books');children.id='search-category-books';
  templates.forEach((template,i)=>{
   const row=document.createElement('div');row.className='scope-tree-row';row.dataset.searchBookRow=String(i);
   const button=copy(template);button.id='search-book-label-'+i;button.type='button';button.classList.remove('more-book');button.setAttribute('aria-pressed','false');
   const fold=button.querySelector(':scope>i');if(fold){const spacer=document.createElement('i');spacer.setAttribute('aria-hidden','true');spacer.className='scope-leaf-spacer';fold.replaceWith(spacer);}
   const input=document.createElement('input');input.type='checkbox';input.dataset.searchBook=String(i);input.setAttribute('aria-labelledby',button.id);
   button.onclick=()=>{input.checked=!input.checked;input.dispatchEvent(new Event('change'));};row.append(button,input);children.append(row);
  });
  const empty=document.createElement('p');empty.className='scope-tree-empty';empty.textContent='Книги не найдены.';empty.hidden=true;tree.append(rootRow,children,empty);
  const note=document.createElement('p');note.className='scope-catalog-note';note.textContent='Поиск выполняется в отмеченных книгах. В макете доступен текст Бхагавад-гиты.';
  picker.append(heading,tabs,filter,actions,tree,note);const scene=document.querySelector('.workspace-scene-content')||document.querySelector('.workarea');scene.insertBefore(picker,document.querySelector('.reader-shell'));
  const toggle=document.createElement('button');toggle.id='search-catalog-toggle';toggle.type='button';toggle.className='outline-button';toggle.innerHTML=icon('book')+'Выбрать книги';toggle.setAttribute('aria-expanded','true');toggle.setAttribute('aria-controls',picker.id);
  const pageHeading=document.querySelector('#workspace-panel .search-page-heading');let headingActions=pageHeading.querySelector('.search-heading-actions');if(!headingActions){headingActions=document.createElement('div');headingActions.className='search-heading-actions';headingActions.append(document.querySelector('#search-settings'));pageHeading.append(headingActions);}headingActions.prepend(toggle);
  function setOpen(open){picker.hidden=!open;picker.dataset.closed=String(!open);toggle.setAttribute('aria-expanded',String(open));schedule();}
  close.onclick=()=>{setOpen(false);toggle.focus({preventScroll:true});};toggle.onclick=()=>setOpen(picker.hidden);
  function sync(){
   const chosen=searchPrefs.selectedBooks;picker.querySelectorAll('[data-search-book]').forEach(input=>{input.checked=chosen.includes(books[Number(input.dataset.searchBook)]);input.previousElementSibling.setAttribute('aria-pressed',String(input.checked));});
   category.checked=chosen.length===books.length;category.indeterminate=chosen.length>0&&chosen.length<books.length;count.textContent=chosen.length+' / '+books.length;count.setAttribute('aria-label','Выбрано '+chosen.length+' из '+books.length+' книг');
  }
  function commit(list){searchPrefs.selectedBooks=[...new Set(list)];saveSearchPrefs();dirtySearch();sync();}
  picker.querySelectorAll('[data-search-book]').forEach(input=>input.onchange=()=>{const book=books[Number(input.dataset.searchBook)];commit(input.checked?[...searchPrefs.selectedBooks,book]:searchPrefs.selectedBooks.filter(item=>item!==book));});
  category.onchange=()=>commit(category.checked?books:[]);actions.querySelector('#search-books-all').onclick=()=>commit(books);actions.querySelector('#search-books-reset').onclick=()=>commit([]);
  function setExpanded(expanded){children.hidden=!expanded;root.setAttribute('aria-expanded',String(expanded));root.querySelector('i[data-icon]').dataset.icon=expanded?'down':'right';drawIcons(tree);}
  root.onclick=()=>setExpanded(children.hidden);
  tabs.querySelectorAll('button').forEach((button,i)=>button.onclick=()=>{tabs.querySelectorAll('button').forEach(item=>item.classList.toggle('selected',item===button));rootRow.hidden=i!==0;const rows=[...children.children];if(i)rows.sort((a,b)=>books[Number(a.dataset.searchBookRow)].localeCompare(books[Number(b.dataset.searchBookRow)],'ru'));else rows.sort((a,b)=>Number(a.dataset.searchBookRow)-Number(b.dataset.searchBookRow));rows.forEach(row=>children.append(row));setExpanded(true);});
  filter.querySelector('input').oninput=event=>{const query=event.target.value.toLocaleLowerCase('ru').trim();let found=0;children.querySelectorAll('[data-search-book-row]').forEach(row=>{row.hidden=!books[Number(row.dataset.searchBookRow)].toLocaleLowerCase('ru').includes(query);if(!row.hidden)found++;});empty.hidden=!!found;rootRow.hidden=!found||!tabs.querySelector('button:first-child').classList.contains('selected');if(query&&found)setExpanded(true);};
  applyWidth(preferred);sync();drawIcons(picker);drawIcons(toggle);resizeObserver=new ResizeObserver(schedule);resizeObserver.observe(picker);schedule();
 };
 if(section==='search')renderSearch();
})();
