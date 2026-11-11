/* ============================================================
   Comic Editor + Character Library + Style Lab
   Design and Developed by Mr.Busy
   ============================================================ */
(function (V) {
  const U = window.ACB_U, D = window.ACB_DATA, S = window.ACB_STORE, A = window.ACB_ART;

  /* ---------- global character dialog ---------- */
  window.createCharacter = function (onDone, existing) {
    const c = existing || {};
    const body = '<div class="grid grid-2">' +
      '<div class="field"><label>Name *</label><input class="input" id="chName" value="'+U.esc(c.name||'')+'" placeholder="Captain Cosmos"></div>' +
      '<div class="field"><label>Role</label><select class="select" id="chRole">'+['hero','villain','supporting'].map(r=>'<option value="'+r+'"'+(c.role===r?' selected':'')+'>'+r+'</option>').join('')+'</select></div>' +
      '<div class="field"><label>Category / Species</label><input class="input" id="chCat" value="'+U.esc(c.category||c.species||'')+'" placeholder="Superheroes"></div>' +
      '<div class="field"><label>Personality</label><input class="input" id="chPers" value="'+U.esc(c.personality||c.traits||'')+'" placeholder="Brave, curious"></div>' +
      '<div class="field"><label>Main colour</label><input class="input" type="color" id="chColor" value="'+(c.color||'#8b6cff')+'"></div>' +
      '<div class="field"><label>Hair colour</label><input class="input" type="color" id="chHair" value="'+(c.hair||'#2b2b3a')+'"></div>' +
      '</div><div class="field"><label>Visual traits / consistency notes</label><textarea class="textarea" id="chTraits" placeholder="Signature hairstyle, outfit, palette…">'+U.esc(c.traits||c.notes||'')+'</textarea>' +
      '<div class="hint">These traits are reused for character consistency in every panel.</div></div>' +
      '<div id="chPreview" style="text-align:center"></div>';
    const close = U.openModal({
      title: existing ? '✎ Edit Character' : '＋ New Character', body,
      footer: '<button class="btn" data-close>Cancel</button><button class="btn btn-primary" id="chSave">Save Character</button>',
      onMount: (m, cl) => {
        const pv = A.renderAvatar({ name: c.name || 'Preview', color: c.color || '#8b6cff', hair: c.hair || '#2b2b3a' }, 220, 150);
        m.querySelector('#chPreview').appendChild(pv);
        m.querySelector('#chSave').onclick = () => {
          const name = m.querySelector('#chName').value.trim();
          if (!name) { U.toast('Name is required', 'warn'); return; }
          const data = { name, role:m.querySelector('#chRole').value, category:m.querySelector('#chCat').value,
            personality:m.querySelector('#chPers').value, color:m.querySelector('#chColor').value,
            hair:m.querySelector('#chHair').value, traits:m.querySelector('#chTraits').value, notes:m.querySelector('#chTraits').value };
          if (existing) S.updateCharacter(existing.id, data); else S.addCharacter(data);
          cl(); U.toast('Character saved', 'success'); window.refreshSidebar(); onDone && onDone();
        };
      }
    });
    return close;
  };

  /* ---------------- CHARACTER LIBRARY ---------------- */
  V.characters = {
    title: 'Characters', crumb: 'Library',
    render() {
      return V.head('Character Library', 'Design a character once and reuse them across every comic. Unlimited profiles — no 10/50/300 caps.') +
        '<div class="toolbar"><input class="input" id="chSearch" placeholder="Search characters…" style="flex:1;min-width:200px">' +
        '<select class="select" id="chFilter"><option value="">All roles</option><option>hero</option><option>villain</option><option>supporting</option></select>' +
        '<button class="btn btn-primary btn-sm" id="chAdd">＋ New Character</button>' +
        '<button class="btn btn-sm" id="chSeed">↺ Restore featured set</button>' +
        '<span class="small muted" id="chCount"></span></div><div id="chGrid" class="grid grid-auto"></div>';
    },
    mount(root) {
      const draw = () => {
        const q = (U.$('#chSearch', root).value||'').toLowerCase(), role = U.$('#chFilter', root).value;
        const list = S.get().characters.filter(c => (!role || c.role===role) && (!q || (c.name+' '+(c.category||'')+' '+(c.traits||'')).toLowerCase().includes(q)));
        U.$('#chCount', root).textContent = list.length + ' character' + (list.length===1?'':'s');
        U.$('#chGrid', root).innerHTML = list.length ? list.map(c =>
          '<div class="char-card"><div class="char-avatar" data-av="'+c.id+'"></div><div class="cc-body">' +
          '<h3>'+U.esc(c.name)+'</h3><div class="small muted">'+U.esc(c.role)+' · '+U.esc(c.category||'Original')+'</div>' +
          '<div class="row mt8" style="justify-content:center;gap:5px"><span style="width:12px;height:12px;border-radius:50%;background:'+U.esc(c.color)+'"></span>' +
          '<span style="width:12px;height:12px;border-radius:50%;background:'+U.esc(c.hair)+'"></span></div>' +
          '<div class="row mt12" style="gap:5px"><button class="btn btn-sm" data-edit="'+c.id+'">✎</button>' +
          '<button class="btn btn-sm" data-use="'+c.id+'">Use</button>' +
          '<button class="btn btn-sm btn-danger" data-del="'+c.id+'">🗑</button></div></div></div>').join('')
          : '<div class="empty" style="grid-column:1/-1"><span class="em-icon">♟</span><h3>No characters</h3><p>Create one or restore the featured gallery set.</p></div>';
        U.$$('[data-av]', root).forEach(el => {
          const c = S.get().characters.find(x=>x.id===el.dataset.av); if (c) el.appendChild(A.renderAvatar(c, 220, 150));
        });
        U.$$('[data-edit]', root).forEach(b => b.onclick = () => window.createCharacter(draw, S.get().characters.find(c=>c.id===b.dataset.edit)));
        U.$$('[data-use]', root).forEach(b => b.onclick = () => {
          const p = S.activeProject();
          if (!p) { U.toast('Open or create a comic first', 'warn'); return; }
          if (!p.characterIds.includes(b.dataset.use)) p.characterIds.push(b.dataset.use);
          S.saveProject(p); U.toast('Added to current comic', 'success');
        });
        U.$$('[data-del]', root).forEach(b => b.onclick = () => U.confirmDialog('Delete this character? This cannot be undone.', () => { S.deleteCharacter(b.dataset.del); draw(); window.refreshSidebar(); }));
      };
      U.$('#chSearch', root).oninput = draw; U.$('#chFilter', root).onchange = draw;
      U.$('#chAdd', root).onclick = () => window.createCharacter(draw);
      U.$('#chSeed', root).onclick = () => {
        D.FEATURED_CHARACTERS.forEach((c,i) => { if (!S.get().characters.some(x=>x.name===c.name)) S.addCharacter({ name:c.name, category:c.cat, role:c.role, color:c.color, hair:c.hair, traits:c.traits, species:c.cat, notes:'From the featured gallery.' }); });
        draw(); window.refreshSidebar(); U.toast('Featured characters restored', 'success');
      };
      draw();
    }
  };

  /* ---------------- STYLE LAB ---------------- */
  V.styles = {
    title: 'Style Lab', crumb: 'Library',
    render() {
      return V.head('Style Lab', 'All 20 original styles plus 8 new ones, and an unlimited Custom Style Builder. Every style is available on every plan — because there are no plans.') +
        '<div class="toolbar"><div class="segmented" id="slTabs"><button class="active" data-t="builtin">🎨 Built-in ('+D.STYLES.length+')</button><button data-t="custom">🛠️ Custom ('+S.get().customStyles.length+')</button></div>' +
        '<span class="small muted">Original site: 7 styles on Free, 20+ on paid. Here: everything, plus your own.</span></div>' +
        '<div class="page-actions mb16"><button class="btn btn-primary" id="slNew">＋ Build Custom Style</button>' +
        '<button class="btn" id="slRandom">🎲 Random style for current comic</button></div><div id="slGrid" class="grid grid-auto"></div>';
    },
    mount(root) {
      let tab = 'builtin';
      const draw = () => {
        const list = tab === 'builtin' ? D.STYLES : S.get().customStyles;
        U.$('#slGrid', root).innerHTML = list.length ? list.map(s =>
          '<button class="style-card" data-st="'+U.esc(s.id)+'"><div class="style-preview" data-sw="'+U.esc(s.id)+'"></div>' +
          '<div class="sc-body"><b>'+s.emoji+' '+U.esc(s.name)+'</b><small>'+U.esc(s.desc)+'</small>' +
          '<div class="row mt8" style="gap:5px">'+s.colors.map(c=>'<span style="width:14px;height:14px;border-radius:4px;background:'+c+'"></span>').join('') +
          (s.new?'<span class="chip accent" style="margin-left:auto">NEW</span>':'')+'</div></div></button>').join('')
          : '<div class="empty" style="grid-column:1/-1"><span class="em-icon">🛠️</span><h3>No custom styles yet</h3><p>Build your own palette, line weight and texture.</p></div>';
        U.$$('[data-sw]', root).forEach(el => el.appendChild(A.renderSwatch(S.styleById(el.dataset.sw))));
        U.$$('[data-st]', root).forEach(b => b.onclick = () => styleDialog(S.styleById(b.dataset.st), draw, tab === 'custom'));
      };
      U.$$('#slTabs button', root).forEach(b => b.onclick = () => { U.$$('#slTabs button', root).forEach(x=>x.classList.remove('active')); b.classList.add('active'); tab=b.dataset.t; draw(); });
      U.$('#slNew', root).onclick = () => styleDialog(null, () => { tab='custom'; U.$$('#slTabs button', root).forEach(x=>x.classList.toggle('active', x.dataset.t==='custom')); draw(); window.refreshSidebar(); });
      U.$('#slRandom', root).onclick = () => {
        const p = S.activeProject(); if (!p) { U.toast('Open a comic first', 'warn'); return; }
        S.snapshot(); p.style = U.pick(S.allStyles(), Math.random).id; S.saveProject(p);
        U.toast('Style changed to ' + S.styleById(p.style).name, 'success'); window.go('editor');
      };
      draw();
    }
  };

  function styleDialog(style, onDone, isCustom) {
    const s = style || { name:'My Style', emoji:'🎨', desc:'A custom style', colors:['#8b6cff','#ff8ac4','#1b2030'], line:2, halftone:.2, texture:'clean', cat:'Custom' };
    const body = '<div class="grid grid-2">' +
      '<div class="field"><label>Name</label><input class="input" id="stName" value="'+U.esc(s.name)+'"></div>' +
      '<div class="field"><label>Emoji</label><input class="input" id="stEmoji" value="'+U.esc(s.emoji)+'" maxlength="4"></div></div>' +
      '<div class="field"><label>Description</label><input class="input" id="stDesc" value="'+U.esc(s.desc)+'"></div>' +
      '<div class="grid grid-3">' + [0,1,2].map(i => '<div class="field"><label>Palette '+(i+1)+'</label><input class="input" type="color" id="stC'+i+'" value="'+s.colors[i]+'"></div>').join('') + '</div>' +
      '<div class="grid grid-3">' +
        '<div class="field"><label>Line weight</label><input class="input" type="number" step="0.5" min="0" max="8" id="stLine" value="'+s.line+'"></div>' +
        '<div class="field"><label>Halftone</label><input class="input" type="number" step="0.1" min="0" max="1" id="stHalf" value="'+s.halftone+'"></div>' +
        '<div class="field"><label>Texture</label><select class="select" id="stTex">'+['clean','halftone','screentone','grain','neon','soft','watercolor','oil','pencil','ink','pixel'].map(t=>'<option'+(t===s.texture?' selected':'')+'>'+t+'</option>').join('')+'</select></div>' +
      '</div><div class="field"><label>Live preview</label><div id="stPreview" style="border-radius:10px;overflow:hidden;border:1px solid var(--border)"></div></div>';
    const footer = (isCustom && style ? '<button class="btn btn-danger" id="stDel">Delete</button>' : '') +
      '<button class="btn" data-close>Close</button><button class="btn btn-primary" id="stSave">💾 Save as custom style</button>' +
      '<button class="btn btn-outline" id="stApply">Apply to current comic</button>';
    U.openModal({ title: (style ? '🎨 ' + U.esc(style.name) : '🛠️ Build a Custom Style'), body, footer, wide:true,
      onMount: (m, close) => {
        const gather = () => ({ name:m.querySelector('#stName').value.trim() || 'My Style', emoji:m.querySelector('#stEmoji').value || '🎨',
          desc:m.querySelector('#stDesc').value, colors:[0,1,2].map(i=>m.querySelector('#stC'+i).value),
          line:+m.querySelector('#stLine').value, halftone:+m.querySelector('#stHalf').value,
          texture:m.querySelector('#stTex').value, cat:'Custom' });
        const repaint = () => { const pv = m.querySelector('#stPreview'); pv.innerHTML=''; const c=A.renderSwatch(Object.assign({id:'preview'},gather()), 600, 190); c.style.width='100%'; pv.appendChild(c); };
        repaint();
        ['#stName','#stEmoji','#stDesc','#stC0','#stC1','#stC2','#stLine','#stHalf','#stTex'].forEach(sel => { const el=m.querySelector(sel); el.oninput=repaint; el.onchange=repaint; });
        m.querySelector('#stSave').onclick = () => { S.addStyle(gather()); close(); U.toast('Custom style saved', 'success'); onDone && onDone(); window.refreshSidebar(); };
        m.querySelector('#stApply').onclick = () => { const p=S.activeProject(); if(!p){U.toast('Open a comic first','warn');return;} const ns=S.addStyle(gather()); S.snapshot(); p.style=ns.id; S.saveProject(p); close(); U.toast('Applied '+ns.name,'success'); window.go('editor'); };
        const del = m.querySelector('#stDel'); if (del) del.onclick = () => U.confirmDialog('Delete this custom style?', () => { S.deleteStyle(style.id); close(); U.toast('Style deleted','success'); onDone && onDone(); window.refreshSidebar(); });
      }
    });
  }

  /* ---------------- COMIC EDITOR ---------------- */
  V.editor = {
    title: 'Comic Editor', crumb: 'Workspace',
    render() {
      const p = S.activeProject();
      if (!p) return V.head('Comic Editor','No comic open.') + '<div class="empty"><span class="em-icon">✎</span><h3>No comic open</h3><p>Create a comic first, then edit every panel.</p><button class="btn btn-primary mt16" id="edCreate">Create a comic</button></div>';
      const opts = S.get().projects.map(x=>'<option value="'+x.id+'"'+(x.id===p.id?' selected':'')+'>'+U.esc(x.title)+'</option>').join('');
      return V.head('Comic Editor', 'Full panel editing: dialogue, captions, SFX, camera, expressions, draggable speech bubbles, filters, single-panel regeneration and image upload.') +
        '<div class="toolbar"><select class="select" id="edProject" style="min-width:190px">'+opts+'</select>' +
          '<button class="btn btn-sm" id="edUndo" title="Ctrl+Z">↶</button><button class="btn btn-sm" id="edRedo" title="Ctrl+Y">↷</button>' +
          '<span class="divider" style="width:1px;height:22px;margin:0 2px"></span>' +
          '<button class="btn btn-sm" id="edAdd">＋ Panel</button><button class="btn btn-sm" id="edDup">⧉ Duplicate</button>' +
          '<button class="btn btn-sm" id="edLeft">←</button><button class="btn btn-sm" id="edRight">→</button>' +
          '<button class="btn btn-sm btn-danger" id="edDel">🗑</button>' +
          '<button class="btn btn-sm" id="edRegenPage">🔁 Regenerate page</button>' +
          '<span class="spacer"></span>' +
          '<select class="select" id="edStyle" style="min-width:150px">'+S.allStyles().map(s=>'<option value="'+s.id+'"'+(s.id===p.style?' selected':'')+'>'+s.emoji+' '+U.esc(s.name)+'</option>').join('')+'</select>' +
          '<select class="select" id="edLayout" style="min-width:140px">'+D.LAYOUTS.map(l=>'<option value="'+l.id+'"'+(l.id===p.layout?' selected':'')+'>'+l.emoji+' '+U.esc(l.name)+'</option>').join('')+'</select>' +
          '<button class="btn btn-sm btn-outline" id="edExport">↥ Export</button></div>' +
        '<div class="editor-layout"><div class="editor-stage">' +
          '<div class="row-between mb12"><b class="small">📄 Pages</b><div class="row"><button class="btn btn-sm" id="edAddPage">＋ Add page</button><button class="btn btn-sm" id="edDelPage">− Remove page</button></div></div>' +
          '<div class="strip-list" id="edStrip"></div>' +
          '<div class="row-between mt16 mb8"><b class="small" id="edPos"></b><span class="small muted">Click a panel to edit · drag bubbles in the preview</span></div>' +
          '<div id="edCanvasBox"></div></div><div class="editor-side" id="edSide"></div></div>';
    },
    mount(root) {
      let p = S.activeProject(); if (!p) { const b=U.$('#edCreate',root); if(b) b.onclick=()=>window.go('create'); return; }
      let pi = Math.min(S.get().activePageIndex || 0, p.pages.length-1);
      let pid = S.get().activePanelId;
      const getPanel = () => { const pg=p.pages[pi]; return pg.panels.find(x=>x.id===pid) || pg.panels[0]; };

      const draw = () => {
        p = S.activeProject(); if (!p) return;
        pi = Math.min(pi, p.pages.length-1); const pg = p.pages[pi];
        if (!pg.panels.some(x=>x.id===pid)) pid = pg.panels[0].id;
        // page strip
        U.$('#edStrip', root).innerHTML = p.pages.map((x,i) =>
          '<button class="strip-thumb'+(i===pi?' active':'')+'" data-pi="'+i+'"><div data-thumb="'+i+'"></div><span>Page '+(i+1)+'</span></button>').join('');
        U.$$('[data-thumb]', root).forEach(el => {
          const i=+el.dataset.thumb, first=p.pages[i].panels[0];
          const c=A.renderPanel(first,{width:180,height:120,style:S.styleById(p.style),number:false});
          c.style.width='100%'; c.style.height='66px'; el.appendChild(c);
        });
        U.$$('[data-pi]', root).forEach(b => b.onclick = () => { pi=+b.dataset.pi; S.get().activePageIndex=pi; pid=p.pages[pi].panels[0].id; S.persist(); draw(); });

        // page grid
        const L = S.layoutById(p.layout), vertical = ['webtoon','yonkoma','widescreen'].includes(p.layout);
        const cols = p.layout==='custom' ? (p.columns||3) : (vertical ? 1 : (L.cols||2));
        const spans = A.layoutSpans(p.layout, pg.panels.length);
        const box = U.$('#edCanvasBox', root);
        box.innerHTML = '<div class="page-canvas'+(vertical?' layout-webtoon':'')+'" id="edGrid" style="grid-template-columns:repeat('+cols+',1fr);gap:'+(p.gutter!=null?p.gutter:12)+'px;max-width:'+(vertical?'520px':'940px')+'"></div>';
        const grid = U.$('#edGrid', root);
        pg.panels.forEach(pn => {
          const tile = document.createElement('div');
          tile.className = 'panel-tile' + (pn.id===pid?' selected':'');
          tile.dataset.panel = pn.id;
          tile.style.gridColumn = 'span ' + (vertical ? cols : Math.min(cols, spans[pn.num-1] || Math.max(1,Math.round(cols/2))));
          tile.style.minHeight = (vertical ? 190 : (p.layout==='splash'?460:190)) + 'px';
          const chars = p.characterIds.map(id=>S.get().characters.find(c=>c.id===id)).filter(Boolean);
          const c = A.renderPanel(pn, { width:360, height:240, style:S.styleById(p.style), characters:chars, filter:pn.filter, watermark:S.settings().watermark });
          c.style.width='100%'; c.style.height='100%';
          tile.appendChild(c);
          tile.innerHTML += '<span class="pt-num">#'+pn.num+'</span><div class="pt-hover">✎ Edit panel</div>';
          tile.onclick = () => { pid=pn.id; S.get().activePanelId=pid; S.persist(); draw(); };
          grid.appendChild(tile);
        });
        U.$('#edPos', root).textContent = 'Page '+(pi+1)+' / '+p.pages.length+' · '+pg.panels.length+' panels · '+S.styleById(p.style).name;
        U.$('#edProject', root).value = p.id;
        U.$('#edStyle', root).value = p.style; U.$('#edLayout', root).value = p.layout;
        drawSide();
      };

      const drawSide = () => {
        const pn = getPanel(); if (!pn) return;
        const side = U.$('#edSide', root);
        const optSel = (list, val) => list.map(x=>'<option'+(x===val?' selected':'')+'>'+U.esc(x)+'</option>').join('');
        side.innerHTML =
          '<div class="card pad-sm"><div class="row-between mb8"><b class="small">🔍 Panel '+pn.num+' preview</b><span class="chip">'+U.esc(pn.camera)+'</span></div>' +
          '<div class="bubble-editor" id="beWrap"><div id="beCanvas"></div><div class="drag-bubble" id="beBubble">💬 Drag me</div></div>' +
          '<div class="small muted mt8">Drag the purple box to reposition the speech bubble.</div></div>' +
          '<div class="card pad-sm"><b class="small mb12" style="display:block">📝 Lettering</b>' +
          '<div class="field"><label>Dialogue</label><textarea class="textarea" id="pfDialogue" style="min-height:62px">'+U.esc(pn.dialogue)+'</textarea></div>' +
          '<div class="grid grid-2"><div class="field"><label>Caption</label><input class="input" id="pfCaption" value="'+U.esc(pn.caption)+'"></div>' +
          '<div class="field"><label>Sound FX</label><input class="input" id="pfSfx" value="'+U.esc(pn.sfx)+'"></div></div>' +
          '<div class="grid grid-2"><div class="field"><label>Bubble type</label><select class="select" id="pfBtype">'+optSel(D.BUBBLE_TYPES,pn.bubble.type)+'</select></div>' +
          '<div class="field"><label>Font size</label><input class="input" type="number" min="9" max="30" id="pfFs" value="'+(pn.bubble.fontSize||15)+'"></div></div>' +
          '<div class="field"><label>Bubble X <span class="muted" id="pfXv">'+Math.round(pn.bubble.x*100)+'%</span></label><input class="input" type="range" min="2" max="70" id="pfX" value="'+Math.round(pn.bubble.x*100)+'"></div>' +
          '<div class="field"><label>Bubble Y <span class="muted" id="pfYv">'+Math.round(pn.bubble.y*100)+'%</span></label><input class="input" type="range" min="2" max="65" id="pfY" value="'+Math.round(pn.bubble.y*100)+'"></div>' +
          '</div>' +
          '<div class="card pad-sm"><b class="small mb12" style="display:block">🎬 Scene</b>' +
          '<div class="field"><label>Scene description</label><textarea class="textarea" id="pfScene" style="min-height:62px">'+U.esc(pn.scene)+'</textarea></div>' +
          '<div class="grid grid-2"><div class="field"><label>Camera</label><select class="select" id="pfCam">'+optSel(D.CAMERAS,pn.camera)+'</select></div>' +
          '<div class="field"><label>Expression</label><select class="select" id="pfExpr">'+optSel(D.EXPRESSIONS,pn.expression)+'</select></div></div>' +
          '<div class="field"><label>Filter / FX</label><select class="select" id="pfFilter">'+D.FILTERS.map(f=>'<option value="'+f.id+'"'+(f.id===pn.filter?' selected':'')+'>'+f.name+'</option>').join('')+'</select></div>' +
          '<div class="row wrap mt8"><button class="btn btn-sm" id="pfRegen">🔁 Regenerate panel</button>' +
          '<button class="btn btn-sm" id="pfUpload">🖼️ Upload art</button>' +
          (pn.customImage ? '<button class="btn btn-sm btn-danger" id="pfClear">Remove upload</button>' : '') +
          '<input type="file" id="pfFile" accept="image/*" class="hidden"></div></div>' +
          '<div class="info-banner"><span class="ib-icon">∞</span><div>Regenerate a single panel as many times as you like. No credits, no re-rendering the whole comic.</div></div>';

        // preview canvas + draggable bubble
        const holder = U.$('#beCanvas', side);
        const chars = p.characterIds.map(id=>S.get().characters.find(c=>c.id===id)).filter(Boolean);
        const cv = A.renderPanel(pn, { width:320, height:220, style:S.styleById(p.style), characters:chars, filter:pn.filter, watermark:S.settings().watermark });
        cv.style.width='100%'; cv.style.display='block'; holder.appendChild(cv);
        const bub = U.$('#beBubble', side), wrap = U.$('#beWrap', side);
        const place = () => {
          bub.style.left = (pn.bubble.x*100)+'%'; bub.style.top = (pn.bubble.y*100)+'%';
          bub.style.width = Math.min(45, pn.bubble.w*100)+'%';
        };
        place();
        let dragging = false;
        bub.onpointerdown = (e) => { dragging = true; bub.setPointerCapture(e.pointerId); e.preventDefault(); };
        bub.onpointermove = (e) => {
          if (!dragging) return;
          const r = wrap.getBoundingClientRect();
          pn.bubble.x = Math.max(.02, Math.min(.72, (e.clientX - r.left)/r.width));
          pn.bubble.y = Math.max(.02, Math.min(.68, (e.clientY - r.top)/r.height));
          place(); syncSliders();
        };
        bub.onpointerup = () => { dragging=false; S.persist(); drawTilesOnly(); };
        const syncSliders = () => { const x=U.$('#pfX',side), y=U.$('#pfY',side); if(x){x.value=Math.round(pn.bubble.x*100); U.$('#pfXv',side).textContent=x.value+'%';} if(y){y.value=Math.round(pn.bubble.y*100); U.$('#pfYv',side).textContent=y.value+'%';} };

        const bindText = (id, key) => { const el=U.$('#'+id, side); el.oninput = () => { pn[key]=el.value; S.persist(); }; el.onchange = () => drawTilesOnly(); };
        ['pfDialogue:dialogue','pfCaption:caption','pfSfx:sfx','pfScene:scene'].forEach(m=>{const [id,k]=m.split(':'); bindText(id,k);});
        const bindSelect = (id, fn) => { U.$('#'+id, side).onchange = (e) => { fn(e.target.value); S.persist(); drawTilesOnly(); }; };
        bindSelect('pfCam', v=>pn.camera=v);
        bindSelect('pfExpr', v=>pn.expression=v);
        bindSelect('pfBtype', v=>pn.bubble.type=v);
        bindSelect('pfFilter', v=>pn.filter=v);
        U.$('#pfFs', side).onchange = (e) => { pn.bubble.fontSize=+e.target.value; S.persist(); drawTilesOnly(); };
        U.$('#pfX', side).oninput = (e) => { pn.bubble.x=+e.target.value/100; U.$('#pfXv',side).textContent=e.target.value+'%'; place(); };
        U.$('#pfY', side).oninput = (e) => { pn.bubble.y=+e.target.value/100; U.$('#pfYv',side).textContent=e.target.value+'%'; place(); };
        U.$('#pfX', side).onchange = () => { S.persist(); drawTilesOnly(); };
        U.$('#pfY', side).onchange = () => { S.persist(); drawTilesOnly(); };
        U.$('#pfRegen', side).onclick = () => { S.snapshot(); pn.seed = Math.floor(Math.random()*99999); S.persist(); draw(); U.toast('Panel regenerated', 'success'); };
        U.$('#pfUpload', side).onclick = () => U.$('#pfFile', side).click();
        U.$('#pfFile', side).onchange = async (e) => {
          const f = e.target.files[0]; if (!f) return;
          const raw = await U.readFileAsDataURL(f);
          const im = await U.loadImage(raw);
          const c = document.createElement('canvas'); const sc = Math.min(1, 1000/Math.max(im.width,im.height));
          c.width=Math.round(im.width*sc); c.height=Math.round(im.height*sc);
          c.getContext('2d').drawImage(im,0,0,c.width,c.height);
          S.snapshot(); pn.image=c.toDataURL('image/jpeg',.86); pn.customImage=true; S.persist();
          await A.preload(pn.image); draw(); U.toast('Custom artwork applied', 'success');
        };
        const clr = U.$('#pfClear', side); if (clr) clr.onclick = () => { pn.customImage=false; pn.image=null; S.persist(); draw(); };
      };

      const drawTilesOnly = () => {
        const pg=p.pages[pi], grid=U.$('#edGrid', root); if(!grid) return;
        const chars=p.characterIds.map(id=>S.get().characters.find(c=>c.id===id)).filter(Boolean);
        U.$$('.panel-tile', grid).forEach((tile,i) => {
          const pn=pg.panels[i]; if(!pn) return;
          const c=A.renderPanel(pn,{width:360,height:240,style:S.styleById(p.style),characters:chars,filter:pn.filter,watermark:S.settings().watermark});
          c.style.width='100%'; c.style.height='100%';
          tile.querySelectorAll('canvas').forEach(x=>x.remove()); tile.insertBefore(c,tile.firstChild);
        });
        const thumbs=U.$$('[data-thumb]',root);
        if(thumbs[pi]){ thumbs[pi].innerHTML=''; const c=A.renderPanel(p.pages[pi].panels[0],{width:180,height:120,style:S.styleById(p.style),number:false}); c.style.width='100%'; c.style.height='66px'; thumbs[pi].appendChild(c); }
      };

      U.$('#edProject', root).onchange = (e) => { S.setActive(e.target.value); pi=0; pid=S.activeProject().pages[0].panels[0].id; draw(); };
      U.$('#edUndo', root).onclick = () => { if (S.undo()) draw(); };
      U.$('#edRedo', root).onclick = () => { if (S.redo()) draw(); };
      U.$('#edAdd', root).onclick = () => { S.snapshot(); const pg=p.pages[pi]; pg.panels.push(S.makePanel(pg.panels.length+1, Math.floor(Math.random()*99999), { dialogue:'New dialogue…', scene:'A new scene unfolds.' })); S.persist(); draw(); };
      U.$('#edDup', root).onclick = () => { S.snapshot(); const pg=p.pages[pi], src=getPanel(), cp=U.clone(src); cp.id=U.uid('panel'); cp.num=pg.panels.length+1; pg.panels.push(cp); pid=cp.id; S.persist(); draw(); };
      U.$('#edDel', root).onclick = () => { const pg=p.pages[pi]; if(pg.panels.length<=1){U.toast('A page needs at least one panel','warn');return;} S.snapshot(); pg.panels=pg.panels.filter(x=>x.id!==pid); pid=pg.panels[0].id; S.persist(); draw(); };
      const move = (dir) => { const pg=p.pages[pi], i=pg.panels.findIndex(x=>x.id===pid); const j=i+dir; if(j<0||j>=pg.panels.length)return; S.snapshot(); const t=pg.panels[i]; pg.panels[i]=pg.panels[j]; pg.panels[j]=t; pg.panels.forEach((x,k)=>x.num=k+1); S.persist(); draw(); };
      U.$('#edLeft', root).onclick = () => move(-1);
      U.$('#edRight', root).onclick = () => move(1);
      U.$('#edRegenPage', root).onclick = () => { S.snapshot(); const story=A.generateStory(p,{salt:String(Math.random())}); p.pages[pi]=story.pages[0]; p.pages[pi].index=pi; pid=p.pages[pi].panels[0].id; S.persist(); draw(); U.toast('Page regenerated', 'success'); };
      U.$('#edAddPage', root).onclick = () => { S.snapshot(); const pg=S.makePage(p.pages.length,p.panelsPerPage,p); p.pages.push(pg); pi=p.pages.length-1; pid=pg.panels[0].id; S.persist(); draw(); };
      U.$('#edDelPage', root).onclick = () => { if(p.pages.length<=1){U.toast('A comic needs at least one page','warn');return;} S.snapshot(); p.pages.splice(pi,1); pi=Math.min(pi,p.pages.length-1); pid=p.pages[pi].panels[0].id; S.persist(); draw(); };
      U.$('#edStyle', root).onchange = (e) => { S.snapshot(); p.style=e.target.value; S.saveProject(p); draw(); };
      U.$('#edLayout', root).onchange = (e) => { S.snapshot(); p.layout=e.target.value; S.saveProject(p); draw(); };
      U.$('#edExport', root).onclick = () => window.go('export');
      draw();
    }
  };
})(window.ACB_VIEWS);
