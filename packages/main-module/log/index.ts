import path from "path"
import fs from "fs-extra"
import logger from "electron-log"
import { app, netLog } from "electron"
import { Settings } from "@rush/main-config/config"
import { formatDate } from "@rush/common/util/date"

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
    var loggerClient: logger.ElectronLog
    var loggerMain: logger.ElectronLog
}

function getLogPath(name: string) {
    const logPath = Settings.n.values("logPath")
    let logFilePath = path.resolve(logPath, `${curTimestamp}.` + name + ".txt")
    fs.ensureFileSync(logFilePath)
    return logFilePath
}

const curTimestamp = formatDate(new Date(), "yyyy_MM_dd_HH_mm_ss_S")

export function initGlobalLog() {
    let logFilePath = getLogPath("__global__")
    logger.transports.file.resolvePath = () => logFilePath
    logger.debug("日志路径:" + logFilePath)
    logger.debug("日志路径配置成功")
    logger._createLog = createLog
    global.logger = logger
    global.loggerMain = createLog("__main__").log
    global.loggerClient = createLog("__client__").log
    loggerMain.debug("主进程日志初始化")
    loggerClient.debug("客户端日志初始化")
    loggerMain.debug(app.getPath("logs"))
    // ;(async () => {
    //     await netLog.stopLogging()
    //     await netLog.startLogging(path.resolve(mainConfig.userData, "./logs", "__net__" + ".txt"))
    // })()
}
export function createLog(name: Tname | any) {
    if (_logs[name]) return _logs[name]
    const _log = logger.create(name)
    return {
        get path() {
            let logFilePath = getLogPath(name)
            return logFilePath
        },
        get log() {
            _log.transports.file.resolvePath = () => this.path
            return _log
        },
    }
}
