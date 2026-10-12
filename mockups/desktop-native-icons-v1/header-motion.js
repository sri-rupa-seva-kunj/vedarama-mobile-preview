// Capture before changing the mode; interpolate layout instead of moving resized copies.
(() => {
 const header=document.querySelector('.global-tab-header'),brand=header.querySelector('.brand'),bar=header.querySelector('.workspace-tabs');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)'),duration=320,easing='cubic-bezier(.22,.7,.2,1)';let current=null;
 const groups=()=>[...header.querySelectorAll(':scope>.desktop-motion-slot')].map(slot=>({slot,el:slot.firstElementChild}));
 const shown=el=>getComputedStyle(el).display!=='none'&&el.getBoundingClientRect().width>0;
 function metrics(){const s=getComputedStyle(header),b=getComputedStyle(brand);return {grid:s.gridTemplateColumns,padding:s.paddingRight,left:b.paddingLeft,right:b.paddingRight};}
 function tabMetrics(){return [...bar.querySelectorAll('.workspace-tab')].map(el=>{const select=el.querySelector('.workspace-tab-select'),icon=select.querySelector(':scope>svg,:scope>i'),style=getComputedStyle(select);return {el,select,icon,width:el.getBoundingClientRect().width,iconWidth:icon?.getBoundingClientRect().width||0,gap:parseFloat(style.gap)||0,padding:style.paddingLeft};});}
 function finish(){current?.cleanup();}
 function change(apply){
  if(innerWidth<=700||reduced.matches){finish();apply();window.arrangeReaderHeader();window.desktopMotion.headerSizes();return;}
  const start=performance.now(),wasFocus=document.body.classList.contains('focus-mode'),before=metrics(),tabs=tabMetrics(),copies=groups().filter(g=>shown(g.el)).map(g=>({...g,copy:window.motionSnapshots.take(g.el)}));
  const measured=performance.now();finish();window.headerMotionBusy=true;
  apply();window.arrangeReaderHeader();const applied=performance.now();
  // Resolve final natural widths once, with no intermediate density recalculation.
  window.headerMotionBusy=false;window.desktopMotion.headerSizes();window.tabStripLayout.update(true);window.headerMotionBusy=true;
  const after=metrics(),targetTabs=tabMetrics(),targetGroups=groups().map(g=>({...g,visible:shown(g.el)})),runs=[],ghosts=[],touched=[];const sized=performance.now();
  header.classList.add('is-header-moving');
  function animate(el,frames,options={}){const run=el.animate(frames,{duration,easing,fill:'both',...options});runs.push(run);return run;}
  const layout=animate(header,[{gridTemplateColumns:before.grid,paddingRight:before.padding},{gridTemplateColumns:after.grid,paddingRight:after.padding}]);
  animate(brand,[{paddingLeft:before.left,paddingRight:before.right},{paddingLeft:after.left,paddingRight:after.right}]);
  if(wasFocus&&!document.body.classList.contains('focus-mode')&&window.readerLayoutTransition)animate(document.querySelector('.reading-toolbar'),[{opacity:0},{opacity:1}],{duration:180,delay:120});
  for(const old of copies){if(!targetGroups.find(g=>g.el===old.el)?.visible||old.el.matches('.global-actions')){const clone=old.copy,opacity=clone.style.opacity===""?1:Number(clone.style.opacity);clone.style.opacity=String(opacity);clone.classList.add('header-control-copy');old.slot.append(clone);ghosts.push(clone);animate(clone,[{opacity},{opacity:0}],{duration:140});}}
  for(const g of targetGroups){if(!g.visible)continue;const old=copies.find(c=>c.el===g.el);if(!old||g.el.matches('.global-actions'))animate(g.el,[{opacity:0},{opacity:1}],{duration:180,delay:old?140:70});}
  tabs.forEach(old=>{const next=targetTabs.find(t=>t.el===old.el);if(!next)return;animate(old.el,[{flexBasis:old.width+'px'},{flexBasis:next.width+'px'}]);
   if(old.icon&&old.iconWidth!==next.iconWidth){const icon=old.icon;icon.style.display='inline-flex';icon.style.flex='none';icon.style.overflow='clip';old.select.style.gap='0';touched.push([icon,'display','flex','overflow'],[old.select,'gap']);
    animate(icon,[{width:old.iconWidth+'px',opacity:old.iconWidth?1:0,marginRight:old.iconWidth?old.gap+'px':'0px'},{width:next.iconWidth+'px',opacity:next.iconWidth?1:0,marginRight:next.iconWidth?next.gap+'px':'0px'}]);
   }
   animate(old.select,[{paddingLeft:old.padding},{paddingLeft:next.padding}]);
  });
  let frame=0;const transaction={runs,cleanup(){if(current!==transaction)return;cancelAnimationFrame(frame);runs.forEach(a=>a.cancel());ghosts.forEach(n=>n.remove());touched.forEach(([el,...keys])=>keys.forEach(key=>el.style.removeProperty(key)));header.classList.remove('is-header-moving');current=null;window.headerMotionBusy=false;window.desktopMotion.headerSizes();window.tabStripLayout.update(true);window.tabLabelMotion.refreshPlate();document.dispatchEvent(new Event('desktop-layout-settled'));}};current=transaction;
  const clock=performance.now();runs.forEach(run=>{run.startTime=clock;});window.headerLayoutMotion.lastCost=performance.now()-start;window.headerLayoutMotion.timings={capture:measured-start,apply:applied-measured,size:sized-applied,animate:performance.now()-sized};
  function tick(){if(current!==transaction)return;window.tabLabelMotion.refreshPlate();frame=requestAnimationFrame(tick);}tick();
  layout.finished.then(()=>transaction.cleanup()).catch(()=>{});
 }
 window.headerLayoutMotion={change,finish,owns:run=>!!current?.runs.includes(run)};
 window.setReaderFocusMode=value=>{if(value===document.body.classList.contains('focus-mode')){syncReadingLayout();return;}change(()=>{document.body.classList.toggle('focus-mode',value);syncReadingLayout();});};
 for(const id of ['focus','exit-reading']){const button=document.getElementById(id),previous=button.onclick;button.onclick=function(event){return change(()=>previous.call(this,event));};}
 window.addEventListener('resize',()=>{if(current)finish();});
})();
