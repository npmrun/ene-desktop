<template>
    <div class="w-80/100 mx-auto mt-25px p-8px pt-55px pb-80px">
        <!-- <div class="mb-35px">
            <div class="text-size-20px font-bold">主题</div>
            <div class="text-gray-400 pt-8px">主题选择（暂时只有白色主题）</div>
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
        </div> -->
        <div class="mb-35px">
            <div class="text-size-20px font-bold">{{ $t("setting.language.title") }}</div>
            <div class="text-gray-400 pt-8px">{{ $t("setting.language.desc") }}</div>
            <div class="pt-8px">
                <div class="select is-medium !max-w-320px !min-w-320px">
                    <select :value="configStore.language" @change="(e: any) => configStore.setLanguage(e.target.value)"
                        class="!max-w-320px !min-w-320px">
                        <option value="zh">{{ $t("setting.language.options.zh") }}</option>
                        <option value="en">{{ $t("setting.language.options.en") }}</option>
                    </select>
                </div>
            </div>
        </div>
        <div class="mb-35px">
            <div class="text-size-20px font-bold">数据保存路径</div>
            <div class="text-gray-400 pt-8px">本地数据保存地址</div>
            <div class="pt-8px whitespace-nowrap flex">
                <div class="!min-w-320px !max-w-550px hover:flex-1 hover:w-0" style="transition: flex .5s linear;">
                    <input spellcheck="false" :value="configStore.storagePath" :title="configStore.storagePath"
                        @change="(e: any) => configStore.setStorePath(e.target.value)"
                        class="input is-medium block" disabled type="text" placeholder="Text input">
                </div>
                <button class="button is-info is-medium ml-8px"
                    @click="chooseDir(configStore.storagePath)">选择目录</button>
                <button class="button is-info is-medium ml-8px" @click="openDir(configStore.storagePath)">打开目录</button>
            </div>
        </div>
        <!-- <div class="mb-35px">
            <div class="text-size-20px font-bold">数据备份频次</div>
            <div class="text-gray-400 pt-8px">采用Cron表达式，主要用于备份本地数据，若文件未修改则不会备份</div>
            <div class="pt-8px">
                <input spellcheck="false" :value="configStore['backup_rule']"
                    @change="(e: any) => configStore.setBackupRule(e.target.value)"
                    class="input is-medium !max-w-320px !min-w-320px" type="text" placeholder="Text input">
            </div>
        </div> -->
    </div>
</template>


<script lang="ts" setup>
import ConfigStore from "@/store/module/config"

const configStore = ConfigStore()

function openDir(path: string) {
    _agent.call("func.openDir", path)
}

async function chooseDir(defaultPath: string) {
    try {
        const dir = await _agent.callLong("dialog.chooseDir", "选择数据保存路径", defaultPath)
        configStore.setStorePath(dir)
    } catch (error) {
        console.error(error);
    }
}

</script>
