
import setting from "@rush/share/setting"
import { rootPath } from "@rush/share"
import path from "path"
import fs from "fs-extra"

fs.ensureFileSync(path.resolve(rootPath, `./changelog/${setting.app_version}.md`))
const workInfo = fs.readJSONSync(path.resolve(rootPath, "./package.json"))
const pkgInfo = fs.readJSONSync(path.resolve(rootPath, "dist/package.json"))
pkgInfo.name = setting.app_title
pkgInfo.version = setting.app_version
pkgInfo.dependencies = workInfo.dependencies
fs.writeJSONSync(path.resolve(rootPath, "dist/package.json"), pkgInfo, {
    spaces: 4,
    EOL: '\n'
})