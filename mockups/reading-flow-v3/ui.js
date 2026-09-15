/* Review-only local UI. No API calls, account writes or real downloads. */
const q = new URLSearchParams(location.search), app = document.querySelector('#app');
const bookTitle = 'Бхагавад-гита как она есть';
const S = { page: q.get('page') || 'library', variant: q.get('state') || 'default', focus: q.has('focus'), related: q.has('related'), relatedContext:q.has('related'), source: q.has('server'), query: q.get('query') || '', expanded: q.has('expanded'), basic: q.has('basic'), catalogueTab: 'Категории', scale: 100, theme: ['dark','light','soft'].includes(q.get('theme')) ? q.get('theme') : 'dark', visibility: { original: true, translit: true, words: true, translation: true, commentary: true }, bookStatus: q.get('book') || 'ready', sync: 'available', wifi: true, ai: !q.has('noai'), note: '', history: [], readerAnchor: null, sourceSnapshot: null, searchSnapshot: null, started: false, overlay: null, bookmarks: 4, interfaceLanguage: 'ru' };
if (S.page === 'sync')
    S.sync = S.variant;
if (S.page === 'cover')
    S.bookStatus = q.get('book') || (S.variant === 'about' ? 'ready' : S.variant === 'default' ? 'missing' : S.variant);
if (S.page === 'reader' && S.variant === 'offline')
    S.bookStatus = 'missing';
S.bookHasLocal = ['ready', 'update'].includes(S.bookStatus) || q.has('cached');
S.selectedBookmark = 3;

let overlayOpener=null;
S.syncScope=(S.page==='cover' && ['downloading','preparing','paused'].includes(S.bookStatus))||q.has('single')?'book':'library';
if(S.syncScope==='book' && S.page==='cover')S.sync=S.bookStatus;
const scopeBooks=[{id:'bg',title:bookTitle,category:'Основные книги'},{id:'noi',title:'Нектар наставлений',category:'Основные книги'},{id:'sb1',title:'Шримад-Бхагаватам. Песнь 1',category:'Шримад-Бхагаватам'},{id:'ccadi',title:'Шри Чайтанья-чаритамрита. Ади-лила',category:'Шри Чайтанья-чаритамрита'}];
S.scopeIds=q.get('scope')==='partial'?['bg','noi']:scopeBooks.map(x=>x.id);S.scopeDraft=null; S.scopeOpen={author:!q.has('scope-collapsed'),...Object.fromEntries(scopeBooks.map(b=>[b.category,true]))}; S.recentQueries=['Кришна','дхарма','Бхагавад-гита','преданное служение'];
function syncReady(){return S.syncScope==='book'?0:42;}
function syncTotal(){return S.syncScope==='book'?1:100;}
function progressPercent(){return Math.floor(100*syncReady()/syncTotal());}
function progressVisible(){return ['downloading','preparing','paused','wifi','offline'].includes(S.sync);}
function progressRing(large=false){const p=progressPercent(), active=['downloading','preparing'].includes(S.sync);return `<span class="ring ${large?'large-ring':''} ${active?'is-active':'is-waiting'}" style="--progress:${p}%" aria-label="Готово ${syncReady()} из ${syncTotal()} книг"><span>${p}%</span></span>`;}
function setSyncState(state){S.sync=state;if(S.syncScope==='book')S.bookStatus=state;}
function isolateOverlay(on){for(const el of app.children)if(el.id!=='overlay'){el.inert=on;if(on)el.setAttribute('aria-hidden','true');else el.removeAttribute('aria-hidden');}}
function rerenderStable(){const scroll=document.querySelector('#page-scroll')?.scrollTop||0;const el=document.activeElement;const attrs=['id','data-act','data-theme','data-language','data-visibility','data-scope','data-scope-category'];const attr=attrs.find(a=>el?.hasAttribute(a));const selector=attr?`[${attr}="${CSS.escape(el.getAttribute(attr))}"]`:null;render();document.querySelector('#page-scroll').scrollTop=scroll;if(selector)document.querySelector(selector)?.focus({preventScroll:true});}
function missingSample(title){S.missingTitle=title;overlay('sample-missing');}

