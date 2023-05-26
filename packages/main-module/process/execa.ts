// import { spawn } from "cross-spawn"
import { spawn } from "child_process"
import * as iconv from "iconv-lite"
import { URL } from "url"

export function execa(
    command: string,
    argu?: string[],
    callback?: (err?: any, data?: any, isComplete?: boolean) => void,
    env?: {},
    cwd?: string | URL
) {
    let myProcess = spawn(command, argu, {
        // https://www.jianshu.com/p/d4d7cf170e79
        shell: process.platform === 'win32', // 仅在当前运行环境为 Windows 时，才使用 shell
        stdio: "pipe",
        env: env,
        cwd
    })
    myProcess.stdout.on("data", data => {
        callback && callback(null, `${data}`)
    })
    myProcess.on("error", err => {
        callback && callback(`${err}`)
    })
    myProcess.stderr.on("data", data => {
        callback && callback(`${iconv.decode(data, "gbk")}`)
    })

    myProcess.on("close", code => {
        callback && callback(null, `${code}`, true)
    })
    return myProcess
}
