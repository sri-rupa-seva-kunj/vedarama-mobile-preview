/* Review fixtures only. Loaded before ui.js; shared globals are read after init.
 * Stage labels/tool IDs: desktop chat ThinkingAnimation.tsx and ru.ts.
 * No request, credential, storage, timer, or production dependency. */
(() => {
  'use strict';
  let ready = false;
  let M;
  const sampleQuestion = 'Кто такой Шри Чайтанья Махапрабху?';
  const sampleAnswer = 'Шри Чайтанья Махапрабху — великий вайшнавский святой и учитель, распространивший практику совместного воспевания имён Кришны. Его последователи почитают Его как объединённое проявление Радхи и Кришны.';
  // References transcribed from approved 03-conversation; full texts are absent.
  const sources = ['Чайтанья-чаритамрита, Ади-лила 1.5', 'Шримад-Бхагаватам 4.11.12'];
  const stages = { preparing: 'Подготовка контекста', searching: 'Поиск по базе книг', analyzing: 'Анализ результатов', generating: 'Генерация ответа', composing: 'Составление ответа' };
  const tools = [
    ['search_vedic_scriptures', 'Поиск по писаниям'],
    ['get_book_chunks', 'Получение фрагментов книги'],
    ['search_exact', 'Точный поиск']
  ];
  // Catalog examples from providerModelCatalog.ts; capabilities below are fixtures.
  const providers = { OpenAI: ['gpt-5.4', 'gpt-5.4-mini'], DeepSeek: ['deepseek-v4-pro', 'deepseek-v4-flash'], Claude: ['claude-sonnet-4-6', 'claude-opus-4-6'], 'Свой URL': [] };
  const levels = { auto: 'Авто', low: 'Низкий', medium: 'Средний', high: 'Высокий' };
  function init() {
    if (ready) return;
    ready = true;
    M = {
      offline: S.variant === 'offline', noaccess: S.variant === 'noaccess',
      selected: 'deepseek-r1', pendingModel: '', returnState: 'initial',
      active: ['initial', 'default'].includes(S.variant) ? '' : 'chaitanya', draft: '', drafts: {}, query: '', notice: '', menu: '',
      chats: [{ id: 'chaitanya', title: sampleQuestion, question: sampleQuestion, answer: sampleAnswer, cited: true, date: '26.08' }, { id: 'practice', title: 'Как повторять имя Кришны', question: 'Как повторять имя Кришны?', answer: 'Сохранён вопрос. Ответ в этом диалоге ещё не получен.', cited: false, date: '27.08' }],
      models: [{ id: 'deepseek-r1', name: 'DeepSeek R1', detail: 'Системная · 128K контекст', system: true }, { id: 'openai-demo', name: 'OpenAI', detail: 'gpt-5.4', system: false }],
      form: { provider: 'OpenAI', name: 'OpenAI', model: 'gpt-5.4', reasoning: 'medium', url: '', protocol: 'auto', tokens: '4000', context: '400000' },
      pendingId: 'gpt-5.4', pendingReasoning: 'medium', verified: '', saved: false, sequence: 0
    };
    document.addEventListener('input', onInput);
    document.addEventListener('keydown', onKey, true);
  }
  const current = () => M.chats.find(x => x.id === M.active);
  const state = () => S.variant === 'default' ? 'initial' : S.variant;
  const blocked = () => M.offline || M.noaccess;
  const running = () => S.page === 'ai' && ['processing', 'composing'].includes(state());
  const signature = () => JSON.stringify(M.form);
  const capabilities = () => M.form.model === 'gpt-5.4' ? ['auto', 'low', 'medium', 'high'] : ['auto'];
  function button(action, label, { disabled = false, cls = '', attrs = '' } = {}) {
    return `<button type="button" data-act="ai-${action}" class="ai-button ${cls}" ${disabled ? 'disabled' : ''} ${attrs}>${label}</button>`;
  }
  function input(field, label, value, type = 'text') {
    return `<label class="ai-field"><span>${label}</span><input type="${type}" data-ai-field="${field}" value="${esc(value)}" ${type === 'number' ? 'min="1"' : ''} ${field === 'pendingId' ? 'role="combobox" aria-autocomplete="list" aria-expanded="true" aria-controls="ai-id-options"' : ''} autocomplete="off"></label>`;
  }
  function move(next) { S.variant = next; render(); }
  function navigate(page, variant = 'default') { M.notice = ''; go(page, variant); }
  function header(title) { return brand() + head(title).replace('data-act="back"', 'data-act="ai-back"'); }
  function toolbar() {
    const model = M.models.find(x => x.id === M.selected);
    // Original history SVG from desktop chat DesktopChatToolbar.tsx.
    const historyIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true"><path d="M3.5 12a8.5 8.5 0 1 0 2.2-5.7L3.5 8.5" stroke-width="1.5" stroke-linecap="round"/><path d="M3.5 4.5v4h4M12 7v5l3 2" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    return brand() + `<header class="ai-toolbar"><div class="ai-title-row">${button('history', historyIcon, { attrs: 'aria-label="История диалогов"', cls: 'ai-icon' })}<h1>${state() === 'initial' ? 'AI-чат' : esc(current()?.title || 'Новый диалог')}</h1>${button('new', '+', { attrs: 'aria-label="Новый диалог"', cls: 'ai-icon', disabled: M.noaccess })}</div><div class="ai-model-row">${button('pick-model', `${esc(model?.name || 'Выбрать модель')} <span aria-hidden="true">⌄</span>`, { attrs: `aria-haspopup="listbox" aria-expanded="${state() === 'model-picker'}"`, disabled: running() || M.noaccess })}${button('models', 'Модели', { disabled: M.noaccess })}</div></header>`;
  }
  function composer() {
    if (M.noaccess) return '';
    return `<footer class="ai-composer"><div class="ai-compose-row"><label class="ai-compose-label"><span class="ai-sr">Вопрос к AI</span><textarea data-ai-field="draft" rows="2" placeholder="${state() === 'initial' ? 'Задайте вопрос…' : 'Спросите подробнее…'}">${esc(M.draft)}</textarea></label>${running() ? button('stop', '<span aria-hidden="true">■</span>', { attrs: 'aria-label="Остановить генерацию"', cls: 'ai-send' }) : button('send', '<span aria-hidden="true">➤</span>', { disabled: blocked() || !M.draft.trim(), attrs: 'aria-label="Отправить вопрос"', cls: 'ai-send ai-primary' })}</div><p>${M.offline ? 'Без сети отправка недоступна. Черновик сохранён.' : running() ? 'Можно подготовить следующий вопрос' : 'AI может ошибаться. Проверяйте важные сведения.'}</p></footer>`;
  }
  function question() { return `<div class="ai-question">${esc(current()?.question || sampleQuestion)}</div>`; }
  function activity(phase, expanded = false) {
    // The fixture records observed events; it does not predict future stages.
    const observed = phase === 'processing' ? ['preparing', 'searching'] : ['preparing', 'searching', 'analyzing', 'generating', 'composing'];
    const live = ['processing', 'composing'].includes(phase);
    return `<section class="ai-card ai-activity" aria-label="Ход ответа"><div class="ai-card-title"><strong>${live ? phase === 'processing' ? 'Поиск источников…' : 'Составление ответа…' : 'Поиск и анализ завершены'}</strong>${live ? '<span class="ai-pulse" aria-label="Выполняется">●</span>' : ''}</div><ol class="ai-stages">${observed.map((key, i) => `<li><span class="ai-stage-mark" aria-hidden="true">${live && i === observed.length - 1 ? '◌' : '✓'}</span><span>${stages[key]}</span>${live && i === observed.length - 1 ? '<small>Выполняется</small>' : ''}</li>`).join('')}</ol>${expanded || live ? `<div class="ai-tools"><h3>${phase === 'processing' ? 'Текущий инструмент' : 'Использовано инструментов: 3'}</h3>${tools.slice(0, phase === 'processing' ? 1 : 3).map(([id, label], i) => `<div class="ai-tool" data-ai-tool="${id}"><span>${i + 1}</span><div><strong>${label}</strong><small>${phase === 'processing' ? 'Выполняется' : 'Завершено'}</small>${expanded ? `<p>Запрос: ${esc(current()?.question || sampleQuestion)}</p>` : ''}</div></div>`).join('')}</div>` : ''}</section>`;
  }
  function answer(partial = false) {
    const chat = current();
    return `<article class="ai-card ai-answer"><p>${esc(partial ? (chat?.answer || sampleAnswer).split('. ')[0] + '…' : chat?.answer || sampleAnswer)}</p>${!partial && chat?.cited ? `<div class="ai-sources"><h2>Источники · ${sources.length}</h2>${sources.map((s, i) => button('source', `${i + 1}. ${esc(s)}`, { cls: 'ai-source', attrs: `data-ai-index="${i}"` })).join('')}</div>` : ''}</article>`;
  }
  function picker(title, items, selected, action) {
    return `<section class="ai-card ai-picker"><h2>${title}</h2><div role="listbox" ${action === 'choose-id' ? 'id="ai-id-options"' : ''} aria-label="${title}">${items.map(([value, label]) => button(action, `<span>${esc(label)}</span>${selected === value ? '<span aria-hidden="true">✓</span>' : ''}`, { cls: 'ai-option', attrs: `role="option" aria-selected="${selected === value}" data-ai-value="${esc(value)}"` })).join('')}</div></section>`;
  }
  function root() {
    let v = state(), body = '';
    if (v === 'offline') M.offline = true;
    if (v === 'noaccess') M.noaccess = true;
    if (M.noaccess) {
      layout(header('AI-чат'), `<div class="ai-page ai-empty" role="region" aria-labelledby="ai-access-title"><h1 id="ai-access-title">Доступ ограничен</h1><p>Для этого аккаунта не подключён доступ к AI-инструментам.</p>${button('library', 'Открыть Ведараму', { cls: 'ai-primary' })}</div>`, { bodyClass: 'ai-scroll', withDock: false });
      return;
    }
    if (v === 'model-picker') {
      body = picker('Модель для следующего ответа', M.models.map(x => [x.id, `${x.name} · ${x.detail}`]), M.pendingModel || M.selected, 'choose-model') + `<div class="ai-actions">${button('apply-model', 'Применить', { cls: 'ai-primary' })}${button('cancel-model', 'Назад')}</div>`;
    } else if (v === 'initial') {
      body = `<div class="ai-welcome"><h2>Новый диалог</h2><p>Задайте вопрос по книгам Ведарамы</p><div class="ai-suggestions">${['Как пользоваться сервисом Vedarama AI?', sampleQuestion, 'Найди упоминания темы в книгах'].map((s, i) => button('suggest', `${esc(s)} <span aria-hidden="true">›</span>`, { attrs: `data-ai-index="${i}"`, disabled: blocked() })).join('')}</div></div>`;
    } else if (v === 'offline') {
      body = `<section class="ai-empty"><div class="ai-status-icon">${ic('offline')}</div><h2>AI-чат недоступен без интернета</h2><p>Сохранённые диалоги можно читать. Новые вопросы станут доступны после подключения.</p>${button('history', 'Открыть сохранённые диалоги', { cls: 'ai-primary' })}</section><h2 class="ai-section-label">Недавние сохранённые</h2>${M.chats.map(chat => historyRow(chat, false)).join('')}`;
    } else {
      body = question();
      if (v === 'processing' || v === 'composing') body += activity(v) + (v === 'composing' ? answer(true) : '');
      else if (v === 'error') body += answer(true) + `<section class="ai-card ai-error" role="alert"><h2>Не удалось завершить ответ</h2><p>${M.offline ? 'Соединение прервано. Вопрос и часть ответа сохранены.' : 'Ответ прерван. Вопрос и полученный текст сохранены.'}</p><div class="ai-actions">${button('retry', 'Повторить', { disabled: blocked(), cls: 'ai-primary' })}${button('edit-question', 'Вернуть вопрос в поле')}</div></section>`;
      else body += (v === 'activity' ? activity('answer', true) : '') + button('activity', v === 'activity' ? 'Скрыть ход ответа' : 'Поиск и анализ завершены · подробнее', { cls: 'ai-disclosure', attrs: `aria-expanded="${v === 'activity'}"` }) + answer();
    }
    const offline = M.offline ? `<div class="ai-banner" role="status">${ic('offline')}<span>Нет подключения · доступно сохранённое</span>${button('check', 'Проверить')}</div>` : '';
    layout(toolbar(), `<div class="ai-page">${offline}${M.notice ? `<p class="ai-notice" role="status">${esc(M.notice)}</p>` : ''}${body}</div>`, { bodyClass: 'ai-scroll', footer: composer() });
  }
  function historyRow(chat, menus = true) {
    return `<article class="ai-history-row ${chat.id === M.active ? 'is-selected' : ''}" data-ai-chat="${esc(chat.id)}">${button('open-chat', `<strong>${esc(chat.title)}</strong><small>${chat.date}</small>`, { cls: 'ai-history-open', attrs: `data-ai-id="${esc(chat.id)}" ${chat.id === M.active ? 'aria-current="true"' : ''}` })}${menus ? button('chat-menu', '⋯', { cls: 'ai-icon', attrs: `aria-label="Действия: ${esc(chat.title)}" data-ai-id="${esc(chat.id)}" aria-expanded="${M.menu === chat.id}"` }) : ''}${M.menu === chat.id && menus ? `<div class="ai-row-menu">${input('rename', 'Название диалога', chat.title)}${button('rename', 'Сохранить название', { attrs: `data-ai-id="${esc(chat.id)}"`, disabled: blocked() })}${button('delete-chat', 'Удалить диалог', { attrs: `data-ai-id="${esc(chat.id)}"`, disabled: blocked() })}</div>` : ''}</article>`;
  }
  function history() {
    layout(header('Диалоги'), `<div class="ai-page">${M.offline ? '<p class="ai-banner">Без сети · сохранённые на устройстве диалоги</p>' : ''}${button('new', '+ Новый диалог', { cls: 'ai-primary', disabled: M.noaccess })}${input('query', 'Поиск по диалогам', M.query)}<div id="ai-history-results">${historyResults()}</div></div>`, { withDock: false, bodyClass: 'ai-scroll' });
  }
  function historyResults() {
    const list = M.chats.filter(x => x.title.toLocaleLowerCase('ru').includes(M.query.toLocaleLowerCase('ru')));
    return list.length ? list.map(x => historyRow(x)).join('') : '<p class="ai-notice">Диалоги не найдены. Измените запрос.</p>';
  }
  function models() {
    layout(header('Модели AI'), `<div class="ai-page">${button('connect', '+ Подключить модель', { cls: 'ai-primary', disabled: blocked() })}${['Системная', 'Подключённые'].map((label, i) => `<section><h2 class="ai-section-label">${label}</h2>${M.models.filter(x => x.system === !i).map(x => `<article class="ai-model-card"><strong>${esc(x.name)}</strong><p>${esc(x.detail)}</p><span class="ai-tag">${x.system ? 'Системная' : 'Подключена'}${x.id === M.selected ? ' · выбрана' : ''}</span>${button('use-model', 'Выбрать в чате', { attrs: `data-ai-value="${esc(x.id)}"`, disabled: blocked() })}</article>`).join('')}</section>`).join('')}<p class="ai-notice">Выбранная модель применяется к следующему ответу.</p></div>`, { withDock: false, bodyClass: 'ai-scroll' });
  }
  function validForm() {
    return !!(M.form.name.trim() && M.form.model.trim() && Number(M.form.tokens) > 0 && Number(M.form.context) > 0 && (M.form.provider !== 'Свой URL' || /^https:\/\/[^\s]+$/.test(M.form.url)));
  }
  function connect() {
    const f = M.form, v = state();
    let panels = '';
    if (v === 'model-picker') panels = `<section class="ai-card ai-picker">${input('pendingId', 'Идентификатор модели — выберите или введите свой', M.pendingId)}${picker('Примеры идентификаторов', (providers[f.provider] || []).map(x => [x, x]), M.pendingId, 'choose-id')}<div class="ai-actions">${button('apply-id', 'Применить', { cls: 'ai-primary', disabled: !M.pendingId.trim() })}${button('cancel-form-picker', 'Назад')}</div></section>`;
    if (v === 'reasoning-picker') panels = picker('Уровень размышления', capabilities().map(x => [x, levels[x]]), M.pendingReasoning, 'choose-reasoning') + `<div class="ai-actions">${button('apply-reasoning', 'Применить', { cls: 'ai-primary' })}${button('cancel-form-picker', 'Назад')}</div>`;
    layout(header('Подключить модель'), `<div class="ai-page ai-connect"><fieldset><legend>Провайдер</legend><div class="ai-providers">${Object.keys(providers).map(x => button('provider', esc(x), { attrs: `aria-pressed="${f.provider === x}" data-ai-value="${esc(x)}"`, cls: f.provider === x ? 'is-selected' : '' })).join('')}</div></fieldset>${input('name', 'Название подключения', f.name)}${f.provider === 'Свой URL' ? input('url', 'URL API', f.url, 'url') + `<p class="ai-notice">Протокол: автоматически</p>` : ''}<label class="ai-field"><span>API Key</span><input type="text" placeholder="Ключ не требуется в макете" disabled autocomplete="off"></label><div class="ai-field"><span>Идентификатор модели</span>${button('pick-id', `${esc(f.model)} <span aria-hidden="true">⌄</span>`, { attrs: `aria-haspopup="listbox" aria-expanded="${v === 'model-picker'}"` })}<small>Выберите из списка или укажите своё значение.</small></div>${v === 'model-picker' ? panels : ''}<div class="ai-field"><span>Уровень размышления</span>${button('pick-reasoning', `${levels[f.reasoning]} <span aria-hidden="true">⌄</span>`, { attrs: `aria-haspopup="listbox" aria-expanded="${v === 'reasoning-picker'}"` })}<small>Доступные уровни зависят от модели.</small></div>${v === 'reasoning-picker' ? panels : ''}<div class="ai-number-fields">${input('tokens', 'Макс. токенов ответа', f.tokens, 'number')}${input('context', 'Макс. контекст', f.context, 'number')}</div><section class="ai-card ai-test"><h2>Проверка подключения</h2><p>Это демонстрационная форма: проверка и сохранение моделируются локально, без ключей и запросов. Для gpt-5.4 заданы четыре уровня; для произвольного ID — «Авто».</p>${button('test', 'Тест подключения', { disabled: blocked() || !validForm() })}${M.notice ? `<p role="status" class="ai-notice">${esc(M.notice)}</p>` : ''}</section>${button('save', M.saved ? 'Подключение сохранено' : 'Сохранить подключение', { cls: 'ai-primary ai-full', disabled: blocked() || !validForm() || M.verified !== signature() || M.saved })}<p class="ai-notice">Сохранение станет доступно после проверки текущих параметров.</p></div>`, { withDock: false, bodyClass: 'ai-scroll' });
  }
  function updateForm() { M.verified = ''; M.saved = false; M.notice = ''; }
  function rememberDraft() { M.drafts[M.active || 'new'] = M.draft; }
  function openChat(id) { rememberDraft(); M.active = id; M.draft = M.drafts[id] || ''; M.menu = ''; navigate('ai', 'answer'); }
  function send() {
    if (blocked() || running() || !M.draft.trim()) return;
    const questionText = M.draft.trim();
    const isSample = questionText === sampleQuestion;
    const chat = { id: `local-${++M.sequence}`, title: questionText, question: questionText, answer: isSample ? sampleAnswer : 'Для этого вопроса полный ответ не включён в набор макетов. Вопрос сохранён в диалоге.', cited: isSample, date: 'Сейчас' };
    M.drafts[M.active || 'new'] = ''; M.chats.unshift(chat); M.active = chat.id; M.draft = ''; M.drafts[chat.id] = ''; navigate('ai', 'processing');
  }
  function onInput(event) {
    const field = event.target.dataset?.aiField;
    if (!ready || !S.page.startsWith('ai') || !field) return;
    const value = event.target.value;
    if (field === 'draft') { M.draft = value; rememberDraft(); const sendButton = document.querySelector('[data-act="ai-send"]'); if (sendButton) sendButton.disabled = blocked() || !value.trim(); }
    else if (field === 'query') { M.query = value; document.querySelector('#ai-history-results').innerHTML = historyResults(); }
    else if (field === 'pendingId') { M.pendingId = value; document.querySelector('[data-act="ai-apply-id"]').disabled = !value.trim(); }
    else if (field === 'rename') M.rename = value;
    else if (Object.hasOwn(M.form, field)) { M.form[field] = value; updateForm(); const test = document.querySelector('[data-act="ai-test"]'); if (test) test.disabled = blocked() || !validForm(); const save = document.querySelector('[data-act="ai-save"]'); if (save) { save.disabled = true; save.textContent = 'Сохранить подключение'; } document.querySelector('.ai-test [role="status"]')?.remove(); }
  }
  function onKey(event) {
    if (ready && S.page.startsWith('ai') && event.key === 'Escape' && ['model-picker', 'reasoning-picker'].includes(state())) {
      event.preventDefault(); event.stopImmediatePropagation(); act('ai-back'); return;
    }
    if (!ready || !S.page.startsWith('ai') || !event.target.closest?.('.ai-picker')) return;
    const options = [...event.target.closest('.ai-picker').querySelectorAll('[role="option"]')];
    if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key) && event.target.getAttribute('role') === 'option') {
      event.preventDefault(); const index = options.indexOf(event.target);
      options[event.key === 'Home' ? 0 : event.key === 'End' ? options.length - 1 : (index + (event.key === 'ArrowDown' ? 1 : -1) + options.length) % options.length]?.focus();
    }
  }
  function act(a, target) {
    if (!ready) init();
    const value = target?.dataset.aiValue, id = target?.dataset.aiId;
    if (target?.disabled) return;
    if (blocked() && ['ai-send', 'ai-retry', 'ai-finish', 'ai-test', 'ai-save', 'ai-delete-chat', 'ai-rename'].includes(a)) return;
    switch (a) {
      case 'ai-back':
        if (S.page === 'ai-connect' && ['model-picker', 'reasoning-picker'].includes(state())) move('default');
        else if (S.page === 'ai' && state() === 'model-picker') move(M.returnState);
        else if (S.history.length) back(); else if (S.page === 'ai') go('library'); else navigate('ai', M.offline ? 'offline' : 'initial');
        break;
      case 'ai-library': go('library'); break;
      case 'ai-history': navigate('ai-history'); break;
      case 'ai-models': navigate('ai-models'); break;
      case 'ai-connect': if (!blocked()) navigate('ai-connect'); break;
      case 'ai-new': rememberDraft(); M.active = ''; M.draft = M.drafts.new || ''; navigate('ai', 'initial'); break;
      case 'ai-suggest': M.draft = ['Как пользоваться сервисом Vedarama AI?', sampleQuestion, 'Найди упоминания темы в книгах'][Number(target.dataset.aiIndex)] || sampleQuestion; rememberDraft(); render(); document.querySelector('[data-ai-field="draft"]')?.focus(); break;
      case 'ai-send': send(); break;
      case 'ai-finish': move('answer'); break;
      case 'ai-stop': move('error'); break;
      case 'ai-retry': move('processing'); break;
      case 'ai-edit-question': M.draft = current()?.question || sampleQuestion; rememberDraft(); render(); document.querySelector('[data-ai-field="draft"]')?.focus(); break;
      case 'ai-activity': move(state() === 'activity' ? 'answer' : 'activity'); break;
      case 'ai-source': { const title = sources[Number(target.dataset.aiIndex)]; if (title) missingSample(title); break; }
      case 'ai-check': M.notice = 'Соединение отсутствует. Сохранённые диалоги и черновик доступны.'; render(); break;
      case 'ai-open-chat': if (M.chats.some(x => x.id === id)) openChat(id); break;
      case 'ai-chat-menu': M.menu = M.menu === id ? '' : id; M.rename = M.chats.find(x => x.id === id)?.title || ''; render(); break;
      case 'ai-rename': { const chat = M.chats.find(x => x.id === id); if (chat && M.rename?.trim()) chat.title = M.rename.trim(); M.menu = ''; render(); break; }
      case 'ai-delete-chat': M.chats = M.chats.filter(x => x.id !== id); if (M.active === id) M.active = ''; M.menu = ''; render(); break;
      case 'ai-pick-model': if (!running()) { M.returnState = state(); M.pendingModel = M.selected; move('model-picker'); } break;
      case 'ai-choose-model': M.pendingModel = value; render(); break;
      case 'ai-apply-model': if (M.models.some(x => x.id === M.pendingModel)) M.selected = M.pendingModel; move(M.returnState); break;
      case 'ai-cancel-model': move(M.returnState); break;
      case 'ai-use-model': if (M.models.some(x => x.id === value)) M.selected = value; navigate('ai', M.active ? 'answer' : 'initial'); break;
      case 'ai-provider': if (Object.hasOwn(providers, value)) { M.form.provider = value; M.form.name = value; M.form.model = providers[value][0] || ''; M.form.reasoning = 'auto'; updateForm(); move('default'); } break;
      case 'ai-pick-id': M.pendingId = M.form.model; move('model-picker'); break;
      case 'ai-choose-id': M.pendingId = value; render(); break;
      case 'ai-apply-id': if (M.pendingId.trim()) { M.form.model = M.pendingId.trim(); if (!capabilities().includes(M.form.reasoning)) M.form.reasoning = 'auto'; updateForm(); move('default'); } break;
      case 'ai-pick-reasoning': M.pendingReasoning = M.form.reasoning; move('reasoning-picker'); break;
      case 'ai-choose-reasoning': if (capabilities().includes(value)) M.pendingReasoning = value; render(); break;
      case 'ai-apply-reasoning': if (capabilities().includes(M.pendingReasoning)) M.form.reasoning = M.pendingReasoning; updateForm(); move('default'); break;
      case 'ai-cancel-form-picker': move('default'); break;
      case 'ai-test': if (validForm()) { M.verified = signature(); M.notice = 'Проверка завершена: демонстрационный результат успешен.'; render(); } break;
      case 'ai-save': if (validForm() && M.verified === signature() && !M.saved) { M.models.push({ id: `connection-${++M.sequence}`, name: M.form.name, detail: M.form.model, system: false }); M.saved = true; M.notice = 'Подключение сохранено в этом макете.'; render(); } break;
      default: return false;
    }
    return true;
  }
  window.aiReview = { init, render() { if (!ready) init(); if (S.page === 'ai-history') history(); else if (S.page === 'ai-models') models(); else if (S.page === 'ai-connect') connect(); else root(); }, act };
})();
