

import { shell, clipboard, Notification, dialog } from "electron"
import { appTrayPath } from "@rush/main-tool"
import { mime } from "@rush/main-tool/mime-util"
import fs from "fs"
import path from "path"
import CryptoJS from "crypto-js"

export function openExternal(url:string) {
    shell.openExternal(url)
}

export async function openDir(path: string){
    shell.openPath(path)
}

export function showItemInFolder(fullPath: string){
    return shell.showItemInFolder(path.normalize(fullPath))
}

export function copyText(text: string) {
    clipboard.writeText(text, "clipboard")
    // const n = new Notification({title: "片段复制", body: "复制成功，请在您需要的地方粘贴", icon: appTrayPath})
    // n.show()
}

export function copyImageToFile() {
    // const output = [];
	// const formats = clipboard.availableFormats();
	// for (let i = 0; i < formats.length; i++) {
	// 	const format = formats[i].toLowerCase();
	// 	const formatType = format.split('/')[0];

	// 	if (formatType === 'image') {
	// 		const image = clipboard.readImage();

	// 		const fileExt = mime.toFileExtension(format);
    //         const timestramp = Date.now()
	// 		const filePath = path.resolve(mainConfig.storagePath, "./file/"+CryptoJS.MD5(String(timestramp)).toString()+fileExt);

	// 		// await shim.writeImageToFile(image, format, filePath);
	// 		// const md = await commandAttachFileToBody('', [filePath]);
	// 		// await shim.fsDriver().remove(filePath);

	// 		// if (md) output.push(md);
	// 	}
	// }
	// return output;
    // const image = clipboard.readImage("clipboard")
    // if(!image.isEmpty()){
    //     const buffer = image.getBitmap();
    //     const timestramp = Date.now()

    //     fs.writeFile(path.resolve(mainConfig.storagePath, "./file/"+CryptoJS.MD5(String(timestramp)).toString()+''), buffer, function (err: Error | null) {
    //         if(err) throw err;
    //         console.log("保存成功");
    //     })
    // }
}
