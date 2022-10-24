<template>
    <div class="h-1/1 flex">
        <Htab class="w-220px border-r pt-60px" v-model="activeTab" :list="TopMenu"></Htab>
        <div class="flex-1 w-0 overflow-auto scrollbar">
            <router-view v-slot="{ Component }">
                <keep-alive>
                    <component :is="Component" />
                </keep-alive>
            </router-view>
        </div>
       <div class="absolute right-1/10 bottom-1/10">
           <button v-if="!isSame" class="button is-medium is-info" :class="[isSame?'':'is-danger']" @click="save">点击保存</button>
       </div>
       <rush-dialog v-model:show="showDialog">
            <div class="bg-light-50 p-12px rounded-4px min-w-1/2">
                <div class="text-size-24px text-center">您的设置尚未保存，是否跳转</div>
                <button class="button is-medium is-info" @click="save">保存</button>
                <button class="button is-medium is-info" @click="restore">重置</button>
            </div>
        </rush-dialog>
    </div>
</template>


<script lang="ts" setup>
import Htab from '@/page-ui/htab.vue';
import ConfigStore from "@/store/module/config"
import RushDialog from "@rush-ui/dialog";
import { onBeforeRouteLeave, RouteLocationNormalized } from 'vue-router';

const configStore = ConfigStore()

const showDialog = ref(false)
onBeforeRouteLeave((to: RouteLocationNormalized, from: RouteLocationNormalized)=>{
    if(isSame.value){
        return true
    }
    showDialog.value = true
    console.log("设置尚未报错，离开将会丢失");
    return false
})

const isSame = computed(() => configStore.isSame)

async function restore() {
    try {
        await configStore.restoreConfig()
        showDialog.value = false
    } catch (error) {
        console.error(error)
    }
}
async function save() {
    try {
        await configStore.saveConfig()
        showDialog.value = false
    } catch (error) {
        console.error(error)
    }
}

const activeTab = ref(0)
const TopMenu = reactive([
    { key: 0, title: "通用", url: "/setting" },
    { key: 1, title: "更新", url: "/setting/test" },
])
const route = useRoute()
watch(()=>route,(route)=>{
    for (let i = 0; i < TopMenu.length; i++) {
        const element = TopMenu[i];
        if(route.path.startsWith(element.url)){
            activeTab.value = element.key
        }
    }
}, { immediate: true })
</script>
