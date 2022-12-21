import * as db from "@rush/main-module/db"
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
    BrowserWindow.fromWebContents(webview)
    if(webview === lastWebview){
        return
    }
    webview.addListener("new-window", function (event, url) {
        event.preventDefault()
        webview.loadURL(url)
    })
    lastWebview = webview
}
