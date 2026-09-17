// A shared notes/chat surface: changing its presentation preserves drafts and history.
let toolMode = 'panel';
const baseShowSection = showSection;
const baseRenderSaved = renderSaved;
const baseRenderNotes = renderNotes;
icons.expand = 'M8 3H3v5 M16 3h5v5 M3 16v5h5 M21 16v5h-5';
icons.more = 'M5 12h.01 M12 12h.01 M19 12h.01';
const notesRail = $('.rail [data-view="notes"]');
notesRail.after($('#references-button'));
$('#references-button').insertAdjacentHTML('afterend', '<button class="rail-item" data-nav="ai" aria-label="AI-помощник"><i data-icon="spark"></i></button>');
$('.rail-item').dataset.nav = 'read';
$('.inspector-tabs').innerHTML = '<h2 id="tool-title">Заметки</h2><button id="tool-mode" class="outline-button"></button><button id="tool-close" class="icon-button" aria-label="Вернуться к книге"><i data-icon="close"></i></button>';
$('#notes-panel .panel-context').insertAdjacentHTML('afterend', '<label class="search-box notes-search"><i data-icon="search"></i><input id="notes-search" placeholder="Найти в заметках" aria-label="Поиск по заметкам"></label>');
$('#ai-panel .panel-context').insertAdjacentHTML('beforeend', '<button class="context-book" aria-label="Открыть книгу"><i data-icon="book"></i></button>');
$('#notes-panel .panel-context').insertAdjacentHTML('beforeend', '<button class="context-book">К книге <i data-icon="forward"></i></button>');
document.querySelectorAll('.context-book').forEach(b => b.onclick = () => showSection('read'));

