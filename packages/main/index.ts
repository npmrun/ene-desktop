import { isPromise, readCommand } from "@rush/main-tool"
import { ipcMain, app, crashReporter, shell } from "electron"
import { Shared } from "@rush/main-share"
import { showMainWindow } from "@rush/main-func/window/main"
import { setupTray } from "@rush/main-func/window/tray"
import { initCommands } from "./parseCommand"
import Store from "electron-store"
import { Settings } from "@rush/main-config/config"
import { Mitt } from "@rush/main-tool/mitt"
import { initModules } from "@rush/main-module"
import { handleArgv, handleUrl } from "@rush/main-module/protocol"

crashReporter.start({
    uploadToServer: false,
})
// 超级命令初始化
initCommands()
// 配置文件初始化
Settings.init()
// 初始化模块
initModules()

Mitt.on("app-message", () => {
    // 处理全局消息, 可以自行处理以及发送到前端处理
})
function createWindow() {
    // Shared.data.lastChoice = 1
    // setupTray()
    showMainWindow()
    // Shared.data.mainWindow.webContents.openDevTools({mode: "detach"});
}

const gotTheLock = app.requestSingleInstanceLock()
if (!gotTheLock) {
    app.exit()
} else {
    app.on("second-instance", (event, argv, workingDirectory) => {
        if (Shared.data.mainWindow) {
            if (Shared.data.mainWindow.isMinimized()) Shared.data.mainWindow.restore()
            Shared.data.mainWindow.focus()
            Shared.data.mainWindow.show()
        }
        // Windows 下通过协议URL启动时，URL会作为参数，所以需要在这个事件里处理
        if (process.platform === "win32") {
            handleArgv(argv, ()=>{
                console.log("success");
            })
        }
    })

    // macOS 下通过协议URL启动时，主实例会通过 open-url 事件接收这个 URL
    app.on("open-url", (event, urlStr) => {
        handleUrl(urlStr, ()=>{
            console.log("success");
        })
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

    // 所有链接的打开方式都由默认程序打开
    app.on('web-contents-created', (e, webContents) => {
        webContents.addListener('new-window', (event, url) => {
            event.preventDefault();
            shell.openExternal(url);
        });
    });

    app.on("activate", () => {
        if (Shared.data.mainWindow === null) {
            setTimeout(createWindow, 500)
        }
    })
}
