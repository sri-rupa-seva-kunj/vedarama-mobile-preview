// Preview account states only. No credentials, tokens or account API are used.
(() => {
 const params=new URLSearchParams(location.search),allowed=['full','library','guest'];
 let stored=null;try{stored=JSON.parse(sessionStorage.getItem('vedarama-preview-account'));}catch{}
 let mode=allowed.includes(params.get('account'))?params.get('account'):allowed.includes(stored?.mode)?stored.mode:'full';
 let lastMode=mode==='guest'?(stored?.lastMode==='library'?'library':'full'):mode;
 let connected=params.get('model')==='none'?false:stored?.connected!==false,outcome='success';
 function sync(){document.documentElement.classList.toggle('requires-authentication',mode==='guest');document.documentElement.classList.toggle('no-ai-access',mode!=='full');document.documentElement.classList.toggle('no-connected-model',mode==='full'&&!connected);}
 function save(){try{sessionStorage.setItem('vedarama-preview-account',JSON.stringify({mode,lastMode,connected}));}catch{}}
 function route(){try{const url=new URL(location.href);url.searchParams.set('account',mode);if(connected)url.searchParams.delete('model');else url.searchParams.set('model','none');history.replaceState(null,'',url);}catch{}}
 window.hasAiAccess=()=>mode==='full';
 window.demoAccount={
  get mode(){return mode;},get signedIn(){return mode!=='guest';},get lastMode(){return lastMode;},get modelConnected(){return connected;},
  get loginOutcome(){return outcome;},set loginOutcome(value){outcome=['success','credentials','network'].includes(value)?value:'success';},
  setMode(value){if(!allowed.includes(value))return;if(value!=='guest')lastMode=value;mode=value;sync();save();route();document.dispatchEvent(new Event('demo-account-change'));},
  setModelConnected(value){connected=!!value;sync();save();route();document.dispatchEvent(new Event('demo-model-change'));}
 };sync();
})();
