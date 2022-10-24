import { defineStore } from "pinia"
import i18n from "@/i18n"

const _config: IConfig = _agent.callSync("config.get")

let oldConfig = ref(JSON.stringify(_config))

type TC = IConfig & {
    notSave: boolean
}

export default defineStore("config", {
    state: (): IConfig => _config,
    getters: {
        isSame(state): boolean {
            // @ts-ignore
            let nowConfig = JSON.stringify(state.$state)
            return oldConfig.value === nowConfig
        },
    },
    actions: {
        setBackupRule(value: TC["backup_rule"]){
            this["backup_rule"] = value
        },
        setCommonTheme(value: TC["common.theme"]){
            this["common.theme"] = value
        },
        setSystemProtocol(value: TC["system.protocol"]){
            this["system.protocol"] = value
        },
        setUpdateOwner(value: TC["update.owner"]) {
            this['update.owner'] = value
        },
        setUpdateRepo(value: TC["update.repo"]) {
            this['update.repo'] = value
        },
        setLanguage(language: TC["language"]) {
            this.language = language
        },
        setStorePath(storagePath: TC["storagePath"]) {
            this.storagePath = storagePath
        },
        async saveConfig() {
            const o: IConfig = await _agent.call("config.get")
            if (JSON.stringify(o) === JSON.stringify(this.$state)) {
                throw "配置文件一样，无需保存"
            }
            let rState = toRaw(this.$state)
            await _agent.call("config.save", rState)
            oldConfig.value = JSON.stringify(rState)
            if (this.$state.language) {
                i18n.global.locale = this.$state.language as string
            }
        },
    },
})