import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("titlebar", {
  close: () => ipcRenderer.invoke("close"),
  maximize: () => ipcRenderer.invoke("maximize"),
  minimize: () => ipcRenderer.invoke("minimize"),
  isMaximised: () => ipcRenderer.invoke("is-maximized"),
});
