<template>
    <div class="h-1/1 flex">
        <Htab class="w-220px border-r pt-60px" v-model="activeTab" :list="TopMenu"></Htab>
        <div class="flex-1 w-0 p-8px pt-55px pb-80px overflow-auto">
            <div class="w-80/100 mx-auto mt-25px">
                <div class="text-size-20px font-bold">语言</div>
                <div class="text-gray-400 pt-8px">切换语言显示</div>
                <div class="pt-8px">
                    <input type="text" v-model="value">
                </div>
            </div>
        </div>
    </div>
</template>


<script lang="ts" setup>
import Htab from '@/page-ui/htab.vue';

const activeTab = ref(0)
const TopMenu = reactive([
    { key: 0, title: "通用", url: "/" },
    { key: 1, title: "更新", url: "/nav" },
])

const value  = ref()
;(async ()=>{
    const res = await _agent.call("config.get")
    console.log(res);
    value.value = res.language
})()
</script>
