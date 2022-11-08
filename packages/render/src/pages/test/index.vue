<template>
    <div class="h-1/1 flex">
        <div class="h-1/1 w-250px min-w-100px relative border-r">
            <Left></Left>
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
import { IState, TState } from './token';
import Left from './_ui/left.vue';


const state = reactive<TState>({
    activeKeys: [],
    openKey: undefined,
    list: [
        {
            "key": "0f681a4e-2004-40cf-ae72-2f7f410cb6c8",
            "title": "asd",
            "isNew": false,
            "isEdit": false,
            "isFolder": false,
            "isExpand": false,
            "isFile": true
        }
    ]
})

provide(IState, state)
</script>