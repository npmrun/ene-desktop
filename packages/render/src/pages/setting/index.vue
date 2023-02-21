<template>
    <div class="w-80/100 mx-auto mt-25px p-8px pt-55px pb-80px">
        <!-- <SettingItem title="主题" desc="主题选择（暂时只有白色主题）" :red-border="!configStore.isSameOne('common.theme')">
            <div class="select is-medium !max-w-320px !min-w-320px">
                <select :value="configStore['common.theme']"
                    @change="(e: any) => configStore.setConfig('common.theme', e.target.value)"
                    class="!max-w-320px !min-w-320px">
                    <option value="auto">跟随系统</option>
                    <option value="dark">暗黑</option>
                    <option value="light">光明</option>
                </select>
            </div>
        </SettingItem> -->
        <SettingItem :title="$t('setting.language.title')" :desc="$t('setting.language.desc')"
            :red-border="!configStore.isSameOne('language')">
            <div class="select is-medium !max-w-320px !min-w-320px">
                <select :value="configStore.language"
                    @change="(e: any) => configStore.setConfig('language', e.target.value)"
                    class="!max-w-320px !min-w-320px">
                    <option value="zh">{{ $t("setting.language.options.zh") }}</option>
                    <option value="en">{{ $t("setting.language.options.en") }}</option>
                </select>
            </div>
        </SettingItem>
        <SettingItem :title="$t('setting.storagePath.title')" :desc="$t('setting.storagePath.desc')" :red-border="!configStore.isSameOne('storagePath')">
            <div class="whitespace-nowrap flex">
                <div class="!min-w-320px !max-w-550px hover:flex-1 hover:w-0" style="transition: flex .5s linear;">
                    <input spellcheck="false" :value="configStore.storagePath" :title="configStore.storagePath"
                        @change="(e: any) => configStore.setConfig('storagePath', e.target.value)"
                        class="input is-medium block" disabled type="text" placeholder="Text input">
                </div>
                <button class="button is-info is-medium ml-8px"
                    @click="chooseDir(configStore.storagePath)">{{ $t('setting.storagePath.buttons.select') }}</button>
                <button class="button is-info is-medium ml-8px" @click="openDir(configStore.storagePath)">{{ $t('setting.storagePath.buttons.open') }}</button>
            </div>
        </SettingItem>
        <!-- <SettingItem title="数据备份频次" desc="采用Cron表达式，主要用于备份本地数据，若文件未修改则不会备份"
            :red-border="!configStore.isSameOne('backup_rule')">
            <input spellcheck="false" :value="configStore['backup_rule']"
                @change="(e: any) => configStore.setConfig('backup_rule', e.target.value)"
                class="input is-medium !max-w-320px !min-w-320px" type="text" placeholder="Text input">
        </SettingItem> -->
    </div>
</template>

<script lang="ts" setup>
import SettingItem from "@/page-ui/SettingItem/SettingItem.vue";
import ConfigStore from "@/store/module/config"

const configStore = ConfigStore()

function openDir(path: string) {
    _agent.call("func.openDir", path)
}

async function chooseDir(defaultPath: string) {
    try {
        const dir = await _agent.callLong("dialog.chooseDir", "选择数据保存路径", defaultPath)
        configStore.setConfig("storagePath", dir)
    } catch (error) {
        console.error(error);
    }
}

</script>
