// This variant uses SVG files from the native desktop QML application.
(() => {
 let sequence=0;
 function svg(key){let code=desktopIconData[key];if(!code)return '';const prefix='desktop-'+(++sequence)+'-';code=code.replace(/id="([^"]+)"/g,(_,id)=>'id="'+prefix+id+'"').replace(/url\(#([^)]+)\)/g,(_,id)=>'url(#'+prefix+id+')');return code.replace('<svg ','<svg class="desktop-app-icon" data-desktop-icon="'+key+'" aria-hidden="true" focusable="false" ');}
 const map={book:'book',search:'search',spark:'ai',bookmark:'favorites',note:'note',settings:'settings',help:'help',globe:'globe',plus:'plus',close:'close',back:'back',forward:'forward',down:'down'};
 function put(selector,key){const el=document.querySelector(selector);if(el)el.innerHTML=svg(key);}
 function decorate(){
  document.querySelectorAll('i[data-icon]').forEach(el=>{const key=map[el.dataset.icon];if(key)el.innerHTML=svg(key);});
  document.querySelectorAll('.tree i[data-icon=down]').forEach(el=>el.innerHTML=svg('minus'));
  document.querySelectorAll('.tree i[data-icon=right]').forEach(el=>el.innerHTML=svg('plus'));
  // Preserve the current expanded/collapsed state of the two working tree branches.
  for(const selector of ['.tree-root','.chapter.current']){const b=$(selector);b.querySelector('i').innerHTML=svg(b.getAttribute('aria-expanded')==='false'?'plus':'minus');}
  const languages=[['Книги на русском','ru'],['Книги на английском','en'],['Книги на санскрите','sa']];
  for(const [label,key]of languages){const b=$('.rail [aria-label="'+label+'"]');if(b)b.innerHTML=svg(key+(b.classList.contains('active')?'Selected':''));}
  put('#references-button i',$('#references-button').classList.contains('active')?'referenceSelected':'reference');
  const bookmark=$('.rail [data-dialog=bookmarks]');if(bookmark)bookmark.innerHTML=svg(bookmark.classList.contains('active')?'favoritesSelected':'favorites');
  const converter=$('.rail [data-dialog=converter]');if(converter)converter.innerHTML=svg('converter');
  put('.global-actions [data-dialog=settings]','settings');
  put('#focus i','reading');put('#exit-reading i','readingOff');
  for(const [id,key]of [['reading-ai','ai'],['reading-notes','note'],['reading-bookmarks','favorites'],['reading-appearance','textSettings']])put('#'+id,key);
  document.querySelectorAll('[data-dialog=settings] .aa').forEach(el=>el.innerHTML=svg('textSettings'));
  document.querySelectorAll('[data-start-section=references] .new-tab-symbol').forEach(el=>el.innerHTML=svg('reference'));
  document.querySelectorAll('.native-copy').forEach(el=>{if(!el.querySelector('[data-desktop-icon]'))el.insertAdjacentHTML('afterbegin',svg('copy'));});
 }
 const previousDraw=drawIcons;drawIcons=function(root=document){previousDraw(root);decorate();};
 const previousSync=syncNavigation;syncNavigation=function(){previousSync();decorate();};
 for(const selector of ['.tree-root','.chapter.current'])$(selector).addEventListener('click',decorate);
 $('.review-bar>span').innerHTML='<b>Ведарама</b> · Десктоп · Оригинальные иконки приложения';
 descriptions.brief=['Вариант с иконками десктопной Ведарамы','<p>Использованы исходные SVG из текущей локальной десктопной реализации: языковые каталоги, справочники, избранное, AI, поиск, настройки, режим чтения, заметки и навигация.</p><p>Геометрия SVG сохранена. Цвет следует теме, как в компоненте SVGColor десктопного приложения.</p><p>Сохранены согласованные функции, независимые вкладки, изменение ширины дерева и подсказки. Полки, уведомления и переключатель дерева — новые элементы без прямого аналога в найденном наборе; их обозначения сохранены из предыдущего макета.</p><p>Поиск и AI демонстрационные. Локальные настройки этого варианта отделены от предыдущих макетов.</p><p><a href="gallery.html">Галерея экранов</a> · <a href="icon-reference.html">Исходные иконки</a></p>'];
 decorate();
})();
