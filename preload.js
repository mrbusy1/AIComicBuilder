/* Design and Developed by Mr.Busy */
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('desktop', {
  isElectron: true,
  platform: process.platform,
  versions: process.versions,
  saveData: (name, base64) => ipcRenderer.invoke('save-data', { name, data: base64 }),
  openImage: () => ipcRenderer.invoke('open-image'),
  openExternal: (url) => ipcRenderer.invoke('open-external', url),
  onMenu: (fn) => ipcRenderer.on('menu', (event, action) => fn(action))
});
