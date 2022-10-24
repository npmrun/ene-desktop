<template>
    <div class="w-80/100 mx-auto mt-25px p-8px pt-55px pb-80px">
        <div class="mb-35px">
            <div class="text-size-20px font-bold">更新仓库作者</div>
            <div class="text-gray-400 pt-8px">更新仓库作者</div>
            <div class="pt-8px">
                <input spellcheck="false" :value="configStore['update.owner']"
                    @change="(e: any) => configStore.setUpdateOwner(e.target.value)"
                    class="input is-medium !max-w-320px !min-w-320px" type="text" placeholder="请输入更新仓库作者">
            </div>
        </div>
        <div class="mb-35px">
            <div class="text-size-20px font-bold">更新仓库</div>
            <div class="text-gray-400 pt-8px">更新仓库</div>
            <div class="pt-8px">
                <input spellcheck="false" :value="configStore['update.repo']"
                    @change="(e: any) => configStore.setUpdateRepo(e.target.value)"
                    class="input is-medium !max-w-320px !min-w-320px" type="text" placeholder="请输入更新仓库">
            </div>
        </div>
        <div class="mb-35px">
            <div class="text-size-20px font-bold">检查更新</div>
            <div class="pt-16px">
                <button class="button is-medium is-info" @click="onCheck">{{ updater_text }}</button>
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
