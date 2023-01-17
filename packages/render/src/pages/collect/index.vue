<template>
    <div class="h-1/1 relative flex">
        <aside class="w-250px border-r flex flex-col">
            <form class="h-45px flex items-center border-b px-12px">
                <input class="flex-1 w-0 mr-6px input" type="text" placeholder="输入搜索">
                <button type="submit" class="button is-info">搜索</button>
            </form>
            <div class="flex-1 h-0" @contextmenu="handleGlobalContextmenu">
                <FileTree :dropFn="handleDropFn" ref="filetreeRef" :list="treeList" v-model:activeKeys="state.activeKeys"
                    v-model:openKey="state.openKey" v-model:focusKey="state.focusKey" v-model:isFocus="state.isFocus"
                    @clickNode="handleClickNode" @contextmenu="handleContextmenu" @rename="handleRename"
                    @createOne="handleCreateOne" @expand="handleExpand">
                </FileTree>
            </div>
        </aside>
        <main class="flex-1 w-0">
            {{ treeList }}
        </main>
    </div>
</template>

<script lang="ts" setup>
import { addCollect, removeColletTree, updateCollect } from "@/api/collect";
import { PopupMenu } from "@/bridge/PopupMenu";
import FileTree from "@/page-ui/FileTree/filetree.vue";
import { CollectStore } from '@/store/module/collect';
import { storeToRefs } from 'pinia';
import { convert, ENiuTreeStatus, INiuTreeData, INiuTreeKey } from "princess-ui";
import { v4 } from "uuid";

/**
 * 删除时需要删除子项，需要保证原子性
 */

const collectStore = CollectStore()
const filetreeRef = ref<InstanceType<typeof FileTree>>()

const { treeList } = storeToRefs(collectStore)
type TState = {
    activeKeys: INiuTreeKey[],
    openKey?: INiuTreeKey,
    focusKey?: INiuTreeKey,
    isFocus?: boolean,
}
let state = reactive<TState>({
    activeKeys: [],
})

function handleClickNode(data: INiuTreeData) {
    state.openKey = data.key
    state.activeKeys = [data.key]
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
        },
    })
    const menu = new PopupMenu(menuList)
    menu.show()
}

async function handleDropFn(type: ENiuTreeStatus, data: INiuTreeData, targetData: INiuTreeData) {
    if(type === ENiuTreeStatus.DragDown){
        await updateCollect(data.key, {
            // @ts-ignore
            parentKey: targetData?.parentKey
        })
        return true
    }
    if(type === ENiuTreeStatus.DragIn){
        await updateCollect(data.key, {
            // @ts-ignore
            parentKey: targetData?.key
        })
        return true
    }
    if(type === ENiuTreeStatus.DragUp){
        await updateCollect(data.key, {
            // @ts-ignore
            parentKey: targetData?.parentKey
        })
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
        done(true)
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
})

</script>