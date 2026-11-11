/* ============================================================
   Settings · About & Sources
   Design and Developed by Mr.Busy
   ============================================================ */
(function (V) {
  const U = window.ACB_U, D = window.ACB_DATA, S = window.ACB_STORE, A = window.ACB_ART;

  /* ---------------- SETTINGS ---------------- */
  V.settings = {
    title: 'Settings', crumb: 'System',
    render() {
      const s = S.settings();
      const bytes = (() => { try { return new Blob([localStorage.getItem('acb_studio_v2')||'']).size; } catch(e){ return 0; } })();
      return V.head('Settings', 'Appearance, creation defaults, the optional AI provider, local data management and keyboard shortcuts.') +
        '<div class="tabs" id="setTabs"><button class="active" data-t="appearance">🎨 Appearance</button>' +
        '<button data-t="creation">✦ Creation defaults</button><button data-t="engine">⚡ AI Engine</button>' +
        '<button data-t="data">💾 Data &amp; backup</button><button data-t="shortcuts">⌨ Shortcuts</button></div>' +
        '<div id="setBody"></div>' +
        '<div class="credit-block"><div class="cb-mark">AIComic Builder Studio</div>' +
          '<p>Settings are stored locally. Nothing is synced, uploaded or tracked.</p>' +
          '<div class="cb-sign">Design and Developed by Mr.Busy</div></div>';
    },
    mount(root) {
      const body = U.$('#setBody', root), s = S.settings();
      const bytes = (() => { try { return new Blob([localStorage.getItem('acb_studio_v2')||'']).size; } catch(e){ return 0; } })();
      const draw = (tab) => {
        if (tab === 'appearance') {
          body.innerHTML = '<div class="grid grid-2">' +
            '<div class="card"><h3 style="margin:0 0 14px">Theme</h3>' +
              '<div class="segmented" id="seTheme"><button data-v="dark" class="'+(s.theme==='dark'?'active':'')+'">☾ Dark studio</button><button data-v="light" class="'+(s.theme==='light'?'active':'')+'">☀ Light</button></div>' +
              '<div class="small muted mt12">A full light and dark design system is included — every panel, card and editor surface adapts.</div>' +
              '<h3 class="mt24" style="margin-bottom:12px">Accent colour</h3><div class="row wrap">' +
              ['violet','coral','amber','teal','blue'].map(c=>'<button class="choice'+(s.accent===c?' selected':'')+'" data-acc="'+c+'" style="width:88px"><div class="style-swatch" style="background:var(--accent);background:linear-gradient(135deg,'+
                ({violet:'#8b6cff,#ff8ac4',coral:'#ff6f81,#ffb45c',amber:'#f5a524,#ffe08a',teal:'#24c8a8,#73e8d0',blue:'#4a9bff,#93c3ff'}[c])+')"></div><span class="c-name">'+c+'</span></button>').join('') + '</div></div>' +
            '<div class="card"><h3 style="margin:0 0 14px">Interface language</h3>' +
              '<select class="select" id="seLang">'+D.LANGUAGES.map(l=>'<option value="'+l.id+'"'+(l.id===s.language?' selected':'')+'>'+l.name+'</option>').join('')+'</select>' +
              '<div class="small muted mt12">The original site added 8-language support on 2026-08-20. This desktop edition ships the same 8 locales for navigation and common actions.</div>' +
              '<h3 class="mt24" style="margin-bottom:12px">Sidebar</h3>' +
              '<label class="check"><input type="checkbox" id="seCollapse"'+(S.get().ui.sidebarCollapsed?' checked':'')+'> Start with collapsed sidebar</label>' +
              '<div class="small muted mt12">Toggle any time with the ‹ button in the sidebar, or Ctrl+B.</div></div></div>';
          U.$$('[data-v]', body).forEach(b=>b.onclick=()=>{S.setSetting('theme',b.dataset.v);window.applyTheme();window.refresh();});
          U.$$('[data-acc]', body).forEach(b=>b.onclick=()=>{S.setSetting('accent',b.dataset.acc);window.applyTheme();window.refresh();});
          U.$('#seLang', body).onchange=(e)=>{S.setSetting('language',e.target.value);window.applyLang();U.toast('Language changed to '+(D.LANGUAGES.find(l=>l.id===e.target.value)||{}).name,'success');};
          U.$('#seCollapse', body).onchange=(e)=>{S.setUI('sidebarCollapsed',e.target.checked);window.applySidebar();};
        } else if (tab === 'creation') {
          body.innerHTML = '<div class="card"><h3 style="margin:0 0 14px">Defaults for new comics</h3><div class="grid grid-3">' +
            '<div class="field"><label>Default style</label><select class="select" id="seStyle"><option value="auto">✨ AI Decides</option>'+S.allStyles().map(x=>'<option value="'+x.id+'"'+(s.defaultStyle===x.id?' selected':'')+'>'+x.emoji+' '+U.esc(x.name)+'</option>').join('')+'</select></div>' +
            '<div class="field"><label>Default layout</label><select class="select" id="seLayout">'+D.LAYOUTS.map(x=>'<option value="'+x.id+'"'+(s.defaultLayout===x.id?' selected':'')+'>'+x.emoji+' '+U.esc(x.name)+'</option>').join('')+'</select></div>' +
            '<div class="field"><label>Render quality</label><select class="select" id="seQuality">'+[1,2,3].map(q=>'<option value="'+q+'"'+(s.quality===q?' selected':'')+'>'+q+'× '+(['Standard','High','Ultra'][q-1])+'</option>').join('')+'</select></div>' +
            '<div class="field"><label>Default pages (1–50)</label><input class="input" type="number" min="1" max="50" id="sePages" value="'+s.defaultPages+'"></div>' +
            '<div class="field"><label>Default panels/page (1–24)</label><input class="input" type="number" min="1" max="24" id="sePanels" value="'+s.defaultPanels+'"></div>' +
            '<div class="field"><label>Watermark</label><select class="select" id="seWm"><option value="off"'+(s.watermark?'':' selected')+'>Off (Unlimited Edition)</option><option value="on"'+(s.watermark?' selected':'')+'>On (optional)</option></select></div>' +
            '</div><div class="info-banner"><span class="ib-icon">∞</span><div>These are preferences, not restrictions. Every value can be overridden per comic in Customize, in the 8-step wizard, or in the Comic Editor.</div></div>' +
            '<button class="btn btn-primary mt16" id="seSave">💾 Save defaults</button></div>';
          U.$('#seSave', body).onclick=()=>{
            S.setSetting('defaultStyle',U.$('#seStyle',body).value); S.setSetting('defaultLayout',U.$('#seLayout',body).value);
            S.setSetting('quality',+U.$('#seQuality',body).value);
            S.setSetting('defaultPages',Math.max(1,Math.min(50,+U.$('#sePages',body).value||1)));
            S.setSetting('defaultPanels',Math.max(1,Math.min(24,+U.$('#sePanels',body).value||6)));
            S.setSetting('watermark',U.$('#seWm',body).value==='on');
            U.toast('Creation defaults saved','success');
          };
        } else if (tab === 'engine') {
          const api=s.api||{};
          body.innerHTML = '<div class="grid grid-2"><div class="card"><h3 style="margin:0 0 12px">Built-in offline engine</h3>' +
            '<div class="info-banner"><span class="ib-icon">✓</span><div><b>Active by default.</b> The story engine and the artwork renderer run entirely on this machine. No API key, no credits, no network, no rate limits. Artwork is generated procedurally and deterministically from each panel seed.</div></div>' +
            '<ul class="small muted mt16" style="line-height:1.9;padding-left:18px"><li>Story / dialogue / captions / SFX generation</li><li>28 style-driven procedural illustration presets</li><li>Consistent character rendering from colour + hair profiles</li><li>Speech bubbles, thought clouds, captions and sound effects</li><li>Halftone, screentone, grain, neon and 12 more filters</li></ul></div>' +
            '<div class="card"><h3 style="margin:0 0 12px">Optional: bring your own AI provider</h3>' +
            '<p class="small muted">If you want model-written prose instead of the offline engine, point the studio at any OpenAI-compatible chat endpoint. The key stays on this computer. If the endpoint is unreachable, the app automatically falls back to the offline engine.</p>' +
            '<div class="field mt16"><label>Endpoint (chat/completions URL)</label><input class="input" id="seEndpoint" value="'+U.esc(api.endpoint||'')+'" placeholder="https://api.openai.com/v1/chat/completions"></div>' +
            '<div class="field"><label>API key</label><input class="input" type="password" id="seKey" value="'+U.esc(api.key||'')+'" placeholder="sk-…"></div>' +
            '<div class="field"><label>Model</label><input class="input" id="seModel" value="'+U.esc(api.model||'gpt-4o-mini')+'"></div>' +
            '<div class="row wrap"><button class="btn btn-primary" id="seApiSave">💾 Save provider</button>' +
            '<button class="btn" id="seApiTest">⚡ Test connection</button><button class="btn" id="seApiClear">Clear</button></div>' +
            '<div class="small muted mt12" id="seApiStatus"></div></div></div>';
          U.$('#seApiSave', body).onclick=()=>{S.settings().api={endpoint:U.$('#seEndpoint',body).value.trim(),key:U.$('#seKey',body).value.trim(),model:U.$('#seModel',body).value.trim()};S.persist();U.toast('Provider saved locally','success');};
          U.$('#seApiClear', body).onclick=()=>{S.settings().api={endpoint:'',key:'',model:'gpt-4o-mini'};S.persist();window.refresh();U.toast('Provider cleared — offline engine active','success');};
          U.$('#seApiTest', body).onclick=async()=>{
            const ep=U.$('#seEndpoint',body).value.trim(), key=U.$('#seKey',body).value.trim();
            if(!ep||!key){U.$('#seApiStatus',body).textContent='Enter an endpoint and key first.';return;}
            U.$('#seApiStatus',body).textContent='Testing…';
            try{
              const r=await fetch(ep,{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+key},body:JSON.stringify({model:U.$('#seModel',body).value,messages:[{role:'user',content:'Reply with OK'}],max_tokens:5})});
              U.$('#seApiStatus',body).textContent=r.ok?'✓ Connected (HTTP '+r.status+')':'✕ Provider returned HTTP '+r.status;
            }catch(e){U.$('#seApiStatus',body).textContent='✕ '+e.message+' — offline fallback will be used.';}
          };
        } else if (tab === 'data') {
          body.innerHTML = '<div class="grid grid-2"><div class="card"><h3 style="margin:0 0 12px">Local data</h3>' +
            '<table class="table"><tbody><tr><td>Comics</td><td><b>'+S.get().projects.length+'</b></td></tr>' +
            '<tr><td>Characters</td><td><b>'+S.get().characters.length+'</b></td></tr>' +
            '<tr><td>Custom styles</td><td><b>'+S.get().customStyles.length+'</b></td></tr>' +
            '<tr><td>Storage used</td><td><b>'+(bytes/1024).toFixed(1)+' KB</b> (local)</td></tr>' +
            '<tr><td>Account required</td><td><b style="color:var(--green)">No</b></td></tr>' +
            '<tr><td>Network required</td><td><b style="color:var(--green)">No</b></td></tr></tbody></table>' +
            '<div class="row wrap mt16"><button class="btn btn-primary" id="seBackup">↧ Download full backup</button>' +
            '<button class="btn" id="seRestore">↥ Restore from file</button><input type="file" id="seFile" accept=".json,application/json" class="hidden"></div></div>' +
            '<div class="card"><h3 style="margin:0 0 12px">Autosave &amp; reset</h3>' +
            '<label class="check"><input type="checkbox" id="seAutosave"'+(s.autosave?' checked':'')+'> Autosave every change to local storage</label>' +
            '<div class="small muted mt12">Autosave is instant and silent. Exports are always available regardless of this setting.</div>' +
            '<div class="divider"></div><h4 style="margin:0 0 8px">Danger zone</h4>' +
            '<p class="small muted">Reset removes every comic, character and custom style from this machine, then restores the demo gallery.</p>' +
            '<button class="btn btn-danger mt8" id="seReset">🗑 Reset all local data</button></div></div>';
          U.$('#seAutosave', body).onchange=(e)=>S.setSetting('autosave',e.target.checked);
          U.$('#seBackup', body).onclick=()=>window.backupAll();
          U.$('#seRestore', body).onclick=()=>U.$('#seFile',body).click();
          U.$('#seFile', body).onchange=(e)=>window.restoreFromFile(e.target.files[0]);
          U.$('#seReset', body).onclick=()=>U.confirmDialog('This permanently removes all comics, characters and custom styles on this machine. Export a backup first if unsure.',()=>{S.resetAll();window.applyTheme();window.refreshSidebar();window.go('dashboard');U.toast('Local data reset','success');});
        } else {
          const rows=[['Ctrl + N','New comic / Create Studio'],['Ctrl + 1 … 5','Dashboard, Create, Projects, Editor, Reader'],['Ctrl + K','Focus global search'],['Ctrl + Z / Ctrl + Y','Undo / redo in Comic Editor'],['Ctrl + E','Open Export Center'],['Ctrl + Shift + T','Toggle theme'],['Ctrl + B','Collapse / expand sidebar'],['F11','Fullscreen'],['F12','Developer tools (Electron)'],['Esc','Close dialog / lightbox']];
          body.innerHTML='<div class="card"><h3 style="margin:0 0 14px">Keyboard shortcuts</h3><table class="table"><thead><tr><th>Shortcut</th><th>Action</th></tr></thead><tbody>' +
            rows.map(r=>'<tr><td><kbd>'+r[0]+'</kbd></td><td>'+r[1]+'</td></tr>').join('')+'</tbody></table></div>';
        }
      };
      U.$$('#setTabs button', root).forEach(b=>b.onclick=()=>{U.$$('#setTabs button',root).forEach(x=>x.classList.remove('active'));b.classList.add('active');draw(b.dataset.t);});
      draw('appearance');
    }
  };

  /* ---------------- ABOUT & SOURCES ---------------- */
  V.about = {
    title: 'About & Sources', crumb: 'System',
    render() {
      const P=D.SOURCES.primary, Q=D.SOURCES.secondary;
      const added = [
        ['∞ Unlimited Edition','Credits, pages, panels, characters, styles, generations and exports — all uncapped'],
        ['⚙️ 8-step advanced wizard','Full Comic Info → Enhance → Characters → Style → Preview → Generate → Script Review → Render workflow'],
        ['✎ Real Comic Editor','Drag speech bubbles, edit dialogue/captions/SFX, cameras, expressions, per-panel FX and regeneration, custom image upload'],
        ['🎭 Custom Style Builder','Unlimited palettes, line weight, halftone and texture — 28 built-in styles (8 new)'],
        ['📐 16 layouts','Original 10 + 4-Koma, Splash, 3×3 Grid, Cinematic Wide, Dynamic Mix, Double Spread, Custom Canvas'],
        ['✂️ Unlimited Webtoon Slicer','No 30,000px / 2MB / 20MB caps, ZIP + CBZ output, phone simulator'],
        ['◉ Filters & FX','16 real image filters with strength control — inspired by a1.art\'s filter marketplace'],
        ['↥ Export Center','PNG, individual panels, SVG, PDF/print, CBZ with ComicInfo.xml, JSON, WebP'],
        ['📚 Story & project manager','Series, chapters, tags, archive, duplicate, search, sort, full JSON backup/restore'],
        ['🌐 8-language UI','English, Español, Français, Deutsch, 日本語, 한국어, 中文, Português'],
        ['🔒 Privacy & rights','Private by default, no sign-in, no cloud, no watermark, full commercial rights'],
        ['⚡ Offline engine + BYO AI','Procedural artwork with no API key; optional OpenAI-compatible provider'],
        ['🖥️ True desktop app','Electron window with native menus, or Edge/Chrome app-mode launcher']
      ];
      return V.head('About & Sources', 'Exactly what was fetched, what was rebuilt, and every limitation that was removed.') +
        '<div class="tabs" id="abTabs"><button class="active" data-t="sources">🌐 Source data</button>' +
        '<button data-t="limits">🔓 Limitations removed</button><button data-t="added">✦ Added functions</button>' +
        '<button data-t="site">📋 Site reference</button></div><div id="abBody"></div>';
    },
    mount(root) {
      const P=D.SOURCES.primary, Q=D.SOURCES.secondary, body=U.$('#abBody',root);
      const draw=(tab)=>{
        if(tab==='sources'){
          body.innerHTML='<div class="grid grid-2">' +
            '<div class="card"><div class="row-between mb8"><h3 style="margin:0">'+P.name+'</h3><span class="chip green">Primary source</span></div>' +
              '<div class="small mono mb12">'+P.url+'</div><p class="small">'+U.esc(P.summary)+'</p>' +
              '<h4 class="mt16 mb8">5-step workflow</h4><ul class="small muted" style="line-height:1.9;padding-left:18px;margin:0">'+P.workflow.map(x=>'<li>'+U.esc(x)+'</li>').join('')+'</ul>' +
              '<h4 class="mt16 mb8">Create form</h4><div class="small muted">'+U.esc(P.createFields.join(' · '))+'</div>' +
              '<h4 class="mt16 mb8">Generation stages</h4><div class="row wrap">'+P.generationStages.map(x=>'<span class="chip accent">'+x+'</span>').join('')+'</div></div>' +
            '<div class="card"><div class="row-between mb8"><h3 style="margin:0">ai-1.art / a1.art</h3><span class="chip amber">Parked domain</span></div>' +
              '<div class="small mono mb12">'+Q.given+'</div>' +
              '<div class="info-banner mb12"><span class="ib-icon">⚠</span><div>'+U.esc(Q.detail)+'</div></div>' +
              '<p class="small">Likely intended: <b>'+U.esc(Q.likelyIntended)+'</b></p>' +
              '<h4 class="mt16 mb8">a1.art capabilities found</h4><ul class="small muted" style="line-height:1.9;padding-left:18px;margin:0">'+Q.a1art.map(x=>'<li>'+U.esc(x)+'</li>').join('')+'</ul>' +
              '<div class="small muted mt12">'+U.esc(Q.borrowed)+'</div></div></div>' +
            '<div class="src-block mt16"><h4>Pages fetched from aicomicbuilder.com</h4><div class="row wrap">'+P.pages.map(x=>'<span class="chip mono">'+U.esc(x)+'</span>').join('')+'</div></div>';
        } else if(tab==='limits'){
          body.innerHTML='<div class="card"><div class="row-between mb12"><h3 style="margin:0">Original limitation → Unlimited Edition</h3><span class="chip green">'+D.LIMITS.length+' restrictions removed</span></div>' +
            '<table class="table limit-table"><thead><tr><th>Capability</th><th>Original platform</th><th>This desktop app</th><th>How</th></tr></thead><tbody>' +
            D.LIMITS.map(r=>'<tr><td><b>'+U.esc(r[0])+'</b></td><td class="was">'+U.esc(r[1])+'</td><td class="now">'+U.esc(r[2])+'</td><td class="small">'+U.esc(r[3])+'</td></tr>').join('') +
            '</tbody></table></div>' +
            '<div class="card mt16"><h3 style="margin:0 0 12px">Original pricing tiers (for reference)</h3>' +
            '<table class="table"><thead><tr><th>Plan</th><th>Price</th><th>Credits</th><th>Characters</th><th>Speed</th><th>Extras</th></tr></thead><tbody>' +
            P.pricing.map(t=>'<tr><td><b>'+U.esc(t.name)+'</b></td><td>'+U.esc(t.price)+'</td><td>'+U.esc(t.credits)+'</td><td>'+U.esc(t.chars)+'</td><td>'+U.esc(t.speed)+'</td><td>'+U.esc(t.extra)+'</td></tr>').join('') +
            '</tbody></table><div class="small muted mt12">Credit usage: 1 AI panel ≈ 8–10 credits; an 8-panel comic ≈ 64 credits. None of this applies here.</div></div>';
        } else if(tab==='added'){
          body.innerHTML='<div class="grid grid-2">'+added.map(a=>'<div class="card pad-sm"><b>'+U.esc(a[0])+'</b><div class="small muted mt8">'+U.esc(a[1])+'</div></div>').join('')+'</div>';
        } else {
          body.innerHTML='<div class="grid grid-2">' +
            '<div class="card"><h3 style="margin:0 0 12px">8-step advanced wizard</h3><ol class="small muted" style="line-height:2;padding-left:20px;margin:0">'+P.wizardSteps.map(x=>'<li>'+U.esc(x)+'</li>').join('')+'</ol>' +
              '<h3 class="mt24 mb8">Create modes</h3><div class="row wrap">'+P.createModes.map(x=>'<span class="chip accent">'+U.esc(x)+'</span>').join('')+'</div></div>' +
            '<div class="card"><h3 style="margin:0 0 12px">Changelog from the site</h3>' +
              '<table class="table"><tbody>'+P.changelog.map(c=>'<tr><td class="mono">'+c[0]+'</td><td><span class="chip '+(c[1]==='Planned'?'amber':'green')+'">'+c[1]+'</span></td><td>'+U.esc(c[2])+'</td></tr>').join('')+'</tbody></table>' +
              '<h3 class="mt24 mb8">FAQ highlights</h3><ul class="small muted" style="line-height:1.8;padding-left:18px;margin:0">'+P.faq.map(f=>'<li><b>'+U.esc(f[0])+'</b> — '+U.esc(f[1])+'</li>').join('')+'</ul></div></div>' +
            '<div class="card mt16"><h3 style="margin:0 0 12px">Community data captured</h3><div class="grid grid-2">' +
              '<div><b class="small">🔥 Trending</b><ul class="small muted" style="line-height:1.9;padding-left:18px">'+D.COMMUNITY.trending.slice(0,6).map(c=>'<li>'+U.esc(c[0])+' · '+U.esc(c[1])+' · '+c[2]+' views</li>').join('')+'</ul></div>' +
              '<div><b class="small">✨ Recently created</b><ul class="small muted" style="line-height:1.9;padding-left:18px">'+D.COMMUNITY.recent.map(c=>'<li>'+U.esc(c[0])+' · '+U.esc(c[1])+'</li>').join('')+'</ul></div></div></div>';
        }
        body.innerHTML += '<div class="credit-block"><div class="cb-mark">AIComic Builder Studio</div>' +
          '<p>Unlimited Edition · Desktop application · Rebuilt and redesigned from the reference sites</p>' +
          '<p>Data fetched 11 November 2026 · All work runs locally on your machine</p>' +
          '<div class="cb-sign">Design and Developed by Mr.Busy</div></div>';
      };
      U.$$('#abTabs button',root).forEach(b=>b.onclick=()=>{U.$$('#abTabs button',root).forEach(x=>x.classList.remove('active'));b.classList.add('active');draw(b.dataset.t);});
      draw('sources');
    }
  };
})(window.ACB_VIEWS);
