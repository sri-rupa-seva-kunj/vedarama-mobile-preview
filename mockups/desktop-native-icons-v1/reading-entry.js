// From other workspaces, reveal the book before expanding the reading chrome.
(() => {
 const button=$('#focus'),nativeFocus=button.onclick,reduced=matchMedia('(prefers-reduced-motion: reduce)');let generation=0,pending=false;
 const previousShow=showSection;showSection=function(next,reset=true){if(pending&&next!=='read'){generation++;pending=false;}return previousShow(next,reset);};
 async function waitForBook(){
  if(!window.pageCarousel?.active)return;
  await new Promise(resolve=>{let timer;const finish=()=>{clearTimeout(timer);document.removeEventListener('desktop-layout-settled',check);resolve();};const check=()=>{if(!window.pageCarousel?.active)finish();};document.addEventListener('desktop-layout-settled',check);timer=setTimeout(()=>{window.pageCarousel?.finish();finish();},1100);check();});
 }
 button.onclick=async function(event){
  if(pending){generation++;pending=false;return;}
  if(document.body.classList.contains('focus-mode')||section==='read'){nativeFocus.call(this,event);return;}
  const token=++generation;pending=true;showSection('read');await waitForBook();
  if(token!==generation||section!=='read'){pending=false;return;}
  if(!reduced.matches)await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
  if(token!==generation||section!=='read'){pending=false;return;}
  pending=false;nativeFocus.call(this,event);
 };
 window.readingEntry={get active(){return pending;},cancel(){generation++;pending=false;}};
 document.addEventListener('workspace-tabs-before-render',()=>{if(pending&&section!=='read'){generation++;pending=false;}});
})();
