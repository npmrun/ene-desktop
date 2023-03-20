<template>
    <div class="flex-1 w-0 h-1/1 flex">
        <div class="w-300px flex border-r flex-col h-1/1">
            <div class="text-center pt-100px text-size-25px" @click="toSnipCode">暂无此工具111111</div>
            <div>{{ curFolderId }}</div>
        </div>
        <main class="flex-1 w-0">
            <router-view v-slot="{ Component }">
                <component :is="Component" />
            </router-view>
        </main>
    </div>
</template>

<script lang="ts" setup>
const route = useRoute()
console.log(route)

const curFolderId = computed(() => route.params.folder)
const router = useRouter()

function toSnipCode() {
    router.push("/snippet/" + curFolderId.value + "/111111111111")
}
</script>
<style lang="less" scoped></style>
