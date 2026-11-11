/* ============================================================
   Create Studio — Quick / Customize / Advanced 8-step wizard
   Design and Developed by Mr.Busy
   ============================================================ */
(function (V) {
  const U = window.ACB_U, D = window.ACB_DATA, S = window.ACB_STORE, A = window.ACB_ART;

  const STEPS = ['Comic Info','Enhance Idea','Characters','Style & Layout','Preview','Generate','Script Review','Render & Finish'];
  let mode = 'quick', step = 1, draft = null, generated = null;

  function blank() {
    return { title:'', idea:'', enhanced:'', genre:'Adventure', tone:'Lighthearted', audience:'All Ages', language:'en',
      style:'auto', layout:'auto', columns:3, pages:1, panelsPerPage:6, series:'', tags:[],
      characterIds:[], starring:'', camera:'Auto', bubbleType:'Speech', gutter:12, aspect:'Portrait', status:'draft' };
  }
  function setDraft(o) { draft = Object.assign(blank(), o || {}); generated = null; step = 1; }
  function getDraft() { if (!draft) draft = blank(); return draft; }
  V.create = { title:'Create Studio', crumb:'Workspace', setDraft, getDraft,
    setMode(m) { mode = m; step = 1; generated = null; } };

  function opt(list, val) { return list.map(x => '<option value="' + U.esc(x) + '"' + (x === val ? ' selected' : '') + '>' + U.esc(x) + '</option>').join(''); }
  function styleOptions(val) {
    return '<option value="auto"' + (val === 'auto' ? ' selected' : '') + '>✨ AI Decides (smart match)</option>' +
      S.allStyles().map(s => '<option value="' + s.id + '"' + (s.id === val ? ' selected' : '') + '>' + s.emoji + ' ' + U.esc(s.name) + (s.custom ? ' (custom)' : '') + '</option>').join('');
  }
  function layoutOptions(val) {
    return D.LAYOUTS.map(l => '<option value="' + l.id + '"' + (l.id === val ? ' selected' : '') + '>' + l.emoji + ' ' + U.esc(l.name) + ' · ' + l.count + ' panels' + (l.new ? ' (new)' : '') + '</option>').join('');
  }
  function pageOptions(val, max = 50) { let s = ''; for (let i=1;i<=max;i++) s += '<option value="'+i+'"'+(i===val?' selected':'')+'>'+i+' Page'+(i>1?'s':'')+'</option>'; return s; }
  function panelOptions(val) { let s=''; for (let i=1;i<=24;i++) s += '<option value="'+i+'"'+(i===val?' selected':'')+'>'+i+' panels / page</option>'; return s; }
  function charOptions(val) {
    return '<option value="">— None —</option>' + S.get().characters.map(c =>
      '<option value="'+c.id+'"'+(c.id===val?' selected':'')+'>'+U.esc(c.name)+' · '+U.esc(c.role)+'</option>').join('');
  }
  function styleTile(s, sel) {
    const grad = 'linear-gradient(135deg,' + s.colors[0] + ',' + s.colors[1] + ' 55%,' + s.colors[2] + ')';
    return '<button class="choice' + (sel?' selected':'') + '" data-style="'+s.id+'"><div class="style-swatch" style="background:'+grad+'"></div>' +
      '<span class="c-name">'+s.emoji+' '+U.esc(s.name)+'</span><span class="c-desc">'+U.esc(U.trunc(s.desc,42))+'</span>' +
      (s.new ? '<span class="chip accent" style="margin-top:6px">NEW</span>' : '') + '</button>';
  }
  function layoutTile(l, sel) {
    return '<button class="choice' + (sel?' selected':'') + '" data-layout="'+l.id+'"><span class="c-emoji">'+l.emoji+'</span>' +
      '<span class="c-name">'+U.esc(l.name)+'</span><span class="c-desc">'+U.esc(U.trunc(l.desc,38))+'</span></button>';
  }
  function progressHTML(label) {
    return '<div class="info-banner mb16"><span class="ib-icon">⚡</span><div><b>No credits. No quota. No watermark.</b> Rendering uses the built-in offline engine — unlimited generations, 1×–3× quality.</div></div>' +
      '<div style="text-align:center;padding:12px 0"><div style="font-size:15px;font-weight:700" id="genLabel">'+label+'</div>' +
      '<div class="gen-stages" id="genStages">' +
      [['📝','Story Outline'],['💬','Script & Dialogue'],['🎨','Sketching Panels'],['✨','Final HD Render']].map((s,i) =>
        '<div class="gen-stage" data-stage="'+i+'"><span class="gs-icon">'+s[0]+'</span><div class="gs-label">'+s[1]+'</div></div>').join('') + '</div>' +
      '<div class="progress-track"><div class="progress-fill" id="genFill" style="width:0%"></div></div>' +
      '<div class="small muted mt8" id="genPct">0% · starting…</div></div>';
  }

  /* ---------------- generation ---------------- */
  async function runGenerate(d, container, onDone) {
    let pct = 0;
    const fill = () => U.$('#genFill', container), pctl = () => U.$('#genPct', container);
    const timer = setInterval(() => {
      pct = Math.min(92, pct + 3 + Math.random() * 6);
      if (fill()) fill().style.width = pct + '%';
      if (pctl()) pctl().textContent = Math.round(pct) + '% · ' + (pct < 30 ? 'outlining the story' : pct < 55 ? 'writing dialogue' : pct < 80 ? 'sketching panels' : 'rendering artwork');
      U.$$('#genStages .gen-stage', container).forEach((el, i) => {
        el.classList.toggle('on', pct >= i*24 && pct < (i+1)*24);
        el.classList.toggle('done', pct >= (i+1)*24);
      });
    }, 130);
    let story;
    try {
      const api = S.settings().api || {};
      if (api.endpoint && api.key) {
        try {
          const remote = await A.generateStoryRemote(d);
          story = A.generateStory(d, { salt: 'remote' });
          if (remote.panels && remote.panels.length) {
            story.pages[0].panels.forEach((pn, i) => Object.assign(pn, remote.panels[i % remote.panels.length] || {}));
          }
          if (remote.enhanced) story.enhanced = remote.enhanced;
        } catch (err) { U.toast('AI endpoint failed — used offline engine: ' + err.message, 'warn', 5000); story = A.generateStory(d); }
      } else story = A.generateStory(d);
      await new Promise(r => setTimeout(r, 700));
    } catch (e) { story = A.generateStory(d); }
    clearInterval(timer);
    if (fill()) fill().style.width = '100%';
    if (pctl()) pctl().textContent = '100% · complete';
    U.$$('#genStages .gen-stage', container).forEach(el => { el.classList.remove('on'); el.classList.add('done'); });

    const style = d.style === 'auto' ? autoStyle(d) : d.style;
    const layout = d.layout === 'auto' ? autoLayout(d) : d.layout;
    const p = S.makeProject({
      title: d.title || 'Untitled Comic', idea: d.idea, enhanced: story.enhanced,
      genre: d.genre, tone: d.tone, audience: d.audience, language: d.language,
      style, layout, columns: d.columns, panelsPerPage: d.panelsPerPage,
      characterIds: d.characterIds.slice(), series: d.series,
      tags: d.tags.slice(), status: 'draft', pages: story.pages
    });
    S.get().projects.unshift(p);
    S.setActive(p.id);
    S.persist();
    window.refreshSidebar();
    generated = p;
    setTimeout(() => onDone && onDone(p), 380);
  }
  function autoStyle(d) {
    const t = (d.idea + ' ' + d.genre + ' ' + d.tone).toLowerCase();
    if (/cyber|neon|robot|future|space|sci/.test(t)) return 'cyberpunk';
    if (/manga|japan|samurai|shonen|blade/.test(t)) return 'manga';
    if (/ghost|mystery|detective|noir|crime/.test(t)) return 'noir';
    if (/dragon|wizard|magic|fantasy|fairy/.test(t)) return 'fantasy';
    if (/cat|funny|comedy|joke|silly|school/.test(t)) return 'cartoon';
    if (/coffee|cozy|quiet|memory|gentle/.test(t)) return 'watercolor';
    if (/webtoon|romance|vertical|korean/.test(t)) return 'webtoon';
    return 'american-comic';
  }
  function autoLayout(d) {
    const t = (d.idea + ' ' + d.genre).toLowerCase();
    if (/webtoon|vertical|scroll|manhwa/.test(t)) return 'webtoon';
    if (/joke|strip|funny|meme|comedy/.test(t)) return 'comic-strip';
    if (/manga|shonen/.test(t)) return 'manga-page';
    if (/book|children|kids|story/.test(t)) return 'story-book';
    return 'manga-page';
  }

  /* ---------------- render ---------------- */
  V.create.render = function () {
    const d = getDraft();
    let body = '';
    if (mode === 'quick') body = quickHTML(d);
    else if (mode === 'customize') body = customHTML(d);
    else body = advancedHTML(d);

    return V.head('Create Studio', 'Three ways to create. Every original limit is gone: unlimited pages, panels, styles and generations.') +
      '<div class="wizard-modes"><div class="segmented" id="czMode">' +
        '<button data-mode="quick" class="' + (mode==='quick'?'active':'') + '">✨ Quick Create</button>' +
        '<button data-mode="customize" class="' + (mode==='customize'?'active':'') + '">🛠️ Customize</button>' +
        '<button data-mode="advanced" class="' + (mode==='advanced'?'active':'') + '">⚙️ Advanced (8 steps)</button>' +
      '</div></div>' + body;
  };

  function quickHTML(d) {
    return '<div class="wizard-card"><div class="wz-step-label">QUICK CREATE</div><h2>Create Your Comic</h2>' +
      '<p class="wz-desc">Just type an idea, and the studio handles the rest — story, characters, layout, style and full artwork.</p>' +
      '<div class="field"><label>Core Idea</label><textarea class="textarea" id="qIdea" placeholder="A dragon who opens a bakery but keeps accidentally setting the bread on fire…">' + U.esc(d.idea) + '</textarea>' +
        '<div class="hint">Or click a story starter below.</div></div>' +
      '<div class="row wrap mb16">' + D.PROMPTS.slice(0,6).map((p,i) => '<button class="chip" data-quickprompt="'+i+'">'+p.emoji+' '+U.esc(p.title)+'</button>').join('') +
        '<button class="chip accent" id="qSurprise">🎲 Surprise Me</button></div>' +
      '<div class="grid grid-3">' +
        '<div class="field"><label>👤 Starring Character (optional)</label><select class="select" id="qChar">'+charOptions(d.starring)+'</select></div>' +
        '<div class="field"><label>📄 Comic Length</label><select class="select" id="qPages">'+pageOptions(d.pages)+'</select></div>' +
        '<div class="field"><label>🖼️ Panels per page</label><select class="select" id="qPanels">'+panelOptions(d.panelsPerPage)+'</select></div>' +
      '</div>' +
      '<div class="info-banner mb16"><span class="ib-icon">✦</span><div><b>Smart auto mode:</b> layout <b>Auto Smart</b> and style <b>AI Decides</b> are chosen from your idea. Change them in Customize or Advanced.</div></div>' +
      '<div class="row wrap" style="padding:12px 14px;border:1px solid var(--border-soft);border-radius:11px;background:var(--surface-2)">' +
        '<span class="small">📐 Layout: <b>Auto Smart</b></span><span class="small">🎨 Style: <b>AI Decides</b></span>' +
        '<span class="small">📄 Pages: <b id="qShowPages">'+d.pages+'</b></span><span class="small">💳 Cost: <b style="color:var(--green)">0 credits · Unlimited</b></span></div>' +
      '<div id="qProgress" class="mt16"></div>' +
      '<div class="wz-footer"><span class="small muted">No account. No credits. No watermark.</span>' +
        '<button class="btn btn-primary btn-lg" id="qGenerate">✨ Generate Comic — Free &amp; Unlimited</button></div></div>';
  }

  function customHTML(d) {
    return '<div class="wizard-card"><div class="wz-step-label">CUSTOMIZE</div><h2>Customize Your Comic</h2>' +
      '<p class="wz-desc">Tweak the layout, style, audience and every creative option to fit your exact vision.</p>' +
      '<div class="grid grid-2">' +
        '<div class="field"><label>Comic Title</label><input class="input" id="cTitle" value="'+U.esc(d.title)+'" placeholder="My Amazing Comic" maxlength="100"></div>' +
        '<div class="field"><label>Series / Chapter group</label><input class="input" id="cSeries" value="'+U.esc(d.series)+'" placeholder="e.g. Season 1"></div>' +
      '</div>' +
      '<div class="field"><label>Core Idea</label><textarea class="textarea" id="cIdea" placeholder="Describe your story…">'+U.esc(d.idea)+'</textarea></div>' +
      '<div class="grid grid-4">' +
        '<div class="field"><label>Genre</label><select class="select" id="cGenre">'+opt(D.GENRES,d.genre)+'</select></div>' +
        '<div class="field"><label>Tone</label><select class="select" id="cTone">'+opt(D.TONES,d.tone)+'</select></div>' +
        '<div class="field"><label>Audience</label><select class="select" id="cAudience">'+opt(D.AUDIENCES,d.audience)+'</select></div>' +
        '<div class="field"><label>Language</label><select class="select" id="cLang">'+D.LANGUAGES.map(l=>'<option value="'+l.id+'"'+(l.id===d.language?' selected':'')+'>'+l.name+'</option>').join('')+'</select></div>' +
      '</div><div class="divider"></div>' +
      '<div class="grid grid-2">' +
        '<div class="field"><label>🎨 Art Style — all '+S.allStyles().length+' unlocked</label><select class="select" id="cStyle">'+styleOptions(d.style)+'</select></div>' +
        '<div class="field"><label>📐 Layout — all '+D.LAYOUTS.length+' unlocked</label><select class="select" id="cLayout">'+layoutOptions(d.layout)+'</select></div>' +
      '</div>' +
      '<div class="grid grid-4">' +
        '<div class="field"><label>Pages (1–50)</label><select class="select" id="cPages">'+pageOptions(d.pages)+'</select></div>' +
        '<div class="field"><label>Panels / page (1–24)</label><select class="select" id="cPanels">'+panelOptions(d.panelsPerPage)+'</select></div>' +
        '<div class="field"><label>Columns (custom canvas)</label><input class="input" type="number" id="cCols" min="1" max="6" value="'+d.columns+'"></div>' +
        '<div class="field"><label>Gutter (px)</label><input class="input" type="number" id="cGutter" min="0" max="40" value="'+d.gutter+'"></div>' +
      '</div>' +
      '<div class="grid grid-3">' +
        '<div class="field"><label>👤 Starring Character</label><select class="select" id="cChar">'+charOptions(d.starring)+'</select></div>' +
        '<div class="field"><label>🎥 Camera preference</label><select class="select" id="cCamera">'+opt(['Auto'].concat(D.CAMERAS),d.camera)+'</select></div>' +
        '<div class="field"><label>💬 Default bubble</label><select class="select" id="cBubble">'+opt(D.BUBBLE_TYPES,d.bubbleType)+'</select></div>' +
      '</div>' +
      '<div class="info-banner mb16"><span class="ib-icon">∞</span><div><b>Unlimited edition:</b> up to 50 pages × 24 panels, '+S.allStyles().length+' styles, no credit cost, no watermark, full commercial rights.</div></div>' +
      '<div id="qProgress" class="mt16"></div>' +
      '<div class="wz-footer"><button class="btn" id="cToAdvanced">⚙️ Open 8-step wizard</button><button class="btn btn-primary btn-lg" id="cGenerate">✨ Generate Comic</button></div></div>';
  }

  function advancedHTML(d) {
    const stepper = '<div class="stepper">' + STEPS.map((s,i) =>
      '<div class="stepper-item '+(i+1<step?'completed':i+1===step?'active':'')+'"><div class="stepper-num">'+(i+1<step?'✓':i+1)+'</div><div class="stepper-label">'+s+'</div></div>' +
      (i<STEPS.length-1 ? '<div class="stepper-line"></div>' : '')).join('') + '</div>';
    return stepper + '<div class="wizard-card"><div class="wz-step-label">STEP '+step+' OF 8 · '+STEPS[step-1].toUpperCase()+'</div>' + stepHTML(d) + '</div>';
  }

  function stepHTML(d) {
    switch (step) {
      case 1: return '<h2>Comic Info</h2><p class="wz-desc">Start with the basics. Original site: max 8 pages — here you can go up to 50.</p>' +
        '<div class="grid grid-2"><div class="field"><label>Comic Title *</label><input class="input" id="aTitle" value="'+U.esc(d.title)+'" placeholder="The Time-Traveling Hamster"></div>' +
        '<div class="field"><label>Series / Chapter</label><input class="input" id="aSeries" value="'+U.esc(d.series)+'" placeholder="Demo Stories"></div></div>' +
        '<div class="field"><label>Core Idea *</label><textarea class="textarea" id="aIdea" placeholder="A detective cat solves mysteries in a cyberpunk city…">'+U.esc(d.idea)+'</textarea>' +
        '<div class="hint">Tip: include a place, a character and a problem for a stronger script.</div></div>' +
        '<div class="grid grid-4">' +
          '<div class="field"><label>Genre</label><select class="select" id="aGenre">'+opt(D.GENRES,d.genre)+'</select></div>' +
          '<div class="field"><label>Tone</label><select class="select" id="aTone">'+opt(D.TONES,d.tone)+'</select></div>' +
          '<div class="field"><label>Audience</label><select class="select" id="aAudience">'+opt(D.AUDIENCES,d.audience)+'</select></div>' +
          '<div class="field"><label>Language</label><select class="select" id="aLang">'+D.LANGUAGES.map(l=>'<option value="'+l.id+'"'+(l.id===d.language?' selected':'')+'>'+l.name+'</option>').join('')+'</select></div></div>' +
        '<div class="grid grid-3">' +
          '<div class="field"><label>Pages (1–50)</label><select class="select" id="aPages">'+pageOptions(d.pages)+'</select></div>' +
          '<div class="field"><label>Panels / page (1–24)</label><select class="select" id="aPanels">'+panelOptions(d.panelsPerPage)+'</select></div>' +
          '<div class="field"><label>Tags (comma separated)</label><input class="input" id="aTags" value="'+U.esc(d.tags.join(', '))+'" placeholder="sci-fi, comedy"></div></div>' +
        wzFooter(1);
      case 2: return '<h2>Enhance Idea</h2><p class="wz-desc">Expand the premise into a rich synopsis. The offline story engine writes it locally; an optional AI endpoint can be configured in Settings.</p>' +
        '<div class="field"><label>Original premise</label><div class="card pad-sm small">'+U.esc(d.idea || 'No idea entered yet.')+'</div></div>' +
        '<div class="field"><label>Enhanced synopsis (editable)</label><textarea class="textarea" id="aEnhanced" style="min-height:150px" placeholder="Click ✨ Enhance Idea to expand it…">'+U.esc(d.enhanced)+'</textarea></div>' +
        '<div class="row wrap"><button class="btn btn-outline" id="aEnhance">✨ Enhance Idea</button><button class="btn" id="aRewrite">🔁 Rewrite differently</button>' +
        '<span class="small muted">No credits consumed · unlimited rewrites</span></div>' + wzFooter(2);
      case 3: {
        const assigned = d.characterIds.map(id => S.get().characters.find(c => c.id===id)).filter(Boolean);
        return '<h2>Choose Characters</h2><p class="wz-desc">Assign Heroes, Villains and Supporting roles. Unlimited profiles — the original site capped this at 10 on Free.</p>' +
          '<div class="field"><label>Search your library</label><input class="input" id="aCharSearch" placeholder="Search by name or category…"></div>' +
          '<div class="row-between mb8"><b class="small">Assigned ('+assigned.length+')</b><button class="text-link" id="aNewChar">＋ Create new character</button></div>' +
          '<div class="row wrap mb16" id="aAssigned">' + (assigned.length ? assigned.map(c =>
            '<span class="chip accent">'+U.esc(c.name)+' <button class="icon-btn" style="width:18px;height:18px;border:0;background:none" data-unassign="'+c.id+'">✕</button></span>').join('') : '<span class="small muted">No characters assigned — the engine will design consistent ones automatically.</span>') + '</div>' +
          '<div class="choice-grid cols-4" id="aCharGrid">' + S.get().characters.map(c =>
            '<button class="choice'+(d.characterIds.includes(c.id)?' selected':'')+'" data-assign="'+c.id+'" data-name="'+U.esc(c.name.toLowerCase())+'">' +
            '<span class="c-emoji" style="color:'+U.esc(c.color)+'">♟</span><span class="c-name">'+U.esc(c.name)+'</span><span class="c-desc">'+U.esc(c.role)+' · '+U.esc(U.trunc(c.category,18))+'</span></button>').join('') + '</div>' +
          '<div class="info-banner mt16"><span class="ib-icon">🎭</span><div>Roles: '+D.FEATURED_CHARACTERS.slice(0,3).map(c=>U.esc(c.name)).join(', ')+' and more. Character colour + hair profiles are reused in every panel for consistency.</div></div>' + wzFooter(3);
      }
      case 4: return '<h2>Style &amp; Layout</h2><p class="wz-desc">All '+S.allStyles().length+' styles and '+D.LAYOUTS.length+' layouts unlocked. The original gate was 7 styles on Free.</p>' +
        '<div class="row-between mb8"><b class="small">🎨 Art style</b><span class="small muted">'+S.allStyles().length+' available · '+S.get().customStyles.length+' custom</span></div>' +
        '<div class="choice-grid cols-5 mb16" id="aStyleGrid">' + styleTile({id:'auto',name:'AI Decides',emoji:'✨',desc:'Smart match from idea',colors:['#8b6cff','#ff8ac4','#1b2030'],new:false}, d.style==='auto') +
          S.allStyles().map(s => styleTile(s, d.style===s.id)).join('') + '</div>' +
        '<div class="row-between mb8"><b class="small">📐 Layout</b><span class="small muted">'+D.LAYOUTS.length+' presets · Custom Canvas included</span></div>' +
        '<div class="choice-grid cols-5 mb16" id="aLayoutGrid">' + D.LAYOUTS.map(l => layoutTile(l, d.layout===l.id)).join('') + '</div>' +
        '<div class="grid grid-3">' +
          '<div class="field"><label>Panels per page (1–24)</label><select class="select" id="aPanels2">'+panelOptions(d.panelsPerPage)+'</select></div>' +
          '<div class="field"><label>Columns (Custom Canvas)</label><input class="input" type="number" min="1" max="6" id="aCols" value="'+d.columns+'"></div>' +
          '<div class="field"><label>Gutter (px)</label><input class="input" type="number" min="0" max="40" id="aGutter" value="'+d.gutter+'"></div></div>' + wzFooter(4);
      case 5: {
        const st = S.styleById(d.style === 'auto' ? 'american-comic' : d.style);
        const ly = S.layoutById(d.layout === 'auto' ? 'manga-page' : d.layout);
        return '<h2>Preview Story</h2><p class="wz-desc">Review the whole plan before generating. Everything stays editable afterwards in the Comic Editor.</p>' +
          '<div class="card"><table class="table"><tbody>' +
          '<tr><td style="width:180px">Title</td><td><b>'+U.esc(d.title || 'Untitled Comic')+'</b></td></tr>' +
          '<tr><td>Series</td><td>'+U.esc(d.series || '—')+'</td></tr>' +
          '<tr><td>Core idea</td><td>'+U.esc(U.trunc(d.idea, 160) || '—')+'</td></tr>' +
          '<tr><td>Enhanced story</td><td>'+U.esc(U.trunc(d.enhanced, 160) || 'Not enhanced yet — will be generated automatically')+'</td></tr>' +
          '<tr><td>Genre / Tone / Audience</td><td>'+U.esc(d.genre)+' · '+U.esc(d.tone)+' · '+U.esc(d.audience)+'</td></tr>' +
          '<tr><td>Language</td><td>'+U.esc((D.LANGUAGES.find(l=>l.id===d.language)||{}).name || 'English')+'</td></tr>' +
          '<tr><td>Style</td><td>'+st.emoji+' '+U.esc(d.style==='auto' ? 'AI Decides → '+autoStyle(d) : st.name)+'</td></tr>' +
          '<tr><td>Layout</td><td>'+ly.emoji+' '+U.esc(d.layout==='auto' ? 'Auto Smart → '+autoLayout(d) : ly.name)+'</td></tr>' +
          '<tr><td>Length</td><td><b>'+d.pages+'</b> page(s) × <b>'+d.panelsPerPage+'</b> panels = <b>'+(d.pages*d.panelsPerPage)+'</b> panels</td></tr>' +
          '<tr><td>Characters</td><td>'+(d.characterIds.length ? U.esc(d.characterIds.map(id=>(S.get().characters.find(c=>c.id===id)||{}).name).filter(Boolean).join(', ')) : 'Auto-designed by the story engine')+'</td></tr>' +
          '<tr><td>Cost</td><td class="now" style="color:var(--green);font-weight:700">0 credits · Unlimited Edition</td></tr>' +
          '</tbody></table></div>' +
          '<div class="info-banner mt16"><span class="ib-icon">🔒</span><div>Private by default. Your comic is saved only on this computer — no community upload, no account, no watermark, full commercial rights.</div></div>' + wzFooter(5);
      }
      case 6: return '<h2>Generate Story &amp; Storyboard</h2><p class="wz-desc">The 4-stage engine mirrors the original workflow — Story Outline → Script &amp; Dialogue → Sketching Panels → Final HD Render.</p>' +
        '<div id="qProgress">'+progressHTML('Ready to generate')+'</div>' + wzFooter(6, true);
      case 7: {
        const p = generated;
        if (!p) return '<h2>Script Review</h2><p class="wz-desc">Generate the story first.</p>' + wzFooter(7);
        const panels = p.pages[0].panels;
        return '<h2>Review Sketch &amp; Dialogue</h2><p class="wz-desc">Rewrite any line, change camera or expression, or regenerate the entire script. Showing page 1 — all pages are editable in the Comic Editor.</p>' +
          '<div class="row mb12"><button class="btn btn-sm" id="aImprove">✨ Improve dialogue</button><button class="btn btn-sm" id="aRegen">🔁 Regenerate script</button>' +
          '<span class="small muted" id="aScriptInfo">'+p.pages.length+' page(s), '+p.pages.reduce((a,x)=>a+x.panels.length,0)+' panels total</span></div>' +
          '<div id="aScriptRows" style="max-height:430px;overflow-y:auto;padding-right:6px">' + panels.map((pn,i) =>
            '<div class="panel-script-row"><div class="psr-num">'+(i+1)+'</div><div class="psr-fields">' +
            '<input class="input" data-pf="dialogue" data-i="'+i+'" value="'+U.esc(pn.dialogue)+'" placeholder="Dialogue">' +
            '<input class="input" data-pf="caption" data-i="'+i+'" value="'+U.esc(pn.caption)+'" placeholder="Caption">' +
            '<input class="input" data-pf="sfx" data-i="'+i+'" value="'+U.esc(pn.sfx)+'" placeholder="SFX">' +
            '<select class="select" data-pf="camera" data-i="'+i+'">'+opt(D.CAMERAS, pn.camera)+'</select>' +
            '<textarea class="textarea" data-pf="scene" data-i="'+i+'" placeholder="Scene" style="grid-column:1/-1;min-height:44px">'+U.esc(pn.scene)+'</textarea>' +
            '</div></div>').join('') + '</div>' + wzFooter(7);
      }
      case 8: {
        const p = generated;
        if (!p) return '<h2>Render &amp; Finish</h2><p class="wz-desc">Generate the story first.</p>' + wzFooter(8);
        return '<h2>🎉 Render Complete</h2><p class="wz-desc">Your comic is fully rendered and saved locally. Every original paywall feature is available.</p>' +
          '<div class="grid grid-2 mb16"><div class="card"><div class="st-label">COMIC</div><h3 style="margin:6px 0">'+U.esc(p.title)+'</h3>' +
          '<div class="small muted">'+p.pages.length+' pages · '+p.pages.reduce((a,x)=>a+x.panels.length,0)+' panels · '+U.esc(S.styleById(p.style).name)+'</div></div>' +
          '<div class="card"><div class="st-label">RIGHTS &amp; PRIVACY</div><div class="mt8"><span class="chip green">✓ No watermark</span> <span class="chip green">✓ Commercial rights</span> <span class="chip green">✓ Private</span> <span class="chip green">✓ Unlimited exports</span></div></div></div>' +
          '<div id="aCover" style="text-align:center;margin-bottom:16px"></div>' +
          '<div class="row wrap"><button class="btn btn-primary" id="aOpenEditor">✎ Open Comic Editor</button>' +
          '<button class="btn" id="aOpenReader">▤ Read Comic</button><button class="btn" id="aExport">↥ Export Center</button>' +
          '<button class="btn btn-outline" id="aPublish">🚀 Mark as Published (local)</button>' +
          '<button class="btn btn-ghost" id="aAnother">＋ Create another</button></div>' + wzFooter(8);
      }
    }
    return '';
  }
  function wzFooter(s, generating) {
    if (generating) return '<div class="wz-footer"><button class="btn" id="wzBack">‹ Back</button>' +
      '<div><button class="btn btn-primary btn-lg" id="wzGen">⚡ Generate Story &amp; Panels</button></div></div>';
    let right = '';
    if (s === 6) right = '<button class="btn btn-primary" id="wzNext">Review script →</button>';
    else if (s === 7) right = '<button class="btn btn-primary" id="wzNext">Finish →</button>';
    else if (s === 8) right = '<button class="btn" id="wzToEditor">✎ Open Editor</button>';
    else right = '<button class="btn btn-primary" id="wzNext">Next →</button>';
    return '<div class="wz-footer"><button class="btn" id="wzBack">‹ Back</button><div class="row"><span class="small muted">Step '+s+' / 8</span>'+right+'</div></div>';
  }

  /* ---------------- collect ---------------- */
  function collect(root) {
    const g = id => U.$('#'+id, root);
    const d = getDraft();
    if (mode === 'quick') {
      if (g('qIdea')) d.idea = g('qIdea').value;
      if (g('qChar')) d.starring = g('qChar').value;
      if (g('qPages')) d.pages = +g('qPages').value;
      if (g('qPanels')) d.panelsPerPage = +g('qPanels').value;
      d.style = 'auto'; d.layout = 'auto';
      d.characterIds = d.starring ? [d.starring] : [];
      d.title = d.title || (d.idea ? U.trunc(d.idea.replace(/[.!?].*/,''), 42) : 'My New Comic');
    } else if (mode === 'customize') {
      if (g('cTitle')) d.title = g('cTitle').value;
      if (g('cSeries')) d.series = g('cSeries').value;
      if (g('cIdea')) d.idea = g('cIdea').value;
      ['cGenre:cGenre','cTone:cTone','cAudience:cAudience','cLang:language','cStyle:style','cLayout:layout','cCamera:camera','cBubble:bubbleType'].forEach(m => {
        const [id,key] = m.split(':'); if (g(id)) d[key] = g(id).value;
      });
      if (g('cPages')) d.pages = +g('cPages').value;
      if (g('cPanels')) d.panelsPerPage = +g('cPanels').value;
      if (g('cCols')) d.columns = Math.max(1, Math.min(6, +g('cCols').value || 3));
      if (g('cGutter')) d.gutter = +g('cGutter').value;
      if (g('cChar')) d.starring = g('cChar').value;
      d.characterIds = d.starring ? [d.starring] : [];
    } else {
      const map = { 1: () => {
        if (g('aTitle')) d.title = g('aTitle').value;
        if (g('aSeries')) d.series = g('aSeries').value;
        if (g('aIdea')) d.idea = g('aIdea').value;
        if (g('aGenre')) d.genre = g('aGenre').value;
        if (g('aTone')) d.tone = g('aTone').value;
        if (g('aAudience')) d.audience = g('aAudience').value;
        if (g('aLang')) d.language = g('aLang').value;
        if (g('aPages')) d.pages = +g('aPages').value;
        if (g('aPanels')) d.panelsPerPage = +g('aPanels').value;
        if (g('aTags')) d.tags = g('aTags').value.split(',').map(s=>s.trim()).filter(Boolean);
      }, 2: () => { if (g('aEnhanced')) d.enhanced = g('aEnhanced').value; },
      4: () => { if (g('aPanels2')) d.panelsPerPage = +g('aPanels2').value; if (g('aCols')) d.columns = Math.max(1,Math.min(6,+g('aCols').value||3)); if (g('aGutter')) d.gutter = +g('aGutter').value; },
      7: () => { if (!generated) return; U.$$('[data-pf]', root).forEach(el => { const pn = generated.pages[0].panels[+el.dataset.i]; if (pn) pn[el.dataset.pf] = el.value; }); S.persist(); } };
      if (map[step]) map[step]();
    }
    return d;
  }

  /* ---------------- mount ---------------- */
  V.create.mount = function (root) {
    const d0 = getDraft();
    U.$$('#czMode button', root).forEach(b => b.onclick = () => { collect(root); mode = b.dataset.mode; step = 1; window.refresh(); });

    if (mode === 'quick') mountQuick(root);
    else if (mode === 'customize') mountCustom(root);
    else mountAdvanced(root);
  };

  function validate(d) {
    if (!String(d.idea || '').trim()) { U.toast('Please enter a core idea first.', 'warn'); return false; }
    return true;
  }
  function finishGeneration(p) {
    window.setStatus('Generated ' + p.pages.reduce((a,x)=>a+x.panels.length,0) + ' panels · unlimited');
    U.toast('Comic created: ' + p.title, 'success');
  }

  function mountQuick(root) {
    const d = getDraft();
    U.$$('[data-quickprompt]', root).forEach(b => b.onclick = () => {
      const pr = D.PROMPTS[+b.dataset.quickprompt];
      U.$('#qIdea', root).value = pr.idea; d.title = pr.title; d.idea = pr.idea; d.style = 'auto'; d.layout = 'auto';
      U.toast('Loaded "' + pr.title + '"', 'success');
    });
    U.$('#qSurprise', root).onclick = () => {
      const pr = U.pick(D.PROMPTS, Math.random);
      U.$('#qIdea', root).value = pr.idea; d.title = pr.title; d.idea = pr.idea;
      U.toast('🎲 ' + pr.title, 'success');
    };
    U.$('#qPages', root).onchange = (e) => { U.$('#qShowPages', root).textContent = e.target.value; };
    U.$('#qGenerate', root).onclick = () => {
      const d = collect(root); if (!validate(d)) return;
      d.style = 'auto'; d.layout = 'auto';
      const box = U.$('#qProgress', root); box.innerHTML = progressHTML('Crafting your comic…');
      U.$('#qGenerate', root).disabled = true;
      runGenerate(d, box, (p) => {
        U.$('#qGenerate', root).disabled = false;
        box.innerHTML = '<div class="info-banner"><span class="ib-icon">🎉</span><div><b>' + U.esc(p.title) + '</b> is ready — ' +
          p.pages.length + ' page(s), ' + p.pages.reduce((a,x)=>a+x.panels.length,0) + ' panels. ' +
          '<button class="text-link" id="qOpenEditor">Open in Comic Editor →</button></div></div>';
        U.$('#qOpenEditor', root).onclick = () => window.openEditor(p.id);
        finishGeneration(p);
      });
    };
  }

  function mountCustom(root) {
    U.$('#cToAdvanced', root).onclick = () => { collect(root); mode='advanced'; step=1; window.refresh(); };
    U.$('#cGenerate', root).onclick = () => {
      const d = collect(root); if (!validate(d)) return;
      if (!d.title) d.title = U.trunc(d.idea.replace(/[.!?].*/,''), 42) || 'My New Comic';
      const box = U.$('#qProgress', root); box.innerHTML = progressHTML('Rendering your custom comic…');
      U.$('#cGenerate', root).disabled = true;
      runGenerate(d, box, (p) => {
        U.$('#cGenerate', root).disabled = false;
        box.innerHTML = '<div class="info-banner"><span class="ib-icon">🎉</span><div><b>'+U.esc(p.title)+'</b> is ready. ' +
          '<button class="text-link" id="cOpenEditor">Open in Comic Editor →</button></div></div>';
        U.$('#cOpenEditor', root).onclick = () => window.openEditor(p.id);
        finishGeneration(p);
      });
    };
  }

  function mountAdvanced(root) {
    const d = getDraft();
    const back = U.$('#wzBack', root), next = U.$('#wzNext', root);
    if (back) back.onclick = () => { collect(root); if (step > 1) { step--; window.refresh(); } else window.go('dashboard'); };
    if (next) next.onclick = () => {
      const d = collect(root);
      if (step === 1 && !String(d.title).trim()) d.title = U.trunc(String(d.idea||'').replace(/[.!?].*/,''), 42) || 'Untitled Comic';
      if (step === 1 && !String(d.idea).trim()) { U.toast('Please enter a core idea.', 'warn'); return; }
      if (step === 6 && !generated) { U.toast('Generate the story first.', 'warn'); return; }
      if (step < 8) { step++; window.refresh(); }
      else window.openEditor(generated.id);
    };

    if (step === 2) {
      const enhance = (salt) => {
        const tmp = Object.assign({}, getDraft()); tmp.enhanced = '';
        const s = A.generateStory(tmp, { salt: salt || String(Date.now()) });
        U.$('#aEnhanced', root).value = s.enhanced; getDraft().enhanced = s.enhanced;
        U.toast('Synopsis enhanced locally', 'success');
      };
      U.$('#aEnhance', root).onclick = () => enhance();
      U.$('#aRewrite', root).onclick = () => enhance(String(Math.random()));
    }
    if (step === 3) {
      U.$('#aCharSearch', root).oninput = (e) => {
        const q = e.target.value.toLowerCase();
        U.$$('[data-assign]', root).forEach(b => b.style.display = b.dataset.name.includes(q) ? '' : 'none');
      };
      U.$$('[data-assign]', root).forEach(b => b.onclick = () => {
        const d = getDraft(), id = b.dataset.assign;
        d.characterIds = d.characterIds.includes(id) ? d.characterIds.filter(x=>x!==id) : d.characterIds.concat(id);
        window.refresh();
      });
      U.$$('[data-unassign]', root).forEach(b => b.onclick = () => { const d=getDraft(); d.characterIds = d.characterIds.filter(x=>x!==b.dataset.unassign); window.refresh(); });
      U.$('#aNewChar', root).onclick = () => window.createCharacter(() => window.refresh());
    }
    if (step === 4) {
      U.$$('#aStyleGrid [data-style]', root).forEach(b => b.onclick = () => { getDraft().style = b.dataset.style; window.refresh(); });
      U.$$('#aLayoutGrid [data-layout]', root).forEach(b => b.onclick = () => { getDraft().layout = b.dataset.layout; window.refresh(); });
    }
    if (step === 6) {
      const gen = U.$('#wzGen', root);
      if (gen) gen.onclick = () => {
        const d = collect(root);
        const box = U.$('#qProgress', root);
        box.innerHTML = progressHTML('Crafting your comic…');
        gen.disabled = true;
        runGenerate(d, box, (p) => { gen.disabled = false; step = 7; window.refresh(); finishGeneration(p); });
      };
    }
    if (step === 7 && generated) {
      U.$('#aImprove', root).onclick = () => {
        S.snapshot();
        const W = D.WORDS, r = U.rng(Date.now());
        generated.pages.forEach(pg => pg.panels.forEach(pn => { if (r() > .45) pn.dialogue = U.pick(W.lines, r); }));
        S.persist(); window.refresh(); U.toast('Dialogue improved across all pages', 'success');
      };
      U.$('#aRegen', root).onclick = () => {
        S.snapshot();
        const s = A.generateStory(generated, { salt: String(Math.random()) });
        generated.enhanced = s.enhanced; generated.pages = s.pages;
        S.setActive(generated.id); S.persist(); window.refresh(); U.toast('Fresh script generated', 'success');
      };
      U.$$('[data-pf]', root).forEach(el => el.onchange = () => { const pn = generated.pages[0].panels[+el.dataset.i]; if (pn) { pn[el.dataset.pf] = el.value; S.persist(); } });
    }
    if (step === 8 && generated) {
      const c = A.composePage(generated, 0, { quality: 1.1, pageWidth: 560, pageHeight: 740 });
      const im = document.createElement('img'); im.src = c.toDataURL('image/png');
      im.style.cssText = 'max-width:330px;border-radius:6px;box-shadow:var(--shadow);cursor:zoom-in';
      im.onclick = () => U.lightbox(im.src);
      U.$('#aCover', root).appendChild(im);
      U.$('#aOpenEditor', root).onclick = () => window.openEditor(generated.id);
      U.$('#aOpenReader', root).onclick = () => window.openReader(generated.id);
      U.$('#aExport', root).onclick = () => window.go('export');
      U.$('#aPublish', root).onclick = () => { generated.status = 'published'; S.persist(); U.toast('Marked as published (stored locally)', 'success'); };
      U.$('#aAnother', root).onclick = () => { setDraft(null); mode='quick'; step=1; window.refresh(); };
      U.$('#wzToEditor', root).onclick = () => window.openEditor(generated.id);
    }
  }
})(window.ACB_VIEWS);
