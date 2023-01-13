<template>
    <div>
        <input v-model="state.key" class="input" type="text" placeholder="Text key">
        <input v-model="state.parentKey" class="input" type="text" placeholder="Text parentKey">
        <input v-model="state.title" class="input" type="text" placeholder="Text title">
        <button class="button" @click="addData">增</button>
        <button class="button" @click="getData">删</button>
        <button class="button" @click="getData">该</button>
        <button class="button" @click="getData">查</button>
    </div>
</template>

<script lang="ts" setup>
import { addCollect, getCollectTree, searchCollectByKey } from '@/api/collect';
import { convertTreeData } from 'princess-ui';

let state = reactive({
    key: "",
    parentKey: undefined,
    title: ''
})

async function getData() {
    const data = await getCollectTree()
    console.log(convertTreeData(data));
}

async function addData() {
    addCollect({
        key: state.key,
        parentKey: state.parentKey,
        title: state.title
    })
    state = Object.assign(state, {
        key: "",
        parentKey: '',
        title: ''
    })
}


</script>