function syncNavigation() {
  const active = view !== 'read' ? view : section;
  document.querySelectorAll('.rail-item').forEach(b => {
    const key = b.dataset.nav || b.dataset.view || (b.id === 'references-button' ? 'references' : b.dataset.dialog);
    const selected = key === active || (active === 'saved' && key === savedTab);
    b.classList.toggle('active', selected);
    if (selected) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current');
  });
  document.querySelectorAll('[data-mobile]').forEach(b => {
    const target = document.body.classList.contains('mobile-tree') ? 'catalog' : ['saved', 'references', 'converter'].includes(active) ? 'more' : active;
    const selected = b.dataset.mobile === target;
    b.classList.toggle('active', selected);
    if (selected) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current');
  });
}
function updateToolMode() {
  const open = view !== 'read';
  document.body.classList.toggle('tool-page', open && toolMode === 'page');
  document.body.classList.toggle('tool-panel', open && toolMode === 'panel');
  document.body.classList.remove('mobile-inspector');
  $('#tool-title').textContent = view === 'ai' ? 'AI-помощник' : toolMode === 'page' ? 'Мои заметки' : 'Заметки к тексту';
  $('#tool-mode').innerHTML = icon(toolMode === 'page' ? 'panel' : 'expand') + '<span>' + (toolMode === 'page' ? (innerWidth <= 700 ? 'С книгой' : 'Рядом с книгой') : 'На всю страницу') + '</span>';
  $('#tool-mode').setAttribute('aria-label', toolMode === 'page' ? 'Показать в контексте книги' : 'Открыть отдельной страницей');
  drawIcons($('.inspector-tabs'));
  filterNotes();
  syncNavigation();
}
function openTool(next, mode = 'panel') {
  section = mode === 'page' ? next : 'read';
  toolMode = mode;
  document.body.classList.remove('workspace-open', 'mobile-tree', 'reference-detail-open');
  $('#workspace-panel').hidden = true;
  initialSetView(next);
  updateToolMode();
}
setView = function(next) {
  if (next === 'read') { showSection('read'); return; }
  openTool(next, view === next ? toolMode : 'panel');
};
showSection = function(next, resetPanel = true) {
  if (next === 'notes' || next === 'ai') { openTool(next, 'page'); return; }
  document.body.classList.remove('tool-page', 'tool-panel');
  baseShowSection(next, resetPanel);
  if (next === 'converter') renderConverter();
  syncNavigation();
};
function renderConverter() {
  const state = saved.converter || {from:'IAST',to:'Кириллица',text:''};
  const choices = selected => ['IAST','Деванагари','Кириллица'].map(name => `<option ${name===selected?'selected':''}>${name}</option>`).join('');
  $('#workspace-panel').innerHTML = workspaceHeader('ИНСТРУМЕНТЫ','Транслитерация','Преобразование санскритского текста между системами записи.') + `<div class="converter-grid"><section class="converter-card"><label for="converter-from">Исходная запись</label><select id="converter-from">${choices(state.from)}</select><label for="converter-input" class="converter-text-label">Текст для преобразования</label><textarea id="converter-input" aria-label="Исходный текст транслитерации" placeholder="Вставьте текст…" spellcheck="false">${escapeText(state.text)}</textarea><button id="converter-clear" class="outline-button">Очистить текст</button></section><section class="converter-card"><label for="converter-to">Преобразовать в</label><select id="converter-to">${choices(state.to)}</select><label for="converter-result" class="converter-text-label">Результат</label><textarea id="converter-result" readonly placeholder="Здесь появится преобразованный текст"></textarea><span class="converter-status">Предпросмотр интерфейса</span></section></div><p class="workspace-footnote">В макете преобразование пока не подключено. Введённый текст и выбранные системы записи сохраняются на этом устройстве.</p>`;
  wireWorkspace();
  const save = () => { saved.converter = {from:$('#converter-from').value,to:$('#converter-to').value,text:$('#converter-input').value}; persist(); };
  $('#converter-input').oninput = save;
  $('#converter-from').onchange = save;
  $('#converter-to').onchange = save;
  $('#converter-clear').onclick = () => { $('#converter-input').value=''; save(); $('#converter-input').focus(); };
}
renderSaved = function(query = '') { baseRenderSaved(query); syncNavigation(); };
renderNotes = function() {
  baseRenderNotes();
  document.querySelectorAll('.note-card').forEach(card => {
    card.insertAdjacentHTML('beforeend', '<button class="note-source">' + icon('book') + 'Бхагавад-гита · 2.47' + icon('forward') + '</button>');
    card.querySelector('.note-source').onclick = () => { showSection('read'); $('#annotation').scrollIntoView({block:'center'}); };
  });
  drawIcons($('#notes-list'));
  filterNotes();
};
function filterNotes() {
  const q = toolMode === 'page' ? $('#notes-search').value.toLowerCase().trim() : '';
  document.querySelectorAll('.note-card').forEach(card => card.hidden = !card.textContent.toLowerCase().includes(q));
  $('#notes-no-results')?.remove();
  if (q && ![...document.querySelectorAll('.note-card')].some(card => !card.hidden)) $('#notes-list').insertAdjacentHTML('beforeend', '<p id="notes-no-results" class="empty-state">Заметок с таким текстом нет.</p>');
}
$('#notes-search').oninput = filterNotes;
$('#tool-mode').onclick = () => { toolMode = toolMode === 'page' ? 'panel' : 'page'; section = toolMode === 'page' ? view : 'read'; updateToolMode(); };
$('#tool-close').onclick = () => showSection('read');
removeEventListener('resize', updateMobileView);
addEventListener('resize', updateToolMode);

// Navigation controls have one handler; legacy panel listeners are bypassed.
document.addEventListener('click', event => {
  const b = event.target.closest('[data-view], [data-nav]');
  if (!b) return;
  event.preventDefault(); event.stopImmediatePropagation();
  const next = b.dataset.nav || b.dataset.view;
  if (next === 'read') showSection('read');
  else openTool(next, b.closest('.rail') ? 'page' : 'panel');
}, true);

function openCatalogue() {
  showSection('read');
  document.body.classList.remove('tree-hidden', 'focus-mode');
  if (innerWidth <= 700) document.body.classList.add('mobile-tree');
  $('#catalog-search').focus();
  syncNavigation();
}
$('#new-tab').onclick = openCatalogue;
$('#new-tab').title = 'Выбрать книгу в каталоге';
$('#new-tab').setAttribute('aria-label', 'Выбрать книгу в каталоге');
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && !$('#dialog').open && view !== 'read') showSection('read');
});
const oldToggleTree = $('#toggle-tree').onclick;
$('#toggle-tree').onclick = () => { oldToggleTree(); syncNavigation(); };

// All rail tooltips use the same component; native title tooltips are removed.
document.querySelectorAll('.rail-item').forEach(b => {
  b.dataset.tip = b.getAttribute('aria-label');
  b.removeAttribute('title');
});

