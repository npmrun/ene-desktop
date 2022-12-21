import watcher from "@parcel/watcher"
import { alert } from "@rush/main-tool/dialog";
import fs from "fs-extra"
import path from "path"
import _ from "lodash"
import { broadcast } from "@rush/main-tool";

/**
 * 采用读取文件夹的方式先读取第一层文件夹，更具打开的路径读取目录下的文件夹
 * 监听文件变化，发出事件，渲染层主进程共同处理
 */

const folderObject = {
    name: "MD",
    real: "Z:\\劳动仲裁\\MD",
    children: [

    ]
}

function walkDir(dir: string) {
    const curFolderPath = path.resolve(dir);
    const statInfo = fs.statSync(curFolderPath)
    if (!statInfo.isDirectory()) return
    const paths = fs.readdirSync(path.resolve(curFolderPath))
    const result = []
    for (let i = 0; i < paths.length; i++) {
        const curSubPath = path.resolve(curFolderPath + path.sep + paths[i])
        const curSubParsePath = path.parse(curFolderPath + path.sep + paths[i])
        result.push({
            name: curSubParsePath.name,
            real: curSubPath
        })
    }
    return result
}

function findBy(key, obj) {
    if(obj.real === key){
        return obj
    }
    if (obj.children && Array.isArray(obj.children)) {
        for (let i = 0; i < obj.children.length; i++) {
            const r = findBy(key, obj.children[i])
            if(r){
                return r
            }
        }
    }
}

let subscription: watcher.AsyncSubscription
export async function initFolder(folderPath?: string) {
    if(!folderPath){
        return
    }
    if (!fs.pathExistsSync(folderPath)) {
        setTimeout(() => {
            alert("读取文件夹错误", "警告")
        }, 1000);
        return
    }
    const statInfo = fs.statSync(folderPath)
    if (!statInfo.isDirectory()) {
        alert("该路径不是文件夹", "警告")
        return
    }
    const curParsePath = path.parse(folderPath)
    const rootDir = {
        name: curParsePath.name || "root",
        real: path.resolve(folderPath),
        children: []
    }
    rootDir.children = walkDir(folderPath)
    if(subscription){
        await subscription.unsubscribe()
        subscription = undefined
    }
    subscription = await watcher.subscribe(folderPath, (err, events) => {
        if (err) {
            logger.error(err)
            return
        }
        logger.debug(events)
        for (let i = 0; i < events.length; i++) {
            const { path: cpath, type } = events[i];
            switch (type) {
                case "create":
                    console.log('文件创建：' + cpath);
                    const curParsePath = path.parse(cpath)
                    const node = findBy(curParsePath.dir, rootDir)
                    if(!node.children){
                        node.children = []
                    }
                    const r = {
                        name: curParsePath.name,
                        real: path.resolve(cpath)
                    }
                    node.children.push(r)
                    broadcast("folder-create", r, node, rootDir)
                    break;
                case "delete":
                    console.log('文件删除：' + cpath);
                    const curParsePath2 = path.parse(cpath)
                    const node2 = findBy(curParsePath2.dir, rootDir)
                    const r2 = {
                        name: curParsePath2.name,
                        real: path.resolve(cpath)
                    }
                    node2.children = node2.children.filter(v=>v.real!==r2.real)
                    broadcast("folder-delete", r2, node2, rootDir)
                    break;
                case "update":
                    console.log('文件更改：' + cpath);
                    const curParsePath3 = path.parse(cpath)
                    const node3 = findBy(curParsePath3.dir, rootDir)
                    const node4 = findBy(curParsePath3, rootDir)
                    const r3 = {
                        name: curParsePath3.name,
                        real: path.resolve(cpath)
                    }
                    Object.assign(node4, r3)
                    broadcast("folder-update", node4, node3, rootDir)
                    break;
            }
        }
    })
    return rootDir
}
