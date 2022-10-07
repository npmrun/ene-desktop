<template>
    <div class="page">
        <div @click="showDialog = !showDialog">荣幸</div>
        <rush-dialog v-model:show="showDialog">
            <div class="bg-light-50 p-12px rounded-4px min-w-800px">
                <div class="text-size-24px text-center">asdsada</div>
            </div>
        </rush-dialog>
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
import RushDialog from "@rush-ui/dialog";

const showDialog = ref(false)

onActivated(() => {
    console.log('asdas');
})
</script>

<style lang="less" scoped>

</style>
