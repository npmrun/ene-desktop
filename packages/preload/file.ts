import fs from "fs-extra"
import path from "path"

export async function readFile(path: string): Promise<any> {
    const data = await fs.readFile(path, "utf8")
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

export function walkDir(fromDir) {
    _walkDir(fromDir, function (file) {
        let fromRes = path.resolve(fromDir, file)
        console.log(fromRes);
    })
}