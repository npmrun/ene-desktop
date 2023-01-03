<script lang="ts" setup>
import Left from "./left.vue"
import browser from "./browser.vue";
import URL from "url-parse"
import { TState, IState } from "./token";
import RushDialog from "@rush-ui/dialog";
import { findByKey, INiuTreeData, INiuTreeKey } from "princess-ui";
import { PopupMenu } from "@/bridge/PopupMenu";
import { v4 } from "uuid";

let treeState = reactive<TState>({
    activeKeys: [],
    openKey: undefined,
    list: []
})
provide(IState, treeState)

const browserRef = ref<InstanceType<typeof browser>>()
// const route = useRoute()
// const url = route.query.url as string
interface ITab {
    fromId?: INiuTreeKey | string
    fromTitle?: string
    title: string
    desc: string
    url: string
    key: string
}
const tabs = ref<ITab[]>([])
const curUrl = ref<ITab>()
const showUrlList = computed<ITab[]>(() => {
    if (treeState.openKey) {
        return tabs.value.filter(v => v.fromId === treeState.openKey)
    }
    return tabs.value
})

onBeforeMount(async () => {
    const list = await _agent.call("db.getData", "web/tree") ?? []
    treeState.list = list
    if(list.length) treeState.openKey = list[0].key
    const web = await _agent.call("db.getData", "web/website") ?? []
    tabs.value = web
})

const saveTreeFn = useThrottleFn(async () => {
    await _agent.call("db.saveData", "web/tree", toRaw(treeState.list))
    console.log("保存成功");
}, 200)
const saveWebsiteFn = useThrottleFn(async () => {
    await _agent.call("db.saveData", "web/website", tabs.value.map(v=>toRaw(v)))
    console.log("保存成功");
}, 200)
async function handleChangeTree() {
    saveTreeFn()
}
function handleDeleteTree(key: INiuTreeKey) {
    tabs.value.forEach(v => {
        if (v.fromId === key) {
            v.fromId = ''
            v.fromTitle = ''
        }
    })
}
watch(() => tabs.value, () => {
    saveWebsiteFn()
}, { deep: true })

const curPathRef = ref('')
const isCollect = computed(() => {
    if (tabs.value.find(v => v.url === curPathRef.value)) return true
    return false
})
function handleDomReady(curPath: string) {
    curPathRef.value = curPath
}

function handleCollect(curPath: string, websiteInfo: any) {
    dialogState.data = { title: websiteInfo.title, url: curPath, desc: '' }
    dialogState.isShow = true
}
function handleCancelCollect(curPath: string, websiteInfo: any) {

}

function clickURL(item: ITab) {
    curUrl.value = item
    browserRef.value?.toPage(curUrl.value.url)
}

const dialogState = reactive({
    isShow: false,
    editKey: '',
    fromId: undefined,
    fromTitle: '',
    data: {
        title: '',
        desc: '',
        url: ''
    }
})
function cancelDialog() {
    dialogState.data = { title: '', url: '', desc: '' }
    dialogState.isShow = false
    dialogState.editKey = ''
    dialogState.fromId = undefined
    dialogState.fromTitle = ''
}
function saveDialog() {
    if (dialogState.data.title && dialogState.data.url) {
        if(dialogState.editKey === ''){
            let fromId = treeState.openKey
            let fromTitle
            if(dialogState.fromId){
                fromId = dialogState.fromId
                fromTitle = dialogState.fromTitle
            }else{
                if(fromId){
                    fromTitle = findByKey(fromId, treeState.list)?.title
                }
            }
            tabs.value.push({
                fromId: fromId,
                fromTitle: fromTitle,
                key: v4(),
                title: dialogState.data.title,
                desc: dialogState.data.desc,
                url: new URL(dialogState.data.url).href
            })
        }else{
            for (let i = 0; i < tabs.value.length; i++) {
                const item = tabs.value[i];
                if(item.key === dialogState.editKey){
                    item.title = dialogState.data.title
                    item.url = new URL(dialogState.data.url).href
                    item.desc = dialogState.data.desc
                }
            }
        }
    }
    dialogState.data = { title: '', url: '', desc: '' }
    dialogState.editKey = ''
    dialogState.isShow = false
    dialogState.fromId = undefined
    dialogState.fromTitle = ''
}

