// Section and tab changes share one clipped viewport; reading chrome changes afterwards.
(() => {
 const reduced=matchMedia('(prefers-reduced-motion: reduce)'),duration=380,easing='cubic-bezier(.4,0,.2,1)';
 const work=document.querySelector('.workarea'),scene=document.createElement('div'),content=document.createElement('div');
 scene.className='workspace-scene';content.className='workspace-scene-content';
 window.libraryLanguage||='ru';['ru','en','sa'].forEach((lang,i)=>document.querySelectorAll('.rail-scroll .rail-item')[i].dataset.libraryLanguage=lang);
 [...work.children].filter(el=>!el.matches('.rail')&&!el.querySelector(':scope>.rail')).forEach(el=>content.append(el));work.append(scene);scene.append(content);
 let transition=null,applying=false,lastRoute=route(),prepared=null,prepareJob=null,warmTimer=0;
 let fontsReady=false;window.desktopFontsReady=Promise.all(['14px "PT Sans"','700 14px "PT Sans"','19px "Gaura PT Serif"','italic 19px "Gaura PT Serif"','700 19px "Gaura PT Serif"'].map(font=>document.fonts.load(font))).catch(()=>[]).then(()=>{fontsReady=true;invalidate();});
 function warm(){warmTimer=0;if(!fontsReady||transition||document.getAnimations().some(a=>a.playState==='running'||a.playState==='paused')){warmTimer=setTimeout(warm,120);return;}prepareJob=window.desktopMotion.prepareSnapshot(content,clone=>{prepared=clone;prepareJob=null;});}
 function invalidate(){prepared=null;prepareJob?.();prepareJob=null;clearTimeout(warmTimer);warmTimer=setTimeout(warm,100);}
 const contentChanges=new MutationObserver(invalidate);contentChanges.observe(content,{childList:true,subtree:true,attributes:true,attributeFilter:['class','hidden','style','open']});
 new MutationObserver(invalidate).observe(document.body,{attributes:true,attributeFilter:['class']});new MutationObserver(invalidate).observe(document.documentElement,{attributes:true,attributeFilter:['class','style','data-theme']});window.addEventListener('resize',invalidate);document.fonts.ready.then(invalidate);
 function route(){return section==='saved'?savedTab:section==='read'?'read-'+window.libraryLanguage:section;}
 const order=[...document.querySelectorAll('.rail-scroll .rail-item')].map(b=>b.dataset.libraryLanguage?'read-'+b.dataset.libraryLanguage:b.dataset.nav||({converter:'converter',shelves:'shelves',bookmarks:'bookmarks'}[b.dataset.dialog])||b.dataset.view||(b.id==='search-section-button'?'search':b.id==='references-button'?'references':null)).filter(Boolean);
 function finish(){if(!transition)return;const current=transition;transition=null;current.runs.forEach(run=>run.cancel());current.stage.remove();content.style.removeProperty('transform');window.workspaceMotionBusy=false;scene.classList.remove('is-carousel-moving');lastRoute=route();current.after?.();document.dispatchEvent(new Event('desktop-layout-settled'));invalidate();}
 function change(axis,sign,apply,after,onlyIfRoute=false){
  finish();window.activityMotion?.finish();window.finishReaderLayoutTransition?.();window.finishReaderPageTurn?.();window.finishPanelCarousel?.();
  if(contentChanges.takeRecords().length)invalidate();
  const cached=prepared;prepared=null;prepareJob?.();prepareJob=null;window.desktopMotion.settle();window.desktopMotion.flush();
  const previous=lastRoute,rect=scene.getBoundingClientRect(),old=cached||window.desktopMotion.snapshot(content);if(cached)window.desktopMotion.refreshSnapshot(content,old);
  window.workspaceMotionBusy=true;applying=true;
  try{apply();}finally{applying=false;}
  const next=route();lastRoute=next;document.querySelectorAll('.search-scope-catalog').forEach(el=>el.hidden=section!=='search'||el.dataset.closed==='true');window.desktopMotion.flush();
  if(onlyIfRoute&&previous===next){window.workspaceMotionBusy=false;after?.();return;}
  if(onlyIfRoute)sign=order.indexOf(next)>=order.indexOf(previous)?1:-1;
  if(reduced.matches||!rect.width||!rect.height){window.workspaceMotionBusy=false;after?.();return;}
  const stage=document.createElement('div');stage.className='workspace-carousel-outgoing';stage.inert=true;stage.setAttribute('aria-hidden','true');
  Object.assign(old.style,{position:'absolute',left:'0',top:'0',width:rect.width+'px',height:rect.height+'px',margin:'0',minWidth:'0'});stage.append(old);scene.append(stage);window.desktopMotion.restoreScroll(old);
  const distance=sign*(axis==='x'?rect.width:rect.height),move=value=>axis==='x'?value+'px 0':'0 '+value+'px';
  scene.classList.add('is-carousel-moving');scene.dataset.carouselAxis=axis;scene.dataset.carouselDirection=String(sign);
  const opts={duration,easing,fill:'both'},outgoing=old.animate([{translate:move(0),scale:1},{translate:move(-distance),scale:.985}],opts),incoming=content.animate([{translate:move(distance),scale:.975},{translate:move(0),scale:1}],opts);
  const current={stage,runs:[outgoing,incoming],after,ready:false};transition=current;
  current.runs.forEach(run=>{run.pause();run.currentTime=0;});
  // Routing rebuilds controls and measures slots. Start the clock after that work.
  requestAnimationFrame(()=>{if(transition!==current)return;window.desktopMotion.flush();const now=performance.now();current.ready=true;current.runs.forEach(run=>{run.play();run.startTime=now;});});
  incoming.finished.then(()=>{if(transition?.runs.includes(incoming))finish();}).catch(()=>{});
 }
 window.pageCarousel={change,finish,invalidate,get prepared(){return !!prepared;},get active(){return !!transition;},get ready(){return !!transition?.ready;},get phase(){return transition?'carousel':'idle';}};
 const previousSection=showSection,previousTool=openTool;
 showSection=function(next,reset=true){if(applying)return previousSection(next,reset);const destination=next==='saved'?savedTab:next==='read'?'read-'+window.libraryLanguage:next;if(destination===lastRoute)return previousSection(next,reset);change('y',1,()=>previousSection(next,reset),null,true);};
 openTool=function(next,mode='panel'){
  if(applying)return previousTool(next,mode);
  if(mode==='panel'&&section==='read'){
   if(['notes','ai'].includes(view)&&['notes','ai'].includes(next)&&view!==next)window.panelCarousel(()=>previousTool(next,mode),view==='notes'?1:-1);
   else previousTool(next,mode);return;
  }
  change('y',1,()=>previousTool(next,mode),null,true);
 };
 document.querySelectorAll('[data-library-language]').forEach(button=>button.onclick=event=>{event.stopImmediatePropagation();document.querySelector('.rail-portal-tip')?.classList.remove('visible');change('y',1,()=>{window.libraryLanguage=button.dataset.libraryLanguage;previousSection('read');document.body.classList.remove('tree-hidden','focus-catalog-open');const state=window.readerGetState();window.readerRestore({...state,language:window.libraryLanguage});syncNavigation();},null,true);});
 window.desktopMotion.flush();
})();

