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

export function init() {
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
    Settings.n.onChange(["update.channel", "update.url"], c => {
        initUpdate()
    })
    // 初始化数据备份方案
    initBackupJob()
    Settings.n.onChange("backup_rule", c => {
        initBackupJob()
    })

    // initProtocol()
    // Settings.n.onChange("system.protocol", c => {
    //     initProtocol()
    // })

    const PROTOCOL_FILE = "rush-file"
    if (protocol.isProtocolRegistered(PROTOCOL_FILE)) {
        // 协议处理
        // protocol.registerFileProtocol("rush", function (request, callback) {
        //     console.log(request);
        //     // callback({ path: path.normalize(__dirname + "/" + url) })
        // })
        // 文件协议
        // https://vastiny.com/post/tech/electron-protocol
        // protocol.isProtocolRegistered("rush-file")
        protocol.unregisterProtocol(PROTOCOL_FILE)
    }
    protocol.registerFileProtocol(PROTOCOL_FILE, (request, callback) => {
        console.log(111);
        const url = request.url.slice(PROTOCOL_FILE.length+3)
        
        callback(path.resolve(Settings.n.values("storagePath"), "./file", url))
    })
}
