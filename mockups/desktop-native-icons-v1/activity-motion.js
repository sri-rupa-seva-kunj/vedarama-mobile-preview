// Keyed activity rows keep their place while filtering changes the list.
(() => {
 const reduced=matchMedia('(prefers-reduced-motion: reduce)'),slideTime=240,resizeTime=220,stagger=40,easing='cubic-bezier(.22,.7,.2,1)';let current=null;
 function finish(){current?.finish();}
 const original=renderActivity;
 renderActivity=function(){
  finish();const previous=document.querySelector('.activity-list');
  if(!previous||section!=='activity'||window.workspaceMotionBusy||reduced.matches){original();return;}
  const oldRows=[...previous.children],old=new Map(oldRows.map((node,i)=>[node.dataset.activityId||'empty',{node,height:node.getBoundingClientRect().height,index:i}])),gap=parseFloat(getComputedStyle(previous).rowGap)||0;
  original();const list=document.querySelector('.activity-list'),rows=[...list.children],next=new Map(rows.map((node,i)=>[node.dataset.activityId||'empty',{node,height:node.getBoundingClientRect().height,index:i}]));
  if([...old].every(([id,item])=>next.has(id)&&item.node.outerHTML===next.get(id).node.outerHTML)&&old.size===next.size)return;
  const runs=[],jobs=[];let done=false;
  const cleanup=()=>{if(done)return;done=true;runs.forEach(run=>run.cancel());rows.forEach(node=>node.classList.remove('activity-motion-card'));list.classList.remove('is-list-moving');list.replaceChildren(...rows);if(current?.list===list)current=null;document.dispatchEvent(new Event('desktop-layout-settled'));};
  current={list,finish:cleanup};list.classList.add('is-list-moving');
  const animate=(node,frames,duration,delay=0)=>{const run=node.animate(frames,{duration,delay,easing,fill:'both'});runs.push(run);return run;};
  const slot=(height,card)=>{const el=document.createElement('div');el.className='activity-motion-row';el.style.height=height+'px';if(card)el.append(card);return el;};
  const card=(node,ghost=false)=>{node.classList.add('activity-motion-card');if(ghost){node.inert=true;node.setAttribute('aria-hidden','true');}return node;};
  const intersection=[...old.keys()].filter(id=>next.has(id));
  if(!intersection.length&&old.size&&next.size&&!old.has('empty')&&!next.has('empty')){
   list.replaceChildren();const length=Math.max(oldRows.length,rows.length);
   for(let i=0;i<length;i++){const before=oldRows[i],after=rows[i],from=before?(old.get(before.dataset.activityId||'empty').height+(i<oldRows.length-1?gap:0)):0,to=after?(next.get(after.dataset.activityId||'empty').height+(i<rows.length-1?gap:0)):0,delay=Math.min(i,6)*stagger,wrapper=slot(from);list.append(wrapper);
    if(before){wrapper.append(card(before,true));animate(before,[{translate:'0 0'},{translate:'-100% 0'}],slideTime,delay);}
    if(after){wrapper.append(card(after));animate(after,[{translate:'100% 0'},{translate:'0 0'}],slideTime,delay);}
    jobs.push(animate(wrapper,[{height:from+'px'},{height:to+'px'}],slideTime,delay).finished);
   }
  }else{
   const removed=[...old.keys()].filter(id=>!next.has(id)),inserted=[...next.keys()].filter(id=>!old.has(id)),order=activityItems.map(x=>x.id).concat('empty').filter(id=>old.has(id)||next.has(id)),exitEnd=removed.length?slideTime+Math.min(removed.length-1,6)*stagger:0;
   list.replaceChildren();let exitIndex=0,enterIndex=0;
   for(const id of order){const before=old.get(id),after=next.get(id),from=before?before.height+(before.index<oldRows.length-1?gap:0):0,to=after?after.height+(after.index<rows.length-1?gap:0):0,wrapper=slot(from);list.append(wrapper);
    if(!after){wrapper.append(card(before.node,true));animate(before.node,[{translate:'0 0'},{translate:'-100% 0'}],slideTime,Math.min(exitIndex++,6)*stagger);}
    else if(!before){wrapper.append(card(after.node));jobs.push(animate(after.node,[{translate:'100% 0'},{translate:'0 0'}],slideTime,exitEnd+resizeTime+Math.min(enterIndex++,6)*stagger).finished);}
    else if(before.node.outerHTML!==after.node.outerHTML){wrapper.append(card(before.node,true),card(after.node));animate(before.node,[{translate:'0 0'},{translate:'-100% 0'}],slideTime);jobs.push(animate(after.node,[{translate:'100% 0'},{translate:'0 0'}],slideTime).finished);}
    else wrapper.append(card(after.node));
    if(Math.abs(from-to)>.5)jobs.push(animate(wrapper,[{height:from+'px'},{height:to+'px'}],resizeTime,exitEnd).finished);
   }
  }
  Promise.allSettled(jobs).then(cleanup);
 };
 window.activityMotion={finish,get active(){return !!current;}};
})();
