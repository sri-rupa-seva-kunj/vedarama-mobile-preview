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
 const dictionaries=[...new Set(refEntries.map(entry=>entry.category))].map(id=>({id,name:({terms:'Термины',people:'Личности',places:'Места'})[id]||id}));
 let signature='',treeWindow=null,count=null;
 function choices(){const items=[];if(searchPrefs.sources.some(s=>s==='books'||s==='word'))books.forEach((name,i)=>items.push({id:String(i),name,type:'book'}));if(searchPrefs.sources.includes('dictionaries'))dictionaries.forEach(item=>items.push({...item,type:'dictionary'}));return items;}
 function selected(item){return item.type==='book'?searchPrefs.selectedBooks.includes(item.name):searchPrefs.selectedDictionaries.includes(item.id);}
 function normalize(){searchPrefs.selectedBooks=Array.isArray(searchPrefs.selectedBooks)?searchPrefs.selectedBooks.filter(book=>books.includes(book)):[BOOK];searchPrefs.selectedDictionaries=Array.isArray(searchPrefs.selectedDictionaries)?searchPrefs.selectedDictionaries:dictionaries.map(item=>item.id);}
 function rollCount(text){
  const line=count.querySelector('.scope-count-text');if(line.textContent===text)return;
  count.getAnimations({subtree:true}).forEach(a=>a.cancel());count.querySelectorAll('.scope-count-old').forEach(node=>node.remove());const old=document.createElement('span');old.className='scope-count-old';old.textContent=line.textContent;line.textContent=text;
  if(old.textContent&&!matchMedia('(prefers-reduced-motion: reduce)').matches){count.append(old);const opts={duration:280,easing:'cubic-bezier(.22,.7,.2,1)'};old.animate([{translate:'0 0'},{translate:'0 -100%'}],opts);line.animate([{translate:'0 100%'},{translate:'0 0'}],opts).finished.then(()=>old.remove()).catch(()=>old.remove());}
 }
 function syncSelection(){
  const items=choices(),chosen=items.filter(selected);catalog.querySelectorAll('[data-scope-choice]').forEach(input=>{const item=items.find(item=>item.type+':'+item.id===input.dataset.scopeChoice);input.checked=!!item&&selected(item);input.previousElementSibling.setAttribute('aria-pressed',String(input.checked));});
  catalog.querySelectorAll('[data-scope-category]').forEach(input=>{const group=items.filter(item=>item.type===input.dataset.scopeCategory),n=group.filter(selected).length;input.checked=n===group.length;input.indeterminate=n>0&&n<group.length;});
  rollCount(chosen.length+' / '+items.length);count.setAttribute('aria-label','Выбрано '+chosen.length+' из '+items.length+' источников');
 }
 function commit(items,on){for(const item of items){const key=item.type==='book'?'selectedBooks':'selectedDictionaries',value=item.type==='book'?item.name:item.id;searchPrefs[key]=on?[...new Set([...searchPrefs[key],value])]:searchPrefs[key].filter(chosen=>chosen!==value);}saveSearchPrefs();dirtySearch();syncSelection();}
 function makeCatalog(){
  const picker=document.createElement('aside');catalog=picker;picker.id='search-scope-catalog';picker.className='catalog search-scope-catalog';picker.setAttribute('aria-label','Каталог источников для поиска');
  const heading=copy(source.querySelector('.catalog-title')),tabs=copy(source.querySelector('.catalog-tabs')),filter=copy(source.querySelector('.catalog-search'));
  heading.querySelector('h2').textContent='Каталог книг';count=heading.querySelector(':scope>span');count.id='search-book-count';count.role='status';count.className='scope-count-window';count.hidden=false;count.innerHTML='<span class="scope-count-text"></span>';
  const close=heading.querySelector('button');close.id='search-catalog-close';close.setAttribute('aria-label','Скрыть каталог источников');close.setAttribute('aria-controls',picker.id);
  const input=filter.querySelector('input');input.id='search-book-filter';input.value='';
  const actions=document.createElement('div');actions.className='scope-selection-tools';actions.innerHTML='<button type="button" id="search-books-all">Выбрать все</button><button type="button" id="search-books-reset">Сбросить</button>';
  treeWindow=document.createElement('div');treeWindow.className='scope-tree-window';treeWindow.innerHTML='<div class="tree"></div>';
  const note=document.createElement('p');note.className='scope-catalog-note';note.textContent='Поиск выполняется в отмеченных источниках. В макете доступны текст Бхагавад-гиты и примеры словарных статей.';
  picker.append(heading,tabs,filter,actions,treeWindow,note);const scene=document.querySelector('.workspace-scene-content')||document.querySelector('.workarea');scene.insertBefore(picker,document.querySelector('.reader-shell'));
  close.onclick=()=>{picker.dataset.closed='true';picker.hidden=true;document.querySelector('#search-catalog-toggle')?.setAttribute('aria-expanded','false');schedule();};
  actions.querySelector('#search-books-all').onclick=()=>commit(choices(),true);actions.querySelector('#search-books-reset').onclick=()=>commit(choices(),false);
  picker.addEventListener('change',event=>{const input=event.target,items=choices();if(input.dataset.scopeChoice)commit(items.filter(item=>item.type+':'+item.id===input.dataset.scopeChoice),input.checked);else if(input.dataset.scopeCategory)commit(items.filter(item=>item.type===input.dataset.scopeCategory),input.checked);});
  picker.addEventListener('click',event=>{const button=event.target.closest('[data-scope-label]');if(button){const input=button.nextElementSibling;input.checked=!input.checked;input.dispatchEvent(new Event('change',{bubbles:true}));}});
  tabs.querySelectorAll('button').forEach((button,i)=>button.onclick=()=>{tabs.querySelectorAll('button').forEach(item=>item.classList.toggle('selected',item===button));updateTree(true);});
  input.oninput=filterTree;resizeObserver=new ResizeObserver(schedule);resizeObserver.observe(picker);drawIcons(picker);
 }
 function filterTree(){
  const query=catalog.querySelector('#search-book-filter').value.toLocaleLowerCase('ru').trim();catalog.querySelectorAll('[data-scope-name]').forEach(row=>row.hidden=!row.dataset.scopeName.toLocaleLowerCase('ru').includes(query));
  catalog.querySelectorAll('.scope-tree-group').forEach(group=>{const found=[...group.querySelectorAll('[data-scope-name]')].some(row=>!row.hidden);group.hidden=!found;if(query&&found){group.querySelector('.scope-tree-children').hidden=false;group.querySelector('.tree-root').setAttribute('aria-expanded','true');}});
 }
 function drawTree(){
  const tree=treeWindow.querySelector('.tree');tree.replaceChildren();let items=choices();const mode=[...catalog.querySelectorAll('.catalog-tabs button')].findIndex(button=>button.classList.contains('selected'));if(mode>0)items=[...items].sort((a,b)=>a.name.localeCompare(b.name,'ru'));
  for(const type of ['book','dictionary']){
   const groupItems=items.filter(item=>item.type===type);if(!groupItems.length)continue;
   const group=document.createElement('section');group.className='scope-tree-group';const root=copy(source.querySelector('.tree-root'));root.textContent='';root.innerHTML=icon('down')+(type==='book'?'Священные писания':'Словари');root.setAttribute('aria-expanded','true');
   const rootRow=document.createElement('div');rootRow.className='scope-tree-row';rootRow.hidden=mode>0;const category=document.createElement('input');category.type='checkbox';category.dataset.scopeCategory=type;category.setAttribute('aria-label',type==='book'?'Выбрать все книги категории «Священные писания»':'Выбрать все словари');rootRow.append(root,category);
   const children=document.createElement('div');children.className='scope-tree-children';children.id='search-scope-'+type;root.setAttribute('aria-controls',children.id);root.onclick=()=>{children.hidden=!children.hidden;root.setAttribute('aria-expanded',String(!children.hidden));root.innerHTML=icon(children.hidden?'right':'down')+(type==='book'?'Священные писания':'Словари');drawIcons(root);};
   groupItems.forEach(item=>{
    const row=document.createElement('div');row.className='scope-tree-row';row.dataset.scopeName=item.name;
    const button=item.type==='book'?copy(templates[Number(item.id)]):document.createElement('button');button.classList.add('tree-book');button.classList.remove('more-book');button.type='button';button.id='search-choice-'+type+'-'+item.id;button.dataset.scopeLabel=type+':'+item.id;
    if(type==='dictionary')button.innerHTML='<i class="scope-leaf-spacer" aria-hidden="true"></i>'+icon('book')+'<b>'+escapeText(item.name)+'</b>';
    const fold=button.querySelector(':scope>i');if(fold&&type==='book'){const spacer=document.createElement('i');spacer.setAttribute('aria-hidden','true');spacer.className='scope-leaf-spacer';fold.replaceWith(spacer);}
    const input=document.createElement('input');input.type='checkbox';input.dataset.scopeChoice=type+':'+item.id;input.setAttribute('aria-labelledby',button.id);row.append(button,input);children.append(row);
   });group.append(rootRow,children);tree.append(group);
  }
  drawIcons(tree);filterTree();syncSelection();
 }
 function updateTree(animate=false){const tree=treeWindow.querySelector('.tree');if(animate&&window.regionCarousel&&!catalog.hidden)window.regionCarousel(tree,drawTree,1);else drawTree();}
 const oldScopeLabel=searchScopeLabel;searchScopeLabel=function(scope,shelf){if(scope!=='catalog')return oldScopeLabel(scope,shelf);normalize();return 'Выбрано источников: '+choices().filter(selected).length;};
 const beforeSearch=renderSearch;
 renderSearch=function(){
  beforeSearch();normalize();const select=document.querySelector('#search-scope');if(!select)return;
  const sources=searchPrefs.sources,onlyBooks=sources.every(s=>s==='books'||s==='word'),label=onlyBooks?'книги':sources.length===1&&sources[0]==='dictionaries'?'словари':'источники';
  const scopeLabel=document.querySelector('.search-scope-label');scopeLabel.hidden=false;scopeLabel.querySelector('span').textContent=onlyBooks?'Книги для поиска':'Источники для поиска';select.querySelector('[value=all]').textContent=onlyBooks?'Все книги':'Все источники';select.add(new Option(onlyBooks?'Выбранные книги':'Выбранные источники','catalog'));if(searchPrefs.scope==='catalog')select.value='catalog';window.vedaSelects?.enhance?.(document.querySelector('#library-search-form'));
  const bar=document.createElement('div');bar.className='search-scope-bar';const toggle=document.createElement('button');toggle.id='search-catalog-toggle';toggle.type='button';toggle.className='outline-button';toggle.innerHTML=icon('book')+'<span>Выбрать '+label+'</span>';toggle.setAttribute('aria-controls','search-scope-catalog');
  document.querySelector('.library-query-row').after(bar);bar.append(scopeLabel);const shelf=document.querySelector('#shelf-search-label');if(shelf)bar.append(shelf);bar.append(toggle);drawIcons(toggle);
  toggle.onclick=()=>{if(searchPrefs.scope!=='catalog'){captureSearchInput();searchPrefs.scope='catalog';saveSearchPrefs();dirtySearch();if(catalog)catalog.dataset.closed='false';renderSearch();document.querySelector('#search-catalog-toggle').focus({preventScroll:true});return;}catalog.dataset.closed=String(!catalog.hidden);catalog.hidden=!catalog.hidden;toggle.setAttribute('aria-expanded',String(!catalog.hidden));schedule();};
  if(searchPrefs.scope!=='catalog'){if(catalog)catalog.hidden=true;splitter.hidden=true;return;}
  if(!catalog)makeCatalog();const next=sources.join(',');catalog.hidden=section!=='search'||catalog.dataset.closed==='true';toggle.setAttribute('aria-expanded',String(!catalog.hidden));catalog.querySelector('.catalog-title h2').textContent=onlyBooks?'Каталог книг':sources.length===1&&sources[0]==='dictionaries'?'Словари':'Источники поиска';
  applyWidth(preferred);updateTree(!!signature&&signature!==next);signature=next;schedule();
 };
 if(section==='search')renderSearch();
})();
