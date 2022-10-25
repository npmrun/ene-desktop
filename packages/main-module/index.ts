import { Mitt } from "@rush/main-tool/mitt"
import { initMenu } from "./menu"
import { initBackupJob } from "./schedule"
import { initGlobalLog } from "./log"
import { init as initShortcut } from "./shortcut"
import "./filechange"

import { protocol, app } from "electron"
import path from "path"
import fs from "fs"
import { Settings } from "@rush/main-config/config"
import { initUpdate } from "./updater"
import { init as initProtocol } from "./protocol"
import { Shared } from "@rush/main-share"

/**
 * 初始化模块
 */
export function initModules() {
    // initShortcut(oldMainConfig)
    // 初始化Log
    initGlobalLog()
    Settings.n.onChange("storagePath", () => {
        initGlobalLog()
    })
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

    app.whenReady().then(() => {
        initProtocol()
    })
}
