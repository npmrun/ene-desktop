import { initFolder } from "@rush/main-module/folder";

export async function getFolderTree(folderPath?: string) {
    return await initFolder(folderPath)
}
// Z:\劳动仲裁\MD