import { app, crashReporter } from "electron"
import { initCommands, initPrase } from "./parseCommand"
import { Settings } from "@rush/main-config/config"
import path from "path"
import { initGlobalLog } from "@rush/main-module/log"
import { initFileChange } from "@rush/main-module/filechange"
import { initMenu } from "@rush/main-module/menu"
import { initUpdate } from "@rush/main-module/updater"
import { initFolder } from "@rush/main-module/folder"
import { initProtocol } from "@rush/main-module/protocol"

// 配置文件初始化
Settings.init()

// 记录崩溃日志
crashReporter.start({
    uploadToServer: false,
})
app.setPath("crashDumps", path.resolve(Settings.n.values("storagePath"), "./crash"))

// 初始化Log
initGlobalLog()
Settings.n.onChange("storagePath", () => {
    initGlobalLog()
})

// initShortcut(oldMainConfig)
initFileChange()

// 初始化菜单
initMenu()
Settings.n.onChange("language", c => {
    initMenu()
})

// 初始化更新模块
initUpdate()
Settings.n.onChange(["update.owner", "update.repo"], c => {
    initUpdate()
})

// 初始化数据备份方案
// initBackupJob()
// Settings.n.onChange("backup_rule", c => {
//     initBackupJob()
// })

// 初始化协议
app.whenReady().then(() => {
    initProtocol()
})

// 超级命令初始化
initPrase()
initCommands()

