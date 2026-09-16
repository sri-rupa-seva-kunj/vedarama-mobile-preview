'use strict';
(() => {
const variants=[{"file":"10-stone-reader.png","name":"Камень и бронза","desc":"Тёплые каменные оттенки, графит и приглушённая бронза. Компоновка и формы лилового концепта сохранены.","type":"Геометрический гротеск","shape":"16 px и кнопки-капсулы","layout":"Заметки слева · оглавление снизу · инструменты справа","palette":["#E7E3DA","#393A35","#B49A62"],"number":10},{"file":"07-terracotta-reader.png","name":"Терракота","desc":"Тёплая бумага, терракотовые акценты, выразительная антиква и тонкие линейки.","type":"Книжная антиква","shape":"0 px","layout":"Оглавление сверху · заметка на поле","palette":["#F2E7D5","#B55336","#382B28"],"number":7},{"file":"08-sage-reader.png","name":"Шалфей","desc":"Зелёный фон, мягкая типографика, крупные радиусы и плавающие панели.","type":"Мягкий гуманистический шрифт","shape":"24–32 px","layout":"Плавающее оглавление · округлая страница","palette":["#DCE8D8","#FAFCF5","#244A3D"],"number":8},{"file":"09-midnight-reader.png","name":"Полночь","desc":"Тёмный индиго, циан, компактные инструменты и техническая типографика.","type":"Гротеск + моноширинные метаданные","shape":"2–4 px","layout":"Оглавление справа · заметки снизу","palette":["#101A2E","#1B2942","#5DE4E8"],"number":9}];
for (const slot of ['A','B']) {
 const select=document.getElementById('select-'+slot);
 select.addEventListener('change',()=>{
  const variant=variants[Number(select.value)]; if(!variant)return;
  const img=document.getElementById('image-'+slot);img.src=variant.file;img.alt=variant.name+': '+variant.desc;
  document.getElementById('link-'+slot).href=variant.file;document.getElementById('full-'+slot).href=variant.file;
  document.getElementById('meta-'+slot).textContent=variant.type+' · '+variant.shape;
  document.getElementById('layout-'+slot).textContent=variant.layout;
  const swatches=document.getElementById('swatches-'+slot);swatches.replaceChildren(...variant.palette.map(color=>{const item=document.createElement('i');item.style.background=color;item.title=color;return item;}));
 });
}
const original=document.getElementById('original');
function revealOriginal(){if(location.hash==='#original'||/^#concept-[1-5]$/.test(location.hash))original.open=true;}
window.addEventListener('hashchange',revealOriginal);revealOriginal();
})();
