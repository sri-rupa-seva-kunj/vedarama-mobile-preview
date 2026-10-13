// Reader actions and settings for the static preview.
(() => {
 const priorDialog=openDialog;
 function settings(){
  const blocks=[['original','Оригинал и транслитерация'],['gloss','Пословный перевод'],['translation','Перевод'],['comment','Комментарий']];
  simpleDialog('Настройки','<div class="reader-settings"><section id="setting-book-size"><h3>Размер текста книги</h3><label class="range-setting" for="font-size"><input id="font-size" type="range" min="16" max="26" value="'+(saved.size||19)+'"><output id="font-value">'+(saved.size||19)+' px</output></label><div class="settings-preview"><span>ПРИМЕР РАЗМЕРА ТЕКСТА</span><p>Спокойное чтение помогает удерживать внимание и вдумчиво следовать за мыслью автора.</p></div></section><section id="setting-theme"><h3>Тема интерфейса</h3><div class="settings-theme-buttons">'+[['light','Светлая','sun'],['dark','Тёмная','moon']].map(item=>'<label><input type="radio" name="interface-theme" value="'+item[0]+'" '+(saved.theme===item[0]?'checked':'')+'>'+icon(item[2])+'<span>'+item[1]+'</span></label>').join('')+'</div></section><section id="setting-blocks"><h3>Состав текста книги</h3><div class="settings-blocks">'+blocks.map(item=>'<label><span>'+item[1]+'</span><input type="checkbox" data-block-setting="'+item[0]+'" '+(saved.blocks?.[item[0]]===false?'':'checked')+'></label>').join('')+'</div></section><section id="setting-interface-size"><h3>Размер интерфейса</h3><label class="range-setting" for="ui-size"><input id="ui-size" type="range" min="14" max="18" value="'+(saved.uiSize||14)+'"><output id="ui-value">'+(saved.uiSize||14)+' px</output></label></section><section id="setting-interface-language"><h3>Язык интерфейса</h3><select id="interface-language" aria-label="Язык интерфейса"><option value="ru">Русский</option><option value="en">English</option></select></section><div class="settings-reset"><button id="reset-settings" class="text-button">Сбросить настройки</button></div></div>');
  const size=$('#font-size'),ui=$('#ui-size'),preview=$('.settings-preview');
  const sample=()=>preview.style.fontSize=(saved.size||19)+'px';sample();
  size.oninput=()=>{saved.size=Number(size.value);$('#font-value').textContent=size.value+' px';persist();applySettings();sample();};
  ui.oninput=()=>{saved.uiSize=Number(ui.value);$('#ui-value').textContent=ui.value+' px';persist();applySettings();};
  document.querySelectorAll('[data-block-setting]').forEach(input=>input.onchange=()=>{saved.blocks={...saved.blocks,[input.dataset.blockSetting]:input.checked};persist();applySettings();});
  document.querySelectorAll('input[name=interface-theme]').forEach(input=>input.onchange=()=>{if(input.checked)applyTheme(input.value);});
  $('#interface-language').value=window.uiLanguage||'ru';$('#interface-language').onchange=e=>window.uiSetLanguage?.(e.target.value);
  $('#reset-settings').onclick=()=>{delete saved.size;delete saved.uiSize;delete saved.blocks;persist();applySettings();applyTheme('light');window.uiSetLanguage?.('ru');settings();};
  drawIcons($('#dialog-body'));
 }
 function help(){
  const questions=[
   ['Как включить и выключить режим чтения?','Нажмите «Режим чтения» над книгой. Чтобы вернуться, используйте подписанную кнопку «Выйти из чтения» в верхней панели.'],
   ['Как листать две страницы?','Включите формат «Две страницы». Большие стрелки по краям листают развороты, а верхняя навигация переходит к стихам.'],
   ['Как сохранить место в книге?','Нажмите звезду или откройте боковую область закладок и выберите «Сохранить это место». Подтвердите сохранение в появившемся окне.'],
   ['Как скопировать текст с источником?','Выделите текст книги и выберите «Копировать с источником». Вместе с цитатой копируются название книги, адрес стиха и ссылка.'],
   ['Как искать в определённых книгах?','В поиске выберите источник, языки каталога и нужные книги. Отметки в каталоге определяют область поиска.']
  ];
  if(hasAiAccess())questions.push(['Как настроить модель для ИИ?','Откройте «Мои модели», выберите провайдера и заполните данные подключения. В макете проверка и ответы демонстрационные.']);
  simpleDialog('Помощь','<div class="help-page"><a class="outline-button tutorial-link" href="https://rupaseva.com/en/vedarama#tutorial" target="_blank" rel="noopener">'+icon('forward')+'<span>Обучающий ролик</span><span aria-hidden="true">↗</span></a><h3>Частые вопросы</h3><div class="help-faq">'+questions.map(item=>'<details><summary>'+item[0]+'</summary><p>'+item[1]+'</p></details>').join('')+'</div><div class="help-contact"><p>Не нашли ответ?</p><button id="contact-support" class="outline-button">Написать в поддержку</button></div></div>');
  $('#contact-support').onclick=()=>priorDialog('support');drawIcons($('#dialog-body'));
 }
 openDialog=function(key){
  if(key==='settings'){settings();return;}
  if(key==='support'||key==='help'){help();return;}
  if(key==='brief'){simpleDialog('Что изменилось','<p>Настройки чтения, сохранение избранного, копирование с источником и профиль собраны в одном макете.</p><p>Вариант интерфейса зависит от состояния аккаунта. Для проверки используйте переключатель «Аккаунт» под окном приложения.</p>');return;}
  priorDialog(key);
 };
 document.querySelectorAll('[data-dialog=support]').forEach(button=>{button.title='Помощь';button.setAttribute('aria-label','Помощь');button.dataset.tip='Помощь';});
 $('#reading-more')?.addEventListener('click',()=>{const button=$('[data-reading-action=exit]');if(button)button.innerHTML=desktopIconSvg('readingOff')+'<span>Выйти из чтения</span>';});
 const originalAdd=addBookmark;
 addBookmark=function(){
  const state=readerGetState(),id='bg2'+state.verse;if(saved.bookmarks.some(item=>item.id===id))return;
  simpleDialog('Добавить в избранное?','<form id="confirm-bookmark-form"><p class="bookmark-confirm-context">'+icon('book')+'<span>Бхагавад-гита · глава 2 · текст '+state.verse+'</span></p><label for="bookmark-caption">Подпись <span class="optional-label">— необязательно</span></label><input id="bookmark-caption" class="wide" maxlength="160" placeholder="Как запомнить это место"><div class="editor-actions"><button type="button" id="cancel-bookmark">Отмена</button><button type="submit" class="gold-button">Добавить</button></div></form>');
  $('#cancel-bookmark').onclick=()=>$('#dialog').close();$('#confirm-bookmark-form').onsubmit=e=>{e.preventDefault();const label=$('#bookmark-caption').value.trim();$('#dialog').close();originalAdd();const item=saved.bookmarks.find(item=>item.id===id);if(item)item.label=label;persist();syncBookmarks();renderReadingBookmarks();};
  drawIcons($('#dialog-body'));
 };
 const bar=$('#selection-actions'),copyButton=document.createElement('button');copyButton.id='copy-with-source';copyButton.innerHTML=desktopIconSvg('copy')+'<span>Копировать с источником</span>';bar.prepend(copyButton);
 copyButton.onpointerdown=e=>e.preventDefault();
 window.selectionSourceText=()=>{
  const range=getSelection()?.rangeCount?getSelection().getRangeAt(0):selectionRange;
  const quote=(range?.toString()||selectedQuote||'').trim();if(!quote)return '';
  if(range&&!$('.book-page').contains(range.commonAncestorContainer))return '';
  const verseOf=node=>(node?.nodeType===1?node:node?.parentElement)?.closest('[data-reader-verse]')?.dataset.readerVerse;
  const first=Number(verseOf(range?.startContainer)||readerGetState().verse),last=Number(verseOf(range?.endContainer)||first),language=readerGetState().language;
  const url=new URL('https://sri-rupa-seva-kunj.github.io/vedarama-mobile-preview/mockups/desktop-native-icons-v1/index.html');url.searchParams.set('v','1.54');url.searchParams.set('verse',first);url.searchParams.set('reader',language);url.searchParams.set('account',demoAccount.mode);
  return quote+'\n\nБхагавад-гита · глава 2 · текст '+first+(last!==first?'–'+last:'')+' · '+catalogLanguageNames[language]+'\nДемонстрационный фрагмент\n'+url.href;
 };
 copyButton.onclick=async()=>{
  const text=window.selectionSourceText();if(!text)return;
  let copied=false;try{await navigator.clipboard.writeText(text);copied=true;}catch{
   const ranges=[...Array(getSelection().rangeCount)].map((_,i)=>getSelection().getRangeAt(i).cloneRange()),field=document.createElement('textarea');field.value=text;field.style.cssText='position:fixed;left:-10000px;top:0';document.body.append(field);field.select();try{copied=document.execCommand('copy');}catch{}field.remove();getSelection().removeAllRanges();ranges.forEach(range=>getSelection().addRange(range));
  }
  if(copied){bar.hidden=true;toast('Текст с источником скопирован');}else toast('Не удалось скопировать текст. Попробуйте ещё раз.');
 };
 document.addEventListener('selectionchange',()=>{if(bar.hidden)return;const range=getSelection().rangeCount&&getSelection().getRangeAt(0);if(!range||!$('.book-page').contains(range.commonAncestorContainer)){bar.hidden=true;return;}const rect=range.getBoundingClientRect(),bounds=$('.book-scroll').getBoundingClientRect();bar.style.left=Math.max(12,Math.min(innerWidth-268,rect.left))+'px';bar.style.top=Math.max(bounds.top+8,Math.min(bounds.bottom-bar.offsetHeight-12,rect.bottom+8))+'px';});
 const reader=new URLSearchParams(location.search).get('reader');if(['ru','en','sa'].includes(reader)){readerRestore({...readerGetState(),language:reader});readerJump(Number(new URLSearchParams(location.search).get('verse'))||46);}
 if(new URLSearchParams(location.search).get('settings')==='1'){$('#dialog').close();settings();}
})();
