const os = require('os');
const path = require('path');
const { contextBridge, ipcRenderer } = require('electron');
const Toastify = require('toastify-js');

// Expose os-related utility to the renderer
contextBridge.exposeInMainWorld('os', {
  homedir: () => os.homedir(),
});

// Expose path-related utility to the renderer
contextBridge.exposeInMainWorld('path', {
  join: (...args) => path.join(...args),
});

// Expose ipcRenderer to send and receive events from the renderer
contextBridge.exposeInMainWorld('ipcRenderer', {
  send: (channel, data) => ipcRenderer.send(channel, data),
  on: (channel, func) =>
    ipcRenderer.on(channel, (event, ...args) => func(...args)),
});

// Expose Toastify for displaying notifications in the renderer
contextBridge.exposeInMainWorld('Toastify', {
  toast: (options) => Toastify(options).showToast(),
});

// Expose additional path utilities if required
contextBridge.exposeInMainWorld('electronAPI', {
  pathExtname: (filename) => path.extname(filename),
  pathBasename: (filepath, ext) => path.basename(filepath, ext)
});