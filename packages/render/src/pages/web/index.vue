<script lang="ts" setup>
import Left from "./left.vue"
import browser from "./browser.vue";
import URL from "url-parse"
import { TState, IState } from "./token";
import RushDialog from "@rush-ui/dialog";
import { findByKey, INiuTreeKey } from "princess-ui";
import { PopupMenu } from "@/bridge/PopupMenu";

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
    url: string
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
    const web = await _agent.call("db.getData", "web/website") ?? []
    tabs.value = web
})

const saveTreeFn = useThrottleFn(async () => {
    await _agent.call("db.saveData", "web/tree", toRaw(treeState.list))
    console.log("保存成功");
}, 200)
const saveWebsiteFn = useThrottleFn(async () => {
    await _agent.call("db.saveData", "web/website", toRaw(tabs.value))
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
    console.log(tabs.value, curPathRef.value);
    
    if (tabs.value.find(v => v.url === curPathRef.value)) return true
    return false
})
function handleDomReady(curPath: string) {
    curPathRef.value = curPath
}

function handleCollect(curPath: string, websiteInfo: any) {
    dialogState.data = { title: websiteInfo.title, url: curPath }
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
    editIndex: -1,
    data: {
        title: '',
        url: ''
    }
})
function cancelDialog() {
    dialogState.data = { title: '', url: '' }
    dialogState.isShow = false
    dialogState.editIndex = -1
}
function saveDialog() {
    if (dialogState.data.title && dialogState.data.url) {
        if(dialogState.editIndex === -1){
            let fromId = treeState.openKey
            let fromTitle
            if(fromId){
                fromTitle = findByKey(fromId, treeState.list)?.title
            }
            tabs.value.push({
                fromId: fromId,
                fromTitle: fromTitle,
                title: dialogState.data.title,
                url: new URL(dialogState.data.url).href
            })
        }else{
            const item = tabs.value[dialogState.editIndex]
            item.title = dialogState.data.title
            item.url = new URL(dialogState.data.url).href
        }
    }
    dialogState.data = { title: '', url: '' }
    dialogState.editIndex = -1
    dialogState.isShow = false
}

function handleContextMenu(item: ITab, index: number) {
    const menuList = []
    menuList.push({
        label: "编辑",
        click() {
            dialogState.data.title =  tabs.value[index].title
            dialogState.data.url =  tabs.value[index].url
            dialogState.editIndex = index
            dialogState.isShow = true
        },
    })
    menuList.push({
        label: "删除",
        click() {
            tabs.value.splice(index, 1)
        },
    })
    const menu = new PopupMenu(menuList)
    menu.show()
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
            <div @click="treeState.openKey=undefined" class="h-40px flex items-center p-6px cursor-pointer">全部网站</div>
            <Left class="flex-1 h-0" @delete="handleDeleteTree" @change="handleChangeTree"></Left>
        </div>
        <div class="w-250px border-r">
            <div class="border-b h-40px flex items-center p-6px">
                <form class="border py-3px px-6px w-0 rounded-lg flex flex-1 items-center">
                    <input placeholder="输入搜索" class="outline-none flex-1 w-0" type="text">
                </form>
                <div class="ml-6px cursor-pointer" @click="dialogState.isShow = true">新建</div>
            </div>
            <div class="m-6px border rounded-md cursor-pointer flex flex-col" v-for="(item, index) in showUrlList"
                @click="clickURL(item)" :key="index" :title="item.url" @contextmenu="handleContextMenu(item, index)">
                <div class="font-bold h-28px leading-14px border-b p-6px ell">
                    {{ item.title }}
                </div>
                <div class="h-24px text-gray-400 leading-12px p-6px flex-1 h-0 ell">
                    属于：{{ item.fromTitle || '空' }}
                </div>
            </div>
        </div>
        <browser ref="browserRef" :collect="isCollect" class="h-1/1 flex-1 w-0" :url="curUrl?.url"
            @dom-ready="handleDomReady" @collect="handleCollect" @cancel-collect="handleCancelCollect"></browser>
        <rush-dialog v-model:show="dialogState.isShow">
            <div class="bg-light-50 rounded-4px min-w-350px">
                <div class="text-size-20px font-bold p-12px border-b flex items-center">
                    <div class="flex-1 w-0">
                        {{dialogState.editIndex==-1?'新增网站':'编辑网站'}}
                    </div>
                    <button class="delete" @click="dialogState.isShow = false"></button>
                </div>
                <div class="text-size-16px p-12px min-h-80px">
                    <input v-model="dialogState.data.title" spellcheck="false" type="text" class="input is-medium block"
                        placeholder="请输入标题">
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
