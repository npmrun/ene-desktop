<template>
    <div class="flex h-1/1">
        <div class="border-r w-1/3 md: px-8px py-20px">
            <h2 class="text-size-25px font-bold">个人工具</h2>
            <div class="mt-25px flex flex-wrap">
                <router-link v-for="item in app" :key="item.path" custom v-slot="{ navigate, isActive }" :to="item.path">
                    <div @click="navigate" class="border rounded-8px inline-block p-12px cursor-pointer mr-8px mb-8px"
                        :style="{ color: isActive ? item.activeColor : item.color, borderColor: isActive ? item.activeColor : item.color }">
                        <span>{{  item.title  }}</span>
                    </div>
                </router-link>
            </div>
        </div>
        <div class="flex-1 w-0">
            <router-view v-slot="{ Component }">
                <keep-alive>
                    <component :is="Component" />
                </keep-alive>
            </router-view>
        </div>
    </div>
</template>

<script lang="ts">
export default defineComponent({
    name: "home"
})
</script>

<route lang="yaml">
name: home
meta:
    cache: true
</route>

<script lang="ts" setup>
import { onBeforeRouteLeave, useRouter } from 'vue-router';

const app = reactive([
    { title: "图标生成器", path: "/home/icons", color: "#a9c0ff", activeColor: "#2F66FF" },
    { title: "v2ray", path: "/home/v2ray", color: "#dfaaca", activeColor: "#ea4aaa" },
])

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

<style lang="less" scoped>

</style>
