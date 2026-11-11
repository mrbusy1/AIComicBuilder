/* ============================================================
   Application shell — routing, theme, i18n, shortcuts, menus
   Design and Developed by Mr.Busy
   ============================================================ */
(function () {
  const U = window.ACB_U, D = window.ACB_DATA, S = window.ACB_STORE, V = window.ACB_VIEWS;
  const view = document.getElementById('view');
  let route = 'dashboard';

  /* ---------- theme / language / sidebar ---------- */
  window.applyTheme = function () {
    const s = S.settings();
    document.documentElement.dataset.theme = s.theme;
    document.documentElement.dataset.accent = s.accent;
    const btn = document.getElementById('btnTheme');
    if (btn) btn.textContent = s.theme === 'dark' ? '☾' : '☀';
  };
  window.applyLang = function () {
    const lang = S.settings().language;
    const dict = D.I18N[lang] || D.I18N.en;
    U.$$('[data-i18n]').forEach(el => {
      const k = el.dataset.i18n.replace(/^nav\./, '').replace(/^common\./, '');
      if (dict[k]) el.textContent = dict[k];
    });
  };
  window.applySidebar = function () {
    const sb = document.getElementById('sidebar');
    const collapsed = S.get().ui.sidebarCollapsed;
    sb.classList.toggle('collapsed', collapsed);
    document.getElementById('btnCollapse').style.display = collapsed ? 'none' : '';
    document.getElementById('btnExpand').style.display = collapsed ? '' : 'none';
  };
  window.refreshSidebar = function () {
    document.getElementById('navProjectCount').textContent = S.get().projects.length;
    document.getElementById('navCharCount').textContent = S.get().characters.length;
    document.getElementById('navStyleCount').textContent = S.allStyles().length;
  };
  window.setStatus = function (t) { document.getElementById('ftStatus').textContent = t; };

  /* ---------- router ---------- */
  window.go = function (r, params) {
    if (!V[r]) r = 'dashboard';
    route = r;
    U.$$('.nav-item').forEach(b => b.classList.toggle('active', b.dataset.route === r));
    const meta = V[r];
    document.getElementById('crumbPage').textContent = meta.title || r;
    const crumbMap = { workspace:'Workspace', library:'Library', tools:'Tools', system:'System' };
    document.getElementById('crumbSection').textContent = crumbMap[(meta.crumb||'').toLowerCase()] || meta.crumb || 'Workspace';
    document.getElementById('modal-root').innerHTML = '';
    render();
    view.scrollTop = 0;
    history.replaceState ? history.replaceState(null, '', '#' + r) : null;
    window.setStatus(({dashboard:'Studio ready',create:'Create Studio — unlimited generations',projects:'Local project library',
      editor:'Panel editor active',reader:'Reader active',characters:'Character library',styles:'Style Lab',
      inspiration:'Inspiration gallery',slicer:'Webtoon slicer ready',filters:'Filters & FX',export:'Export Center',
      settings:'Settings',about:'About & Sources'}[r] || 'Ready') + ' · offline engine active');
  };
  function render() {
    const meta = V[route];
    if (!meta) return;
    view.innerHTML = typeof meta.render === 'function' ? meta.render() : '';
    if (meta.mount) {
      try { meta.mount(view); } catch (e) { console.error('View mount error:', route, e); U.toast('View error: ' + e.message, 'error', 6000); }
    }
    window.applyLang();
  }
  window.refresh = function () { render(); window.refreshSidebar(); };

  /* ---------- global actions ---------- */
  window.openEditor = function (id) {
    if (id) { S.setActive(id); S.get().activePageIndex = 0; S.persist(); }
    window.go('editor');
  };
  window.openReader = function (id) { if (id) S.setActive(id); window.go('reader'); };
  window.usePrompt = function (pr) {
    if (!pr) return;
    V.create.setDraft({ title: pr.title, idea: pr.idea, genre: pr.genre || 'Adventure',
      style: pr.style || 'auto', layout: 'auto', pages: 1 });
    if (V.create.setMode) V.create.setMode('customize');
    window.go('create');
    U.toast('Loaded "' + pr.title + '" into the studio', 'success');
  };

  window.showProjectMenu = function (id, anchor) {
    const p = S.getProject(id); if (!p) return;
    const body = '<div class="grid grid-2">' +
      '<div class="field"><label>Title</label><input class="input" id="pmTitle" value="'+U.esc(p.title)+'"></div>' +
      '<div class="field"><label>Series / Chapter</label><input class="input" id="pmSeries" value="'+U.esc(p.series||'')+'"></div>' +
      '<div class="field"><label>Status</label><select class="select" id="pmStatus">'+['draft','published','archived'].map(s=>'<option'+(p.status===s?' selected':'')+'>'+s+'</option>').join('')+'</select></div>' +
      '<div class="field"><label>Tags</label><input class="input" id="pmTags" value="'+U.esc((p.tags||[]).join(', '))+'"></div>' +
      '</div><div class="divider"></div><div class="row wrap">' +
      '<button class="btn btn-sm" data-pm="edit">✎ Edit panels</button><button class="btn btn-sm" data-pm="read">▤ Read</button>' +
      '<button class="btn btn-sm" data-pm="dup">⧉ Duplicate</button><button class="btn btn-sm" data-pm="export">↥ Export</button>' +
      '<button class="btn btn-sm" data-pm="json">↧ JSON</button>' +
      '<button class="btn btn-sm btn-danger" data-pm="del">🗑 Delete</button></div>';
    U.openModal({ title: '📚 ' + U.esc(p.title), body,
      footer: '<button class="btn" data-close>Close</button><button class="btn btn-primary" id="pmSave">💾 Save changes</button>',
      onMount: (m, close) => {
        m.querySelector('#pmSave').onclick = () => {
          p.title = m.querySelector('#pmTitle').value.trim() || p.title;
          p.series = m.querySelector('#pmSeries').value.trim();
          p.status = m.querySelector('#pmStatus').value;
          p.tags = m.querySelector('#pmTags').value.split(',').map(s=>s.trim()).filter(Boolean);
          S.saveProject(p); close(); window.refresh(); U.toast('Project updated', 'success');
        };
        U.$$('[data-pm]', m).forEach(b => b.onclick = () => {
          const a = b.dataset.pm;
          if (a === 'edit') { close(); window.openEditor(id); }
          else if (a === 'read') { close(); window.openReader(id); }
          else if (a === 'dup') { const c=S.duplicateProject(id); close(); window.refresh(); U.toast('Duplicated as '+c.title,'success'); }
          else if (a === 'export') { S.setActive(id); close(); window.go('export'); }
          else if (a === 'json') {
            const blob = new Blob([JSON.stringify({app:'AIComic Builder Studio',credit:'Design and Developed by Mr.Busy',project:p},null,2)],{type:'application/json'});
            U.downloadBlob(blob, U.safeFileName(p.title)+'.json'); U.toast('Project JSON exported','success');
          } else if (a === 'del') {
            U.confirmDialog('Delete "' + p.title + '" permanently?', () => {
              S.deleteProject(id); close(); window.refresh(); U.toast('Project deleted','success');
            });
          }
        });
      }
    });
  };

  window.backupAll = function () {
    const blob = new Blob([S.backupJSON()], { type:'application/json' });
    U.downloadBlob(blob, 'aicomicbuilder-backup-' + new Date().toISOString().slice(0,10) + '.json');
    U.toast('Full backup downloaded', 'success');
  };
  window.restoreAll = function () {
    const inp = document.createElement('input'); inp.type='file'; inp.accept='.json,application/json';
    inp.onchange = () => window.restoreFromFile(inp.files[0]); inp.click();
  };
  window.restoreFromFile = function (file) {
    if (!file) return;
    const fr = new FileReader();
    fr.onload = () => {
      try {
        if (file.name.match(/^aicomicbuilder-backup/)) S.importJSON(fr.result);
        else {
          const o = JSON.parse(fr.result);
          if (!o.project) throw new Error('Expected a full backup or a project JSON.');
          const p = o.project;
          if (!S.get().projects.some(x=>x.id===p.id)) { p.id=U.uid('comic'); S.get().projects.unshift(p); S.setActive(p.id); S.persist(); }
          else S.saveProject(Object.assign(S.getProject(p.id), p));
        }
        window.applyTheme(); window.refreshSidebar(); window.go('dashboard');
        U.toast('Restore complete', 'success');
      } catch(e) { U.toast('Restore failed: ' + e.message, 'error', 6000); }
    };
    fr.readAsText(file);
  };

  /* ---------- topbar / search ---------- */
  document.getElementById('btnCollapse').onclick = () => { S.setUI('sidebarCollapsed', true); window.applySidebar(); };
  document.getElementById('btnExpand').onclick = () => { S.setUI('sidebarCollapsed', false); window.applySidebar(); };
  document.getElementById('btnTheme').onclick = () => { S.setSetting('theme', S.settings().theme === 'dark' ? 'light' : 'dark'); window.applyTheme(); window.refresh(); U.toast('Theme switched', 'success'); };
  document.getElementById('btnHelp').onclick = () => window.go('about');
  document.getElementById('btnQuickNew').onclick = () => { V.create.setDraft(null); if (V.create.setMode) V.create.setMode('quick'); window.go('create'); };
  U.$$('.nav-item').forEach(b => b.onclick = () => window.go(b.dataset.route));

  const search = document.getElementById('globalSearch');
  search.oninput = U.debounce(() => {
    const q = search.value.trim().toLowerCase();
    if (q.length < 2) return;
    const hits = S.get().projects.filter(p => (p.title+' '+p.idea).toLowerCase().includes(q));
    if (hits.length) window.setStatus(hits.length + ' matching project(s) — press Enter to open Projects');
  }, 250);
  search.onkeydown = (e) => {
    if (e.key === 'Enter') {
      const q = search.value.trim();
      window.go('projects');
      const el = U.$('#prjSearch'); if (el) { el.value = q; el.dispatchEvent(new Event('input')); }
    }
  };

  /* ---------- keyboard ---------- */
  document.addEventListener('keydown', (e) => {
    const ctrl = e.ctrlKey || e.metaKey;
    if (e.key === 'Escape') {
      document.getElementById('modal-root').innerHTML = '';
      document.getElementById('lightbox').classList.add('hidden');
      return;
    }
    if (ctrl && e.key.toLowerCase() === 'n') { e.preventDefault(); V.create.setDraft(null); window.go('create'); }
    else if (ctrl && e.key.toLowerCase() === 'k') { e.preventDefault(); search.focus(); search.select(); }
    else if (ctrl && e.key.toLowerCase() === 'e') { e.preventDefault(); window.go('export'); }
    else if (ctrl && e.shiftKey && e.key.toLowerCase() === 't') { e.preventDefault(); document.getElementById('btnTheme').click(); }
    else if (ctrl && e.key.toLowerCase() === 'b') { e.preventDefault(); S.setUI('sidebarCollapsed', !S.get().ui.sidebarCollapsed); window.applySidebar(); }
    else if (ctrl && /^[1-5]$/.test(e.key)) { e.preventDefault(); window.go(['dashboard','create','projects','editor','reader'][+e.key-1]); }
    else if (ctrl && e.key.toLowerCase() === 'z' && route === 'editor') { e.preventDefault(); const b=U.$('#edUndo'); if(b) b.click(); }
    else if (ctrl && e.key.toLowerCase() === 'y' && route === 'editor') { e.preventDefault(); const b=U.$('#edRedo'); if(b) b.click(); }
    else if (ctrl && e.key.toLowerCase() === 's') { e.preventDefault(); S.persist(); U.toast('Saved locally', 'success'); }
  });

  /* ---------- lightbox ---------- */
  document.getElementById('lightboxClose').onclick = () => document.getElementById('lightbox').classList.add('hidden');

  /* ---------- Electron native menu ---------- */
  if (window.desktop && window.desktop.isElectron) {
    window.desktop.onMenu((action) => {
      const map = { dashboard:'dashboard', create:'create', projects:'projects', editor:'editor', reader:'reader',
        characters:'characters', styles:'styles', slicer:'slicer', filters:'filters', export:'export',
        'export-center':'export', about:'about', settings:'settings' };
      if (action === 'new') { V.create.setDraft(null); window.go('create'); }
      else if (action === 'theme') document.getElementById('btnTheme').click();
      else if (action === 'backup') window.backupAll();
      else if (map[action]) window.go(map[action]);
    });
    document.getElementById('ftMeta').textContent = 'AIComic Builder Studio v2.0.0 · Electron Desktop · Unlimited Edition';
  }

  /* ---------- boot ---------- */
  S.load();
  window.applyTheme();
  window.applySidebar();
  window.refreshSidebar();
  window.go((location.hash || '').replace('#','') || 'dashboard');
  window.applyLang();
  /* Decode any uploaded panel art saved in earlier sessions, then repaint */
  Promise.all(S.get().projects.map(p => window.ACB_ART.preloadProject(p))).then(() => {
    if (route === 'editor' || route === 'reader' || route === 'export') window.refresh();
  });
  setTimeout(() => window.setStatus('Ready · offline engine active · no account required'), 600);
})();
