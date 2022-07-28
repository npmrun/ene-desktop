<template>
    <div class="bg-pink-800">
        dsada
        <div class="w-500px">

            <img class="w-1/1" src="rush-file://1111.jpg" @click="showDialog = !showDialog">
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
