import { contextBridge, ipcRenderer, webContents } from "electron"

ipcRenderer.sendToHost("start-load-info")
window.addEventListener('load', ()=>{
    let faviconEl = document.querySelector("link[rel='shortcut icon']") ?? document.querySelector("link[rel='icon']")
    let favicon = faviconEl.getAttribute("href")
    if(!favicon.startsWith('http')){
        favicon = location.origin+'/'+faviconEl.getAttribute("href");
    }
    ipcRenderer.sendToHost("stop-load-info", {
        title: document.title,
        favicon
    })
})
