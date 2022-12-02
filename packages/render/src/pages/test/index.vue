<template>
    <div class="h-1/1 flex">
        <div class="h-1/1 w-250px min-w-100px relative border-r">
            <Left @change="onChange"></Left>
        </div>
        <div class="select-auto flex-1 w-0">
            {{ state.list }}
        </div>
    </div>
</template>

<script lang="ts">
export default defineComponent({
    name: "test"
})
</script>

<route lang="yaml">
name: test
meta:
    cache: true
</route>

<script lang="ts" setup>
import { stat } from 'fs';
import { toast } from 'vue3-toastify';
import { IState, TState } from './token';
import Left from './_ui/left.vue';


let state = reactive<TState>({
    activeKeys: [],
    openKey: undefined,
    list: []
})

onBeforeMount(async ()=>{
    const data = await _agent.call('db.getData', "urls") ?? {
        activeKeys: [],
        openKey: undefined,
        list: []
    }
    state = Object.assign(state, data)
})

async function onChange() {
    try {
        await _agent.call('db.saveData', "urls", toRaw(state))
    } catch (error) {
        console.error(error);
        toast("保存失败")
    }
}

provide(IState, state)
</script>
