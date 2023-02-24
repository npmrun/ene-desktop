<script lang="ts" setup>
import { addData, searchDataByKey, updateData } from '@/api/collect/data';
import { addSnip } from '@/api/collect/snip';
import { PopupMenu } from '@/bridge/PopupMenu';
import { CollectStore, ISnip } from '@/store/module/collect';
import { toast } from 'vue3-toastify';

const collectStore = CollectStore()
async function handleNew() {
    await collectStore.createOneSnip()
    if (collectStore.treeState.openKey) {
        collectStore.getSnips(collectStore.treeState.openKey)
    } else {
        collectStore.getSnips()
    }
}

async function saveDataState() {
    try {
        const isHave = await searchDataByKey("snip_state")
        if (isHave) {
            updateData("snip_state", {
                value: JSON.stringify(toRaw(collectStore.dataState)),
                desc: "保存文档形态"
            })
        } else {
            addData({
                key: "snip_state",
                value: JSON.stringify(toRaw(collectStore.dataState)),
                desc: "保存文档形态"
            })
        }
    } catch (error) {
        toast.error("保存文档状态失败！！！")
        console.error(error);
    }
}

onBeforeMount(async () => {
    const data = await searchDataByKey("snip_state")
    if (data && data.value) {
        const _data = JSON.parse(data.value)
        collectStore.dataState = Object.assign(collectStore.dataState, _data)
    }
    watch(() => collectStore.treeState.openKey, () => {
        if (collectStore.treeState.openKey) {
            collectStore.getSnips(collectStore.treeState.openKey)
        } else {
            collectStore.getSnips()
        }
    })
    watch(() => collectStore.dataState, () => {
        saveDataState()
    }, { deep: true })
})

const { dataList } = storeToRefs(collectStore)

function handleClick(item: ISnip, index: number) {
    collectStore.setActiveSnip(item.key)
}
function handleGlobalContextMenu() {
    const menus = new PopupMenu([
        {
            label: "清空",
            async click() {
                handleClear()
            }
        }
    ])
    menus.show()
}

async function handleClear() {
    if(!collectStore.dataList.length){
        toast("无东西清空")
        return
    }
    const answer = await _agent.call("dialog.confrim", { title: "是否清空该文档", message: "是否清空该文档" })
    if (answer) {
        const keys = collectStore.dataList.map(v => v.key)
        await collectStore.removeOneSnips(keys)
        collectStore.dataList = []
        toast.success("清除成功")
    }
}

function handleItemContext(item: ISnip, index: number) {
    const menus = new PopupMenu([
        {
            label: "查看",
            click(){
                collectStore.setActiveSnip(item.key)
            }
        },
        {
            label: "删除",
            async click() {
                if (item.title == '未命名' && item.desc == '' && item.files.length == 0) {
                    collectStore.removeOneSnip(item.key, index)
                    toast.success("删除成功")
                    return
                }
                const answer = await _agent.call("dialog.confrim", { title: "是否删除该文档", message: "是否删除该文档" })
                if (answer) {
                    collectStore.removeOneSnip(item.key, index)
                    toast.success("删除成功")
                }
            }
        }
    ])
    menus.show()
}

function onDragStart(event: DragEvent, data: ISnip, index: number) {
    if (event.dataTransfer) {
        event.dataTransfer.dropEffect = "move"
        event.dataTransfer.effectAllowed = "move"
        event.dataTransfer.setData("data", JSON.stringify(data))
        event.dataTransfer.setData("index", index + '')
    }
}

</script>

<template>
    <div class="flex flex-col h-1/1" @contextmenu="handleGlobalContextMenu">
        <!-- <form class="h-45px flex items-center border-b px-12px">
                        <input class="flex-1 w-0 mr-6px input" type="text" placeholder="输入搜索">
                        <button type="submit" class="button is-info">搜索</button>
                        <div class="select ml-6px">
                            <select>
                                <option>时间排序</option>
                                <option>标题排序</option>
                            </select>
                        </div>
                    </form> -->
        <div class="px-12px py-8px border-b flex items-center">
            <div class="flex-1 w-0">文档文件</div>
            <button class="button is-small is-info mr-6px" @click="handleClear">清空</button>
            <button class="button is-small is-info" @click="handleNew">新建</button>
        </div>
        <div class="flex-1 h-0 overflow-auto">
            <div class="list">
                <div draggable="true" :class="collectStore.dataState.openKey === item.key ? 'active' : ''"
                    @click="handleClick(item, index)" @contextmenu.stop="handleItemContext(item, index)"
                    v-for="(item, index) in dataList" class="cursor-pointer py-5px border-b"
                    @dragstart="onDragStart($event, item, index)">
                    <div
                        class="font-bold px-8px py-2px !text-size-18px whitespace-nowrap overflow-hidden overflow-ellipsis">
                        {{ item.title }}</div>
                    <div class="px-8px text-gray-400 h-20px py-2px whitespace-nowrap overflow-hidden overflow-ellipsis">
                        {{ item.desc }}
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="less" scoped>
.active {
    background-color: rgb(235, 235, 235);
}
</style>