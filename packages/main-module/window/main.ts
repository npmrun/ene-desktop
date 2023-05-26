import { app, BrowserWindow, dialog, ipcMain, session, shell } from "electron"
import { Shared } from "@rush/main-share"
import { getFileUrl } from "@rush/main-tool"
import { quit } from "."
import { appIconPath } from "@rush/main-tool"
import windowStateKeeper from "electron-window-state"
import { Settings } from "@rush/main-config/config"
import { confrim } from "@rush/main-tool/dialog"

export function hideMainWindow() {
    if (!Shared.data.mainWindow || Shared.data.mainWindow?.isDestroyed()) {
        return
    }
    Shared.data.mainWindow.hide()
}

export function showMainWindow(opts = {}) {
    if (!Shared.data.mainWindow || Shared.data.mainWindow?.isDestroyed()) {
        // 退出时才会保存状态
        let mainWindowState = windowStateKeeper({
            defaultWidth: 800,
            defaultHeight: 600,
            path: Settings.n.values("storagePath"),
        })
        // const mainSession = session.fromPartition('main')
        /**
         * Initial window options
         */
        Shared.data.mainWindow = new BrowserWindow({
            height: mainWindowState.height,
            useContentSize: true,
            width: mainWindowState.width,
            x: mainWindowState.x,
            y: mainWindowState.y,
            show: true,
            resizable: true,
            minWidth: 900,
            minHeight: 600,
            icon: appIconPath,
            frame: true, // 去除原生的菜单
            transparent: false, // 背景透明, 会导致窗体没有阴影
            alwaysOnTop: false,
            webPreferences: {
                webviewTag: true,
                nodeIntegration: true,
                contextIsolation: true,
                // session: mainSession,
                preload: __appStatic + "/preload.js", // 预加载项
            },
            ...opts,
        })
        mainWindowState.manage(Shared.data.mainWindow)
        Shared.data.mainWindow.loadURL(getFileUrl("index.html"))
        // const mainWindow = Shared.data.mainWindow
        // mainWindow.webContents.on("did-finish-load", function() {
        //     // 注入全局配置变量
        //     mainWindow.webContents.executeJavaScript(`globalConfig = ${JSON.stringify(Settings.n.config())}`,false)
        // });
        // 完全阻止一下两种方式打开新窗口
        /**
         * 如果属性中包含 target=_blank，单击链接或提交表格即可创建
         * 在 JavaScript 中调用 window.open()
         */
        // https://www.electronjs.org/zh/docs/latest/api/window-open
        Shared.data.mainWindow.webContents.setWindowOpenHandler((details)=>{
            shell.openExternal(details.url)
            return { action: 'deny' }
        })
        Shared.data.mainWindow.on("close", (event: any) => {
            quit(event)
        })
        Shared.data.mainWindow.webContents.addListener("crashed", async  (err)=>{
            const choice = await confrim({
                title: "错误",
                message: "应用程序崩溃，是否重载界面",
                textList: ["重载", "取消"]
            })
            if(choice == 0) Shared.data.mainWindow.reload()
        })
    } else {
        Shared.data.mainWindow?.show()
        // Shared.data.mainWindow?.showInactive()
    }
}
