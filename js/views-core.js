/* ============================================================
   Core views — Dashboard, Projects, Inspiration, Reader
   Design and Developed by Mr.Busy
   ============================================================ */
window.ACB_VIEWS = window.ACB_VIEWS || {};
(function (V) {
  const U = window.ACB_U, D = window.ACB_DATA, S = window.ACB_STORE, A = window.ACB_ART;

  function head(title, desc, actions) {
    return '<div class="page-head"><div><h1>' + title + '</h1><p>' + desc + '</p></div><div class="page-actions">' + (actions || '') + '</div></div>';
  }
  function coverURL(project, w = 320, h = 210) {
    const p = project.pages && project.pages[0] && project.pages[0].panels[0];
    if (!p) return '';
    const chars = (project.characterIds || []).map(id => S.get().characters.find(c => c.id === id)).filter(Boolean);
    return A.renderPanel(p, { width: w, height: h, style: S.styleById(project.style), characters: chars, number: false }).toDataURL('image/png');
  }
  function projectCard(p) {
    const cover = coverURL(p);
    const panels = p.pages.reduce((a, pg) => a + pg.panels.length, 0);
    const st = S.styleById(p.style), ly = S.layoutById(p.layout);
    return '<div class="project-card" data-project="' + p.id + '">' +
      '<div class="pc-cover">' + (cover ? '<img src="' + cover + '" alt="cover">' : '<span class="pc-placeholder">📚</span>') +
        '<span class="pc-status">' + U.esc(p.status || 'draft').toUpperCase() + '</span></div>' +
      '<div class="pc-body"><h3 title="' + U.esc(p.title) + '">' + U.esc(p.title) + '</h3>' +
        '<div class="pc-meta"><span class="chip">' + st.emoji + ' ' + U.esc(st.name) + '</span>' +
        '<span class="chip">' + p.pages.length + 'p · ' + panels + ' panels</span>' +
        (p.series ? '<span class="chip">' + U.esc(U.trunc(p.series, 14)) + '</span>' : '') + '</div>' +
        '<div class="small muted mb8">' + U.fmtDate(p.updatedAt) + ' · ' + U.esc(ly.name) + '</div>' +
        '<div class="pc-actions">' +
          '<button class="btn btn-primary btn-sm" data-act="edit">✎ Edit</button>' +
          '<button class="btn btn-sm" data-act="read">▤ Read</button>' +
          '<button class="btn btn-sm" data-act="more">⋯</button>' +
        '</div></div></div>';
  }
  function promptCard(pr, i) {
    return '<button class="prompt-card" data-prompt="' + i + '"><span class="pc-emoji">' + pr.emoji + '</span>' +
      '<b>' + U.esc(pr.title) + '</b><p>' + U.esc(U.trunc(pr.idea, 105)) + '</p>' +
      '<span class="chip accent mt8">Use prompt →</span></button>';
  }
  function statCard(label, value, note, icon) {
    return '<div class="stat-card"><div class="st-icon">' + icon + '</div><div class="st-label">' + label + '</div>' +
      '<div class="st-value">' + value + '</div><div class="st-note">' + note + '</div></div>';
  }

  /* ---------------- DASHBOARD ---------------- */
  V.dashboard = {
    title: 'Dashboard', crumb: 'Workspace',
    render() {
      const st = S.stats();
      const recent = S.get().projects.slice(0, 4);
      const tiles = [
        ['✦','Create Studio','Full 8-step wizard','create'], ['▦','My Projects','Browse & organise','projects'],
        ['♟','Characters','Unlimited profiles','characters'], ['◐','Style Lab','28 + custom styles','styles'],
        ['✂','Webtoon Slicer','No size limits','slicer'], ['↥','Export Center','PNG · PDF · CBZ','export']
      ];
      return head('Welcome to your studio', 'Everything from both source sites is here — rebuilt, unlocked and running entirely on your machine.') +
        '<div class="hero"><span class="eyebrow">✦ UNLIMITED EDITION · v2.0.0</span>' +
          '<h1>Create <em>amazing comics</em><br>with no limits at all.</h1>' +
          '<p>Turn any idea into a fully illustrated comic: story engine, consistent characters, 28 art styles, a real panel editor, webtoon slicing and print-ready export. No credits, no sign-in, no watermark, no cloud.</p>' +
          '<div class="hero-btns"><button class="btn btn-primary btn-lg" id="heroCreate">✦ Start Creating</button>' +
          '<button class="btn btn-lg" id="heroProjects">▦ Open Projects</button>' +
          '<button class="btn btn-lg" id="heroAbout">ⓘ What was rebuilt</button></div>' +
          '<div class="hero-badges"><span class="chip green">✓ Zero credits</span><span class="chip green">✓ 100% offline</span>' +
          '<span class="chip green">✓ No watermark</span><span class="chip green">✓ Commercial rights</span>' +
          '<span class="chip amber">✓ 28 styles</span><span class="chip amber">✓ 16 layouts</span></div></div>' +
        '<div class="stat-grid">' +
          statCard('Comics', st.comics, 'all stored locally', '📚') +
          statCard('Pages', st.pages, 'unlimited pages', '📄') +
          statCard('Panels', st.panels, 'rendered offline', '🖼️') +
          statCard('Characters', st.characters, 'no character cap', '♟') +
          statCard('Styles', st.styles, 'built-in + custom', '◐') +
          statCard('Script words', st.words, 'written by story engine', '✍️') +
        '</div>' +
        '<div class="section-head"><h2>Quick actions</h2></div>' +
        '<div class="quick-tiles">' + tiles.map(t => '<button class="quick-tile" data-go="' + t[3] + '"><span class="qt-icon">' + t[0] + '</span><b>' + t[1] + '</b><small>' + t[2] + '</small></button>').join('') + '</div>' +
        '<div class="section-head"><h2>Recent projects</h2><button class="text-link" data-go="projects">View all →</button></div>' +
        (recent.length ? '<div class="grid grid-auto">' + recent.map(projectCard).join('') + '</div>'
          : '<div class="empty"><span class="em-icon">📚</span><h3>No comics yet</h3><p>Create your first one in the Create Studio.</p></div>') +
        '<div class="section-head"><h2>Need inspiration?</h2><button class="text-link" data-go="inspiration">All prompts →</button></div>' +
        '<div class="grid grid-3">' + D.PROMPTS.slice(0, 6).map(promptCard).join('') + '</div>' +
        '<div class="credit-block"><div class="cb-mark">AIComic Builder Studio</div>' +
          '<p>Unlimited Edition · Rebuilt from aicomicbuilder.com and a1.art · Offline desktop application</p>' +
          '<p>All original platform limits removed. Your data never leaves this computer.</p>' +
          '<div class="cb-sign">Design and Developed by Mr.Busy</div></div>';
    },
    mount(root) {
      U.$$('[data-go]', root).forEach(b => b.onclick = () => window.go(b.dataset.go));
      U.$('#heroCreate', root).onclick = () => window.go('create');
      U.$('#heroProjects', root).onclick = () => window.go('projects');
      U.$('#heroAbout', root).onclick = () => window.go('about');
      U.$$('[data-project]', root).forEach(card => {
        U.$$('[data-act]', card).forEach(b => b.onclick = (e) => {
          e.stopPropagation(); const id = card.dataset.project;
          if (b.dataset.act === 'edit') window.openEditor(id);
          else if (b.dataset.act === 'read') window.openReader(id);
          else window.showProjectMenu(id, b);
        });
      });
      U.$$('[data-prompt]', root).forEach(b => b.onclick = () => window.usePrompt(D.PROMPTS[+b.dataset.prompt]));
    }
  };

  /* ---------------- PROJECTS ---------------- */
  V.projects = {
    title: 'My Projects', crumb: 'Workspace',
    render() {
      const all = S.get().projects;
      const series = [...new Set(all.map(p => p.series).filter(Boolean))];
      return head('My Projects', 'Chapters, series, drafts and published comics — all on your machine. Unlimited storage, no account.') +
        '<div class="page-actions mb16"><button class="btn btn-primary" id="prjNew">＋ New Comic</button>' +
        '<button class="btn" id="prjBackup">↧ Backup JSON</button><button class="btn" id="prjRestore">↥ Restore</button></div>' +
        '<div class="toolbar"><input class="input" id="prjSearch" placeholder="Search title, idea, tag…" style="flex:1;min-width:200px">' +
          '<select class="select" id="prjStatus"><option value="">All statuses</option><option>draft</option><option>published</option><option>archived</option></select>' +
          '<select class="select" id="prjSeries"><option value="">All series</option>' + series.map(s => '<option>' + U.esc(s) + '</option>').join('') + '</select>' +
          '<select class="select" id="prjSort"><option value="updated">Recently updated</option><option value="created">Recently created</option><option value="title">Title A–Z</option><option value="panels">Most panels</option></select>' +
          '<span class="small muted" id="prjCount"></span></div>' +
        '<div id="prjGrid" class="grid grid-auto"></div>';
    },
    mount(root) {
      const draw = () => {
        const q = (U.$('#prjSearch', root).value || '').toLowerCase();
        const status = U.$('#prjStatus', root).value, series = U.$('#prjSeries', root).value, sort = U.$('#prjSort', root).value;
        let list = S.get().projects.filter(p =>
          (!status || p.status === status) && (!series || p.series === series) &&
          (!q || (p.title + ' ' + p.idea + ' ' + (p.tags||[]).join(' ') + ' ' + (p.series||'')).toLowerCase().includes(q)));
        const panels = p => p.pages.reduce((a, pg) => a + pg.panels.length, 0);
        list.sort((a,b) => sort === 'title' ? a.title.localeCompare(b.title) : sort === 'created' ? b.createdAt - a.createdAt : sort === 'panels' ? panels(b)-panels(a) : b.updatedAt - a.updatedAt);
        U.$('#prjCount', root).textContent = list.length + ' comic' + (list.length === 1 ? '' : 's');
        U.$('#prjGrid', root).innerHTML = list.length ? list.map(projectCard).join('')
          : '<div class="empty" style="grid-column:1/-1"><span class="em-icon">🔍</span><h3>No matching comics</h3><p>Try a different filter, or create a new comic.</p></div>';
        U.$$('[data-project]', root).forEach(card => U.$$('[data-act]', card).forEach(b => b.onclick = (e) => {
          e.stopPropagation(); const id = card.dataset.project;
          if (b.dataset.act === 'edit') window.openEditor(id);
          else if (b.dataset.act === 'read') window.openReader(id);
          else window.showProjectMenu(id, b);
        }));
      };
      ['#prjSearch','#prjStatus','#prjSeries','#prjSort'].forEach(sel => {
        const el = U.$(sel, root); el.oninput = draw; el.onchange = draw;
      });
      draw();
      U.$('#prjNew', root).onclick = () => window.go('create');
      U.$('#prjBackup', root).onclick = () => window.backupAll();
      U.$('#prjRestore', root).onclick = () => window.restoreAll();
    }
  };

  /* ---------------- INSPIRATION ---------------- */
  V.inspiration = {
    title: 'Inspiration', crumb: 'Library',
    render() {
      return head('Inspiration & Community', 'Prompt templates, trending comics and featured characters captured from the original site, plus 22 story starters.') +
        '<div class="tabs" id="inspTabs"><button class="active" data-tab="prompts">💡 Story Prompts (' + D.PROMPTS.length + ')</button>' +
        '<button data-tab="trending">🔥 Trending Comics</button><button data-tab="recent">✨ Recently Created</button>' +
        '<button data-tab="characters">🎭 Featured Characters</button><button data-tab="styles">🎨 Style Gallery</button></div>' +
        '<div id="inspBody"></div>';
    },
    mount(root) {
      const body = U.$('#inspBody', root);
      const draw = (tab) => {
        if (tab === 'prompts') {
          body.innerHTML = '<div class="info-banner mb16"><span class="ib-icon">✦</span><div>Click any prompt to open the Create Studio with the title, idea, genre and style pre-filled. All 22 are editable.</div></div>' +
            '<div class="grid grid-4">' + D.PROMPTS.map(promptCard).join('') + '</div>';
          U.$$('[data-prompt]', body).forEach(b => b.onclick = () => window.usePrompt(D.PROMPTS[+b.dataset.prompt]));
        } else if (tab === 'trending' || tab === 'recent') {
          const rows = tab === 'trending' ? D.COMMUNITY.trending : D.COMMUNITY.recent;
          body.innerHTML = '<div class="card"><h3 style="margin:0 0 12px">' + (tab === 'trending' ? '🔥 Trending Comics' : '✨ Recently Created') + '</h3>' +
            '<table class="table"><thead><tr><th>#</th><th>Title</th><th>Creator</th><th>Views</th><th></th></tr></thead><tbody>' +
            rows.map((r,i) => '<tr><td>' + (i+1) + '</td><td><b>' + U.esc(r[0]) + '</b></td><td>' + U.esc(r[1]) + '</td><td>' + r[2] + '</td>' +
              '<td><button class="btn btn-sm" data-remix="' + i + '">Remix →</button></td></tr>').join('') + '</tbody></table></div>';
          U.$$('[data-remix]', body).forEach(b => b.onclick = () => window.usePrompt({ emoji:'🔁', title: rows[+b.dataset.remix][0], idea: rows[+b.dataset.remix][0] + ' — an unexpected new chapter.', style:'american-comic', genre:'Adventure' }));
        } else if (tab === 'characters') {
          body.innerHTML = '<div class="grid grid-4">' + D.FEATURED_CHARACTERS.map((c,i) =>
            '<div class="char-card"><div class="char-avatar" data-avatar="' + i + '"></div><div class="cc-body"><h3>' + U.esc(c.name) + '</h3>' +
            '<div class="small muted">' + U.esc(c.cat) + '</div><div class="mt8"><button class="btn btn-sm btn-outline" data-addchar="' + i + '">+ Add to library</button></div></div></div>').join('') + '</div>';
          U.$$('[data-avatar]', body).forEach(el => el.appendChild(A.renderAvatar(D.FEATURED_CHARACTERS[+el.dataset.avatar], 220, 150)));
          U.$$('[data-addchar]', body).forEach(b => b.onclick = () => {
            const c = D.FEATURED_CHARACTERS[+b.dataset.addchar];
            S.addCharacter({ name:c.name, category:c.cat, role:c.role, color:c.color, hair:c.hair, traits:c.traits, species:c.cat, notes:'Imported from the featured gallery.' });
            U.toast('Added ' + c.name + ' to your library', 'success'); window.refreshSidebar();
          });
        } else {
          body.innerHTML = '<div class="grid grid-auto">' + S.allStyles().map(s =>
            '<button class="style-card" data-style="' + U.esc(s.id) + '"><div class="style-preview" data-sw="' + U.esc(s.id) + '"></div>' +
            '<div class="sc-body"><b>' + s.emoji + ' ' + U.esc(s.name) + '</b><small>' + U.esc(s.desc) + '</small></div></button>').join('') + '</div>';
          U.$$('[data-sw]', body).forEach(el => el.appendChild(A.renderSwatch(S.styleById(el.dataset.sw))));
          U.$$('[data-style]', body).forEach(b => b.onclick = () => window.go('styles'));
        }
      };
      U.$$('#inspTabs button', root).forEach(b => b.onclick = () => {
        U.$$('#inspTabs button', root).forEach(x => x.classList.remove('active')); b.classList.add('active'); draw(b.dataset.tab);
      });
      draw('prompts');
    }
  };

  /* ---------------- READER ---------------- */
  V.reader = {
    title: 'Reader', crumb: 'Workspace',
    render() {
      const p = S.activeProject();
      if (!p) return head('Reader', 'No comic selected.') + '<div class="empty"><span class="em-icon">▤</span><h3>No comic open</h3><p>Create a comic first.</p></div>';
      const opts = S.get().projects.map(x => '<option value="' + x.id + '"' + (x.id === p.id ? ' selected' : '') + '>' + U.esc(x.title) + '</option>').join('');
      return head('Reader', 'Page view or seamless vertical scroll — exactly like the original reader, with zoom, fullscreen and export.') +
        '<div class="toolbar"><select class="select" id="rdProject">' + opts + '</select>' +
          '<div class="segmented" id="rdMode"><button class="active" data-mode="page">📄 Page view</button><button data-mode="vertical">📜 Vertical scroll</button></div>' +
          '<button class="btn btn-sm" id="rdPrev">‹ Prev</button><span class="small muted" id="rdPos">1 / ' + p.pages.length + '</span><button class="btn btn-sm" id="rdNext">Next ›</button>' +
          '<button class="btn btn-sm" id="rdZoomOut">−</button><span class="small muted" id="rdZoom">100%</span><button class="btn btn-sm" id="rdZoomIn">+</button>' +
          '<button class="btn btn-sm" id="rdFull">⛶ Fullscreen</button><button class="btn btn-sm btn-outline" id="rdExport">↥ Export</button></div>' +
        '<div class="reader-wrap" id="rdWrap"></div>';
    },
    mount(root) {
      let p = S.activeProject(); if (!p) return;
      let mode = 'page', page = 0, zoom = 1;
      const wrap = U.$('#rdWrap', root);
      const draw = () => {
        p = S.activeProject(); if (!p) return;
        page = Math.max(0, Math.min(p.pages.length - 1, page));
        wrap.style.transformOrigin = 'top center'; wrap.style.transform = 'scale(' + zoom + ')';
        wrap.style.transition = 'transform .2s';
        U.$('#rdZoom', root).textContent = Math.round(zoom * 100) + '%';
        U.$('#rdPos', root).textContent = (page + 1) + ' / ' + p.pages.length;
        if (mode === 'page') {
          const c = A.composePage(p, page, { quality: 1.6, pageWidth: 860, pageHeight: 1120, watermark: S.settings().watermark, footer: true });
          wrap.innerHTML = '<div class="reader-page"><img src="' + c.toDataURL('image/png') + '" alt="page ' + (page+1) + '"></div>';
        } else {
          let html = '<div class="reader-vertical">';
          p.pages.forEach((pg, pi) => pg.panels.forEach(pn => {
            const c = A.renderPanel(pn, { width: 700, height: 520, style: S.styleById(p.style),
              characters: p.characterIds.map(id => S.get().characters.find(x => x.id === id)).filter(Boolean),
              filter: pn.filter, watermark: S.settings().watermark });
            html += '<img src="' + c.toDataURL('image/png') + '" alt="panel ' + pn.num + '">';
          }));
          wrap.innerHTML = html + '</div>';
        }
        U.$$('img', wrap).forEach(im => { im.style.cursor = 'zoom-in'; im.onclick = () => U.lightbox(im.src); });
      };
      U.$('#rdProject', root).onchange = (e) => { S.setActive(e.target.value); page = 0; draw(); };
      U.$$('#rdMode button', root).forEach(b => b.onclick = () => { U.$$('#rdMode button', root).forEach(x => x.classList.remove('active')); b.classList.add('active'); mode = b.dataset.mode; draw(); });
      U.$('#rdPrev', root).onclick = () => { page--; draw(); };
      U.$('#rdNext', root).onclick = () => { page++; draw(); };
      U.$('#rdZoomIn', root).onclick = () => { zoom = Math.min(2, zoom + .1); draw(); };
      U.$('#rdZoomOut', root).onclick = () => { zoom = Math.max(.5, zoom - .1); draw(); };
      U.$('#rdFull', root).onclick = () => { const el = U.$('#view'); if (document.fullscreenElement) document.exitFullscreen(); else el.requestFullscreen && el.requestFullscreen(); };
      U.$('#rdExport', root).onclick = () => window.go('export');
      draw();
    }
  };

  V.head = head; V.projectCard = projectCard; V.promptCard = promptCard; V.coverURL = coverURL; V.statCard = statCard;
})(window.ACB_VIEWS);
