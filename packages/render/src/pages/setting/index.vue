<template>
    <div class="w-80/100 mx-auto mt-25px p-8px pt-55px pb-80px overflow-auto">
        <div class="mb-35px">
            <div class="text-size-20px font-bold">语言</div>
            <div class="text-gray-400 pt-8px">切换语言显示</div>
            <div class="pt-8px">
                <div class="select is-medium !max-w-280px !min-w-280px">
                    <select @change="change" v-model="config.language" class="!max-w-280px !min-w-280px">
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
                <input spellcheck="false" @change="change" class="input is-medium !max-w-280px !min-w-280px" type="text" placeholder="Text input"
                       v-model="config.storagePath">
            </div>
        </div>
    </div>
</template>


<script lang="ts" setup>
import i18n from "@/i18n"

let config = reactive<Partial<IConfig>>({})
;(async () => {
    const res = await _agent.call("config.get")
    config = Object.assign(config, res)
})()

async function change() {
    if (JSON.stringify(config) !== "{}") {
        i18n.global.locale = config.language as string
        try {
            await _agent.call("config.save", toRaw(config))
            console.log("保存成功")
        }catch (e) {
            console.error(e)
        }
    }
}
</script>
