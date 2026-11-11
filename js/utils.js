/* ============================================================
   Shared helpers — Design and Developed by Mr.Busy
   ============================================================ */
window.ACB_U = (function () {

  const uid = (p = 'id') => p + '-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
  const trunc = (s, n = 60) => { s = String(s || ''); return s.length > n ? s.slice(0, n - 1) + '…' : s; };
  const fmtDate = (ts) => { try { return new Date(ts).toLocaleDateString(undefined, { year:'numeric', month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' }); } catch(e) { return '-'; } };
  const clone = (o) => JSON.parse(JSON.stringify(o));
  const debounce = (fn, ms = 220) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const rng = (seed) => { let s = (seed >>> 0) || 1; return () => { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; return ((s >>> 0) % 100000) / 100000; }; };
  const hash = (str) => { let h = 2166136261; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
  const pick = (arr, r) => arr[Math.floor(r() * arr.length) % arr.length];

  function toast(msg, type = 'info', ms = 3200) {
    const stack = document.getElementById('toast-stack');
    if (!stack) return;
    const el = document.createElement('div');
    el.className = 'toast ' + type;
    el.innerHTML = esc(msg);
    stack.appendChild(el);
    setTimeout(() => { el.style.opacity = '0'; el.style.transform = 'translateX(20px)'; el.style.transition = '.25s'; setTimeout(() => el.remove(), 260); }, ms);
  }

  function openModal(opts) {
    const root = document.getElementById('modal-root');
    const { title = '', body = '', footer = '', wide = false, onMount = null } = opts;
    root.innerHTML = '<div class="modal-backdrop"><div class="modal' + (wide ? ' wide' : '') + '">' +
      '<div class="modal-head"><h3>' + title + '</h3><button class="icon-btn" data-close>✕</button></div>' +
      '<div class="modal-body">' + body + '</div>' +
      (footer ? '<div class="modal-foot">' + footer + '</div>' : '') +
      '</div></div>';
    const close = () => { root.innerHTML = ''; };
    root.querySelector('[data-close]').onclick = close;
    root.querySelector('.modal-backdrop').onclick = (e) => { if (e.target.classList.contains('modal-backdrop')) close(); };
    $$('[data-close]', root).forEach(b => { if (!b.onclick) b.onclick = close; });
    if (onMount) onMount(root.querySelector('.modal'), close);
    return close;
  }

  function confirmDialog(message, onYes, title = 'Please confirm') {
    const close = openModal({
      title: esc(title),
      body: '<p style="margin:0;color:var(--text-2);line-height:1.6">' + esc(message) + '</p>',
      footer: '<button class="btn" data-close>Cancel</button><button class="btn btn-danger" id="cfmYes">Confirm</button>',
      onMount: (m, c) => { m.querySelector('#cfmYes').onclick = () => { c(); onYes(); }; }
    });
    return close;
  }

  function lightbox(src) {
    const box = document.getElementById('lightbox');
    document.getElementById('lightboxImg').src = src;
    box.classList.remove('hidden');
    box.onclick = (e) => { if (e.target === box || e.target.id === 'lightboxClose') box.classList.add('hidden'); };
  }

  /* ---------- downloads ---------- */
  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; document.body.appendChild(a); a.click();
    setTimeout(() => { a.remove(); URL.revokeObjectURL(url); }, 1500);
  }
  function downloadDataURL(dataUrl, filename) {
    const a = document.createElement('a');
    a.href = dataUrl; a.download = filename; document.body.appendChild(a); a.click();
    setTimeout(() => a.remove(), 1200);
  }
  function dataURLtoBytes(dataUrl) {
    const base64 = String(dataUrl).split(',')[1] || '';
    const bin = atob(base64); const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  }
  function bytesToDataURL(bytes, mime = 'image/png') {
    let bin = ''; const chunk = 8192;
    for (let i = 0; i < bytes.length; i += chunk) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
    return 'data:' + mime + ';base64,' + btoa(bin);
  }
  function canvasBlob(canvas, mime = 'image/png', quality = .92) {
    return new Promise(res => canvas.toBlob(b => res(b), mime, quality));
  }
  function loadImage(src) {
    return new Promise((res, rej) => { const im = new Image(); im.onload = () => res(im); im.onerror = rej; im.crossOrigin = 'anonymous'; im.src = src; });
  }
  function safeFileName(s) { return String(s || 'comic').replace(/[^a-z0-9\-_ ]/gi, '').trim().replace(/\s+/g, '-').slice(0, 60) || 'comic'; }

  /* ---------- minimal ZIP writer (store method) ---------- */
  const CRC_TABLE = (() => {
    const t = new Uint32Array(256);
    for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1); t[n] = c >>> 0; }
    return t;
  })();
  function crc32(bytes) {
    let c = 0xFFFFFFFF;
    for (let i = 0; i < bytes.length; i++) c = CRC_TABLE[(c ^ bytes[i]) & 0xFF] ^ (c >>> 8);
    return (c ^ 0xFFFFFFFF) >>> 0;
  }
  function zipFiles(files) {
    const enc = new TextEncoder();
    const parts = [], central = [];
    let offset = 0;
    const now = new Date();
    const dosTime = ((now.getHours() & 31) << 11) | ((now.getMinutes() & 63) << 5) | ((now.getSeconds() / 2) & 31);
    const dosDate = (((now.getFullYear() - 1980) & 127) << 9) | (((now.getMonth() + 1) & 15) << 5) | (now.getDate() & 31);
    files.forEach(f => {
      const nameBytes = enc.encode(f.name);
      const data = f.data instanceof Uint8Array ? f.data : new Uint8Array(f.data);
      const crc = crc32(data);
      const lh = new Uint8Array(30 + nameBytes.length);
      const lv = new DataView(lh.buffer);
      lv.setUint32(0, 0x04034b50, true); lv.setUint16(4, 20, true); lv.setUint16(6, 0x0800, true);
      lv.setUint16(8, 0, true); lv.setUint16(10, dosTime, true); lv.setUint16(12, dosDate, true);
      lv.setUint32(14, crc, true); lv.setUint32(18, data.length, true); lv.setUint32(22, data.length, true);
      lv.setUint16(26, nameBytes.length, true); lv.setUint16(28, 0, true);
      lh.set(nameBytes, 30);
      parts.push(lh, data);
      const ch = new Uint8Array(46 + nameBytes.length);
      const cv = new DataView(ch.buffer);
      cv.setUint32(0, 0x02014b50, true); cv.setUint16(4, 20, true); cv.setUint16(6, 20, true);
      cv.setUint16(8, 0x0800, true); cv.setUint16(10, 0, true); cv.setUint16(12, dosTime, true); cv.setUint16(14, dosDate, true);
      cv.setUint32(16, crc, true); cv.setUint32(20, data.length, true); cv.setUint32(24, data.length, true);
      cv.setUint16(28, nameBytes.length, true); cv.setUint16(30, 0, true); cv.setUint16(32, 0, true);
      cv.setUint16(34, 0, true); cv.setUint16(36, 0, true); cv.setUint32(38, 0, true); cv.setUint32(42, offset, true);
      ch.set(nameBytes, 46);
      central.push(ch);
      offset += lh.length + data.length;
    });
    const cdSize = central.reduce((a, b) => a + b.length, 0);
    const eocd = new Uint8Array(22); const ev = new DataView(eocd.buffer);
    ev.setUint32(0, 0x06054b50, true); ev.setUint16(4, 0, true); ev.setUint16(6, 0, true);
    ev.setUint16(8, files.length, true); ev.setUint16(10, files.length, true);
    ev.setUint32(12, cdSize, true); ev.setUint32(16, offset, true); ev.setUint16(20, 0, true);
    return new Blob([...parts, ...central, eocd], { type: 'application/zip' });
  }

  /* ---------- optional Electron native save ---------- */
  async function saveBytes(filename, bytes, mime = 'application/octet-stream') {
    if (window.desktop && window.desktop.isElectron) {
      let bin = ''; const chunk = 8192;
      for (let i = 0; i < bytes.length; i += chunk) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
      const r = await window.desktop.saveData(filename, btoa(bin));
      if (r && r.ok) { toast('Saved to ' + r.path, 'success'); return; }
      if (r && r.error) toast('Native save failed: ' + r.error, 'warn');
    }
    downloadBlob(new Blob([bytes], { type: mime }), filename);
  }

  function readFileAsDataURL(file) {
    return new Promise((res, rej) => { const fr = new FileReader(); fr.onload = () => res(fr.result); fr.onerror = rej; fr.readAsDataURL(file); });
  }

  return { uid, esc, trunc, fmtDate, clone, debounce, $, $$, rng, hash, pick, toast, openModal, confirmDialog, lightbox,
    downloadBlob, downloadDataURL, dataURLtoBytes, bytesToDataURL, canvasBlob, loadImage, safeFileName,
    crc32, zipFiles, saveBytes, readFileAsDataURL };
})();
