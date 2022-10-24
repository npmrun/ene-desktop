<template>
    <div class="w-80/100 mx-auto mt-25px p-8px pt-55px pb-80px overflow-auto">
        <div class="mb-35px">
            <div class="text-size-20px font-bold">检查更新</div>
            <div class="pt-16px">
                <button class="button is-medium is-info" @click="onCheck">{{ updater_text }}</button>
            </div>
        </div>
        <div class="mb-35px">
            <div class="text-size-20px font-bold">数据备份频次</div>
            <div class="text-gray-400 pt-8px">数据备份频次</div>
            <div class="pt-8px">
                <div class="select is-medium !max-w-320px !min-w-320px">
                    <select :value="configStore['common.theme']"
                        @change="(e: any) => configStore.setCommonTheme(e.target.value)"
                        class="!max-w-320px !min-w-320px">
                        <option value="auto">跟随系统</option>
                        <option value="dark">暗黑</option>
                        <option value="light">光明</option>
                    </select>
                </div>
            </div>
        </div>
        <div class="mb-35px">
            <div class="text-size-20px font-bold">语言</div>
            <div class="text-gray-400 pt-8px">切换语言显示</div>
            <div class="pt-8px">
                <div class="select is-medium !max-w-320px !min-w-320px">
                    <select :value="configStore.language" @change="(e: any) => configStore.setLanguage(e.target.value)"
                        class="!max-w-320px !min-w-320px">
                        <option value="zh">简体中文</option>
                        <option value="en">English</option>
                    </select>
                </div>
            </div>
        </div>
        <div class="mb-35px">
            <div class="text-size-20px font-bold">保存路径</div>
            <div class="text-gray-400 pt-8px">本地数据保存地址</div>
            <div class="pt-8px">
                <input spellcheck="false" :value="configStore.storagePath"
                    @change="(e: any) => configStore.setStorePath(e.target.value)"
                    class="input is-medium !max-w-320px !min-w-320px" type="text" placeholder="Text input">
            </div>
        </div>
        <div class="mb-35px">
            <div class="text-size-20px font-bold">系统协议</div>
            <div class="text-gray-400 pt-8px">系统协议</div>
            <div class="pt-8px">
                <input spellcheck="false" :value="configStore['system.protocol']"
                    @change="(e: any) => configStore.setSystemProtocol(e.target.value)"
                    class="input is-medium !max-w-320px !min-w-320px" type="text" placeholder="Text input">
            </div>
        </div>
        <div class="mb-35px">
            <div class="text-size-20px font-bold">数据备份频次</div>
            <div class="text-gray-400 pt-8px">数据备份频次</div>
            <div class="pt-8px">
                <input spellcheck="false" :value="configStore['backup_rule']"
                    @change="(e: any) => configStore.setBackupRule(e.target.value)"
                    class="input is-medium !max-w-320px !min-w-320px" type="text" placeholder="Text input">
            </div>
        </div>
    </div>
</template>


<script lang="ts" setup>
import ConfigStore from "@/store/module/config"

const configStore = ConfigStore()

enum EStatus {
    normal,
    checking,
    waitForInstall
}
const updater_text = ref("检查更新")
const status = ref<EStatus>(EStatus.normal)
function onCheck() {
    if (status.value === EStatus.checking) return
    if (status.value === EStatus.normal) {
        _agent.send("updater:check")
    }
    if (status.value === EStatus.waitForInstall) {
        _agent.send("updater:quitandinstall")
    }
}
_agent.on("checking-for-update", ((event, res: any) => {
    updater_text.value = res.message
    status.value = EStatus.checking
}))
_agent.on("updater:error", ((event, res: any) => {
    updater_text.value = res.message
    status.value = EStatus.normal
}))
_agent.on("updater:avaliable", ((event, res: any) => {
    updater_text.value = res.message
    status.value = EStatus.checking
}))
_agent.on("updater:notavaliable", ((event, res: any) => {
    updater_text.value = res.message
    status.value = EStatus.normal
}))
_agent.on("updater:download_progress", ((event, res: any) => {
    updater_text.value = `当前下载进度${(+res.percent).toFixed(2)}%`
    status.value = EStatus.checking
}))
_agent.on("updater:downloaded", ((event, res: any) => {
    updater_text.value = res.message
    status.value = EStatus.waitForInstall
}))
</script>
