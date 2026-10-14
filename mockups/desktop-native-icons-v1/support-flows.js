// Demonstration support inbox. All messages remain local; no network submission.
(() => {
 const key='vedarama-preview-support-v1',text=value=>window.uiText?.(value)||value;
 const symbol=()=>'<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><g stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><path d="M4 13v-2a8 8 0 0 1 16 0v2M4 11H2.5v7H6v-7ZM20 11h1.5v7H18v-7ZM20 18c0 3-3 3-6 3"/><path d="M11 20h3v2h-3Z"/></g></svg>';
 const notice='Демонстрационная переписка. Сообщения сохраняются в этом браузере и не отправляются в поддержку.';
 let threads=[],draft={subject:'',message:''};
 try{const stored=JSON.parse(localStorage.getItem(key)||'null');if(stored&&Array.isArray(stored.threads)){threads=stored.threads.filter(thread=>typeof thread.id==='string'&&typeof thread.subject==='string'&&Array.isArray(thread.messages)).slice(0,20);draft=stored.draft||draft;}}catch{}
 const sample={id:'sample-support',subject:'Как вернуться к найденному месту?',sample:true,messages:[{role:'user',body:'Открыл книгу из результатов поиска. Как вернуться к списку, чтобы посмотреть другие совпадения?',time:0},{role:'support',body:'Здравствуйте! Над текстом книги есть кнопка «К результатам поиска». Она возвращает к прежнему списку. Стрелки рядом позволяют переходить между найденными местами, не возвращаясь к списку.',time:0}]};
 if(!threads.some(thread=>thread.id===sample.id))threads.unshift(sample);
 function persistSupport(){try{localStorage.setItem(key,JSON.stringify({threads,draft}));}catch{}}
 const activityId=thread=>'support-'+thread.id;
 function inboxItem(thread){const reply=thread.messages.at(-1)?.role==='support';return {id:activityId(thread),kind:'support',label:'Поддержка',title:reply?'Новый ответ на ваше обращение':'Ожидает ответа',text:'<span class="support-subject">'+escapeText(thread.subject)+'</span><br><span class="support-message-body">'+escapeText(reply?thread.messages.at(-1).body.slice(0,180)+'…':'Ваше обращение сохранено. Здесь появится ответ команды.')+'</span>',action:'Открыть переписку',target:'activity',icon:'note',threadId:thread.id};}
 const previousVisible=visibleActivityItems;visibleActivityItems=function(){return [...previousVisible(),...threads.map(inboxItem)];};
 function compose(){
  simpleDialog('Обращение в поддержку',`<form id="support-request-form" class="support-request-form"><div class="support-intro">${symbol()}<div><h3>Поможем разобраться</h3><p>Напишите нам прямо в приложении. Ответ появится в уведомлениях.</p></div></div><label for="support-subject">Тема обращения</label><input id="support-subject" required maxlength="160" placeholder="О чём хотите спросить?" value="${escapeText(draft.subject||'')}"><label for="support-message">Ваше сообщение</label><textarea id="support-message" required maxlength="4000" placeholder="Опишите вопрос или проблему…">${escapeText(draft.message||'')}</textarea><p class="support-demo-note">${notice}</p><div class="editor-actions"><button type="button" id="support-request-cancel">Отмена</button><button type="submit" class="gold-button">${desktopIconSvg('send')}Отправить сообщение</button></div></form>`);
  const subject=$('#support-subject'),message=$('#support-message');for(const input of [subject,message])input.oninput=()=>{draft={subject:subject.value,message:message.value};persistSupport();};
  $('#support-request-cancel').onclick=()=>$('#dialog').close();$('#support-request-form').onsubmit=event=>{event.preventDefault();if(!subject.value.trim()||!message.value.trim())return;const thread={id:'request-'+Date.now(),subject:subject.value.trim(),messages:[{role:'user',body:message.value.trim(),time:Date.now()}]};threads.unshift(thread);threads=threads.slice(0,20);draft={subject:'',message:''};persistSupport();updateActivityBadge();openThread(thread.id);toast('Сообщение сохранено в макете');};drawIcons($('#dialog-body'));
 }
 function openThread(id){
  const thread=threads.find(thread=>thread.id===id);if(!thread)return;markActivityRead(activityId(thread));
  const reply=thread.messages.at(-1)?.role==='support';
  simpleDialog('Переписка с поддержкой',`<div class="support-conversation"><div class="support-thread-heading"><span class="support-avatar">${symbol()}</span><div><h3 class="support-subject">${escapeText(thread.subject)}</h3><span class="support-status ${reply?'answered':''}">${reply?'Ответ получен':'Ожидает ответа'}</span>${thread.sample?'<small>Пример обращения</small>':''}</div></div><div class="support-messages">${thread.messages.map(message=>`<article class="support-message ${message.role}"><div class="support-message-meta"><strong>${message.role==='support'?'Команда Ведарамы':'Вы'}</strong>${thread.sample&&message.role==='support'?'<span>Пример ответа</span>':''}</div><p class="support-message-body">${escapeText(message.body)}</p></article>`).join('')}</div><form id="support-reply-form" class="support-reply-form"><label class="sr-only" for="support-reply">Ваше сообщение</label><textarea id="support-reply" required maxlength="4000" placeholder="Написать ответ…"></textarea><button type="submit" class="gold-button">${desktopIconSvg('send')}Отправить</button></form><p class="support-demo-note">${notice}</p></div>`);
  $('#support-reply-form').onsubmit=event=>{event.preventDefault();const body=$('#support-reply').value.trim();if(!body)return;thread.messages.push({role:'user',body,time:Date.now()});thread.messages=thread.messages.slice(-40);persistSupport();openThread(thread.id);updateActivityBadge();};drawIcons($('#dialog-body'));
 }
 const previousActivity=renderActivity;
 renderActivity=function(){previousActivity();const toolbar=$('.activity-toolbar');if(!toolbar)return;
  toolbar.insertAdjacentHTML('beforeend','<button type="button" id="support-new-request" class="outline-button">'+symbol()+'Новое обращение</button>');$('#support-new-request').onclick=compose;
  document.querySelectorAll('[data-activity-open]').forEach(button=>{const thread=threads.find(thread=>activityId(thread)===button.dataset.activityOpen);if(thread)button.onclick=()=>openThread(thread.id);});
  document.querySelectorAll('[data-activity-id]').forEach(card=>{if(threads.some(thread=>activityId(thread)===card.dataset.activityId)){card.classList.add('support-activity-card');const symbolHost=card.querySelector('.activity-symbol');if(symbolHost)symbolHost.innerHTML=symbol();}});
 };
 const previousDialog=openDialog;openDialog=function(name){if(name==='support'){compose();return;}previousDialog(name);};
 window.supportFlow={icon:symbol,compose,openThread,threads:()=>JSON.parse(JSON.stringify(threads))};
 const previousShow=showSection;showSection=function(next,reset=true){previousShow(next,reset);if(next==='activity')updateActivityBadge();};
 document.querySelector('#dialog').addEventListener('close',()=>{if(section==='activity')renderActivity();});
 updateActivityBadge();if(section==='activity')renderActivity();
})();
