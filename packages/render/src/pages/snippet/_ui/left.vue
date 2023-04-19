<template>
    <LoadView class="flex-1 h-0" v-bind="loadViewState">
        <div class="h-1/1" @contextmenu="handleGlobalContextmenu">
            <FileTree
                @itemDragover="onDragover"
                @itemDragleave="onDragleave"
                @itemDrop="onDrop"
                :dropFn="handleDropFn"
                ref="filetreeRef"
                :list="treeList"
                v-model:activeKeys="SnippetStore.treeState.activeKeys"
                v-model:openKey="SnippetStore.treeState.openKey"
                v-model:focusKey="SnippetStore.treeState.focusKey"
                v-model:isFocus="SnippetStore.treeState.isFocus"
                @clickNode="handleClickNode"
                @contextmenu="handleContextmenu"
                @rename="handleRename"
                @createOne="handleCreateOne"
                @expand="handleExpand"
            ></FileTree>
        </div>
    </LoadView>
</template>

<script lang="ts" setup>
import LoadView from "@/page-ui/LoadView/LoadView.vue"
// import { addCollect, removeColletTree, updateCollect } from "@/api/collect"
import { addData, searchDataByKey, updateData } from "@/api/db/data"
import { PopupMenu } from "@/bridge/PopupMenu"
import FileTree from "@/page-ui/FileTree/filetree.vue"
import { useSnippetStore, ISnip } from "@/store/module/snippet"
import { storeToRefs } from "pinia"
import { convert, ENiuTreeStatus, INiuTreeData, INiuTreeKey } from "princess-ui"
import { v4 } from "uuid"
import { toast } from "vue3-toastify"
import { findNextNodes, findPath, findPreNode } from "@common/util/treeHelper"
import { addOneSnippetFolder, updateOneSnippetFolder } from "@/api/snippet/data"

/**
 * 删除时需要删除子项，需要保证原子性
 */

const loadViewState = reactive({
    loading: false,
    error: false,
    empty: false,
    retry: undefined,
})
const SnippetStore = useSnippetStore()
const filetreeRef = ref<InstanceType<typeof FileTree>>()

function onDragover(ev: DragEvent, active: (status: boolean) => void, data: INiuTreeData) {
    active(true)
}

function onDragleave(ev: DragEvent, active: (status: boolean) => void, data: INiuTreeData) {
    active(false)
}

async function onDrop(ev: DragEvent, active: (status: boolean) => void, data: INiuTreeData) {
    active(false)
}

const { treeList } = storeToRefs(SnippetStore)
const router = useRouter()
function handleClickNode(data: INiuTreeData) {
    router.replace("/snippet/" + data.key)
}

function handleGlobalContextmenu() {
    const menuList: IMenuItemOption[] = []
    menuList.push({
        label: "新建文件夹",
        click() {
            treeList.value.push(
                convert({
                    key: v4(),
                    title: "",
                    isNew: true,
                    isEdit: true,
                    isExpand: true,
                    children: [],
                }),
            )
        },
    })
    const menu = new PopupMenu(menuList)
    menu.show()
}

function handleContextmenu(data: INiuTreeData) {
    const menuList: IMenuItemOption[] = []
    menuList.push({
        label: "重命名",
        click() {
            data.isEdit = true
        },
    })
    menuList.push({
        label: "新建文件夹",
        click() {
            data.isFolder && (data.isExpand = true)
            data.children?.push(
                convert({
                    key: v4(),
                    title: "",
                    isNew: true,
                    isEdit: true,
                    children: [],
                }),
            )
        },
    })
    menuList.push({
        label: "清空",
        async click() {},
    })
    menuList.push({
        label: "删除",
        async click() {
            const answer = await _agent.call("dialog.confrim", { title: "是否删除", message: "是否删除" })
            if (answer) {
                // 删除数据库中的数据
                // const array = await removeColletTree(data.key)
                // 更新视图中的数据
                // filetreeRef.value?.delArray(array)
            }
        },
    })
    const menu = new PopupMenu(menuList)
    menu.show()
}

