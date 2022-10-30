<template>
    <div class="flex items-center !mb-0.5rem !mr-0.5rem">
        <input type="number" v-model="aNum" class="input is-small !w-60px" placeholder="宽度">
        <span class="mx-6px">-</span>
        <input type="number" v-model="bNum" class="input is-small !w-60px" placeholder="高度">
        <button class="button cursor-pointer is-small is-info ml-6px !mb-0" @click="add">添加</button>
    </div>
</template>

<script lang="ts" setup>
import { toast } from 'vue3-toastify';


const aNum = ref<number>()
const bNum = ref<number>()

const emit = defineEmits<{
    (ev: "add", width: number, height: number): void
}>()

function add() {
    if (aNum.value && bNum.value && aNum.value > 0 && bNum.value > 0) {
        emit("add", aNum.value, bNum.value)
        aNum.value = undefined
        bNum.value = undefined
    } else {
        toast.error("宽高必须为正数")
    }
}
</script>
