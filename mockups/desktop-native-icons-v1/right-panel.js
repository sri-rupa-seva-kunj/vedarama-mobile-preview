// Every contextual tool shares one saved width and the same left-edge resize handle.
(() => {
 const panels=[document.querySelector('.inspector'),document.querySelector('#linked-books-panel'),document.querySelector('#reading-bookmarks-panel')],layout=document.querySelector('.reading-layout');
 const widthKey='vedarama-right-panel-width',defaultWidth=410,minWidth=320;
 let preferred=Number(localStorage.getItem(widthKey))||defaultWidth,drag=null,frame=0;
 const splitter=document.createElement('div');splitter.id='right-panel-resizer';splitter.tabIndex=0;splitter.role='separator';splitter.hidden=true;
 splitter.setAttribute('aria-orientation','vertical');splitter.setAttribute('aria-label','Ширина боковой панели');
 splitter.setAttribute('aria-description','Перетащите границу. Стрелка влево расширяет панель, вправо сужает. Двойной щелчок возвращает исходную ширину.');document.body.append(splitter);
 function limits(){return {min:minWidth,max:Math.max(minWidth,Math.min(640,(layout.clientWidth||innerWidth)-320))};}
 function applyWidth(value,save=false){
  const {min,max}=limits(),width=Math.round(Math.max(min,Math.min(max,value))),text=width+'px';
  if(document.documentElement.style.getPropertyValue('--right-panel-width')!==text)document.documentElement.style.setProperty('--right-panel-width',text);
  splitter.setAttribute('aria-valuemin',min);splitter.setAttribute('aria-valuemax',max);splitter.setAttribute('aria-valuenow',width);splitter.setAttribute('aria-valuetext',width+' пикселей');
  if(save){preferred=width;localStorage.setItem(widthKey,width);}return width;
 }
 function current(){return section==='read'&&!document.body.classList.contains('tool-page')?panels.find(panel=>!panel.hidden&&getComputedStyle(panel).display!=='none'&&panel.getBoundingClientRect().width):null;}
 function place(){
  frame=0;if(innerWidth<=700){splitter.hidden=true;return;}applyWidth(preferred);const panel=current();if(!panel){splitter.hidden=true;return;}
  const rect=panel.getBoundingClientRect(),slot=panel.closest('.desktop-motion-slot');
  const incomplete=slot&&Math.abs(slot.getBoundingClientRect().width-rect.width)>1;
  splitter.hidden=!drag&&(incomplete||!!window.workspaceMotionBusy||!!window.panelMotionBusy||!!window.readerLayoutTransition||!!document.querySelector('.desktop-motion-slot.is-moving'));
  splitter.setAttribute('aria-controls',panel.id);Object.assign(splitter.style,{left:(rect.left-4)+'px',top:rect.top+'px',height:rect.height+'px'});
 }
 function schedule(){if(!frame)frame=requestAnimationFrame(place);}
 function stop(){if(!drag)return;drag=null;document.body.classList.remove('resizing-catalog','resizing-right-panel');schedule();}
 splitter.addEventListener('pointerdown',event=>{const panel=current();if(event.button!==0||!panel)return;event.preventDefault();splitter.focus({preventScroll:true});drag={id:event.pointerId,x:event.clientX,width:panel.getBoundingClientRect().width};splitter.setPointerCapture(event.pointerId);document.body.classList.add('resizing-catalog','resizing-right-panel');});
 document.addEventListener('pointermove',event=>{if(!drag||drag.id!==event.pointerId)return;applyWidth(drag.width+drag.x-event.clientX,true);window.desktopMotion?.flush();place();});
 ['pointerup','pointercancel','lostpointercapture'].forEach(name=>splitter.addEventListener(name,stop));document.addEventListener('pointerup',stop);
 splitter.addEventListener('dblclick',()=>{applyWidth(defaultWidth,true);window.desktopMotion?.flush();place();});
 splitter.addEventListener('keydown',event=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;event.preventDefault();const {min,max}=limits();applyWidth(event.key==='Home'?min:event.key==='End'?max:Number(splitter.getAttribute('aria-valuenow'))+(event.key==='ArrowLeft'?1:-1)*(event.shiftKey?10:20),true);window.desktopMotion?.flush();place();});
 const observer=new ResizeObserver(schedule);panels.forEach(panel=>observer.observe(panel));observer.observe(layout);
 // Ignore the handle's own hidden attribute so idle pages do not keep repainting.
 new MutationObserver(records=>{if(records.some(record=>record.target===document.body||panels.includes(record.target)))schedule();}).observe(document.body,{attributes:true,attributeFilter:['class','hidden'],subtree:true});
 document.addEventListener('desktop-layout-settled',schedule);window.addEventListener('resize',schedule);applyWidth(preferred);schedule();
})();
