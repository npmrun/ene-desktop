<template>
    <fieldset>
        <legend>Add new friend</legend>
        <label>
            id:
            <input v-model="idd" type="text" />
        </label>
        <br />
        <label>
            Name:
            <input v-model="friendName" type="text" />
        </label>
        <br />
        <label>
            Age:
            <input v-model="friendAge" type="number" />
        </label>
        <br />
        <button @click="addFriend">Add Friend</button>
        <button @click="getData">getData</button>
        <p>{{ status }}</p>
    </fieldset>
</template>

<script lang="ts">
import { addCollect, getCollectTree, searchCollectByKey } from '@/api/collect';

export default defineComponent({
    name: 'FriendAdder',
    props: {
        defaultAge: {
            type: Number,
            default: 21,
        },
    },
    data() {
        return {
            status: '',
            idd: 0,
            friendName: '',
            friendAge: this.defaultAge,
        };
    },
    async mounted(){
        console.log(await searchCollectByKey("aaaa"));
    },
    methods: {
        async getData() {
            const data = await getCollectTree()
            console.log(JSON.stringify(data, null, 2));
        },
        async addFriend() {
            try {
                const id = await addCollect({
                    key: "dddd",
                    parentKey: "bbbb",
                    title: "asdadas"
                });
            } catch (error) {
                console.error(error);
            }
        },
    },
})
</script>
