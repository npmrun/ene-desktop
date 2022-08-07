import { validateCron } from "@rush/common/util"
import { Settings } from "@rush/main-config/config"
// import { mainConfig } from "@rush/main-config"
import schedule, { Job } from "node-schedule"
import logger from "electron-log"
import watcher, { AsyncSubscription } from "@parcel/watcher"
import path from "path"

let job: Job | null = null
let wat: AsyncSubscription | null = null
let canBackup = false


export async function initBackupJob() {
    if (!validateCron(Settings.n.values("backup_rule"))) {
        console.error("无效Cron表达式")
        return
    }
    console.log(Settings.n.values("backup_rule"));
    if(wat){
        await wat.unsubscribe()
    }
    wat = await watcher.subscribe(path.resolve(Settings.n.values("storagePath"), "db"), (err, events) => {
        logger.debug(events)
        canBackup = true
    })

    if (job) {
        job.reschedule(Settings.n.values("backup_rule"))
        console.error("定时备份任务重新运行")
    } else if (job == null) {
        console.error("定时备份任务初始化成功")
        job = schedule.scheduleJob(Settings.n.values("backup_rule"), async function () {
            if (canBackup) {
                console.log("备份测试")
                // await backup(mainConfig.storagePath)
                canBackup = false
            } else {
                console.log("该文件没有过更新，暂不备份")
            }
        })
    }
}
