// Desktop ИИ composition follows DesktopChatToolbar / DesktopChatSidebar.
// This is a local interaction prototype. No requests are sent to providers.
(() => {
 const panel=$('#ai-panel'),copy=x=>JSON.parse(JSON.stringify(x));
 let dialogs=[],activeId='',attachments=[],historyClosed=false;
 const uid=()=> 'dialog-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,7);
 const fresh=()=>({id:uid(),title:'Новый диалог',turns:[],draft:'',attachments:[],model:defaultModelId,library:true});
 const main=document.createElement('div');main.className='native-chat-main';
 [...panel.children].filter(e=>!e.matches('.panel-context')).forEach(e=>main.append(e));panel.append(main);
 panel.insertAdjacentHTML('afterbegin',`<aside class="native-dialogs" aria-label="Диалоги ИИ"><header><h3>Диалоги</h3><button type="button" id="native-new-dialog">${icon('plus')}Новый</button></header><label class="native-dialog-search">${icon('search')}<input id="native-dialog-query" type="search" placeholder="Поиск по диалогам" aria-label="Поиск по диалогам"></label><div id="native-dialog-list"></div></aside>`);
 const historyIcon='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" aria-hidden="true"><path d="M3.5 12a8.5 8.5 0 1 0 2.2-5.7L3.5 8.5M3.5 4.5v4h4M12 7v5l3 2"/></svg>';
 $('.chat-model-bar').insertAdjacentHTML('afterbegin',`<button type="button" id="native-history-toggle" class="icon-button" aria-label="Скрыть диалоги" title="Показать или скрыть диалоги">${historyIcon}</button><strong id="native-dialog-title">Новый диалог</strong>`);
 $('#manage-chat-models').innerHTML=icon('settings')+'<span>Модели</span>';
 $('#manage-chat-models').classList.add('native-models-button');
 $('#ai-form').insertAdjacentHTML('afterbegin','<div id="native-attachments" aria-label="Стихи в контексте сообщения"></div>');
 $('#ai-form>label').insertAdjacentHTML('beforebegin',`<button type="button" id="native-add-verse">${icon('plus')}Добавить стих</button>`);
 question.placeholder='Задайте вопрос…';
 $('.ai-intro h2').textContent='О чём хотите спросить?';
 $('#native-history-toggle').onclick=()=>{if(toolMode==='page')historyClosed=!historyClosed;else panel.classList.toggle('native-panel-history-open');renderHistory();};
 $('#native-dialog-query').oninput=renderHistory;
 function turns(){return [...document.querySelectorAll('#ai-messages .ai-turn')].map(t=>({text:t.querySelector('.question-bubble').textContent,model:t.dataset.modelName,contexts:JSON.parse(t.dataset.contexts||'[]')}));}
 function checkpoint(){const d=dialogs.find(x=>x.id===activeId);if(d)Object.assign(d,{turns:turns(),draft:question.value,attachments:copy(attachments),model:saved.chatModel,library:$('#library-scope').checked});}
 function renderHistory(){
  panel.classList.toggle('native-history-closed',historyClosed);
  $('#native-history-toggle').setAttribute('aria-expanded',String(toolMode==='page'?!historyClosed:panel.classList.contains('native-panel-history-open')));
  $('#native-history-toggle').setAttribute('aria-label',historyClosed?'Показать диалоги':'Скрыть диалоги');
  const q=$('#native-dialog-query').value.toLowerCase().trim();
  const list=dialogs.filter(d=>(d.title+' '+d.turns.map(t=>t.text).join(' ')).toLowerCase().includes(q));
  $('#native-dialog-list').innerHTML=list.length?list.map(d=>`<button type="button" data-native-dialog="${d.id}" aria-current="${d.id===activeId?'true':'false'}"><strong>${escapeText(d.title)}</strong><small>${d.turns.length?d.turns.length+' сообщ.':'Новый разговор'}</small></button>`).join(''):'<p class="native-history-empty">Диалоги не найдены</p>';
  $('#native-dialog-title').textContent=dialogs.find(d=>d.id===activeId)?.title||'Новый диалог';
  $('#native-dialog-title').title=$('#native-dialog-title').textContent;
  document.querySelectorAll('[data-native-dialog]').forEach(b=>b.onclick=()=>{checkpoint();loadDialog(b.dataset.nativeDialog);if(toolMode!=='page'){panel.classList.remove('native-panel-history-open');renderHistory();}});
 }
 function renderAttachments(){
  $('#native-attachments').innerHTML=attachments.map((c,i)=>`<div class="native-attachment"><details><summary>${icon('book')}<span>${escapeText(c.address)}<small>${escapeText(c.edition)} · ${escapeText(c.language)}</small></span></summary><p>${escapeText(c.text)}</p></details><button type="button" data-remove-context="${i}" aria-label="Убрать из контекста ${escapeText(c.address)}" title="Убрать стих">${icon('close')}</button></div>`).join('');
  document.querySelectorAll('[data-remove-context]').forEach(b=>b.onclick=()=>{attachments.splice(Number(b.dataset.removeContext),1);renderAttachments();});
  drawIcons($('#native-attachments'));
 }
 function loadDialog(id){
  const d=dialogs.find(x=>x.id===id);if(!d)return;activeId=id;
  $('#ai-messages').replaceChildren();$('.ai-intro').hidden=false;$('.suggestions').hidden=false;
  for(const t of d.turns)appendChatTurn(t.text,t.model,t.contexts||[]);
  attachments=copy(d.attachments||[]);question.value=d.draft||'';
  saved.chatModel=availableModels().some(m=>m.id===d.model)?d.model:defaultModelId;
  $('#library-scope').checked=d.library!==false;refreshModelPicker();updateQuestion();
  renderAttachments();renderHistory();fitChatInput();
 }
 function newDialog(){checkpoint();const d=fresh();d.model=saved.chatModel;dialogs.unshift(d);loadDialog(d.id);panel.classList.remove('native-panel-history-open');question.focus();}
 $('#native-new-dialog').onclick=newDialog;$('#new-conversation').onclick=newDialog;
 function readVerse(n){
  const node=$('#reader-verse-'+n),state=window.readerGetState();
  const text=state.language==='ru'?[...node.querySelectorAll('.text-block')].map(e=>e.textContent.trim()).join('\n\n'):(node.querySelector('.edition-preview p')?.textContent||'');
  return {verse:n,editionId:state.edition,languageId:state.language,address:'Бхагавад-гита · 2.'+n,edition:($('#reader-edition-label').textContent||'Бхагавад-гита').replace(/ · (Русский|English|Санскрит)$/,''),language:{ru:'Русский',en:'English',sa:'Санскрит'}[state.language],text:text||node.innerText.trim()};
 }
 function addVerse(n,open=false){
  const c=readVerse(n),same=x=>x.verse===c.verse&&x.editionId===c.editionId&&x.languageId===c.languageId;
  if(!attachments.some(same))attachments.push(c);
  if(open)openTool('ai','panel');panel.classList.remove('native-panel-history-open');renderAttachments();question.focus();
 }
 $('#native-add-verse').onclick=()=>{
  const current=window.readerGetState().verse;
  simpleDialog('Добавить стих в чат',`<p>Выберите стих из открытого фрагмента главы. Текст останется в контексте диалога при переходе по книге.</p><div class="native-verse-picker">${[46,47,48,49,50].map(n=>{const c=readVerse(n);return `<button type="button" data-attach-verse="${n}"><strong>Бхагавад-гита · 2.${n}${n===current?' · читаю сейчас':''}</strong><span>${escapeText(c.text.slice(0,160))}…</span>${icon('plus')}</button>`;}).join('')}</div><p class="model-dialog-hint">В макете доступны тексты 46–50. Прикрепляется текст выбранного издания.</p>`);
  document.querySelectorAll('[data-attach-verse]').forEach(b=>b.onclick=()=>{addVerse(Number(b.dataset.attachVerse));$('#dialog').close();question.focus();});
 };
 document.querySelectorAll('.continuous-verse-heading').forEach(h=>{const n=Number(h.parentElement.dataset.readerVerse);h.insertAdjacentHTML('beforeend',`<button type="button" class="native-verse-chat" data-verse-chat="${n}" title="Добавить текст ${n} в ИИ-чат">${icon('spark')}<span>В чат</span></button>`);h.querySelector('[data-verse-chat]').onclick=()=>addVerse(n,true);});
 const previousAppend=appendChatTurn;
 appendChatTurn=function(text,modelName=chosenModel().name,contexts=copy(attachments)){
  previousAppend(text,modelName);const turn=$('#ai-messages .ai-turn:last-child');turn.dataset.contexts=JSON.stringify(contexts);
  if(contexts.length){turn.querySelector('.chat-user').insertAdjacentHTML('beforebegin','<div class="native-sent-contexts">'+contexts.map(c=>`<details><summary>${icon('book')}${escapeText(c.address)}<small>В контексте</small></summary><p>${escapeText(c.text)}</p></details>`).join('')+'</div>');}
  // Keep the preview honest: illustrate delivery of context, not a model response to arbitrary verses.
  const answer=turn.querySelector('.chat-assistant');
  answer.innerHTML=`<div class="native-answer-model">${modelBrand(availableModels().find(m=>m.name===modelName)||{model:modelName})}<span>${escapeText(modelName)}</span><small>Пример ответа</small></div><p>${contexts.length?'Стих добавлен в контекст этого сообщения. Здесь появится разбор текста и ответ на ваш вопрос.':'Здесь появится ответ на ваш вопрос по библиотеке.'}</p><p class="native-answer-demo">ИИ в макете не подключён; запрос к модели не отправляется.</p>`;
  drawIcons(turn);
 };
 $('#ai-form').onsubmit=e=>{e.preventDefault();const text=question.value.trim();if(!text)return;
  appendChatTurn(text);const d=dialogs.find(x=>x.id===activeId);if(d&&!d.turns.length)d.title=text.slice(0,70);
  question.value='';updateQuestion();fitChatInput();checkpoint();renderHistory();$('#ai-scroll').scrollTop=$('#ai-scroll').scrollHeight;
 };
 // Called by tabs.js, so dialogs, attached verse snapshots and drafts stay local to each tab.
 window.chatNativeGetState=()=>{checkpoint();return copy({dialogs,activeId,historyClosed});};
 window.chatNativeRestore=value=>{
  if(value?.dialogs?.length){dialogs=copy(value.dialogs);activeId=value.activeId;historyClosed=!!value.historyClosed;}
  else{const d=fresh();d.turns=turns();d.draft=question.value;d.model=saved.chatModel;dialogs=[d];activeId=d.id;historyClosed=false;}
  panel.classList.remove('native-panel-history-open');$('#native-dialog-query').value='';loadDialog(dialogs.some(d=>d.id===activeId)?activeId:dialogs[0].id);
 };
 const d=fresh();dialogs=[d];activeId=d.id;renderHistory();renderAttachments();drawIcons(panel);
})();
