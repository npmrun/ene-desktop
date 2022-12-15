import * as db from "@rush/main-module/db"
import { Event, WebContents, webContents } from "electron"

export { db }

/**
 * 测试进程崩溃
 */
export function crash() {
    process.crash()
}

export function preventWebview(id: number) {
    const webview = webContents.fromId(id)
    webview.addListener("new-window", function (event, url) {
        event.preventDefault()
        webview.loadURL(url)
    })
}
