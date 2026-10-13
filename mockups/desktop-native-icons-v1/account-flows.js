// Local preview of sign-in, sign-out and capabilities. Never submits credentials.
(() => {
 const profileBase=renderProfile,originalShow=showSection,originalTool=openTool,originalView=setView,originalModels=openModels;
 const aiIntro=$('.ai-intro'),originalIntro=aiIntro.innerHTML;
 let rendering=0;
 try{const address=sessionStorage.getItem('vedarama-preview-session-email');if(demoAccount.signedIn&&address)profileData.email=address;}catch{}
 function normalizeSearchAccess(){
  searchPrefs.exact=true;searchPrefs.ai=hasAiAccess();
  if(!hasAiAccess()){searchMode='exact';searchPrefs.defaultMode='exact';searchResultTab='exact';if(searchRun)searchRun={...searchRun,mode:'exact'};}
 }
 function syncPolicy(){
  if(rendering)return;
  const access=hasAiAccess(),button=$('#profile-button');
  if(button){const name=demoAccount.signedIn?'Профиль':'Войти в аккаунт';button.title=name;button.setAttribute('aria-label',name);button.dataset.tip=name;}
  if(!access){
   if(demoAccount.signedIn&&section==='profile'&&$('.workspace-heading p'))$('.workspace-heading p').textContent='Личные данные и доступ к библиотеке.';
   if($('.new-tab-page>p'))$('.new-tab-page>p').textContent='Откройте книгу или найдите нужное место.';
   if($('#new-tab-query'))$('#new-tab-query').placeholder='Слово или фраза…';
   if($('.new-tab-hint'))$('.new-tab-hint').textContent='У каждой вкладки своё место чтения и поиск. Переключайтесь — всё останется на месте.';
   $('#search-manage-models')?.closest('.unified-model-option')?.remove();
   $('[data-search-mode=ai]')?.closest('label')?.remove();
   $('.search-mode-row')?.remove();
   if($('.search-demo-hint'))$('.search-demo-hint').textContent='Пример библиотеки: БГ 2.47, словарные статьи и пословный перевод.';
   if($('.search-mode-description'))$('.search-mode-description').textContent='Точные совпадения в выбранных источниках.';
   if($('#library-query'))$('#library-query').placeholder=searchPrefs.sources?.[0]==='word'?'Санскритское слово или его перевод…':searchPrefs.sources?.[0]==='dictionaries'?'Термин, имя или место…':'Слово или фраза…';
  }
  if(access&&!demoAccount.modelConnected){
   aiIntro.hidden=false;
   if(!$('#connect-preview-model')){aiIntro.innerHTML='<h2>Подключите модель</h2><p>Выберите провайдера и настройте подключение, чтобы начать разговор.</p><button id="connect-preview-model" class="outline-button">Настроить модель</button>';$('#connect-preview-model').onclick=()=>openModels();}
   for(const [selector,text]of [['h2','Подключите модель'],['p','Выберите провайдера и настройте подключение, чтобы начать разговор.']]){const value=window.uiText?.(text)||text,node=aiIntro.querySelector(selector);if(node.textContent!==value)node.textContent=value;}
  }else if($('#connect-preview-model'))aiIntro.innerHTML=originalIntro;
  const switcher=$('#demo-account-switch'),name='Аккаунт: '+({full:'Полный доступ',library:'Библиотека',guest:'Без входа'})[demoAccount.mode];if(switcher&&switcher.textContent!==name)switcher.textContent=name;
 }
 function guestProfile(){
  $('#workspace-panel').innerHTML=workspaceHeader('АККАУНТ','Войти в аккаунт','Ваши данные и возможности доступны после входа.')+'<div class="account-login-card"><p class="account-demo-notice">Это макет. Используйте вымышленные данные: настоящий вход не выполняется.</p><form id="account-login-form"><label for="login-email">Электронная почта</label><input id="login-email" type="email" required maxlength="254" autocomplete="off" placeholder="reader@example.com"><div class="login-password-heading"><label for="login-password">Пароль</label><a href="https://vedarama.com/forgot-password" target="_blank" rel="noopener">Забыли пароль? ↗</a></div><div class="login-password-field"><input id="login-password" type="password" required autocomplete="off" placeholder="Любой тестовый пароль"><button type="button" id="login-show-password" aria-pressed="false">Показать</button></div><label class="login-remember"><input id="login-remember" type="checkbox">Запомнить меня</label><p id="login-error" role="alert" hidden></p><button type="submit" class="gold-button" id="login-submit">Войти</button></form><div class="login-registration"><span>Нет аккаунта?</span><a href="https://vedarama.com/registration" target="_blank" rel="noopener">Регистрация ↗</a></div></div>';
  wireWorkspace();const form=$('#account-login-form'),password=$('#login-password'),email=$('#login-email');
  try{email.value=localStorage.getItem('vedarama-preview-remembered-email')||'';}catch{}
  $('#login-show-password').onclick=()=>{const show=password.type==='password';password.type=show?'text':'password';$('#login-show-password').textContent=show?'Скрыть':'Показать';$('#login-show-password').setAttribute('aria-pressed',String(show));};
  form.onsubmit=async event=>{
   event.preventDefault();const submit=$('#login-submit'),error=$('#login-error'),remember=$('#login-remember').checked,address=email.value.trim();submit.disabled=true;submit.textContent='Входим…';error.hidden=true;
   await new Promise(resolve=>setTimeout(resolve,400));if(!form.isConnected)return;
   if(demoAccount.loginOutcome!=='success'){error.textContent=demoAccount.loginOutcome==='network'?'Не удалось соединиться. Попробуйте ещё раз.':'Неверная почта или пароль.';error.hidden=false;submit.disabled=false;submit.textContent='Войти';return;}
   password.value='';profileData.email=address;try{sessionStorage.setItem('vedarama-preview-session-email',address);}catch{}
   try{if(remember)localStorage.setItem('vedarama-preview-remembered-email',address);else localStorage.removeItem('vedarama-preview-remembered-email');}catch{}
   demoAccount.setMode(demoAccount.lastMode);renderProfile();toast('Вход выполнен в макете');
  };
 }
 renderProfile=function(){
  if(!demoAccount.signedIn){guestProfile();syncPolicy();return;}
  rendering++;try{profileBase();}finally{rendering--;}$('.profile-card-heading>span').textContent='Пример аккаунта';
  const access=$('.profile-access');
  access.querySelectorAll('div').forEach(row=>{if(row.querySelector('dt')?.textContent==='ИИ-помощник'){if(!hasAiAccess())row.remove();else row.querySelector('dd').textContent=demoAccount.modelConnected?'Доступен · пример':'Доступен · модель не подключена';}});
  const models=$('#profile-models');if(!hasAiAccess())models.remove();
  const actions=document.createElement('div');actions.className='profile-account-actions';actions.innerHTML='<button id="account-logout" class="outline-button">Выйти из аккаунта</button>';$('.profile-side').append(actions);
  $('#account-logout').onclick=()=>{
   simpleDialog('Выйти из аккаунта?','<p>Для следующего входа потребуется почта и пароль.</p><div class="editor-actions"><button id="logout-cancel">Отмена</button><button id="logout-confirm" class="gold-button">Выйти из аккаунта</button></div>');
   $('#logout-cancel').onclick=()=>$('#dialog').close();$('#logout-confirm').onclick=()=>{$('#dialog').close();try{sessionStorage.removeItem('vedarama-preview-session-email');}catch{}demoAccount.setMode('guest');renderProfile();};
  };syncPolicy();
 };
 showSection=function(next,reset=true){if(!hasAiAccess()&&(next==='ai'||next==='models'))next='read';originalShow(next,reset);syncPolicy();};
 openTool=function(next,mode='panel'){if(next==='ai'&&!hasAiAccess())return;originalTool(next,mode);syncPolicy();};
 setView=function(next){if(next==='ai'&&!hasAiAccess())next='read';originalView(next);syncPolicy();};
 openModels=function(){if(!hasAiAccess())return;originalModels();};
 const originalSearch=renderSearch;renderSearch=function(){normalizeSearchAccess();rendering++;try{originalSearch();}finally{rendering--;}syncPolicy();};
 const originalResults=renderSearchResults;renderSearchResults=function(){normalizeSearchAccess();rendering++;try{originalResults();}finally{rendering--;}syncPolicy();};
 const originalRun=runSearch;runSearch=function(){normalizeSearchAccess();if(hasAiAccess()&&!demoAccount.modelConnected&&searchMode!=='exact'){simpleDialog('Настройте модель','<p>Подключите модель перед поиском с ИИ. Запрос и выбранные книги сохранены.</p><button id="connect-search-model" class="gold-button">Настроить модель</button>');$('#connect-search-model').onclick=()=>{$('#dialog').close();openModels();};return;}originalRun();};
 const originalAiMarkup=aiResultMarkup;aiResultMarkup=function(run){return hasAiAccess()?originalAiMarkup(run):'';};
 const originalTurn=appendChatTurn;appendChatTurn=function(...args){if(hasAiAccess()&&demoAccount.modelConnected)originalTurn(...args);};
 $('#ai-form').addEventListener('submit',event=>{if(!hasAiAccess()||!demoAccount.modelConnected){event.preventDefault();event.stopImmediatePropagation();}},true);
 document.addEventListener('submit',event=>{if(event.target.id==='model-form'&&modelVerified)queueMicrotask(()=>{if(!modelFormOpen)demoAccount.setModelConnected(true);});});
 const switchButton=document.createElement('button');switchButton.id='demo-account-switch';switchButton.className='text-button';$('.preview-controls').prepend(switchButton);
 switchButton.onclick=()=>{
  simpleDialog('Состояния макета','<div class="demo-account-options"><fieldset><legend>Аккаунт</legend>'+[['full','Полный доступ'],['library','Библиотека'],['guest','Без входа']].map(item=>'<label><input type="radio" name="demo-account" value="'+item[0]+'" '+(demoAccount.mode===item[0]?'checked':'')+'>'+item[1]+'</label>').join('')+'</fieldset><label class="demo-model-choice"><input id="demo-model-connected" type="checkbox" '+(demoAccount.modelConnected?'checked':'')+'>Модель подключена</label><label>Сценарий входа<select id="demo-login-outcome"><option value="success">Успешный вход</option><option value="credentials">Неверные данные</option><option value="network">Ошибка соединения</option></select></label></div>');
  $('#demo-login-outcome').value=demoAccount.loginOutcome;$('#demo-login-outcome').onchange=e=>demoAccount.loginOutcome=e.target.value;
  $('#demo-model-connected').onchange=e=>demoAccount.setModelConnected(e.target.checked);
  document.querySelectorAll('input[name=demo-account]').forEach(input=>input.onchange=()=>{if(input.checked){$('#dialog').close();demoAccount.setMode(input.value);}});
 };
 document.addEventListener('demo-account-change',()=>{
  window.pageCarousel?.finish();window.headerLayoutMotion?.finish();window.searchCatalogMotion?.finish();window.finishPanelCarousel?.();window.finishRegionCarousels?.();window.desktopMotion?.settle();
  normalizeSearchAccess();if(!hasAiAccess())window.workspaceTabs?.restrictAi();else if(section==='search')renderSearch();
  if(section==='profile')renderProfile();if(section==='activity')renderActivity();updateActivityBadge();syncPolicy();window.pageCarousel?.invalidate();window.desktopMotion?.flush(true);
 });
 document.addEventListener('demo-model-change',()=>{syncPolicy();if(section==='profile')renderProfile();});
 // Tab restoration can recreate search/profile controls without changing the account.
 document.addEventListener('workspace-tabs-change',syncPolicy);
 normalizeSearchAccess();if(!hasAiAccess())window.workspaceTabs?.restrictAi();
 if(section==='profile')renderProfile();if(section==='search')renderSearch();if(section==='activity')renderActivity();updateActivityBadge();syncPolicy();
})();
