const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    toggleRPC: () => ipcRenderer.send('toggle-rpc'),
    onRPCStatus: (callback) => ipcRenderer.on('rpc-status', (event, value) => callback(value))
});
