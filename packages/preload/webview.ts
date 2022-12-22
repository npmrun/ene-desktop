import { contextBridge, ipcRenderer, webContents } from "electron"

console.log('222');
ipcRenderer.sendToHost("start-load-info")
window.addEventListener('load', ()=>{
    const faviconEl = document.querySelector("link[rel='shortcut icon']") ?? document.querySelector("link[rel='icon']")
    ipcRenderer.sendToHost("stop-load-info", {
        title: document.title,
        favicon: faviconEl.getAttribute("href")
    })
})
