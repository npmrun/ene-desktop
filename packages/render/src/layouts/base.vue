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
            <div class="flex-1 w-0 relative overflow-auto scrollbar">
                <!-- 去除:key="router.fullPath",防止路由变了整个布局会刷新 -->
                <router-view v-slot="{ Component, route: route }">
                    <transition :name="getTransitionName(route)" mode="out-in" appear>
                        <keep-alive :include="cacheList">
                            <component :is="Component" />
                        </keep-alive>
                    </transition>
                </router-view>
            </div>
        </div>
        <!-- <div class="app-footer h-35px leading-35px border-t px-12px box-content text-size-12px flex" v-html="MsgHtml">
        </div> -->
    </div>
    <Devtool v-if="isDev"></Devtool>
</template>

<style lang="less" scoped>
.app-footer {
    overflow: hidden;

    :deep(.tip) {
        color: rgba(156, 163, 175, 1);
    }

    :deep(.error) {
        color: red;
    }
}
</style>

<script lang="ts" setup>
import { useAppMessage } from '$Event/AppMessage';
import Menu from '@/page-ui/menu.vue';
import { useGlobalStore } from '@/store/module/global';
import pageStore from '@/store/module/page'
import type { RouteLocationNormalizedLoaded } from 'vue-router'

const route = useRoute()
const store = pageStore()
const globalStore = useGlobalStore()

const isDev = import.meta.env.DEV

const MsgHtml = ref()
useAppMessage({
    tip(msg) {
        MsgHtml.value = `<div class="tip animate__animated animate__fadeIn">${msg}</div>`
    },
    error(errMsg) {
        MsgHtml.value = `<div class="error">${errMsg}</div>`
    }
})

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
    if(route.meta.anim === false){
        return ''
    }
    return (route.meta.anim ?? "fade") as string
}

const router = useRouter()
const activeTab = ref<string | number>(-1)
const TopMenu = globalStore.topMenu
const SysMenu = globalStore.bottomMenu
watch(() => router.currentRoute.value, (route) => {
    console.log(route.path);

    for (let i = 0; i < TopMenu.length; i++) {
        const element = TopMenu[i];
        if (route.path.startsWith(element.url)) {
            activeTab.value = element.key
        }
    }
    for (let i = 0; i < SysMenu.length; i++) {
        const element = SysMenu[i];
        if (route.path.startsWith(element.url)) {
            activeTab.value = element.key
        }
    }
}, { immediate: true })

</script>
<script lang="ts">
export default defineComponent({
    name: 'BaseLayout',
})
</script>

