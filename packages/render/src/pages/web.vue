<script lang="ts" setup>

const route = useRoute()
const url = route.query.url

const webviewRef = ref<WebviewTag>()
const state = reactive({
    curUrl: ''
})

onMounted(() => {
    if(!webviewRef.value) return
    const we = webviewRef.value
    we.addEventListener('dom-ready', function () {
        state.curUrl = we.getURL()
        console.log(we.getWebContentsId());
    })
    we.addEventListener('console-message', function (e) {
        console.log(e);
        console.log(`%c[Guest page logged a message]:\n`, 'color: green;', e.message)
    })
})

function handleInputBlur(e: Event) {
    const toUrl = (e.target as HTMLInputElement).value
    state.curUrl = toUrl
    webviewRef.value?.loadURL(state.curUrl)
}
</script>

<route lang="yaml">
name: web
meta:
    cache: false
</route>
<template>
    <div class="h-1/1 flex">
        <div class="w-250px border-r">
            {{state.curUrl}}
        </div>
        <div class="h-1/1 flex flex-col flex-1 w-0">
            <div class="h-40px px-15px text-size-16px border-b box-content flex">
                <input spellcheck="false" class="block w-1/1 outline-none m-auto" type="text" :value="state.curUrl" @blur="handleInputBlur">
            </div>
            <webview allowpopups ref="webviewRef" class="flex-1 h-0" :src="url"></webview>
        </div>
    </div>
</template>
