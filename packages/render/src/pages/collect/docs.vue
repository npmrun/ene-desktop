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

function handleItemContext(item: ISnip, index: number) {
    const menus = new PopupMenu([
        {
            label: "删除",
            async click() {
                if(item.title == '未命名' && item.desc == '' && item.files.length == 0){
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
        event.dataTransfer.setData("index", index+'')
    }
}

</script>

<template>
    <div class="flex flex-col h-1/1">
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
        <div class="px-12px py-8px border-b flex justify-between items-center">
            <div>文档文件</div>
            <button type="submit" class="button is-small is-info" @click="handleNew">新建</button>
        </div>
        <div class="flex-1 h-0 overflow-auto">
            <div class="list">
                <div draggable="true" :class="collectStore.dataState.openKey === item.key ? 'active' : ''" @click="handleClick(item, index)"
                    @contextmenu="handleItemContext(item, index)" v-for="(item, index) in dataList"
                    class="m-10px border cursor-pointer rounded-5px" @dragstart="onDragStart($event, item, index)">
                    <div
                        class="font-bold px-8px py-6px !text-size-18px border-b whitespace-nowrap overflow-hidden overflow-ellipsis">
                        {{ item.title }}</div>
                    <div class="px-8px py-6px h-40px overflow-hidden">
                        {{ item.desc }}
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="less" scoped>
.active {
    border-color: #3e8ed0;

    div {
        border-color: #3e8ed0;
    }
}</style>