// Reader actions and settings for the static preview.
(() => {
 const modal=$('#dialog'),showModal=modal.showModal.bind(modal);modal.showModal=()=>{showModal();modal.scrollTop=0;};
 let backdropDown=false;
 modal.addEventListener('pointerdown',event=>{backdropDown=event.target===modal&&event.clientX<modal.getBoundingClientRect().left+modal.clientWidth;});
 modal.addEventListener('click',event=>{if(backdropDown&&event.target===modal&&event.clientX<modal.getBoundingClientRect().left+modal.clientWidth)modal.close();backdropDown=false;});
 const helpRuns=new Set(),reducedHelpMotion=matchMedia('(prefers-reduced-motion: reduce)');
 modal.addEventListener('close',()=>helpRuns.forEach(run=>run.cancel()));
 const finishHelpMotion=()=>helpRuns.forEach(run=>{try{run.finish();}catch{run.cancel();}});
 window.addEventListener('resize',finishHelpMotion);reducedHelpMotion.addEventListener('change',()=>{if(reducedHelpMotion.matches)finishHelpMotion();});
 const priorDialog=openDialog;
 function settings(){
  const blocks=[['original','Оригинал и транслитерация'],['gloss','Пословный перевод'],['translation','Перевод'],['comment','Комментарий']];
  const themes=[['light','sun','Светлая'],['dark','moon','Тёмная']].map(([id,symbol,name])=>`<label class="theme-choice"><input type="radio" name="interface-theme" value="${id}" ${(saved.theme||'light')===id?'checked':''}><span class="theme-choice-card"><span class="theme-mini theme-mini-${id}" aria-hidden="true"><span class="theme-mini-top"><i></i><i></i></span><span class="theme-mini-tree"><i></i><i></i><i></i></span><span class="theme-mini-text"><i></i><i></i><i></i><i></i></span></span><span class="theme-choice-caption">${icon(symbol)}<span>${name}</span><span class="theme-choice-check">${icon('check')}</span></span></span></label>`).join('');
  simpleDialog('Настройки',`<div class="reader-settings">
   <section id="setting-book-size"><h3>Размер текста книги</h3><label class="range-setting" for="font-size"><input id="font-size" type="range" min="16" max="26" value="${saved.size||19}"><output id="font-value">${saved.size||19} px</output></label><div class="settings-preview"><span>ПРИМЕР РАЗМЕРА ТЕКСТА</span><p>Спокойное чтение помогает удерживать внимание и вдумчиво следовать за мыслью автора.</p></div></section>
   <section id="setting-theme"><h3>Тема интерфейса</h3><div class="theme-choice-grid">${themes}</div></section>
   <section id="setting-blocks"><h3>Состав текста книги</h3><div class="settings-blocks">${blocks.map(item=>'<label><span>'+item[1]+'</span><input type="checkbox" data-block-setting="'+item[0]+'" '+(saved.blocks?.[item[0]]===false?'':'checked')+'></label>').join('')}</div></section>
   <section id="setting-interface-size"><h3>Размер интерфейса</h3><label class="range-setting" for="ui-size"><input id="ui-size" type="range" min="14" max="18" value="${saved.uiSize||14}"><output id="ui-value">${saved.uiSize||14} px</output></label><div class="ui-size-preview"><span>ПРИМЕР РАЗМЕРА ИНТЕРФЕЙСА</span><div class="ui-size-preview-content"><strong>Каталог книг</strong><div class="ui-preview-field">${icon('search')}<span>Найти в каталоге</span></div><div class="ui-preview-row"><span>${icon('book')}Бхагавад-гита</span><span class="ui-preview-button">Выбрать книги</span></div></div></div></section>
   <section id="setting-interface-language"><h3>Язык интерфейса</h3><select id="interface-language" aria-label="Язык интерфейса"><option value="ru">Русский</option><option value="en">English</option></select></section><div class="settings-reset"><button id="reset-settings" class="text-button">Сбросить настройки</button></div></div>`);
  const size=$('#font-size'),ui=$('#ui-size'),preview=$('.settings-preview');
  const sample=()=>preview.style.fontSize=(saved.size||19)+'px',uiSample=()=>$('.ui-size-preview-content').style.fontSize=(saved.uiSize||14)+'px';sample();uiSample();
  size.oninput=()=>{saved.size=Number(size.value);$('#font-value').textContent=size.value+' px';persist();applySettings();sample();};
  ui.oninput=()=>{saved.uiSize=Number(ui.value);$('#ui-value').textContent=ui.value+' px';persist();applySettings();uiSample();};
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
  finishHelpMotion();
  simpleDialog('Помощь','<div class="help-page"><a class="tutorial-card tutorial-link" href="https://rupaseva.com/en/vedarama#tutorial" target="_blank" rel="noopener"><span class="tutorial-illustration" aria-hidden="true"><img src="assets/illustrations/tutorial-reading-v1.svg" width="320" height="230" alt=""></span><span class="tutorial-copy"><span class="tutorial-eyebrow">Знакомство с приложением</span><strong>Обучающий ролик</strong><span class="tutorial-description">Посмотрите видеоинструкцию по работе с Ведарамой.</span><span class="tutorial-action">Смотреть видео</span></span></a><section class="help-faq-section"><h3>Частые вопросы</h3><p class="help-section-description">Чтение, поиск и сохранение важных мест.</p><div class="help-faq">'+questions.map((item,index)=>'<article class="help-faq-item"><h4><button type="button" class="help-question" id="help-question-'+index+'" aria-expanded="false" aria-controls="help-answer-'+index+'"><span>'+item[0]+'</span>'+desktopIconSvg('down')+'</button></h4><div class="help-answer" id="help-answer-'+index+'" aria-labelledby="help-question-'+index+'" hidden><div class="help-answer-copy"><p>'+item[1]+'</p></div></div></article>').join('')+'</div></section><div class="help-contact"><span class="help-contact-symbol" aria-hidden="true">'+(window.supportFlow?.icon()||icon('note'))+'</span><div><h3>Не нашли ответ?</h3><p>Задайте вопрос о работе приложения.</p></div><button id="contact-support" class="outline-button">'+(window.supportFlow?.icon()||icon('note'))+'<span>Написать в поддержку</span></button></div></div>');
  document.querySelectorAll('.help-faq-item').forEach(item=>{
   const trigger=item.querySelector('.help-question'),answer=item.querySelector('.help-answer');let expanded=false,activeRun=null;
   trigger.onclick=()=>{
    const height=answer.hidden?0:answer.getBoundingClientRect().height,opacity=answer.hidden?0:Number(getComputedStyle(answer).opacity);
    activeRun?.cancel();expanded=!expanded;trigger.setAttribute('aria-expanded',String(expanded));item.classList.toggle('is-expanded',expanded);answer.hidden=false;answer.inert=!expanded;answer.style.height=height+'px';answer.style.opacity=String(opacity);
    const complete=()=>{answer.hidden=!expanded;answer.style.removeProperty('height');answer.style.removeProperty('opacity');document.dispatchEvent(new Event('desktop-layout-settled'));};
    if(reducedHelpMotion.matches){activeRun=null;complete();return;}
    const run=answer.animate([{height:height+'px',opacity},{height:(expanded?answer.scrollHeight:0)+'px',opacity:expanded?1:0}],{duration:240,easing:'cubic-bezier(.22,.7,.2,1)',fill:'both'});activeRun=run;helpRuns.add(run);
    run.finished.then(()=>{if(activeRun===run){activeRun=null;complete();run.cancel();}helpRuns.delete(run);}).catch(()=>helpRuns.delete(run));
   };
  });
  $('#contact-support').onclick=()=>{finishHelpMotion();if(window.supportFlow)window.supportFlow.compose({fromHelp:true});else priorDialog('support');};drawIcons($('#dialog-body'));
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
  const current=getSelection()?.rangeCount?getSelection().getRangeAt(0):null;
  const range=current&&!current.collapsed&&$('.book-page').contains(current.commonAncestorContainer)?current:selectionRange;
  const fragment=range?.cloneContents();fragment?.querySelectorAll('button,.inline-note').forEach(node=>node.remove());
  fragment?.querySelectorAll('p,li,h2,h3,blockquote').forEach(node=>node.append(document.createTextNode('\n\n')));
  const quote=(fragment?.textContent||selectedQuote||'').replace(/\n{3,}/g,'\n\n').trim();if(!quote)return '';
  if(range&&!$('.book-page').contains(range.commonAncestorContainer))return '';
  const verseOf=node=>(node?.nodeType===1?node:node?.parentElement)?.closest('[data-reader-verse]')?.dataset.readerVerse;
  const first=Number(verseOf(range?.startContainer)||readerGetState().verse),last=Number(verseOf(range?.endContainer)||first),language=readerGetState().language;
  const url=new URL('https://sri-rupa-seva-kunj.github.io/vedarama-mobile-preview/mockups/desktop-native-icons-v1/index.html');url.searchParams.set('v','1.61');url.searchParams.set('verse',first);url.searchParams.set('reader',language);url.searchParams.set('account',demoAccount.mode);
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
