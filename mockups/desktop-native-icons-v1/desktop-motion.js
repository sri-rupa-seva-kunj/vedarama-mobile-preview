// Animate occupied space, with every slide clipped to its own region.
(() => {
 const reduced=matchMedia('(prefers-reduced-motion: reduce)'),duration=320,easing='cubic-bezier(.22,.7,.2,1)';
 const definitions=[
  ['.rail','x',-1],['.catalog','x',-1],['.inspector','x',1],
  ['#linked-books-panel','x',1],['#reading-bookmarks-panel','x',1],
  ['.tab-workspace .app-header','y',-1],['.reading-toolbar','y',-1],
  ['.reader-footer','y',1],['.review-bar','y',1],['.reading-tools','x',1],['.global-actions','x',1],
  ['.native-dialogs','x',-1],['.search-book-picker','x',-1],['#note-editor','y',-1]
 ];
 const popups='dialog,.veda-select-menu,#selection-actions,.toast';
 const surfaces='.continuous-reader,#workspace-panel,#notes-panel,#ai-panel';
 const entries=new Map(),seen=new Map(),leaving=new Map(),pending=[],paintQueue=new Map();let starting=true,painting=false,paintTimer=0,frame=0,appAnimation=null,appHeight=document.querySelector('.application').getBoundingClientRect().height,appFocus=document.body.classList.contains('focus-mode'),appViewport=innerHeight;
 function visible(el){const r=el.getBoundingClientRect();return r.width>0&&r.height>0&&getComputedStyle(el).display!=='none';}
 const freezeKeys=('display position top right bottom left width height min-width min-height max-width max-height box-sizing padding margin border border-radius background color font line-height letter-spacing word-spacing text-align text-decoration white-space word-break overflow-wrap direction writing-mode vertical-align flex flex-direction flex-wrap align-items align-self align-content justify-content justify-items justify-self gap grid-template-columns grid-template-rows grid-column grid-row overflow-x overflow-y opacity visibility z-index transform translate scale fill stroke stroke-width stroke-linecap stroke-linejoin appearance list-style object-fit column-count column-width column-gap column-fill break-inside break-before break-after float clear content box-shadow text-shadow font-feature-settings font-variation-settings -webkit-text-fill-color').split(' ');
 const svgKeys=('display color opacity visibility fill fill-opacity fill-rule stroke stroke-width stroke-opacity stroke-linecap stroke-linejoin stroke-dasharray stroke-dashoffset transform').split(' ');
 function copyStyle(source,target,pseudo=null,variables=false,computed=null){const style=computed||getComputedStyle(source,pseudo),keys=source instanceof SVGElement&&source.tagName!=='svg'&&!pseudo?svgKeys:freezeKeys;target.style.cssText=keys.map(key=>key+':'+style.getPropertyValue(key)+'!important').join(';');
  // In fragmented flex rows getComputedStyle resolves auto margins to zero.
  // Keep the computed keyword so the snapshot distributes free space identically.
  if(!pseudo&&source.computedStyleMap){const map=source.computedStyleMap();for(const side of ['top','right','bottom','left']){const key='margin-'+side;if(map.get(key)?.value==='auto')target.style.setProperty(key,'auto','important');}}
  if(variables)for(const key of style)if(key.startsWith('--'))target.style.setProperty(key,style.getPropertyValue(key),'important');}
 function repaint(source,clone){
  const originals=[source,...source.querySelectorAll('*')],copies=[clone,...clone.querySelectorAll('*')];
  copies.forEach(node=>{const original=originals[Number(node.dataset.motionSourceIndex)];if(!original)return;const style=getComputedStyle(original);['color','background-color','border-top-color','border-right-color','border-bottom-color','border-left-color','outline-color','fill','stroke','box-shadow','text-shadow',...Array.from(style).filter(key=>key.startsWith('--'))].forEach(key=>node.style.setProperty(key,style.getPropertyValue(key)));});
 }
 function snapshotPlan(el){
  const clone=el.cloneNode(true),source=[el,...el.querySelectorAll('*')],copies=[clone,...clone.querySelectorAll('*')];
  let index=0;
  function step(end){while(index<copies.length){const i=index++,node=copies[i];if(i&&!clone.contains(node))continue;const style=getComputedStyle(source[i]);if(i&&style.display==='none'){node.remove();continue;}copyStyle(source[i],node,null,i===0,style);node.dataset.motionSourceIndex=i;if(node.id)node.dataset.motionId=node.id;node.removeAttribute('id');if(source[i].scrollTop)node.dataset.motionScrollTop=source[i].scrollTop;if(source[i].scrollLeft)node.dataset.motionScrollLeft=source[i].scrollLeft;
   if(source[i].matches('.book-scroll')){const before=getComputedStyle(source[i],'::after');node.classList.add('motion-book-scroll-copy');if(before.content!=='none'&&before.display!=='none'){const divider=document.createElement('span');divider.className='motion-book-divider';divider.setAttribute('aria-hidden','true');copyStyle(source[i],divider,'::after');divider.style.content='normal';node.append(divider);}}
   if(performance.now()>=end)return false;
  }return true;}
  function complete(){
  ['inset','inset-block','inset-inline','inset-block-start','inset-block-end','inset-inline-start','inset-inline-end','top','right','bottom','left','margin','margin-block','margin-inline','margin-block-start','margin-block-end','margin-inline-start','margin-inline-end','inline-size','block-size','min-inline-size','max-inline-size','min-block-size','max-block-size'].forEach(key=>clone.style.removeProperty(key));
  clone.style.transform='none';clone.style.translate='none';clone.style.scale='none';clone.style.clipPath='none';clone.removeAttribute('hidden');clone.removeAttribute('popover');clone.inert=true;clone.setAttribute('aria-hidden','true');clone.classList.add('desktop-motion-ghost');return clone;
  }return {step,complete};
 }
 function snapshot(el){const plan=snapshotPlan(el);plan.step(Infinity);return plan.complete();}
 function prepareSnapshot(el,ready){const plan=snapshotPlan(el);let cancelled=false,job=0;const defer=fn=>window.requestIdleCallback?requestIdleCallback(fn,{timeout:120}):setTimeout(fn,16);function work(){if(cancelled)return;if(plan.step(performance.now()+5))ready(plan.complete());else job=defer(work);}job=defer(work);return ()=>{cancelled=true;if(window.cancelIdleCallback)cancelIdleCallback(job);else clearTimeout(job);};}
 function refreshSnapshot(source,clone){const originals=[source,...source.querySelectorAll('*')];for(const node of [clone,...clone.querySelectorAll('[data-motion-source-index]')]){const original=originals[Number(node.dataset.motionSourceIndex)];if(!original)continue;if(original.scrollTop||node.dataset.motionScrollTop)node.dataset.motionScrollTop=original.scrollTop;if(original.scrollLeft||node.dataset.motionScrollLeft)node.dataset.motionScrollLeft=original.scrollLeft;if('value'in original)node.value=original.value;if('checked'in original)node.checked=original.checked;}}
 function drainPaint(){paintTimer=0;if(painting||!paintQueue.size)return;if(window.workspaceMotionBusy||document.getAnimations().some(a=>a.playState==='running'||a.playState==='paused')){paintTimer=setTimeout(drainPaint,100);return;}const [entry,job]=paintQueue.entries().next().value;if(!entry.el.isConnected||!visible(entry.el)){paintQueue.delete(entry);drainPaint();return;}painting=true;prepareSnapshot(entry.el,clone=>{painting=false;if(paintQueue.get(entry)===job){if(visible(entry.el))entry.snapshot=clone;paintQueue.delete(entry);}drainPaint();});}
 function queuePaint(entry){paintQueue.set(entry,{});if(!painting&&!paintTimer)paintTimer=setTimeout(drainPaint,80);}
 function restoreScroll(clone){[clone,...clone.querySelectorAll('[data-motion-scroll-top],[data-motion-scroll-left]')].forEach(node=>{if(node.dataset.motionScrollTop)node.scrollTop=Number(node.dataset.motionScrollTop);if(node.dataset.motionScrollLeft)node.scrollLeft=Number(node.dataset.motionScrollLeft);});}
 function rememberInput(event){
  const target=event.target;if(!(target instanceof Element)||target.closest('.desktop-motion-ghost,.desktop-motion-mask'))return;
  const roots=[...entries].map(([el,entry])=>[el,entry.snapshot]).concat([...seen].filter(([el])=>el.matches(popups)).map(([el,entry])=>[el,entry.snapshot]));
  roots.forEach(([el,clone])=>{if(!clone||!el.contains(target))return;const source=[el,...el.querySelectorAll('*')],nodes=[clone,...clone.querySelectorAll('*')],index=source.indexOf(target),node=nodes.find(n=>Number(n.dataset.motionSourceIndex)===index);if(!node)return;if(event.type==='scroll'){node.dataset.motionScrollTop=target.scrollTop;node.dataset.motionScrollLeft=target.scrollLeft;}else if('value'in target){node.value=target.value;if('checked'in target)node.checked=target.checked;}});
 }
 function animate(el,key,from,to){const run=el.animate([{[key]:from},{[key]:to}],{duration,easing,fill:'both'});run.pause();run.currentTime=0;pending.push(run);run.finished.then(()=>run.cancel()).catch(()=>{});return run;}
 function wrap(el,axis,sign,initial){
  const rect=el.getBoundingClientRect(),slot=document.createElement('div');slot.className='desktop-motion-slot motion-'+axis;
  if(el.matches('.reading-tools'))slot.classList.add('motion-reading-tools');
  if(el.matches('.global-actions'))slot.classList.add('motion-global-actions');
  if(el.matches('.review-bar'))slot.classList.add('motion-review');
  el.before(slot);slot.append(el);
  slot.style[axis==='x'?'width':'height']=(initial?(axis==='x'?rect.width:rect.height):0)+'px';
  const entry={el,slot,axis,sign,visible:false,size:axis==='x'?rect.width:rect.height,animation:null,slide:null,ghost:null};entries.set(el,entry);return entry;
 }
 function clean(entry){entry.ghost?.remove();entry.ghost=null;entry.slot.classList.remove('is-moving');}
 function panel(entry,initial){
  const {el,slot,axis,sign}=entry,key=axis==='x'?'width':'height',style=getComputedStyle(el),overlay=['absolute','fixed'].includes(style.position);
  const current=slot.getBoundingClientRect()[key];slot.classList.toggle('is-overlay',overlay);
  // Expand the page slot before measuring its full-width child.
  const page=el.matches('.inspector')&&!el.hidden&&style.display!=='none'&&document.body.classList.contains('tool-page');slot.classList.toggle('is-page',page);const show=visible(el);
  const rect=el.getBoundingClientRect(),margin=axis==='y'?(parseFloat(style.marginTop)||0)+(parseFloat(style.marginBottom)||0):0,size=rect[key]+margin,target=show&&!overlay&&!page?size:0;
  const resized=show&&entry.visible&&axis==='x'&&!overlay&&!page&&Math.abs(size-entry.size)>1;
  const changed=show!==entry.visible||overlay!==entry.overlay||page!==entry.page||resized;
  if(changed&&!initial){
   if(!show&&entry.needsPaint&&entry.snapshot)repaint(el,entry.snapshot);
   entry.animation?.cancel();entry.slide?.cancel();entry.animation=null;entry.slide=null;clean(entry);slot.style[key]=target+'px';
   if(!reduced.matches&&!window.workspaceMotionBusy&&!document.body.classList.contains('resizing-catalog')&&!slot.parentElement.closest('.desktop-motion-slot.is-moving')){
    slot.classList.add('is-moving');
    if(!overlay&&!page&&!entry.overlay&&!entry.page){
     const node=show?el:entry.snapshot;
     if(node){
      if(!show){Object.assign(node.style,{position:'absolute',inset:'auto',left:'0',top:axis==='y'?entry.marginTop+'px':'0',width:axis==='x'?entry.size+'px':'100%',height:axis==='y'?entry.rect.height+'px':'100%',margin:'0'});slot.append(node);restoreScroll(node);entry.ghost=node;}
      const distance=show?size:entry.size,from=sign*(distance-current),to=show?0:sign*distance;
      if(!resized&&(axis==='y'||sign<0))entry.slide=animate(node,'transform',`translate${axis.toUpperCase()}(${from}px)`,`translate${axis.toUpperCase()}(${to}px)`);
     }
     entry.animation=animate(slot,key,current+'px',target+'px');
    }else if(show){
     const move=overlay&&innerWidth<=700?'Y':axis.toUpperCase();entry.animation=animate(el,'transform',`translate${move}(${overlay&&innerWidth<=700?100:sign*100}%)`,'translate(0)');
    }else if(entry.overlay){leave(el,{snapshot:entry.snapshot,rect:entry.rect},innerWidth<=700?'y':axis,innerWidth<=700?1:sign);}
    const run=entry.animation;
    (run?.finished||Promise.resolve()).catch(()=>{}).finally(()=>{if(entry.animation!==run)return;clean(entry);document.dispatchEvent(new Event('desktop-layout-settled'));});
   }
  }else if(initial||!entry.animation||entry.animation.playState==='finished')slot.style[key]=target+'px';
  entry.visible=show;entry.overlay=overlay;entry.page=page;
  if(show){entry.size=size;entry.rect=rect;entry.marginTop=parseFloat(style.marginTop)||0;const paint=style.backgroundColor+'|'+style.color+'|'+style.fontSize;if(changed||entry.needsPaint||!entry.snapshot||entry.content!==el.innerHTML||entry.paint!==paint){if(starting)entry.snapshot=snapshot(el);else queuePaint(entry);entry.content=el.innerHTML;entry.paint=paint;entry.needsPaint=false;}}
 }
 function leave(el,prior,axis='y',sign=-1){
  leaving.get(el)?.remove();if(!prior?.snapshot||reduced.matches)return;
  const r=prior.rect,modal=el.matches('dialog'),mask=document.createElement('div');mask.className='desktop-motion-mask';mask.inert=true;mask.setAttribute('aria-hidden','true');
  Object.assign(mask.style,modal?{left:'0',top:'0',width:'100vw',height:'100dvh'}:{left:r.left+'px',top:r.top+'px',width:r.width+'px',height:r.height+'px'});
  if(modal){const backdrop=document.createElement('div');backdrop.className='desktop-motion-backdrop';mask.append(backdrop);animate(backdrop,'opacity',prior.backdropOpacity||'1','0');}
  const clone=prior.snapshot;Object.assign(clone.style,{position:'absolute',inset:'auto',left:modal?r.left+'px':'0',top:modal?r.top+'px':'0',width:r.width+'px',height:r.height+'px',margin:'0'});mask.append(clone);document.body.append(mask);restoreScroll(clone);leaving.set(el,mask);
  const popup=el.matches(popups),current=prior.leaveFrom||getComputedStyle(el).translate,from=popup&&current&&current!=='none'?current:'0 0';
  if(popup)el.getAnimations().forEach(run=>run.cancel());
  const run=popup?animate(clone,'translate',from,modal?'0 '+(-r.bottom)+'px':axis==='y'?'0 '+(sign*100)+'%':(sign*100)+'% 0'):animate(clone,'transform','translate(0)',`translate${axis.toUpperCase()}(${sign*100}%)`);run.finished.catch(()=>{}).finally(()=>{mask.remove();if(leaving.get(el)===mask)leaving.delete(el);});
 }
 function scan(initial=false){
  // Transformed rectangles are visual coordinates, not panel layout sizes.
  // Measuring them during the carousel made the catalogue shrink repeatedly.
  if(window.workspaceMotionBusy&&document.querySelector('.workspace-scene.is-carousel-moving'))return;
  definitions.forEach(([selector,axis,sign])=>document.querySelectorAll(selector).forEach(el=>{if(!el.closest('.desktop-motion-ghost,.desktop-motion-mask')&&!entries.has(el))wrap(el,axis,sign,initial);}));
  const app=document.querySelector('.application'),focus=document.body.classList.contains('focus-mode');
  if(!initial&&(focus!==appFocus||innerHeight!==appViewport)){const from=appAnimation?.playState==='running'||appAnimation?.playState==='paused'?app.getBoundingClientRect().height:appHeight;appAnimation?.cancel();const to=getComputedStyle(app).height;appHeight=parseFloat(to);if(!reduced.matches&&!window.workspaceMotionBusy)appAnimation=animate(app,'height',from+'px',to);}appFocus=focus;appViewport=innerHeight;
  for(const [el,entry]of entries){if(!el.isConnected){
   entry.animation?.cancel();entry.slide?.cancel();
   const form=document.querySelector('#library-search-form');
   if(entry.axis==='y'&&el.matches('.search-book-picker')&&entry.visible&&entry.snapshot&&form&&!reduced.matches){
    const node=entry.snapshot;Object.assign(node.style,{position:'absolute',inset:'auto',left:'0',top:entry.marginTop+'px',width:entry.rect.width+'px',height:entry.rect.height+'px',margin:'0'});
    entry.slot.replaceChildren(node);entry.slot.style.height='0px';entry.slot.classList.add('is-moving');form.append(entry.slot);restoreScroll(node);
    animate(node,'transform','translateY(0)','translateY('+(-entry.size)+'px)');const run=animate(entry.slot,'height',entry.size+'px','0px');run.finished.catch(()=>{}).finally(()=>entry.slot.remove());
   }else entry.slot.remove();entries.delete(el);
  }else panel(entry,initial);}
  const nodes=new Set(document.querySelectorAll(popups+','+surfaces));
  for(const [el,prior]of seen)if(!nodes.has(el)){if(prior.visible&&!el.closest('.desktop-motion-ghost,.desktop-motion-mask'))leave(el,prior);seen.delete(el);}
  for(const el of nodes){
   if(el.closest('.desktop-motion-ghost,.desktop-motion-mask'))continue;
   const show=visible(el),prior=seen.get(el),popup=el.matches(popups),owner=el.closest('.desktop-motion-slot'),rect=prior?.visible&&el.getAnimations().some(a=>a.playState==='running'||a.playState==='paused')?prior.rect:el.getBoundingClientRect();
   const route=el.matches('#workspace-panel')?section+'|'+savedTab+'|'+(activeShelf||''):el.matches('.continuous-reader')?'read':view+'|'+toolMode;
   if(!initial&&show&&(!prior?.visible||(!popup&&route!==prior.route))&&!reduced.matches&&(popup||!window.workspaceMotionBusy&&!window.panelMotionBusy)){leaving.get(el)?.remove();leaving.delete(el);if(!owner?.classList.contains('is-moving')){el.getAnimations().filter(a=>a.animationName!=='desktop-backdrop-in').forEach(a=>a.cancel());const run=animate(el,'translate',el.matches('dialog')?'0 '+(-rect.bottom)+'px':popup?'0 -100%':'100% 0','0 0');if(popup&&!el.matches('dialog'))animate(el,'clipPath','inset(100% 0 0 0)','inset(0 0 0 0)');run.finished.then(()=>document.dispatchEvent(new Event('desktop-layout-settled'))).catch(()=>{});}}
   if(!initial&&!show&&prior?.visible&&popup)leave(el,prior);
   seen.set(el,{visible:show,rect,snapshot:show&&popup?snapshot(el):null,route});
  }
  // Start together after snapshots are ready. A busy frame must not consume the slide's duration.
  const now=performance.now();pending.splice(0).forEach(run=>{if(run.playState==='paused'){run.play();run.startTime=now;}});
 }
 window.desktopMotion={snapshot,prepareSnapshot,refreshSnapshot,restoreScroll,flush(animate=false){if(frame){cancelAnimationFrame(frame);frame=0;}scan(!animate);},settle(){for(const run of document.getAnimations())if(run.playState==='running'||run.playState==='paused')try{run.finish();}catch{}}};
 function schedule(){if(!frame)frame=requestAnimationFrame(()=>{frame=0;scan();});}
 new MutationObserver(records=>{if(records.some(r=>!r.target.closest?.('.desktop-motion-ghost,.desktop-motion-mask')&&!r.target.matches?.('.desktop-motion-slot')&&(r.type==='childList'||r.target===document.body||r.target.matches?.(popups+','+surfaces+','+definitions.map(d=>d[0]).join(',')))))schedule();}).observe(document.body,{attributes:true,attributeFilter:['class','hidden','open'],childList:true,subtree:true});
 document.addEventListener('beforetoggle',event=>{if(event.newState==='closed'){const prior=seen.get(event.target);if(prior){prior.leaveFrom=getComputedStyle(event.target).translate;if(event.target.matches('dialog'))prior.backdropOpacity=getComputedStyle(event.target,'::backdrop').opacity;}}},true);
 let themePaintTimer=0;
 new MutationObserver(records=>{entries.forEach(entry=>entry.needsPaint=true);schedule();if(records.some(record=>record.attributeName==='class'||record.attributeName==='data-theme')){clearTimeout(themePaintTimer);themePaintTimer=setTimeout(()=>{entries.forEach(entry=>entry.needsPaint=true);schedule();},360);}}).observe(document.documentElement,{attributes:true,attributeFilter:['class','style','data-theme']});
 window.addEventListener('resize',schedule);document.addEventListener('workspace-tabs-change',schedule);document.addEventListener('desktop-layout-settled',schedule);scan(true);starting=false;
 document.addEventListener('scroll',rememberInput,true);document.addEventListener('input',rememberInput,true);document.addEventListener('change',rememberInput,true);
 const naturalSizes=new ResizeObserver(schedule);['.catalog','.reading-tools','.global-actions'].forEach(selector=>naturalSizes.observe(document.querySelector(selector)));
 document.fonts.ready.then(()=>{entries.forEach(entry=>entry.needsPaint=true);schedule();});
})();
