import { Settings } from "@rush/main-config/config"
import { Shared } from "@rush/main-share"
import { Mitt } from "@rush/main-tool/mitt"
import { app, dialog, protocol } from "electron"
import fs from "fs-extra"
import path from "path"
import setting from "@rush/share/setting"

const args = []
if (!app.isPackaged) {
    // 如果是开发阶段，需要把我们的脚本的绝对路径加入参数中
    args.push(path.resolve(process.argv[1]))
}
// 加一个 `--` 以确保后面的参数不被 Electron 处理
args.push("--")
let PROTOCOL = ""
let PROTOCOL_FILE = ""
const protocolFile = path.resolve(app.getPath("userData"), "__protocol__")

// 开发时程序结束回主动清理默认协议
process
    // Handle normal exits
    .on("exit", code => {
        const PROTOCOL = Settings.n.values("system.protocol")
        if (app.isDefaultProtocolClient(PROTOCOL, process.execPath, args)) {
            const AgreementAppName = app.getApplicationNameForProtocol(`${PROTOCOL}://`)
            if (AgreementAppName.includes("Electron")) {
                app.removeAsDefaultProtocolClient(PROTOCOL, process.execPath, args)
                console.log(`${PROTOCOL}协议已注销`);
            } else {
                console.log(`${PROTOCOL}协议已被其他程序占用，请确认`)
            }
        }
    })

    // Handle CTRL+C
    .on("SIGINT", () => {
        const PROTOCOL = Settings.n.values("system.protocol")
        if (app.isDefaultProtocolClient(PROTOCOL, process.execPath, args)) {
            const AgreementAppName = app.getApplicationNameForProtocol(`${PROTOCOL}://`)
            if (AgreementAppName.includes("Electron")) {
                app.removeAsDefaultProtocolClient(PROTOCOL, process.execPath, args)
                console.log(`${PROTOCOL}协议已注销`);
            } else {
                console.log(`${PROTOCOL}协议已被其他程序占用，请确认`)
            }
        }
    })


function check(PROTOCOL) {
    if (app.isDefaultProtocolClient(PROTOCOL, process.execPath, args)) {
        const AgreementAppName = app.getApplicationNameForProtocol(`${PROTOCOL}://`)
        console.log("获取该自定义协议链接的应用处理程序的名字", AgreementAppName)
        // 开发时是`Electron`,构建之后就是setting.app_title
        if (AgreementAppName.includes("Electron") || AgreementAppName.includes(setting.app_title)) {
            app.removeAsDefaultProtocolClient(PROTOCOL, process.execPath, args)
        } else {
            // 通知前端协议被占用
            Mitt.emit("app-message", { event: "app-warnning", msg: `${PROTOCOL}协议已被其他程序占用`})
            console.log(`${PROTOCOL}协议已被其他程序占用，请确认`)
            return false
        }
    }
    return true
}

export function init() {
    PROTOCOL = Settings.n.values("system.protocol")
    PROTOCOL_FILE = (Settings.n.values("system.protocol")) + "-file"
    console.log(protocolFile)
    let isSuccess = false
    if (fs.existsSync(protocolFile)) {
        const tempProtocol = fs.readFileSync(protocolFile, "utf8")
        isSuccess = check(tempProtocol)
    } else {
        isSuccess = check(PROTOCOL)
    }
    // 协议被占用时跳过执行
    if (!isSuccess) return
    fs.ensureFileSync(protocolFile)
    fs.writeFileSync(protocolFile, PROTOCOL)
    app.setAsDefaultProtocolClient(PROTOCOL, process.execPath, args)

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
