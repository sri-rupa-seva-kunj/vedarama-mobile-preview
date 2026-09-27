// Vector marks reused from the desktop application's ProviderLogo.tsx.
const providerPaths={"openai":"M22.282 9.821a5.985 5.985 0 0 0-.516-4.911 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.182a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.096 5.98 5.98 0 0 0 .511 4.911 6.051 6.051 0 0 0 6.514 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073Zm-9.022 12.608a4.476 4.476 0 0 1-2.877-1.041l.142-.08 4.778-2.759a.795.795 0 0 0 .393-.681v-6.737l2.02 1.169a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494Zm-9.661-4.125a4.471 4.471 0 0 1-.534-3.014l.142.085 4.783 2.758a.771.771 0 0 0 .78 0l5.843-3.368v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.499 4.499 0 0 1-6.141-1.646ZM2.341 7.896a4.485 4.485 0 0 1 2.365-1.973V11.6a.766.766 0 0 0 .388.677l5.815 3.354-2.02 1.169a.076.076 0 0 1-.072 0l-4.83-2.787A4.504 4.504 0 0 1 2.34 7.872Zm16.596 3.855-5.833-3.387L15.12 7.2a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.104v-5.677a.79.79 0 0 0-.407-.667Zm2.011-3.023-.142-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.499 4.499 0 0 1 6.681 4.66ZM8.307 12.863l-2.02-1.164a.08.08 0 0 1-.038-.057V6.074a4.499 4.499 0 0 1 7.376-3.454l-.142.081-4.778 2.758a.795.795 0 0 0-.393.681Zm1.097-2.365 2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5Z","deepseek":"M23.748 4.651c-.254-.124-.364.113-.512.233-.051.04-.094.09-.137.137-.372.397-.806.657-1.373.626-.829-.046-1.537.214-2.163.848-.133-.782-.575-1.248-1.247-1.548-.352-.155-.708-.311-.955-.65-.172-.24-.219-.509-.305-.774-.055-.16-.11-.323-.293-.35-.2-.031-.278.136-.356.276-.313.572-.434 1.202-.422 1.84.027 1.436.633 2.58 1.838 3.393.137.094.172.187.129.323-.082.28-.18.553-.266.833-.055.179-.137.218-.328.14a5.5 5.5 0 0 1-1.737-1.179c-.857-.828-1.631-1.743-2.597-2.46a12 12 0 0 0-.689-.47c-.985-.957.13-1.743.387-1.836.27-.098.094-.433-.778-.428-.872.003-1.67.295-2.687.685a3 3 0 0 1-.465.136 9.6 9.6 0 0 0-2.883-.101c-1.885.21-3.39 1.1-4.497 2.622C.082 8.776-.231 10.854.152 13.02c.403 2.284 1.568 4.175 3.36 5.653 1.857 1.533 3.997 2.284 6.438 2.14 1.482-.085 3.132-.284 4.994-1.86.47.234.962.328 1.78.398.629.058 1.235-.031 1.705-.129.735-.155.684-.836.418-.961-2.155-1.004-1.682-.595-2.112-.926 1.095-1.295 2.768-3.598 3.284-6.733.05-.346.115-.834.108-1.114-.004-.171.035-.238.23-.257a4.2 4.2 0 0 0 1.545-.475c1.397-.763 1.96-2.016 2.093-3.517.02-.23-.004-.467-.247-.588M11.58 18.168c-2.088-1.642-3.101-2.183-3.52-2.16-.39.024-.32.472-.234.763.09.288.207.487.371.74.114.167.192.416-.113.603-.673.416-1.842-.14-1.897-.168-1.361-.801-2.5-1.86-3.301-3.306-.775-1.393-1.225-2.888-1.299-4.482-.02-.385.094-.522.477-.592a4.7 4.7 0 0 1 1.53-.038c2.131.311 3.946 1.264 5.467 2.774.868.86 1.525 1.887 2.202 2.89.72 1.066 1.494 2.082 2.48 2.915.348.291.626.513.892.677-.802.09-2.14.109-3.055-.615Zm1.001-6.44a.306.306 0 0 1 .415-.287.3.3 0 0 1 .199.288c0 .17-.136.307-.308.307a.303.303 0 0 1-.306-.307m3.11 1.596c-.2.081-.4.151-.591.16a1.25 1.25 0 0 1-.798-.254c-.274-.23-.47-.358-.551-.758a1.7 1.7 0 0 1 .015-.588c.07-.327-.007-.537-.238-.727-.188-.156-.426-.199-.689-.199a.6.6 0 0 1-.254-.078.253.253 0 0 1-.114-.358 1 1 0 0 1 .192-.21c.356-.202.767-.136 1.146.016.352.144.618.408 1.001.782.392.451.462.576.685.915.176.264.336.536.446.848.066.194-.02.353-.25.45","gemini":"M11.04 19.32Q12 21.51 12 24q0-2.49.93-4.68.96-2.19 2.58-3.81t3.81-2.55Q21.51 12 24 12q-2.49 0-4.68-.93a12.3 12.3 0 0 1-3.81-2.58 12.3 12.3 0 0 1-2.58-3.81Q12 2.49 12 0q0 2.49-.96 4.68-.93 2.19-2.55 3.81a12.3 12.3 0 0 1-3.81 2.58Q2.49 12 0 12q2.49 0 4.68.96 2.19.93 3.81 2.55t2.55 3.81","claude":"m4.714 15.956 4.718-2.648.079-.23-.079-.128h-.231l-.789-.049-2.696-.073-2.337-.097-2.265-.121-.571-.122-.534-.704.055-.352.479-.322.686.061 1.518.103 2.277.158 1.651.097 2.447.255h.389l.054-.158-.133-.097-.104-.097-2.233-1.567-2.55-1.688-1.336-.971-.722-.492-.365-.461-.158-1.008.656-.722.88.06.225.061.893.686 1.906 1.475 2.489 1.834.365.303.145-.103.019-.073-.164-.273-1.354-2.447-1.445-2.489-.644-1.032-.17-.62c-.06-.254-.103-.466-.103-.728L6.287.134 6.7 0l.996.134.419.364.619 1.415 1.002 2.228 1.554 3.03.455.898.243.832.091.255h.158V8.86l.127-1.706.237-2.095.231-2.696.079-.759.376-.91.747-.492.583.28.48.685-.067.444-.286 1.852-.558 2.902-.365 1.943h.213l.243-.243.983-1.305 1.652-2.064.728-.82.85-.904.547-.431h1.032l.759 1.13-.34 1.165-1.063 1.348-.88 1.141-1.263 1.7-.79 1.36.073.11.188-.019 2.854-.607 1.542-.28 1.84-.315.831.388.091.395-.328.807-1.967.486-2.307.461-3.436.814-.043.03.049.061 1.548.146.662.036h1.621l3.017.225.79.522.473.637-.079.486-1.214.619-1.64-.388-3.825-.911-1.311-.328h-.182v.11l1.093 1.068 2.003 1.809 2.508 2.332.127.576-.322.456-.34-.049-2.203-1.657-.85-.747-1.925-1.621h-.128v.17l.444.65 2.343 3.521.122 1.081-.17.352-.607.213-.668-.122-1.372-1.924L14.38 17.96l-1.141-1.943-.14.079-.674 7.255-.315.37-.729.28-.607-.462-.322-.747.322-1.475.388-1.925.316-1.53.285-1.9.17-.632-.012-.042-.14.018-1.432 1.967-2.18 2.945-1.724 1.846-.413.164-.716-.371.067-.661.4-.59 2.386-3.035 1.44-1.882.928-1.087-.006-.158h-.055l-6.338 4.117-1.13.145-.485-.455.06-.747.231-.243 1.907-1.311Z"};
function modelBrand(value){
 const m=typeof value==='string'?{provider:value}:value;
 const text=[m.provider,m.providerName,m.model,m.id].filter(Boolean).join(' ').toLowerCase();
 const id=/claude|anthropic/.test(text)?'claude':/gemini|google/.test(text)?'gemini':/deepseek/.test(text)?'deepseek':/openai|gpt/.test(text)?'openai':'custom';
 return '<svg class="model-brand model-brand-'+id+'" viewBox="0 0 24 24" aria-hidden="true">'+(providerPaths[id]?'<path d="'+providerPaths[id]+'"/>':'<g fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><path d="m9.2 14.8-1.7 1.7a3.55 3.55 0 0 1-5-5l3-3a3.55 3.55 0 0 1 5 0M14.8 9.2l1.7-1.7a3.55 3.55 0 0 1 5 5l-3 3a3.55 3.55 0 0 1-5 0m-1.8 1.2 7.2-7.2"/></g>')+'</svg>';
}
// Layout follows DesktopModelManagement.tsx and modelProviders.ts in the desktop app.
// This prototype never sends credentials or connects to model providers.
const modelProviders = [
  {id:'openai',name:'OpenAI',url:'https://api.openai.com/v1',model:'gpt-5.6-sol',context:1050000},
  {id:'deepseek',name:'DeepSeek',url:'https://api.deepseek.com',model:'deepseek-v4-pro',context:128000},
  {id:'claude',name:'Claude',url:'https://api.anthropic.com/v1/',model:'claude-sonnet-5',context:200000},
  {id:'custom',name:'Свой API URL',url:'',model:'',context:128000}
];
const freshModelDraft = () => ({id:null,provider:'openai',name:'Моя OpenAI',url:modelProviders[0].url,model:modelProviders[0].model,key:'',context:1050000,tokens:4000,protocol:'auto',reasoning:'auto'});
let modelDraft=freshModelDraft(), modelFormOpen=false, modelVerified=false, modelReturnMode='page';
if(!Array.isArray(saved.modelConnections)) saved.modelConnections=[];
const featuredModels=[
  {id:'preset-gpt-5.6-sol',name:'GPT-5.6 Sol',providerName:'OpenAI',model:'gpt-5.6-sol'},
  {id:'preset-claude-sonnet-5',name:'Claude Sonnet 5',providerName:'Anthropic',model:'claude-sonnet-5'},
  {id:'preset-gemini-3.1-pro',name:'Gemini 3.1 Pro',providerName:'Google',model:'gemini-3.1-pro-preview'}
];
const defaultModelId=featuredModels[0].id;
function availableModels(){return [...featuredModels,...saved.modelConnections];}
if(!availableModels().some(m=>m.id===saved.chatModel)){saved.chatModel=defaultModelId;persist();}
function chosenModel(){return availableModels().find(m=>m.id===saved.chatModel)||featuredModels[0];}
function modelProvider(id){return modelProviders.find(p=>p.id===id)||modelProviders[3];}

