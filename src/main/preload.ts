import { contextBridge } from 'electron';

contextBridge.exposeInMainWorld('browserShell', {
  platform: process.platform,
  versions: {
    chrome: process.versions.chrome,
    electron: process.versions.electron
  }
});

