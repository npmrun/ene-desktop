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
import { db } from '@/api/db';

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
    methods: {
        async getData() {
            // const data = await db.folder.get(1)
            // console.log(data);
        },
        async addFriend() {
            try {
                // const id = await db.folder.add({
                //     key: "aaaaas",
                //     title: "ffffff",
                // });
            } catch (error) {
                this.status = `Failed to add ${this.friendName}: ${error}`;
            }
        },
    },
})
</script>
