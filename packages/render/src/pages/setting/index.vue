<template>
    <div class="w-80/100 mx-auto mt-25px p-8px pt-55px pb-80px overflow-auto">
        <div class="text-size-20px font-bold">语言</div>
        <div class="text-gray-400 pt-8px">切换语言显示{{$t("title")}}</div>
        <div class="pt-8px">
            <input class="outline-none focus:outline-none focus:border-none" type="text" v-model="value">
            <button @click="save">保存</button>
        </div>
    </div>
</template>


<script lang="ts" setup>
import i18n from '@/i18n';
let config: IConfig
const value = ref();
; (async () => {
    const res = await _agent.call("config.get")
    config = res
    value.value = res.language
    console.log(res);  
    
})()

async function save() {
    if (config) {
        if(config.language != value.value){
            i18n.global.locale = value.value
            config.language = value.value
        }
        await _agent.call("config.save", config)
        console.log("保存成功");
    }
}
</script>
