import watcher from "@parcel/watcher";
import { Settings } from "@rush/main-config/config";
import { Mitt } from "@rush/main-module/mitt";
import { broadcast } from "@rush/main-tool/broadcast";
import path from "path";

const allWatchDir: Record<string, watcher.AsyncSubscription> = {}

export async function init(dir: string) {
    if(!dir) return
    if(allWatchDir[dir]) {
        console.log("本就在监听：", dir);
        return
    }
    console.log("开始监听：", dir);
    allWatchDir[dir] = await watcher.subscribe(Settings.n.values("storagePath"), (err, events) => {
        if(err) throw err
        broadcast("filetree-update-message", events.map(v=>{
            return {
                path: v.path.split(path.sep).join('/'),
                type: v.type
            }
        }))
    });
    return true
}

export async function dispose(dir: string) {
    if(!dir) return
    await allWatchDir[dir]?.unsubscribe()
    Reflect.deleteProperty(allWatchDir, dir)
    console.log("取消监听：", dir);
    return true
}

Mitt.on("exit", ({ code })=>{
    // 应用退出
    // 清除所有
    for (const key in allWatchDir) {
        if (Object.prototype.hasOwnProperty.call(allWatchDir, key)) {
            const element = allWatchDir[key];
            element.unsubscribe()
            Reflect.deleteProperty(allWatchDir, key)
        }
    }
})