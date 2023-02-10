<template>
    <div class="h-1/1 relative flex">
        <aside class="w-300px border-r flex flex-col">
            <Left></Left>
        </aside>
        <aside class="w-300px border-r flex flex-col">
            <div class="flex flex-col h-1/1">
                <form class="h-45px flex items-center border-b px-12px">
                    <input class="flex-1 w-0 mr-6px input" type="text" placeholder="输入搜索">
                    <button type="submit" class="button is-info">搜索</button>
                    <div class="select ml-6px">
                        <select>
                            <option>时间排序</option>
                            <option>标题排序</option>
                        </select>
                    </div>
                </form>
                <div class="px-12px py-8px border-b flex justify-between items-center group">
                    <div>文档文件</div>
                    <button type="submit" class="button is-small is-info opacity-0 group-hover:opacity-100">新建</button>
                </div>
                <div class="flex-1 h-0 overflow-auto">
                    <div class="list">
                        <div class="card m-12px" v-for="i in 2" :key="i">
                            <div class="card-content">
                                <p class="subtitle text-center">
                                    百度
                                </p>
                            </div>
                            <footer class="card-footer">
                                <a href="https://baidu.com" class="card-footer-item">
                                    <span>
                                        View on Twitter
                                    </span>
                                </a>
                                <a href="https://baidu.com" class="card-footer-item">
                                    <span>
                                        View on Twitter
                                    </span>
                                </a>
                                <!-- <p class="card-footer-item">
                                    <span>
                                        Share on <a href="#">Facebook</a>
                                    </span>
                                </p> -->
                            </footer>
                        </div>
                    </div>
                </div>
            </div>
        </aside>
        <main class="flex-1 w-0">
            <Editor :data="data"></Editor>
        </main>
    </div>
</template>

<script lang="ts" setup>
import Left from "./left.vue"
import Editor from "./editor.vue"

const data = reactive({
    key: "1111",
    title: "22",
    desc: "",
    from: "1111",
    fromText: "111",
    files: [{
        title: "aa.ts",
        desc: "",
        content: ""
    }],
})
</script>