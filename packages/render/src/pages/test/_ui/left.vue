<template>
    <div class="h-1/1 overflow-hidden flex flex-col relative bg-light-600">
        <div class="flex-1 pb-8px overflow-auto scrollbar" @contextmenu="onGlobalContextmenu">
            <filetree ref="filetreeRef" @change="onChonge" @clickNode="handleClickNode" :list="state.list" @contextmenu="onContextmenu"
                v-model:activeKeys="state.activeKeys" v-model:openKey="state.openKey" v-model:focusKey="state.focusKey"
                v-model:isFocus="state.isFocus" @rename="handleRename" @create-one="handleCreateOne">
            </filetree>
        </div>
        <slot></slot>
    </div>
</template>
<script lang="ts" setup>
import { PopupMenu } from "@/bridge/PopupMenu"
import { convert, findByKey, INiuTreeData, removeByKey } from "princess-ui";
import { v4 } from "uuid";
import { IState } from "../token"
import filetree from "../_components/filetree.vue"

const filetreeRef = ref<InstanceType<typeof filetree>>()

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
        {
            label: "新建文件",
            click() {
                state.list?.push(
                    convert({
                        key: v4(),
                        title: "",
                        isNew: true,
                        isEdit: true,
                    }),
                )
                resetKeys()
            },
        }
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
        menuList.push({
            label: "新建文件",
            click() {
                data.isFolder && (data.isExpand = true)
                data.children?.push(
                    convert({
                        key: v4(),
                        title: "",
                        isNew: true,
                        isEdit: true,
                    }),
                )
                resetKeys()
            },
        })
    }
    menuList.push({
        label: "删除",
        click() {
            if(state.activeKeys.includes(data.key)){
                filetreeRef.value?.delArray(state.activeKeys)
            }else{
                removeByKey(data.key, state.list)
            }
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
const emit = defineEmits<{
    (ev: "change"): void
}>()
function onChonge() {
    emit("change")
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

const state = inject(IState, { list: [], activeKeys: [] })

</script>

<style lang="less" scoped>
</style>
