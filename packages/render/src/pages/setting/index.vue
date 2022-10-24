<template>
    <div class="w-80/100 mx-auto mt-25px p-8px pt-55px pb-80px">
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
                        <option value="zh">{{$t("language.zh")}}</option>
                        <option value="en">{{$t("language.en")}}</option>
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

</script>
