/* ============================================================
   Offline comic render engine + story engine
   Deterministic procedural artwork (no API key required).
   An optional OpenAI-compatible endpoint can be configured in Settings.
   Design and Developed by Mr.Busy
   ============================================================ */
window.ACB_ART = (function () {
  const U = window.ACB_U, D = window.ACB_DATA, S = window.ACB_STORE;

  /* Uploaded artwork is decoded once and cached so rendering stays synchronous */
  const imgCache = new Map();
  function preload(src) {
    if (!src) return Promise.resolve(null);
    if (imgCache.has(src)) return Promise.resolve(imgCache.get(src));
    return new Promise(res => {
      const im = new Image();
      im.onload = () => { imgCache.set(src, im); res(im); };
      im.onerror = () => res(null);
      im.src = src;
    });
  }
  function preloadProject(p) {
    if (!p) return Promise.resolve();
    const urls = [];
    p.pages.forEach(pg => pg.panels.forEach(pn => { if (pn.customImage && pn.image) urls.push(pn.image); }));
    return Promise.all([...new Set(urls)].map(preload));
  }

  /* ---------- colour helpers ---------- */
  function hex2rgb(h) {
    h = String(h || '#888888').replace('#','');
    if (h.length === 3) h = h.split('').map(c => c + c).join('');
    const n = parseInt(h, 16);
    return { r:(n >> 16) & 255, g:(n >> 8) & 255, b:n & 255 };
  }
  function mix(a, b, t) {
    const A = hex2rgb(a), B = hex2rgb(b);
    const c = v => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0');
    return '#' + c(A.r + (B.r - A.r) * t) + c(A.g + (B.g - A.g) * t) + c(A.b + (B.b - A.b) * t);
  }
  function shade(hex, amt) { return mix(hex, amt > 0 ? '#ffffff' : '#000000', Math.abs(amt)); }
  function rgbStr(c, a = 1) { const o = hex2rgb(c); return 'rgba(' + o.r + ',' + o.g + ',' + o.b + ',' + a + ')'; }

  /* ---------- canvas primitives ---------- */
  function roundRect(ctx, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y); ctx.closePath();
  }
  function wrapText(ctx, text, maxWidth) {
    const words = String(text || '').split(/\s+/).filter(Boolean);
    const lines = []; let line = '';
    words.forEach(w => {
      const t = line ? line + ' ' + w : w;
      if (ctx.measureText(t).width > maxWidth && line) { lines.push(line); line = w; }
      else line = t;
    });
    if (line) lines.push(line);
    return lines;
  }
  function drawTextLines(ctx, lines, x, y, lh) { lines.forEach((l, i) => ctx.fillText(l, x, y + i * lh)); }

  /* ---------- backgrounds ---------- */
  function sceneKind(text) {
    const t = String(text || '').toLowerCase();
    if (/neon|cyber|city|rooftop|alley|metropolis|street|office|rain/.test(t)) return 'city';
    if (/space|star|moon|planet|crater|galaxy|cosmic|orbit|sky|cloud/.test(t)) return 'space';
    if (/forest|dragon|magical|garden|greenhouse|tree|village|bakery|cafe|coffee/.test(t)) return 'forest';
    if (/cavern|crystal|cave|mine|underground|dungeon/.test(t)) return 'cave';
    if (/sea|harbour|harbor|ocean|ship|pirate|beach|island/.test(t)) return 'sea';
    if (/castle|school|tower|temple|academy|clock|library|hotel/.test(t)) return 'architecture';
    if (/train|carriage|workshop|room|kitchen|lab|machine/.test(t)) return 'interior';
    return 'hills';
  }

  function drawBackground(ctx, W, H, style, panel, r) {
    const P = style.colors, kind = sceneKind(panel.scene + ' ' + panel.caption);
    const top = monoOr(style, shade(P[2], .38)), bottom = monoOr(style, P[0]);
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, top); g.addColorStop(1, bottom);
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

    // sun / moon
    if (r() > .28) {
      const cx = W * (.18 + r() * .64), cy = H * (.14 + r() * .22), rad = H * (.07 + r() * .1);
      ctx.save();
      ctx.globalAlpha = .55;
      ctx.fillStyle = monoOr(style, shade(P[0], .55));
      ctx.beginPath(); ctx.arc(cx, cy, rad, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }

    if (kind === 'city') {
      const n = 10 + Math.floor(r() * 8);
      for (let i = 0; i < n; i++) {
        const bw = W / n * (.7 + r() * .8), bh = H * (.22 + r() * .5);
        const bx = i * W / n - bw * .1, by = H - bh;
        ctx.fillStyle = monoOr(style, mix(P[2], '#000000', .12 + r() * .35));
        ctx.fillRect(bx, by, bw, bh);
        ctx.fillStyle = rgbStr(monoOr(style, P[0]), .65);
        for (let wy = by + 12; wy < H - 8; wy += 16)
          for (let wx = bx + 6; wx < bx + bw - 6; wx += 13)
            if (r() > .45) ctx.fillRect(wx, wy, 5, 7);
      }
      if (style.texture === 'neon') { ctx.shadowBlur = 18; ctx.shadowColor = P[0]; }
    } else if (kind === 'space') {
      ctx.fillStyle = monoOr(style, '#ffffff');
      for (let i = 0; i < 90; i++) { ctx.globalAlpha = .25 + r() * .7; ctx.beginPath(); ctx.arc(r() * W, r() * H * .8, .5 + r() * 1.7, 0, 7); ctx.fill(); }
      ctx.globalAlpha = 1;
      const px = W * (.6 + r() * .25), py = H * (.2 + r() * .2), pr = H * (.1 + r() * .1);
      ctx.fillStyle = monoOr(style, mix(P[0], P[1], .4)); ctx.beginPath(); ctx.arc(px, py, pr, 0, 7); ctx.fill();
      ctx.strokeStyle = rgbStr(monoOr(style, '#ffffff'), .5); ctx.lineWidth = 5;
      ctx.beginPath(); ctx.ellipse(px, py, pr * 1.6, pr * .35, -.35, 0, 7); ctx.stroke();
    } else if (kind === 'forest') {
      for (let layer = 0; layer < 3; layer++) {
        ctx.fillStyle = monoOr(style, mix(P[2], '#000000', layer * .15));
        const base = H * (.62 + layer * .14);
        ctx.beginPath(); ctx.moveTo(0, H);
        for (let x = 0; x <= W; x += W / 12) ctx.lineTo(x, base - r() * H * (.14 + layer * .04));
        ctx.lineTo(W, H); ctx.closePath(); ctx.fill();
      }
      for (let i = 0; i < 7; i++) {
        const tx = r() * W, ty = H * (.55 + r() * .3), th = H * (.18 + r() * .22);
        ctx.fillStyle = monoOr(style, mix(P[2], '#000000', .35));
        ctx.beginPath(); ctx.moveTo(tx, ty - th); ctx.lineTo(tx - th * .28, ty); ctx.lineTo(tx + th * .28, ty); ctx.closePath(); ctx.fill();
        ctx.fillRect(tx - th * .05, ty, th * .1, H - ty);
      }
    } else if (kind === 'cave') {
      for (let i = 0; i < 16; i++) {
        const cx = r() * W, cy = H * (.3 + r() * .7), sz = H * (.06 + r() * .16);
        ctx.fillStyle = rgbStr(monoOr(style, mix(P[0], '#ffffff', .35)), .55);
        ctx.beginPath(); ctx.moveTo(cx, cy - sz); ctx.lineTo(cx + sz * .4, cy); ctx.lineTo(cx, cy + sz * .5); ctx.lineTo(cx - sz * .4, cy); ctx.closePath(); ctx.fill();
      }
    } else if (kind === 'sea') {
      ctx.fillStyle = monoOr(style, mix(P[2], P[1], .35)); ctx.fillRect(0, H * .66, W, H * .34);
      ctx.strokeStyle = rgbStr(monoOr(style, '#ffffff'), .35); ctx.lineWidth = 2;
      for (let j = 0; j < 8; j++) { const y = H * (.68 + j * .04); ctx.beginPath(); ctx.moveTo(0, y); for (let x = 0; x < W; x += 22) ctx.lineTo(x, y + Math.sin(x / 40 + j) * 4); ctx.stroke(); }
      ctx.fillStyle = monoOr(style, mix(P[2], '#000000', .3));
      ctx.beginPath(); ctx.moveTo(W * .55, H * .66); ctx.lineTo(W * .9, H * .66); ctx.lineTo(W * .8, H * .75); ctx.lineTo(W * .6, H * .75); ctx.closePath(); ctx.fill();
      ctx.fillRect(W * .72, H * .35, 3, H * .31);
      ctx.beginPath(); ctx.moveTo(W * .72, H * .36); ctx.lineTo(W * .86, H * .62); ctx.lineTo(W * .72, H * .62); ctx.closePath(); ctx.fill();
    } else if (kind === 'architecture') {
      const bx = W * .12, bw = W * .76, by = H * .22;
      ctx.fillStyle = monoOr(style, mix(P[2], '#000000', .2)); ctx.fillRect(bx, by, bw, H - by);
      ctx.fillStyle = monoOr(style, P[0]);
      for (let i = 0; i < 4; i++) { ctx.fillRect(bx + bw * (.12 + i * .24), by + H * .14, bw * .09, H * .2); ctx.beginPath(); ctx.arc(bx + bw * (.12 + i * .24) + bw * .045, by + H * .14, bw * .045, Math.PI, 0); ctx.fill(); }
      ctx.fillStyle = monoOr(style, mix(P[1], '#000000', .3));
      ctx.beginPath(); ctx.moveTo(bx - 10, by); ctx.lineTo(bx + bw * .5, by - H * .2); ctx.lineTo(bx + bw + 10, by); ctx.closePath(); ctx.fill();
    } else if (kind === 'interior') {
      ctx.fillStyle = monoOr(style, mix(P[2], '#000000', .35)); ctx.fillRect(0, 0, W * .12, H); ctx.fillRect(W * .88, 0, W * .12, H);
      for (let i = 0; i < 3; i++) {
        const wx = W * (.16 + i * .3);
        ctx.fillStyle = rgbStr(monoOr(style, P[0]), .35); ctx.fillRect(wx, H * .16, W * .16, H * .34);
        ctx.strokeStyle = monoOr(style, P[2]); ctx.lineWidth = 3; ctx.strokeRect(wx, H * .16, W * .16, H * .34);
      }
    } else {
      ctx.fillStyle = monoOr(style, mix(P[1], P[2], .5));
      ctx.beginPath(); ctx.moveTo(0, H); ctx.lineTo(0, H * .7);
      for (let x = 0; x <= W; x += W / 8) ctx.lineTo(x, H * (.6 + r() * .18));
      ctx.lineTo(W, H); ctx.closePath(); ctx.fill();
      ctx.fillStyle = monoOr(style, mix(P[2], '#000000', .25));
      ctx.beginPath(); ctx.moveTo(0, H); ctx.lineTo(0, H * .84);
      for (let x = 0; x <= W; x += W / 6) ctx.lineTo(x, H * (.77 + r() * .14));
      ctx.lineTo(W, H); ctx.closePath(); ctx.fill();
    }
    ctx.shadowBlur = 0;
    return kind;
  }
  function monoOr(style, c) { return style.mono || style.monoOverride ? toGray(c) : c; }
  function toGray(c) { const o = hex2rgb(c); const v = Math.round(o.r * .299 + o.g * .587 + o.b * .114); return '#' + [v,v,v].map(x => x.toString(16).padStart(2,'0')).join(''); }

  /* ---------- textures ---------- */
  function applyTexture(ctx, W, H, style, r) {
    const t = style.texture;
    if (t === 'halftone' || (style.halftone > .3)) {
      const step = t === 'halftone' ? 11 : 15;
      ctx.fillStyle = 'rgba(0,0,0,' + (style.halftone * .28) + ')';
      for (let y = 0; y < H; y += step) for (let x = 0; x < W; x += step) { ctx.beginPath(); ctx.arc(x + (y % (step*2) ? step/2 : 0), y, 1.6, 0, 7); ctx.fill(); }
    }
    if (t === 'screentone') {
      ctx.strokeStyle = 'rgba(0,0,0,.16)'; ctx.lineWidth = 1;
      for (let x = -H; x < W; x += 6) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + H, H); ctx.stroke(); }
    }
    if (t === 'grain' || t === 'vintage' || t === 'noir') {
      const n = Math.floor(W * H / 260);
      for (let i = 0; i < n; i++) { ctx.fillStyle = 'rgba(' + (r() > .5 ? '255,255,255' : '0,0,0') + ',' + (r() * .12) + ')'; ctx.fillRect(r() * W, r() * H, 1.4, 1.4); }
    }
    if (t === 'neon') {
      ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = rgbStr(style.colors[0], .06); ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'source-over';
    }
    if (t === 'watercolor' || t === 'soft' || t === 'oil') {
      for (let i = 0; i < 16; i++) {
        ctx.fillStyle = rgbStr(style.colors[i % 3], .05 + r() * .06);
        ctx.beginPath(); ctx.ellipse(r() * W, r() * H, W * (.05 + r() * .16), H * (.04 + r() * .14), r() * 3, 0, 7); ctx.fill();
      }
    }
    if (t === 'pencil') {
      ctx.strokeStyle = 'rgba(40,40,40,.14)'; ctx.lineWidth = 1;
      for (let i = 0; i < 140; i++) { const x = r()*W, y = r()*H; ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(x + 8 + r()*18, y + (r()-.5)*6); ctx.stroke(); }
    }
    if (style.id === 'manga' || style.id === 'manhwa') {
      ctx.strokeStyle = 'rgba(0,0,0,.20)'; ctx.lineWidth = 1.3;
      const vx = W * (.3 + r() * .4), vy = H * (.3 + r() * .3);
      for (let i = 0; i < 26; i++) { const a = (i / 26) * Math.PI * 2; ctx.beginPath(); ctx.moveTo(vx + Math.cos(a) * H * .12, vy + Math.sin(a) * H * .12); ctx.lineTo(vx + Math.cos(a) * W, vy + Math.sin(a) * W); ctx.stroke(); }
    }
  }

  /* ---------- characters ---------- */
  function drawFigure(ctx, cx, cy, scale, char, style, r, expression) {
    const body = monoOr(style, char.color || style.colors[0]);
    const hair = monoOr(style, char.hair || '#2b2b3a');
    const skin = monoOr(style, mix('#ffd9b3', char.color || '#ffffff', .12));
    const line = Math.max(1, style.line || 2);
    const headR = 26 * scale;
    const bodyH = 74 * scale, bodyW = 52 * scale;
    ctx.save(); ctx.lineJoin = 'round'; ctx.lineCap = 'round';

    // shadow
    ctx.fillStyle = 'rgba(0,0,0,.18)';
    ctx.beginPath(); ctx.ellipse(cx, cy + bodyH * .95, bodyW * .72, 8 * scale, 0, 0, 7); ctx.fill();

    // cape / accessory
    if (r() > .55) {
      ctx.fillStyle = monoOr(style, mix(char.color || style.colors[0], '#000000', .3));
      ctx.beginPath(); ctx.moveTo(cx - bodyW * .5, cy + headR * .4); ctx.quadraticCurveTo(cx - bodyW * 1.4, cy + bodyH * .9, cx - bodyW * .9, cy + bodyH * 1.05);
      ctx.lineTo(cx + bodyW * .9, cy + bodyH * 1.05); ctx.quadraticCurveTo(cx + bodyW * 1.4, cy + bodyH * .9, cx + bodyW * .5, cy + headR * .4); ctx.closePath(); ctx.fill();
    }
    // body
    ctx.fillStyle = body; ctx.strokeStyle = 'rgba(15,17,25,.85)'; ctx.lineWidth = line;
    roundRect(ctx, cx - bodyW/2, cy + headR * .55, bodyW, bodyH, 14 * scale); ctx.fill(); ctx.stroke();
    // belt / emblem
    ctx.fillStyle = monoOr(style, style.colors[1]);
    ctx.beginPath(); ctx.arc(cx, cy + headR + bodyH * .42, 9 * scale, 0, 7); ctx.fill();
    // arms
    ctx.strokeStyle = 'rgba(15,17,25,.85)'; ctx.lineWidth = 7 * scale;
    ctx.beginPath(); ctx.moveTo(cx - bodyW*.45, cy + headR + 6*scale); ctx.lineTo(cx - bodyW*.78, cy + bodyH*.85); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx + bodyW*.45, cy + headR + 6*scale); ctx.lineTo(cx + bodyW*.78, cy + bodyH*.85); ctx.stroke();
    // head
    ctx.fillStyle = skin; ctx.lineWidth = line;
    ctx.beginPath(); ctx.arc(cx, cy, headR, 0, 7); ctx.fill(); ctx.stroke();
    // hair
    ctx.fillStyle = hair;
    ctx.beginPath(); ctx.arc(cx, cy - headR * .22, headR * 1.02, Math.PI * 1.02, Math.PI * 1.98); ctx.closePath(); ctx.fill();
    if (r() > .5) { ctx.beginPath(); ctx.ellipse(cx - headR * .75, cy - headR * .1, headR * .32, headR * .55, .3, 0, 7); ctx.fill(); }
    // eyes
    const ey = cy + headR * .08, ex = headR * .38;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.ellipse(cx - ex, ey, headR*.2, headR*.24, 0, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.ellipse(cx + ex, ey, headR*.2, headR*.24, 0, 0, 7); ctx.fill();
    ctx.fillStyle = '#161a24';
    const squint = /Angry|Determined|Thinking/.test(expression || '');
    [-1, 1].forEach(s => {
      ctx.beginPath(); ctx.arc(cx + s*ex + (squint ? s*2*scale : 0), ey + (squint ? 2*scale : 0), headR*.09, 0, 7); ctx.fill();
    });
    // brows / mouth
    ctx.strokeStyle = '#161a24'; ctx.lineWidth = Math.max(1.5, 2.2 * scale);
    [-1, 1].forEach(s => { ctx.beginPath(); ctx.moveTo(cx + s*ex - headR*.16, ey - headR*.36 + (squint ? s*3*scale : 0)); ctx.lineTo(cx + s*ex + headR*.16, ey - headR*.36); ctx.stroke(); });
    ctx.beginPath();
    const e = expression || 'Neutral';
    if (/Joyful|Surprised|Shouting/.test(e)) ctx.arc(cx, cy + headR * .48, headR * .24, 0, Math.PI);
    else if (/Sad|Scared/.test(e)) ctx.arc(cx, cy + headR * .66, headR * .22, Math.PI, 0);
    else { ctx.moveTo(cx - headR*.2, cy + headR*.48); ctx.lineTo(cx + headR*.2, cy + headR*.48); }
    ctx.stroke();
    ctx.restore();
  }

  function drawCharacters(ctx, W, H, style, panel, r, chars) {
    const cam = panel.camera || 'Medium Shot';
    const close = /Close-Up|Extreme/.test(cam), wide = /Wide|Establishing|Bird/.test(cam);
    const list = (chars && chars.length ? chars : [
      { color: style.colors[0], hair: '#2b2b3a' }, { color: style.colors[1], hair: '#5a3a2a' }
    ]).slice(0, 3);
    if (close && list.length) {
      const c = list[0];
      ctx.save(); ctx.translate(W * .46, H * .58); ctx.scale(3.4, 3.4); ctx.translate(-W*.46/3.4, -H*.58/3.4);
      drawFigure(ctx, W * .46, H * .58, 1.05, c, style, r, panel.expression); ctx.restore();
      return;
    }
    const scale = wide ? .72 : 1.15;
    list.forEach((c, i) => {
      const x = W * (.28 + i * (.44 / Math.max(1, list.length - 1) || .3)) + (r() - .5) * 20;
      const y = H * (.56 + (r() - .5) * .08);
      drawFigure(ctx, x, y, scale * (1 - i * .08), c, style, r, i === 0 ? panel.expression : 'Neutral');
    });
  }

  /* ---------- lettering ---------- */
  function drawBubbles(ctx, W, H, style, panel) {
    const b = panel.bubble || { x:.55, y:.12, w:.4, h:.24, type:'Speech', fontSize:15 };
    const fs = Math.max(11, (b.fontSize || 15) * (W / 640));
    const ink = '#141821', paper = style.mono ? '#ffffff' : '#fffdf7';

    if (panel.dialogue && panel.dialogue.trim()) {
      const x = W * b.x, y = H * b.y, w = W * b.w, h = Math.max(H * b.h, fs * 2.6);
      ctx.save();
      if (b.type === 'Thought') {
        ctx.fillStyle = paper; ctx.strokeStyle = ink; ctx.lineWidth = 2.2;
        ctx.beginPath();
        for (let i = 0; i < 9; i++) { const a = i / 9 * Math.PI * 2; ctx.arc(x + w/2 + Math.cos(a)*w*.46, y + h/2 + Math.sin(a)*h*.44, Math.min(w,h)*.27, 0, 7); }
        ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.arc(x + w*.22, y + h + h*.2, fs*.4, 0, 7); ctx.fill(); ctx.stroke();
      } else if (b.type === 'Whisper') {
        ctx.setLineDash([6, 5]); ctx.fillStyle = paper; ctx.strokeStyle = ink; ctx.lineWidth = 2;
        roundRect(ctx, x, y, w, h, 16); ctx.fill(); ctx.stroke(); ctx.setLineDash([]);
      } else if (b.type === 'Shout') {
        ctx.fillStyle = paper; ctx.strokeStyle = ink; ctx.lineWidth = 2.5;
        ctx.beginPath(); const seg = 14;
        for (let i = 0; i < seg; i++) { const a = i/seg*Math.PI*2, rad = (i%2 ? .42 : .58) * Math.min(w,h); const px = x+w/2+Math.cos(a)*rad*1.5, py = y+h/2+Math.sin(a)*rad; i ? ctx.lineTo(px,py) : ctx.moveTo(px,py); }
        ctx.closePath(); ctx.fill(); ctx.stroke();
      } else {
        ctx.fillStyle = paper; ctx.strokeStyle = ink; ctx.lineWidth = 2.2;
        ctx.beginPath(); ctx.ellipse(x + w/2, y + h/2, w/2, h/2, 0, 0, 7); ctx.fill(); ctx.stroke();
        // tail
        ctx.beginPath(); ctx.moveTo(x + w*.34, y + h*.88); ctx.lineTo(x + w*.24, y + h + h*.34); ctx.lineTo(x + w*.54, y + h*.9); ctx.closePath(); ctx.fill(); ctx.stroke();
      }
      ctx.fillStyle = ink; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.font = '700 ' + fs + 'px "Comic Sans MS", "Segoe UI", sans-serif';
      const lines = wrapText(ctx, panel.dialogue, w * .78).slice(0, 4);
      drawTextLines(ctx, lines, x + w/2, y + h/2 - (lines.length - 1) * fs * .6, fs * 1.2);
      ctx.restore();
    }
    if (panel.caption && panel.caption.trim()) {
      ctx.save();
      const cw = Math.min(W * .56, 420), ch = fs * 2.1;
      ctx.fillStyle = style.mono ? '#ffffff' : '#f7f0d8'; ctx.strokeStyle = ink; ctx.lineWidth = 2;
      roundRect(ctx, W*.035, H*.05, cw, ch, 4); ctx.fill(); ctx.stroke();
      ctx.fillStyle = ink; ctx.font = '700 ' + (fs*.86) + 'px "Segoe UI", sans-serif'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      const cl = wrapText(ctx, panel.caption, cw - 20).slice(0, 2);
      drawTextLines(ctx, cl, W*.035 + 10, H*.05 + ch/2 - (cl.length-1)*fs*.5, fs*.95);
      ctx.restore();
    }
    if (panel.sfx && panel.sfx.trim()) {
      ctx.save();
      ctx.translate(W * .74, H * .68); ctx.rotate(-.18);
      ctx.font = '900 ' + (fs * 2.5) + 'px "Arial Black", Impact, sans-serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
      ctx.lineWidth = 8; ctx.strokeStyle = '#ffffff'; ctx.strokeText(panel.sfx, 0, 0);
      ctx.lineWidth = 3; ctx.strokeStyle = ink; ctx.strokeText(panel.sfx, 0, 0);
      ctx.fillStyle = style.colors[0]; ctx.fillText(panel.sfx, 0, 0);
      ctx.restore();
    }
  }

  /* ---------- filters (also used by Filters & FX) ---------- */
  function applyFilter(canvas, id, strength = 1) {
    if (!id || id === 'none') return canvas;
    const ctx = canvas.getContext('2d'), W = canvas.width, H = canvas.height;
    const img = ctx.getImageData(0, 0, W, H), d = img.data;
    const s = Math.max(.1, Math.min(2, strength));
    if (id === 'noir' || id === 'ink' || id === 'sepia' || id === 'vintage' || id === 'saturate' || id === 'posterize' || id === 'invert' || id === 'emboss') {
      for (let i = 0; i < d.length; i += 4) {
        let r = d[i], g = d[i+1], b = d[i+2];
        if (id === 'noir' || id === 'ink') { const v = r*.299 + g*.587 + b*.114; const k = id === 'ink' ? 1.5 : 1; r = g = b = Math.max(0, Math.min(255, (v - 128) * k * s + 128)); }
        else if (id === 'sepia' || id === 'vintage') { const tr = r*.393+g*.769+b*.189, tg = r*.349+g*.686+b*.168, tb = r*.272+g*.534+b*.131; r = r + (tr-r)*s; g = g + (tg-g)*s; b = b + (tb-b)*s; if (id === 'vintage') { r*=.96; g*=.98; b*=1.04; } }
        else if (id === 'saturate') { const v = r*.299+g*.587+b*.114; r = v + (r-v)*1.7*s; g = v + (g-v)*1.7*s; b = v + (b-v)*1.7*s; }
        else if (id === 'posterize') { const step = Math.max(16, 90/s); r = Math.round(r/step)*step; g = Math.round(g/step)*step; b = Math.round(b/step)*step; }
        else if (id === 'invert') { r = 255-r; g = 255-g; b = 255-b; }
        d[i] = Math.max(0,Math.min(255,r)); d[i+1] = Math.max(0,Math.min(255,g)); d[i+2] = Math.max(0,Math.min(255,b));
      }
      if (id === 'emboss') {
        const copy = new Uint8ClampedArray(d);
        for (let y = 1; y < H-1; y++) for (let x = 1; x < W-1; x++) {
          const i = (y*W+x)*4, j = ((y-1)*W+(x-1))*4;
          for (let c = 0; c < 3; c++) d[i+c] = Math.max(0, Math.min(255, 128 + (copy[i+c] - copy[j+c]) * s));
        }
      }
      ctx.putImageData(img, 0, 0);
    }
    if (id === 'halftone' || id === 'screentone') {
      const small = document.createElement('canvas'); small.width = Math.max(40, Math.round(W/8)); small.height = Math.max(40, Math.round(H/8));
      const sc = small.getContext('2d'); sc.drawImage(canvas, 0, 0, small.width, small.height);
      const sd = sc.getImageData(0,0,small.width,small.height);
      ctx.fillStyle = '#fff'; ctx.fillRect(0,0,W,H); ctx.fillStyle = '#141821';
      const step = id === 'halftone' ? 8 : 5;
      for (let y = 0; y < small.height; y++) for (let x = 0; x < small.width; x++) {
        const i = (y*small.width+x)*4, lum = (sd.data[i]*.299+sd.data[i+1]*.587+sd.data[i+2]*.114)/255;
        const rad = (1-lum) * step * .62 * s;
        if (rad > .4) { ctx.beginPath(); ctx.arc(x*W/small.width, y*H/small.height, rad, 0, 7); ctx.fill(); }
      }
    }
    if (id === 'pixel') {
      const f = Math.max(3, Math.round(14 / s));
      const tmp = document.createElement('canvas'); tmp.width = Math.max(8, Math.ceil(W/f)); tmp.height = Math.max(8, Math.ceil(H/f));
      tmp.getContext('2d').drawImage(canvas, 0, 0, tmp.width, tmp.height);
      ctx.imageSmoothingEnabled = false; ctx.clearRect(0,0,W,H); ctx.drawImage(tmp, 0, 0, W, H); ctx.imageSmoothingEnabled = true;
    }
    if (id === 'grain') {
      for (let i = 0; i < d.length; i += 4) { const n = (Math.random()-.5)*70*s; d[i]+=n; d[i+1]+=n; d[i+2]+=n; }
      ctx.putImageData(img, 0, 0);
    }
    if (id === 'vignette') {
      const g = ctx.createRadialGradient(W/2,H/2,Math.min(W,H)*.25,W/2,H/2,Math.max(W,H)*.72);
      g.addColorStop(0,'rgba(0,0,0,0)'); g.addColorStop(1,'rgba(0,0,0,'+(0.72*s)+')');
      ctx.fillStyle = g; ctx.fillRect(0,0,W,H);
    }
    if (id === 'neon') {
      ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = 'rgba(255,45,150,'+(.16*s)+')'; ctx.fillRect(0,0,W,H);
      ctx.fillStyle = 'rgba(60,220,255,'+(.12*s)+')'; ctx.fillRect(0,0,W,H); ctx.globalCompositeOperation = 'source-over';
    }
    if (id === 'watercolor') {
      ctx.globalAlpha = .18 * s;
      for (let i=0;i<26;i++){ ctx.fillStyle = ['#ffffff','#ffd6e8','#cde8ff'][i%3]; ctx.beginPath(); ctx.ellipse(Math.random()*W, Math.random()*H, W*(.03+Math.random()*.12), H*(.03+Math.random()*.1), Math.random()*3,0,7); ctx.fill(); }
      ctx.globalAlpha = 1;
    }
    return canvas;
  }

  /* ---------- main panel renderer ---------- */
  function renderPanel(panel, opts = {}) {
    const W = opts.width || 640, H = opts.height || 420;
    const style = typeof opts.style === 'string' ? S.styleById(opts.style) : (opts.style || S.styleById('american-comic'));
    const canvas = document.createElement('canvas'); canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext('2d');
    const seed = (panel.seed || 1) + U.hash(String(panel.scene || '') + String(panel.dialogue || '') + style.id);
    const r = U.rng(seed);

    if (panel.customImage && panel.image) {
      // custom uploaded art: draw cover-fit, then overlays
      const im = imgCache.get(panel.image);
      if (im && im.naturalWidth) {
        const sc = Math.max(W/im.naturalWidth, H/im.naturalHeight);
        const dw = im.naturalWidth*sc, dh = im.naturalHeight*sc;
        ctx.drawImage(im, (W-dw)/2, (H-dh)/2, dw, dh);
      } else {
        preload(panel.image);
        ctx.fillStyle = '#dfe4ee'; ctx.fillRect(0,0,W,H);
        ctx.fillStyle = '#8a92a6'; ctx.font = '700 14px "Segoe UI"'; ctx.textAlign = 'center';
        ctx.fillText('Loading custom artwork…', W/2, H/2);
      }
    } else {
      drawBackground(ctx, W, H, style, panel, r);
      applyTexture(ctx, W, H, style, r);
      drawCharacters(ctx, W, H, style, panel, r, opts.characters);
    }
    drawBubbles(ctx, W, H, style, panel);

    // panel frame
    ctx.strokeStyle = style.mono ? '#111' : '#151a24';
    ctx.lineWidth = Math.max(2, style.line + 1); ctx.strokeRect(1, 1, W-2, H-2);
    if (style.mono || style.monoOverride) {
      const im = ctx.getImageData(0,0,W,H), d = im.data;
      for (let i=0;i<d.length;i+=4){ const v = d[i]*.299+d[i+1]*.587+d[i+2]*.114; d[i]=d[i+1]=d[i+2]=v; }
      ctx.putImageData(im,0,0);
    }
    // panel number
    if (opts.number !== false) {
      ctx.fillStyle = 'rgba(12,15,22,.72)'; roundRect(ctx, 8, 8, 30, 22, 6); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.font = '700 12px "Segoe UI"'; ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText('#' + (panel.num || 1), 23, 19);
    }
    if (opts.watermark) {
      ctx.save(); ctx.globalAlpha = .22; ctx.fillStyle = '#fff'; ctx.font = '700 18px "Segoe UI"'; ctx.textAlign='center';
      ctx.fillText('AIComic Builder', W/2, H-16); ctx.restore();
    }
    if (opts.filter && opts.filter !== 'none') applyFilter(canvas, opts.filter, opts.filterStrength || 1);
    return canvas;
  }

  /* ---------- page compositor ---------- */
  function layoutSpans(layoutId, n) {
    if (layoutId === 'dynamic') {
      const spans = [6,3,3,2,2,2]; const out = [];
      for (let i=0;i<n;i++) out.push(spans[i % spans.length]);
      return out;
    }
    const L = S.layoutById(layoutId);
    return new Array(n).fill(Math.max(1, Math.round(6 / (L.cols || 2))));
  }
  function composePage(project, pageIndex, opts = {}) {
    const page = project.pages[pageIndex] || project.pages[0];
    if (!page) return document.createElement('canvas');
    const q = opts.quality || 2;
    const PW = (opts.pageWidth || 900), PH = (opts.pageHeight || 1200);
    const canvas = document.createElement('canvas'); canvas.width = PW; canvas.height = PH;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = opts.paper || '#ffffff'; ctx.fillRect(0, 0, PW, PH);
    const L = S.layoutById(project.layout);
    const vertical = project.layout === 'webtoon' || project.layout === 'yonkoma' || project.layout === 'widescreen';
    const cols = vertical ? 1 : (project.layout === 'custom' ? (project.columns || 3) : (L.cols || 2));
    const panels = page.panels;
    const rows = Math.ceil(panels.length / cols);
    const gutter = opts.gutter != null ? opts.gutter : 12;
    const topPad = vertical ? 10 : 44, botPad = 26, sidePad = 18;
    const cellW = (PW - sidePad*2 - gutter*(cols-1)) / cols;
    const cellH = (PH - topPad - botPad - gutter*(rows-1)) / rows;
    const style = S.styleById(project.style);
    const chars = project.characterIds.map(id => S.get().characters.find(c => c.id === id)).filter(Boolean);

    if (!vertical) {
      ctx.fillStyle = '#151a24'; ctx.font = '800 22px "Arial Black", sans-serif'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      ctx.fillText(project.title || 'Untitled Comic', sidePad, 24);
      ctx.font = '600 12px "Segoe UI"'; ctx.fillStyle = '#7a8399'; ctx.textAlign = 'right';
      ctx.fillText((project.series || 'AIComic Builder Studio') + ' · ' + (pageIndex+1) + '/' + project.pages.length, PW - sidePad, 24);
    }
    panels.forEach((p, i) => {
      const c = i % cols, rw = Math.floor(i / cols);
      const x = sidePad + c * (cellW + gutter), y = topPad + rw * (cellH + gutter);
      const pc = renderPanel(p, { width: Math.round(cellW*q), height: Math.round(cellH*q), style, characters: chars, filter: p.filter, number: opts.number !== false, watermark: opts.watermark });
      ctx.drawImage(pc, x, y, cellW, cellH);
      ctx.strokeStyle = '#151a24'; ctx.lineWidth = 2; ctx.strokeRect(x, y, cellW, cellH);
    });
    if (opts.footer !== false) {
      ctx.fillStyle = '#8a92a6'; ctx.font = '600 11px "Segoe UI"'; ctx.textAlign = 'center';
      ctx.fillText('Design and Developed by Mr.Busy · AIComic Builder Studio', PW/2, PH - 9);
    }
    return canvas;
  }

  /* ---------- swatches / avatars ---------- */
  function renderSwatch(style, W = 220, H = 110) {
    const c = document.createElement('canvas'); c.width = W; c.height = H;
    const ctx = c.getContext('2d');
    const r = U.rng(U.hash(style.id));
    const panel = { num:1, seed: U.hash(style.id), scene:'a neon city rooftop at night', dialogue:'', caption:'', sfx:'', camera:'Medium Shot', expression:'Neutral' };
    const fake = S.styleById; // avoid recursion
    drawBackground(ctx, W, H, style, panel, r);
    applyTexture(ctx, W, H, style, r);
    drawFigure(ctx, W*.5, H*.58, H/230, { color: style.colors[0], hair:'#2b2b3a' }, style, r, 'Neutral');
    if (style.mono) { const im = ctx.getImageData(0,0,W,H), d = im.data; for(let i=0;i<d.length;i+=4){ const v=d[i]*.299+d[i+1]*.587+d[i+2]*.114; d[i]=d[i+1]=d[i+2]=v; } ctx.putImageData(im,0,0); }
    return c;
  }
  function renderAvatar(char, W = 200, H = 150) {
    const c = document.createElement('canvas'); c.width = W; c.height = H;
    const ctx = c.getContext('2d');
    const style = S.styleById('anime');
    const g = ctx.createLinearGradient(0,0,0,H); g.addColorStop(0, shade(char.color||'#8b6cff',.45)); g.addColorStop(1, shade(char.color||'#8b6cff',-.2));
    ctx.fillStyle = g; ctx.fillRect(0,0,W,H);
    const r = U.rng(U.hash(char.name||'x'));
    for (let i=0;i<26;i++){ ctx.fillStyle='rgba(255,255,255,'+(r()*.12)+')'; ctx.beginPath(); ctx.arc(r()*W,r()*H,r()*3+1,0,7); ctx.fill(); }
    drawFigure(ctx, W/2, H*.46, H/165, char, style, r, 'Joyful');
    ctx.fillStyle = 'rgba(10,12,20,.55)'; ctx.fillRect(0,H-26,W,26);
    ctx.fillStyle='#fff'; ctx.font='700 12px "Segoe UI"'; ctx.textAlign='center'; ctx.fillText(char.name||'Character', W/2, H-9);
    return c;
  }

  /* ---------- story engine (offline) ---------- */
  function generateStory(project, opts = {}) {
    const W = D.WORDS;
    const nPages = Math.max(1, Math.min(50, project.pages.length || 1));
    const per = Math.max(1, Math.min(24, project.panelsPerPage || 6));
    const r = U.rng(U.hash(project.title + '|' + project.idea + '|' + project.genre + '|' + (opts.salt || Date.now())));
    const chars = project.characterIds.map(id => S.get().characters.find(c => c.id === id)).filter(Boolean);
    const names = chars.length ? chars.map(c => c.name) : ['the hero','a friend'];
    const ideaWords = String(project.idea || '').split(/\s+/).filter(w => w.length > 4).slice(0, 8);

    const enhanced = project.enhanced || (
      String(project.idea || 'A curious hero faces an impossible situation.').trim() +
      ' In this ' + (project.genre || 'adventure').toLowerCase() + ' story told in a ' + (project.tone || 'lighthearted').toLowerCase() +
      ' tone, ' + (names[0] || 'the hero') + ' must navigate ' + U.pick(W.places, r) + ', ' + U.pick(W.actions, r) +
      ', ' + U.pick(W.twists, r) + '. Across ' + nPages + ' page' + (nPages>1?'s':'') + ' and ' + (nPages*per) + ' panels, small choices build into one decisive moment.'
    );

    const pages = [];
    for (let pg = 0; pg < nPages; pg++) {
      const panels = [];
      for (let i = 0; i < per; i++) {
        const idx = pg * per + i;
        const place = idx === 0 ? U.pick(W.places, r) : (r() > .55 ? U.pick(W.places, r) : 'the same place, moments later');
        const action = U.pick(W.actions, r);
        const twist = U.pick(W.twists, r);
        const extra = ideaWords.length ? ' ' + U.pick(ideaWords, r) + ' ' + U.pick(ideaWords, r) : '';
        const dialogue = U.pick(W.lines, r);
        panels.push(S.makePanel(i + 1, U.hash(project.title + pg + i + (opts.salt||'')) % 99999 + 11, {
          scene: (idx === 0 ? 'Opening — ' : '') + place + ', ' + (names[idx % names.length] || 'the hero') + ' ' + action + ', ' + twist + extra,
          dialogue: /Educational|Classroom/.test(project.audience||'') && i === per-1 ? 'And that is how we learned it.' : dialogue,
          caption: i === 0 ? (pg === 0 ? U.pick(W.captions, r) : 'PAGE ' + (pg+1)) : (r() > .8 ? U.pick(W.captions, r) : ''),
          sfx: r() > .68 ? U.pick(W.sfx, r) : '',
          camera: i === 0 ? 'Establishing Wide' : U.pick(W.cameras, r),
          expression: U.pick(D.EXPRESSIONS, r),
          bubble: { x: .5 + (r()-.5)*.2, y: .09 + r()*.14, w: .4, h: .23, type: r() > .82 ? 'Thought' : (r() > .9 ? 'Shout' : 'Speech'), fontSize: 15 }
        }));
      }
      pages.push({ id: U.uid('page'), index: pg, panels });
    }
    return { enhanced, pages };
  }

  /* Optional external provider — only used when configured by the user */
  async function generateStoryRemote(project) {
    const api = S.settings().api || {};
    if (!api.endpoint || !api.key) throw new Error('No AI endpoint configured. Using the built-in offline story engine.');
    const prompt = 'You are a comic scriptwriter. Return ONLY JSON: {"enhanced":"...","panels":[{"scene":"...","dialogue":"...","caption":"...","sfx":"...","camera":"..."}]}. ' +
      'Write ' + (project.panelsPerPage || 6) + ' panels in ' + (project.language || 'en') + ', genre ' + project.genre + ', tone ' + project.tone + ', audience ' + project.audience + '. Idea: ' + project.idea;
    const res = await fetch(api.endpoint, {
      method: 'POST', headers: { 'Content-Type':'application/json', 'Authorization':'Bearer ' + api.key },
      body: JSON.stringify({ model: api.model || 'gpt-4o-mini', messages:[{role:'user',content:prompt}], temperature: .9 })
    });
    if (!res.ok) throw new Error('Provider returned ' + res.status);
    const data = await res.json();
    let text = data.choices && data.choices[0] && data.choices[0].message ? data.choices[0].message.content : (data.text || '');
    const m = String(text).match(/\{[\s\S]*\}/);
    if (!m) throw new Error('Provider response was not JSON.');
    return JSON.parse(m[0]);
  }

  return { renderPanel, composePage, layoutSpans, renderSwatch, renderAvatar, applyFilter,
    generateStory, generateStoryRemote, preload, preloadProject, mix, shade, toGray };
})();
