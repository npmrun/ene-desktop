<template>
    <div class="h-1/1 relative flex">
        <div class="h-1/1 flex flex-col">
            <div class="border-b border-r px-12px py-8px flex items-center">
                <div class="mr-6px flex-1 w-0">代码片段工具</div>
            </div>
            <div class="relative flex h-0 flex-1">
                <aside class="w-300px border-r flex flex-col">
                    <div class="flex flex-col h-1/1">
                        <form class="h-45px flex items-center border-b px-12px">
                            <input class="flex-1 w-0 mr-6px input" type="text" placeholder="输入搜索" />
                            <button type="submit" class="button is-info">
                                <SearchIcon class="icon" />
                                <span>搜索</span>
                            </button>
                        </form>
                        <Left></Left>
                    </div>
                </aside>
            </div>
        </div>
        <router-view v-slot="{ Component }">
            <component :is="Component" />
        </router-view>
    </div>
</template>
<route lang="yaml">
name: snippet
meta:
    cache: true
</route>
<script lang="ts" setup>
import SearchIcon from "~icons/ic/sharp-search"
import { useSnippetStore } from "@/store/module/snippet"
import ConfigStore from "@/store/module/config"
import { INiuTreeKey } from "princess-ui"
import { onBeforeRouteLeave } from "vue-router"
import Left from "./snippet/_ui/left.vue"


const configStore = ConfigStore()
const SnippetStore = useSnippetStore()

_agent.file.walkDir(configStore["snippet.storagePath"], (file: string) => {
    // console.log(file)
})

const lastRoute = ref()
const router = useRouter()
onBeforeRouteLeave((to, from, next) => {
    lastRoute.value = from.fullPath
    next()
})
onActivated(() => {
    if (lastRoute.value) {
        router.replace(lastRoute.value)
        lastRoute.value = undefined
    }
})

const route = useRoute()
watch(
    () => route.fullPath,
    () => {
        if (route.params.folder) {
            const key = route.params.folder as INiuTreeKey
            SnippetStore.treeState.openKey = key
            SnippetStore.treeState.activeKeys = [key]
        } else {
            SnippetStore.treeState.openKey = undefined
            SnippetStore.treeState.activeKeys = []
        }
        if (route.params.snippet) {
            SnippetStore.dataState.openKey = route.params.snippet as string
        } else {
            SnippetStore.dataState.openKey = undefined
        }
    },
    { immediate: true },
)
let isAppActive = false
watch(
    () => SnippetStore.treeState.openKey,
    () => {
        if (isAppActive && route.params.folder !== SnippetStore.treeState.openKey) {
            router.replace("/snippet/" + SnippetStore.treeState.openKey)
        }
    },
    { immediate: true },
)
onActivated(() => {
    isAppActive = true
})
onDeactivated(() => {
    isAppActive = false
})
</script>
<style lang="less" scoped></style>
