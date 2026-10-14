// Review candidates apply only when the preview URL explicitly selects a palette.
(() => {
 const palettes={
  gold:{name:'Мягкое золото',paper:'#FCFCF9',panel:'#F1F2EE',surface:'#E8EAE4',stroke:'#CDD1C8',ink:'#2C3335',secondary:'#626B6D',gold:'#C8AC6A',accent:'#75653E',wash:'#F3EDDE',button:'#D8C38C',hover:'#E1D2AB',active:'#C7AC6F',buttonText:'#2C3335'},
  sage:{name:'Шалфей',paper:'#FAFBF8',panel:'#EEF2ED',surface:'#E2E9E1',stroke:'#C9D4C9',ink:'#2B3430',secondary:'#5F6D65',gold:'#B9A46C',accent:'#536A5D',wash:'#E8EFE7',button:'#536A5D',hover:'#455B4F',active:'#3E5146',buttonText:'#FFFFFF'},
  slate:{name:'Светлый графит',paper:'#FBFCFB',panel:'#EFF2F3',surface:'#E4E8EB',stroke:'#CCD3D7',ink:'#2D353C',secondary:'#616D76',gold:'#B9A46C',accent:'#53616B',wash:'#E8EDF0',button:'#53616B',hover:'#45535D',active:'#3B4A55',buttonText:'#FFFFFF'}
 };
 const css=(name,p)=>`html[data-theme=light]${name?`[data-palette=${name}]`:''}{--white:${p.paper};--panel-soft:${p.panel};--surface:${p.surface};--stroke:${p.stroke};--ink:${p.ink};--native-text:${p.ink};--secondary:${p.secondary};--gold:${p.gold};--gold-light:${p.gold};--gold-dark:${p.accent};--accent-wash:${p.wash};--native-catalog:${p.panel};--native-heading:${p.panel};--card-hover:${p.wash};--action-fill:${p.button};--action-hover:${p.hover};--action-active:${p.active};--action-text:${p.buttonText}}
 html[data-theme=light][data-palette=${name}] .gold-button{background:var(--action-fill);color:var(--action-text)}
 html[data-theme=light][data-palette=${name}] .brand img{filter:none}`;
 window.lightPaletteOptions={palettes,css};
 const name=new URLSearchParams(location.search).get('palette');if(!palettes[name]||!document.querySelector('.app-header'))return;
 const style=document.createElement('style');style.textContent=css(name,palettes[name]);document.head.append(style);document.documentElement.dataset.palette=name;
 const link=document.createElement('a');link.href='palette-review.html?v=1.59';link.textContent='Палитра: '+palettes[name].name;link.style.cssText='font:12px PT Sans,sans-serif;color:var(--ink);margin-left:12px';document.querySelector('.preview-controls')?.append(link);
})();
