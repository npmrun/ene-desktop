<script lang="ts" setup>
import { toast } from 'vue3-toastify';
import parse from 'url-parse';
import { PopupMenu } from '@/bridge/PopupMenu';
import "nprogress/nprogress.css"
import NProgress from "nprogress";

const props = withDefaults(defineProps<{
    collect?: boolean,
    home?: string
    hide: ("collect" | "clean" | "open" | "devtool" | "menu")[]
    url?: string
}>(), {
    collect: false,
    hide: () => [],
    url: '我的首页'
})

NProgress.configure({
    easing: 'ease',
    speed: 500,
    showSpinner: false,
    parent: "#wrapperWebview"
})

const matchCustomUrl = {
    "我的首页": _agent.getStaticHtml("home")
}

const matchInternalUrl = {
    "403": _agent.getStaticHtml("403"),
    "404": _agent.getStaticHtml("404")
}

function getURL(url: string) {
    if (matchCustomUrl[url as "我的首页"]) {
        url = matchCustomUrl[url as "我的首页"]
    }
    return url
}

// 这个内部加载会有问题，点击刷新的时候刷新的不是顶部的网址而是这个内部链接了。因此内部链接可能弃用，暂时放这里
function internalLoad(page: keyof typeof matchInternalUrl) {
    let realUrl = matchInternalUrl[page]
    state.curUrl = realUrl
    state.curWebviewUrl = realUrl
    webviewRef.value?.loadURL(realUrl)
}

const webviewRef = ref<WebviewTag>()
const state = reactive<{
    tempUrl: string,
    curUrl: string,
    curWebviewUrl: string,
    canGoBack: boolean,
    canGoForward: boolean,
    isLoading: boolean,
    isLoadingWebsiteInfo: boolean,
    devtoolsIsOpen: boolean,
    webContentsId: number,
    websiteInfo?: any,
}>({
    tempUrl: props.url,
    curUrl: getURL(props.url),
    curWebviewUrl: getURL(props.url),
    canGoBack: false,
    canGoForward: false,
    isLoading: false,
    isLoadingWebsiteInfo: false,
    devtoolsIsOpen: false,
    webContentsId: -1,
    websiteInfo: undefined,
})

function toPage(url: string) {
    let page = getURL(url)
    if (webviewRef.value?.isLoading()) {
        webviewRef.value?.stop()
    }
    if (parse(state.curUrl).toString() !== parse(page).toString()) {
        state.curUrl = page
    } else if (parse(page).toString() !== parse(state.curWebviewUrl).toString()) {
        webviewRef.value?.loadURL(page)
    }
}

