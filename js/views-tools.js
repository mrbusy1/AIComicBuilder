/* ============================================================
   Webtoon Slicer · Filters & FX · Export Center
   Design and Developed by Mr.Busy
   ============================================================ */
(function (V) {
  const U = window.ACB_U, D = window.ACB_DATA, S = window.ACB_STORE, A = window.ACB_ART;

  /* ---------------- WEBTOON SLICER ---------------- */
  const SLICE_PRESETS = [
    { id:'webtoon', name:'LINE Webtoon Canvas', w:800, h:1280, note:'800px wide, max 1280px per slice (official 2026 guideline)' },
    { id:'tapas', name:'Tapas Webcomic', w:940, h:1280, note:'940px wide, up to 4000px slices' },
    { id:'instagram', name:'Instagram Carousel', w:1080, h:1350, note:'1080 × 1350 multi-slide posts' },
    { id:'custom', name:'Custom Dimensions', w:800, h:1280, note:'Any width and slice height — no caps' }
  ];
  let sliceState = { img:null, slices:[], preset:'webtoon', w:800, h:1280, fmt:'image/jpeg' };

  V.slicer = {
    title: 'Webtoon Slicer', crumb: 'Tools',
    render() {
      return V.head('Webtoon Slicer & Canvas Formatter', '100% client-side slicing with ZIP/CBZ export. The original tool capped images at 30,000px height, 2MB per slice and 20MB per episode — those caps are gone.') +
        '<div class="info-banner mb16"><span class="ib-icon">✂</span><div><b>Official upload specs (for reference):</b> LINE Webtoon requires 800px wide, max 1,280px tall per slice, max 2MB per slice, 20MB per episode. This desktop edition has <b>no height, size or slice-count limits</b> — export whatever you need.</div></div>' +
        '<div class="grid grid-2 mb16">' +
          '<div class="card"><b class="small mb12" style="display:block">1 · Choose a target format</b>' +
            '<div class="choice-grid cols-2" id="slPresets">' + SLICE_PRESETS.map(p =>
              '<button class="choice'+(p.id===sliceState.preset?' selected':'')+'" data-preset="'+p.id+'"><span class="c-name">'+p.name+'</span><span class="c-desc">'+p.w+' × '+p.h+'</span></button>').join('') + '</div>' +
            '<div class="grid grid-3 mt16">' +
              '<div class="field"><label>Width (px)</label><input class="input" type="number" id="slW" min="100" max="6000" value="'+sliceState.w+'"></div>' +
              '<div class="field"><label>Slice height (px)</label><input class="input" type="number" id="slH" min="100" max="12000" value="'+sliceState.h+'"></div>' +
              '<div class="field"><label>Output format</label><select class="select" id="slFmt"><option value="image/jpeg">JPEG (small)</option><option value="image/png">PNG (lossless)</option><option value="image/webp">WebP</option></select></div>' +
            '</div><div class="small muted" id="slPresetNote">'+SLICE_PRESETS[0].note+'</div></div>' +
          '<div class="card"><b class="small mb12" style="display:block">2 · Load a vertical strip</b>' +
            '<div class="dropzone" id="slDrop"><div class="dz-icon">🖼️</div><h3 style="margin:8px 0 4px">Drop a long vertical comic here</h3>' +
            '<p class="small muted mb12">PNG · JPG · WebP · any height</p>' +
            '<button class="btn btn-primary btn-sm" id="slBrowse">Browse image file</button>' +
            '<input type="file" id="slFile" accept="image/*" class="hidden"></div>' +
            '<div class="row wrap mt12"><button class="btn btn-sm" id="slSample">⚡ Generate sample strip from current comic</button>' +
            '<span class="small muted" id="slInfo">No image loaded</span></div></div></div>' +
        '<div class="section-head"><h2>3 · Slices &amp; phone simulator</h2><div class="row" id="slActions"></div></div>' +
        '<div class="grid grid-2"><div id="slGrid" class="slice-grid"></div>' +
          '<div style="display:flex;justify-content:center"><div><div class="small muted mb8" style="text-align:center">📱 Seamless mobile reader preview</div>' +
          '<div class="phone-sim" id="slPhone"><div class="empty" style="border:0;padding:60px 12px"><span class="em-icon">📜</span><p>Load an image to preview</p></div></div></div></div></div>';
    },
    mount(root) {
      const note = U.$('#slPresetNote', root);
      U.$$('[data-preset]', root).forEach(b => b.onclick = () => {
        const p = SLICE_PRESETS.find(x=>x.id===b.dataset.preset);
        sliceState.preset=p.id; sliceState.w=p.w; sliceState.h=p.h;
        U.$('#slW', root).value=p.w; U.$('#slH', root).value=p.h; note.textContent=p.note;
        U.$$('[data-preset]', root).forEach(x=>x.classList.toggle('selected', x===b));
        if (sliceState.img) doSlice(root);
      });
      const loadSrc = async (src) => { const im = await U.loadImage(src); sliceState.img=im; U.$('#slInfo', root).textContent = im.naturalWidth+' × '+im.naturalHeight+' px'; doSlice(root); };
      const handleFile = (f) => { if (!f) return; U.readFileAsDataURL(f).then(loadSrc).catch(()=>U.toast('Could not read image','error')); };
      U.$('#slBrowse', root).onclick = () => U.$('#slFile', root).click();
      U.$('#slFile', root).onchange = (e) => handleFile(e.target.files[0]);
      const dz = U.$('#slDrop', root);
      dz.ondragover = (e) => { e.preventDefault(); dz.classList.add('dragover'); };
      dz.ondragleave = () => dz.classList.remove('dragover');
      dz.ondrop = (e) => { e.preventDefault(); dz.classList.remove('dragover'); handleFile(e.dataTransfer.files[0]); };
      U.$('#slSample', root).onclick = () => {
        const p = S.activeProject(); if (!p) { U.toast('Create a comic first', 'warn'); return; }
        const W = 800, rows = 8, PH = 460, c = document.createElement('canvas');
        c.width = W; c.height = rows * PH;
        const ctx = c.getContext('2d'); ctx.fillStyle='#fff'; ctx.fillRect(0,0,c.width,c.height);
        const panels = []; p.pages.forEach(pg=>pg.panels.forEach(x=>panels.push(x)));
        const chars=p.characterIds.map(id=>S.get().characters.find(x=>x.id===id)).filter(Boolean);
        for (let i=0;i<rows;i++) {
          const pn = panels[i % panels.length];
          const pc = A.renderPanel(pn,{width:W,height:PH,style:S.styleById(p.style),characters:chars,number:false,filter:pn.filter});
          ctx.drawImage(pc,0,i*PH,W,PH);
        }
        loadSrc(c.toDataURL('image/png')); U.toast('Sample vertical strip generated', 'success');
      };
      ['#slW','#slH','#slFmt'].forEach(sel => { U.$(sel, root).onchange = () => { sliceState.w=+U.$('#slW',root).value||800; sliceState.h=+U.$('#slH',root).value||1280; sliceState.fmt=U.$('#slFmt',root).value; if(sliceState.img) doSlice(root); }; });
      if (sliceState.img) doSlice(root);
    }
  };

  function doSlice(root) {
    const im = sliceState.img; if (!im) return;
    const W = Math.max(100, sliceState.w), SH = Math.max(100, sliceState.h);
    const scale = W / im.naturalWidth, H = Math.round(im.naturalHeight * scale);
    const full = document.createElement('canvas'); full.width=W; full.height=H;
    full.getContext('2d').drawImage(im,0,0,W,H);
    const mime = sliceState.fmt || 'image/jpeg', ext = mime==='image/png'?'png':mime==='image/webp'?'webp':'jpg';
    const slices=[];
    for (let y=0, i=0; y<H; y+=SH, i++) {
      const h = Math.min(SH, H-y);
      const c=document.createElement('canvas'); c.width=W; c.height=h;
      c.getContext('2d').drawImage(full,0,y,W,h,0,0,W,h);
      slices.push({ name:'slice_'+String(i+1).padStart(3,'0')+'.'+ext, url:c.toDataURL(mime,.88), w:W, h, canvas:c });
    }
    sliceState.slices = slices;
    U.$('#slGrid', root).innerHTML = slices.map((s,i)=>
      '<div class="slice-item"><img src="'+s.url+'" alt="slice '+(i+1)+'"><div class="si-foot"><span>#'+(i+1)+' · '+s.w+'×'+s.h+'</span>' +
      '<button class="btn btn-sm" data-dl="'+i+'">↧</button></div></div>').join('');
    U.$$('[data-dl]', root).forEach(b => b.onclick = () => U.downloadDataURL(slices[+b.dataset.dl].url, slices[+b.dataset.dl].name));
    U.$('#slPhone', root).innerHTML = slices.map(s=>'<img src="'+s.url+'" alt="slice">').join('');
    U.$('#slInfo', root).textContent = im.naturalWidth+' × '+im.naturalHeight+' px → '+slices.length+' slices ('+W+'×'+H+')';
    U.$('#slActions', root).innerHTML = '<button class="btn btn-sm" id="slDlAll">↧ Download all ('+slices.length+')</button>' +
      '<button class="btn btn-sm btn-primary" id="slZip">🗜 Download ZIP</button>' +
      '<button class="btn btn-sm" id="slCbz">📚 Export as CBZ</button>';
    U.$('#slDlAll', root).onclick = () => slices.forEach((s,i)=>setTimeout(()=>U.downloadDataURL(s.url,s.name),i*180));
    const zip = (cbz) => {
      const files = slices.map(s=>({ name:(cbz?'':'slices/')+s.name.replace(/\.\w+$/, cbz?'.jpg':'.'+s.name.split('.').pop()), data:U.dataURLtoBytes(s.url) }));
      if (cbz) files.unshift({ name:'ComicInfo.xml', data:new TextEncoder().encode('<?xml version="1.0"?><ComicInfo><Title>Webtoon Slices</Title><Writer>Mr.Busy</Writer><Series>AIComic Builder Studio</Series></ComicInfo>') });
      U.downloadBlob(U.zipFiles(files), cbz ? 'webtoon-slices.cbz' : 'webtoon-slices.zip');
      U.toast((cbz?'CBZ':'ZIP')+' with '+slices.length+' slices exported', 'success');
    };
    U.$('#slZip', root).onclick = () => zip(false);
    U.$('#slCbz', root).onclick = () => zip(true);
  }

  /* ---------------- FILTERS & FX ---------------- */
  let fxState = { src:null, filter:'none', strength:1 };
  V.filters = {
    title: 'Filters & FX', crumb: 'Tools',
    render() {
      return V.head('Filters & FX', 'Inspired by a1.art\'s filter marketplace ("355.2K+ filters"). Sixteen real, offline image filters with adjustable strength — apply to any image or to the panel you are editing.') +
        '<div class="info-banner mb16"><span class="ib-icon">◉</span><div><b>About the second source:</b> <code>https://ai-1.art/</code> is currently a Hostinger "Coming soon" placeholder with no published product. The likely intended site <b>a1.art</b> — "Online AI Video &amp; Image Generator with Millions of Filters" — inspired this module and the Custom Style Builder.</div></div>' +
        '<div class="grid grid-2 mb16"><div class="card"><b class="small mb12" style="display:block">1 · Source image</b>' +
          '<div class="dropzone" id="fxDrop" style="padding:30px"><div class="dz-icon">🖼️</div><p class="small muted">Drop an image, or</p>' +
          '<button class="btn btn-primary btn-sm" id="fxBrowse">Browse</button> <button class="btn btn-sm" id="fxPanel">Use active comic panel</button>' +
          '<input type="file" id="fxFile" accept="image/*" class="hidden"></div></div>' +
          '<div class="card"><b class="small mb12" style="display:block">2 · Filter &amp; strength</b>' +
          '<div class="fx-grid" id="fxGrid">' + D.FILTERS.map(f=>'<button class="fx-btn'+(f.id===fxState.filter?' active':'')+'" data-fx="'+f.id+'">'+f.name+'</button>').join('') + '</div>' +
          '<div class="field mt16"><label>Strength <span class="muted" id="fxStrengthVal">100%</span></label>' +
          '<input class="input" type="range" min="10" max="200" value="100" id="fxStrength"></div>' +
          '<div class="row wrap"><button class="btn btn-sm btn-primary" id="fxDownload">↧ Download result</button>' +
          '<button class="btn btn-sm" id="fxApply">Apply to selected panel</button>' +
          '<button class="btn btn-sm" id="fxReset">Reset</button></div></div></div>' +
        '<div class="section-head"><h2>Before / After</h2><span class="small muted">All processing happens locally in your browser / desktop window</span></div>' +
        '<div class="compare"><figure><img id="fxBefore" alt="before"><figcaption>Original</figcaption></figure>' +
          '<figure><img id="fxAfter" alt="after"><figcaption id="fxAfterCap">Filtered</figcaption></figure></div>';
    },
    mount(root) {
      const before = U.$('#fxBefore', root), after = U.$('#fxAfter', root);
      const repaint = () => {
        if (!fxState.src) return;
        before.src = fxState.src;
        const im = new Image(); im.onload = () => {
          const c=document.createElement('canvas');
          const sc=Math.min(1, 1200/Math.max(im.width,im.height));
          c.width=Math.round(im.width*sc); c.height=Math.round(im.height*sc);
          c.getContext('2d').drawImage(im,0,0,c.width,c.height);
          A.applyFilter(c, fxState.filter, fxState.strength);
          after.src=c.toDataURL('image/png');
          U.$('#fxAfterCap', root).textContent = (D.FILTERS.find(f=>f.id===fxState.filter)||{name:'Original'}).name + ' · ' + Math.round(fxState.strength*100) + '%';
        };
        im.src=fxState.src;
      };
      const load = (src) => { fxState.src=src; repaint(); };
      const handle = (f) => { if(f) U.readFileAsDataURL(f).then(load); };
      U.$('#fxBrowse', root).onclick = () => U.$('#fxFile', root).click();
      U.$('#fxFile', root).onchange = (e)=>handle(e.target.files[0]);
      const dz=U.$('#fxDrop', root);
      dz.ondragover=(e)=>{e.preventDefault();dz.classList.add('dragover');};
      dz.ondragleave=()=>dz.classList.remove('dragover');
      dz.ondrop=(e)=>{e.preventDefault();dz.classList.remove('dragover');handle(e.dataTransfer.files[0]);};
      U.$('#fxPanel', root).onclick = () => {
        const p=S.activeProject(); if(!p){U.toast('Create a comic first','warn');return;}
        const pn=p.pages[0].panels[0];
        const chars=p.characterIds.map(id=>S.get().characters.find(c=>c.id===id)).filter(Boolean);
        load(A.renderPanel(pn,{width:900,height:600,style:S.styleById(p.style),characters:chars,number:false}).toDataURL('image/png'));
        U.toast('Loaded panel #1 of '+p.title,'success');
      };
      U.$$('[data-fx]', root).forEach(b=>b.onclick=()=>{
        fxState.filter=b.dataset.fx;
        U.$$('[data-fx]', root).forEach(x=>x.classList.toggle('active',x===b)); repaint();
      });
      U.$('#fxStrength', root).oninput=(e)=>{fxState.strength=+e.target.value/100;U.$('#fxStrengthVal',root).textContent=e.target.value+'%';repaint();};
      U.$('#fxDownload', root).onclick=()=>{ if(!after.src){U.toast('Load an image first','warn');return;} U.downloadDataURL(after.src,'filtered-'+fxState.filter+'.png'); };
      U.$('#fxApply', root).onclick=()=>{ const p=S.activeProject(); if(!p){U.toast('Open a comic first','warn');return;} S.snapshot(); p.pages[0].panels[0].filter=fxState.filter; S.persist(); U.toast('Filter applied to panel #1 — open the Comic Editor','success'); };
      U.$('#fxReset', root).onclick=()=>{fxState.filter='none';fxState.strength=1;U.$('#fxStrength',root).value=100;U.$('#fxStrengthVal',root).textContent='100%';U.$$('[data-fx]',root).forEach(x=>x.classList.toggle('active',x.dataset.fx==='none'));repaint();};
      if (fxState.src) repaint();
    }
  };

  /* ---------------- EXPORT CENTER ---------------- */
  V.export = {
    title: 'Export Center', crumb: 'Tools',
    render() {
      const p = S.activeProject();
      if (!p) return V.head('Export Center','No comic open.') + '<div class="empty"><span class="em-icon">↥</span><h3>No comic open</h3><p>Create a comic first.</p></div>';
      const opts=S.get().projects.map(x=>'<option value="'+x.id+'"'+(x.id===p.id?' selected':'')+'>'+U.esc(x.title)+'</option>').join('');
      return V.head('Export Center', 'Every format, no watermark, no download cap, full commercial rights. Print-ready PNG, vector SVG, PDF, CBZ archives and editable JSON.') +
        '<div class="toolbar"><select class="select" id="exProject" style="min-width:210px">'+opts+'</select>' +
          '<select class="select" id="exQuality"><option value="1">1× Standard (900px)</option><option value="2" selected>2× High (1800px)</option><option value="3">3× Ultra (2700px)</option></select>' +
          '<select class="select" id="exPaper"><option value="portrait">Portrait 3:4</option><option value="square">Square 1:1</option><option value="wide">Landscape 4:3</option></select>' +
          '<label class="check"><input type="checkbox" id="exWatermark"'+ (S.settings().watermark?' checked':'') +'> Watermark (off by default)</label>' +
          '<span class="small muted" id="exInfo"></span></div>' +
        '<div class="grid grid-3 mb16">' + D.EXPORT_FORMATS.map(f =>
          '<button class="card card-hover" style="text-align:left;color:var(--text)" data-fmt="'+f.id+'">' +
          '<div style="font-size:24px;margin-bottom:9px">' + ({png:'🖼️',panels:'🎞️',svg:'〰️',pdf:'📕',cbz:'📚',json:'{ }',webp:'🌐'}[f.id]) + '</div>' +
          '<b>'+f.name+'</b><div class="small muted mt8">'+f.desc+'</div>' +
          '<div class="chip accent mt12">Export →</div></button>').join('') + '</div>' +
        '<div class="section-head"><h2>Page previews</h2><span class="small muted">Click a page to view full size</span></div>' +
        '<div id="exPreviews" class="grid grid-4"></div>' +
        '<div class="credit-block"><div class="cb-mark">Unlimited Export</div>' +
          '<p>Original platform: watermarked HD exports on paid tiers only. Here: every format is unlocked, every export is unlimited.</p>' +
          '<div class="cb-sign">Design and Developed by Mr.Busy</div></div>';
    },
    mount(root) {
      let p = S.activeProject();
      const q = () => +U.$('#exQuality', root).value;
      const dims = () => {
        const paper=U.$('#exPaper',root).value, k=q();
        return paper==='square' ? {w:1000*k,h:1000*k} : paper==='wide' ? {w:1200*k,h:900*k} : {w:900*k,h:1200*k};
      };
      const wm = () => U.$('#exWatermark', root).checked;
      const drawPreviews = () => {
        const d = dims(), box=U.$('#exPreviews', root);
        box.innerHTML='';
        p.pages.slice(0,8).forEach((pg,i)=>{
          const c=A.composePage(p,i,{quality:Math.min(1.4,q()),pageWidth:Math.round(d.w/2.4),pageHeight:Math.round(d.h/2.4),watermark:wm()});
          const url=c.toDataURL('image/png');
          const el=document.createElement('div');
          el.className='card pad-sm'; el.style.cursor='zoom-in';
          el.innerHTML='<img src="'+url+'" style="width:100%;border-radius:6px;display:block"><div class="small muted mt8" style="text-align:center">Page '+(i+1)+'</div>';
          el.onclick=()=>U.lightbox(url); box.appendChild(el);
        });
        U.$('#exInfo', root).textContent = p.pages.length+' pages · '+p.pages.reduce((a,x)=>a+x.panels.length,0)+' panels · '+dims().w+'×'+dims().h+' output';
      };
      U.$('#exProject', root).onchange=(e)=>{S.setActive(e.target.value);p=S.activeProject();drawPreviews();};
      U.$('#exQuality', root).onchange=drawPreviews;
      U.$('#exPaper', root).onchange=drawPreviews;
      U.$('#exWatermark', root).onchange=drawPreviews;
      drawPreviews();

      const buildPages = (mime='image/png') => {
        const d=dims(), out=[];
        p.pages.forEach((pg,i)=>{
          const c=A.composePage(p,i,{quality:1,pageWidth:d.w,pageHeight:d.h,watermark:wm(),footer:true});
          out.push({ name:'page_'+String(i+1).padStart(3,'0')+'.'+(mime==='image/webp'?'webp':mime==='image/png'?'png':'jpg'),
            url:c.toDataURL(mime,.93), bytes:U.dataURLtoBytes(c.toDataURL(mime,.93)) });
        });
        return out;
      };
      const fname = (ext) => U.safeFileName(p.title)+'.'+ext;

      U.$$('[data-fmt]', root).forEach(b => b.onclick = async () => {
        const fmt=b.dataset.fmt;
        U.toast('Preparing '+fmt.toUpperCase()+' export…','info');
        try {
          if (fmt==='png' || fmt==='webp') {
            const mime=fmt==='webp'?'image/webp':'image/png';
            const pages=buildPages(mime);
            const files=pages.map(x=>({name:x.name,data:x.bytes}));
            U.downloadBlob(U.zipFiles(files), fname('zip'));
            U.toast(pages.length+' pages exported as ZIP','success');
          } else if (fmt==='panels') {
            const files=[]; let n=0;
            p.pages.forEach((pg,pi)=>pg.panels.forEach(pn=>{
              const chars=p.characterIds.map(id=>S.get().characters.find(c=>c.id===id)).filter(Boolean);
              const c=A.renderPanel(pn,{width:900*q(),height:640*q(),style:S.styleById(p.style),characters:chars,filter:pn.filter,watermark:wm()});
              files.push({name:'panel_'+String(++n).padStart(3,'0')+'.png',data:U.dataURLtoBytes(c.toDataURL('image/png'))});
            }));
            U.downloadBlob(U.zipFiles(files), fname('zip'));
            U.toast(n+' individual panels exported','success');
          } else if (fmt==='cbz') {
            const pages=buildPages('image/png');
            const files=pages.map(x=>({name:x.name,data:x.bytes}));
            const info='<?xml version="1.0" encoding="utf-8"?><ComicInfo><Title>'+U.esc(p.title)+'</Title><Series>'+U.esc(p.series||'AIComic Builder Studio')+'</Series><Writer>Mr.Busy</Writer><Genre>'+U.esc(p.genre)+'</Genre><PageCount>'+pages.length+'</PageCount><Summary>'+U.esc(U.trunc(p.idea,300))+'</Summary></ComicInfo>';
            files.unshift({name:'ComicInfo.xml',data:new TextEncoder().encode(info)});
            const blob=U.zipFiles(files);
            if (window.desktop && window.desktop.isElectron) await U.saveBytes(fname('cbz'), new Uint8Array(await blob.arrayBuffer()), 'application/zip');
            else U.downloadBlob(blob, fname('cbz'));
            U.toast('CBZ comic archive exported','success');
          } else if (fmt==='svg') {
            const pages=buildPages('image/png');
            const d=dims();
            const svg='<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="'+d.w+'" height="'+(d.h*pages.length)+'" viewBox="0 0 '+d.w+' '+(d.h*pages.length)+'">' +
              pages.map((x,i)=>'<image x="0" y="'+(i*d.h)+'" width="'+d.w+'" height="'+d.h+'" xlink:href="'+x.url+'"/>').join('') +
              '<text x="20" y="'+(d.h*pages.length-12)+'" font-family="sans-serif" font-size="16" fill="#888">Design and Developed by Mr.Busy</text></svg>';
            U.downloadBlob(new Blob([svg],{type:'image/svg+xml'}), fname('svg'));
            U.toast('SVG exported','success');
          } else if (fmt==='pdf') {
            const pages=buildPages('image/png');
            const w=window.open('','_blank');
            if(!w){U.toast('Popup blocked — allow popups to print','warn');return;}
            w.document.write('<html><head><title>'+U.esc(p.title)+' — Print / Save as PDF</title><style>@page{size:auto;margin:0}body{margin:0;background:#333}img{width:100%;display:block;page-break-after:always}h3{color:#fff;font-family:sans-serif;text-align:center;padding:16px}</style></head><body><h3>Use your browser\'s Print dialog → "Save as PDF". Design and Developed by Mr.Busy</h3>'+pages.map(x=>'<img src="'+x.url+'">').join('')+'</body></html>');
            w.document.close(); setTimeout(()=>w.print(),700);
            U.toast('Print view opened — choose "Save as PDF"','success',5000);
          } else if (fmt==='json') {
            const json=JSON.stringify({app:'AIComic Builder Studio',exportedAt:new Date().toISOString(),credit:'Design and Developed by Mr.Busy',project:p},null,2);
            U.downloadBlob(new Blob([json],{type:'application/json'}), fname('json'));
            U.toast('Editable project JSON exported','success');
          }
        } catch(e) { U.toast('Export failed: '+e.message,'error',6000); console.error(e); }
      });
    }
  };
})(window.ACB_VIEWS);
