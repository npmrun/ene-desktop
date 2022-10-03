<template>
    <div class="page">
        <div class="img-wrapper">
            <img src="https://w.wallhaven.cc/full/6o/wallhaven-6oxgp6.jpg" alt="">
        </div>
        <span @click="showDialog = !showDialog">sadas</span>
        <input type="text">
        <rush-dialog v-model:show="showDialog">
            <div class="bg-light-50">asdad
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
import RushDialog from "@rush-ui/rush-dialog";
console.log(RushDialog);
const showDialog = ref(false)

onActivated(() => {
    console.log('asdas');
})
</script>

<style lang="less" scoped>
.img-wrapper {
    position: relative;
    padding-bottom: 100%;
    width: 100%;

    img {
        position: absolute;
        width: 100%;
        height: 100%;
        left: 0;
        top: 0;
    }
}
</style>
