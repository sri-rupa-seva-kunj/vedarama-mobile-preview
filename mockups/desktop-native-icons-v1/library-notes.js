(() => {
  const baseRenderSaved = renderSaved;
  const baseRenderNotes = renderNotes;
  const panel = $('#workspace-panel');
  const editor = $('#note-editor');
  const editorHome = $('#notes-panel');
  const baseShowSection = showSection;
  const baseOpenTool = openTool;
  function editorBlock() { return editor.closest('.desktop-motion-slot') || editor; }
  function returnEditor() {
    const block = editorBlock();
    if (block.parentElement !== editorHome) editorHome.querySelector('.panel-hint').before(block);
  }
  // Keep the shared draft and handlers alive when a workspace replaces its content.
  showSection = function(next, resetPanel = true) {
    returnEditor();
    return baseShowSection(next, resetPanel);
  };
  openTool = function(next, mode = 'panel') {
    returnEditor();
    return baseOpenTool(next, mode);
  };
  function renderLibraryNotes() {
    const count = saved.notes.length;
    const tabs = panel.querySelector('.workspace-controls .segmented');
    if (!tabs) return;
    tabs.insertAdjacentHTML('beforeend', `<button id="show-notes" aria-pressed="${savedTab === 'notes'}">Заметки <small>${count}</small></button>`);
    $('#show-notes').onclick = () => { savedTab = 'notes'; activeShelf = null; renderSaved($('#bookmark-search')?.value || ''); };
    if (savedTab !== 'notes') return;
    const primary = $('#saved-primary');
    primary.innerHTML = `${icon('plus')}Новая заметка`;
    primary.setAttribute('aria-label', 'Создать заметку');
    primary.onclick = () => startNote(null, { keepSection: true });
    const search = panel.querySelector('.bookmark-search');
    if (search) {
      search.querySelector('input').placeholder = 'Найти заметку…';
      search.querySelector('input').setAttribute('aria-label', 'Поиск по заметкам в моей библиотеке');
    }
    const list = panel.querySelector('.bookmark-list');
    if (!list) return;
    list.before(editorBlock());
    const query = (search?.querySelector('input').value || '').toLowerCase().trim();
    const notes = saved.notes.filter(n => `${n.quote || ''} ${n.text || ''}`.toLowerCase().includes(query));
    list.className = 'library-note-list';
    list.innerHTML = notes.length ? notes.map(n => `<article class="library-note-card" data-library-note="${escapeText(n.id)}"><div class="library-note-heading">${icon('note')}<span>Заметка</span><button data-library-edit="${escapeText(n.id)}" aria-label="Редактировать заметку">${icon('note')}</button><button data-library-delete="${escapeText(n.id)}" aria-label="Удалить заметку">${icon('close')}</button></div>${n.quote ? `<blockquote>${escapeText(n.quote)}</blockquote>` : ''}<p>${escapeText(n.text)}</p></article>`).join('') : `<div class="empty-state"><i data-icon="note"></i><h3>${query ? 'Заметок с таким текстом нет' : 'Заметок пока нет'}</h3><p>${query ? 'Попробуйте изменить запрос.' : 'Добавляйте заметки при чтении — они будут собраны здесь.'}</p></div>`;
    document.querySelectorAll('[data-library-edit]').forEach(b => b.onclick = () => startNote(saved.notes.find(n => n.id === b.dataset.libraryEdit), { keepSection: true }));
    document.querySelectorAll('[data-library-delete]').forEach(b => b.onclick = () => {
      const index = saved.notes.findIndex(n => n.id === b.dataset.libraryDelete);
      if (index < 0) return;
      if (editId === b.dataset.libraryDelete) cancelNote();
      const [removed] = saved.notes.splice(index, 1);
      persist(); renderNotes();
      toast('Заметка удалена.');
      const undo = document.createElement('button'); undo.textContent = 'Отменить';
      undo.onclick = () => { saved.notes.splice(Math.min(index, saved.notes.length), 0, removed); persist(); renderNotes(); $('.toast').hidden = true; };
      $('.toast').append(undo);
    });
    drawIcons(list);
  }
  renderSaved = function(query = '') {
    returnEditor();
    baseRenderSaved(query);
    if (section === 'saved') renderLibraryNotes();
  };
  renderNotes = function() {
    baseRenderNotes();
    if (section === 'saved' && savedTab === 'notes') renderSaved($('#bookmark-search')?.value || '');
  };
  if (section === 'notes') showSection('notes');
  else if (section === 'saved') renderSaved($('#bookmark-search')?.value || '');
})();
