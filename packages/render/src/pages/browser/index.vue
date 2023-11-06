<template>
    <browser ref="browserRef" :url="home" :home="home" class="h-1/1" :collect="isCollect" @load-page="handleLoadPage"></browser>
</template>

<script lang="ts" setup>
import parse from 'url-parse';
import browser from "@/components/Browser/browser.vue"
const home = "我的首页"
// const home = "https://blog.xieyaxin.top"

const state = reactive({
    curWebviewUrl: "file:///D:/1XYX/pro/ene-desktop/extra/home.html"
})

const isCollect = computed(()=>{
    if("file:///D:/1XYX/pro/ene-desktop/extra/home.html" === state.curWebviewUrl) {
        return true
    }
    return false
})

{
    items: [
        {
            name: "",
            url: "",
            checkIsAlive: false
        }
    ]
}

async function init() {
    const data = await _agent.call("getDB", "collect")
    if(data){

    }
}

function handleLoadPage(url: string) {
    console.log(parse(url));
    state.curWebviewUrl = url
}
</script>
<script lang="ts">
export default defineComponent({
    name: "browser"
})
</script>
<route lang="yaml">
name: browser
meta:
    cache: false
</route>