$('#ai-panel .panel-context').insertAdjacentHTML('afterend','<div class="chat-model-bar"><button id="chat-model-picker" aria-label="Выбрать модель чата" aria-haspopup="dialog"></button><button id="manage-chat-models" class="icon-button" aria-label="Мои модели: подключить и настроить" title="Мои модели">'+icon('settings')+'</button></div>');
function refreshModelPicker(){
  const model=chosenModel();
  $('#chat-model-picker').innerHTML=modelBrand(model)+'<span><small>МОДЕЛЬ ЧАТА</small><strong>'+escapeText(model.name)+'</strong></span>'+icon('down');
  drawIcons($('.chat-model-bar'));
}
function openModelPicker(){
  simpleDialog('Модель для диалога','<p class="model-dialog-hint">Выберите LLM или добавьте своё подключение. В макете ответы демонстрационные, запросы к моделям не отправляются.</p><div class="model-options">'+availableModels().map(m=>`<button data-pick-model="${escapeText(m.id)}" aria-pressed="${saved.chatModel===m.id}">${modelBrand(m)}<span><strong>${escapeText(m.name)}</strong><small>${escapeText(m.providerName||m.model)} · ${m.providerName?'пример в макете':'своё подключение'}</small></span>${icon(saved.chatModel===m.id?'check':'right')}</button>`).join('')+'</div><button class="outline-button model-manage-link" id="picker-manage">'+icon('plus')+'Подключить свою модель</button>');
  document.querySelectorAll('[data-pick-model]').forEach(b=>b.onclick=()=>{saved.chatModel=b.dataset.pickModel;persist();refreshModelPicker();$('#dialog').close();$('#chat-model-picker').focus();});
  $('#picker-manage').onclick=()=>{$('#dialog').close();openModels(true);};
}
$('#chat-model-picker').onclick=openModelPicker;
$('#manage-chat-models').onclick=()=>openModels(false);
function openModels(add=false){
  if(view==='ai') modelReturnMode=toolMode;
  if(add){modelDraft=freshModelDraft();modelVerified=false;modelFormOpen=true;}
  showSection('models');
}
const beforeModelsSection=showSection;
showSection=function(next,resetPanel=true){beforeModelsSection(next,resetPanel);if(next==='models')renderModels();};
const beforeModelsNavigation=syncNavigation;
syncNavigation=function(){
  beforeModelsNavigation();
  if(section==='models'){
    ['.rail [data-nav="ai"]','[data-mobile="ai"]'].forEach(s=>{const b=$(s);b.classList.add('active');b.setAttribute('aria-current','page');});
  }
};
const beforeModelsMore=openMore;
openMore=function(){
  beforeModelsMore();
  $('[data-menu="settings"]').insertAdjacentHTML('beforebegin','<button id="mobile-models">'+icon('spark')+'<span><strong>Мои модели</strong><small>Подключения для AI-чата</small></span>'+icon('right')+'</button>');
  $('#mobile-models').onclick=()=>{$('#dialog').close();modelReturnMode='page';openModels();};
  drawIcons($('#mobile-models'));
};
function renderModels(){
  $('#workspace-panel').innerHTML=workspaceHeader('AI-ПОМОЩНИК','Мои модели','Подключите свой сервис и выбирайте модель прямо в диалоге.')+`<div class="models-layout ${modelFormOpen?'editing-model':''}"><aside class="models-list"><div class="models-list-title"><h2>Доступные модели</h2><button id="new-model" class="icon-button" aria-label="Добавить подключение">${icon('plus')}</button></div>${featuredModels.map(m=>`<button class="connection-card ${saved.chatModel===m.id?'selected':''}" data-use-model="${m.id}">${modelBrand(m)}<span><strong>${m.name}</strong><small>${m.providerName} · пример в макете</small></span>${saved.chatModel===m.id?icon('check'):''}</button>`).join('')}<h3>Мои подключения <span>${saved.modelConnections.length}</span></h3>${saved.modelConnections.length?saved.modelConnections.map(m=>`<article class="connection-card custom-connection ${saved.chatModel===m.id?'selected':''}"><div class="connection-main">${modelBrand(m)}<span><strong>${escapeText(m.name)}</strong><small>${escapeText(m.model)}</small><em>Сохранено в макете</em></span></div><div class="connection-actions"><button data-use-model="${escapeText(m.id)}" ${saved.chatModel===m.id?'disabled':''}>${saved.chatModel===m.id?'Выбрана':'Выбрать'}</button><button data-edit-model="${escapeText(m.id)}">Настроить</button></div></article>`).join(''):'<div class="models-empty">'+icon('globe')+'<p>Здесь появятся ваши подключения</p><span>API-ключ и модель предоставляются выбранным сервисом.</span></div>'}<button class="outline-button" id="add-model">${icon('plus')}Добавить подключение</button></aside><section class="model-editor">${modelFormOpen?modelFormMarkup():`<div class="model-welcome"><div class="assistant-mark">${icon('spark')}</div><h2>Ваши модели — в привычном чате</h2><p>Выберите провайдера, укажите данные подключения и проверьте их. Сохранённая модель появится в списке над диалогом.</p><div class="provider-summary">${modelProviders.map(p=>`<span>${modelBrand(p.id)}${p.name}</span>`).join('')}</div><button class="gold-button" id="start-model">${icon('plus')}Подключить свою модель</button><small>Демонстрация интерфейса. Подключения к API не выполняются.</small></div>`}</section></div>`;
  wireWorkspace();
  $('#workspace-back').innerHTML=icon('back')+'К диалогу';
  $('#workspace-back').onclick=()=>{openTool('ai',modelReturnMode);refreshModelPicker();};
  // Keep a clear return path on small screens as well.
  $('#workspace-back').classList.add('models-return');
  const start=()=>{modelDraft=freshModelDraft();modelFormOpen=true;modelVerified=false;renderModels();};
  $('#new-model').onclick=start;$('#add-model').onclick=start;if($('#start-model'))$('#start-model').onclick=start;
  document.querySelectorAll('[data-use-model]').forEach(b=>b.onclick=()=>{saved.chatModel=b.dataset.useModel;persist();refreshModelPicker();renderModels();});
  document.querySelectorAll('[data-edit-model]').forEach(b=>b.onclick=()=>{modelDraft={...saved.modelConnections.find(m=>m.id===b.dataset.editModel),key:''};modelVerified=false;modelFormOpen=true;renderModels();});
  if(modelFormOpen)wireModelForm();
  drawIcons($('#workspace-panel'));syncNavigation();
  $('#workspace-panel').scrollTop=0;
}
function modelFormMarkup(){
  const d=modelDraft;
  const options=(items,value)=>items.map(([id,name])=>`<option value="${id}" ${id===value?'selected':''}>${name}</option>`).join('');
  return `<div class="model-editor-heading"><div><span class="overline">ПОДКЛЮЧЕНИЕ</span><h2>${d.id?'Настройки модели':'Новая модель'}</h2></div><button class="icon-button" id="cancel-model" aria-label="Закрыть форму">${icon('close')}</button></div><form id="model-form"><fieldset class="provider-fieldset"><legend>1. Выберите провайдера</legend><div class="provider-choices">${modelProviders.map(p=>`<button type="button" data-provider="${p.id}" aria-pressed="${p.id===d.provider}">${modelBrand(p.id)}${p.name}${p.id===d.provider?icon('check'):''}</button>`).join('')}</div></fieldset><fieldset class="model-fields"><legend>2. Данные подключения</legend><label>Название подключения<input id="model-name" maxlength="80" required value="${escapeText(d.name)}" placeholder="Например, Для изучения шастр"></label><label>Идентификатор модели<input id="model-identifier" maxlength="160" required value="${escapeText(d.model)}" placeholder="Имя модели у провайдера" spellcheck="false" autocapitalize="off"></label><label class="model-wide">API URL<input id="model-url" type="url" required value="${escapeText(d.url)}" placeholder="https://api.example.com/v1" spellcheck="false" autocapitalize="off"></label><label class="model-wide">API-ключ <span class="model-key-field"><input id="model-key" type="password" value="${escapeText(d.key)}" placeholder="Для макета используйте demo-key" autocomplete="off" spellcheck="false"><button id="reveal-model-key" type="button" aria-pressed="false">Показать</button></span><small>В макете ключ не сохраняется и не отправляется.</small></label></fieldset><details class="model-advanced"><summary>Дополнительные параметры</summary><div class="model-fields"><label>Протокол<select id="model-protocol">${options([['auto','Автоматически'],['openai_chat','Chat Completions'],['openai_responses','Responses API'],['anthropic_messages','Anthropic Messages'],['gemini_interactions','Gemini Interactions']],d.protocol)}</select></label><label>Рассуждение<select id="model-reasoning">${options(['auto','none','minimal','low','medium','high','xhigh','max'].map(x=>[x,x==='auto'?'Автоматически':x]),d.reasoning)}</select></label><label>Максимум токенов ответа<input id="model-tokens" type="number" min="1" max="10000000" value="${d.tokens}" required></label><label>Размер контекста<input id="model-context" type="number" min="1" max="10000000" value="${d.context}" required></label></div></details><div class="model-check"><div><h3>3. Проверьте подключение</h3><p>В этом макете проверяется заполнение полей. Запрос к API не отправляется.</p></div><button type="button" class="outline-button" id="test-model">Проверить подключение</button></div><p id="model-notice" role="status" ${modelVerified?'':'hidden'}>${modelVerified?'Демо-проверка пройдена. Соединение с API не выполнялось.':''}</p><div class="model-form-footer"><button class="gold-button" type="submit" id="save-model" ${modelVerified?'':'disabled'}>Сохранить подключение</button>${d.id?'<button type="button" id="delete-model">Удалить</button>':''}<small>Сохраняются только настройки макета, без API-ключа.</small></div></form>`;
}
function readModelDraft(){
  Object.assign(modelDraft,{name:$('#model-name').value.trim(),model:$('#model-identifier').value.trim(),url:$('#model-url').value.trim(),key:$('#model-key').value,tokens:Number($('#model-tokens').value),context:Number($('#model-context').value),protocol:$('#model-protocol').value,reasoning:$('#model-reasoning').value});
}
function wireModelForm(){
  $('#cancel-model').onclick=()=>{modelFormOpen=false;modelDraft.key='';renderModels();};
  document.querySelectorAll('[data-provider]').forEach(b=>b.onclick=()=>{readModelDraft();const p=modelProvider(b.dataset.provider);modelDraft={...modelDraft,provider:p.id,name:modelDraft.id?modelDraft.name:(p.id==='custom'?'':'Моя '+p.name),url:p.url,model:p.model,context:p.context,key:p.id===modelDraft.provider?modelDraft.key:'',protocol:'auto'};modelVerified=false;renderModels();});
  $('#reveal-model-key').onclick=()=>{const show=$('#model-key').type==='password';$('#model-key').type=show?'text':'password';$('#reveal-model-key').textContent=show?'Скрыть':'Показать';$('#reveal-model-key').setAttribute('aria-pressed',String(show));};
  const invalidate=()=>{readModelDraft();modelVerified=false;$('#save-model').disabled=true;$('#model-notice').hidden=true;};
  $('#model-form').oninput=invalidate;$('#model-form').onchange=invalidate;
  $('#test-model').onclick=()=>{
    readModelDraft();
    $('#model-url').setCustomValidity('');
    $('#model-key').setCustomValidity('');
    const d=modelDraft;
    try{const u=new URL(d.url);if(!['https:','http:'].includes(u.protocol))throw Error();}catch{$('#model-url').setCustomValidity('Укажите полный http или https адрес API.');}
    if(!d.key.trim())$('#model-key').setCustomValidity('Для проверки макета введите demo-key.');
    if(!$('#model-tokens').validity.valid||!$('#model-context').validity.valid) $('.model-advanced').open=true;
    if(!$('#model-form').reportValidity())return;
    if(!d.name||!d.model){$('#model-notice').hidden=false;$('#model-notice').textContent='Укажите название подключения и идентификатор модели.';return;}
    modelVerified=true;$('#save-model').disabled=false;$('#model-notice').hidden=false;$('#model-notice').textContent='Демо-проверка пройдена. Соединение с API не выполнялось.';
  };
  $('#model-form').onsubmit=e=>{
    e.preventDefault();if(!modelVerified)return;readModelDraft();
    const {key,...metadata}=modelDraft;metadata.id=metadata.id||newId();
    const i=saved.modelConnections.findIndex(m=>m.id===metadata.id);
    if(i<0)saved.modelConnections.push(metadata);else saved.modelConnections[i]=metadata;
    saved.chatModel=metadata.id;persist();modelDraft.key='';modelFormOpen=false;refreshModelPicker();renderModels();toast('Настройки модели сохранены в макете. API-ключ не сохранён.');
  };
  if($('#delete-model'))$('#delete-model').onclick=()=>{
    const id=modelDraft.id;
    simpleDialog('Удалить подключение?',`<p>«${escapeText(modelDraft.name)}» будет удалено из списка моделей. Текущий диалог останется.</p><div class="editor-actions"><button id="keep-model">Отмена</button><button class="gold-button" id="confirm-delete-model">Удалить</button></div>`);
    $('#keep-model').onclick=()=>$('#dialog').close();
    $('#confirm-delete-model').onclick=()=>{saved.modelConnections=saved.modelConnections.filter(m=>m.id!==id);if(saved.chatModel===id)saved.chatModel=defaultModelId;persist();modelDraft.key='';modelFormOpen=false;$('#dialog').close();refreshModelPicker();renderModels();};
  };
}
refreshModelPicker();
drawIcons($('.chat-model-bar'));
if(new URLSearchParams(location.search).get('section')==='models')showSection('models');
