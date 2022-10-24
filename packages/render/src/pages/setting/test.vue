<template>
    <div class="w-80/100 mx-auto mt-25px p-8px pt-55px pb-80px overflow-auto">
        <div class="mb-35px">
            <div class="text-size-20px font-bold">更新仓库作者</div>
            <div class="text-gray-400 pt-8px">更新仓库作者</div>
            <div class="pt-8px">
                <input spellcheck="false" :value="configStore['update.owner']"
                    @change="(e: any) => configStore.setUpdateOwner(e.target.value)"
                    class="input is-medium !max-w-320px !min-w-320px" type="text" placeholder="请输入更新仓库作者">
            </div>
        </div>
        <div class="mb-35px">
            <div class="text-size-20px font-bold">更新仓库</div>
            <div class="text-gray-400 pt-8px">更新仓库</div>
            <div class="pt-8px">
                <input spellcheck="false" :value="configStore['update.repo']"
                    @change="(e: any) => configStore.setUpdateRepo(e.target.value)"
                    class="input is-medium !max-w-320px !min-w-320px" type="text" placeholder="请输入更新仓库">
            </div>
        </div>
    </div>
</template>


<script lang="ts" setup>
import ConfigStore from "@/store/module/config"

const configStore = ConfigStore()
</script>
