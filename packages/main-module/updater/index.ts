import { ipcMain, app } from "electron"
import { NsisUpdater, ProgressInfo, UpdateInfo } from "electron-updater"
import { Settings } from "@rush/main-config/config"
import { broadcast } from "@rush/main-tool"
import logger from "electron-log"

let autoUpdater: NsisUpdater

export function initUpdate(): void {
    if (!app.isPackaged) return

    let owner = Settings.n.values("update.owner")
    let repo = Settings.n.values("update.repo")
    if (!autoUpdater) {
        autoUpdater = new NsisUpdater({
            provider: "github",
            repo: repo,
            owner: owner,
        })
        autoUpdater.fullChangelog = true
        const log = logger._createLog("updater").log
        autoUpdater.logger = log
        // 开始检查更新
        autoUpdater.on("checking-for-update", () => {
            broadcast("checking-for-update", {
                message: "开始检查更新",
            })
        })

        // 检查更新出错
        autoUpdater.on("error", () => {
            broadcast("updater:error", {
                message: "检查更新出错",
            })
        })

        // 检查到新版本
        autoUpdater.on("update-available", (info: UpdateInfo) => {
            log.debug("新版本信息为:", info)
            broadcast("updater:avaliable", {
                message: `检查到新版本 v ${info.version}，开始下载`,
            })
        })

        // 已经是新版本
        autoUpdater.on("update-not-available", (info: UpdateInfo) => {
            log.debug("当前版本信息为:", info)
            broadcast("updater:notavaliable", {
                message: `当前版本已经是最新 v ${info.version}`,
            })
        })

        // 更新下载中
        autoUpdater.on("download-progress", (info: ProgressInfo) => {
            broadcast("updater:download_progress", {
                percent: info.percent,
            })
        })

        // 更新下载完毕
        autoUpdater.on("update-downloaded", () => {
            broadcast("updater:downloaded", {
                message: "新版本下载完毕,点击安装",
            })
        })

        // 立即更新
        ipcMain.on("updater:quitandinstall", () => {
            autoUpdater.quitAndInstall()
        })

        ipcMain.on("updater:check", () => {
            broadcast("checking-for-update", {
                message: "初始化检查更新",
            })
            autoUpdater.checkForUpdatesAndNotify()
        })
        autoUpdater.checkForUpdatesAndNotify()
    } else {
        autoUpdater.setFeedURL({
            provider: "github",
            repo: repo,
            owner: owner,
        })
    }
}
