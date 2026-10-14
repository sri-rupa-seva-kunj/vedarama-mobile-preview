// Fade cards near their place; hide large position changes while the list resizes.
(() => {
 const reduced=matchMedia('(prefers-reduced-motion: reduce)'),fadeTime=420,resizeTime=360,stagger=24,easing='cubic-bezier(.25,.1,.25,1)';let current=null;
 function finish(){current?.finish();}
 const original=renderActivity;
 renderActivity=function(){
  finish();const previous=document.querySelector('.activity-list');
  if(!previous||section!=='activity'||window.workspaceMotionBusy||reduced.matches){original();return;}
  const measure=(nodes,origin)=>new Map(nodes.map((node,index)=>{const rect=node.getBoundingClientRect();return [node.dataset.activityId||'empty',{node,index,height:rect.height,top:rect.top-origin}];}));
  const oldRows=[...previous.children],old=measure(oldRows,previous.getBoundingClientRect().top),gap=parseFloat(getComputedStyle(previous).rowGap)||0;
  original();const list=document.querySelector('.activity-list'),rows=[...list.children],next=measure(rows,list.getBoundingClientRect().top);
  if([...old].every(([id,item])=>next.has(id)&&item.node.outerHTML===next.get(id).node.outerHTML)&&old.size===next.size)return;
  const exitFrames=[{translate:'0 0',opacity:1},{translate:'-14px 0',opacity:0}],enterFrames=[{translate:'14px 0',opacity:0},{translate:'0 0',opacity:1}];
  const runs=[],jobs=[];let done=false;
  const cleanup=()=>{if(done)return;done=true;runs.forEach(run=>run.cancel());rows.forEach(node=>node.classList.remove('activity-motion-card'));list.classList.remove('is-list-moving');list.replaceChildren(...rows);if(current?.list===list)current=null;document.dispatchEvent(new Event('desktop-layout-settled'));};
  current={list,finish:cleanup};list.classList.add('is-list-moving');
  const animate=(node,frames,duration,delay=0)=>{const run=node.animate(frames,{duration,delay,easing,fill:'both'});runs.push(run);jobs.push(run.finished);};
  const card=(node,ghost=false)=>{node.classList.add('activity-motion-card');if(ghost){node.inert=true;node.setAttribute('aria-hidden','true');}return node;};
  // Insert new slots before their next surviving neighbour so cleanup never reorders cards.
  const order=[...old.keys()],nextOrder=[...next.keys()];
  nextOrder.forEach((id,index)=>{if(old.has(id))return;const anchor=nextOrder.slice(index+1).find(key=>order.includes(key));order.splice(anchor?order.indexOf(anchor):order.length,0,id);});
  const height=(item,length)=>item?item.height+(item.index<length-1?gap:0):0;
  const displaced=id=>old.has(id)&&next.has(id)&&Math.abs(old.get(id).top-next.get(id).top)>14;
  const removed=[...old.keys()].filter(id=>!next.has(id)),moves=nextOrder.some(displaced),resizes=order.some(id=>Math.abs(height(old.get(id),oldRows.length)-height(next.get(id),rows.length))>.5);
  const exitEnd=removed.length||moves?fadeTime+Math.min(Math.max(removed.length-1,0),3)*stagger:0,layoutEnd=exitEnd+(resizes?resizeTime:0);
  list.replaceChildren();let exitIndex=0,enterIndex=0;
  for(const id of order){
   const before=old.get(id),after=next.get(id),from=height(before,oldRows.length),to=height(after,rows.length),wrapper=document.createElement('div');wrapper.className='activity-motion-row';wrapper.style.height=from+'px';list.append(wrapper);
   if(!after){wrapper.append(card(before.node,true));animate(before.node,exitFrames,fadeTime,Math.min(exitIndex++,3)*stagger);}
   else if(!before){wrapper.append(card(after.node));animate(after.node,enterFrames,fadeTime,layoutEnd+Math.min(enterIndex++,3)*stagger);}
   else if(displaced(id)||before.node.outerHTML!==after.node.outerHTML){wrapper.append(card(before.node,true),card(after.node));animate(before.node,exitFrames,fadeTime);animate(after.node,enterFrames,fadeTime,displaced(id)?layoutEnd:0);}
   else wrapper.append(card(after.node));
   if(Math.abs(from-to)>.5)animate(wrapper,[{height:from+'px'},{height:to+'px'}],resizeTime,exitEnd);
  }
  Promise.allSettled(jobs).then(cleanup);
 };
 window.activityMotion={finish,get active(){return !!current;}};
})();
