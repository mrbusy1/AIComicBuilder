# AIComic Builder Studio — Unlimited Edition

An offline-first desktop comic & manga studio for Windows, built with Electron. A complete redesign of the [AICOMICBUILDER](https://aicomicbuilder.com/) workflow with every original limitation removed.

**No account. No sign-in. No credits. No cloud. No watermark. No internet connection required.** Your projects stay on your machine in local storage, with full JSON backup and restore.

**Public repository:** https://github.com/mrbusy1/AIComicBuilder · **Author:** [@mrbusy1](https://github.com/mrbusy1) · **Latest release:** [v2.0.0](https://github.com/mrbusy1/AIComicBuilder/releases/tag/v2.0.0)

---

## Download & install (Windows)

Grab **`AIComicBuilder-Studio-Setup-2.0.0.exe`** from the [v2.0.0 release](https://github.com/mrbusy1/AIComicBuilder/releases/tag/v2.0.0) and run it.

- NSIS wizard, per-user install to `%LOCALAPPDATA%\Programs\AIComic Builder Studio`
- Creates a Desktop shortcut, a Start Menu entry and an Add/Remove Programs uninstaller
- No admin rights required · works fully offline
- 77.4 MB · SHA-256 `a8921c72d9a0f87d2dc1496ae02df2083845803eab46b2b1f797dc82f9435f5d`

The installer is also committed in [`release/`](release/) together with [`release/README.txt`](release/README.txt) and [`release/installer-info.json`](release/installer-info.json).

> GitHub warns that the 77 MB installer exceeds its recommended 50 MB file size. It is still under the 100 MB hard limit, so the push succeeds. Future large binaries should use Git LFS or be published only as Release assets.

## Run from source

Requires Node.js and npm on Windows.

```bash
npm install
npm start
```

`Start AIComic Builder.bat` is the convenience launcher: it prefers the standalone portable build, then the local Electron source, then an Edge/Chrome app-mode fallback.

Other scripts:

| Command | What it does |
| --- | --- |
| `npm start` | Launch the app from source with Electron |
| `npm run dist` / `npm run build:portable` | Build `dist/AIComic Builder Studio/` — a standalone portable app, no Node/npm needed to run it |
| `npm run installer` | Build the NSIS installer into `release/` (requires NSIS 3.x `makensis.exe`) |

The app is Electron 33 with `contextIsolation: true` and `nodeIntegration: false`. Renderer code is plain HTML/CSS/JS loaded from `index.html`; native file dialogs and external links are exposed through a narrow `window.desktop` bridge in `preload.js`.

---

## Unlimited Edition — limits removed

| Original limitation | Unlimited Edition |
| --- | --- |
| 50 welcome credits / paid generation | No credits, no cost, no quota |
| 1–8 pages per comic | Up to 50 pages |
| Fixed panel count | 1–24 panels per page |
| Fixed style catalogue | 28 built-in styles + unlimited custom styles |
| Fixed layouts | 17 layouts |
| Character caps | No character limit |
| Watermark on output | No watermark by default |
| Commercial-rights gate | No gate |
| Comics public by default | Private and local by default |
| Sign-in required | No account at all |
| Webtoon slicer size caps | No caps, custom dimensions supported |
| Export restrictions | All formats unlocked |

## Features

**13 views** — Dashboard, Create Studio, Projects, Comic Editor, Reader, Character Library, Style Lab, Inspiration, Webtoon Slicer, Filters & FX, Export Center, Settings, About & Sources.

- **Three creation modes** — Quick Create, Customize and an 8-step Advanced wizard (Comic Info → Enhance Idea → Characters → Style & Layout → Preview → Generate → Script Review → Render & Finish).
- **Offline generation engine** — deterministic, seeded procedural canvas artwork (backgrounds, figures, speech bubbles, captions, SFX, style textures) with character-consistency profiles, plus a story engine. Works with no API key; an OpenAI-compatible endpoint can be configured optionally in Settings.
- **Real comic editor** — panel selection, draggable speech bubbles, dialogue/caption/SFX text, bubble type and font size, X/Y positioning, camera and expression selectors, per-panel filters, single-panel regeneration, custom image upload, add/duplicate/delete/move panels, page management, undo/redo.
- **Exports** — PNG pages ZIP, individual panels ZIP, SVG, PDF/print view, CBZ with `ComicInfo.xml`, WebP ZIP, JSON project, and full JSON backup/restore. ZIP files are written by a built-in CRC32 ZIP writer with no external dependency.
- **Webtoon Slicer** — LINE Webtoon Canvas `800×1280`, Tapas `940×1280`, Instagram Carousel `1080×1350`, or custom dimensions, with ZIP/CBZ output and a phone simulator.
- **Filters & FX** — 16 offline filters with adjustable strength and before/after comparison, applicable to a selected panel.
- **Interface** — dark/light themes, 5 accent colours, 8 languages (English, Español, Français, Deutsch, 日本語, 한국어, 中文, Português), native menus, keyboard shortcuts and global search.
- **GitHub panel** — pinned at the bottom-left of the sidebar with the repository URL, **Give Star**, **Share** and **About GitHub of mrbusy1**. External links open in your default browser through a sandboxed `open-external` IPC handler (http/https only). The same details appear in an About & Sources tab and the native Help menu.

## Sources

Rebuilt and redesigned from publicly available information on:

- `https://aicomicbuilder.com/` — workflow, styles, layouts, pricing, FAQ and changelog, plus hidden create-page options recovered from the site's Next.js chunks.
- `https://ai-1.art/` — a parked Hostinger "Coming soon" placeholder at the time of research; the likely intended `a1.art` inspired the Filters & FX and Custom Style Builder.

Source data is preserved in `js/data.js`, and the full provenance and limitations table are visible in the app's **About & Sources** view. This is an independent redesign and is not affiliated with those sites.

## Project layout

| Path | Purpose |
| --- | --- |
| `main.js` | Electron main process: window, native menus, file dialogs, IPC handlers |
| `preload.js` | Safe `contextBridge` API (`window.desktop`) |
| `index.html`, `styles.css` | Renderer shell and the full design system |
| `js/data.js` | Source research, styles, layouts, filters, i18n, GitHub metadata |
| `js/store.js` | Local state (`localStorage` key `acb_studio_v2`), undo/redo, backup |
| `js/art.js` | Seeded procedural art + story engine, custom-art preloading |
| `js/views-*.js` | The 13 views: core, create, editor, tools, system |
| `js/app.js` | Routing, theme, i18n, shortcuts, native menu events, GitHub panel |
| `js/utils.js` | Modals, toasts, downloads, CRC32 ZIP writer |
| `build-portable.js`, `build-installer.js` | Portable build and NSIS installer builders |
| `release/` | Shipped installer and metadata |

`node_modules/`, `dist/`, `.installer-staging/` and `_validation/` are intentionally excluded from Git.

## Validation

- `node --check` passes on all JavaScript files
- Functional harness: **34 PASS / 0 FAIL**
- Real Electron boot: one window at 1560×980, native menu, zero console errors or CSP warnings
- All 13 routes swept inside Electron with no errors
- ZIP outputs validated with Python's `zipfile` (`testzip(): None`)
- Installer validated by a silent install → files/registry/shortcut checks → silent uninstall cycle
- Portable standalone `.exe` verified to load the real app from `resources/app`

## License

MIT — see `package.json`.

---

Design and Developed by **Mr.Busy**
