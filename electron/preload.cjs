const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  getPlatformInfo: () => ipcRenderer.invoke('get-platform-info'),
  sendRequest: (options) => ipcRenderer.invoke('send-request', options)
});
