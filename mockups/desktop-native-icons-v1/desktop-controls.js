// Desktop catalogue controls: navigation, adjustable width and shared tool hints.
(() => {
 const catalog=$('.catalog'),toggle=$('#toggle-tree');catalog.id='book-catalog';
 const fold='<svg viewBox="0 0 12 12" aria-hidden="true" class="catalog-fold"><path d="m8 2-4 4 4 4" fill="none" stroke="currentColor" stroke-width="1.2"/></svg>';
 toggle.innerHTML='<i data-icon="book"></i><span class="catalog-toggle-label">Каталог книг</span>'+fold;
 const focusToggle=document.createElement('button');focusToggle.id='reading-catalog';focusToggle.innerHTML='<i data-icon="book"></i><span>Каталог</span>';
 $('.reading-tools').prepend(focusToggle);focusToggle.setAttribute('aria-controls',catalog.id);
 drawIcons(toggle);drawIcons(focusToggle);
 const compactToggle=document.createElement('button');compactToggle.id='compact-catalog-toggle';compactToggle.innerHTML='<i data-icon="book"></i><span class="catalog-toggle-label">Открыть каталог</span>';
 $('.reading-toolbar').prepend(compactToggle);compactToggle.setAttribute('aria-controls',catalog.id);drawIcons(compactToggle);
 $('.catalog-title').insertAdjacentHTML('beforeend','<button id="collapse-catalog" class="catalog-hide-button" aria-label="Скрыть каталог книг" aria-controls="book-catalog"><span class="catalog-hide-label">Скрыть каталог</span></button>');
 const collapse=$('#collapse-catalog');collapse.insertAdjacentHTML('afterbegin',fold);drawIcons($('.catalog-title'));
 toggle.setAttribute('aria-controls','book-catalog');
 // A distinct icon means returning to the full workspace, not toggling a sidebar.
 $('#exit-reading i').dataset.icon='workspace';
 icons.workspace='M4 4h16v16H4Z M4 9h16 M8 4v5';
 drawIcons($('#exit-reading'));
 // Match visible area and line weight across the reading toolbar.
 const readingPaths={
  'reading-ai':'M4 5h16v12H10l-6 3V5Z',
  'reading-notes':'M5 3h14v18H5Z M8 7h8 M8 11h8 M8 15h5',
  'reading-bookmarks':'M6 3h12v18l-6-4-6 4V3Z',
  'reading-appearance':'M3 19 8 5l5 14 M5 14h6 M16 11c5-2 6 1 5 4v4 M21 14c-7-1-7 6 0 4'
 };
 function readingIcons(){Object.entries(readingPaths).forEach(([id,d])=>{$('#'+id).innerHTML='<svg class="reading-line-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="'+d+'"/></svg>';});}
 const beforeDraw=drawIcons;drawIcons=function(root=document){beforeDraw(root);readingIcons();};readingIcons();
 const hint=document.createElement('div');hint.className='desktop-control-tip';hint.id='desktop-control-tip';hint.role='tooltip';document.body.append(hint);
 let hintTarget=null;
 function hideHint(){hint.classList.remove('visible');hintTarget?.removeAttribute('aria-describedby');hintTarget=null;}
 function showHint(button){hideHint();hintTarget=button;hint.textContent=button.getAttribute('aria-label');const r=button.getBoundingClientRect();hint.style.left=Math.max(8,Math.min(r.left,innerWidth-hint.offsetWidth-8))+'px';hint.style.top=(r.bottom+8)+'px';button.setAttribute('aria-describedby',hint.id);hint.classList.add('visible');}
 [toggle,compactToggle,collapse,...document.querySelectorAll('.reading-tools>button'),$('#activity-button')].forEach(b=>{b.removeAttribute('title');b.addEventListener('pointerenter',()=>showHint(b));b.addEventListener('pointerleave',hideHint);b.addEventListener('focus',()=>{if(b.matches(':focus-visible'))showHint(b);});b.addEventListener('blur',hideHint);b.addEventListener('click',hideHint);});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'){hideHint();if(document.body.classList.contains('focus-catalog-open')&&!$('#dialog').open){e.preventDefault();e.stopImmediatePropagation();document.body.classList.remove('focus-catalog-open');focusToggle.focus({preventScroll:true});syncControls();}}},true);
 toggle.onclick=()=>{
  if(section!=='read'){showSection('read');document.body.classList.remove('tree-hidden','focus-mode','focus-catalog-open');}
  else if(document.body.classList.contains('focus-mode')){document.body.classList.toggle('focus-catalog-open');document.body.classList.remove('tree-hidden');}
  else if(getComputedStyle(catalog).display==='none'){document.body.classList.remove('tree-hidden','focus-mode');if(innerWidth<=1150&&view!=='read')showSection('read');}
  else document.body.classList.add('tree-hidden');
  syncNavigation();syncControls();
 };
 focusToggle.onclick=()=>toggle.click();compactToggle.onclick=()=>toggle.click();
 collapse.onclick=()=>{const focus=document.body.classList.contains('focus-mode');if(focus)document.body.classList.remove('focus-catalog-open');else document.body.classList.add('tree-hidden');syncControls();(focus?focusToggle:toggle).focus({preventScroll:true});};
 document.addEventListener('pointerdown',e=>{if(document.body.classList.contains('focus-catalog-open')&&!catalog.contains(e.target)&&!focusToggle.contains(e.target)&&!e.target.closest('#catalog-resizer')){document.body.classList.remove('focus-catalog-open');syncControls();}});
 const splitter=document.createElement('div');splitter.id='catalog-resizer';splitter.tabIndex=0;splitter.role='separator';splitter.setAttribute('aria-orientation','vertical');splitter.setAttribute('aria-label','Ширина дерева книг');splitter.setAttribute('aria-controls',catalog.id);splitter.setAttribute('aria-description','Перетащите границу или используйте стрелки влево и вправо. Двойной щелчок возвращает исходную ширину.');document.body.append(splitter);
 const widthKey='vedarama-native-desktop-catalog-width';let preferred=Number(localStorage.getItem(widthKey))||284;
 const limits=()=>{const side=$('.inspector');const occupied=side&&!side.hidden&&side.getBoundingClientRect().width?side.getBoundingClientRect().width:0;return {min:256,max:Math.max(256,Math.min(480,innerWidth-52-occupied-380))};};
 function applyWidth(value,save=false){const {min,max}=limits(),width=Math.round(Math.max(min,Math.min(max,value)));catalog.style.width=width+'px';splitter.setAttribute('aria-valuemin',min);splitter.setAttribute('aria-valuemax',max);splitter.setAttribute('aria-valuenow',width);splitter.setAttribute('aria-valuetext',width+' пикселей');if(save){preferred=width;localStorage.setItem(widthKey,width);}return width;}
 function syncControls(){
  const visible=section==='read'&&getComputedStyle(catalog).display!=='none';
  toggle.setAttribute('aria-expanded',String(visible));toggle.setAttribute('aria-label',section!=='read'?'Открыть каталог книг и вернуться в библиотеку':visible?'Скрыть каталог книг':'Открыть каталог книг');
  toggle.querySelector('.catalog-toggle-label').textContent=visible?'Скрыть каталог':'Открыть каталог';
  toggle.classList.toggle('catalog-is-open',visible);focusToggle.classList.toggle('catalog-is-open',visible);
  compactToggle.setAttribute('aria-expanded',String(visible));compactToggle.setAttribute('aria-label',toggle.getAttribute('aria-label'));compactToggle.querySelector('span').textContent=visible?'Скрыть каталог':'Открыть каталог';
  focusToggle.setAttribute('aria-expanded',String(visible));focusToggle.setAttribute('aria-label',visible?'Скрыть каталог книг':'Открыть каталог книг');
  $('#activity-button').setAttribute('aria-pressed',String(section==='activity'));
  splitter.hidden=!visible||innerWidth<=700;
  if(visible){applyWidth(preferred);const r=catalog.getBoundingClientRect();splitter.style.left=(r.right-4)+'px';splitter.style.top=r.top+'px';splitter.style.height=r.height+'px';}
 }
 let drag=null;
 splitter.addEventListener('pointerdown',e=>{if(e.button!==0)return;e.preventDefault();hideHint();splitter.focus({preventScroll:true});drag={id:e.pointerId,x:e.clientX,width:catalog.getBoundingClientRect().width};splitter.setPointerCapture(e.pointerId);document.body.classList.add('resizing-catalog');});
 splitter.addEventListener('pointermove',e=>{if(!drag||drag.id!==e.pointerId)return;applyWidth(drag.width+e.clientX-drag.x,true);const r=catalog.getBoundingClientRect();splitter.style.left=(r.right-4)+'px';});
 function stopDrag(){drag=null;document.body.classList.remove('resizing-catalog');}
 splitter.addEventListener('pointerup',stopDrag);splitter.addEventListener('pointercancel',stopDrag);splitter.addEventListener('lostpointercapture',stopDrag);
 splitter.addEventListener('dblclick',()=>{applyWidth(284,true);syncControls();});
 splitter.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();const {min,max}=limits();applyWidth(e.key==='Home'?min:e.key==='End'?max:catalog.getBoundingClientRect().width+(e.key==='ArrowLeft'?-1:1)*(e.shiftKey?10:20),true);syncControls();});
 let scheduled=false;const schedule=()=>{if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;syncControls();});};
 new MutationObserver(schedule).observe(document.body,{attributes:true,attributeFilter:['class']});
 new ResizeObserver(schedule).observe(catalog);
 window.addEventListener('resize',()=>{hideHint();schedule();});
 syncControls();
})();
