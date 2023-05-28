import { dialog } from 'electron'
import { Shared } from "@rush/main-share"
import { appTrayPath } from '@rush/main-tool'
import setting from '@rush/share/setting'
import eAlert from "electron-alert";
/**
 * 选择本地文件夹地址
 */
export function saveDir(title: string, defaultPath: string) {
    return new Promise((resolve, reject) => {
        dialog
            .showSaveDialog(Shared.data.focusWindow, {
                title: title,
                defaultPath: defaultPath,
                buttonLabel: "保存",
                properties: ['showHiddenFiles', 'createDirectory', 'showOverwriteConfirmation'],
            })
            .then((result) => {
                if (!result.canceled) {
                    let path = result.filePath
                    resolve(path)
                } else {
                    reject(new Error("取消选择"))
                }
            })
            .catch((err) => {
                reject(err)
            })
    })
}

/**
 * 选择本地文件夹地址
 */
export function chooseDir(title: string, defaultPath: string) {
    return new Promise((resolve, reject) => {
        dialog
            .showOpenDialog(Shared.data.focusWindow, {
                title: title,
                defaultPath: defaultPath,
                properties: ['openDirectory', 'openFile'],
            })
            .then((result) => {
                if (!result.canceled) {
                    let path = result.filePaths[0]
                    resolve(path)
                } else {
                    reject(new Error("取消选择"))
                }
            })
            .catch((err) => {
                reject(err)
            })
    })
}
export function error(title: string, message: string) {
    return new Promise((resolve, reject) => {
        dialog.showErrorBox(title, message)
        resolve(void 0)
    })
}

export function alert(message: string, title: string = setting.app_title) {
    return new Promise((resolve, reject) => {
        dialog
            .showMessageBox(Shared.data.focusWindow, {
                title: title,
                message: message,
                type: "none"
            })
            .then((result) => {
                resolve(result.response)
            })
            .catch((err) => {
                reject(err)
            })
    })
}

const aa = new eAlert();
export function confrim(opt: any) {
    return new Promise((resolve, reject) => {
        let swalOptions = {
            title: opt.title || "",
            text: opt.message,
            icon: "warning",
            showCancelButton: true
        };
        let promise = aa.fireWithFrame(swalOptions, opt.title || "", Shared.data.mainWindow, true)
        promise.then((result) => {
            if (result.value) {
                resolve(1)
            } else if (result.dismiss === eAlert.DismissReason.cancel) {
                resolve(0)
            } else {
                resolve(0)
            }
        })
    })
}

// export function confrim(opt: any) {
//     return new Promise((resolve, reject)=>{
//         dialog
//         .showMessageBox(Shared.data.focusWindow, {
//             title: opt.title || "",
//             message: opt.message,
//             type: "question",
//             defaultId: 0,
//             cancelId: 0,
//             // @ts-ignore
//             width: 400,
//             height: 200,
//             buttons: opt.textList ?? ["取消", "确定"],
//         })
//         .then((result) => {
//             resolve(result.response)
//         })
//         .catch((err) => {
//             reject(err)
//         })
//     })
// }
