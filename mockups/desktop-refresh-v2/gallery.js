'use strict';
(() => {
  const concepts = [
    ['04-classic-v2.png', '04 v2 · Переработанный концепт', 'Классика Ведарамы', 'Книжная типографика и заметки на полях внутри узнаваемой оболочки Ведарамы.'],
    ['06-clear-navigation.png', '06 · Новый концепт', 'Ясная навигация', 'Привычная библиотека, компактные действия и просторная область чтения.'],
    ['07-soft-workspace.png', '07 · Новый концепт', 'Мягкое пространство', 'Тёплая палитра, личные полки и редактор своих цветов и размеров шрифтов.'],
    ['08-graphite-study.png', '08 · Новый концепт', 'Графитовое исследование', 'Полностью тёмный интерфейс с AI-обсуждением текущего стиха и связанными текстами.']
  ];
  const links = [...document.querySelectorAll('[data-concept]')];
  function select(index) {
    const [file, label, title, description] = concepts[index];
    const image = document.getElementById('viewer-image');
    image.src = file;
    image.alt = `${label}. ${description}`;
    document.getElementById('viewer-link').href = file;
    document.getElementById('full-size').href = file;
    document.getElementById('viewer-label').textContent = label;
    document.getElementById('viewer-title').textContent = title;
    document.getElementById('viewer-description').textContent = description;
    links.forEach((link, i) => i === index ? link.setAttribute('aria-current', 'true') : link.removeAttribute('aria-current'));
  }
  links.forEach((link, index) => link.addEventListener('click', event => {event.preventDefault(); select(index);}));
  document.getElementById('viewer').hidden = false;
  document.getElementById('viewer-title').parentElement.setAttribute('aria-live', 'polite');
  select(0);
})();
