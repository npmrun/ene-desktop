<template>
    <div class="h-1/1 relative flex">
        <aside class="w-250px border-r">
            <form class="h-45px flex items-center border-b px-12px">
                <input class="flex-1 w-0 mr-6px input" type="text" placeholder="输入搜索">
                <button type="submit" class="button is-info">搜索</button>
            </form>
            <FileTree ref="filetreeRef" :list="treeList" v-model:activeKeys="state.activeKeys"
                v-model:openKey="state.openKey" v-model:focusKey="state.focusKey" v-model:isFocus="state.isFocus"
                @clickNode="handleClickNode" @contextmenu="handleContextmenu" @rename="handleRename">
            </FileTree>
        </aside>
        <main class="flex-1 w-0">
            {{ treeList }}
        </main>
    </div>
</template>

<script lang="ts" setup>
import { updateCollect } from "@/api/collect";
import { PopupMenu } from "@/bridge/PopupMenu";
import FileTree from "@/page-ui/FileTree/filetree.vue";
import { CollectStore } from '@/store/module/collect';
import { storeToRefs } from 'pinia';
import { INiuTreeData, INiuTreeKey } from "princess-ui";

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

function handleContextmenu(data: INiuTreeData) {
    const menuList: IMenuItemOption[] = []
    menuList.push({
        label: "重命名",
        click() {
            data.isEdit = true
        },
    })
    const menu = new PopupMenu(menuList)
    menu.show()
}

async function handleRename(data: INiuTreeData, done: (status?: boolean) => void) {
    await updateCollect(data.key, {
        title: data.title
    })
    done(true)
}

onBeforeMount(async () => {
    await collectStore.initCollestTree()
    console.log(toRaw(unref(treeList)));
})

</script>