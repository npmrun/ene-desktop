<script lang="ts" setup>
import { PopupMenu } from '@/bridge/PopupMenu';

const props = withDefaults(defineProps<{
    home?: string,
    url: string
}>(),{

})

const emits = defineEmits<{
    (ev: "new-window", path: string): void,
}>()

const webviewRef = ref<WebviewTag>()
const state = reactive({
    tempUrl: '',
    curUrl: props.url
})
let webContentsId = ref(-1)
let isLoading = ref(false)
let canGoBack = ref(false)
let canGoForward = ref(false)
watchEffect(async () => {
    if (webContentsId.value !== -1) {
        await _agent.call("preventWebview", webContentsId.value)
    }
})
onMounted(() => {
    if (!webviewRef.value) return
    const we = webviewRef.value
    we.addEventListener("dom-ready", async function () {
        state.curUrl = we.getURL()
        webContentsId.value = we.getWebContentsId()
        canGoBack.value = we.canGoBack()
        canGoForward.value = we.canGoForward()
    })
    we.addEventListener('new-window', function (e) {
        // emits('new-window', e.url)
    })
    we.addEventListener('console-message', function (e) {
        console.log(`%c[Guest page logged a message]:\n`, 'color: green;', e.message)
    })
    we.addEventListener('did-start-loading', function (e) {
        isLoading.value = true
        console.log('加载开始');
    })
    we.addEventListener('did-stop-loading', function (e) {
        isLoading.value = false
        console.log('加载结束');
    })
    we.addEventListener('context-menu', function (e: any) {
        console.log(e);
        console.log('右键菜单');
        const contextMenu = []
        if(e.params.linkURL){
            contextMenu.push({
                label: "前往",
                click(){
                    we.loadURL(e.params.linkURL)
                }
            })
        }
        if(e.params.srcURL && e.params.mediaType === "image"){
            contextMenu.push({
                label: "图片另存为",
                async click(){
                    const url = e.params.srcURL
                    console.log(url);
                    we.downloadURL(url)
                }
            })
        }
        
        if(contextMenu.length){
            new PopupMenu(contextMenu).show()
        }
    })
    we.addEventListener('did-finish-load', function (e) {
        console.log('加载完成');
    })
    we.addEventListener('did-fail-load', function (e) {
        console.error(e);
        if (e.errorCode === -105) {
            console.error("网址不正确");
        }
        if (e.errorCode === -118) {
            console.error("网络连接超时");
        }
        if (e.errorCode === -3) {
            console.error("取消加载");
        }
    })
})

function stopLoad() {
    if (!webviewRef.value) return
    const we = webviewRef.value
    we.stop()
}
function handleSubmit() {
    if (state.curUrl && state.curUrl !== state.tempUrl && state.curUrl.startsWith('http')) {
        if (isLoading.value) {
            webviewRef.value?.stop()
        }
        webviewRef.value?.loadURL(state.curUrl)
    } else {
        state.curUrl = state.tempUrl
    }
    state.tempUrl = ''
}
function handleInputFocus() {
    state.tempUrl = state.curUrl
}
function handleInputBlur() {

}
function refresh() {
    if (!webviewRef.value) return
    const we = webviewRef.value
    we.reload()
}
function forward() {
    if (!canGoForward.value) return
    if (!webviewRef.value) return
    const we = webviewRef.value
    we.goForward()
}
function back() {
    if (!canGoBack.value) return
    if (!webviewRef.value) return
    const we = webviewRef.value
    we.goBack()
}
function clickHome() {
    if (!state.curUrl) return
    if (!webviewRef.value) return
    const we = webviewRef.value
    if(props.home && props.home.startsWith('http')){
        we.loadURL(props.home)
    }
    // else{
    //     const url = new URL(state.curUrl)
    //     we.loadURL(url.origin)
    // }
}
</script>

<template>
    <div class="flex flex-col">
        <div class="h-40px mx-6px text-size-16px border-b box-content flex items-center">
            <div v-if="!!home" class="w-30px h-30px p-5px box-border flex items-center justify-center hover:bg-light-700 rounded-lg cursor-pointer"
                @click="clickHome" title="主页">
                <SvgIcon name="browser-home"></SvgIcon>
            </div>
            <div class="w-30px h-30px p-8px box-border flex items-center justify-center rounded-lg" @click="back"
                title="后退" :class="[canGoBack ? 'hover:bg-light-700 cursor-pointer' : 'opacity-60']">
                <SvgIcon name="browser-back"></SvgIcon>
            </div>
            <div v-if="canGoForward" class="w-30px h-30px p-8px box-border flex items-center justify-center rounded-lg"
                :class="[canGoForward ? 'hover:bg-light-700 cursor-pointer' : 'opacity-60']" @click="forward"
                title="前进">
                <SvgIcon name="browser-forward"></SvgIcon>
            </div>
            <div v-if="!isLoading"
                class="w-30px h-30px p-8px box-border flex items-center justify-center hover:bg-light-700 rounded-lg cursor-pointer"
                @click="refresh" title="刷新">
                <SvgIcon name="browser-refresh"></SvgIcon>
            </div>
            <div v-else
                class="w-30px h-30px p-5px box-border flex items-center justify-center hover:bg-light-700 rounded-lg cursor-pointer"
                @click="stopLoad" title="结束刷新">
                <SvgIcon name="close"></SvgIcon>
            </div>
            <form @submit="handleSubmit" class="border w-1/1 ml-6px mr-15px px-6px h-28px rounded-md flex items-center">
                <input spellcheck="false" class="block w-1/1 outline-none" type="text" v-model="state.curUrl"
                    @blur="handleInputBlur" @focus="handleInputFocus">
            </form>
        </div>
        <webview allowpopups ref="webviewRef" class="flex-1 h-0" :src="url"></webview>
    </div>
</template>