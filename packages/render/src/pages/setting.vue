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
            <button v-if="!isSame" class="button is-medium is-info" :class="[isSame ? '' : 'is-danger']"
                @click="save">点击保存</button>
        </div>
        <rush-dialog v-model:show="showDialog">
            <div class="bg-light-50 rounded-4px min-w-350px">
                <div class="text-size-20px font-bold p-12px border-b flex items-center">
                    <div class="flex-1 w-0">
                        提示
                    </div>
                    <button class="delete" @click="showDialog = false"></button>
                </div>
                <div class="text-size-16px p-12px min-h-80px">
                    您的设置尚未保存，请先确认
                </div>
                <div class="buttons border-t flex !justify-end p-12px">
                    <button class="button is-danger !mb-0" @click="restore">重置</button>
                    <button class="button is-info !mb-0" @click="save">保存</button>
                </div>
            </div>
        </rush-dialog>
    </div>
</template>


<script lang="ts" setup>
import Htab from '@/page-ui/htab.vue';
import ConfigStore from "@/store/module/config"
import RushDialog from "@rush-ui/dialog";
import { onBeforeRouteLeave, RouteLocationNormalized } from 'vue-router';
import { toast } from 'vue3-toastify';

const configStore = ConfigStore()

const showDialog = ref(false)
onBeforeRouteLeave((to: RouteLocationNormalized, from: RouteLocationNormalized) => {
    if (isSame.value) {
        return true
    }
    showDialog.value = true
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
        toast.success("保存成功")
    } catch (error) {
        toast.error(`${error}`)
        console.error(error)
    }
}

const activeTab = ref(0)
const TopMenu = reactive([
    { key: 0, title: "通用", url: "/setting" },
    { key: 1, title: "更新", url: "/setting/update" },
])
const route = useRoute()
watch(() => route, (route) => {
    for (let i = 0; i < TopMenu.length; i++) {
        const element = TopMenu[i];
        if (route.path.startsWith(element.url)) {
            activeTab.value = element.key
        }
    }
}, { immediate: true })
</script>