onMounted(() => {
    const we = webviewRef.value
    if (we) {
        // let isFirstLoad = true
        we.addEventListener("dom-ready", (ev) => {
            console.log(`耗时:${ev.timeStamp}ms`);
            let curWebContentsId = we.getWebContentsId()
            if (curWebContentsId !== state.webContentsId) {
                state.webContentsId = curWebContentsId
                _agent.call("preventWebview", state.webContentsId)
            }
        })
        function updateInfo() {
            if (we) {
                state.canGoBack = we.canGoBack()
                state.canGoForward = we.canGoForward()
                let url = decodeURIComponent(we.getURL())
                state.curWebviewUrl = decodeURIComponent(we.getURL())
                let have = false
                // 路径相同时只展示对应的文字路径，主要看跳转以及前进返回的顶部路径是否正确，这是比较妥协的办法。
                for (const key in matchCustomUrl) {
                    if (Object.prototype.hasOwnProperty.call(matchCustomUrl, key)) {
                        const element = matchCustomUrl[key as keyof typeof matchCustomUrl];
                        if (encodeURIComponent(element) === encodeURIComponent(url)) {
                            state.tempUrl = key
                            have = true
                        }
                    }
                }
                if (!have) {
                    state.tempUrl = url
                }
            }
        }
        we.addEventListener("did-navigate", (ev) => {
            updateInfo()
        })
        we.addEventListener('did-fail-load', function (e) {
            console.error(e);
            console.error(e?.errorDescription);
            // TODO 此处执行js代码不知有没有风险，只用于展示错误
            if (e.errorCode === -300) {
                we.executeJavaScript(`document.open();document.write(\`${_agent.getStaticHtmlSource("404")}\`);document.close();`)
            }
            if (e.errorCode === -100) {
                we.executeJavaScript(`document.open();document.write(\`${_agent.getStaticHtmlSource("404")}\`);document.close();`)
            }
            if (e.errorCode === -105) {
                we.executeJavaScript(`document.open();document.write(\`${_agent.getStaticHtmlSource("403")}\`);document.close();`)
                // internalLoad("404")
            }
            if (e.errorCode === -21) {
                we.executeJavaScript(`document.open();document.write(\`${_agent.getStaticHtmlSource("403")}\`);document.close();`)
                // internalLoad("404")
            }
            // if(e.errorCode === -337){
            //     internalLoad("403")
            // }
            updateInfo()
        })
        we.addEventListener('ipc-message', function (event) {
            if (event.channel === "start-load-info") {
                state.isLoadingWebsiteInfo = true
            }
            if (event.channel === "stop-load-info") {
                state.websiteInfo = event.args[0]
                state.isLoadingWebsiteInfo = false
            }
        })
        we.addEventListener('did-start-loading', function (e) {
            NProgress.start()
            state.isLoading = true
        })
        we.addEventListener('did-stop-loading', function (e) {
            state.isLoading = false
            NProgress.done()
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
        we.addEventListener('devtools-opened', (e) => {
            state.devtoolsIsOpen = true
        })
        we.addEventListener('devtools-closed', (e) => {
            state.devtoolsIsOpen = false
        })
    }
})

function clickHome() {
    if (props.home) {
        toPage(state.tempUrl = props.home)
    }
}

function clickBack() {
    if (!webviewRef.value) return
    if (!state.canGoBack) return
    webviewRef.value.goBack()
}

function clickForward() {
    if (!webviewRef.value) return
    if (!state.canGoForward) return
    webviewRef.value.goForward()
}

defineExpose({
    update(){
        clickRefresh()
    }
})

function clickRefresh() {
    if (!webviewRef.value) return

    let url = webviewRef.value.getURL()
    let isInternalUrl = Object.values(matchInternalUrl).includes(url)
    if (isInternalUrl) {
        webviewRef.value.goBack()
    } else {
        webviewRef.value.reload()
    }
}

function clickStopLoad() {
    if (!webviewRef.value) return
    webviewRef.value.stop()
}

function handleSubmit(e: Event) {
    e.preventDefault()
    if (state.tempUrl) {
        toPage(state.tempUrl)
    }
}

function handleInputBlur() {

}

function handleInputFocus(ev: any) {
    const el = ev.target as HTMLInputElement
    if (state.tempUrl.startsWith("http://") || state.tempUrl.startsWith("https://")) {
        el.setSelectionRange(state.tempUrl.indexOf("//") + 2, state.tempUrl.length)
    } else {
        el.setSelectionRange(0, state.tempUrl.length)
    }
}

function handleCollect() {

}

function clickOpenBrowser() {
    if (!webviewRef.value) return
    _agent.call('func.openExternal', state.curWebviewUrl)
}

function clickToggleDevTools() {
    if (state.webContentsId === -1) return
    _agent.call("toggleDevTools", state.webContentsId)
}

function clickClear() {
    if (!webviewRef.value) return
    webviewRef.value.clearHistory()
    toast.success('历史记录已清除')
    state.canGoBack = false
    state.canGoForward = false
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
            <div class="w-30px h-30px p-8px box-border flex items-center justify-center rounded-lg" @click="clickBack"
                title="后退" :class="[state.canGoBack ? 'hover:bg-light-700 cursor-pointer' : 'opacity-60']">
                <SvgIcon name="browser-back"></SvgIcon>
            </div>
            <div v-if="state.canGoForward"
                class="w-30px h-30px p-8px box-border flex items-center justify-center rounded-lg"
                :class="[state.canGoForward ? 'hover:bg-light-700 cursor-pointer' : 'opacity-60']" @click="clickForward"
                title="前进">
                <SvgIcon name="browser-forward"></SvgIcon>
            </div>
            <div v-if="!state.isLoading"
                class="w-30px h-30px p-8px box-border flex items-center justify-center hover:bg-light-700 rounded-lg cursor-pointer"
                @click="clickRefresh" title="刷新">
                <SvgIcon name="browser-refresh"></SvgIcon>
            </div>
            <div v-else
                class="w-30px h-30px p-5px box-border flex items-center justify-center hover:bg-light-700 rounded-lg cursor-pointer"
                @click="clickStopLoad" title="结束刷新">
                <SvgIcon name="close"></SvgIcon>
            </div>
            <form @submit="handleSubmit"
                class="border box-border w-1/1 ml-6px mr-6px px-6px h-28px rounded-md flex items-center p-3px">
                <div v-if="!state.isLoadingWebsiteInfo && state.websiteInfo?.favicon"
                    class="w-22px h-22px box-border flex items-center justify-center hover:bg-light-700 rounded-lg cursor-pointer">
                    <img :src="state.websiteInfo.favicon">
                </div>
                <div v-if="state.isLoadingWebsiteInfo"
                    class="w-22px h-22px box-border flex items-center justify-center hover:bg-light-700 rounded-lg cursor-pointer">
                    <SvgIcon class="loading" name="browser-loading"></SvgIcon>
                </div>
                <input spellcheck="false" class="mx-6px inline-block w-0 flex-1 outline-none" type="text"
                    v-model="state.tempUrl" @blur="handleInputBlur" @focus="handleInputFocus">
                <div v-if="!hide.includes('collect')" class="w-22px h-22px p-2px box-border flex items-center justify-center hover:bg-light-700 rounded-lg cursor-pointer"
                    :title="collect ? '取消收藏' : '收藏'" @click="handleCollect">
                    <SvgIcon :name="collect ? 'browser-star-full' : 'browser-star'"></SvgIcon>
                </div>
            </form>
            <div v-if="!hide.includes('clean')" class="w-30px h-30px p-5px box-border flex items-center justify-center hover:bg-light-700 rounded-lg cursor-pointer"
                @click="clickClear" title="清除历史">
                <SvgIcon name="browser-clear"></SvgIcon>
            </div>
            <div v-if="!hide.includes('open')" class="w-30px h-30px p-5px box-border flex items-center justify-center hover:bg-light-700 rounded-lg cursor-pointer"
                @click="clickOpenBrowser" title="外部浏览器打开">
                <SvgIcon name="browser-browser"></SvgIcon>
            </div>
            <div v-if="!hide.includes('devtool')" class="w-30px h-30px p-5px box-border flex items-center justify-center hover:bg-light-700 rounded-lg cursor-pointer"
                :class="[state.devtoolsIsOpen ? 'bg-red-100' : '']" @click="clickToggleDevTools" title="开发者工具">
                <SvgIcon name="browser-develop"></SvgIcon>
            </div>

            <div v-if="!hide.includes('menu')" class="dropdown is-right is-hoverable">
                <div class="dropdown-trigger">
                    <div class="w-30px h-30px p-5px box-border flex items-center justify-center hover:bg-light-700 rounded-lg cursor-pointer"
                        title="菜单">
                        <SvgIcon name="browser-menu"></SvgIcon>
                    </div>
                </div>
                <div class="dropdown-menu" id="dropdown-menu6" role="menu">
                    <div class="dropdown-content">
                        <a href="#" class="dropdown-item">
                            收藏
                        </a>
                        <hr class="dropdown-divider">
                        <router-link to="/setting" class="dropdown-item">
                            设置
                        </router-link>
                    </div>
                </div>
            </div>
        </div>
        <div id="wrapperWebview" class="flex-1 h-0">
            <webview allowpopups ref="webviewRef" class="h-1/1" :preload="webviewPreloadPath" :src="state.curUrl">
            </webview>
        </div>
    </div>
</template>

<style lang="less" scoped>
.loading {
    animation: rotate 3s infinite linear;
}

@keyframes rotate {
    100% {
        transform: rotate(360deg);
    }
}
</style>
