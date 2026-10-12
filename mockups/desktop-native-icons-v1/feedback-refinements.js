// Reading navigation is shared by the toolbar and its counterpart in reading mode.
(() => {
 const toolbar=document.querySelector('.reading-toolbar'),related=document.querySelector('#linked-books-toggle');
 document.querySelector('.breadcrumbs').hidden=true;toolbar.querySelector('.reader-actions').prepend(related);
 const focusRelated=related.cloneNode(true);focusRelated.id='reading-related';focusRelated.title='Текст в других книгах';
 focusRelated.setAttribute('aria-label','Текст в других книгах');focusRelated.setAttribute('aria-controls','linked-books-panel');
 document.querySelector('.reading-tools').insertBefore(focusRelated,document.querySelector('#reading-pages'));
 focusRelated.onclick=()=>related.click();
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
