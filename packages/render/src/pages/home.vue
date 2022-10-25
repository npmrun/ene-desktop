<template>
    <div class="flex h-1/1">
        <div class="border-r w-1/3 md: px-8px py-20px">
            <h2 class="text-size-25px font-bold">个人工具</h2>
            <div class="mt-25px flex flex-wrap">
                <div @click="$router.push('/home/aa')" class="border inline-block p-12px cursor-pointer mr-8px mb-8px">
                    图标生成器
                </div>
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
onActivated(() => {
    console.log('asdas');
})
</script>

<style lang="less" scoped>
</style>
