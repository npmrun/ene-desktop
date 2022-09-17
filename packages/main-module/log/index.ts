import path from "path"
import fs from "fs-extra"
import logger from "electron-log"
import { app, netLog } from "electron"
import { Settings } from "@rush/main-config/config"

export type TLog = Record<string, { path: string; log: logger.ElectronLog }>
export type Tname = "global"
const _logs: TLog = {}

// export function initGlobalLog() {
//     const appPath = app.getPath('logs')
//     let logFilePath = path.resolve(appPath, 'app_run' + '.txt')
//     const _log = getLog('global', logFilePath).log
//     // const _log = logger.create('global')
//     // fs.ensureFileSync(logFilePath)
//     _log.log('日志路径:' + logFilePath)
//     _log.log('日志路径配置成功')
// }

// export function getLog(name: Tname | any, path: string) {
//     if (_logs[name]) return _logs[name]
//     const _log = logger.create(name)
//     fs.ensureFileSync(path)
//     _log.transports.file.resolvePath = () => path
//     return {
//         path: path,
//         log: _log,
//     }
// }

// app.whenReady().then(async () => {
//     await netLog.startLogging(path.resolve(mainConfig.storagePath, "./logs", "__net__" + ".txt"))
// })
// export async function startReacordNetLog(){
//     await netLog.startLogging(path.resolve(mainConfig.storagePath, './logs', '__net__' + '.txt'))
// }
// export async function stopReacordNetLog(){
//     await netLog.stopLogging()
// }
// 扩展模块
declare module "electron-log" {
    export interface ElectronLog {
        _createLog(name: any): { path: string; log: logger.ElectronLog }
    }
}
declare global {
    var logger: logger.ElectronLog
}

export function initGlobalLog() {
    const storagePath = Settings.n.values("storagePath")
    let logFilePath = path.resolve(storagePath, "./logs", "__global__" + ".txt")
    fs.ensureFileSync(logFilePath)
    logger.transports.file.resolvePath = () => logFilePath
    logger.debug("日志路径:" + logFilePath)
    logger.debug("日志路径配置成功")
    logger._createLog = createLog
    global.logger = logger
    // ;(async () => {
    //     await netLog.stopLogging()
    //     await netLog.startLogging(path.resolve(mainConfig.storagePath, "./logs", "__net__" + ".txt"))
    // })()
}
export function createLog(name: Tname | any) {
    if (_logs[name]) return _logs[name]
    const _log = logger.create(name)
    const storagePath = Settings.n.values("storagePath")
    return {
        get path() {
            let logFilePath = path.resolve(storagePath, "./logs", name + ".txt")
            fs.ensureFileSync(logFilePath)
            return logFilePath
        },
        get log() {
            _log.transports.file.resolvePath = () => this.path
            return _log
        },
    }
}
