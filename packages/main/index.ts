import { isPromise, readCommand } from "@rush/main-tool"
import { ipcMain, app, crashReporter } from "electron"
import { Shared } from "@rush/main-share"
import { showMainWindow } from "@rush/main-func/window/main"
import { setupTray } from "@rush/main-func/window/tray"
import { initCommands } from "./parseCommand"
import Store from "electron-store"
import { Settings } from "@rush/main-config/config"
import { Mitt } from "@rush/main-tool/mitt"
import { init as initModules } from "@rush/main-module"

crashReporter.start({
    uploadToServer: false,
})
// 超级命令初始化
initCommands()
// 配置文件初始化
Settings.init()


Mitt.on("app-message", () => {
    // 处理全局消息, 可以自行处理以及发送到前端处理
})
function createWindow() {
    // Shared.data.lastChoice = 1
    // setupTray()
    initModules()
    showMainWindow() 
    // Shared.data.mainWindow.webContents.openDevTools({mode: "detach"});
}

const gotTheLock = app.requestSingleInstanceLock()
if (!gotTheLock) {
    app.exit()
} else {
    app.on("second-instance", (event, commandLine, workingDirectory) => {
        if (Shared.data.mainWindow) {
            if (Shared.data.mainWindow.isMinimized()) Shared.data.mainWindow.restore()
            Shared.data.mainWindow.focus()
            Shared.data.mainWindow.show()
        }
    })

    app.on("ready", () => setTimeout(createWindow, 500))

    app.on("before-quit", event => {
        if (Shared.data.forceClose) {
            app.exit()
        } else {
            event.preventDefault()
        }
    })

    app.on("window-all-closed", () => {
        // 可以在这里面清理创建的子进程
        if (process.platform !== "darwin") {
            app.exit()
        }
    })

    app.on("activate", () => {
        if (Shared.data.mainWindow === null) {
            setTimeout(createWindow, 500)
        }
    })
}
