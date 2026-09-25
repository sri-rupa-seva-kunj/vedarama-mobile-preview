// Sample activity items demonstrate navigation and locally persisted read status.
icons.bell='M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9 M10 21h4';
saved.activityRead=Array.isArray(saved.activityRead)?saved.activityRead:[];
let activityTab='all';
const activityItems=[
 {id:'news-reader',kind:'news',label:'Новости Ведарамы',title:'Больше пространства для чтения',text:'Единая светлая и тёмная тема, заметки рядом с книгой и отдельная страница для разговора с AI. Посмотрите, как устроен обновлённый интерфейс.',action:'Открыть книгу',target:'read',icon:'book'},
 {id:'notice-models',kind:'notice',label:'Подсказка',title:'Подключите свою модель для чата',text:'В разделе «Мои модели» можно выбрать провайдера и посмотреть пошаговую инструкцию подключения.',action:'К подключению моделей',target:'models',icon:'spark'},
 {id:'news-search',kind:'news',label:'Новости Ведарамы',title:'Два способа поиска в одном месте',text:'Ищите точную фразу, задавайте вопрос своими словами или включайте оба способа одновременно. Цитаты из книг и ответ AI отображаются отдельно.',action:'Попробовать поиск',target:'search',icon:'search'}
];
const activityButton=document.createElement('button');
activityButton.className='icon-button activity-entry';activityButton.id='activity-button';activityButton.onclick=()=>showSection('activity');
$('.app-header [data-dialog="settings"]').before(activityButton);
function updateActivityBadge(){const n=activityItems.filter(x=>!saved.activityRead.includes(x.id)).length;activityButton.innerHTML=icon('bell')+(n?'<span class="activity-dot" aria-hidden="true">'+n+'</span>':'');activityButton.setAttribute('aria-label','Новости и уведомления'+(n?' · непрочитанных: '+n:''));activityButton.title='Новости и уведомления';drawIcons(activityButton);}
const activityShowSection=showSection;
showSection=function(next,resetPanel=true){activityShowSection(next,resetPanel);if(next==='activity')renderActivity();};
const activitySyncNavigation=syncNavigation;
syncNavigation=function(){activitySyncNavigation();const active=section==='activity';activityButton.classList.toggle('active',active);if(active){activityButton.setAttribute('aria-current','page');$('[data-mobile="more"]').classList.add('active');$('[data-mobile="more"]').setAttribute('aria-current','page');}else activityButton.removeAttribute('aria-current');};
const activityOpenMore=openMore;
openMore=function(){activityOpenMore();const n=activityItems.filter(x=>!saved.activityRead.includes(x.id)).length;$('.mobile-menu').insertAdjacentHTML('afterbegin','<button id="mobile-activity-entry">'+icon('bell')+'<span><strong>Новости и уведомления'+(n?' · '+n:'')+'</strong><small>Обновления и сообщения приложения</small></span>'+icon('right')+'</button>');$('#mobile-activity-entry').onclick=()=>{$('#dialog').close();showSection('activity');};drawIcons($('#mobile-activity-entry'));};
function markActivityRead(id){if(!saved.activityRead.includes(id))saved.activityRead.push(id);persist();updateActivityBadge();}
function renderActivity(){
 const unread=activityItems.filter(x=>!saved.activityRead.includes(x.id));
 const items=activityItems.filter(x=>activityTab==='all'||(activityTab==='unread'?!saved.activityRead.includes(x.id):x.kind==='news'));
 $('#workspace-panel').innerHTML='<div class="activity-page">'+workspaceHeader('ВЕДАРАМА','Новости и уведомления','Обновления библиотеки, новые возможности и сообщения приложения.')+`<div class="activity-toolbar"><div class="activity-tabs" role="group" aria-label="Фильтр новостей и уведомлений">${[['all','Все'],['news','Новости'],['unread','Непрочитанные'+(unread.length?' · '+unread.length:'')]].map(([id,name])=>`<button data-activity-tab="${id}" aria-pressed="${activityTab===id}">${name}</button>`).join('')}</div><button class="text-button" id="activity-read-all" ${unread.length?'':'disabled'}>Прочитать всё</button></div><div class="activity-list">${items.length?items.map(x=>`<article class="activity-card ${saved.activityRead.includes(x.id)?'':'unread'}"><div class="activity-symbol">${icon(x.icon)}</div><div><div class="activity-meta"><span>${x.label}</span><span>Пример сообщения</span>${saved.activityRead.includes(x.id)?'':'<b>Новое</b>'}</div><h2>${x.title}</h2><p>${x.text}</p><div class="activity-actions"><button class="outline-button" data-activity-open="${x.id}">${x.action}${icon('forward')}</button>${saved.activityRead.includes(x.id)?'':`<button data-activity-read="${x.id}">Отметить прочитанным</button>`}</div></div></article>`).join(''):'<div class="activity-empty"><h2>Всё прочитано</h2><p>Новые сообщения появятся здесь.</p></div>'}</div><p class="workspace-footnote">В макете показаны примеры сообщений. Статус прочтения сохраняется в этом браузере.</p></div>`;
 wireWorkspace();syncNavigation();
 document.querySelectorAll('[data-activity-tab]').forEach(b=>b.onclick=()=>{activityTab=b.dataset.activityTab;renderActivity();$('[data-activity-tab="'+activityTab+'"]').focus();});
 document.querySelectorAll('[data-activity-read]').forEach(b=>b.onclick=()=>{markActivityRead(b.dataset.activityRead);renderActivity();});
 document.querySelectorAll('[data-activity-open]').forEach(b=>b.onclick=()=>{const x=activityItems.find(x=>x.id===b.dataset.activityOpen);markActivityRead(x.id);showSection(x.target);});
 $('#activity-read-all').onclick=()=>{activityItems.forEach(x=>markActivityRead(x.id));renderActivity();};
}
// Keep the input small until the user writes several lines.
function fitChatInput(){question.style.height='42px';question.style.height=Math.min(100,Math.max(42,question.scrollHeight))+'px';}
question.addEventListener('input',fitChatInput);
$('#ai-form').addEventListener('submit',fitChatInput);
updateActivityBadge();
if(new URLSearchParams(location.search).get('section')==='activity')showSection('activity');
