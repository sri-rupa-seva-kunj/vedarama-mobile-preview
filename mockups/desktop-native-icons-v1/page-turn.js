// A sheet turns around the spine; the next spread stays stationary underneath.
(() => {
 let current=null;
 const duration=620,easing='cubic-bezier(.4,0,.2,1)';
 function clear(notify=false){
  if(!current)return;const turn=current;current=null;
  turn.runs.forEach(run=>run.cancel());turn.stage.remove();window.readerPageTurning=false;
  if(notify)turn.complete();document.dispatchEvent(new Event('desktop-layout-settled'));
 }
 function start(viewport,old,sign,complete){
  clear();const next=window.desktopMotion.snapshot(viewport),r=viewport.getBoundingClientRect(),owner=viewport.parentElement,base=owner.getBoundingClientRect(),half=r.width/2;
  const stage=document.createElement('div');stage.className='page-turn-stage';stage.dataset.direction=sign>0?'forward':'backward';stage.inert=true;stage.setAttribute('aria-hidden','true');
  Object.assign(stage.style,{left:(r.left-base.left+owner.scrollLeft)+'px',top:(r.top-base.top+owner.scrollTop)+'px',width:r.width+'px',height:r.height+'px'});
  function face(className,copy,offset){const node=document.createElement('div');node.className=className;Object.assign(copy.style,{position:'absolute',left:-offset+'px',top:'0',width:r.width+'px',height:r.height+'px',maxWidth:'none',margin:'0'});node.append(copy);window.desktopMotion.restoreScroll(copy);return node;}
  const forward=sign>0,stationary=face('page-turn-stationary',old.cloneNode(true),forward?0:half),sheet=document.createElement('div');sheet.className='page-turn-sheet';
  stationary.style.left=forward?'0':'50%';sheet.style.left=forward?'50%':'0';sheet.style.transformOrigin=forward?'0 50%':'100% 50%';
  const front=face('page-turn-face page-turn-front',old,forward?half:0),back=face('page-turn-face page-turn-back',next,forward?0:half);
  const frontShade=document.createElement('div'),backShade=document.createElement('div');frontShade.className=backShade.className='page-turn-shade';front.append(frontShade);back.append(backShade);sheet.append(front,back);stage.append(stationary,sheet);owner.append(stage);
  window.desktopMotion.restoreScroll(stage);window.readerPageTurning=true;
  const opts={duration,easing,fill:'both'},turn={stage,runs:[],complete};current=turn;
  turn.runs.push(sheet.animate([{transform:'rotateY(0deg)'},{transform:'rotateY('+(-sign*180)+'deg)'}],opts));
  turn.runs.push(frontShade.animate([{opacity:0},{opacity:.18,offset:.5},{opacity:0}],opts),backShade.animate([{opacity:0},{opacity:.22,offset:.5},{opacity:0}],opts));
  const now=performance.now();turn.runs.forEach(run=>run.startTime=now);
  turn.runs[0].finished.then(()=>{if(current===turn)clear(true);}).catch(()=>{});
 }
 window.readerPageTurn={start,cancel:()=>clear(),get active(){return !!current;}};
})();
