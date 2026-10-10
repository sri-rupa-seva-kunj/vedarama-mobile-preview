// A real two-column flow, ordered from the right page to the left page.
(() => {
 const scroll=$('.book-scroll'),page=$('.book-page'),nav=$('.chapter-navigation'),tools=$('.reading-tools');
 const preferenceKey='veda-desktop-spreads',reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const viewport=document.createElement('div');viewport.className='paged-reader-window';const initialScroll=scroll.scrollTop;page.before(viewport);viewport.append(page);scroll.scrollTop=initialScroll;
 scroll.tabIndex=0;scroll.setAttribute('aria-label','Текст книги');
 let wanted=localStorage.getItem(preferenceKey)==='2',active=false,index=0,count=1,step=0,frame=0,modeFrame=0,slide=null,drag=null,pendingVerse=null,oldStyles=null,restorePending=false,font=getComputedStyle(page).fontSize,layoutRequested=false,queuedIndex=null,layoutAfterTurn=false;
 function busy(){return !!document.querySelector('.desktop-motion-slot.is-moving')||document.body.classList.contains('resizing-catalog');}
 const toggle=document.createElement('button');toggle.id='reading-pages';toggle.title='Чтение на двух страницах: справа, затем слева';toggle.setAttribute('aria-label','Чтение на двух страницах');toggle.setAttribute('aria-pressed','false');
 toggle.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" aria-hidden="true"><path d="M2 4h9v16H2Z M13 4h9v16h-9Z M5 8h3 M16 8h3 M5 12h3 M16 12h3"/></svg><span>Две страницы</span>';tools.insertBefore(toggle,$('#exit-reading'));
 const controls=document.createElement('div');controls.className='paged-reader-controls';controls.setAttribute('aria-label','Перелистывание разворотов');controls.innerHTML=`<button id="spread-prev" aria-label="Предыдущий разворот" title="Предыдущий разворот">${icon('forward')}</button><span id="spread-position" role="status" aria-live="polite"></span><button id="spread-next" aria-label="Следующий разворот" title="Следующий разворот">${icon('back')}</button>`;nav.insertBefore(controls,$('#linked-books-toggle'));drawIcons(controls);
 const previous=$('#spread-prev'),next=$('#spread-next'),position=$('#spread-position');
 const edgeNext=document.createElement('button'),edgePrevious=document.createElement('button');
 edgeNext.id='spread-edge-next';edgePrevious.id='spread-edge-prev';
 [[edgeNext,'next','Следующий разворот','back'],[edgePrevious,'prev','Предыдущий разворот','forward']].forEach(([button,name,label,glyph])=>{button.className='spread-edge spread-edge-'+name;button.setAttribute('aria-label',label);button.title=label;button.innerHTML=icon(glyph);scroll.append(button);drawIcons(button);});
 const styleKeys=['width','height','column-width','column-gap','column-count','column-fill','direction','transform'];
 function blocks(){return Array.from(page.querySelectorAll('p,.continuous-verse-heading,.chapter-end'));}
 function fragments(el){return Array.from(el.getClientRects()).filter(r=>r.width&&r.height);}
 function anchor(versesOnly=false){
  const view=viewport.getBoundingClientRect();let first=null;
  blocks().filter(el=>!versesOnly||el.closest('[data-reader-verse]')).forEach(el=>fragments(el).forEach((r,part)=>{if(r.right>view.left+20&&r.left<view.right-20&&r.bottom>view.top+20&&r.top<view.bottom-20&&(!first||r.right>first.right+2||(Math.abs(r.right-first.right)<2&&r.top<first.top)))first={el,part,right:r.right,top:r.top};}));
  return first;
 }
 function status(){previous.disabled=edgePrevious.disabled=index===0;next.disabled=edgeNext.disabled=index>=count-1;const text=(index+1)+' / '+count;if(position.textContent!==text)position.textContent=text;controls.setAttribute('aria-label','Разворот '+(index+1)+' из '+count+', справа налево');}
 const baseJump=window.readerJump;
 function syncVerse(){
  if(!active)return;const first=anchor(true),verse=Number(first?.el.closest('[data-reader-verse]')?.dataset.readerVerse);
  if(verse&&verse!==window.readerGetState().verse){baseJump(verse);scroll.scrollTop=0;scroll.scrollLeft=0;}
 }
 function go(value,animate=true){
  if(!active||animate&&(busy()||window.workspaceMotionBusy||window.readerLayoutTransition))return;const target=Math.max(0,Math.min(count-1,value)),from=getComputedStyle(page).transform;
  if(animate&&window.readerPageTurn.active){queuedIndex=target;return;}
  queuedIndex=null;window.readerPageTurn.cancel();
  const old=animate&&target!==index&&!reduced.matches?window.desktopMotion.snapshot(viewport):null,sign=target>index?1:-1;
  slide?.cancel();index=target;const to='translateX('+(index*step)+'px)';page.style.transform=to;status();
  if(old){window.readerPageTurn.start(viewport,old,sign,()=>{syncVerse();const queued=queuedIndex;queuedIndex=null;if(queued!==null&&queued!==index)go(queued);if(layoutAfterTurn){layoutAfterTurn=false;schedule();}});}
  else if(animate&&!reduced.matches&&from!=='none'&&from!==getComputedStyle(page).transform){slide=page.animate([{transform:from},{transform:to}],{duration:180,easing:'ease-out'});slide.finished.then(syncVerse).catch(()=>{});}
  else syncVerse();
 }
 function goVerse(verse){
  if(!active)return;const el=page.querySelector('#reader-verse-'+verse);if(!el)return;
  const matrix=new DOMMatrixReadOnly(getComputedStyle(page).transform),r=fragments(el)[0];if(!r)return;
  const right=page.getBoundingClientRect().right-matrix.m41,offset=right-(r.right-matrix.m41);
  go(Math.floor((Math.max(0,offset)+1)/step),false);
 }
 function layout(){
  frame=0;if(!active||busy())return;if(window.readerPageTurn.active){layoutAfterTurn=true;return;}const keep=anchor(),s=getComputedStyle(scroll),width=Math.min(1000,scroll.clientWidth-parseFloat(s.paddingLeft)-parseFloat(s.paddingRight)),height=scroll.clientHeight-parseFloat(s.paddingTop)-parseFloat(s.paddingBottom),gap=innerWidth<=1050?36:56;
  if(width<1||height<1)return;slide?.cancel();page.style.transform='translateX(0)';page.style.width=width+'px';page.style.height=height+'px';page.style.columnWidth=((width-gap)/2)+'px';page.style.columnGap=gap+'px';page.style.columnCount='2';page.style.columnFill='auto';page.style.direction='rtl';step=width+gap;
  const right=page.getBoundingClientRect().right,rects=blocks().flatMap(fragments),left=Math.min(right,...rects.map(r=>r.left));count=Math.max(1,Math.ceil((right-left+gap-1)/step));
  if(pendingVerse!==null){const verse=pendingVerse;pendingVerse=null;goVerse(verse);}
  else if(keep){const r=fragments(keep.el)[Math.min(keep.part,fragments(keep.el).length-1)];go(r?Math.floor((Math.max(0,right-r.right)+1)/step):index,false);}
  else go(index,false);
  scroll.scrollTop=0;scroll.scrollLeft=0;
 }
 function schedule(){if(frame||!active)return;frame=requestAnimationFrame(layout);}
 function syncMode(){
  const should=wanted&&document.body.classList.contains('focus-mode')&&section==='read';toggle.setAttribute('aria-pressed',String(should));
  if(!should&&window.readerPageTurn.active){queuedIndex=null;window.readerPageTurn.cancel();syncVerse();}
  if(should===active){if(!active&&restorePending&&section==='read'&&scroll.getBoundingClientRect().height){restorePending=false;requestAnimationFrame(()=>baseJump(window.readerGetState().verse));}return;}
  if(busy()||window.workspaceMotionBusy)return;
  // Wait for the workspace chrome, then fade between the reading formats.
  const begin=(layoutRequested||section==='read')?window.beginReaderLayoutTransition?.(scroll):null;layoutRequested=false;
  active=should;
  if(active){oldStyles=Object.fromEntries(styleKeys.map(key=>[key,page.style.getPropertyValue(key)]));pendingVerse=window.readerGetState().verse;index=0;document.body.classList.add('paged-reading');scroll.scrollTop=0;layout();}
  else{slide?.cancel();document.body.classList.remove('paged-reading');styleKeys.forEach(key=>{if(oldStyles?.[key])page.style.setProperty(key,oldStyles[key]);else page.style.removeProperty(key);});if(section==='read'&&scroll.getBoundingClientRect().height){requestAnimationFrame(()=>{baseJump(window.readerGetState().verse);});}else restorePending=true;}
  begin?.();
 }
 function scheduleMode(){if(!modeFrame)modeFrame=requestAnimationFrame(()=>{modeFrame=0;syncMode();schedule();});}
 toggle.onclick=()=>{layoutRequested=true;wanted=!wanted;localStorage.setItem(preferenceKey,wanted?'2':'1');syncMode();};previous.onclick=edgePrevious.onclick=()=>go(index-1);next.onclick=edgeNext.onclick=()=>go(index+1);
 window.readerJump=function(verse){baseJump(verse);if(active){scroll.scrollTop=0;goVerse(verse);}};
 document.addEventListener('click',event=>{const button=event.target.closest('[data-jump-verse]');if(active&&button){pendingVerse=Number(button.dataset.jumpVerse);schedule();}},true);
 scroll.addEventListener('scroll',event=>{if(active)event.stopImmediatePropagation();},true);
 document.addEventListener('keydown',event=>{if(!active||window.workspaceMotionBusy||window.readerLayoutTransition||event.target.closest?.('.workspace-tabs')||event.altKey||event.ctrlKey||event.metaKey||event.target.closest?.('input,textarea,select,[contenteditable=true]')||$('#dialog').open)return;const direction={ArrowLeft:1,ArrowRight:-1,PageDown:1,PageUp:-1}[event.key];if(direction){event.preventDefault();go(index+direction);}});
 scroll.addEventListener('pointerdown',event=>{if(!active||window.readerPageTurn.active||event.pointerType==='mouse'||event.target.closest('button,a,input'))return;drag={id:event.pointerId,x:event.clientX,y:event.clientY,index};});
 scroll.addEventListener('pointermove',event=>{if(!drag||drag.id!==event.pointerId)return;const x=event.clientX-drag.x,y=event.clientY-drag.y;if(Math.abs(x)>12&&Math.abs(x)>Math.abs(y)){scroll.setPointerCapture(event.pointerId);event.preventDefault();}});
 function finishSwipe(event){if(!drag||drag.id!==event.pointerId)return;const x=event.clientX-drag.x,y=event.clientY-drag.y,start=drag.index;drag=null;go(start+(Math.abs(x)>50&&Math.abs(x)>Math.abs(y)?(x>0?1:-1):0));}
 scroll.addEventListener('pointerup',finishSwipe);scroll.addEventListener('pointercancel',event=>{if(drag){const start=drag.index;drag=null;go(start);}});
 let wheelDistance=0,wheelAt=0;
 scroll.addEventListener('wheel',event=>{if(!active)return;event.preventDefault();const now=performance.now();if(Math.abs(event.deltaX)<=Math.abs(event.deltaY)||now-wheelAt<380)return;wheelDistance+=event.deltaX;if(Math.abs(wheelDistance)>60){go(index+(wheelDistance<0?1:-1));wheelDistance=0;wheelAt=now;}},{passive:false});
 new ResizeObserver(schedule).observe(scroll);
 new MutationObserver(schedule).observe(document.documentElement,{attributes:true,attributeFilter:['style','class','data-theme']});document.fonts.ready.then(schedule);
 new MutationObserver(records=>{if(records.some(r=>r.target===document.body))scheduleMode();const changes=records.filter(r=>page.contains(r.target));if(active&&changes.some(r=>r.type==='childList'||r.attributeName==='hidden'||(r.target===page&&getComputedStyle(page).fontSize!==font))){font=getComputedStyle(page).fontSize;if(changes.some(r=>r.type==='childList'&&r.target===page))pendingVerse=window.readerGetState().verse;schedule();}}).observe(document.body,{attributes:true,attributeFilter:['class','hidden','style'],childList:true,subtree:true});
 document.addEventListener('desktop-layout-settled',scheduleMode);window.addEventListener('resize',schedule);document.addEventListener('pointerup',schedule);
 window.finishReaderPageTurn=()=>{queuedIndex=null;window.readerPageTurn.cancel();if(active)syncVerse();};
 window.pagedReader={next:()=>go(index+1),previous:()=>go(index-1),goToVerse:goVerse,setEnabled(value){layoutRequested=true;wanted=!!value;localStorage.setItem(preferenceKey,wanted?'2':'1');syncMode();},overview:()=>({active,index,count,step,order:'right-left'})};syncMode();
})();
