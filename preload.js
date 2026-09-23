const { contextBridge, ipcRenderer } = require('electron');

// Міст між UI та головним процесом. Тут додаємо нові API в міру зростання програми.
contextBridge.exposeInMainWorld('dispersy', {
  platform: process.platform,
  onAppInfo: (callback) => {
    ipcRenderer.on('app:info', (_event, info) => callback(info));
  },
});
