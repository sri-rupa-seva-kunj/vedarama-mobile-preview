// Prepare the few expensive mode-change surfaces while idle, before the next click.
(() => {
 const cache=new Map(),sources=[...document.querySelectorAll('.global-tab-header>.desktop-motion-slot>:first-child'),document.querySelector('.book-scroll')];let timer=0;
 function signature(el){const r=el.getBoundingClientRect();return [r.width,r.height,document.documentElement.dataset.theme,document.body.classList.contains('focus-mode'),document.body.classList.contains('paged-reading'),el.innerHTML].join('|');}
 function warm(){timer=0;if(window.headerMotionBusy||window.workspaceMotionBusy||window.readerLayoutTransition||document.getAnimations().some(a=>a.playState==='running'||a.playState==='paused')){timer=setTimeout(warm,160);return;}
  for(const el of sources){if(!el.getBoundingClientRect().height)continue;const key=signature(el),prior=cache.get(el);if(prior?.key===key)continue;prior?.cancel?.();const entry={key,clone:null};cache.set(el,entry);entry.cancel=window.desktopMotion.prepareSnapshot(el,clone=>{if(cache.get(el)===entry)entry.clone=clone;});}
 }
 function schedule(){clearTimeout(timer);timer=setTimeout(warm,180);}
 window.motionSnapshots={take(el){const entry=cache.get(el);if(entry?.clone&&entry.key===signature(el)){const clone=entry.clone.cloneNode(true);window.desktopMotion.refreshSnapshot(el,clone);return clone;}return window.desktopMotion.snapshot(el);}};
 document.addEventListener('desktop-layout-settled',schedule);document.addEventListener('workspace-tabs-change',schedule);window.addEventListener('resize',schedule);document.fonts.ready.then(schedule);
})();
