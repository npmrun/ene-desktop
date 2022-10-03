<template>
    <div class="h-1/1 flex flex-col">
        <!-- <div class="border-b h-20px flex items-center px-8px">
            {{$router.currentRoute.value.fullPath}}
            {{cacheList}}
        </div> -->
        <div class="flex-1 flex h-0">
            <div class="w-120px border-r shadow text-size-14px">
                <Menu v-model="activeTab" :top-list="TopMenu" :sys-list="SysMenu"></Menu>
            </div>
            <div class="flex-1 w-0 relative">
                <router-view v-slot="{ Component, route: route }">
                    <transition :name="getTransitionName(route)" mode="out-in" appear>
                        <keep-alive :include="cacheList">
                            <component :key="route.fullPath" :is="Component" />
                        </keep-alive>
                    </transition>
                </router-view>
            </div>
        </div>
    </div>
</template>

<style lang="less" scoped>

</style>

<script lang="ts" setup>
import Menu from '@/page-ui/menu.vue';
import pageStore from '@/store/module/page'
import type { RouteLocationNormalizedLoaded } from 'vue-router'

const route = useRoute()
const store = pageStore()

const cacheList = store.cache
watch(
    () => route.fullPath,
    () => {
        if (route.meta.cache && route.name) {
            store.addCacheView(route.name as string)
        }
        route.meta.title && useTitle(route.meta.title as string)
    },
    {
        immediate: true,
    }
)

function getTransitionName(route: RouteLocationNormalizedLoaded) {
    return 'fade'
}


const activeTab = ref(0)
const TopMenu = reactive([
    { key: 0, title: "个人", url: "/" },
    { key: 1, title: "导航", url: "/nav" },
    { key: 2, title: "电视", url: "/tv" },
    { key: 3, title: "笔记", url: "/note" },
    { key: 4, title: "博客", url: "/blog" },
])
const SysMenu = reactive([
    { key: 5, title: "设置", url: "/nav" },
])


// enum EStatus {
//     normal,
//     checking,
//     waitForInstall
// }
// const updater_text = ref("更新")
// const status = ref<EStatus>(EStatus.normal)
// function onCheck() {
//     if (status.value === EStatus.checking) return
//     if (status.value === EStatus.normal) {
//         _agent.send("updater:check")
//     }
//     if (status.value === EStatus.waitForInstall) {
//         _agent.send("updater:quitandinstall")
//     }
// }
// _agent.on("checking-for-update", ((event, res: any) => {
//     updater_text.value = res.message
//     status.value = EStatus.checking
// }))
// _agent.on("updater:error", ((event, res: any) => {
//     updater_text.value = res.message
//     status.value = EStatus.normal
// }))
// _agent.on("updater:avaliable", ((event, res: any) => {
//     updater_text.value = res.message
//     status.value = EStatus.checking
// }))
// _agent.on("updater:notavaliable", ((event, res: any) => {
//     updater_text.value = res.message
//     status.value = EStatus.normal
// }))
// _agent.on("updater:download_progress", ((event, res: any) => {
//     updater_text.value = `当前下载进度${(+res.percent).toFixed(2)}%`
//     status.value = EStatus.checking
// }))
// _agent.on("updater:downloaded", ((event, res: any) => {
//     updater_text.value = res.message
//     status.value = EStatus.waitForInstall
// }))
</script>
<script lang="ts">
export default defineComponent({
    name: 'BaseLayout',
})
</script>

