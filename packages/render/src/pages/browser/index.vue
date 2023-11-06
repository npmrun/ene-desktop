<template>
    <div class="flex h-1/1">
        <div v-if="state.showSideMenu" class="border-r min-w-200px w-[20%]">
            <div v-for="item in state.collectList" @click="handleToPage(item.url)">
                {{ item.name }}-{{ item.url }}
            </div>
        </div>
        <browser ref="browserRef" :url="home" :home="home" :hide="[]" class="flex-1 w-0" :collect="isCollect" @load-page="handleLoadPage" @leftmenu="handleClickMenu" @collect="handleCollect"></browser>
    </div>
</template>

<script lang="ts" setup>
import parse from 'url-parse';
import browser from "@/components/Browser/browser.vue"
import { getData } from './api';
const home = "我的首页"

const state = reactive<{
    collectList: any
    showSideMenu: boolean
    curWebviewUrl: string
}>({
    collectList: [],
    showSideMenu: false,
    curWebviewUrl: "file:///D:/1XYX/pro/ene-desktop/extra/home.html"
})
const browserRef = ref<InstanceType<typeof browser>>()
const isCollect = computed(()=>{
    if("file:///D:/1XYX/pro/ene-desktop/extra/home.html" === state.curWebviewUrl) {
        return true
    }
    return false
})

async function init() {
    state.collectList = await getData()
}
init()

function handleToPage(url: string) {
    browserRef.value?.loadURL(url)
}

function handleClickMenu() {
    state.showSideMenu = !state.showSideMenu
}

function handleLoadPage(url: string) {
    console.log(parse(url));
    state.curWebviewUrl = url
}

function handleCollect(url: string) {
    state.collectList.push({
        name: "test",
        url: url,
        checkIsAlive: true
    })
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