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
  $('#chat-model-picker').innerHTML=icon('spark')+'<span><small>МОДЕЛЬ ЧАТА</small><strong>'+escapeText(model.name)+'</strong></span>'+icon('down');
  drawIcons($('.chat-model-bar'));
}
function openModelPicker(){
  simpleDialog('Модель для диалога','<p class="model-dialog-hint">Выберите LLM или добавьте своё подключение. В макете ответы демонстрационные, запросы к моделям не отправляются.</p><div class="model-options">'+availableModels().map(m=>`<button data-pick-model="${escapeText(m.id)}" aria-pressed="${saved.chatModel===m.id}">${icon('spark')}<span><strong>${escapeText(m.name)}</strong><small>${escapeText(m.providerName||m.model)} · ${m.providerName?'пример в макете':'своё подключение'}</small></span>${icon(saved.chatModel===m.id?'check':'right')}</button>`).join('')+'</div><button class="outline-button model-manage-link" id="picker-manage">'+icon('plus')+'Подключить свою модель</button>');
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
  $('#workspace-panel').innerHTML=workspaceHeader('AI-ПОМОЩНИК','Мои модели','Подключите свой сервис и выбирайте модель прямо в диалоге.')+`<div class="models-layout ${modelFormOpen?'editing-model':''}"><aside class="models-list"><div class="models-list-title"><h2>Доступные модели</h2><button id="new-model" class="icon-button" aria-label="Добавить подключение">${icon('plus')}</button></div>${featuredModels.map(m=>`<button class="connection-card ${saved.chatModel===m.id?'selected':''}" data-use-model="${m.id}">${icon('spark')}<span><strong>${m.name}</strong><small>${m.providerName} · пример в макете</small></span>${saved.chatModel===m.id?icon('check'):''}</button>`).join('')}<h3>Мои подключения <span>${saved.modelConnections.length}</span></h3>${saved.modelConnections.length?saved.modelConnections.map(m=>`<article class="connection-card custom-connection ${saved.chatModel===m.id?'selected':''}"><div class="connection-main">${icon('globe')}<span><strong>${escapeText(m.name)}</strong><small>${escapeText(m.model)}</small><em>Сохранено в макете</em></span></div><div class="connection-actions"><button data-use-model="${escapeText(m.id)}" ${saved.chatModel===m.id?'disabled':''}>${saved.chatModel===m.id?'Выбрана':'Выбрать'}</button><button data-edit-model="${escapeText(m.id)}">Настроить</button></div></article>`).join(''):'<div class="models-empty">'+icon('globe')+'<p>Здесь появятся ваши подключения</p><span>API-ключ и модель предоставляются выбранным сервисом.</span></div>'}<button class="outline-button" id="add-model">${icon('plus')}Добавить подключение</button></aside><section class="model-editor">${modelFormOpen?modelFormMarkup():`<div class="model-welcome"><div class="assistant-mark">${icon('spark')}</div><h2>Ваши модели — в привычном чате</h2><p>Выберите провайдера, укажите данные подключения и проверьте их. Сохранённая модель появится в списке над диалогом.</p><div class="provider-summary">${modelProviders.map(p=>`<span>${p.name}</span>`).join('')}</div><button class="gold-button" id="start-model">${icon('plus')}Подключить свою модель</button><small>Демонстрация интерфейса. Подключения к API не выполняются.</small></div>`}</section></div>`;
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
  return `<div class="model-editor-heading"><div><span class="overline">ПОДКЛЮЧЕНИЕ</span><h2>${d.id?'Настройки модели':'Новая модель'}</h2></div><button class="icon-button" id="cancel-model" aria-label="Закрыть форму">${icon('close')}</button></div><form id="model-form"><fieldset class="provider-fieldset"><legend>1. Выберите провайдера</legend><div class="provider-choices">${modelProviders.map(p=>`<button type="button" data-provider="${p.id}" aria-pressed="${p.id===d.provider}"><span class="provider-monogram">${p.id==='custom'?'+':p.name[0]}</span>${p.name}${p.id===d.provider?icon('check'):''}</button>`).join('')}</div></fieldset><fieldset class="model-fields"><legend>2. Данные подключения</legend><label>Название подключения<input id="model-name" maxlength="80" required value="${escapeText(d.name)}" placeholder="Например, Для изучения шастр"></label><label>Идентификатор модели<input id="model-identifier" maxlength="160" required value="${escapeText(d.model)}" placeholder="Имя модели у провайдера" spellcheck="false" autocapitalize="off"></label><label class="model-wide">API URL<input id="model-url" type="url" required value="${escapeText(d.url)}" placeholder="https://api.example.com/v1" spellcheck="false" autocapitalize="off"></label><label class="model-wide">API-ключ <span class="model-key-field"><input id="model-key" type="password" value="${escapeText(d.key)}" placeholder="Для макета используйте demo-key" autocomplete="off" spellcheck="false"><button id="reveal-model-key" type="button" aria-pressed="false">Показать</button></span><small>В макете ключ не сохраняется и не отправляется.</small></label></fieldset><details class="model-advanced"><summary>Дополнительные параметры</summary><div class="model-fields"><label>Протокол<select id="model-protocol">${options([['auto','Автоматически'],['openai_chat','Chat Completions'],['openai_responses','Responses API'],['anthropic_messages','Anthropic Messages'],['gemini_interactions','Gemini Interactions']],d.protocol)}</select></label><label>Рассуждение<select id="model-reasoning">${options(['auto','none','minimal','low','medium','high','xhigh','max'].map(x=>[x,x==='auto'?'Автоматически':x]),d.reasoning)}</select></label><label>Максимум токенов ответа<input id="model-tokens" type="number" min="1" max="10000000" value="${d.tokens}" required></label><label>Размер контекста<input id="model-context" type="number" min="1" max="10000000" value="${d.context}" required></label></div></details><div class="model-check"><div><h3>3. Проверьте подключение</h3><p>В этом макете проверяется заполнение полей. Запрос к API не отправляется.</p></div><button type="button" class="outline-button" id="test-model">Проверить подключение</button></div><p id="model-notice" role="status" ${modelVerified?'':'hidden'}>${modelVerified?'Демо-проверка пройдена. Соединение с API не выполнялось.':''}</p><div class="model-form-footer"><button class="gold-button" type="submit" id="save-model" ${modelVerified?'':'disabled'}>Сохранить подключение</button>${d.id?'<button type="button" id="delete-model">Удалить</button>':''}<small>Сохраняются только настройки макета, без API-ключа.</small></div></form>`;
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
