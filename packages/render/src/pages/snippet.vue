<template>
    <div class="h-1/1 relative flex">
        <div class="h-1/1 flex flex-col">
            <div class="border-b border-r px-12px py-8px flex items-center">
                <div class="mr-6px flex-1 w-0">代码片段工具</div>
            </div>
            <div class="relative flex h-0 flex-1">
                <aside class="w-300px border-r flex flex-col">
                    <Left></Left>
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
import { useSnippetStore } from "@/store/module/snippet"
import { INiuTreeKey } from "princess-ui"
import { onBeforeRouteLeave } from "vue-router"
import Left from "./snippet/_ui/left.vue"

const SnippetStore = useSnippetStore()

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
