import { defineStore } from "pinia"
import i18n from "@/i18n"
import { cloneDeep } from "lodash"

const _config: IConfig = _agent.callSync("config.get")

let oldConfig = shallowRef(cloneDeep(_config))

export default defineStore("config", {
    state: (): IConfig => _config,
    getters: {
        isSame(state): boolean {
            // @ts-ignore
            let nowConfigStr = JSON.stringify(state.$state)
            let oldConfigStr = JSON.stringify(oldConfig.value)
            return oldConfigStr === nowConfigStr
        },
    },
    actions: {
        setConfig<M extends keyof IConfig>(key: M, value: IConfig[M]){
            (this as IConfig)[key] = value
            this.applyConfig()
        },
        isSameOne(key: keyof IConfig){
            if(oldConfig.value[key] !== (this.$state as IConfig)[key]){
                return false
            }
            return true
        },
        async restoreConfig(){
            const o: IConfig = await _agent.call("config.get")
            this.$state = o
            this.applyConfig()
        },
        async saveConfig() {
            const o: IConfig = await _agent.call("config.get")
            if (JSON.stringify(o) === JSON.stringify(this.$state)) {
                throw "配置文件一样，无需保存"
            }
            let rState = toRaw(this.$state)
            await _agent.call("config.save", rState)
            oldConfig.value = cloneDeep(rState)
        },
        applyConfig(){
            if (this.$state.language) {
                i18n.global.locale = this.$state.language as string
            }
        }
    },
})
