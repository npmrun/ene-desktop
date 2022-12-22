import * as db from "@rush/main-module/db"
import { broadcast as bb } from "@rush/main-tool"
import { BrowserWindow, Event, WebContents, webContents } from "electron"

export { db }

/**
 * 测试进程崩溃
 */
export function crash() {
    process.crash()
}

let lastWebview
export function preventWebview(id: number) {
    const webview = webContents.fromId(id)
    if(webview === lastWebview){
        return
    }
    webview.setWindowOpenHandler((details) => {
        webview.loadURL(details.url)
        return { action: 'deny' }
    })
    webview.addListener("new-window", function (event, url) {
        event.preventDefault()
        webview.loadURL(url)
    })
    lastWebview = webview
}

export function toggleDevTools(id: number) {
    const webview = webContents.fromId(id)
    if (webview.isDevToolsOpened()) {
        webview.closeDevTools();
    } else {
        webview.openDevTools({
            mode: 'detach'
        });
    }
}


export function broadcast(ev,...args) {
    console.log(ev , args);
    
    return bb(ev, ...args)
}