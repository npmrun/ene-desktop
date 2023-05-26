import { fork } from "child_process"
import { URL } from "url"

export function forkFn(
    file: string,
    argu?: string[],
    callback?: (err?: any, data?: any, isComplete?: boolean) => void,
    env?: {},
    cwd?: string | URL
) {
    let myProcess = fork(file, argu, {
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
        callback && callback(`${data}`)
    })

    myProcess.on("close", code => {
        callback && callback(null, `${code}`, true)
    })
    return myProcess
}