const svgPaths = { check: 'm5 12 4 4L19 6', cloud: 'M7 18H6a4 4 0 0 1-.5-8 6.5 6.5 0 0 1 12.3-1.8A5 5 0 0 1 18 18h-1M12 11v10m-3-3 3 3 3-3', pause: 'M8 5v14M16 5v14', play: 'm8 5 11 7-11 7Z', refresh: 'M20 7v5h-5M4 17v-5h5M5.5 8a7 7 0 0 1 11.6-3L20 8M4 16l2.9 3A7 7 0 0 0 18.5 16', offline: 'm2 2 20 20M8.5 16.5a5 5 0 0 1 7 0M5 12.55a11 11 0 0 1 5.17-2.39M16.7 11.1a11 11 0 0 1 2.3 1.45M2 8.82a16 16 0 0 1 4.2-2.8M10.7 4.2A16 16 0 0 1 22 8.82M12 20h.01', device: 'M7 2h10a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Zm4 17h2', user: 'M20 21v-2a7 7 0 0 0-14 0v2M17 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0', chat: 'M5 4h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H9l-6 4V6a2 2 0 0 1 2-2Z', exit: 'M9 4H4v16h5m5-14 6 6-6 6M8 12h12', next: 'm9 5 7 7-7 7', back: 'm15 5-7 7 7 7', warning: 'm12 3 10 18H2L12 3Zm0 6v5m0 3h.01', delete: 'M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7M14 10v7' };
function ic(name) { return window.siteIcons[name] || `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="${svgPaths[name] || svgPaths.check}"/></svg>`; }
function b(act, label, icon, cls = 'icon') { return `<button type="button" class="${cls}" data-act="${act}" data-icon="${icon}" aria-label="${label}" title="${label}">${ic(icon)}</button>`; }
function btn(act, label, cls = 'primary', icon = '') { return `<button type="button" class="${cls}" data-act="${act}">${icon ? ic(icon) : ''}${label}</button>`; }
function esc(s) { return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
function brand() { return `<header class="brandbar"><span class="brand">VEDARAMA</span>${S.started && S.page === 'library' ? btn('resume', 'К книге', 'small-link', 'nav-book') : ''}</header>`; }
function head(title, back = true) { return `<header class="page-head">${back ? b('back', 'Назад', 'return') : ''}<h1>${title}</h1></header>`; }
function bookHead() { return S.focus ? `<header class="page-head book-head focus-head">${btn('exit-focus', 'Выйти из режима чтения', 'exit-focus', 'exit')}${b('bookmark', 'Добавить закладку', 'bookmark-nav')}${b('text-settings', 'Настройки текста', 'text-settings-icon')}</header>` : `<header class="page-head book-head">${b('library', 'К каталогу', 'return')}<div class="head-copy"><span class="eyebrow">Библиотека</span><span class="book-title">${S.related ? 'Bhagavad Gita' : bookTitle}</span></div>${b('toc', 'Оглавление', 'list')}${b('book-search', 'Поиск в книге', 'zoom')}${b('menu', 'Опции книги', 'more')}</header>`; }
function dock() { const active = { 'search-history':'search', 'search-advanced':'search', 'search-scope':'search', reader: 'library', cover: 'library', 'book-search': 'library', toc: 'library', related: 'library', 'text-settings': 'library', profile: 'settings' }[S.page] || S.page; const items = [['library', 'Библиотека', 'nav-book'], ['search', 'Поиск', 'zoom'], ...(S.ai ? [['ai', 'AI-чат', 'chat']] : []), ['bookmarks', 'Закладки', 'bookmark-nav'], ['sync', 'Синхронизация', 'cloud'], ['settings', 'Настройки', 'settings']]; return `<nav class="dock" style="--items:${items.length}" aria-label="Разделы приложения">${items.map(([act, label, icon]) => `<button data-act="${act}" data-icon="${icon}" class="${active === act ? 'active' : ''}" aria-label="${label}${progressVisible() && act === 'sync' ? ', ' + progressPercent() + ' процентов, ' + S.sync : ''}" ${active === act ? 'aria-current="page"' : ''}>${progressVisible() && act === 'sync' ? progressRing() : ic(icon)}</button>`).join('')}</nav>`; }
function layout(top, body, { bars = '', bodyClass = '', withDock = true, footer = '' } = {}) { app.innerHTML = `<div class="fixed-stack">${top}${bars}</div><section class="scroll ${bodyClass} ${withDock ? 'with-dock' : ''}" id="page-scroll">${body}</section>${footer}${withDock ? dock() : ''}<div id="overlay"></div>`; }
function hint(text, type = '') { return `<div class="message ${type}" role="status">${text}</div>`; }
function empty(title, text, icon = 'zoom', action = '', label = '') { return `<div class="empty"><div class="status-icon">${ic(icon)}</div><h2>${title}</h2><p>${text}</p>${action ? btn(action, label, 'primary full') : ''}</div>`; }
function skeleton(label) { return `<div class="page-content"><p class="small muted" role="status">${label}</p>${[1, 2, 3].map(() => '<div class="skeleton-block" aria-hidden="true"><div class="skeleton title"></div><div class="skeleton"></div><div class="skeleton"></div><div class="skeleton short"></div></div>').join('')}</div>`; }
function row(name, depth = 0, act = 'expand', open = false, leaf = false, selected = false) { return `<div class="tree-row depth${depth} ${selected ? 'active' : ''}">${leaf ? (act==='cover' ? `<span class="tree-book">${ic('nav-book')}</span>` : '<span class="tree-dot">•</span>') : `<button class="tree-toggle" data-act="${act}" aria-label="${open ? 'Свернуть' : 'Раскрыть'} ${name}" aria-expanded="${open}">${ic(open ? 'minus' : 'plus')}</button>`}<button class="tree-name" data-act="${act}">${name}</button></div>`; }
function searchInput(value, placeholder = 'Поиск по библиотеке', single = false) { return `<form class="search-input ${single ? 'single' : ''}" id="search-form"><input id="query" type="text" value="${esc(value)}" aria-label="${placeholder}" placeholder="${placeholder}" autocomplete="off"><span class="search-actions">${single ? '' : b('clear-search', 'Стереть запрос', 'cross').replace('<button ', `<button ${value ? '' : 'hidden'} `)}<button type="submit" aria-label="Найти">${ic('zoom')}</button></span></form>`; }
function library() { const items = ['Ачарьи', 'Вайшнавы ИСККОН', 'Современные вайшнавы', 'Ведические мудрецы', 'Шастры', 'Шад-даршан', 'Другие сампрадайи', 'История-Наука-Религия', 'Нейрофизиология', 'Психология', 'Философия']; let tree = row('Шрила Прабхупада', 0, 'expand', S.expanded); if (S.expanded) {
    tree += row('Шримад-Бхагаватам', 1, 'category') + row('Шри Чайтанья-чаритамрита', 1, 'category') + row('Основные книги', 1, 'basic', S.basic);
    if (S.basic)
        tree += row(bookTitle, 2, 'cover', false, true);
    tree += ['Другие книги', 'Книги о Прабхупаде', 'Письма'].map(x => row(x, 1, 'category')).join('') + row('Прабхупада-шикшамрита', 1, 'cover', false, true);
} tree += items.map(x => row(x, 0, 'category')).join(''); if (S.query)
    tree = bookTitle.toLowerCase().includes(S.query.toLowerCase()) ? row(bookTitle, 0, 'cover', false, true) : '<p class="muted small" style="padding:24px 10px">Ничего не найдено. Попробуйте другое название.</p>'; if (S.catalogueTab !== 'Категории' && !S.query)
    tree = ['А', 'Б', 'В', 'Г', 'Д', 'Е', 'Ж', 'З', 'И', 'К', 'Л'].map(x => row(x, 0, 'letter')).join(''); layout(brand() + `<div class="library-head"><h1>Библиотека</h1><button class="language" data-act="language">${ic('catalog-ru')}Русский${ic('arrow-down')}</button></div>`, `<div class="catalogue"><div class="tabs">${['Категории', 'Авторы', 'Названия'].map(x => `<button data-tab="${x}" class="${S.catalogueTab === x ? 'selected' : ''}">${x.toUpperCase()}</button>`).join('')}</div><div class="catalog-search">${searchInput(S.query, 'Поиск по каталогу', true)}${btn('collapse', 'Свернуть', 'collapse', 'collapse-list')}</div><div id="tree">${tree}</div></div>`); }
const bookStates = { missing: ['Не скачано', 'Офлайн-чтение недоступно. Сохраните книгу в приложении, чтобы читать без интернета.', 'Скачать для офлайн-чтения', 'book-download', 'cloud'], queued: ['В очереди на скачивание', 'Офлайн-чтение пока недоступно. Книга будет сохранена после текущих задач.', 'Открыть синхронизацию', 'sync', 'history'], downloading: ['Книга скачивается', 'Пока доступно чтение через интернет. Офлайн-доступ появится после подготовки книги.', 'Приостановить', 'book-pause', 'cloud'], paused: ['Скачивание приостановлено', 'Книга ещё не сохранена. Офлайн-чтение недоступно.', 'Продолжить скачивание', 'book-download', 'history'], preparing: ['Подготовка книги', 'Архив получен. Сохраняем книгу в локальную библиотеку — офлайн-доступ появится после завершения.', '', 'info'], ready: ['Сохранено на устройстве', 'Доступно офлайн · русский перевод', '', '', 'check'], update: ['Доступно обновление', 'Сохранённая версия доступна офлайн. Обновление заменит её только после успешной подготовки.', 'Скачать обновление', 'book-download', 'refresh'], error: ['Не удалось сохранить книгу', 'Офлайн-чтение недоступно. Попробуйте скачать книгу ещё раз.', 'Повторить скачивание', 'book-download', 'warning'] };
function bookStatus() {
    let [title, desc, label, action, icon] = bookStates[S.bookStatus] || bookStates.missing;
    if(S.bookHasLocal && ['downloading','paused','preparing','error'].includes(S.bookStatus)) {
        title = {downloading:'Скачивается обновление',paused:'Обновление приостановлено',preparing:'Подготовка обновления',error:'Не удалось обновить книгу'}[S.bookStatus];
        desc = 'Сохранённая версия доступна офлайн. Заменим её только после успешной подготовки обновления.';
    }
    return `<section class="book-state ${S.bookStatus === 'ready' ? 'ready' : ''}" aria-label="Доступность книги"><div class="state-heading">${ic(icon || 'info')}${title}</div><p>${desc}</p>${['downloading','preparing','paused'].includes(S.bookStatus) ? `<div class="book-progress ${S.bookStatus==='paused'?'paused':''}" role="progressbar" aria-label="${S.bookStatus==='preparing'?'Подготовка книги':S.bookStatus==='paused'?'Скачивание приостановлено':'Скачивание книги, объём не определён'}"><span></span></div><div class="book-progress-caption">${S.bookStatus==='preparing'?'Сохраняем для офлайн-чтения':S.bookStatus==='paused'?'Ожидает продолжения':'Загрузка и подготовка книги'}</div>` : ''}${label ? btn(action, label, S.bookStatus === 'downloading' ? 'secondary' : 'primary',S.bookStatus==='paused'?'play':'') : ''}</section>`;
}
function cover() { layout(brand() + head('Библиотека'), `<article class="cover"><img class="cover-image" src="assets/book-cover.jpg" width="411" height="600" alt="Обложка Бхагавад-гиты как она есть"><h1>${bookTitle}</h1><p class="original-name">Bhagavad-Gita As It Is</p><div class="cover-actions">${btn('read', S.started ? 'Продолжить' : 'Читать')}${btn('book-search', 'Поиск в книге', 'secondary', 'zoom')}</div>${bookStatus()}<p class="description">«Бхагавад-гита как она есть» с комментариями Шрилы А. Ч. Бхактиведанты Свами Прабхупады — бесценный дар человечеству, раскрывающий суть и смысл различных духовных путей к Абсолюту. Являясь своеобразной «энциклопедией йоги», «Бхагавад-гита» приводит людей к сокровенной концепции бхакти — отношений со Всевышним, полных радости и любви.</p><details class="about" open><summary>О книге${ic('arrow-down')}</summary><dl><dt>Автор</dt><dd>Вьясадев</dd><dt>Комментарий</dt><dd>А. Ч. Бхактиведанта Свами Прабхупада</dd><dt>Язык издания</dt><dd>Русский</dd></dl></details></article>`); }
function textBody(preview = false) { if (S.related && !preview)
    return `<h1 data-block="heading">Verse 1</h1><p class="translit" data-block="translit">Dhṛitarāṣṭra uvāca<br>dharma-kṣetre kuru-kṣetre samavetā yuyutsavaḥ<br>māmakāḥ pāṇḍavāścaiva kim akurvata sañjaya || 1 ||</p><p class="caption">Перевод:</p><p class="translation" data-block="translation">Dhritarāshtra said:<br>1. What did my people and the Pandavas do, O Sanjaya, gathered together on the holy field of Kurukshetra, eager for battle?</p><h1 data-block="verse2">Verse 2</h1><p class="translit">Sañjaya uvāca<br>dṛṣṭvā tu pāṇḍavānīkaṁ vyūḍhaṁ duryodhanas tadā<br>ācāryam upasaṅgamya rājā vacanam abravīt || 2 ||</p><p class="caption">Перевод:</p><p class="translation">Sanjaya said:<br>2. O King! Duryodhana, being moved by the sight of the Pāṇḍava army in battle array, approached his teacher Drona and said these words:</p>`; return `${preview ? `<p class="book-preview-title">${bookTitle}</p><p class="section-preview-title">Глава 1 · Обзор армий на поле битвы Курукшетра</p>` : ''}<h1 data-block="heading">Текст 1</h1>${Object.entries(readerData).filter(([key]) => S.visibility[key]).map(([, text]) => text).join('')}`; }
function versebar() { return `<nav class="versebar" aria-label="Навигация по стихам"><button class="icon" disabled aria-label="Предыдущий стих">${ic('back')}</button><button class="current-verse" data-act="toc">Глава 1 · Текст 1${ic('arrow-down')}</button>${b('next-verse', 'Следующий стих', 'next')}<button class="related-button" data-act="related" aria-label="Этот текст в других книгах">${ic('book-cover')}<span class="count">${relatedGroups.reduce((n, [,items])=>n+items.length,0)}</span></button></nav>`; }
function reader() {
    S.started=true;
    const contextual=!!(S.relatedContext || S.searchSnapshot);
    let bars=contextual || S.focus?'':versebar();
    if(S.relatedContext) bars+=`<button class="return-strip" data-act="source-return">${ic('return')}<span class="return-target">К исходному тексту · ${S.sourceSnapshot?.related?'Рамануджа, 1.1':'БГ 1.1'}</span></button>`;
    else if(S.searchSnapshot) bars+=`<button class="return-strip" data-act="search-return">${ic('return')}<span class="return-target">${S.searchSnapshot.page==='book-search'?'К результатам в книге':'К результатам по библиотеке'}<small>«${esc(S.searchSnapshot.query)}»</small></span></button>`;
    if(S.source || !S.bookHasLocal) bars+=`<div class="status-strip">${ic('cloud')}<span>Не скачано — офлайн-чтение недоступно</span></div>`;
    const body=S.variant==='offline'?empty('Эта книга ещё не скачана','Сейчас нет подключения к интернету. Подключитесь, чтобы открыть книгу, или выберите сохранённую книгу в библиотеке.','offline','retry-book','Повторить')+`<div style="padding:0 24px 24px">${btn('library','К библиотеке','secondary full')}</div>`:`<article class="reading-text" style="font-size:${16*S.scale/100}px">${contextual?`<p class="context-book-title">${S.related?'Bhagavad Gita · Рамануджа · English':bookTitle}</p>`:''}${textBody()}</article>`;
    const mode=contextual?`<div class="context-actions">${btn(S.focus?'exit-focus':'enter-focus',S.focus?'Выйти из режима чтения':'Режим чтения','context-mode',S.focus?'exit':'nav-book')}${b('book-search','Поиск в книге','zoom')}${S.focus?'':b('related','Этот текст в других книгах','book-cover')}${b('menu','Опции книги','more')}</div>`:'';
    layout(contextual?'':bookHead(),body,{bars,bodyClass:contextual?'context-reader':'',withDock:!S.focus,footer:S.focus?`<div class="reader-footer">${mode}${versebar()}</div>`:mode});
    restoreAnchor(S.readerAnchor);
}
function themes() { return `<div class="theme-options" aria-label="Цветовая тема">${[['light', 'Светлая', '#fefefe', '#51545a'], ['soft', 'Мягкая', '#d2d6dc', '#555d68'], ['dark', 'Тёмная', '#303236', '#d4d5d7']].map(([id, label, bg, fg]) => `<button class="theme-option ${S.theme === id ? 'selected' : ''}" data-theme="${id}" aria-pressed="${S.theme === id}"><span class="theme-sample" style="background:${bg};color:${fg}"><i></i><i></i><i></i></span>${label}</button>`).join('')}</div>`; }
function scaleControl() { return `<div class="scale">${b('scale-down', 'Уменьшить масштаб', 'minus')}<output>${S.scale}%</output>${b('scale-up', 'Увеличить масштаб', 'plus')}</div>`; }
function settings(textOnly = false) { let content = ''; if (!textOnly)
    content += `<div class="group"><button class="settings-row" data-act="profile"><span class="profile-icon">${ic('user')}</span><span class="row-copy">Профиль<small>Имя, e-mail и безопасность</small></span>${ic('next')}</button></div><div class="group"><span class="group-label">Язык интерфейса</span><div class="segmented">${[['ru', 'Русский'], ['en', 'English']].map(([id, label]) => `<button data-language="${id}" class="${S.interfaceLanguage === id ? 'selected' : ''}">${label}</button>`).join('')}</div></div>`; if (S.variant === 'error')
    content += hint('Не удалось сохранить настройки. Выбранные значения не сброшены — попробуйте ещё раз. ' + btn('retry-settings', 'Повторить', 'text-button'), 'error'); if (S.variant === 'saved')
    content += hint('Настройки сохранены на устройстве.', 'success'); content += `<div class="group"><span class="group-label">Цветовая тема</span>${themes()}</div><div class="group"><span class="group-label">Масштаб текста</span>${scaleControl()}</div>`; if (textOnly)
    content += `<div class="group"><span class="group-label">Показывать в книге</span><div class="visibility">${[['original', 'Оригинал'], ['translit', 'Транслитерация'], ['words', 'Пословный перевод'], ['translation', 'Перевод'], ['commentary', 'Комментарий']].map(([key, label]) => `<label class="check-row"><input type="checkbox" data-visibility="${key}" ${S.visibility[key] ? 'checked' : ''}>${label}</label>`).join('')}</div></div>`; content += `<div class="group"><span class="group-label">Пример текста</span><div class="preview"><article class="reading-text" style="font-size:${16 * S.scale / 100}px">${textBody(true)}</article></div></div>`; if (!textOnly)
    content += `<div class="group">${btn('privacy', 'Политика конфиденциальности', 'settings-row')}${btn('terms', 'Пользовательское соглашение', 'settings-row')}<p class="small muted" style="margin-top:16px">Vedarama · мобильное приложение</p></div>`; layout(textOnly ? head('Настройки текста') : brand() + head('Настройки', false), `<div class="settings-content">${content}</div>`, { withDock: !textOnly || !S.focus }); }
function searchResults(inBook) { if(S.query.toLowerCase().includes('дхритараштра'))return `<div class="search-content"><p class="small muted result-summary">Найдено: 1 фрагмент · ${inBook?1:S.scopeIds.length} ${inBook?'книга в области':'книги в области'}</p><section class="search-result"><h2><button class="result-title" data-act="search-result">${bookTitle}</button></h2><p class="breadcrumbs">Шрила Прабхупада • Основные книги • Глава 1 • Текст 1</p><p class="snippet"><mark>Дхритараштра</mark> спросил: О Санджая, что стали делать мои сыновья и сыновья Панду, горя желанием сразиться, собравшись в месте паломничества, на поле Курукшетра?</p></section></div>`; const common = inBook ? `<section class="search-result"><h2><button class="result-title" data-act="search-result">${bookTitle}</button></h2><p class="breadcrumbs">Шрила Прабхупада • Основные книги • ${bookTitle} • Глава 11 • Текст 18</p><p class="snippet">…ты — высшая и неизменная цель, хранитель вечной религии, <mark>дхармы</mark>. Ты — неисчерпаемый; ты — хранитель вечного закона. Таково моё мнение. Ты есть изначальное Существо…</p></section><section class="search-result"><h2><button class="result-title" data-act="search-result">${bookTitle}</button></h2><p class="breadcrumbs">Шрила Прабхупада • Основные книги • Глава 3 • Текст 35</p><p class="snippet">…лучше исполнять свои обязанности, свою <mark>дхарму</mark>, чем безупречно исполнять чужие. Свой путь помогает сохранять верность долгу…</p></section>` : `<section class="priority"><h2>Тамал Кришна Госвами</h2><p>Книги: <strong>4</strong></p><p>На английском: <strong>1</strong></p><p>На русском: <strong>3</strong></p><p>Последние дни Прабхупады. Дневник</p><p>Вриндавана-махимамрита</p><div class="language-links">${btn('search-result', 'Русский', 'text-button')}${btn('search-result', 'English', 'text-button')}</div></section><section class="search-result"><h2><button class="result-title" data-act="search-result">Разумная вера</button></h2><p class="breadcrumbs">Вайшнавы ИСККОН • Ананта Кришна дас • Разумная вера • Приложение 3. Философия в цитатах</p><p class="snippet">…Среди всех аватар <mark>Кришна</mark> занимает особое положение, поскольку Он источник аватар: «Все перечисленные воплощения представляют собой либо полные части, либо части полных частей Господа, однако Господь <mark>Кришна</mark> есть изначальная Личность Бога»…</p></section><section class="search-result"><h2><button class="result-title" data-act="search-result">${bookTitle}</button></h2><p class="breadcrumbs">Основные книги • Глава 1 • Текст 1</p><p class="snippet">…собрались в месте паломничества, на поле Курукшетра…</p></section>`; return `<div class="search-content">${S.variant === 'offline-results' ? hint('Поиск только в скачанных книгах. Для полного поиска подключитесь к интернету.') : ''}${common}</div>`; }
function searchPage(inBook = false) { let top = brand(); if (inBook)
    top += `<div class="search-context">${b('back', 'Вернуться к книге', 'return')}<div><span class="eyebrow">ПОИСК ПО КНИГЕ · 1 КНИГА</span><strong>${bookTitle}</strong></div></div>`; top += `<div class="search-tools">${searchInput(S.query, inBook ? 'Поиск в этой книге' : 'Поиск по библиотеке')}${inBook ? '' : `<div class="search-links">${btn('search-scope', 'Выбрать книги · '+S.scopeIds.length, 'scope-link', 'list')}${btn('search-history', 'История', '', 'history')}</div>`}</div>`; let body = ''; if (S.variant === 'loading')
    body = skeleton('Ищем в ' + (inBook ? 'этой книге…' : 'библиотеке…'));
else if (S.variant === 'error')
    body = empty('Не удалось выполнить поиск', 'Запрос сохранён. Проверьте подключение и попробуйте ещё раз.', 'warning', 'retry-search', 'Повторить');
else if (S.variant === 'empty')
    body = empty('Ничего не найдено', inBook ? 'Попробуйте другое слово или фразу. Поиск выполняется только в этой книге.' : 'Попробуйте другое слово или измените область поиска.', 'zoom', 'clear-search', 'Изменить запрос');
else if (S.variant === 'offline')
    body = empty('Для полного поиска нужен интернет', 'В скачанных книгах можно искать без сети. Результаты будут ограничены локальной библиотекой.', 'offline', 'local-search', 'Искать в скачанных книгах');
else if (['results', 'offline-results'].includes(S.variant))
    body = searchResults(inBook);
else
    body = empty(inBook ? 'Поиск внутри книги' : 'Поиск по библиотеке', inBook ? 'Введите слово или фразу. Поиск будет ограничен этой книгой.' : 'Найдите слово, название книги или автора. Область поиска можно уточнить.', 'zoom'); layout(top, body, { withDock: !inBook || !S.focus }); }
function searchExtra() {
    if(S.page==='search-history'){
        layout(head('История поиска'),`<div class="page-content"><p class="small muted">Недавние запросы</p>${S.recentQueries.length?S.recentQueries.map(x=>`<div class="history-row">${ic('history')}<button class="history-query" data-history="${esc(x)}">${esc(x)}</button><button class="icon" data-act="history-remove" data-query="${esc(x)}" aria-label="Удалить запрос ${esc(x)}">${ic('cross')}</button></div>`).join(''):'<p class="message">История поиска пуста.</p>'}</div>`);
    } else {
        if(!S.scopeDraft)S.scopeDraft=[...S.scopeIds];
        const groups=['Шримад-Бхагаватам','Шри Чайтанья-чаритамрита','Основные книги'];
        const disclosure=(key,title)=>`<button class="tree-toggle" data-act="scope-toggle" data-node="${esc(key)}" aria-expanded="${S.scopeOpen[key]}" aria-label="${S.scopeOpen[key]?'Свернуть':'Раскрыть'} ${esc(title)}">${ic(S.scopeOpen[key]?'minus':'plus')}</button>`;
        const leaf=book=>`<li class="tree-row depth2 scope-tree-row"><label class="scope-check" aria-label="Выбрать ${esc(book.title)}"><input type="checkbox" data-scope="${book.id}" ${S.scopeDraft.includes(book.id)?'checked':''}></label><span class="tree-book">${ic('nav-book')}</span><label class="tree-name" for="scope-${book.id}">${book.title}</label></li>`;
        const tree=`<li><div class="tree-row scope-tree-row"><label class="scope-check" aria-label="Выбрать все книги Шрилы Прабхупады"><input type="checkbox" data-scope="all" ${S.scopeDraft.length===scopeBooks.length?'checked':''}></label>${disclosure('author','Шрила Прабхупада')}<button class="tree-name" data-act="scope-toggle" data-node="author" aria-expanded="${S.scopeOpen.author}">Шрила Прабхупада</button></div><ul ${S.scopeOpen.author?'':'hidden'}>${groups.map(category=>{const books=scopeBooks.filter(x=>x.category===category);return `<li><div class="tree-row depth1 scope-tree-row"><label class="scope-check" aria-label="Выбрать раздел ${category}"><input type="checkbox" data-scope-category="${category}" ${books.every(b=>S.scopeDraft.includes(b.id))?'checked':''}></label>${disclosure(category,category)}<button class="tree-name" data-act="scope-toggle" data-node="${category}" aria-expanded="${S.scopeOpen[category]}">${category}</button></div><ul ${S.scopeOpen[category]?'':'hidden'}>${books.map(leaf).join('')}</ul></li>`;}).join('')}</ul></li>`;
        layout(head('Область поиска')+`<div class="scope-summary" role="status">Выбрано книг: <strong>${S.scopeDraft.length}</strong> из ${scopeBooks.length}</div>`,`<div class="catalogue"><ul class="scope-tree">${tree}</ul><div class="button-stack"><button class="primary full" data-act="apply-search" ${S.scopeDraft.length?'':'disabled'}>Применить · ${S.scopeDraft.length} ${S.scopeDraft.length===1?'книга':'книги'}</button><p class="small muted">Назад — вернуться без изменения области.</p></div></div>`);
        for(const input of document.querySelectorAll('[data-scope]:not([data-scope=all])'))input.id='scope-'+input.dataset.scope;
        for(const input of document.querySelectorAll('[data-scope-category]')){const ids=scopeBooks.filter(x=>x.category===input.dataset.scopeCategory).map(x=>x.id),n=ids.filter(id=>S.scopeDraft.includes(id)).length;input.indeterminate=n>0&&n<ids.length;}
        const all=document.querySelector('[data-scope=all]');all.indeterminate=S.scopeDraft.length>0&&S.scopeDraft.length<scopeBooks.length;
    }
}

function toc() { let tree = row('Введение', 0, 'toc-expand'); tree += row('Глава 1', 0, 'toc-expand', true); tree += row('Содержание', 1, 'toc-verse', false, true); for (let i = 1; i <= 18; i++)
    tree += row('Текст ' + i, 1, 'toc-verse', false, true, i === 1); for (let i = 2; i <= 18; i++)
    tree += row('Глава ' + i, 0, 'toc-expand'); layout(head('Оглавление'), `<div class="toc-body"><div style="padding:8px 16px 20px"><p class="eyebrow">${bookTitle}</p></div>${tree}</div>`, { withDock: !S.focus }); }
const relatedGroups = [['English', [['Bhagavad Gita with Commentaries of Ramanuja', 'Глава 1 · Verse 1'], ['Bhagavad-Gita of Ramanuja Acarya', 'Глава 1 · Verse 1'], ['Bhagavad-gita commentary by Bhaktivinoda Thakura', 'Глава 1 · Text 1'], ['Bhagavad-gītā with Bhāṣya and Tātparya-nirṇaya of Madhvācārya', 'Глава 1 · Verse 1'], ['Bhagavad-gītā with the annotation Gūḍhārtha-dīpikā by Madhusudana Sarasvati', 'Глава 1 · Verse 1'], ['Gītā Bhūṣaṇa', 'Глава 1 · Verse 1']]], ['Санскрит', [['Bhagavad-gītā. Four commentaries', 'Глава 1 · श्लोक १'], ['Gītā-bhūṣaṇa', 'Глава 1 · श्लोक १']]], ['Русский', [[bookTitle, 'Глава 1 · Текст 1'], ['Бхагавад-гита. Комментарии', 'Глава 1 · Текст 1; вступление']]]];
function related() { const groups = S.variant === 'empty' ? empty('Другие места не найдены', 'Для этого стиха пока нет связанных мест в доступных книгах.', 'book', 'back', 'Вернуться к книге') : S.variant === 'loading' ? skeleton('Ищем связанные места…') : `<div class="page-content"><p class="related-title">Бхагавад-гита · 1.1</p><p class="small muted">Этот стих в других изданиях и комментариях</p>${relatedGroups.map(([lang, items]) => `<section class="related-group"><h2>${lang}</h2>${items.map(([title, places]) => `<button class="related-item" data-act="related-open"><span>${title}</span><span class="places">${places}</span></button>`).join('')}</section>`).join('')}</div>`; layout(head('Этот текст в других книгах'), groups, { withDock: !S.focus }); }
function syncPage() { const v = S.sync; let body = ''; if (v === 'checking' || v === 'preparing') {
    body = `<h2 class="sync-title">${v === 'checking' ? 'Проверка обновлений' : S.syncScope==='book'?'Подготовка книги':'Подготовка библиотеки'}</h2><div class="waiting-dots" style="justify-content:center;margin:28px 0"><i></i><i></i><i></i></div><p class="sync-note">${v === 'checking' ? 'Сверяем локальную библиотеку с сервером.' : S.syncScope==='book'?'Книга получена. Сохраняем её для офлайн-чтения.':'Книги получены. Проверяем и сохраняем данные для офлайн-чтения.'}</p><div class="stage-list"><p>${ic(v==='preparing'?'check':'history')}Справочники${v==='preparing'?' обновлены':''}</p><p>${ic('history')}${v==='preparing'?'Книги · сохраняем':'Книги'}</p><p>${ic('history')}Словари · ожидают</p></div><p class="sync-note">Сохранёнными книгами уже можно пользоваться.</p>`;
}
else if (['downloading', 'paused', 'offline', 'wifi'].includes(v)) {
    const title = { downloading: 'Скачивание книг', paused: 'Скачивание приостановлено', offline: 'Нет подключения', wifi: 'Ожидание Wi-Fi' }[v];
    body = `<h2 class="sync-title">${title}</h2>${progressRing(true)}<p class="sync-count">Готово ${syncReady()} из ${syncTotal()} ${S.syncScope==='book'?'книги':'книг'}</p><p class="sync-stage">${S.syncScope==='book' ? 'Сохранение выбранной книги' : 'Этап 2 из 3 · Книги'}</p>${v === 'downloading' ? `<div class="info-box">${ic('info')}<span>Можно продолжать читать. Нескачанные книги открываются через интернет автоматически.</span></div>${btn('sync-pause', 'Приостановить', 'secondary full')}` : `<div class="info-box">${ic(v === 'offline' ? 'offline' : 'info')}<span>${v === 'paused' ? 'Готовые книги сохранены. Продолжите скачивание, когда будет удобно.' : v === 'offline' ? 'Скачивание продолжится после восстановления сети. Офлайн доступны уже сохранённые книги.' : 'Включено скачивание только по Wi-Fi. Очередь продолжится после подключения к Wi-Fi.'}</span></div>${v === 'paused' ? btn('sync-resume', 'Продолжить скачивание', 'primary full') : v === 'wifi' ? btn('sync-mobile', 'Скачать через мобильную сеть', 'secondary full') : btn('sync-retry', 'Проверить подключение', 'secondary full')}`}<div style="margin-top:12px">${btn('sync-cancel', 'Отменить оставшуюся загрузку', 'text-button')}</div>`;
}
else if (v === 'complete') {
    body = `<div class="sync-check">${ic('check')}</div><h2 class="sync-title">Библиотека обновлена</h2><p class="sync-count">100 из 100 книг сохранено</p><p class="sync-stage">Доступно офлайн</p><div class="stage-list"><p>${ic('check')}Справочники обновлены</p><p>${ic('check')}Книги сохранены</p><p>${ic('check')}Словари готовы</p></div>${btn('sync-check', 'Проверить обновления', 'secondary full')}`;
}
else if (v === 'error' || v === 'storage') {
    body = `<div class="status-icon" style="margin:12px 0 24px;color:var(--gold)">${ic('warning')}</div><h2 class="lead-title">${v === 'storage' ? 'Недостаточно места' : 'Не удалось завершить скачивание'}</h2><p class="sync-note">${v === 'storage' ? 'Освободите место на устройстве и повторите. Уже сохранённые книги останутся доступны.' : 'Готовые книги сохранены. Повторим только незавершённые задачи.'}</p><div class="stats-row"><span>Готово книг</span><span>${syncReady()} из ${syncTotal()}</span></div><div class="button-stack">${btn('sync-resume', 'Повторить', 'primary full')}${btn('library', 'К библиотеке', 'secondary full')}</div>`;
}
else {
    body = `<h2 class="lead-title">${v === 'initial' ? 'Библиотека без интернета' : 'Доступно обновление'}</h2><p class="sync-note">${v === 'initial' ? 'Скачайте книги на устройство. Пока они не сохранены, для чтения нужен интернет.' : 'Сохранённые книги доступны офлайн. Новые версии заменят их после успешной подготовки.'}</p><div class="stats-row"><span>Книг для скачивания</span><span>100</span></div><div class="stats-row"><span>Справочники</span><span>Есть обновление</span></div><div class="button-stack">${btn('sync-start', v === 'initial' ? 'Скачать библиотеку' : 'Скачать обновление', 'primary full')}</div>`;
} body += `<div class="divider"></div><button class="switch-row full" role="switch" aria-checked="${S.wifi}" data-act="wifi-toggle"><span>Скачивать только по Wi-Fi</span><span class="switch"></span></button>`; layout(brand() + head('Синхронизация', false), `<div class="page-content sync-page">${body}</div>`); }
const bookmarkData = [['Шримад-Бхагаватам. Песнь 1', 'RU · Текст 20', 'Новая мысль для следующего чтения'], ['Брахман и Вайшнав', 'RU · О миссии', 'Махараджа Юдхиштхира нахуше Нахуше'], ['Шримад-Бхагаватам. Песнь 1', 'RU · Текст 19', 'Очень сладко'], [bookTitle, 'RU · Глава 1 · Текст 1', 'Интересный диалог между преданными. Вернуться к пословному переводу.']];
function bookmarks() { let body = ''; if (S.variant === 'empty' || S.bookmarks === 0)
    body = empty('Пока нет закладок', 'Во время чтения нажмите значок закладки, чтобы сохранить место и добавить заметку.', 'bookmark-nav', 'library', 'Открыть библиотеку');
else if (S.variant === 'loading')
    body = skeleton('Загружаем закладки…');
else if (S.variant === 'error')
    body = empty('Не удалось загрузить закладки', 'Проверьте подключение и повторите. Сохранённые на устройстве закладки не удалены.', 'warning', 'bookmarks-retry', 'Повторить');
else
    body = `<div class="bookmark-list">${S.variant === 'offline' ? hint('Без сети показаны сохранённые закладки. Изменения будут отправлены после подключения.') : ''}${bookmarkData.slice(0, S.bookmarks).map(([title, place, note], i) => `<article class="bookmark-card"><span class="bookmark-symbol">${ic('bookmark-nav')}</span><div class="bookmark-copy"><span class="eyebrow">ЗАКЛАДКА</span><button class="open-bookmark" data-act="open-bookmark"><h2>${title}</h2></button><p class="location">${place}</p><p class="note">${esc(i === 3 && S.note ? S.note : note)}</p></div>${b('bookmark-actions', 'Действия с закладкой', 'more')}</article>`).join('')}</div>`; layout(brand() + head(`Закладки${['empty','loading','error'].includes(S.variant) || !S.bookmarks ? '' : ` <span class="count">${S.bookmarks}</span>`}`, false), body); }
function profile() { layout(head('Профиль'), `<div class="page-content"><span class="profile-icon" style="margin-bottom:20px">${ic('user')}</span><h2 class="lead-title">Профиль читателя</h2><p class="small muted">Личные данные и безопасность</p>${btn('profile-edit', 'Изменить имя', 'settings-row')}${btn('email', 'Изменить e-mail', 'settings-row')}${btn('password', 'Изменить пароль', 'settings-row')}<div class="divider"></div>${btn('privacy', 'Политика конфиденциальности', 'settings-row')}${btn('terms', 'Пользовательское соглашение', 'settings-row')}${btn('account-delete', 'Удалить аккаунт', 'text-button')}</div>`); }
function captureAnchor() { const sc = document.querySelector('#page-scroll'); if (S.page !== 'reader' || !sc)
    return S.readerAnchor; const top = sc.getBoundingClientRect().top; const block = [...sc.querySelectorAll('[data-block]')].find(x => x.getBoundingClientRect().bottom > top + 1); return block ? { id: block.dataset.block, offset: block.getBoundingClientRect().top - top } : null; }
function restoreAnchor(a) { if (S.page !== 'reader' || !a)
    return; const sc = document.querySelector('#page-scroll'); let node = sc.querySelector(`[data-block="${a.id}"]`); if (!node) { const order=['heading','original','translit','words','translation','commentary']; const after=order.slice(order.indexOf(a.id)+1); node=after.map(id=>sc.querySelector(`[data-block="${id}"]`)).find(Boolean) || [...sc.querySelectorAll('[data-block]')].at(-1); if(!node)return; a={...a,offset:0}; } const target = sc.scrollTop + node.getBoundingClientRect().top - sc.getBoundingClientRect().top - a.offset; const deficit = target - sc.scrollHeight + sc.clientHeight; if (deficit > 0) {
    const article = sc.querySelector('article');
    article.style.paddingBottom = parseFloat(getComputedStyle(article).paddingBottom) + deficit + 2 + 'px';
} sc.scrollTop = target; }
function snapshot() { return { page: S.page, variant: S.variant, focus: S.focus, related: S.related, relatedContext:S.relatedContext, query: S.query, scopeIds:[...S.scopeIds], searchSnapshot:S.searchSnapshot, sourceSnapshot:S.sourceSnapshot, scroll: document.querySelector('#page-scroll')?.scrollTop || 0, anchor: captureAnchor() }; }
function restore(s) { Object.assign(S, { page: s.page, variant: s.variant, focus: s.focus, related: s.related, relatedContext:!!s.relatedContext, query: s.query, scopeIds:s.scopeIds?[...s.scopeIds]:S.scopeIds, searchSnapshot:s.searchSnapshot || null, sourceSnapshot:s.sourceSnapshot || null, readerAnchor: s.anchor }); render(); if (s.page !== 'reader')
    { document.querySelector('#page-scroll').scrollTop = s.scroll; if(s.resultIndex!==undefined)document.querySelectorAll('.result-title')[s.resultIndex]?.focus({preventScroll:true}); } }
function go(page, variant = 'default') { S.history.push(snapshot()); if (S.page === 'reader')
    S.readerAnchor = captureAnchor(); S.page = page; S.variant = variant; S.overlay = null; render(); }
function back() { if(S.page==='search-scope')S.scopeDraft=null; if (S.history.length)
    restore(S.history.pop());
else {
    S.page = ['text-settings', 'book-search', 'toc', 'related'].includes(S.page) ? 'reader' : 'library';
    S.variant = 'default';
    render();
} }
function render() { if (S.page === 'library')
    library();
else if (S.page === 'cover')
    cover();
else if (S.page === 'reader')
    reader();
else if (S.page === 'text-settings')
    settings(true);
else if (S.page === 'settings')
    settings();
else if (S.page === 'search' || S.page === 'book-search')
    searchPage(S.page === 'book-search');
else if (S.page.startsWith('search-'))
    searchExtra();
else if (S.page === 'toc')
    toc();
else if (S.page === 'related')
    related();
else if (S.page === 'sync')
    syncPage();
else if (S.page === 'bookmarks')
    bookmarks();
else if (S.page === 'profile')
    profile();
else if(S.page.startsWith('ai') && window.aiReview)
    window.aiReview.render();
else
    layout(head('Vedarama'), empty('Раздел в согласованных макетах', 'Эта итерация посвящена библиотеке, поиску, закладкам, настройкам и синхронизации.', 'info', 'back', 'Назад')); if (S.overlay)
    overlay(S.overlay);
    document.querySelectorAll('.bookmark-card').forEach((el,i)=>{el.dataset.index=i;el.querySelector('.note').textContent=bookmarkData[i][2];});
    if(S.page==='search' && ['results','offline-results'].includes(S.variant)){
        const card=document.querySelector('.priority');
        if(card)card.innerHTML=`<h2>Тамал Кришна Госвами</h2><p>Книги: <strong>4</strong></p><p>На английском: <strong>1</strong> · На русском: <strong>3</strong></p><div class="priority-book"><p>Последние дни Прабхупады. Дневник</p><span class="book-languages">Русский · English</span></div><div class="priority-book"><p>Вриндавана-махимамрита</p><span class="book-languages">Русский</span></div>${btn('author-books','Смотреть весь список','text-button')}`;
    }
}
function sheet(title, content) {
    const el = document.querySelector('#overlay');
    el.innerHTML = `<button class="backdrop" data-act="close" aria-label="Закрыть"></button><section class="sheet" role="dialog" aria-modal="true" aria-label="${title}"><div class="handle"></div><header class="sheet-header"><h2>${title}</h2>${b('close', 'Закрыть', 'cross')}</header>${content}</section>`;
    if(S.page==='bookmarks' && S.overlay?.startsWith('bookmark')){
        const selected=bookmarkData[S.selectedBookmark];
        if(selected){
            if(el.querySelector('.book-label'))el.querySelector('.book-label').textContent=selected[0];
            if(el.querySelector('.location'))el.querySelector('.location').textContent=selected[1];
            el.querySelector('.excerpt')?.remove();
        }
    }
    if(S.related && S.page==='reader' && S.overlay?.startsWith('bookmark')) {
        el.querySelector('.book-label').textContent='Bhagavad Gita · Рамануджа';
        el.querySelector('.location').textContent='Глава 1 · Verse 1 · English';
        if(el.querySelector('.excerpt'))el.querySelector('.excerpt').textContent='What did my people and the Pandavas do, O Sanjaya, gathered together on the holy field of Kurukshetra, eager for battle?';
    }
    isolateOverlay(true);
    el.querySelector('.sheet-header button').focus({ preventScroll: true });
}
function overlay(kind) { if(!S.overlay) overlayOpener=document.activeElement; S.overlay = kind; const el = document.querySelector('#overlay'); if (kind === 'menu') {
    el.innerHTML = `<button class="backdrop" data-act="close" aria-label="Закрыть"></button><div class="menu" role="dialog" aria-modal="true" aria-label="Опции книги">${btn('bookmark', 'Закладка', '', 'bookmark-nav')}${btn('text-settings', 'Настройки текста', '', 'text-settings-icon')}${btn('cover', 'О книге', '', 'nav-book')}${S.page==='reader' && (S.relatedContext||S.searchSnapshot)?btn('toc','Оглавление','','list'):''}<button data-act="enter-focus">${ic('book')}<span>Режим чтения<small>Без навигации приложения</small></span></button></div>`;
    isolateOverlay(true);
    el.querySelector('.menu button').focus({ preventScroll: true });
    return;
} if (kind === 'bookmark-actions') {
    sheet('Действия с закладкой', `${btn('bookmark-edit', 'Изменить заметку', 'settings-row', 'note')}${btn('open-bookmark', 'Перейти к месту', 'settings-row', 'return')}${btn('bookmark-delete', 'Удалить закладку', 'text-button', 'delete')}`);
    return;
} if (kind === 'bookmark-delete') {
    sheet('Удалить закладку?', `<p class="book-label">${bookTitle}</p><p class="location">Глава 1 · Текст 1</p><p class="small muted">Будет удалена только закладка и её заметка. Книга останется на устройстве.</p><div class="buttons">${btn('close', 'Отмена', 'secondary')}${btn('confirm-delete', 'Удалить', 'danger')}</div>`);
    return;
} if (kind === 'sample-missing') { sheet('Переход в прототипе', `<p class="book-label">${esc(S.missingTitle || '')}</p><p class="small muted">Для этого места пока нет текстового макета. Другую книгу вместо выбранной не открываем.</p><div class="button-stack">${btn('close','Вернуться','secondary full')}</div>`); return; } if (kind === 'sync-cancel') {
    sheet('Отменить оставшуюся загрузку?', `<p class="small muted">${S.syncScope==='book' ? 'Уже сохранённая версия, если она есть, останется на устройстве.' : '42 готовые книги останутся на устройстве.'} Незавершённые задачи можно будет скачать при следующей синхронизации.</p><div class="buttons">${btn('close', 'Не отменять', 'secondary')}${btn('confirm-cancel', 'Отменить загрузку', 'danger')}</div>`);
    return;
} if (kind.startsWith('bookmark')) {
    const error = kind === 'bookmark-error', saving = kind === 'bookmark-saving', saved = kind === 'bookmark-saved';
    sheet(saved ? 'Закладка сохранена' : kind === 'bookmark-edit' ? 'Изменить закладку' : 'Добавить закладку', `<p class="book-label">${bookTitle}</p><p class="location">Глава 1 · Текст 1 · Русский</p>${saved ? hint('Вы можете вернуться к этому месту из раздела «Закладки».', 'success') : `<blockquote class="excerpt">Дхритараштра спросил: О Санджая, что стали делать мои сыновья и сыновья Панду…</blockquote><label class="form-label" for="bookmark-note">Заметка</label><textarea id="bookmark-note" class="bookmark-textarea" placeholder="О чём хотите вспомнить в этом месте?" ${saving ? 'disabled' : ''}>${esc(S.note)}</textarea><p class="helper">Необязательно. Заметку можно изменить позже.</p>${error ? hint('Не удалось сохранить закладку. Текст заметки не потерян. Попробуйте ещё раз.', 'error') : ''}`}<button class="primary full" data-act="${saved ? 'close' : 'save-bookmark'}" ${saving ? 'disabled' : ''}>${saved ? 'Готово' : saving ? 'Сохраняем…' : error ? 'Повторить сохранение' : 'Сохранить закладку'}</button>`);
    return;
} sheet('Vedarama', `<p class="small muted">${kind === 'language' ? 'Язык содержимого книги выбирается независимо от языка интерфейса.' : 'Этот сценарий остаётся в ранее согласованном наборе. Здесь данные аккаунта не меняются.'}</p><div class="button-stack">${btn('close', 'Понятно', 'secondary full')}</div>`); }
function close() { S.overlay = null; document.querySelector('#overlay').innerHTML = ''; isolateOverlay(false); overlayOpener?.focus({preventScroll:true}); overlayOpener=null; }
function toast(text) { document.querySelector('.toast')?.remove(); const el = document.createElement('div'); el.className = 'toast'; el.role = 'status'; el.textContent = text; app.append(el); setTimeout(() => el.remove(), 3500); }
function act(a, target) { if(a.startsWith('ai-') && window.aiReview){window.aiReview.act(a,target);return;} switch (a) {
    case 'back':
        back();
        break;
    case 'library':
    case 'search':
    case 'bookmarks':
    case 'settings':
    case 'sync':
    case 'ai':
        S.focus = false;
        go(a, a === 'search' ? 'initial' : 'default');
        break;
    case 'expand':
        S.expanded = !S.expanded;
        render();
        break;
    case 'basic':
        S.basic = !S.basic;
        render();
        break;
    case 'collapse':
        S.expanded = false;
        S.basic = false;
        render();
        break;
    case 'category':
    case 'letter':
        missingSample(target?.textContent || target?.getAttribute('aria-label') || 'Каталог');
        break;
    case 'cover':
        if(S.page==='library'){S.related=false;S.relatedContext=false;S.sourceSnapshot=null;S.searchSnapshot=null;S.pendingSourceSnapshot=null;S.readerAnchor=null;}
        if(S.page==='library' && target?.textContent.trim()!==bookTitle){missingSample(target?.textContent);break;}
        if(S.related){missingSample('Обложка Bhagavad Gita · Рамануджа');break;}
        go('cover', S.bookStatus);
        break;
    case 'read':
        S.relatedContext=false;S.sourceSnapshot=null;S.searchSnapshot=null;S.pendingSourceSnapshot=null;S.readerAnchor=null;
        S.focus=false;go('reader');break;
    case 'resume':
        S.focus = false;
        go('reader');
        break;
    case 'text-settings':
        go('text-settings');
        break;
    case 'book-search':
        if(S.related){missingSample('Поиск в Bhagavad Gita · Рамануджа');break;}
        S.query = '';
        go('book-search', 'initial');
        break;
    case 'toc':
        if(S.related){missingSample('Оглавление Bhagavad Gita · Рамануджа');break;}
        go('toc');
        break;
    case 'toc-expand':
        toast('В макете полностью раскрыта первая глава.');
        break;
    case 'toc-verse':
        if(target?.textContent.trim()!=='Текст 1'){missingSample(bookTitle+' · '+target?.textContent);break;}
        back();
        break;
    case 'next-verse':
        toast('Пример показывает один стих; переходы сохранят текущую навигацию сайта.');
        break;
    case 'enter-focus': {
        const anchor = captureAnchor();
        S.focus = true;
        S.overlay = null;
        S.readerAnchor = anchor;
        render();
        break;
    }
    case 'exit-focus': {
        const anchor = captureAnchor();
        S.focus = false;
        S.overlay = null;
        S.readerAnchor = anchor;
        render();
        break;
    }
    case 'menu':
    case 'bookmark':
    case 'bookmark-actions':
    case 'bookmark-delete':
    case 'language':
        overlay(a);
        break;
    case 'bookmark-edit':
        S.note = S.note || bookmarkData[S.selectedBookmark]?.[2] || '';
        overlay(a);
        break;
    case 'close':
        close();
        break;
    case 'clear-search':
        S.query = '';
        if (S.page === 'library')
            render();
        else {
            S.variant = 'initial';
            render();
            document.querySelector('#query')?.focus();
        }
        break;
    case 'retry-search':
        S.variant = 'results';
        render();
        break;
    case 'local-search':
        S.variant = 'offline-results';
        render();
        break;
    case 'search-history':
    case 'search-scope':
        if(a==='search-scope')S.scopeDraft=[...S.scopeIds];
        go(a);
        break;
    case 'scope-toggle': {
        const key=target?.dataset.node;if(Object.hasOwn(S.scopeOpen,key)){S.scopeOpen[key]=!S.scopeOpen[key];rerenderStable();document.querySelector(`[data-act="scope-toggle"][data-node="${CSS.escape(key)}"]`)?.focus({preventScroll:true});}break;
    }
    case 'apply-search': {
        if(!S.scopeDraft?.length){toast('Выберите хотя бы одну книгу.');break;}
        const ids=[...S.scopeDraft];S.scopeIds=ids;S.scopeDraft=null;
        if(S.history.length && S.history.at(-1).page==='search'){const prior=S.history.pop();restore({...prior,scopeIds:ids});}
        else go('search',S.query?'results':'initial');
        break;
    }
    case 'history-remove':
        S.recentQueries=S.recentQueries.filter(x=>x!==target?.dataset.query);rerenderStable();
        break;
    case 'search-result': {
        const result=target?.closest('.search-result'), path=result?.querySelector('.breadcrumbs')?.textContent||'';
        if(!result || !path.includes('Глава 1 • Текст 1')) { missingSample(result?.querySelector('h2')?.textContent + ' · ' + path); break; }
        const from={...snapshot(),resultIndex:[...document.querySelectorAll('.result-title')].indexOf(target),historyDepth:S.history.length};
        S.history.push(from); S.searchSnapshot=from; S.sourceSnapshot=null;S.pendingSourceSnapshot=null;S.relatedContext=false; S.related=false; S.readerAnchor=null; S.page='reader'; S.variant='default'; render(); break;
    }
    case 'search-return':
        if (S.searchSnapshot) {
            const s = S.searchSnapshot;
            S.history.length=s.historyDepth ?? S.history.length;
            restore(s);
        }
        else
            back();
        break;
    case 'related':
        S.pendingSourceSnapshot = {...snapshot(),historyDepth:S.history.length};
        go('related');
        break;
    case 'related-open':
        if(target && target !== document.querySelector('.related-item')) { missingSample(target.textContent); break; }
        S.related = true;
        S.relatedContext=true;S.sourceSnapshot=S.pendingSourceSnapshot||null;S.pendingSourceSnapshot=null;
        S.readerAnchor = null;
        go('reader');
        break;
    case 'source-return':
        if (S.sourceSnapshot) {
            S.history.length=S.sourceSnapshot.historyDepth ?? S.history.length;
            restore(S.sourceSnapshot);
        }
        else {
            S.related = false;S.relatedContext=false;
            S.readerAnchor = null;
            render();
        }
        break;
    case 'book-download':
        S.syncScope='book';
        setSyncState('downloading');
        render();
        break;
    case 'book-pause':
        setSyncState('paused');
        render();
        break;
    case 'retry-book':
        toast('Для открытия несохранённой книги нужно подключение к интернету.');
        break;
    case 'sync-start':
    case 'sync-resume':
    case 'sync-mobile':
        setSyncState('downloading');
        if (a === 'sync-mobile')
            S.wifi = false;
        render();
        break;
    case 'sync-pause':
        setSyncState('paused');
        render();
        break;
    case 'sync-check':
        S.sync = 'checking';
        render();
        break;
    case 'sync-retry':
        toast('Скачивание продолжится после восстановления подключения.');
        break;
    case 'sync-cancel':
        overlay('sync-cancel');
        break;
    case 'confirm-cancel':
        if(S.syncScope==='book')S.bookStatus=S.bookHasLocal?'update':'missing';
        S.sync = 'available';
        S.overlay = null;
        render();
        break;
    case 'wifi-toggle':
        S.wifi = !S.wifi;
        if(!S.wifi && S.sync==='wifi')setSyncState('downloading');
        rerenderStable();
        break;
    case 'scale-up':
    case 'scale-down': {
        S.scale = Math.min(150, Math.max(60, S.scale + (a === 'scale-up' ? 10 : -10)));
        rerenderStable();
        break;
    }
    case 'retry-settings':
        S.variant = 'saved';
        render();
        break;
    case 'bookmarks-retry':
        S.variant = 'default';
        render();
        break;
    case 'open-bookmark':
        if(!bookmarkData[S.selectedBookmark]?.[3] && bookmarkData[S.selectedBookmark]?.[0]!==bookTitle) { missingSample(bookmarkData[S.selectedBookmark]?.slice(0,2).join(' · ')); break; }
        S.relatedContext=false;S.sourceSnapshot=null;S.searchSnapshot=null;S.pendingSourceSnapshot=null;
        S.related = !!bookmarkData[S.selectedBookmark]?.[3];
        S.readerAnchor = null;
        go('reader');
        break;
    case 'save-bookmark':
        if(S.page==='bookmarks' && bookmarkData[S.selectedBookmark])bookmarkData[S.selectedBookmark][2]=S.note;
        else {bookmarkData.push(S.related ? ['Bhagavad Gita · Рамануджа','EN · Глава 1 · Verse 1',S.note,true] : [bookTitle,'RU · Глава 1 · Текст 1',S.note]);S.bookmarks=bookmarkData.length;}
        overlay('bookmark-saved');
        break;
    case 'confirm-delete':
        bookmarkData.splice(S.selectedBookmark,1);
        S.bookmarks = bookmarkData.length;
        S.overlay = null;
        render();
        (document.querySelectorAll('[data-act=bookmark-actions]')[Math.min(S.selectedBookmark,S.bookmarks-1)] || document.querySelector('.empty button'))?.focus({preventScroll:false});
        overlayOpener=null;
        break;
    case 'author-books':
        missingSample('Все книги Тамала Кришны Госвами');break;
    case 'profile':
        go('profile');
        break;
    default: overlay(a);
} }
document.addEventListener('click', e => { const tab = e.target.closest('[data-tab]'); if (tab) {
    S.catalogueTab = tab.dataset.tab;
    render();
    return;
} const theme = e.target.closest('button[data-theme]'); if (theme) {
    S.theme = theme.dataset.theme;
    document.documentElement.dataset.theme = S.theme;
    setTheme();
    rerenderStable();
    return;
} const lang = e.target.closest('[data-language]'); if (lang) {
    S.interfaceLanguage = lang.dataset.language;
    rerenderStable();
    return;
} const hist = e.target.closest('[data-history]'); if (hist) {
    S.query = hist.dataset.history;
    go('search', 'results');
    return;
} const target = e.target.closest('[data-act]'); if (target){
    const card=target.closest('.bookmark-card');
    if(card){S.selectedBookmark=Number(card.dataset.index);S.note=bookmarkData[S.selectedBookmark]?.[2]||'';}
    act(target.dataset.act, target);
} });
document.addEventListener('input', e => { if (e.target.id === 'bookmark-note')
    S.note = e.target.value; if (e.target.id === 'query')
    { S.query = e.target.value; const clear=document.querySelector('[data-act=clear-search]'); if(clear)clear.hidden=!S.query; } });
document.addEventListener('change', e => {
if(e.target.dataset.scope || e.target.dataset.scopeCategory){
    const input=e.target;if(!S.scopeDraft)S.scopeDraft=[...S.scopeIds];
    const ids=input.dataset.scopeCategory?scopeBooks.filter(b=>b.category===input.dataset.scopeCategory).map(b=>b.id):input.dataset.scope==='all'?scopeBooks.map(b=>b.id):[input.dataset.scope];
    S.scopeDraft=input.checked?[...new Set([...S.scopeDraft,...ids])]:S.scopeDraft.filter(id=>!ids.includes(id));rerenderStable();return;
}
if (e.target.dataset.visibility) {
    S.visibility[e.target.dataset.visibility] = e.target.checked;
    rerenderStable();
} });
document.addEventListener('submit', e => { if (e.target.id !== 'search-form')
    return; e.preventDefault(); S.query = document.querySelector('#query').value.trim(); if (S.page === 'library') {
    render();
    return;
} S.variant = S.query ? (S.query.toLowerCase().includes('нет') ? 'empty' : 'results') : 'initial'; render(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') {
    if (S.overlay)
        close();
    else
        back();
} if (e.key === 'Tab' && S.overlay) {
    const list = [...document.querySelectorAll('#overlay button,#overlay textarea')].filter(x => !x.disabled && x.getClientRects().length && !x.classList.contains('backdrop'));
    const first = list[0], last = list.at(-1);
    if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
    }
    else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
    }
} });
function setTheme() { const r = document.documentElement; const themes = { dark: { bg: '#3a3c40', paper: '#303236', panel: '#27282b', head: '#1f2023', text: '#dddde0', strong: '#efeff0', muted: '#b4b6bb', line: '#515358', gold: '#c99c66' }, light: { bg: '#f1f1f2', paper: '#fefefe', panel: '#ececee', head: '#fefefe', text: '#3a3c40', strong: '#202124', muted: '#60636a', line: '#c8cacf', gold: '#8a612f' }, soft: { bg: '#c5cbd2', paper: '#dce0e4', panel: '#ced4da', head: '#bcc6d0', text: '#303841', strong: '#222b34', muted: '#495461', line: '#a0aab5', gold: '#815c30' } }; Object.entries(themes[S.theme]).forEach(([k, v]) => r.style.setProperty('--' + k, v)); }
window.v3 = { state: S, act, go, render, snapshot, captureAnchor, overlay };
if (S.page === 'search' || S.page === 'book-search')
    S.query = S.query || (['results', 'empty', 'error', 'loading', 'offline-results'].includes(S.variant) ? S.page === 'book-search' ? 'дхарма' : 'Кришна' : '');
if (q.has('note'))
    S.note = 'Вернуться к пословному переводу и обсудить смысл этого стиха на следующей встрече.';
if (q.has('scale'))
    S.scale = Number(q.get('scale'));
if(q.has('from-search')){S.query='Дхритараштра';S.searchSnapshot={page:q.get('from-search')==='book'?'book-search':'search',variant:'results',query:S.query,scopeIds:[...S.scopeIds],scroll:0,focus:S.focus,related:false,anchor:null,resultIndex:0,historyDepth:0};}
if(S.page==='search-advanced')S.page='search-scope';
document.documentElement.dataset.theme=S.theme;
setTheme();
window.aiReview?.init?.();
render();
if (q.has('overlay'))
    overlay(q.get('overlay'));