// Library language is a navigation choice owned by the current tab.
(() => {const previous=syncNavigation;syncNavigation=function(){previous();const active=section==='read'&&(view==='read'||toolMode==='panel');document.querySelectorAll('[data-library-language]').forEach(button=>{const selected=active&&button.dataset.libraryLanguage===window.libraryLanguage;button.classList.toggle('active',selected);if(selected)button.setAttribute('aria-current','page');else button.removeAttribute('aria-current');});const heading=document.querySelector('.catalog-title h2');if(heading){const title=({ru:'Книги на русском',en:'Книги на английском',sa:'Книги на санскрите'})[window.libraryLanguage],text=[...heading.childNodes].find(n=>n.nodeType===Node.TEXT_NODE);if(text&&text.textContent.trim()!==title)text.textContent=title+' ';const count=document.querySelector('.catalog-title>span');if(count)count.hidden=window.libraryLanguage!=='ru';}};syncNavigation();})();

// The rail uses one moving selection plate, including interrupted journeys.
(() => {
 const rail=document.querySelector('.rail-scroll'),plate=document.createElement('div'),reduced=matchMedia('(prefers-reduced-motion: reduce)');
 plate.className='workspace-rail-plate';plate.setAttribute('aria-hidden','true');rail.prepend(plate);let run=null,last=null;
 function place(){const item=rail.querySelector('.rail-item.active:not([hidden])');if(!item){plate.hidden=true;last=null;run?.cancel();return;}const r=item.getBoundingClientRect(),base=rail.getBoundingClientRect(),next={y:r.top-base.top-rail.clientTop+rail.scrollTop,w:r.width,h:r.height};const from=last&&run&&(run.playState==='running'||run.playState==='paused')?{...last,y:new DOMMatrixReadOnly(getComputedStyle(plate).transform).m42}:last;run?.cancel();plate.hidden=false;Object.assign(plate.style,{top:'0',width:next.w+'px',height:next.h+'px',transform:'translateY('+next.y+'px)'});if(from&&!reduced.matches&&Math.abs(from.y-next.y)>.5)run=plate.animate([{transform:'translateY('+from.y+'px)'},{transform:'translateY('+next.y+'px)'}],{duration:380,easing:'cubic-bezier(.4,0,.2,1)'});last=next;}
 let frame=0;const schedule=()=>{if(!frame)frame=requestAnimationFrame(()=>{frame=0;place();});};const previous=syncNavigation;syncNavigation=function(){previous();schedule();};new ResizeObserver(schedule).observe(rail);rail.addEventListener('scroll',schedule,{passive:true});document.addEventListener('desktop-layout-settled',schedule);place();
})();

