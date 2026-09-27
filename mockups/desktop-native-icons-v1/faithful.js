// Additional desktop variant. Approved mobile screens and the original application
// supply typography, surfaces, SVGs and the restrained component geometry.
(() => {
 const originalDraw=drawIcons;
 const map={book:'book',search:'zoom',close:'cross',back:'nav-arrow-left',forward:'nav-arrow-right',right:'nav-arrow-right',down:'arrow-down',plus:'plus',settings:'settings',note:'note',download:'download',globe:'globe',help:'info',bookmark:'bookmark-nav',more:'more'};
 icons.spark='M4 4h16v12H10l-6 4V4Z';
 drawIcons=function(root=document){originalDraw(root);root.querySelectorAll('i[data-icon]').forEach(el=>{const key=map[el.dataset.icon];if(key&&faithfulIcons[key]){el.innerHTML=faithfulIcons[key];el.querySelector('svg')?.classList.add('native-mark');}});root.querySelectorAll('.tree i[data-icon=down]').forEach(el=>el.innerHTML=faithfulIcons.minus);root.querySelectorAll('.tree i[data-icon=right]').forEach(el=>el.innerHTML=faithfulIcons.plus);root.querySelectorAll('.tree i[data-icon=book]').forEach(el=>el.innerHTML=faithfulIcons['nav-book']);};
 const themed=applyTheme;
 applyTheme=function(theme){themed(theme);$('.brand img').src='assets/logo2-tilak.svg';};
 $('.brand img').alt='Тилака Ведарамы';applyTheme(saved.theme||'light');
 $('.review-bar>span').innerHTML='<b>Ведарама</b> · Десктоп · Существующая дизайн-система';
 $('.mobile-preview-link').href='gallery.html';$('.mobile-preview-link').textContent='Все состояния ↗';
 descriptions.brief=['Дополнительный макет десктопа','<p>Вариант в существующей системе Ведарамы: PT Sans и Gaura PT Serif, исходная SVG-тилака, книжные иконки, плоские панели и компактные прямоугольные элементы.</p><p>Функции сохранены: независимые вкладки, непрерывное чтение, связанные издания, заметки, полки, справочники, AI и два режима поиска.</p><p>Визуальная основа — согласованные мобильные материалы, итерация 10 от 24 сентября. Этот вариант отдельный: прежний десктоп и мобильные макеты не изменены.</p><p>Поиск, ответы AI, подключения и загрузки демонстрационные. Вкладки, черновики и настройки сохраняются локально, отдельно от старого макета.</p><p><a href="gallery.html">Открыть галерею состояний</a></p>'];
 $('.ai-intro h2').textContent='Вопросы по библиотеке';
 $('.ai-intro p').textContent='Задайте вопрос о тексте или найдите связанные места в книгах.';
 const nativeTurn=appendChatTurn;
 appendChatTurn=function(text,modelName,contexts){nativeTurn(text,modelName,contexts);const turn=$('#ai-messages .ai-turn:last-child'),answer=turn.querySelector('.chat-assistant');answer.insertAdjacentHTML('afterbegin','<details class="native-ai-steps"><summary>Как будет подготовлен ответ</summary><p>Прикреплённые стихи → поиск по библиотеке, если включён → ответ модели.</p><p>Демонстрационные этапы, запрос к модели не выполнялся.</p></details>');answer.insertAdjacentHTML('beforeend','<button class="native-copy">Копировать ответ</button>');answer.querySelector('.native-copy').onclick=async()=>{try{await navigator.clipboard.writeText([...answer.querySelectorAll('p,blockquote')].filter(x=>!x.closest('details')).map(x=>x.textContent).join('\n\n'));toast('Ответ скопирован');}catch{toast('Не удалось скопировать. Выделите текст ответа.');}};drawIcons(turn);};
 // Existing persisted demonstration answers use the same approved treatment.
 document.querySelectorAll('#ai-messages .ai-turn').forEach(turn=>{const answer=turn.querySelector('.chat-assistant');if(!answer.querySelector('.native-ai-steps'))answer.insertAdjacentHTML('afterbegin','<details class="native-ai-steps"><summary>Поиск и анализ завершены · подробнее</summary><p>Демонстрационный ответ по контексту книги.</p></details>');});
 const root=$('.tree-root');
 root.setAttribute('aria-expanded','true');root.onclick=()=>{const open=root.getAttribute('aria-expanded')!=='true';root.setAttribute('aria-expanded',String(open));root.parentElement.querySelectorAll(':scope>button:not(.tree-root),:scope>.verses').forEach(el=>el.hidden=!open);root.querySelector('i').innerHTML=faithfulIcons[open?'minus':'plus'];};
 const chapter=$('.chapter.current');chapter.setAttribute('aria-expanded','true');chapter.onclick=()=>{const expanded=chapter.getAttribute('aria-expanded')!=='true';chapter.setAttribute('aria-expanded',String(expanded));$('.verses').hidden=!expanded;chapter.querySelector('i').innerHTML=faithfulIcons[expanded?'minus':'plus'];};
 drawIcons();
 const qs=new URLSearchParams(location.search);
 if(qs.has('theme'))applyTheme(qs.get('theme'));
 if(qs.get('panel')==='ai'||qs.get('panel')==='notes'){showSection('read');openTool(qs.get('panel'),'panel');}
 if(qs.get('focus')==='1'&&!document.body.classList.contains('focus-mode'))$('#focus').click();
 if(qs.get('settings')==='1')openDialog('settings');
 if(qs.get('related')==='1'){showSection('read');if($('#linked-books-panel').hidden)$('#linked-books-toggle').click();}
 if(qs.get('verse'))requestAnimationFrame(()=>readerJump(Number(qs.get('verse'))));
 else if(!localStorage.getItem('vedarama-native-desktop-seen')){localStorage.setItem('vedarama-native-desktop-seen','1');requestAnimationFrame(()=>readerJump(47));}
})();
