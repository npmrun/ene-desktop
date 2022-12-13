<script lang="ts" setup>
const props = withDefaults(defineProps<{
    title: string
    desc?: string
    redBorder?: boolean
}>(), {

})
</script>
<template>
    <div class="mb-35px" :class="[redBorder && 'notsave']">
        <div class="text-size-20px font-bold">{{ title }}</div>
        <div class="text-gray-400 pt-8px">{{ desc }}</div>
        <div class="pt-8px">
            <slot></slot>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.notsave {
    position: relative;

    &::before {
        content: "";
        position: absolute;
        inset: 0;
        border: 1px solid rgb(241, 12, 12);
        margin: -12px;
        border-radius: 6px;
    }
}
</style>


