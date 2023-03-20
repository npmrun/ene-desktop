<template>
    <div>
        asda
        {{ curSnippetId }}
    </div>
</template>

<script lang="ts" setup>
const route = useRoute()
console.log(route.fullPath)

const curSnippetId = computed(() => route.params.snippet)
</script>
<style lang="less" scoped></style>