function handleContextMenu(item: ITab, index: number) {
    const menuList = []
    menuList.push({
        label: "编辑",
        click() {
            dialogState.data.title =  tabs.value[index].title
            dialogState.data.url =  tabs.value[index].url
            dialogState.data.desc =  tabs.value[index].desc
            dialogState.editKey = item.key
            dialogState.isShow = true
        },
    })
    menuList.push({
        label: "删除",
        click() {
            tabs.value = tabs.value.filter(v=>v.key !== item.key)
        },
    })
    const menu = new PopupMenu(menuList)
    menu.show()
}

function handleNew() {
    dialogState.isShow = true
    dialogState.editKey = ''
    dialogState.data.title =  ''
    dialogState.data.desc =  ''
    dialogState.data.url =  ''
}
function handleNewURL(data: any) {
    dialogState.editKey = ''
    dialogState.fromId = data.key as any
    dialogState.fromTitle = data.title
    dialogState.data.title =  ''
    dialogState.data.desc =  ''
    dialogState.data.url =  ''
    dialogState.isShow = true
}
</script>

<script lang="ts">
export default defineComponent({
    name: "web"
})
</script>
<route lang="yaml">
name: web
meta:
    cache: true
</route>
<template>
    <div class="h-1/1 flex">
        <div class="w-250px border-r flex flex-col">
            <!-- <div @click="treeState.openKey=undefined" class="h-40px flex items-center p-6px cursor-pointer">全部网站</div> -->
            <Left @new-url="handleNewURL" class="flex-1 h-0" @delete="handleDeleteTree" @change="handleChangeTree"></Left>
        </div>
        <div class="w-250px border-r">
            <!-- <div class="border-b h-40px flex items-center p-6px">
                <form class="border py-3px px-6px w-0 rounded-lg flex flex-1 items-center">
                    <input placeholder="输入搜索" class="outline-none flex-1 w-0" type="text">
                </form>
                <div class="ml-6px cursor-pointer" @click="handleNew">新建</div>
            </div> -->
            <div class="m-6px border rounded-md cursor-pointer flex flex-col" v-for="(item, index) in showUrlList"
                @click="clickURL(item)" draggable="true" :key="index" :title="item.url" @contextmenu="handleContextMenu(item, index)">
                <div class="font-bold h-28px leading-14px p-6px ell">
                    {{ item.title }}
                </div>
                <div v-if="!!item.desc" class="h-24px text-gray-400 leading-12px border-t p-6px flex-1 h-0 ell">
                    {{ item.desc }}
                </div>
            </div>
        </div>
        <browser ref="browserRef" :collect="isCollect" class="h-1/1 flex-1 w-0" :url="curUrl?.url"
            @dom-ready="handleDomReady" @collect="handleCollect" @cancel-collect="handleCancelCollect"></browser>
        <rush-dialog v-model:show="dialogState.isShow">
            <div class="bg-light-50 rounded-4px min-w-350px">
                <div class="text-size-20px font-bold p-12px border-b flex items-center">
                    <div class="flex-1 w-0">
                        {{!dialogState.editKey?'新增网站':'编辑网站'}}
                        <span class="text-size-12px">从属于：{{ dialogState.fromTitle }}</span>
                    </div>
                    <button class="delete" @click="dialogState.isShow = false"></button>
                </div>
                <div class="text-size-16px p-12px min-h-80px">
                    <input v-model="dialogState.data.title" spellcheck="false" type="text" class="input is-medium block"
                        placeholder="请输入标题">
                    <input v-model="dialogState.data.desc" spellcheck="false" type="text" class="input is-medium block"
                        placeholder="请输入描述">
                    <input v-model="dialogState.data.url" spellcheck="false" type="text" class="input is-medium block"
                        placeholder="请输入网址">
                </div>
                <div class="buttons border-t flex !justify-end p-12px">
                    <button class="button is-danger !mb-0" @click="cancelDialog">取消</button>
                    <button class="button is-info !mb-0" @click="saveDialog">保存</button>
                </div>
            </div>
        </rush-dialog>
    </div>
</template>
<style lang="less" scoped>

</style>