// Tool panels use a carousel; reading formats use a quiet fade through blank space.
(() => {
 const reduced=matchMedia('(prefers-reduced-motion: reduce)'),easing='cubic-bezier(.22,.7,.2,1)';let panelRun=null,readerRun=null;
 function stage(source){const r=source.getBoundingClientRect(),mask=document.createElement('div'),clone=window.desktopMotion.snapshot(source);mask.className='desktop-motion-mask local-carousel-mask';mask.inert=true;mask.setAttribute('aria-hidden','true');Object.assign(mask.style,{left:r.left+'px',top:r.top+'px',width:r.width+'px',height:r.height+'px',zIndex:'4'});Object.assign(clone.style,{position:'absolute',left:'0',top:'0',width:r.width+'px',height:r.height+'px',margin:'0'});mask.append(clone);document.body.append(mask);window.desktopMotion.restoreScroll(clone);return {r,mask,clone};}
 window.panelCarousel=function(apply,sign){
  panelRun?.();const source=document.querySelector('.inspector'),old=stage(source),border=parseFloat(getComputedStyle(source).borderLeftWidth)||0;
  Object.assign(old.mask.style,{left:(old.r.left+border)+'px',width:(old.r.width-border)+'px'});old.clone.style.left=-border+'px';
  window.panelMotionBusy=true;apply();window.desktopMotion.flush();
  const runs=[],cleanup=()=>{runs.forEach(a=>a.cancel());old.mask.remove();window.panelMotionBusy=false;if(panelRun===cleanup)panelRun=null;document.dispatchEvent(new Event('desktop-layout-settled'));};panelRun=cleanup;
  if(reduced.matches){cleanup();return;}
  // The inspector and its border stay in place. Only its visible contents travel.
  const opts={duration:340,easing,fill:'both'},incoming=[...source.children].filter(el=>getComputedStyle(el).display!=='none');
  runs.push(old.clone.animate([{translate:'0 0'},{translate:-sign*old.r.width+'px 0'}],opts));incoming.forEach(el=>runs.push(el.animate([{translate:sign*old.r.width+'px 0',scale:.98},{translate:'0 0',scale:1}],opts)));
  Promise.all(runs.map(a=>a.finished)).then(()=>{if(panelRun===cleanup)cleanup();}).catch(()=>{});
 };
 window.finishPanelCarousel=()=>panelRun?.();
 window.beginReaderLayoutTransition=function(source){
  if(window.workspaceMotionBusy||reduced.matches||!source.getBoundingClientRect().height)return;
  readerRun?.();const old=stage(source),opacity=source.style.opacity,inert=source.inert;window.readerLayoutTransition=true;
  source.style.opacity='0';source.inert=true;
  const runs=[];let frame=0;
  const cleanup=()=>{cancelAnimationFrame(frame);runs.forEach(a=>a.cancel());old.mask.remove();if(opacity)source.style.opacity=opacity;else source.style.removeProperty('opacity');source.inert=inert;window.readerLayoutTransition=false;if(readerRun===cleanup)readerRun=null;document.dispatchEvent(new Event('desktop-layout-settled'));};readerRun=cleanup;
  return ()=>{frame=requestAnimationFrame(()=>{
   if(readerRun!==cleanup)return;
   runs.push(old.mask.animate([{opacity:1},{opacity:0}],{duration:120,easing:'ease-in',fill:'both'}),source.animate([{opacity:0},{opacity:1}],{duration:160,delay:120,easing:'ease-out',fill:'both'}));runs[1].finished.then(()=>{if(readerRun===cleanup)cleanup();}).catch(()=>{});
  });};
 };
 window.finishReaderLayoutTransition=()=>readerRun?.();
})();

