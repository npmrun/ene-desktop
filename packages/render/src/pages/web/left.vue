<script lang="ts" setup>
import { PopupMenu } from "@/bridge/PopupMenu";
import FileTree from "@/page-ui/FileTree/filetree.vue";
import { convert, INiuTreeData, INiuTreeKey, removeByKey } from 'princess-ui';
import { v4 } from "uuid";
import { IState, TState } from "./token"

const emit = defineEmits<{
    (ev: "change"): void
    (ev: "delete", data: INiuTreeKey): void
}>()

const state = inject(IState) as TState
const filetreeRef = ref<InstanceType<typeof FileTree>>()

function resetKeys() {
    state.activeKeys = state.activeKeys.filter(v => v === state.openKey)
}

function onGlobalContextmenu(e: MouseEvent) {
    e.stopPropagation()
    const menuList: IMenuItemOption[] = [
        {
            label: "新建文件夹",
            click() {
                state.list?.push(
                    convert({
                        key: v4(),
                        title: "",
                        isNew: true,
                        isEdit: true,
                        children: [],
                    }),
                )
                resetKeys()
            },
        },
    ]
    const menu = new PopupMenu(menuList)
    menu.show()
}
function onContextmenu(data: INiuTreeData) {
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
                resetKeys()
            },
        })
    }
    menuList.push({
        label: "删除",
        click() {
            if (state.activeKeys.includes(data.key)) {
                filetreeRef.value?.delArray(state.activeKeys)
            } else {
                removeByKey(data.key, state.list)
            }
            emit("delete", data.key)
            // if(!!state.activeKeys.length){
            //     filetreeRef.value?.delArray(state.activeKeys)
            // }else{
            //     removeByKey(data.key, state.list)
            // }
        },
    })
    const menu = new PopupMenu(menuList)
    menu.show()
}
function handleClickNode(data: INiuTreeData) {
    state.openKey = data.key
    state.activeKeys = [data.key]
    emit("change")
}
async function handleRename(data: INiuTreeData, done: (status?: boolean) => void) {
    done(true)
}
async function handleCreateOne(data: INiuTreeData, parent: INiuTreeData | undefined, done: (status: boolean) => void) {
    state.isFocus = true
    state.openKey = data.key
    state.activeKeys = [data.key]
    done(true)
}

function log(e: any) {
    console.log(e);
    
}
</script>

<template>
    <div class="h-1/1 overflow-hidden flex flex-col relative bg-light-600">
        <div class="flex-1 pb-8px overflow-auto scrollbar" @contextmenu="onGlobalContextmenu">
            <FileTree ref="filetreeRef" :list="state.list" @change="emit('change')" @clickNode="handleClickNode"
                @contextmenu="onContextmenu" v-model:activeKeys="state.activeKeys" v-model:openKey="state.openKey"
                v-model:focusKey="state.focusKey" v-model:isFocus="state.isFocus" @rename="handleRename"
                @create-one="handleCreateOne">
                <!-- <template #default="{data}">
                    <div
                        class="text-size-12px group-hover:block hidden p-6px hover:bg-gray-200 active:bg-gray-300 rounded-sm" @click="log(data)">
                        编辑</div>
                </template> -->
            </FileTree>
        </div>
        <slot></slot>
    </div>
</template>


