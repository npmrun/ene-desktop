<template>
    <div class="flex flex-col h-1/1">
        <form class="h-45px flex items-center border-b px-12px">
            <input class="flex-1 w-0 mr-6px input" type="text" placeholder="输入搜索">
            <button type="submit" class="button is-info">搜索</button>
        </form>
        <div class="px-12px py-8px border-b flex justify-between items-center group">
            <div>树文件夹</div>
            <button type="submit" class="button is-small is-info opacity-0 group-hover:opacity-100"
                @click="handleNewFolder">新建</button>
        </div>
        <div class="flex-1 h-0" @contextmenu="handleGlobalContextmenu">
            <FileTree :dropFn="handleDropFn" ref="filetreeRef" :list="treeList"
                v-model:activeKeys="collectStore.treeState.activeKeys" v-model:openKey="collectStore.treeState.openKey"
                v-model:focusKey="collectStore.treeState.focusKey" v-model:isFocus="collectStore.treeState.isFocus"
                @clickNode="handleClickNode" @contextmenu="handleContextmenu" @rename="handleRename"
                @createOne="handleCreateOne" @expand="handleExpand">
            </FileTree>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { addCollect, removeColletTree, updateCollect } from "@/api/collect";
import { addData, searchDataByKey, updateData } from "@/api/collect/data";
import { PopupMenu } from "@/bridge/PopupMenu";
import FileTree from "@/page-ui/FileTree/filetree.vue";
import { CollectStore } from '@/store/module/collect';
import { storeToRefs } from 'pinia';
import { convert, ENiuTreeStatus, INiuTreeData, INiuTreeKey } from "princess-ui";
import { v4 } from "uuid";
import { toast } from "vue3-toastify";
import { findPath, treeMap } from "@common/util/treeHelper";

/**
 * 删除时需要删除子项，需要保证原子性
 */

const collectStore = CollectStore()
const filetreeRef = ref<InstanceType<typeof FileTree>>()

function handleNewFolder() {
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
}

const { treeList } = storeToRefs(collectStore)

function handleClickNode(data: INiuTreeData) {
    collectStore.treeState.openKey = data.key
    collectStore.treeState.activeKeys = [data.key]
}

async function saveTreeState() {
    try {
        const isHave = await searchDataByKey("tree_state")
        if (isHave) {
            updateData("tree_state", {
                value: JSON.stringify(toRaw(collectStore.treeState)),
                desc: "保存树形状态"
            })
        } else {
            addData({
                key: "tree_state",
                value: JSON.stringify(toRaw(collectStore.treeState)),
                desc: "保存树形状态"
            })
        }
    } catch (error) {
        toast.error("保存树形状态失败！！！")
        console.error(error);
    }
}
async function saveTreeStruct() {
    const json = treeMap(treeList.value, {
        conversion(node: INiuTreeData) {
            return { key: node.key }
        }
    })
    try {
        const isHave = await searchDataByKey("tree_order")
        if (isHave) {
            updateData("tree_order", {
                value: JSON.stringify(json),
                desc: "保存树形结构"
            })
        } else {
            addData({
                key: "tree_order",
                value: JSON.stringify(json),
                desc: "保存树形结构"
            })
        }
    } catch (error) {
        toast.error("保存树形结构失败！！！")
        console.error(error);
    }
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
    if (data.isFolder) {
        menuList.push({
            label: "新建文件夹",
            click() {
                data.isFolder && (data.isExpand = true)
                data.children?.push(
                    convert({
                        key: v4(),
                        title: "",
                        order: 0,
                        isNew: true,
                        isEdit: true,
                        children: [],
                    }),
                )
            },
        })
    }
    menuList.push({
        label: "删除",
        async click() {
            // 删除数据库中的数据
            const array = await removeColletTree(data.key)
            // 更新视图中的数据
            filetreeRef.value?.delArray(array)
            saveTreeStruct()
        },
    })
    const menu = new PopupMenu(menuList)
    menu.show()
}

async function handleDropFn(type: ENiuTreeStatus, data: INiuTreeData, targetData: INiuTreeData) {
    if (type === ENiuTreeStatus.DragDown) {
        // await updateCollect(data.key, {
        //     parentKey: targetData?.parentKey
        // })
        setTimeout(() => {
            saveTreeStruct()
        }, 0);
        return true
    }
    if (type === ENiuTreeStatus.DragIn && targetData.key) {
        await updateCollect(data.key, {
            parentKey: targetData.key
        })
        setTimeout(() => {
            saveTreeStruct()
        }, 0);
        return true
    }
    if (type === ENiuTreeStatus.DragUp) {
        // await updateCollect(data.key, {
        //     // @ts-ignore
        //     parentKey: targetData?.parentKey
        // })
        setTimeout(() => {
            saveTreeStruct()
        }, 0);
        return true
    }
    return false
}

async function handleCreateOne(data: INiuTreeData, parent: INiuTreeData, done: (status?: boolean) => void) {
    try {
        await addCollect({
            key: data.key,
            parentKey: parent?.key,
            title: data.title,
            isExpand: true
        })
        saveTreeStruct()
        done(true)
        collectStore.treeState.openKey = data.key
        collectStore.treeState.activeKeys = [data.key]
    } catch (error) {
        console.error(error);
        done(false)
    }
}

async function handleExpand(data: INiuTreeData) {
    try {
        await updateCollect(data.key, {
            isExpand: data.isExpand
        })
    } catch (error) {
        console.error(error);
        data.isExpand = !data.isExpand
    }
}

async function handleRename(data: INiuTreeData, done: (status?: boolean) => void) {
    try {
        await updateCollect(data.key, {
            title: data.title
        })
        done(true)
    } catch (error) {
        console.error(error);
        done(false)
    }
}

onBeforeMount(async () => {
    await collectStore.initCollestTree()
    console.log(toRaw(unref(treeList)));
    const data = await searchDataByKey("tree_state")
    if (data && data.value) {
        const _data = JSON.parse(data.value)
        collectStore.treeState = Object.assign(collectStore.treeState, _data)
        const array = findPath(treeList.value, (node: INiuTreeData) => {
            return node.key === collectStore.treeState.openKey
        })
        if (array) {
            array.slice(0, -1).forEach((node: INiuTreeData) => {
                node.isExpand = true
            });
        }
    }
    watch(() => collectStore.treeState, () => {
        saveTreeState()
    }, { deep: true })
})

</script>