// Labels roll vertically inside their own line; a single plate travels under the tabs.
(() => {
 const bar=document.querySelector('.workspace-tabs'),reduced=matchMedia('(prefers-reduced-motion: reduce)'),labels=new Map();let plate=null,plateRun=null,bounds=null;
 function shortLabel(button,text){if(bar.classList.contains('is-compressed'))text=text.replace('БГ · с комментариями','БГ · комм.').replace('БГ · параллельный перевод','БГ · перевод');return bar.classList.contains('is-compressed')?({'Новая вкладка':'Новая','ИИ-помощник':'ИИ','Мои полки':'Полки','Транслитерация':'Транслит.'}[text]||(text==='Бхагавад-гита'?'БГ'+(button.title.match(/Текст (\d+)/)?.[1]?' · 2.'+button.title.match(/Текст (\d+)/)[1]:''):text)):text;}
 function set(button,text,full=true){
  if(full){button.dataset.fullLabel=text;text=shortLabel(button,text);}
  const holder=button.querySelector(':scope>span');if(!holder)return;
  const id=button.dataset.switchTab,previous=holder.querySelector('.tab-label-text')?.textContent||labels.get(id)||holder.textContent;
  let line=holder.querySelector('.tab-label-text');if(!line){holder.classList.add('tab-label-window');holder.textContent='';line=document.createElement('span');line.className='tab-label-text';line.textContent=previous;holder.append(line);}
  if(line.textContent!==text){
   holder.getAnimations({subtree:true}).forEach(a=>a.cancel());holder.querySelectorAll('.tab-label-old').forEach(n=>n.remove());
   const old=document.createElement('span');old.className='tab-label-old';old.textContent=line.textContent;holder.append(old);line.textContent=text;
   if(!reduced.matches){const opts={duration:300,easing:'cubic-bezier(.22,.7,.2,1)'};old.animate([{translate:'0 0'},{translate:'0 -100%'}],opts);line.animate([{translate:'0 100%'},{translate:'0 0'}],opts).finished.then(()=>old.remove()).catch(()=>old.remove());}else old.remove();
  }
  labels.set(id,text);
 }
 window.tabLabelMotion={set,display:shortLabel};
 function place(){
  const item=bar.querySelector('.workspace-tab.is-current');if(!item)return;
  const r=item.getBoundingClientRect(),base=bar.getBoundingClientRect(),next={x:r.left-base.left,w:r.width,h:r.height};
  const connected=!!plate?.isConnected;
  if(!connected){plate=document.createElement('div');plate.className='workspace-tab-plate';plate.setAttribute('aria-hidden','true');bar.prepend(plate);}
  const from=connected&&plateRun&&(plateRun.playState==='running'||plateRun.playState==='paused')?{x:new DOMMatrixReadOnly(getComputedStyle(plate).transform).m41,w:plate.getBoundingClientRect().width}:bounds;
  plateRun?.cancel();Object.assign(plate.style,{transform:'translateX('+next.x+'px)',width:next.w+'px',height:next.h+'px'});
  if(from&&!reduced.matches&&(Math.abs(from.x-next.x)>.5||Math.abs(from.w-next.w)>.5))plateRun=plate.animate([{transform:'translateX('+from.x+'px)',width:from.w+'px'},{transform:'translateX('+next.x+'px)',width:next.w+'px'}],{duration:380,easing:'cubic-bezier(.22,.7,.2,1)'});
  bounds=next;
 }
 document.addEventListener('workspace-tabs-before-render',()=>{const r=plate?.getBoundingClientRect(),b=bar.getBoundingClientRect();if(r)bounds={x:r.left-b.left,w:r.width};});
 function update(){bar.querySelectorAll('.workspace-tab-select').forEach(b=>set(b,b.dataset.fullLabel||b.querySelector(':scope>span').textContent));place();}
 document.addEventListener('workspace-tabs-change',update);new ResizeObserver(()=>requestAnimationFrame(update)).observe(bar);bar.addEventListener('scroll',()=>requestAnimationFrame(place),true);update();
})();
