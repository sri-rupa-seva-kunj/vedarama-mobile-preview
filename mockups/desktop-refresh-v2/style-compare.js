'use strict';
(() => {
const variants=[{"file":"06-cobalt-reader.png","name":"Кобальт","desc":"Строгая бело-синяя сетка, прямые углы и гротеск во всём интерфейсе.","type":"Гротеск","shape":"0–2 px","layout":"Оглавление слева · заметки справа","palette":["#FFFFFF","#EAF0FF","#2456E8"]},{"file":"07-terracotta-reader.png","name":"Терракота","desc":"Тёплая бумага, терракотовые акценты, выразительная антиква и тонкие линейки.","type":"Книжная антиква","shape":"0 px","layout":"Оглавление сверху · заметка на поле","palette":["#F2E7D5","#B55336","#382B28"]},{"file":"08-sage-reader.png","name":"Шалфей","desc":"Зелёный фон, мягкая типографика, крупные радиусы и плавающие панели.","type":"Мягкий гуманистический шрифт","shape":"24–32 px","layout":"Плавающее оглавление · округлая страница","palette":["#DCE8D8","#FAFCF5","#244A3D"]},{"file":"09-midnight-reader.png","name":"Полночь","desc":"Тёмный индиго, циан, компактные инструменты и техническая типографика.","type":"Гротеск + моноширинные метаданные","shape":"2–4 px","layout":"Оглавление справа · заметки снизу","palette":["#101A2E","#1B2942","#5DE4E8"]},{"file":"10-lilac-reader.png","name":"Лиловый модерн","desc":"Лиловый и сливовый с лаймовым акцентом, геометрический шрифт и асимметричная композиция.","type":"Геометрический гротеск","shape":"16 px и кнопки-капсулы","layout":"Заметки слева · оглавление снизу · инструменты справа","palette":["#EEE5FF","#522C70","#D5F17B"]}];
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
