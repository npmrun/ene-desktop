<template>
    <div class="h-1/1 flex">
        <div class="w-120px border-r shadow text-size-14px">
            <Menu></Menu>
        </div>
        <div class="flex-1 w-0 relative">
            <div class="w-250px h-full border-r shadow">
                <Menu></Menu>
            </div>
        </div>
        <NiuDialog v-model:show="showDialog">
            <div class="bg-light-50">asdads
                sd
                sadds
                ad
                da
            </div>
        </NiuDialog>
    </div>
</template>
<script lang="ts" setup>
import Menu from './_ui/menu.vue';
const showDialog = ref(false)

</script>

<style lang="less" scoped>
.home {
    @apply bg-white;
}
</style>
