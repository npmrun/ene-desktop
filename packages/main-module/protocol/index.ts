import { Settings } from "@rush/main-config/config"
import { app, dialog, protocol } from "electron"
import fs from "fs-extra"
import path from "path"

const args = []
if (!app.isPackaged) {
    // 如果是开发阶段，需要把我们的脚本的绝对路径加入参数中
    args.push(path.resolve(process.argv[1]))
}
// 加一个 `--` 以确保后面的参数不被 Electron 处理
args.push("--")
let PROTOCOL = ""
let PROTOCOL_FILE = ""
const protocolFile = path.resolve(app.getPath("appData"), "__protocol__")

function check(PROTOCOL) {
    if (app.isDefaultProtocolClient(PROTOCOL, process.execPath, args)) {
        const AgreementAppName = app.getApplicationNameForProtocol(`${PROTOCOL}://`)
        console.log("获取该自定义协议链接的应用处理程序的名字", AgreementAppName)
        if (AgreementAppName.includes("Electron") || AgreementAppName.includes("rush-desktop")) {
            app.removeAsDefaultProtocolClient(PROTOCOL, process.execPath, args)
        } else {
            console.log(`${PROTOCOL}协议已被其他程序占用，请确认`)
        }
    }
}

export function init() {
    PROTOCOL = Settings.n.values("system.protocol") ?? "rush"
    PROTOCOL_FILE = (Settings.n.values("system.protocol") ?? "rush") + "-file"
    console.log(protocolFile)
    if (fs.existsSync(protocolFile)) {
        const tempProtocol = fs.readFileSync(protocolFile, "utf8")
        check(tempProtocol)
    } else {
        check(PROTOCOL)
    }
    fs.ensureFileSync(protocolFile)
    fs.writeFileSync(protocolFile, PROTOCOL)
    // rush://?name=1&pwd=2
    // app.setAsDefaultProtocolClient(PROTOCOL, process.execPath, args)
    // 如果打开协议时，没有其他实例，则当前实例当做主实例，处理参数
    // handleArgv(process.argv)

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
    console.log(PROTOCOL_FILE);
    
    protocol.registerFileProtocol(PROTOCOL_FILE, (request, callback) => {
        console.log(111);
        const url = request.url.slice(PROTOCOL_FILE.length+3)
        
        callback(path.resolve(Settings.n.values("storagePath"), "./file", url))
    })
}

// 其他实例启动时，主实例会通过 second-instance 事件接收其他实例的启动参数 `argv`
app.on("second-instance", (event, argv) => {
    // Windows 下通过协议URL启动时，URL会作为参数，所以需要在这个事件里处理
    if (process.platform === "win32") {
        handleArgv(argv)
    }
})

// macOS 下通过协议URL启动时，主实例会通过 open-url 事件接收这个 URL
app.on("open-url", (event, urlStr) => {
    handleUrl(urlStr)
})

function handleArgv(argv) {
    const prefix = `${PROTOCOL}:`
    // 开发阶段，跳过前两个参数（`electron.exe .`）
    // 打包后，跳过第一个参数（`myapp.exe`）
    const offset = app.isPackaged ? 1 : 2
    const url = argv.find((arg, i) => i >= offset && arg.startsWith(prefix))
    if (url) handleUrl(url)
}

function handleUrl(urlStr) {
    // myapp://?name=1&pwd=2
    const urlObj = new URL(urlStr)
    const { searchParams } = urlObj
    console.log(urlObj.search) // -> ?name=1&pwd=2
    console.log(searchParams.get("name")) // -> 1
    console.log(searchParams.get("pwd")) // -> 2
    // 根据需要做其他事情
}
