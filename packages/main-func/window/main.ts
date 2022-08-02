import { app, BrowserWindow, dialog, ipcMain, session } from "electron"
import { Shared } from "@rush/main-share"
import { getFileUrl } from "@rush/main-tool"
import { quit } from "."
import { appIconPath } from "@rush/main-tool"
import windowStateKeeper from "electron-window-state"
import { Settings } from "@rush/main-config/config"

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
            path: Settings.n.values("storagePath")
        });
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
            minWidth: 800,
            minHeight: 600,
            icon: appIconPath,
            frame: true, // 去除原生的菜单
            transparent: false, // 背景透明, 会导致窗体没有阴影
            alwaysOnTop: false,
            webPreferences: {
                webviewTag: false,
                nodeIntegration: true,
                contextIsolation: true,
                // session: mainSession,
                preload: __appStatic + "/preload.js", // 预加载项
            },
            ...opts,
        })
        mainWindowState.manage(Shared.data.mainWindow); 
        Shared.data.mainWindow.loadURL(getFileUrl("index.html"))
        // const mainWindow = Shared.data.mainWindow
        // mainWindow.webContents.on("did-finish-load", function() {
        //     // 注入全局配置变量
        //     mainWindow.webContents.executeJavaScript(`globalConfig = ${JSON.stringify(Settings.n.config())}`,false)
        // });
        Shared.data.mainWindow.on("close", (event: any) => {
            quit(event)
        })
    } else {
        Shared.data.mainWindow?.show()
        // Shared.data.mainWindow?.showInactive()
    }
}
