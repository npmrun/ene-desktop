import fs from "fs-extra"
import path from "path"

export async function readFile(path: string): Promise<any> {
    const data = await fs.readFile(path, "utf8")
    return data
}

export function writeFileSync(path: string, str: string) {
    fs.writeFileSync(path, str, "utf8")
}

export function readFileSync(path: string): string {
    const data = fs.readFileSync(path, "utf8")
    return data
}
export async function readDir(path: string): Promise<any> {
    const files = await fs.readdir(path, { encoding: "utf8" })
    return files
}

function _walkDir(dir: string, cb?: (file: string) => void) {
    function _walk(_dir = ".") {
        const statInfo = fs.statSync(dir + path.sep + _dir)
        if (statInfo.isDirectory()) {
            const paths = fs.readdirSync(path.resolve(dir + path.sep + _dir))
            for (let i = 0; i < paths.length; i++) {
                _walk(_dir + path.sep + paths[i])
            }
        } else if (statInfo.isFile()) {
            cb && cb(_dir)
        }
        return true
    }
    return _walk()
}

export function walkDir(fromDir, cb) {
    if (!fs.pathExistsSync(fromDir)) {
        console.error("路径不存在:"+fromDir)
        return
    }
    _walkDir(fromDir, function (file) {
        let fromRes = path.resolve(fromDir, file)
        cb?.(fromRes)
    })
}
