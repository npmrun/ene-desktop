<template>
    <div class="h-1/1 flex">
        <div class="w-120px border-r">
            设置
        </div>
        <div class="flex-1 w-0" @click="showDialog = true">
            <span>asd</span>
            <a href="https://baidu.com">百度</a>
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

const showDialog = ref(false)

</script>

<style lang="less" scoped>
.home {
    @apply bg-white;
}
</style>
