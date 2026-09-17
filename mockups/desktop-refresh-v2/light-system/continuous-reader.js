// A continuous chapter excerpt. Linked editions follow desktop LinkedBooks.qml:
// preserve the verse address and offer current-tab / new-tab destinations.
(() => {
 const scroll=$('.book-scroll'),page=$('.book-page');
 const editions=[{id:'base',name:'Бхагавад-гита',detail:'Открытая книга',langs:['ru','en','sa']},{id:'commentary',name:'Бхагавад-гита · с комментариями',detail:'Пример другого издания',langs:['ru','en']},{id:'parallel',name:'Бхагавад-гита · параллельный перевод',detail:'Пример другого перевода',langs:['ru','sa']}];
 const languageNames={ru:'Русский',en:'English',sa:'Санскрит'};
 let state={verse:46,edition:'base',language:'ru',linkedOpen:false,linkedVerse:46,pinnedVerse:47},frame;
 const originalHeading=$('.book-heading'),verseHeading=$('.verse-heading');
 verseHeading.remove();$('.page-navigation').remove();
 const original=document.createElement('section');original.className='continuous-verse';original.dataset.readerVerse='47';original.id='reader-verse-47';
 [...page.children].filter(e=>e!==originalHeading).forEach(e=>original.append(e));page.append(original);
 original.insertAdjacentHTML('afterbegin','<div class="continuous-verse-heading"><h2>Текст 47</h2><button data-linked-verse="47" title="Этот текст в других книгах">'+icon('book')+'<span>В других книгах</span><small>2</small></button></div>');
 const texts={46:['Большой водоём и маленький колодец','Образ большого водоёма помогает увидеть, как частная цель соотносится с более полным знанием.','В этом фрагменте внимание направлено от отдельной пользы к целостному пониманию.'],48:['Равновесие в действии','Совершай действие, оставляя привязанность к его результатам и сохраняя равновесие при успехе и неудаче.','Следующий стих продолжает мысль о действии: внутреннее равновесие не требует прекращать исполнение своего долга.'],49:['Действие и внутреннее намерение','Не ограничивай смысл поступка ожидаемой наградой. Обратись к различающему разуму как к опоре в действии.','Здесь можно сопоставить намерение действующего и его отношение к результату.'],50:['Искусство действовать','Человек, опирающийся на разум, учится действовать без порабощения последствиями своих поступков.','Обсуждение действия продолжается в пределах одной главы и одного потока чтения.']};
 function fragment(n){const t=texts[n];return `<section class="continuous-verse" id="reader-verse-${n}" data-reader-verse="${n}"><div class="continuous-verse-heading"><h2>Текст ${n}</h2><button data-linked-verse="${n}" title="Этот текст в других книгах">${icon('book')}<span>В других книгах</span><small>2</small></button></div><section class="text-block" data-block="translation"><h3>Перевод</h3><p class="translation">${t[1]}</p></section><section class="text-block" data-block="comment"><h3>Комментарий</h3><p>${t[2]}</p></section></section>`;}
 original.insertAdjacentHTML('beforebegin',fragment(46));original.insertAdjacentHTML('afterend',[48,49,50].map(fragment).join(''));
 $('.sample-notice').remove();originalHeading.insertAdjacentHTML('beforeend','<p class="chapter-edition" id="reader-edition-label"></p><p class="reader-demo-note">Фрагмент главы · тексты 46–50. Перевод и комментарии сокращены и пересказаны для макета.</p>');
 page.insertAdjacentHTML('beforeend','<p class="chapter-continuation">Глава продолжается · в макете показаны тексты 46–50</p>');
 const column=document.createElement('div');column.className='continuous-reader';scroll.before(column);column.append(scroll);
 column.insertAdjacentHTML('afterbegin',`<nav class="chapter-navigation" aria-label="Навигация по непрерывному тексту"><button id="reader-prev" class="icon-button" aria-label="К предыдущему тексту">${icon('back')}</button><button id="reader-position" aria-label="Перейти к тексту"><span>Глава 2</span><strong>Текст 47</strong>${icon('down')}</button><button id="reader-next" class="icon-button" aria-label="К следующему тексту">${icon('forward')}</button><button id="linked-books-toggle" aria-label="Текст в других книгах">${icon('book')}<span>В других книгах</span><small>2</small></button></nav>`);
 $('.reading-layout').insertAdjacentHTML('beforeend',`<aside id="linked-books-panel" aria-label="Текст в других книгах" hidden><div class="linked-heading"><div><h2>Текст в других книгах</h2><p id="linked-address"></p></div><button id="linked-close" class="icon-button" aria-label="Закрыть другие книги">${icon('close')}</button></div><p class="linked-intro">Откройте то же место в другом издании или переводе.</p><div id="linked-editions"></div><p class="linked-demo">Демонстрационные издания и фрагменты. В приложении список берётся из библиотеки.</p></aside>`);
 function sync(){
  $('#reader-position strong').textContent='Текст '+state.verse;
  $('#reader-prev').disabled=state.verse<=46;$('#reader-next').disabled=state.verse>=50;
  $('.breadcrumbs b').textContent='Текст '+state.verse;$('#footer-location').textContent='БГ 2.'+state.verse;
  document.querySelectorAll('[data-verse]').forEach(b=>{b.classList.toggle('selected',Number(b.dataset.verse)===state.verse);});
  const edition=editions.find(e=>e.id===state.edition)||editions[0];
  $('#reader-edition-label').textContent=edition.name+' · '+languageNames[state.language];$('#reader-position').title=edition.name+' · '+languageNames[state.language];updateBookmark();
  $('#linked-books-toggle').setAttribute('aria-pressed',String(state.linkedOpen));
  $('#linked-books-panel').hidden=!state.linkedOpen;document.body.classList.toggle('linked-books-open',state.linkedOpen);
  const pinned=$('#context-pin')?.getAttribute('aria-pressed')==='true';
  if($('#tab-chat-context')&&$('#tab-chat-context').textContent!=='Вся библиотека')$('#tab-chat-context').textContent='Бхагавад-гита · 2.'+(pinned?state.pinnedVerse:state.verse);
 }
 function jump(n){if(n<46||n>50)return;state.verse=n;const node=$('#reader-verse-'+n);scroll.scrollTop+=node.getBoundingClientRect().top-scroll.getBoundingClientRect().top-20;sync();}
 function renderLinked(){
  $('#linked-address').textContent='Бхагавад-гита · глава 2 · текст '+state.linkedVerse;
  $('#linked-editions').innerHTML=editions.filter(e=>e.id!==state.edition).map(e=>`<article class="linked-edition"><span class="linked-book-mark">${icon('book')}</span><h3>${e.name}</h3><p>${e.detail}</p><label>Язык<select data-linked-language="${e.id}">${e.langs.map(l=>`<option value="${l}" ${l===state.language?'selected':''}>${languageNames[l]}</option>`).join('')}</select></label><div class="linked-actions"><button class="outline-button" data-linked-open="${e.id}">Открыть здесь</button><button class="text-button" data-linked-new="${e.id}" title="Открыть в новой вкладке">${icon('plus')}В новой вкладке</button></div></article>`).join('');
  drawIcons($('#linked-editions'));
  document.querySelectorAll('[data-linked-open],[data-linked-new]').forEach(b=>b.onclick=()=>{const id=b.dataset.linkedOpen||b.dataset.linkedNew,language=$('[data-linked-language="'+id+'"]').value,verse=state.linkedVerse;if(b.dataset.linkedNew)$('#new-tab').click();showSection('read');state={...state,edition:id,language,verse,linkedOpen:false};renderEdition();jump(verse);requestAnimationFrame(()=>jump(verse));});
 }
 function openLinked(n=state.verse){showSection('read');document.body.classList.remove('reading-bookmarks-open');state.linkedVerse=n;state.linkedOpen=true;renderLinked();sync();}
 function renderEdition(){
  const lang=state.language;
  // A genuine language change is visible; sample translations are explicitly labelled.
  page.querySelectorAll('.edition-preview').forEach(e=>e.remove());
  page.classList.toggle('alternate-language',lang!=='ru');
  if(lang!=='ru')page.querySelectorAll('.continuous-verse').forEach(e=>{
   const n=Number(e.dataset.readerVerse),english={46:'A larger understanding gives perspective to particular aims.',47:'Act without making the fruits of action your purpose, and do not become attached to inaction.',48:'Act with an even mind, letting go of attachment to success and failure.',49:'Let discerning understanding guide the purpose of your action.',50:'Cultivate the skill of acting without bondage to its results.'};
   const sanskrit={46:'यावानर्थ उदपाने सर्वतः सम्प्लुतोदके ।',47:'कर्मण्येवाधिकारस्ते मा फलेषु कदाचन ।',48:'योगस्थः कुरु कर्माणि सङ्गं त्यक्त्वा धनञ्जय ।',49:'दूरेण ह्यवरं कर्म बुद्धियोगाद्धनञ्जय ।',50:'बुद्धियुक्तो जहातीह उभे सुकृतदुष्कृते ।'};
   e.insertAdjacentHTML('beforeend',`<div class="edition-preview" lang="${lang==='sa'?'sa':'en'}"><p>${lang==='en'?english[n]:sanskrit[n]}</p><small>${lang==='en'?'Illustrative paraphrase for the prototype.':'Фрагмент санскритского текста для макета.'}</small></div>`);
  });sync();
 }
 $('#reader-prev').onclick=()=>jump(state.verse-1);$('#reader-next').onclick=()=>jump(state.verse+1);
 $('#reader-position').onclick=()=>{simpleDialog('Перейти к тексту','<p>Глава 2 · в макете доступны тексты 46–50. Переход прокрутит главу до выбранного места.</p><div class="verse-jump-list">'+[46,47,48,49,50].map(n=>`<button data-jump-verse="${n}" aria-current="${n===state.verse?'location':'false'}">${n}</button>`).join('')+'</div>');document.querySelectorAll('[data-jump-verse]').forEach(b=>b.onclick=()=>{$('#dialog').close();jump(Number(b.dataset.jumpVerse));});};
 $('#linked-books-toggle').onclick=()=>{if(state.linkedOpen){state.linkedOpen=false;sync();}else openLinked();};$('#linked-close').onclick=()=>{state.linkedOpen=false;sync();};
 document.querySelectorAll('[data-linked-verse]').forEach(b=>b.onclick=()=>openLinked(Number(b.dataset.linkedVerse)));
 document.querySelectorAll('[data-verse]').forEach(b=>b.onclick=()=>{const n=Number(b.dataset.verse);if(n>=46&&n<=50){showSection('read');jump(n);}else toast('В макете показан непрерывный фрагмент: тексты 46–50.');});
 scroll.addEventListener('scroll',()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>{if(!scroll.clientHeight)return;const top=scroll.getBoundingClientRect().top+60;let n=46;page.querySelectorAll('[data-reader-verse]').forEach(e=>{if(e.getBoundingClientRect().top<=top)n=Number(e.dataset.readerVerse);});if(n!==state.verse){state.verse=n;sync();}});});
 const oldShow=showSection,oldTool=openTool;showSection=function(next,reset=true){state.linkedOpen=false;oldShow(next,reset);sync();};openTool=function(next,mode){state.linkedOpen=false;oldTool(next,mode);sync();};
 window.readerGetState=()=>({...state});window.readerSyncContext=sync;
 window.readerRestore=value=>{state={verse:46,edition:'base',language:'ru',linkedOpen:false,linkedVerse:46,pinnedVerse:47,...value};renderEdition();if(state.linkedOpen)renderLinked();};
 updateBookmark=function(){const active=saved.bookmarks.some(b=>b.id==='bg2'+state.verse);$('#bookmark').setAttribute('aria-pressed',String(active));$('#bookmark').setAttribute('aria-label',(active?'Удалить закладку':'Добавить закладку')+' · БГ 2.'+state.verse);};
 addBookmark=function(){const id='bg2'+state.verse;if(!saved.bookmarks.some(b=>b.id===id))saved.bookmarks.push({id,book:BOOK,title:'БГ 2.'+state.verse,label:'',verse:state.verse});syncBookmarks();toast('БГ 2.'+state.verse+' сохранён в закладках');};
 $('#bookmark').onclick=()=>{const id='bg2'+state.verse;if(saved.bookmarks.some(b=>b.id===id)){saved.bookmarks=saved.bookmarks.filter(b=>b.id!==id);syncBookmarks();toast('Закладка удалена');}else addBookmark();};
 window.readerJump=jump;
 document.addEventListener('DOMContentLoaded',()=>{drawIcons(column);drawIcons($('#linked-books-panel'));applySettings();sync();const pin=$('#context-pin');pin.addEventListener('click',()=>{if(pin.getAttribute('aria-pressed')==='true')state.pinnedVerse=state.verse;sync();});});
 drawIcons(page);sync();
})();
