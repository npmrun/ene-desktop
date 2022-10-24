<template>
    <div class="h-1/1 flex">
        <Htab class="w-220px border-r pt-60px" v-model="activeTab" :list="TopMenu"></Htab>
        <div class="flex-1 w-0 overflow-auto">
            <router-view v-slot="{ Component }">
                <keep-alive>
                    <component :is="Component" />
                </keep-alive>
            </router-view>
        </div>
       <div class="absolute right-1/10 bottom-1/10">
           <button v-if="!isSame" class="button is-medium is-info" :class="[isSame?'':'is-danger']" @click="save">点击保存</button>
       </div>
    </div>
</template>


<script lang="ts" setup>
import Htab from '@/page-ui/htab.vue';
import ConfigStore from "@/store/module/config"

const configStore = ConfigStore()

const isSame = computed(() => configStore.isSame)

async function save() {
    try {
        await configStore.saveConfig()
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
