/* ============================================================
   Local project store — 100% offline, no account, no limits
   Design and Developed by Mr.Busy
   ============================================================ */
window.ACB_STORE = (function () {
  const U = window.ACB_U, D = window.ACB_DATA;
  const KEY = 'acb_studio_v2';
  let memoryOnly = false;

  const defaults = () => ({
    version: 2,
    settings: {
      theme: 'dark', accent: 'violet', language: 'en', autosave: true,
      quality: 2, watermark: false, defaultStyle: 'auto', defaultLayout: 'auto',
      defaultPages: 1, defaultPanels: 6, api: { endpoint: '', key: '', model: 'gpt-4o-mini' }
    },
    projects: [],
    characters: [],
    customStyles: [],
    activeProjectId: null,
    activePageIndex: 0,
    activePanelId: null,
    ui: { sidebarCollapsed: false }
  });

  let state = defaults();
  let history = [], future = [];

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        state = Object.assign(defaults(), parsed);
        state.settings = Object.assign(defaults().settings, parsed.settings || {});
        state.ui = Object.assign(defaults().ui, parsed.ui || {});
      }
    } catch (e) { memoryOnly = true; console.warn('Storage unavailable, using memory', e); }
    if (!state.projects.length && !state.characters.length) seed();
    return state;
  }

  function persist() {
    if (memoryOnly) return;
    try { localStorage.setItem(KEY, JSON.stringify(state)); }
    catch (e) { memoryOnly = true; U.toast('Local storage is full — export a JSON backup to keep your work.', 'warn', 6000); }
  }

  function get() { return state; }
  function settings() { return state.settings; }
  function setSetting(k, v) { state.settings[k] = v; persist(); }
  function setUI(k, v) { state.ui[k] = v; persist(); }

  /* ---------- demo seed ---------- */
  function seed() {
    const chars = D.FEATURED_CHARACTERS.slice(0, 6).map((c, i) => ({
      id: 'char-seed-' + i, name: c.name, category: c.cat, role: c.role,
      color: c.color, hair: c.hair, traits: c.traits, species: c.cat,
      eyes: '#2b2b3a', outfit: c.cat, personality: c.traits, notes: 'From the AIComicBuilder featured character gallery.',
      seed: 1000 + i * 137, createdAt: Date.now() - (8 - i) * 86400000
    }));
    state.characters = chars;

    const p = makeProject({
      title: 'The Time-Traveling Hamster',
      idea: 'A brilliant hamster inventor accidentally tears a hole in spacetime while calibrating a cosmic machine.',
      genre: 'Sci-Fi', tone: 'Whimsical', audience: 'All Ages', language: 'en',
      style: 'american-comic', layout: 'manga-page', columns: 2,
      pages: 1, panelsPerPage: 8, status: 'published', series: 'Demo Stories',
      tags: ['demo', 'sci-fi', 'time travel']
    });
    p.enhanced = 'Professor Pipsqueak has finally solved the geometry of the universe. One snack drop later, reality begins to unravel — and only a very small hamster with a very large wrench can stitch the timeline back together.';
    p.characterIds = [chars[0].id, chars[3].id];
    const beats = D.COMMUNITY.sampleDialogue;
    p.pages = [makePage(0, 8, p, beats)];
    p.updatedAt = Date.now() - 3600000;
    state.projects = [p];
    state.activeProjectId = p.id;
    state.activePanelId = p.pages[0].panels[0].id;
    persist();
  }

  /* ---------- panels / pages ---------- */
  function makePanel(num, seed, over = {}) {
    return Object.assign({
      id: U.uid('panel'), num, seed,
      scene: '', dialogue: '', caption: '', sfx: '',
      camera: 'Medium Shot', expression: 'Neutral',
      bubble: { x: .58, y: .16, w: .36, h: .22, type: 'Speech', fontSize: 15 },
      image: null, filter: 'none', customImage: false
    }, over);
  }
  function makePage(index, count, project, dialogues) {
    const W = D.WORDS;
    const panels = [];
    for (let i = 0; i < count; i++) {
      const r = U.rng(U.hash((project.title || '') + index + '-' + i + (project.idea || '')));
      panels.push(makePanel(i + 1, (U.hash(project.title + index + i) % 99999) + 7, {
        scene: U.pick(W.places, r) + ', the hero ' + U.pick(W.actions, r) + ', ' + U.pick(W.twists, r),
        dialogue: dialogues ? dialogues[i % dialogues.length] : U.pick(W.lines, r),
        caption: i === 0 ? U.pick(W.captions, r) : (r() > .78 ? U.pick(W.captions, r) : ''),
        sfx: r() > .62 ? U.pick(W.sfx, r) : '',
        camera: U.pick(W.cameras, r),
        expression: U.pick(D.EXPRESSIONS, r),
        bubble: { x: .5 + (r() - .5) * .22, y: .10 + r() * .14, w: .38, h: .22, type: r() > .8 ? 'Thought' : 'Speech', fontSize: 15 }
      }));
    }
    return { id: U.uid('page'), index, panels };
  }

  function makeProject(o = {}) {
    return Object.assign({
      id: U.uid('comic'), title: 'Untitled Comic', idea: '', enhanced: '',
      genre: 'Adventure', tone: 'Lighthearted', audience: 'All Ages', language: 'en',
      style: 'auto', layout: 'auto', columns: 2, pages: [], panelsPerPage: 6,
      characterIds: [], series: '', tags: [], status: 'draft',
      createdAt: Date.now(), updatedAt: Date.now(), coverStyle: ''
    }, o);
  }

  /* ---------- CRUD ---------- */
  function addProject(o) {
    const p = makeProject(o);
    const count = o.panelsPerPage || state.settings.defaultPanels || 6;
    const pageCount = o.pageCount || state.settings.defaultPages || 1;
    for (let i = 0; i < pageCount; i++) p.pages.push(makePage(i, count, p));
    p.pages_count = pageCount;
    state.projects.unshift(p);
    state.activeProjectId = p.id;
    state.activePageIndex = 0;
    state.activePanelId = p.pages[0].panels[0].id;
    history = []; future = [];
    persist();
    return p;
  }
  function getProject(id) { return state.projects.find(p => p.id === (id || state.activeProjectId)) || state.projects[0] || null; }
  function activeProject() { return getProject(); }
  function saveProject(p) { if (!p) return; p.updatedAt = Date.now(); persist(); }
  function deleteProject(id) {
    state.projects = state.projects.filter(p => p.id !== id);
    if (state.activeProjectId === id) state.activeProjectId = state.projects[0] ? state.projects[0].id : null;
    persist();
  }
  function duplicateProject(id) {
    const src = getProject(id); if (!src) return null;
    const cp = U.clone(src);
    cp.id = U.uid('comic'); cp.title = src.title + ' (Copy)'; cp.status = 'draft';
    cp.createdAt = cp.updatedAt = Date.now();
    cp.pages.forEach(pg => { pg.id = U.uid('page'); pg.panels.forEach(pn => { pn.id = U.uid('panel'); }); });
    state.projects.unshift(cp); state.activeProjectId = cp.id; persist();
    return cp;
  }
  function setActive(id) {
    state.activeProjectId = id; state.activePageIndex = 0;
    const p = getProject(id); state.activePanelId = p && p.pages[0] && p.pages[0].panels[0] ? p.pages[0].panels[0].id : null;
    persist();
  }

  function addCharacter(o) {
    const c = Object.assign({ id: U.uid('char'), name: 'New Character', role: 'supporting', category: 'Original',
      color: '#8b6cff', hair: '#2b2b3a', eyes: '#2b2b3a', outfit: '', species: 'Human',
      personality: '', traits: '', notes: '', seed: Math.floor(Math.random() * 99999), createdAt: Date.now() }, o);
    state.characters.unshift(c); persist(); return c;
  }
  function updateCharacter(id, patch) { const c = state.characters.find(x => x.id === id); if (c) { Object.assign(c, patch); persist(); } return c; }
  function deleteCharacter(id) { state.characters = state.characters.filter(c => c.id !== id); persist(); }

  function addStyle(o) {
    const s = Object.assign({ id: U.uid('style'), name: 'My Style', emoji: '🎨', desc: 'Custom style', cat: 'Custom',
      colors: ['#8b6cff', '#ff8ac4', '#1b2030'], line: 2, halftone: .2, texture: 'clean', custom: true, new: true }, o);
    state.customStyles.unshift(s); persist(); return s;
  }
  function deleteStyle(id) { state.customStyles = state.customStyles.filter(s => s.id !== id); persist(); }
  function allStyles() { return D.STYLES.concat(state.customStyles); }
  function styleById(id) { return allStyles().find(s => s.id === id) || D.STYLES[0]; }
  function layoutById(id) { return D.LAYOUTS.find(l => l.id === id) || D.LAYOUTS[0]; }

  /* ---------- history ---------- */
  function snapshot() {
    const p = activeProject(); if (!p) return;
    history.push(U.clone(p)); if (history.length > 35) history.shift(); future = [];
  }
  function commit() { persist(); }
  function undo() {
    if (!history.length) { U.toast('Nothing to undo', 'warn'); return false; }
    const p = activeProject(); if (!p) return false;
    future.push(U.clone(p));
    const prev = history.pop();
    const idx = state.projects.findIndex(x => x.id === prev.id);
    if (idx >= 0) state.projects[idx] = prev;
    persist(); return true;
  }
  function redo() {
    if (!future.length) { U.toast('Nothing to redo', 'warn'); return false; }
    const p = activeProject(); if (!p) return false;
    history.push(U.clone(p));
    const next = future.pop();
    const idx = state.projects.findIndex(x => x.id === next.id);
    if (idx >= 0) state.projects[idx] = next;
    persist(); return true;
  }

  /* ---------- stats / backup ---------- */
  function stats() {
    const panels = state.projects.reduce((a, p) => a + p.pages.reduce((b, pg) => b + pg.panels.length, 0), 0);
    const pages = state.projects.reduce((a, p) => a + p.pages.length, 0);
    const words = state.projects.reduce((a, p) => a + p.pages.reduce((b, pg) => b + pg.panels.reduce((c, x) => c + String(x.dialogue || '').split(/\s+/).filter(Boolean).length, 0), 0), 0);
    return { comics: state.projects.length, pages, panels, characters: state.characters.length, styles: allStyles().length, words };
  }
  function backupJSON() { return JSON.stringify({ app: 'AIComic Builder Studio', exportedAt: new Date().toISOString(), credit: 'Design and Developed by Mr.Busy', state }, null, 2); }
  function importJSON(text) {
    const o = JSON.parse(text);
    const s = o.state || o;
    if (!s || !Array.isArray(s.projects)) throw new Error('Not a valid AIComic Builder backup.');
    state = Object.assign(defaults(), s);
    state.settings = Object.assign(defaults().settings, s.settings || {});
    history = []; future = []; persist(); return true;
  }
  function resetAll() { state = defaults(); localStorage.removeItem(KEY); seed(); persist(); }

  return { load, get, settings, setSetting, setUI, persist, saveProject,
    addProject, getProject, activeProject, deleteProject, duplicateProject, setActive,
    makePanel, makePage, makeProject,
    addCharacter, updateCharacter, deleteCharacter,
    addStyle, deleteStyle, allStyles, styleById, layoutById,
    snapshot, commit, undo, redo, stats, backupJSON, importJSON, resetAll };
})();
