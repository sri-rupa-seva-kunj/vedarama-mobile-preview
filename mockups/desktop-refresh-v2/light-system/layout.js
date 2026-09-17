// Global tabs above a per-tab toolbar; reading tools remain accessible in the tab row.
$('.application').after($('.review-bar'));
icons.menu='M4 6h16 M4 12h16 M4 18h16';
const globalActions=document.createElement('div');globalActions.className='global-actions';
globalActions.append($('#activity-button'),$('.app-header [data-dialog="settings"]'));
$('.global-tab-header').append(globalActions);
$('.global-tab-header').insertAdjacentHTML('beforeend',`<nav class="reading-tools" aria-label="Инструменты чтения"><button id="reading-ai" aria-label="AI рядом с книгой" title="AI рядом с книгой">${icon('spark')}</button><button id="reading-notes" aria-label="Заметки рядом с книгой" title="Заметки">${icon('note')}</button><button id="reading-bookmarks" aria-label="Открыть закладки" title="Закладки">${icon('bookmark')}</button><button id="reading-appearance" aria-label="Вид текста" title="Вид текста"><span class="aa">Aa</span></button><button id="exit-reading" aria-label="Выйти из режима чтения" title="Обычный вид">${icon('panel')}<span>Обычный вид</span></button></nav>`);
$('.reading-layout').insertAdjacentHTML('beforeend',`<aside id="reading-bookmarks-panel" aria-label="Закладки рядом с книгой" hidden><div class="reading-bookmarks-heading"><h2>Закладки</h2><button id="reading-bookmarks-close" class="icon-button" aria-label="Закрыть закладки">${icon('close')}</button></div><div class="reading-bookmarks-body"></div></aside>`);
const layoutShowSection=showSection,layoutOpenTool=openTool;
showSection=function(next,resetPanel=true){document.body.classList.remove('reading-bookmarks-open');layoutShowSection(next,resetPanel);};
openTool=function(next,mode='panel'){document.body.classList.remove('reading-bookmarks-open');layoutOpenTool(next,mode);};
function renderReadingBookmarks(){
 const root=$('.reading-bookmarks-body'),verse=window.readerGetState?.().verse||47;
 root.innerHTML=`<p class="reading-bookmark-context">${icon('book')}Бхагавад-гита · 2.${verse}</p><button id="reading-add-bookmark" class="outline-button" ${saved.bookmarks.some(b=>b.id==='bg2'+verse)?'disabled':''}>${icon('plus')}${saved.bookmarks.some(b=>b.id==='bg2'+verse)?'Это место сохранено':'Сохранить это место'}</button><div class="reading-bookmark-list">${saved.bookmarks.length?saved.bookmarks.map(b=>`<article><button data-reading-bookmark="${escapeText(b.id)}"><span>${escapeText(b.book)}</span><strong>${escapeText(b.title)}</strong><p>${escapeText(b.label||'Сохранённое место')}</p></button><button data-reading-bookmark-remove="${escapeText(b.id)}" aria-label="Удалить закладку ${escapeText(b.title)}" title="Удалить закладку">${icon('close')}</button></article>`).join(''):'<div class="empty-state"><h3>Здесь будут важные места</h3><p>Сохраните текущий стих, чтобы быстро вернуться к нему.</p></div>'}</div><button id="reading-all-bookmarks" class="text-button">Все закладки и полки${icon('forward')}</button>`;
 drawIcons(root);
 $('#reading-add-bookmark').onclick=()=>{addBookmark();renderReadingBookmarks();};
 root.querySelectorAll('[data-reading-bookmark]').forEach(b=>b.onclick=()=>{window.readerJump?.(Number(b.dataset.readingBookmark.replace('bg2','')));if(innerWidth<=700)document.body.classList.remove('reading-bookmarks-open');});
 root.querySelectorAll('[data-reading-bookmark-remove]').forEach(b=>b.onclick=()=>{saved.bookmarks=saved.bookmarks.filter(x=>x.id!==b.dataset.readingBookmarkRemove);syncBookmarks();renderReadingBookmarks();});
 $('#reading-all-bookmarks').onclick=()=>{document.body.classList.remove('focus-mode');savedTab='bookmarks';showSection('saved');};
}
function syncReadingLayout(){
 const focus=document.body.classList.contains('focus-mode'),bookmarks=document.body.classList.contains('reading-bookmarks-open');
 $('#reading-bookmarks-panel').hidden=!bookmarks;
 if(bookmarks)renderReadingBookmarks();
 $('#focus').setAttribute('aria-pressed',String(focus));
 $('#reading-ai').setAttribute('aria-pressed',String(view==='ai'&&!bookmarks));
 $('#reading-notes').setAttribute('aria-pressed',String(view==='notes'&&!bookmarks));
 $('#reading-bookmarks').setAttribute('aria-pressed',String(bookmarks));
}
$('#focus').onclick=()=>{
 if(document.body.classList.contains('focus-mode'))document.body.classList.remove('focus-mode');
 else {const panel=view;showSection('read');document.body.classList.remove('mobile-tree');document.body.classList.add('focus-mode');if(panel==='ai'||panel==='notes')openTool(panel,'panel');}
 syncReadingLayout();
};
$('#exit-reading').onclick=()=>{document.body.classList.remove('focus-mode');syncReadingLayout();};
$('#reading-ai').onclick=()=>{if(view==='ai')showSection('read');else openTool('ai','panel');syncReadingLayout();};
$('#reading-notes').onclick=()=>{if(view==='notes')showSection('read');else openTool('notes','panel');syncReadingLayout();};
$('#reading-bookmarks').onclick=()=>{const wasOpen=document.body.classList.contains('reading-bookmarks-open');showSection('read');document.body.classList.toggle('reading-bookmarks-open',!wasOpen);syncReadingLayout();};
$('#reading-bookmarks-close').onclick=()=>document.body.classList.remove('reading-bookmarks-open');
$('#reading-appearance').onclick=()=>openDialog('settings');
// Also runs after a saved tab restores its classes.
new MutationObserver(syncReadingLayout).observe(document.body,{attributes:true,attributeFilter:['class']});
drawIcons($('.reading-tools'));drawIcons($('.reading-bookmarks-heading'));syncReadingLayout();
globalActions.before($('.reading-tools'));
$('.reading-tools').insertAdjacentHTML('beforeend','<button id="reading-more" aria-label="Инструменты чтения" title="Инструменты чтения">'+icon('menu')+'</button>');
$('#reading-more').onclick=()=>{
 simpleDialog('Инструменты чтения','<div class="reading-mobile-menu"><button data-reading-action="notes">'+icon('note')+'Заметки</button><button data-reading-action="bookmarks">'+icon('bookmark')+'Закладки</button><button data-reading-action="appearance"><span class="aa">Aa</span>Вид текста</button><button data-reading-action="exit">'+icon('panel')+'Обычный вид</button></div>');
 document.querySelectorAll('[data-reading-action]').forEach(b=>b.onclick=()=>{$('#dialog').close();$('#'+(b.dataset.readingAction==='exit'?'exit-reading':'reading-'+b.dataset.readingAction)).click();});drawIcons($('#dialog-body'));
};drawIcons($('#reading-more'));
