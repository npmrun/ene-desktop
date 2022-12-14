<script lang="ts" setup>

const route = useRoute()
const url = route.query.url

</script>
<template>
    <div class="h-1/1">
        <div class="loading"></div>
        <webview style="height: 100%;" :src="url"></webview>
    </div>
</template>