<template>
    <div class="h-1/1 relative flex">
        <aside class="w-300px border-r flex flex-col">
            <Left></Left>
        </aside>
        <aside class="w-300px border-r flex flex-col">
            <Docs></Docs>
        </aside>
        <main class="flex-1 w-0">
            <Editor v-model:is-same="isSame" v-if="!!activeData" :data="activeData" @save="handleSave"></Editor>
        </main>
    </div>
</template>

<script lang="ts" setup>
import Left from "./left.vue"
import Docs from "./docs.vue"
import Editor from "./editor.vue"
import { CollectStore, ISnip } from "@/store/module/collect";
import { clone } from "lodash";
import { addSnipCode, updateSnipCode } from "@/api/collect/snip";
import { toast } from "vue3-toastify";

const collectStore = CollectStore()
const isSame = ref(true)
const { activeData } = storeToRefs(collectStore)

async function handleSave(snip: ISnip, ok?:()=>void) {
    try {
        await collectStore.modifySnip(snip, collectStore.activeData!.files)
        // toast.success("保存成功")
        ok?.()
    } catch (error) {
        toast.success("保存失败")
        throw error
    }
}
</script>