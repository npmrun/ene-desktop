import "./global"
import { broadcast, platform } from "@rush/main-tool"
import { app} from "electron"
import { Shared } from "@rush/main-share"
import { showMainWindow } from "@rush/main-module/window/main"
import { setupTray } from "@rush/main-module/window/tray"
import { Mitt } from "@rush/main-module/mitt"
import setting from "@rush/share/setting"
import { URL } from "url"

Mitt.on("app-message", ({ event, msg, data }) => {
    if(event === "client"){
        // 处理全局消息, 可以自行处理以及发送到前端处理
        broadcast("from-server", msg, data)
    }
})

Mitt.on("exit", ({ code })=>{
    // 应用退出
})

// ene://?name=1&pwd=2
Mitt.on("boot", ({ argv, ...opts })=>{
    const prefix = `${setting.app_scheme}:`
    // 开发阶段，跳过前两个参数（`electron.exe .`）
    // 打包后，跳过第一个参数（`myapp.exe`）
    const offset = app.isPackaged ? 1 : 2
    const url = argv.find((arg, i) => i >= offset && arg.startsWith(prefix))
    if (url) {
        const urlObj = new URL(url)
        const { searchParams } = urlObj
        logger.debug(urlObj.search) // -> ?name=1&pwd=2
        logger.debug(searchParams.get("name")) // -> 1
        logger.debug(searchParams.get("pwd")) // -> 2
        opts.cb&&opts.cb(urlObj, searchParams)
    }
    let taryBoot = false
    let isHidden = process.argv.indexOf("--openAsHidden") > 0
    if (platform === "MacOS" && isHidden) {
        taryBoot = true
    } else if (platform === "windows" && isHidden) {
        taryBoot = true
    } else if (platform === "Linux" && isHidden) {
        taryBoot = true
    }
    if(taryBoot){
        Shared.data.lastChoice = 1
        setupTray()
    }else{
        showMainWindow()
    }

})

function createWindow() {
    // Shared.data.lastChoice = 1
    // setupTray()
    // 如果打开协议时，没有其他实例，则当前实例当做主实例，处理参数
    Mitt.emit("boot", {argv: process.argv})
    logger.debug("process.argv启动参数为：", process.argv)
    // Shared.data.mainWindow.webContents.openDevTools({mode: "detach"});
}

process
    // Handle normal exits
    .on("exit", code => {
        console.log("exit");
        logger.debug("exit", code)
        Mitt.emit("exit", { code })
    })
    // Handle CTRL+C
    .on("SIGINT", () => {
        console.log("SIGINT");
        logger.debug("SIGINT exit")
        Mitt.emit("exit")
    })


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
        if (platform ===  "windows" || platform === "Linux") {
            Mitt.emit("boot", {argv: argv})
            logger.debug("second-instance启动参数为：", argv)
        }
    })

    // macOS 下通过协议URL启动时，主实例会通过 open-url 事件接收这个 URL
    app.on("open-url", (event, urlStr) => {
        logger.debug(urlStr)
        Mitt.emit("boot", {argv: urlStr})
        logger.debug("open-url启动参数为：", urlStr)
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
        // webContents.on('will-navigate', (e, url) => {
        //     e.preventDefault()
        //     console.log(url);
        //     shell.openExternal(url)
        // })
        // webContents.addListener('new-window', (event, url) => {
        //     event.preventDefault();
        //     event.stopPropagation()
        //     shell.openExternal(url);
        // });
    });

    app.on("activate", () => {
        if (Shared.data.mainWindow === null) {
            setTimeout(createWindow, 500)
        }
    })
}
