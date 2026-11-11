/* AIComic Builder Studio — Electron main process
   Design and Developed by Mr.Busy */
const { app, BrowserWindow, Menu, shell, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

let win;

function createWindow() {
  win = new BrowserWindow({
    width: 1560,
    height: 980,
    minWidth: 1100,
    minHeight: 700,
    title: 'AIComic Builder Studio — Unlimited Edition',
    backgroundColor: '#0b0d14',
    show: false,
    autoHideMenuBar: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      spellcheck: false
    }
  });

  win.loadFile(path.join(__dirname, 'index.html'));
  win.once('ready-to-show', () => { win.show(); win.focus(); });
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http')) { shell.openExternal(url); return { action: 'deny' }; }
    return { action: 'allow' };
  });

  const template = [
    {
      label: 'File',
      submenu: [
        { label: 'New Comic', accelerator: 'Ctrl+N', click: () => win.webContents.send('menu', 'new') },
        { label: 'Open Projects', accelerator: 'Ctrl+O', click: () => win.webContents.send('menu', 'projects') },
        { type: 'separator' },
        { label: 'Export Current Comic', accelerator: 'Ctrl+E', click: () => win.webContents.send('menu', 'export') },
        { label: 'Backup All Data', click: () => win.webContents.send('menu', 'backup') },
        { type: 'separator' },
        { label: 'Quit', accelerator: 'Alt+F4', click: () => app.quit() }
      ]
    },
    {
      label: 'Studio',
      submenu: [
        { label: 'Dashboard', click: () => win.webContents.send('menu', 'dashboard') },
        { label: 'Create Studio', click: () => win.webContents.send('menu', 'create') },
        { label: 'Comic Editor', click: () => win.webContents.send('menu', 'editor') },
        { label: 'Reader', click: () => win.webContents.send('menu', 'reader') },
        { label: 'Characters', click: () => win.webContents.send('menu', 'characters') },
        { label: 'Style Lab', click: () => win.webContents.send('menu', 'styles') },
        { type: 'separator' },
        { label: 'Webtoon Slicer', click: () => win.webContents.send('menu', 'slicer') },
        { label: 'Filters & FX', click: () => win.webContents.send('menu', 'filters') },
        { label: 'Export Center', click: () => win.webContents.send('menu', 'export-center') }
      ]
    },
    {
      label: 'View',
      submenu: [
        { label: 'Toggle Theme', accelerator: 'Ctrl+Shift+T', click: () => win.webContents.send('menu', 'theme') },
        { label: 'Reload', accelerator: 'Ctrl+R', role: 'reload' },
        { label: 'Zoom In', role: 'zoomIn' },
        { label: 'Zoom Out', role: 'zoomOut' },
        { label: 'Reset Zoom', role: 'resetZoom' },
        { type: 'separator' },
        { label: 'Developer Tools', accelerator: 'F12', role: 'toggleDevTools' },
        { label: 'Fullscreen', accelerator: 'F11', role: 'toggleFullscreen' }
      ]
    },
    {
      label: 'Help',
      submenu: [
        { label: 'About & Sources', click: () => win.webContents.send('menu', 'about') },
        { label: 'Keyboard Shortcuts', click: () => win.webContents.send('menu', 'settings') },
        { type: 'separator' },
        { label: 'GitHub Repository · mrbusy1', click: () => win.webContents.send('menu', 'github') },
        { label: 'Releases & Installer', click: () => win.webContents.send('menu', 'github-releases') }
      ]
    }
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

ipcMain.handle('save-data', async (event, payload) => {
  try {
    const { canceled, filePath } = await dialog.showSaveDialog(win, {
      title: 'Save file', defaultPath: payload.name,
      filters: [{ name: 'All files', extensions: ['*'] }]
    });
    if (canceled || !filePath) return { ok: false };
    const buffer = Buffer.from(payload.data, 'base64');
    fs.writeFileSync(filePath, buffer);
    return { ok: true, path: filePath };
  } catch (e) { return { ok: false, error: e.message }; }
});

/* Open external links in the user's default browser, never inside the app window */
ipcMain.handle('open-external', async (event, url) => {
  try {
    if (typeof url !== 'string' || !/^https?:\/\/[^\s]+$/i.test(url)) return { ok: false };
    await shell.openExternal(url);
    return { ok: true };
  } catch (e) { return { ok: false, error: e.message }; }
});

ipcMain.handle('open-image', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog(win, {
    properties: ['openFile'],
    filters: [{ name: 'Images', extensions: ['png', 'jpg', 'jpeg', 'webp', 'gif', 'bmp'] }]
  });
  if (canceled || !filePaths[0]) return null;
  const ext = path.extname(filePaths[0]).slice(1).toLowerCase();
  const mime = ext === 'jpg' ? 'jpeg' : ext;
  return 'data:image/' + mime + ';base64,' + fs.readFileSync(filePaths[0]).toString('base64');
});

app.whenReady().then(createWindow);
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
