<script lang="ts" setup>
import { PopupMenu } from '@/bridge/PopupMenu';
import URL from "url-parse"
import { toast } from 'vue3-toastify';

const props = withDefaults(defineProps<{
    collect?: boolean,
    home?: string,
    url: string
}>(), {
    collect: false
})

const emits = defineEmits<{
    (ev: "new-window", path: string): void,
    (ev: "dom-ready", curUrl: string): void,
    (ev: "collect", url: string): void,
    (ev: "cancel-collect", url: string): void,
}>()

const webviewRef = ref<WebviewTag>()
const state = reactive({
    tempUrl: props.url,
    curUrl: props.url
})

function toPage(page: string) {
    if (webviewRef.value?.isLoading()) {
        webviewRef.value?.stop()
    }
    webviewRef.value?.loadURL(page)
}

let websiteInfo = ref()
let isFirst = ref(true)
let webContentsId = ref(-1)
let isLoading = ref(false)
let isLoadingWebsiteInfo = ref(false)
let canGoBack = ref(false)
let canGoForward = ref(false)
let devtoolsIsOpen = ref(false)
watchEffect(async () => {
    if (webContentsId.value !== -1) {
        await _agent.call("preventWebview", webContentsId.value)
    }
})
onMounted(() => {
    if (!webviewRef.value) return
    const we = webviewRef.value
    we.addEventListener("dom-ready", async function () {
        if (isFirst.value) {
            console.log(`首次运行:`, we.getTitle());
            isFirst.value = false
            state.tempUrl = state.curUrl = props.url
            toPage(state.curUrl)
            watch(() => props.url, async (newValue) => {
                state.tempUrl = state.curUrl = newValue
                toPage(state.curUrl)
            })
            return
        }
        state.tempUrl = state.curUrl = we.getURL()
        webContentsId.value = we.getWebContentsId()
        canGoBack.value = we.canGoBack()
        canGoForward.value = we.canGoForward()
        emits("dom-ready", state.curUrl)
    })
    we.addEventListener('ipc-message', function (event) {
        console.log(event)
        if (event.channel === "start-load-info") {
            isLoadingWebsiteInfo.value = true
        }
        if (event.channel === "stop-load-info") {
            isLoadingWebsiteInfo.value = false
            websiteInfo.value = event.args[0]
        }
    })
    we.addEventListener('new-window', function (e) {
        // emits('new-window', e.url)
        console.log(e);
    })
    we.addEventListener('will-navigate', function (e) {
        console.log(e);

    })
    // we.addEventListener('console-message', function (e) {
    //     console.log(`%c[Guest page logged a message]:\n`, 'color: green;', e.message)
    // })
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
        if (e.params.linkURL) {
            contextMenu.push({
                label: "前往",
                click() {
                    toPage(e.params.linkURL)
                }
            })
        }
        if (e.params.srcURL && e.params.mediaType === "image") {
            contextMenu.push({
                label: "图片另存为",
                async click() {
                    const url = e.params.srcURL
                    console.log(url);
                    we.downloadURL(url)
                }
            })
        }

        if (contextMenu.length) {
            new PopupMenu(contextMenu).show()
        }
    })
    we.addEventListener('did-finish-load', function (e) {
        console.log('加载完成');
    })
    we.addEventListener('did-fail-load', function (e) {
        console.error(e);
        console.error(e?.errorDescription);
    })
    we.addEventListener('devtools-opened', (e) => {
        devtoolsIsOpen.value = true
    })
    we.addEventListener('devtools-closed', (e) => {
        devtoolsIsOpen.value = false
    })
})

function stopLoad() {
    if (!webviewRef.value) return
    const we = webviewRef.value
    we.stop()
}
function handleSubmit() {
    if (state.tempUrl && state.curUrl !== state.tempUrl && state.tempUrl.startsWith('http')) {
        state.curUrl = state.tempUrl
        toPage(state.curUrl)
    }
}
function handleInputFocus() {
    // console.log(state.curUrl, state.tempUrl);

    // state.curUrl = state.tempUrl
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
    if (props.home && props.home.startsWith('http')) {
        toPage(props.home)
    }
    // else{
    //     const url = new URL(state.curUrl)
    //     we.loadURL(url.origin)
    // }
}

function handleCollect() {
    if (props.collect) {
        emits("cancel-collect", state.curUrl)
    } else {
        emits("collect", state.curUrl)
    }
}

function toggleDevTools() {
    if (webContentsId.value === -1) return
    _agent.call("toggleDevTools", webContentsId.value)
}

function clear() {
    if (!webviewRef.value) return
    const we = webviewRef.value
    we.clearHistory()
    toast.success('历史记录已清除')
    canGoBack.value = we.canGoBack()
    canGoForward.value = we.canGoForward()
}

const webviewPreloadPath = _agent.webviewPreloadPath
</script>

<template>
    <div class="flex flex-col">
        <div class="h-40px px-6px text-size-16px border-b flex items-center">
            <div v-if="!!home"
                class="w-30px h-30px p-5px box-border flex items-center justify-center hover:bg-light-700 rounded-lg cursor-pointer"
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
            <form @submit="handleSubmit"
                class="border box-border w-1/1 ml-6px mr-6px px-6px h-28px rounded-md flex items-center p-3px">
                <div
                    class="w-22px h-22px p-2px box-border flex items-center justify-center hover:bg-light-700 rounded-lg cursor-pointer">
                    <img v-if="websiteInfo?.favicon" :src="websiteInfo.favicon">
                    <SvgIcon v-else name="browser-star-full"></SvgIcon>
                </div>
                <input spellcheck="false" class="mx-6px inline-block w-0 flex-1 outline-none" type="text"
                    v-model="state.tempUrl" @blur="handleInputBlur" @focus="handleInputFocus">
                <div class="w-22px h-22px p-2px box-border flex items-center justify-center hover:bg-light-700 rounded-lg cursor-pointer"
                    :title="collect ? '取消收藏' : '收藏'" @click="handleCollect">
                    <SvgIcon :name="collect ? 'browser-star-full' : 'browser-star'"></SvgIcon>
                </div>
            </form>
            <div class="w-30px h-30px p-5px box-border flex items-center justify-center hover:bg-light-700 rounded-lg cursor-pointer"
                :class="[devtoolsIsOpen ? 'bg-red-100' : '']" @click="toggleDevTools" title="开发者工具">
                <SvgIcon name="browser-develop"></SvgIcon>
            </div>
            <div class="w-30px h-30px ml-5px p-5px box-border flex items-center justify-center hover:bg-light-700 rounded-lg cursor-pointer"
                @click="clear" title="清除历史">
                <SvgIcon name="browser-clear"></SvgIcon>
            </div>
        </div>
        <webview allowpopups ref="webviewRef" class="flex-1 h-0" :preload="webviewPreloadPath" src="data:text/plain,">
        </webview>
    </div>
</template>