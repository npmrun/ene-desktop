<script lang="ts" setup>
import browser from "./browser.vue";

const route = useRoute()
const url = route.query.url as string
const tabs = ref<string[]>([url, 'https://juejin.cn/'])
const curUrl = ref(tabs.value[0])

let rootDirTree = ref({})
async function chooseDir() {
    const curDir = await _agent.callLong("dialog.chooseDir")
    let tree = await _agent.callLong("folder.getFolderTree", curDir)
    rootDirTree.value = tree
}
_agent.on("folder-create", (e, a, b, c) => {
    console.log(`新建文件:`, a);
    console.log(c);
    rootDirTree.value = c
})
_agent.on("folder-delete", (e, a, b, c) => {
    console.log(`删除文件:`, a);
    console.log(c);
    rootDirTree.value = c
})
_agent.on("folder-update", (e, a, b, c) => {
    console.log(`更新文件:`, a);
    console.log(c);
    rootDirTree.value = c
})
</script>

<route lang="yaml">
name: web
meta:
    cache: false
</route>
<template>
    <div class="h-1/1 flex">
        <div class="w-250px border-r">
            <div class="m-15px bg-red-100 min-h
            -60px" v-for="(item, index) in tabs" @click="curUrl = item" :key="index">
                {{ item }}
            </div>
        </div>
        <browser class="h-1/1 flex-1 w-0" :url="curUrl" :home="curUrl"></browser>
    </div>
</template>
<style lang="less" scoped>

</style>