import fs from "fs-extra"
import { app } from "electron"
import path from "path"
import setting from "@rush/share/setting"
import { cloneDeep } from "lodash"

type IOnFunc = (n: IConfig, c: IConfig) => void
type IT = (keyof IConfig)[] | keyof IConfig | "_"

const defaultConfig: IConfig = {
    language: "zh",
    backup_rule: "0 0/30 * * * ?",
    "common.theme": "auto",
    "update.repo": "electron-template",
    "update.owner": "npmrun",
    "editor.bg": "",
    "snippet.storagePath": path.join(app.getPath("documents"), setting.app_title, "./SnippetData"),
    "bookmark.storagePath": path.join(app.getPath("documents"), setting.app_title, "./BookmarkData"),
    storagePath: path.join(app.getPath("documents"), setting.app_title),
}

function init(config: IConfig) {
    // 在配置初始化后执行
    fs.ensureDirSync(config["snippet.storagePath"])
    fs.ensureDirSync(config["bookmark.storagePath"])
}

// 判断是否是空文件夹
function isEmptyDir(fPath: string) {
    var pa = fs.readdirSync(fPath)
    if (pa.length === 0) {
        return true
    } else {
        return false
    }
}

class Settings {
    private static instance: Settings = null
    private constructor() {
        this.#init()
    }
    static init() {
        if (Settings.instance === null) {
            Settings.instance = new Settings()
        }
    }
    static get n() {
        return Settings.instance
    }

    #cb: [IT, IOnFunc][] = []

    onChange(fn: IOnFunc, that?: any)
    onChange(key: IT, fn: IOnFunc, that?: any)
    onChange(fnOrType: IT | IOnFunc, fnOrThat: IOnFunc | any = null, that: any = null) {
        if (typeof fnOrType === "function") {
            this.#cb.push(["_", fnOrType.bind(fnOrThat)])
        } else {
            this.#cb.push([fnOrType, fnOrThat.bind(that)])
        }
    }

    #runCB(n: IConfig, c: IConfig, keys: (keyof IConfig)[]) {
        for (let i = 0; i < this.#cb.length; i++) {
            const temp = this.#cb[i]
            const k = temp[0]
            const fn = temp[1]
            if (k === "_") {
                fn(n, c)
            }
            if (typeof k === "string" && keys.includes(k as keyof IConfig)) {
                fn(n, c)
            }
            if (Array.isArray(k) && k.filter(v => keys.indexOf(v) !== -1).length) {
                fn(n, c)
            }
        }
    }

    #pathFile: string = path.resolve(app.getPath("userData"), "./config_path")
    #config: IConfig = defaultConfig
    #configPath(storagePath?: string): string {
        return path.join(storagePath || this.#config.storagePath, "./config.json")
    }
    /**
     * 读取配置文件变量同步
     * @param confingPath 配置文件路径
     */
    #syncVar(confingPath?: string) {
        const configFile = this.#configPath(confingPath)
        if (!fs.pathExistsSync(configFile)) {
            fs.ensureFileSync(configFile)
            fs.writeJSONSync(configFile, {})
        }
        const config = fs.readJSONSync(configFile) as IConfig
        confingPath && (config.storagePath = confingPath)
        // 优先取本地的值
        for (const key in config) {
            // if (Object.prototype.hasOwnProperty.call(this.#config, key)) {
            //     this.#config[key] = config[key] || this.#config[key]
            // }
            // 删除配置时本地的配置不会改变，想一下哪种方式更好
            this.#config[key] = config[key] || this.#config[key]
        }
    }
    #init() {
        console.log(`位置：${this.#pathFile}`)
        if (fs.pathExistsSync(this.#pathFile)) {
            const confingPath = fs.readFileSync(this.#pathFile, { encoding: "utf8" })
            if (confingPath && fs.pathExistsSync(this.#configPath(confingPath))) {
                this.#syncVar(confingPath)
                // 防止增加了配置本地却没变的情况
                this.#sync(confingPath)
            } else {
                this.#syncVar(confingPath)
                this.#sync(confingPath)
            }
        } else {
            this.#syncVar()
            this.#sync()
        }
        init.call(this, this.#config)
    }
    config() {
        return this.#config
    }
    #sync(c?: string) {
        const config = cloneDeep(this.#config)
        delete config.storagePath
        const p = this.#configPath(c)
        fs.ensureFileSync(p)
        fs.writeJSONSync(this.#configPath(c), config)
    }
    #change(p: string) {
        const storagePath = this.#config.storagePath
        if (fs.existsSync(storagePath) && !fs.existsSync(p)) {
            fs.moveSync(storagePath, p)
        }
        if (fs.existsSync(p) && fs.existsSync(storagePath) && isEmptyDir(p)) {
            console.log("文件夹为空，直接覆盖")
            fs.moveSync(storagePath, p, { overwrite: true })
        }
        fs.writeFileSync(this.#pathFile, p, { encoding: "utf8" })
    }
    set(key: keyof IConfig | Partial<IConfig>, value?: any) {
        let oldMainConfig = Object.assign({}, this.#config)
        let isChange = false
        let changeKeys: (keyof IConfig)[] = []
        let canChangeStorage = (targetPath: string) => {
            if (fs.existsSync(oldMainConfig.storagePath) && fs.existsSync(targetPath) && !isEmptyDir(targetPath)) {
                if (fs.existsSync(path.join(targetPath, "./config.json"))) {
                    return true
                }
                return false
            }
            return true
        }
        if (typeof key === "string") {
            if (value != undefined && value !== this.#config[key]) {
                if (key === "storagePath") {
                    if (!canChangeStorage(value)) {
                        throw "无法改变存储地址"
                        return
                    }
                    try {
                        this.#change(value)
                    } catch (error) {
                        throw error
                    }
                    changeKeys.push("storagePath")
                    this.#config["storagePath"] = value
                } else {
                    changeKeys.push(key)
                    this.#config[key as string] = value
                }
                isChange = true
            }
        } else {
            if (key['storagePath'] !== undefined && key['storagePath'] !== this.#config['storagePath']) {
                if (!canChangeStorage(key['storagePath'])) {
                    throw "无法改变存储地址"
                    return
                }
                try {
                    this.#change(key['storagePath'])
                } catch (error) {
                    throw error
                }
                this.#config['storagePath'] = key['storagePath']
                changeKeys.push('storagePath')
                isChange = true
            }
            for (const _ in key) {
                if (Object.prototype.hasOwnProperty.call(key, _)) {
                    const v = key[_]
                    if (v != undefined && _ !== "storagePath" && v !== this.#config[_]) {
                        this.#config[_] = v
                        changeKeys.push(_ as keyof IConfig)
                        isChange = true
                    }
                }
            }
        }
        if (isChange) {
            this.#sync()
            this.#runCB(this.#config, oldMainConfig, changeKeys)
        }
    }
    values(key: keyof IConfig) {
        return this.#config[key]
    }
}

export { Settings }
