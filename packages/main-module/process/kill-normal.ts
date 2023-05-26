import { platform } from "@rush/main-tool"
import { ChildProcess, ChildProcessWithoutNullStreams, execSync } from "child_process"
import { spawn } from "child_process"
import * as iconv from "iconv-lite"

export default function kill(process: ChildProcessWithoutNullStreams | null, callback?: (err?: any, data?: any, isComplete?: boolean) => void) {
    if (!process) return
    const pid = process.pid
    let myProcess
    if (platform === "Linux") {
        console.log("kill " + pid)
        myProcess = spawn("kill", [String(pid)])
    }
    if (platform === "MacOS") {
        console.log("kill " + pid)
        myProcess = spawn("kill", [String(pid)])
    }
    if (platform === "windows") {
        console.log("TASKKILL /T /PID " + pid)
        myProcess = spawn("TASKKIll", ["/T", "/PID", String(pid)])
    }
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
}

export function killPID(pid: string, callback?: (err?: any, data?: any, isComplete?: boolean) => void) {
    if (!pid) return
    let myProcess
    if (platform === "Linux") {
        console.log("kill " + pid)
        myProcess = spawn("kill", [String(pid)])
    }
    if (platform === "MacOS") {
        console.log("kill" + pid)
        myProcess = spawn("kill", [String(pid)])
    }
    if (platform === "windows") {
        console.log("TASKKILL /T /PID " + pid)
        myProcess = spawn("TASKKIll", ["/T", "/PID", String(pid)])
    }
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
}