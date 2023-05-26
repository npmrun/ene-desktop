import { ChildProcessWithoutNullStreams } from "child_process"
import { execa } from "./execa"
import { forkFn } from "./fork"
import kill, { killPID } from "./kill"
import { iGetInnerText } from "@rush/common/util"
import { EProcessStatus } from "@rush/common/process"
import { broadcast } from "@rush/main-tool"
import { checkCommand } from "./script"
import { Mitt } from "@rush/main-module/mitt"
import { app } from "electron"
import path from "path"
import fs from "fs-extra"

const appPath = path.resolve(app.getAppPath(), "all-pid")
fs.ensureDir(appPath)

// function spawnEvent(pid) {
//     console.log("创建" + path.resolve(appPath, String(pid)))
//     fs.createFileSync(path.resolve(appPath, String(pid)))
// }
// function exitEvent(pid) {
//     let pidPath = path.resolve(appPath, String(pid))
//     console.log("删除" + pidPath)
//     if (fs.existsSync(pidPath)) {
//         fs.rmSync(pidPath)
//     }
// }

interface IProcessChild {
    key: number | string
    command: string
    execCommand: {
        cmd: string
        argu: string[]
    }
    status: EProcessStatus
    log: string[]
    instance: null | ChildProcessWithoutNullStreams
}

class ProcessManager {
    private constructor() { }
    static instance: null | ProcessManager = null
    static getInstance() {
        if (ProcessManager.instance == null) {
            ProcessManager.instance = new ProcessManager()
        }
        return ProcessManager.instance
    }

    private _processlist: IProcessChild[] = []

    getList() {
        let array = this._processlist.map(v => {
            let obj = Object.assign({}, v) as any
            delete obj.instance
            return obj
        })
        return array
    }

    send(key: string | number, status: EProcessStatus, message?: string) {
        broadcast("event:process", { key: key, status: status, message: message })
    }

    getProcess(key: string | number) {
        let array = this._processlist.filter(v => {
            return v.key === key
        })
        let instance = array[0]
        if (instance) {
            let obj = Object.assign({}, instance) as any
            delete obj.instance
            return obj
        }
    }

    async run(command: string) {
        const commandArray = command.split(" ")
        let execCommand = checkCommand(commandArray[0])
        let exec = forkFn
        if (!execCommand) {
            exec = execa
            execCommand = commandArray[0]
        }
        let args = commandArray.slice(1)
        const pid = await new Promise(resolve => {
            let p = exec(execCommand, args, (err, data, isComplete) => {
                if (isComplete) {
                    broadcast(`process.run`, `command run completed: ${command}`)
                    return
                }
                broadcast(`process.run`, err || data)
            }, {}, app.getAppPath())
            // p.on("spawn", () => spawnEvent(p.pid))
            // p.on("error", () => exitEvent(p.pid))
            // p.on("exit", () => exitEvent(p.pid))
            resolve(p.pid)
        })
        return pid
    }

    createProcess(key: string | number, command: string): boolean {
        let pro = this._processlist.filter(v => v.key === key)[0]
        if (pro) {
            this.send(key, pro.status, "")
            return false
        }
        const commandArray = command.split(" ")
        let execCommand = checkCommand(commandArray[0])
        let exec = !!execCommand ? forkFn : execa
        let args = commandArray.slice(1)
        let oneProcess: IProcessChild = {
            key: -1,
            command,
            execCommand: {
                cmd: execCommand,
                argu: args,
            },
            log: [],
            status: EProcessStatus.Normal,
            instance: null,
        }
        oneProcess.status = EProcessStatus.Starting
        this.send(key, oneProcess.status)
        let p = exec(execCommand, args, (err, data, isComplete) => {
            if (isComplete) {
                oneProcess.status = EProcessStatus.Exit
                this.send(key, oneProcess.status, iGetInnerText(`${data}`))
                oneProcess.log.push(`${data}`)
                this.clearOneDeath(p)
                return
            }
            if (err) {
                this.send(key, oneProcess.status, err)
                oneProcess.log.push(err)
            } else {
                this.send(key, oneProcess.status, iGetInnerText(`${data}`))
                oneProcess.log.push(iGetInnerText(data))
            }
        }, {}, app.getAppPath())

        // p.on("spawn", () => spawnEvent(p.pid))
        // p.on("error", () => exitEvent(p.pid))
        // p.on("exit", () => exitEvent(p.pid))

        p.on("spawn", () => {
            oneProcess.status = EProcessStatus.Running
            this.send(key, oneProcess.status)
        })
        oneProcess.key = key
        oneProcess.instance = p
        this._processlist.push(oneProcess)
        return true
    }

    killAll() {
        let list = this._processlist
        for (let i = 0; i < list.length; i++) {
            const process = list[i]
            const instance = process.instance
            if (instance) {
                process.status = EProcessStatus.Stopping
                this.send(process.key, process.status)
                let isKilled = process.instance.kill()
                if(!isKilled){
                    kill(process.instance)
                }
                this.clearOneDeath(process.instance)
                process.status = EProcessStatus.Exit
                // if (process.instance.pid) {
                //     exitEvent(process.instance.pid)
                // }
            }
        }
    }
    kill(key: string | number) {
        let list = this._processlist
        for (let i = 0; i < list.length; i++) {
            const process = list[i]
            if (process.key === key) {
                const instance = process.instance
                if (instance) {
                    process.status = EProcessStatus.Stopping
                    this.send(process.key, process.status)
                    let isKilled = process.instance.kill()
                    if(!isKilled){
                        kill(process.instance)
                    }
                    this.clearOneDeath(process.instance)
                    process.status = EProcessStatus.Exit
                    // if (process.instance.pid) {
                    //     exitEvent(process.instance.pid)
                    // }
                }
                break
            }
        }
    }
    killPID(pid: string) {
        killPID(pid)
    }
    clearOneDeath(p: ChildProcessWithoutNullStreams) {
        let list = this._processlist
        let len = list.length
        for (let i = len - 1; i >= 0; i--) {
            const process = list[i]
            const instance = process.instance
            if (instance === p) {
                if (process.status === EProcessStatus.Exit || process.status === EProcessStatus.Normal) {
                    let isKilled = process.instance.kill()
                    if(!isKilled){
                        kill(process.instance)
                    }
                    // if (process.instance.pid) {
                    //     exitEvent(process.instance.pid)
                    // }
                    this._processlist.splice(i, 1)
                }
                if (instance?.killed) {
                    this._processlist.splice(i, 1)
                }
                break
            }
        }
    }
    clearAllDeath() {
        let list = this._processlist
        let len = list.length
        let count = 0
        for (let i = len - 1; i >= 0; i--) {
            const process = list[i]
            const instance = process.instance
            if ((process.status === EProcessStatus.Exit || process.status === EProcessStatus.Normal) && instance) {
                let isKilled = process.instance.kill()
                if(!isKilled){
                    kill(process.instance)
                }
                // if (process.instance.pid) {
                //     exitEvent(process.instance.pid)
                // }
                count++
                this._processlist.splice(i, 1)
            }
            if (instance?.killed) {
                count++
                this._processlist.splice(i, 1)
            }
        }
        console.log("去除" + count + "个子进程")
        console.log("当前还剩" + this._processlist.length + "个子进程")
    }
}

const instance = ProcessManager.getInstance()

export default instance

Mitt.on("exit", ({ code }) => {
    console.log("清理所有存在的进程")
    instance.killAll()
    process.exit(code)
})