$('.mobile-nav').innerHTML = [['catalog','folder','Каталог'],['read','book','Читать'],['notes','note','Заметки'],['ai','spark','AI'],['more','more','Ещё']].map(([id,ico,label]) => `<button data-mobile="${id}">${icon(ico)}<span>${label}</span></button>`).join('');
function openMore() {
  simpleDialog('Разделы Ведарамы', '<div class="mobile-menu">' + [['references','book','Справочники','Термины, личности и места'],['shelves','shelf','Мои полки','Подборки книг'],['bookmarks','bookmark','Закладки','Сохранённые места'],['converter','globe','Транслитерация','Системы записи санскрита'],['settings','settings','Вид и тема','Размер текста и оформление']].map(([id,ico,title,caption]) => `<button data-menu="${id}">${icon(ico)}<span><strong>${title}</strong><small>${caption}</small></span>${icon('right')}</button>`).join('') + '</div><div class="menu-links"><button id="mobile-about">О макете</button></div>');
  $('#dialog').dataset.kind = 'menu';
  document.querySelectorAll('[data-menu]').forEach(b => b.onclick = () => { $('#dialog').close(); if (b.dataset.menu === 'references') showSection('references'); else openDialog(b.dataset.menu); });
  $('#mobile-about').onclick = () => { $('#dialog').close(); openDialog('brief'); };
}
document.querySelectorAll('[data-mobile]').forEach(b => b.onclick = () => {
  const next = b.dataset.mobile;
  if (next === 'more') openMore(); else if (next === 'catalog') openCatalogue(); else showSection(next);
});
$('#dialog').addEventListener('close', () => delete $('#dialog').dataset.kind);
$('#dialog').addEventListener('click', e => { if (e.target === $('#dialog')) { const r=e.target.getBoundingClientRect(); if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)e.target.close(); } });

const navOpenDialog = openDialog;
openDialog = function(key) {
  if (key === 'catalog') { openCatalogue(); return; }
  if (key === 'converter') { showSection('converter'); return; }
  navOpenDialog(key);
  if (key === 'settings') {
    $('#dialog').dataset.kind = 'settings';
    document.querySelectorAll('input[type="range"]').forEach(range => {
      const fill = () => range.style.setProperty('--fill', ((range.value-range.min)/(range.max-range.min)*100)+'%');
      range.addEventListener('input', fill); fill();
    });
  }
  syncNavigation();
};
// The viewport height follows the keyboard without a persistent preview server.
function syncViewport() {
  const vv = window.visualViewport;
  const keyboard = innerWidth <= 700 && vv && innerHeight - vv.height > 140;
  document.body.classList.toggle('keyboard-open', !!keyboard);
  document.documentElement.style.setProperty('--phone-height', (vv ? vv.height : innerHeight) + 'px');
}
window.visualViewport?.addEventListener('resize', syncViewport);
syncViewport();
// A downward gesture on the sheet header closes the contextual surface.
let sheetGesture = null;
$('.inspector-tabs').addEventListener('pointerdown', e => {
  if (innerWidth > 700 || toolMode !== 'panel' || e.target.closest('button')) return;
  sheetGesture = {y:e.clientY, id:e.pointerId};
  e.currentTarget.setPointerCapture(e.pointerId);
});
$('.inspector-tabs').addEventListener('pointermove', e => {
  if (!sheetGesture) return;
  $('#inspector').style.transform = 'translateY(' + Math.max(0,e.clientY-sheetGesture.y) + 'px)';
});
function endSheetGesture(e) {
  if (!sheetGesture) return;
  const dismiss = e.type === 'pointerup' && e.clientY-sheetGesture.y > 72;
  sheetGesture = null;
  $('#inspector').style.removeProperty('transform');
  if(dismiss) showSection('read');
}
$('.inspector-tabs').addEventListener('pointerup', endSheetGesture);
$('.inspector-tabs').addEventListener('pointercancel', endSheetGesture);
renderNotes();
drawIcons();
updateToolMode();
if (new URLSearchParams(location.search).get('section') === 'converter') showSection('converter');
descriptions.brief = ['Ведарама · макет 04', '<p>Единые подсказки и подсветка разделов. Справочники находятся после заметок. Кнопка выбора книги открывает каталог.</p><p>Заметки и AI открываются отдельной страницей из навигации или рядом с книгой из панели чтения. Переключение сохраняет текст заметки и диалог.</p><p>На телефоне: компактная шапка, нижняя навигация, меню дополнительных разделов и контекстная панель поверх книги. Светлая и тёмная темы применяются ко всем элементам.</p><p>Это интерактивный макет: AI и серверные сервисы не подключены.</p><div class="chips"><a href="mobile-preview.html?v=4">Мобильный показ ↗</a></div>'];

