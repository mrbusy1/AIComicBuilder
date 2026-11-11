/*
 * AIComic Builder Studio — portable Windows build
 * Produces a standalone folder: dist/AIComic Builder Studio/
 * The contained .exe runs without Node.js, npm or any install step.
 *
 * Design and Developed by Mr.Busy
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const SRC_ELECTRON = path.join(ROOT, 'node_modules', 'electron', 'dist');
const OUT = path.join(ROOT, 'dist', 'AIComic Builder Studio');
const APP_DIR = path.join(OUT, 'resources', 'app');

function rmrf(p) { if (fs.existsSync(p)) fs.rmSync(p, { recursive: true, force: true }); }
function mkdir(p) { fs.mkdirSync(p, { recursive: true }); }
function copy(src, dst) {
  const st = fs.statSync(src);
  if (st.isDirectory()) {
    mkdir(dst);
    for (const n of fs.readdirSync(src)) copy(path.join(src, n), path.join(dst, n));
  } else fs.copyFileSync(src, dst);
}

if (!fs.existsSync(path.join(SRC_ELECTRON, 'electron.exe'))) {
  console.error('Electron runtime missing. Run: npm install');
  process.exit(1);
}

console.log('Building portable edition...');
rmrf(path.join(ROOT, 'dist'));
mkdir(APP_DIR);

// 1. Copy the Electron runtime (all DLLs, pak files, locales, default_app.asar)
for (const n of fs.readdirSync(SRC_ELECTRON)) {
  if (n === 'electron.exe') continue;
  copy(path.join(SRC_ELECTRON, n), path.join(OUT, n));
}

// 2. Rename the executable to the product name
copy(path.join(SRC_ELECTRON, 'electron.exe'), path.join(OUT, 'AIComic Builder Studio.exe'));

// 3. Copy the application into resources/app so Electron loads it automatically
const APP_FILES = ['main.js', 'preload.js', 'index.html', 'styles.css', 'package.json'];
for (const f of APP_FILES) copy(path.join(ROOT, f), path.join(APP_DIR, f));
for (const d of ['js', 'assets']) {
  const s = path.join(ROOT, d);
  if (fs.existsSync(s)) copy(s, path.join(APP_DIR, d));
}

// 4. Small launcher + provenance file next to the exe
fs.writeFileSync(path.join(OUT, 'Launch.bat'),
  '@echo off\r\ncd /d "%~dp0"\r\nstart "" "AIComic Builder Studio.exe"\r\n', 'utf8');
fs.writeFileSync(path.join(OUT, 'BUILD.txt'),
  [
    'AIComic Builder Studio — Unlimited Edition v2.0.0',
    'Portable desktop build — no install, no account, no internet required.',
    '',
    'Run: AIComic Builder Studio.exe  (or Launch.bat)',
    'Your comics, characters and settings are saved locally in the app data folder.',
    'Use Settings > Data & backup > Backup All Data to export a JSON backup.',
    '',
    'Sources: https://aicomicbuilder.com/  |  https://ai-1.art/ (parked; a1.art referenced)',
    '',
    'Design and Developed by Mr.Busy'
  ].join('\r\n'), 'utf8');

const count = (function walk(p) {
  return fs.readdirSync(p).reduce((n, x) => {
    const q = path.join(p, x);
    return n + (fs.statSync(q).isDirectory() ? walk(q) : 1);
  }, 0);
})(OUT);
console.log('Done: ' + OUT);
console.log('Files: ' + count);
console.log('Design and Developed by Mr.Busy');
