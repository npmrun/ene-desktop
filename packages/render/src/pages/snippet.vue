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
        <aside class="w-300px border-r flex flex-col">
            <router-view v-slot="{ Component }">
                <!-- <keep-alive> -->
                    <component :is="Component" />
                <!-- </keep-alive> -->
            </router-view>
        </aside>
        <main class="flex-1 w-0">
            <button @click="$router.push('/snippet/aaa')">asd</button>
            <!-- <Editor v-model:is-same="isSame" v-if="!!activeData" :data="activeData" @save="handleSave"></Editor> -->
        </main>
    </div>
</template>
<route lang="yaml">
name: snippet
meta:
    cache: true
</route>
<script lang="ts" setup>
import { onBeforeRouteLeave } from "vue-router";
import Left from "./snippet/_ui/left.vue"

const lastRoute = ref()
const router = useRouter()
onBeforeRouteLeave((to, from, next)=>{
    lastRoute.value = from.fullPath
    next()
})
onActivated(()=>{
    if(lastRoute.value){
        router.replace(lastRoute.value)
        lastRoute.value = undefined
    }
})
</script>
<style lang="less" scoped></style>