async function handleDropFn(type: ENiuTreeStatus, data: INiuTreeData, targetData: INiuTreeData) {
    if (type === ENiuTreeStatus.DragDown) {
        // const list = findNextNodes(treeList.value, (node)=>{
        //     return node.key === targetData.key
        // }, { id: "key", pid: "parentKey" }).filter((v: INiuTreeData)=>v.key !== data.key)
        // await updateOrder(data.key, list.map((v: any)=>v.key), targetData.order ?? 0)
        return true
    }
    if (type === ENiuTreeStatus.DragIn && targetData.key) {
        // await updateOneSnippetFolder(data.key, {
        //     parentKey: targetData.key,
        //     order: (targetData?.children?.slice(-1)[0]?.order ?? -1) + 1
        // })
        return true
    }
    if (type === ENiuTreeStatus.DragUp) {
        // const list = findNextNodes(treeList.value, (node)=>{
        //     return node.key === targetData.key
        // }, { id: "key", pid: "parentKey" }).filter((v: INiuTreeData)=>v.key !== data.key)
        // await updateOrder(data.key, list.map((v: any)=>v.key), targetData.order ?? 0, "up")
        return true
    }
    return false
}

async function handleCreateOne(data: INiuTreeData, parent: INiuTreeData, done: (status?: boolean) => void) {
    try {
        // let order = parent?.children?.length ?? 0
        // await addOneSnippetFolder({
        //     key: data.key,
        //     parentKey: parent?.key,
        //     title: data.title,
        //     order,
        //     isExpand: true
        // })
        done(true)
        SnippetStore.treeState.openKey = data.key
        SnippetStore.treeState.activeKeys = [data.key]
    } catch (error) {
        console.error(error)
        done(false)
    }
}

async function handleExpand(data: INiuTreeData) {
    try {
        // await updateCollect(data.key, {
        //     isExpand: data.isExpand,
        // })
    } catch (error) {
        console.error(error)
        data.isExpand = !data.isExpand
    }
}

async function handleRename(data: INiuTreeData, done: (status?: boolean) => void) {
    try {
        done(true)
    } catch (error) {
        console.error(error)
        done(false)
    }
}
async function saveTreeState() {
    try {
        const isHave = await searchDataByKey("folder_state")
        if (isHave) {
            updateData("folder_state", {
                value: JSON.stringify(toRaw(SnippetStore.treeState)),
                desc: "保存树形状态",
            })
        } else {
            addData({
                key: "folder_state",
                value: JSON.stringify(toRaw(SnippetStore.treeState)),
                desc: "保存树形状态",
            })
        }
    } catch (error) {
        toast.error("保存树形状态失败！！！")
        console.error(error)
    }
}
onBeforeMount(async () => {
    try {
        loadViewState.loading = true
        const data = await searchDataByKey("tree_state")
        if (data && data.value) {
            const _data = JSON.parse(data.value)
            SnippetStore.treeState = Object.assign(SnippetStore.treeState, _data)
        }
        await SnippetStore.getSnippetFolder()
        if (treeList.value.length && SnippetStore.treeState.openKey) {
            const array = findPath(treeList.value, (node: INiuTreeData) => {
                return node.key === SnippetStore.treeState.openKey
            })
            if (array) {
                array.slice(0, -1).forEach((node: INiuTreeData) => {
                    node.isExpand = true
                })
            }
        }
        watch(
            () => SnippetStore.treeState.openKey,
            () => {
                saveTreeState()
            },
            { deep: true },
        )
        watchEffect(() => {
            if (!!treeList.value.length) {
                loadViewState.empty = false
            } else {
                loadViewState.empty = true
            }
        })
        loadViewState.loading = false
        loadViewState.error = false
    } catch (error) {
        loadViewState.loading = false
        loadViewState.error = true
    }
})
</script>
