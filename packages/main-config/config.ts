import fs from "fs-extra"
import { app } from "electron"
import path from "path"
import setting from "@rush/share/setting"
import { cloneDeep } from "lodash-es"

interface IConfig {
    language: "zh" | "en" // i18n
    "common.theme": "light" | "dark" | "auto" // 主题
    "update.url"?: string // 更新地址
    "update.channel"?: string // 更新通道
    backup_rule: string // 备份规则
    storagePath: string // 存储地址
}
type IOnFunc = (n: IConfig, c: IConfig)=>void
type IT = ((keyof IConfig)[]) | (keyof IConfig) | '_'

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
    onChange(fnOrType: IT | IOnFunc, fnOrThat: IOnFunc | any = null, that: any = null){
        if(typeof fnOrType === "function"){
            this.#cb.push(["_", fnOrType.bind(fnOrThat)])
        }else{
            this.#cb.push([fnOrType, fnOrThat.bind(that)])
        }
    }

    #runCB(n: IConfig, c: IConfig, keys: (keyof IConfig)[]){
        for (let i = 0; i < this.#cb.length; i++) {
            const temp = this.#cb[i];
            const k = temp[0];
            const fn = temp[1];
            if(k==="_"){
                fn(n, c)
            }
            if(typeof k === "string" && keys.includes(k as keyof IConfig)){
                fn(n, c)
            }
            if(Array.isArray(k) && k.filter(v=>keys.indexOf(v)!==-1).length){
                fn(n, c)
            }
        }
    }

    #pathFile: string = path.resolve(app.getPath("userData"), "./config_path")
    #config: IConfig = {
        language: "zh",
        backup_rule: "0 0/30 * * * ?",
        "common.theme": "auto",
        storagePath: path.join(app.getPath("documents"), setting.app_title),
    }
    #configPath(storagePath?: string): string {
        return path.join(storagePath || this.#config.storagePath, "./config.json")
    }

    #init() {
        console.log(`位置：${this.#pathFile}`)
        if (fs.pathExistsSync(this.#pathFile)) {
            const confingPath = fs.readFileSync(this.#pathFile, { encoding: "utf8" })
            if (confingPath && fs.pathExistsSync(this.#configPath(confingPath))) {
                const config = fs.readJSONSync(this.#configPath(confingPath)) as IConfig
                config.storagePath = confingPath
                // 优先取本地的值
                for (const key in config) {
                    // if (Object.prototype.hasOwnProperty.call(this.#config, key)) {
                    //     this.#config[key] = config[key] || this.#config[key]
                    // }
                    // 删除配置时本地的配置不会改变，想一下哪种方式更好
                    this.#config[key] = config[key] || this.#config[key]
                }
                // 防止增加了配置本地却没变的情况
                this.#sync(confingPath)
            }else{
                this.#sync(confingPath)
            }
        }else{
            this.#sync()
        }
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
        if (typeof key === "string") {
            if (value != undefined && value !== this.#config[key]) {
                if (key === "storagePath") {
                    changeKeys.push("storagePath")
                    this.#change(value)
                    this.#config["storagePath"] = value
                } else {
                    changeKeys.push(key)
                    this.#config[key as string] = value
                }
                isChange = true
            }
        } else {
            for (const _ in key) {
                if (Object.prototype.hasOwnProperty.call(key, _)) {
                    const v = key[_]
                    if (v != undefined && v !== this.#config[_]) {
                        if (_ === "storagePath" && v !== undefined) {
                            this.#change(v)
                        }
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