import fs from "fs-extra"
import path from "path"
import URL from "url"

export function isDirectory(path: string): boolean {
    const fileStats = fs.statSync(path) // 获取文件的状态信息
    return fileStats.isDirectory()
}
export async function readFile(path: string): Promise<any> {
    const fileStats = fs.statSync(path) // 获取文件的状态信息
    if (fileStats.isDirectory()) {
        throw new Error(`${path} 不是文件`)
    }
    const data = await fs.readFile(path, "utf8")
    return data
}
export async function renameFile(oldPath: string, newPath: string): Promise<any> {
    if (fs.existsSync(newPath)) {
        throw `${newPath}已存在`
    }
    await fs.rename(oldPath, newPath)
}
export function moveSync(src: string, dest: string) {
    fs.moveSync(src, dest)
}
export function writeFileSync(path: string, str: string) {
    fs.writeFileSync(path, str, "utf8")
}
export function fileStat(path: string) {
    const fileStats = fs.statSync(path) // 获取文件的状态信息
    return fileStats
}
export function rm(path: string) {
    const fileStats = fs.statSync(path) // 获取文件的状态信息
    if (fileStats.isDirectory()) {
        fs.rmSync(path, { recursive: true, force: true })
    } else {
        fs.rmSync(path)
    }
}
export function readFileSync(path: string): string {
    const fileStats = fs.statSync(path) // 获取文件的状态信息
    if (fileStats.isDirectory()) {
        throw new Error(`${path} 不是文件`)
    }
    const data = fs.readFileSync(path, "utf8")
    return data
}
export function pathToFileURL(path: string): string {
    return URL.pathToFileURL(path).toString()
}
export async function readDir(path: string): Promise<any> {
    const files = await fs.readdir(path, { encoding: "utf8" })
    return files
}
export function createFileSync(path: string) {
    return fs.createFileSync(path)
}
export function mkdirSync(path: string) {
    return fs.mkdirSync(path)
}
export function normalizePath(filePath: string): string {
    return path.normalize(filePath)
}
export function existsSync(filePath: string): boolean {
    return fs.existsSync(filePath)
}
export function replacePath(filePath: string) {
    return filePath.split(path.sep).join("/")
}
export function realpathSync(filePath: string) {
    return fs.realpathSync(filePath, "hex")
}

let extraPath = path.join(__dirname, "../../extra")
if (__dirname.split(path.sep).indexOf("app.asar") >= 0) {
    extraPath = path.join(__dirname, "../..")
}
export function saveOpenFile(content: string) {
    const p = path.join(extraPath, "app-opendir")
    fs.ensureFileSync(p)
    fs.writeFileSync(p, content, "utf-8")
}

export function loadOpenFile() {
    const p = path.join(extraPath, "app-opendir")
    fs.ensureFileSync(p)
    return fs.readFileSync(p, "utf-8")
}

function _walkDir(dir: string, cb?: (file: string, isDirectory: boolean) => void) {
    function _walk(_dir = ".") {
        const statInfo = fs.statSync(dir + path.sep + _dir)
        if (statInfo.isDirectory()) {
            const paths = fs.readdirSync(path.resolve(dir + path.sep + _dir))
            cb && cb(dir + path.sep + _dir, true)
            for (let i = 0; i < paths.length; i++) {
                _walk(_dir + path.sep + paths[i])
            }
        } else if (statInfo.isFile()) {
            cb && cb(_dir, false)
        }
        return true
    }
    return _walk()
}

export function walkDir(fromDir, cb: (file: string, isDirectory: boolean) => void) {
    if (!fs.pathExistsSync(fromDir)) {
        console.error("路径不存在:" + fromDir)
        return
    }
    _walkDir(fromDir, function (file, isDirectory) {
        let fromRes = path.resolve(fromDir, file)
        cb?.(fromRes, isDirectory)
    })
}

export function readFolderToTree(folderPath, fn?:(node: any)=>boolean) {
    const stats = fs.statSync(folderPath) // 获取文件夹的状态信息
    if (!stats.isDirectory()) {
        throw new Error("The provided path is not a directory.")
    }

    const folderName = path.basename(folderPath) // 获取文件夹的名称
    const tree = {
        title: folderName,
        base: folderName,
        type: "folder",
        children: [],
        key: fs.realpathSync(folderPath, "hex"),
        path: folderPath
    }
    fn && fn(tree)
    const files = fs.readdirSync(folderPath) // 读取文件夹内的所有文件和文件夹
    files.forEach(file => {
        const filePath = path.join(folderPath, file) // 构建文件的完整路径

        const fileStats = fs.statSync(filePath) // 获取文件的状态信息
        if (fileStats.isDirectory()) {
            const childTree = readFolderToTree(filePath, fn) // 递归处理子文件夹
            tree.children.push(childTree)
        } else {
            // const fileName = path.basename(file, path.extname(file)); // 获取文件的名称（不包括扩展名）
            const fileName = file // 获取文件的名称（包括扩展名）
            const fileNode = { title: fileName, base: fileName, type: "file", key: fs.realpathSync(filePath, "hex"),path: filePath }
            fn && fn(fileNode)
            tree.children.push(fileNode)
        }
    })
    return tree
}
