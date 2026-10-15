// Reading navigation is shared by the toolbar and its counterpart in reading mode.
(() => {
 const toolbar=document.querySelector('.reading-toolbar'),related=document.querySelector('#linked-books-toggle');
 document.querySelector('.breadcrumbs').hidden=true;const actions=toolbar.querySelector('.reader-actions');actions.insertBefore(related,actions.querySelector('#bookmark'));
 const focusRelated=related.cloneNode(true);focusRelated.id='reading-related';focusRelated.title='Текст в других книгах';
 focusRelated.setAttribute('aria-label','Текст в других книгах');focusRelated.setAttribute('aria-controls','linked-books-panel');
 document.querySelector('.reading-tools').insertBefore(focusRelated,document.querySelector('#reading-pages'));
 focusRelated.onclick=()=>related.click();
 const readingActions=document.querySelector('.reading-tools');
 ['reading-related','reading-bookmarks','reading-appearance','reading-notes','reading-ai','reading-pages','exit-reading','reading-more'].forEach(id=>{const button=document.getElementById(id);if(button)readingActions.append(button);});
 const favorite=document.querySelector('#bookmark');favorite.insertAdjacentHTML('beforeend','<span>В избранное</span>');
 const nav=document.querySelector('.chapter-navigation'),tools=document.querySelector('.reading-tools');
 const catalogPosition=document.createElement('div');catalogPosition.className='reading-catalog-position';document.querySelector('.workspace-tabs').before(catalogPosition);catalogPosition.append(document.querySelector('#reading-catalog'));
 function placeNavigation(){const target=document.body.classList.contains('focus-mode')?tools:toolbar;if(nav.parentElement!==target){if(target===tools)tools.prepend(nav);else toolbar.insertBefore(nav,actions);}}
 window.arrangeReaderHeader=placeNavigation;placeNavigation();new MutationObserver(placeNavigation).observe(document.body,{attributes:true,attributeFilter:['class']});
 window.desktopHints.register([...tools.querySelectorAll('button'),...nav.querySelectorAll('button')]);
 const syncRelated=()=>focusRelated.setAttribute('aria-pressed',related.getAttribute('aria-pressed')||'false');
 new MutationObserver(syncRelated).observe(related,{attributes:true,attributeFilter:['aria-pressed']});syncRelated();
 let frame=0;
 function labelChapters(){
  frame=0;document.querySelectorAll('#book-catalog .chapter').forEach(button=>{
   let label=button.querySelector('.chapter-label');
   if(!label){label=document.createElement('span');label.className='chapter-label';[...button.childNodes].filter(node=>node.nodeType===Node.TEXT_NODE).forEach(node=>label.append(node));button.append(label);}
   const full=label.textContent.trim();if(button.title!==full)button.title=full;
  });
 }
 const schedule=()=>{if(!frame)frame=requestAnimationFrame(labelChapters);};labelChapters();
 new MutationObserver(schedule).observe(document.querySelector('#book-catalog'),{childList:true,characterData:true,subtree:true});
 window.desktopMotion.flush();
})();
