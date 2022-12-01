import { Settings } from "@rush/main-config/config"
import { Mitt } from "@rush/main-module/mitt"
import { app, dialog, protocol } from "electron"
import fs from "fs-extra"
import path from "path"
import setting from "@rush/share/setting"
import { platform } from "@rush/main-tool"

const args = []
if (!app.isPackaged) {
    // 如果是开发阶段，需要把我们的脚本的绝对路径加入参数中
    args.push(path.resolve(process.argv[1]))
}
// 加一个 `--` 以确保后面的参数不被 Electron 处理
args.push("--open-url", "--")
let PROTOCOL = setting.app_scheme
let PROTOCOL_FILE = setting.app_scheme + "-file"

Mitt.on("exit", ({ code })=>{
    if(app.isPackaged) return; // 打包之后退出不需要注销协议
    if (app.isDefaultProtocolClient(PROTOCOL, process.execPath, args)) {
        const AgreementAppName = app.getApplicationNameForProtocol(`${PROTOCOL}://`)
        if ((AgreementAppName.includes("Electron") && !app.isPackaged) || (AgreementAppName.includes(setting.app_title) && app.isPackaged)) {
            app.removeAsDefaultProtocolClient(PROTOCOL, process.execPath, args)
            logger.debug(`${PROTOCOL}协议已注销`);
        } else {
            logger.debug(`${PROTOCOL}协议已被其他程序占用`)
        }
    }
})

// 手动清理协议
export function clearProtocol() {
    if (app.isDefaultProtocolClient(PROTOCOL, process.execPath, args)) {
        const AgreementAppName = app.getApplicationNameForProtocol(`${PROTOCOL}://`)
        if ((AgreementAppName.includes("Electron") && !app.isPackaged) || (AgreementAppName.includes(setting.app_title) && app.isPackaged)) {
            app.removeAsDefaultProtocolClient(PROTOCOL, process.execPath, args)
            logger.debug(`${PROTOCOL}协议已注销`);
        } else {
            logger.debug(`${PROTOCOL}协议已被其他程序占用`)
        }
    }
}

function check(PROTOCOL) {
    console.log(app.isDefaultProtocolClient(PROTOCOL, process.execPath, args));

    if (app.isDefaultProtocolClient(PROTOCOL, process.execPath, args)) {
        const AgreementAppName = app.getApplicationNameForProtocol(`${PROTOCOL}://`)
        console.log("获取该自定义协议链接的应用处理程序的名字", AgreementAppName)
        // 开发时是`Electron`,构建之后就是setting.app_title
        if (AgreementAppName.includes("Electron") || AgreementAppName.includes(setting.app_title)) {
            app.removeAsDefaultProtocolClient(PROTOCOL, process.execPath, args)
        } else {
            // 通知前端协议被占用
            logger.debug(`${PROTOCOL}协议已被其他程序占用，请确认`)
            return false
        }
    }
    return true
}

export function initProtocol() {
    let isSuccess = false
    isSuccess = check(PROTOCOL)
    // 协议被占用时跳过执行
    if (!isSuccess) return
    if(platform === "windows" || platform === "MacOS" || (app.isPackaged && platform === "Linux")){
        app.setAsDefaultProtocolClient(PROTOCOL, process.execPath, args)
    }

    // 应用内部协议，不需要处理应用程序
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
        const url = request.url.slice(PROTOCOL_FILE.length + 3)
        callback(path.resolve(Settings.n.values("storagePath"), "./file", url))
    })
}
