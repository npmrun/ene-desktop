import { contextBridge, ipcRenderer, IpcRendererEvent } from "electron"
import { callMethod, callMethodLong, callMethodSync } from "./call"
import path, { normalize } from "path"
import url from "url"
import * as file from "./file"
import setting from "@rush/share/setting"

let webviewPreloadPath = path.join(__dirname, "webview.js")
let preloadPath = path.join(__dirname, "preload.js")
let iframePath = `http://localhost:${process.env.PORT}/iframe.html`
let extraPath = path.join(__dirname, "../../extra")
let buildAssetsPath = path.join(__dirname, "../../build-assets")
if (__dirname.split(path.sep).indexOf("app.asar") >= 0) {
    webviewPreloadPath = path.join(__dirname, "webview.js")
    preloadPath = path.join(__dirname, "preload.js")
    iframePath = path.join(__dirname, "iframe.html")
    extraPath = path.join(__dirname, "../..")
    buildAssetsPath = path.join(__dirname, "../../..")
}
webviewPreloadPath = url.pathToFileURL(webviewPreloadPath).href
preloadPath = url.pathToFileURL(preloadPath).href

const _agent = {
    info: {
        version: setting.app_version,
        chrome: process.versions["chrome"],
        node: process.versions["node"],
        electron: process.versions["electron"],
    },
    getStaticHtml(type: any){
        let html = url.pathToFileURL(normalize(path.join(extraPath, `./${type}.html`))).toString()
        return html
    },
    getStaticHtmlSource(type: any){
        let html = normalize(path.join(extraPath, `./${type}.html`))
        return file.readFileSync(html)
    },
    webviewPreloadPath: webviewPreloadPath,
    preloadPath: preloadPath,
    iframePath: iframePath,
    extraPath: extraPath,
    buildAssetsPath: buildAssetsPath,
    file: file,
    crash() {
        process.crash()
    },
    call: callMethod,
    callLong: callMethodLong,
    callSync: callMethodSync,
    send(command: string, ...argu: any[]) {
        if(!command) return
        return ipcRenderer.send(command, ...argu)
    },
    sendSync(command: string, ...argu: any[]) {
        if(!command) return
        return ipcRenderer.sendSync(command, ...argu)
    },
    on(command: string, cb: (event: IpcRendererEvent, ...args: any[]) => void) {
        ipcRenderer.on(command, cb)
        return () => ipcRenderer.removeListener(command, cb)
    },
    once(command: string, cb: (event: IpcRendererEvent, ...args: any[]) => void) {
        ipcRenderer.once(command, cb)
        return () => ipcRenderer.removeListener(command, cb)
    },
    off(command: string, cb: (event: IpcRendererEvent, ...args: any[]) => void) {
        return ipcRenderer.removeListener(command, cb)
    },
    offAll(command: string) {
        return ipcRenderer.removeAllListeners(command)
    },
    popupMenu(options: IPopupMenuOption) {
        ipcRenderer.send("x_popup_menu", options)
    },
}

contextBridge.exposeInMainWorld("_agent", _agent)
