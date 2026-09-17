// Native radio controls keep keyboard selection and focus inside the settings dialog.
icons.sun='M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8 M12 2v2 M12 20v2 M2 12h2 M20 12h2 M5 5l1.5 1.5 M17.5 17.5l1.5 1.5 M5 19l1.5-1.5 M17.5 6.5l1.5-1.5';
icons.moon='M20.5 14.2A9 9 0 0 1 9.8 3.5a9 9 0 1 0 10.7 10.7Z';
function syncThemeChoices(){document.querySelectorAll('input[name="interface-theme"]').forEach(input=>{input.checked=input.value===(saved.theme||'light');});}
const themePickerApply=applyTheme;
applyTheme=function(theme){themePickerApply(theme);syncThemeChoices();};
const themePickerDialog=openDialog;
openDialog=function(key){
 themePickerDialog(key);if(key!=='settings')return;
 const current=$('.theme-selected');if(!current)return;
 const options=document.createElement('fieldset');options.className='theme-options';
 options.innerHTML='<legend>Тема интерфейса</legend><div class="theme-choice-grid">'+[['light','sun','Светлая'],['dark','moon','Тёмная']].map(([id,symbol,name])=>`<label class="theme-choice"><input type="radio" name="interface-theme" value="${id}"><span class="theme-choice-card"><span class="theme-mini theme-mini-${id}" aria-hidden="true"><span class="theme-mini-top"><i></i><i></i></span><span class="theme-mini-tree"><i></i><i></i><i></i></span><span class="theme-mini-text"><i></i><i></i><i></i><i></i></span></span><span class="theme-choice-caption">${icon(symbol)}<span>${name}</span><span class="theme-choice-check">${icon('check')}</span></span></span></label>`).join('')+'</div>';
 current.replaceWith(options);syncThemeChoices();drawIcons(options);
 options.querySelectorAll('input').forEach(input=>input.onchange=()=>{if(input.checked)applyTheme(input.value);});
};
document.querySelectorAll('.theme-switch button[data-theme]').forEach(button=>{const dark=button.dataset.theme==='dark';button.innerHTML=icon(dark?'moon':'sun')+'<span>'+(dark?'Тёмная':'Светлая')+'</span>';drawIcons(button);});
