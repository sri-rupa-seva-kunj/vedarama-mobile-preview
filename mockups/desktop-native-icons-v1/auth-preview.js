// A separate signed-out screen and one preview-only control for account scenarios.
(() => {
 const app=document.querySelector('.application'),switcher=document.querySelector('#demo-account-switch');
 const screen=document.createElement('main');screen.id='auth-screen';screen.className='auth-screen';screen.hidden=true;screen.setAttribute('aria-labelledby','auth-title');
 screen.innerHTML='<section class="auth-content"><img class="auth-logo" alt="Ведарама"><h1 id="auth-title">Вход в систему</h1><div class="auth-form-host"></div></section><footer class="auth-footer"><div class="auth-language" aria-label="Язык интерфейса"><button type="button" data-auth-language="ru">Русский</button><button type="button" data-auth-language="en">English</button></div><nav class="auth-documents" aria-label="Документы"><a href="https://vedarama.com/privacy-policy.html#russian" target="_blank" rel="noopener">Политика конфиденциальности</a><a href="https://vedarama.com/terms-of-use.html#russian" target="_blank" rel="noopener">Пользовательское соглашение</a></nav></footer>';
 app.before(screen);const host=screen.querySelector('.auth-form-host'),baseProfile=renderProfile;
 function mountLogin(){
  host.replaceChildren();baseProfile();const card=document.querySelector('#workspace-panel .account-login-card');if(!card)return;host.append(card);
  card.querySelector('.account-demo-notice')?.remove();card.querySelector('label[for=login-email]').textContent='E-mail адрес';card.querySelector('#login-email').placeholder='example@vedarama.com';card.querySelector('#login-password').placeholder='';
  const forgot=card.querySelector('.login-password-heading a');forgot.textContent='Забыли пароль?';forgot.href='https://vedarama.ru/forgot-password';
  const actions=document.createElement('div');actions.className='login-actions';actions.append(card.querySelector('.login-remember'),card.querySelector('#login-submit'));card.querySelector('#account-login-form').append(actions);
  const registration=card.querySelector('.login-registration'),link=registration.querySelector('a');link.textContent='Регистрация';link.href='https://vedarama.ru/registration';link.className='outline-button';registration.replaceChildren(link);
  localize();
 }
 renderProfile=function(){if(!demoAccount.signedIn)mountLogin();else baseProfile();};
 function localize(){
  const language=window.uiLanguage||'ru';screen.querySelector('.auth-logo').src='assets/vedarama-new-'+(document.documentElement.dataset.theme||'light')+'.svg?v=1.65';
  screen.querySelectorAll('[data-auth-language]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.authLanguage===language)));
  screen.querySelectorAll('.auth-documents a').forEach(link=>link.hash=language==='en'?'english':'russian');window.uiLocalize?.();
 }
 screen.querySelectorAll('[data-auth-language]').forEach(button=>button.onclick=()=>{window.uiSetLanguage?.(button.dataset.authLanguage);localize();});
 const nativeTheme=applyTheme;applyTheme=function(theme){nativeTheme(theme);localize();};
 function settle(){window.readingEntry?.cancel();window.pageCarousel?.finish();window.activityMotion?.finish();window.headerLayoutMotion?.finish();window.finishReaderPageTurn?.();window.finishPanelCarousel?.();window.finishRegionCarousels?.();window.desktopMotion?.settle();}
 let signedIn=demoAccount.signedIn;
 function sync(){
  const entering=demoAccount.signedIn&&!signedIn;signedIn=demoAccount.signedIn;settle();
  if(!signedIn){document.querySelector('#dialog')?.close();document.body.classList.remove('focus-mode','focus-catalog-open','mobile-tree','mobile-inspector');app.inert=true;app.setAttribute('aria-hidden','true');screen.hidden=false;renderProfile();}
  else{app.inert=false;app.removeAttribute('aria-hidden');screen.hidden=true;host.replaceChildren();if(entering)showSection('read');}
  localize();window.desktopMotion?.flush(true);
 }
 const states=[['guest','Нужен вход','Только экран авторизации'],['full','С доступом к ИИ','Библиотека и Чат'],['library','Без доступа к ИИ','Библиотека без упоминаний ИИ'],['disconnected','Модель не подключена','Чат с настройкой подключения']];
 const scenes=[['read','Чтение'],['notes','С заметками'],['focus','Режим чтения'],['search','Поиск'],['saved','Моя библиотека'],['profile','Профиль'],['activity','Новости и уведомления'],['help','Помощь'],['settings','Настройки']];
 const state=()=>!demoAccount.signedIn?'guest':!hasAiAccess()?'library':demoAccount.modelConnected?'full':'disconnected';
 switcher.onclick=()=>{
  const screens=demoAccount.signedIn?'<section class="preview-scenes"><h3>Экраны приложения</h3><div class="preview-scene-options">'+[...scenes,...(hasAiAccess()?[['ai','Книга и Чат']]:[])].map(([id,label])=>'<button type="button" class="outline-button" data-preview-scene="'+id+'">'+label+'</button>').join('')+'</div></section>':'';
  simpleDialog('Состояния макета','<h3 class="preview-account-heading">Аккаунт</h3><div class="preview-state-options" role="group" aria-label="Состояния аккаунта">'+states.map(([id,label,description])=>'<button type="button" data-preview-state="'+id+'" aria-pressed="'+(state()===id)+'"><span class="preview-state-dot" aria-hidden="true"></span><span><strong>'+label+'</strong><small>'+description+'</small></span></button>').join('')+'</div>'+screens+'<div class="preview-login-scenario"><label for="preview-login-outcome">Сценарий входа</label><select id="preview-login-outcome"><option value="success">Успешный вход</option><option value="credentials">Неверные данные</option><option value="network">Ошибка соединения</option></select></div><p class="preview-state-notice">Для проверки входа используйте вымышленные данные. Настоящий вход не выполняется.</p>');
  document.querySelector('#preview-login-outcome').value=demoAccount.loginOutcome;document.querySelector('#preview-login-outcome').onchange=event=>demoAccount.loginOutcome=event.target.value;
  document.querySelectorAll('[data-preview-state]').forEach(button=>button.onclick=()=>{document.querySelector('#dialog').close();const id=button.dataset.previewState;demoAccount.setModelConnected(id!=='disconnected');demoAccount.setMode(id==='disconnected'?'full':id);});
  document.querySelectorAll('[data-preview-scene]').forEach(button=>button.onclick=()=>{document.querySelector('#dialog').close();const id=button.dataset.previewScene;if(id==='help'||id==='settings'){openDialog(id);return;}if(id==='focus'){if(!document.body.classList.contains('focus-mode'))document.querySelector('#focus').click();return;}if(id==='notes'||id==='ai'){openTool(id,'panel');return;}if(document.body.classList.contains('focus-mode'))document.querySelector('#focus').click();showSection(id);});window.uiLocalize?.();
 };
 // The application remains mounted to preserve reading state, but is hidden and inert.
 for(const name of ['showSection','openTool','setView','openModels','runSearch','openMore','openDialog']){
  const original=window[name];if(typeof original!=='function')continue;window[name]=function(...args){if(!demoAccount.signedIn)return;return original.apply(this,args);};
 }
 const focus=document.querySelector('#focus'),nativeFocus=focus.onclick;focus.onclick=function(event){if(demoAccount.signedIn)return nativeFocus.call(this,event);};
 screen.addEventListener('keydown',event=>{if(!demoAccount.signedIn)event.stopPropagation();});
 document.addEventListener('demo-account-change',sync);document.addEventListener('ui-language-change',localize);
 window.authPreview={sync,state,openStates:()=>switcher.click()};sync();
})();
