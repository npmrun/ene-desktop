import * as db from "@rush/main-module/db"
import { broadcast as bb } from "@rush/main-tool"
import { BrowserWindow, clipboard, Event, WebContents, webContents } from "electron"
import * as fs from "fs-extra"
import path from "path"
import { pathToFileURL } from "url"

export { db }

export function copyFile(filePath: string) {
    const url = pathToFileURL(path.normalize(filePath)).toString()
    console.log("复制文件:"+url);
    const fileContent = fs.readFileSync(filePath, 'utf-8')
    console.log(fileContent);
    // https://juejin.cn/post/7155749919419498527#comment
    // https://github.com/kenan2002/electron-clipboard-ex
    // https://juejin.cn/post/6986101875590299685#heading-7
    // https://github.com/simo-an/better-clipboard
    clipboard.writeBuffer('public.file-url', Buffer.from(fileContent))
}

/**
 * 测试进程崩溃
 */
export function crash() {
    process.crash()
}

let lastWebview
export function preventWebview(id: number) {
    const webview = webContents.fromId(id)
    if (webview.id === lastWebview?.id) {
        return
    }
    webview.setWindowOpenHandler(details => {
        webview.loadURL(details.url)
        return { action: "deny" }
    })
    webview.addListener("new-window", function (event, url) {
        event.preventDefault()
        webview.loadURL(url)
    })
    lastWebview = webview
}

export function destoryWebview(id: number) {
    const webview = webContents.fromId(id)
    if (webview.id === lastWebview?.id) {
        lastWebview = undefined
    }
}

export function toggleDevTools(id: number) {
    const webview = webContents.fromId(id)
    if (webview.isDevToolsOpened()) {
        webview.closeDevTools()
    } else {
        webview.openDevTools({
            mode: "detach",
        })
    }
}

export function broadcast(ev, ...args) {
    console.log(ev, args)

    return bb(ev, ...args)
}
