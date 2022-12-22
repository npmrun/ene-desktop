<script lang="ts" setup>
import browser from "./browser.vue";
import URL from "url-parse"

// const route = useRoute()
// const url = route.query.url as string
interface ITab {
    title: string
    url: string
}
const tabs = ref<ITab[]>([
    {
        title: "壁纸天堂",
        url: new URL('https://wallhaven.cc').href
    },
    {
        title: "掘金",
        url: new URL('https://juejin.cn').href
    },
])
const curUrl = ref<ITab>(tabs.value[0])

const curPathRef = ref<string>('')
const isCollect = computed(() => {
    if (tabs.value.find(v => v.url === curPathRef.value)) return true
    return false
})
function handleDomReady(curPath: string) {
    curPathRef.value = curPath
}
function handleCollect(curPath: string) {
    if (!tabs.value.find(v => v.url === curPath)) {
        tabs.value.push({
            title: '',
            url: curPath
        })
    }
}
function handleCancelCollect(curPath: string) {
    if (tabs.value.find(v => v.url === curPath)) {
        tabs.value = tabs.value.filter(v => v.url !== curPath)
    }
}

onBeforeMount(async () => {
    const data = await _agent.call('db.getData', "website") ?? []
    console.log(data);

    // state = Object.assign(state, data)
})

// async function onChange() {
//     try {
//         await _agent.call('db.saveData', "urls", toRaw(state))
//     } catch (error) {
//         console.error(error);
//         toast("保存失败")
//     }
// }

</script>

<script lang="ts">
export default defineComponent({
    name: "web"
})
</script>
<route lang="yaml">
name: web
meta:
    cache: true
</route>
<template>
    <div class="h-1/1 flex">
        <div class="w-250px border-r">
            <div class="border-b h-40px flex">
                
            </div>
            <div class="m-12px border rounded-md cursor-pointer flex flex-col" v-for="(item, index) in tabs"
                @click="curUrl = item" :key="index" :title="item.title">
                <div class="font-bold h-28px leading-14px border-b p-6px ell">
                    {{ item.title }}
                </div>
                <div class="h-24px text-gray-400 leading-12px p-6px flex-1 h-0 ell">
                    {{ item.url }}
                </div>
            </div>
        </div>
        <browser :collect="isCollect" class="h-1/1 flex-1 w-0" :url="curUrl.url" :home="'https://baidu.com'"
            @dom-ready="handleDomReady" @collect="handleCollect" @cancel-collect="handleCancelCollect"></browser>
    </div>
</template>
<style lang="less" scoped>

</style>