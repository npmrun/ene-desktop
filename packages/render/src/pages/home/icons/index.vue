<template>
    <div class="p-25px h-1/1 overflow-auto scrollbar">
        <div class="mb-10px">推荐1024x1024尺寸的图片,若非如此，则遵循短边全取，长边取中的原则</div>
        <input class="input !w-280px" type="text" v-model="netUrl" placeholder="请输入网络地址">
        <div class="buttons !inline-block ml-6px">
            <button class="button cursor-pointer is-info" @click="ok">确认</button>
            <button class="button cursor-pointer is-info">
                选择文件
                <input class="absolute block inset-0 opacity-0" type="file" @change="chooseFile">
            </button>
        </div>
        <div class="flex items-center control">
            <label class="radio">
                <input type="radio" name="renderType" value="none" style="vertical-align: middle;"
                    v-model="state.renderType">
                <span class="ml-6px" style="vertical-align: middle;">无</span>
            </label>
            <label class="radio">
                <input type="radio" name="renderType" value="circle" style="vertical-align: middle;"
                    v-model="state.renderType">
                <span class="ml-6px" style="vertical-align: middle;">圆形</span>
            </label>
            <label class="radio">
                <input type="radio" name="renderType" value="circle-rect" style="vertical-align: middle;"
                    v-model="state.renderType">
                <span class="ml-6px" style="vertical-align: middle;">圆角矩形</span>
            </label>
            <button class="button cursor-pointer is-info ml-6px" @click="saveAll">保存所有</button>
        </div>
        <h2 class="font-bold text-size-25px my-15px">预览</h2>
        <div class="mt-15px flex items-start pt-10px">
            <div class="canvas-wrapper">
                <canvas class="canvas" ref="previewRef" width="120" height="120" data-width="120" data-height="120"
                    @click="click"></canvas>
            </div>
        </div>
        <h2 class="font-bold text-size-25px my-15px">
            IOS
            <button class="button cursor-pointer is-info ml-6px" @click="saveIos">保存</button>
        </h2>
        <div class="mt-6px tags buttons icon-generate ios">
            <template v-for="(item, index) in iphoneIcons">
                <Tag :src='state.curFile' :render-type="state.renderType" :width="item[0]" :height="item[1]"></Tag>
            </template>
        </div>
        <h2 class="font-bold text-size-25px my-15px">安卓
            <button class="button cursor-pointer is-info ml-6px" @click="saveAndroid">保存</button>
        </h2>
        <div class="mt-6px tags buttons icon-generate android">
            <template v-for="(item, index) in androidIcons">
                <Tag :src='state.curFile' :render-type="state.renderType" :width="item[0]" :height="item[1]"></Tag>
            </template>
        </div>
        <h2 class="font-bold text-size-25px my-15px">自定义
            <button class="button cursor-pointer is-info ml-6px" @click="saveCustom">保存</button>
        </h2>
        <div class="mt-6px tags buttons icon-generate custom">
            <template v-for="(item, index) in customIcons">
                <Tag show-del :render-type="state.renderType" @del="customIcons.splice(index, 1)" :src='state.curFile'
                    :width="item[0]" :height="item[1]"></Tag>
            </template>
            <Add @add="(w: number, h: number) => customIcons.push([w, h])"></Add>
        </div>
    </div>
</template>

<style lang="less" scoped>
.canvas-wrapper {
    margin-bottom: 8px;
    display: inline-block;
    margin-left: 8px;
    position: relative;
}
</style>

<script setup lang="ts">
import { toast } from 'vue3-toastify';
import JSZip from 'jszip';
import Add from './_ui/add.vue';
import Tag from './_ui/tag.vue';
import { clearCanvas, drawCanvas, ExtendHTMLCanvasElement, saveCanvas } from './util';

const state = reactive<{
    curFile?: string,
    renderType: "none" | "circle" | "circle-rect"
}>({
    renderType: "none",
})

const netUrl = ref<string>()
const previewRef = ref()
const iphoneIcons = ref<[number, number][]>([[120, 120], [180, 180], [80, 80], [1024, 1024]])
const androidIcons = ref<[number, number][]>([[72, 72], [96, 96], [144, 144], [192, 192]])
const customIcons = ref<[number, number][]>([])


watchEffect(() => {
    if (state.curFile) {
        clearCanvas(previewRef.value)
        drawCanvas(previewRef.value, state.curFile, state.renderType)
    }
})
watch(() => state.curFile, (newValue, oldValue) => {
    if (oldValue?.startsWith("blob")) {
        URL.revokeObjectURL(oldValue)
    }
}, { immediate: true })
async function ok() {
    if (netUrl.value) {
        state.curFile = netUrl.value // 'https://w.wallhaven.cc/full/m9/wallhaven-m9xyg8.jpg'
    }
}
function chooseFile(e: Event) {
    const inputEl = e.target as HTMLInputElement
    if (inputEl && inputEl.files) {
        const file = inputEl.files[0]
        inputEl.value = ""
        var reader = new FileReader();
        reader.readAsArrayBuffer(file);
        reader.onload = async function (event) {
            if (event.target?.result) {
                let blob = new Blob([event.target.result], { type: file.type });
                const img = URL.createObjectURL(blob)
                state.curFile = img
                clearCanvas(previewRef.value)
                drawCanvas(previewRef.value, state.curFile, state.renderType)
            }
        }
    }
}

function saveCustom() {
    var zip = new JSZip();
    const els = Array.prototype.slice.call(document.querySelectorAll(".custom.icon-generate canvas"), 0)
    for (let i = 0; i < els.length; i++) {
        const canvas = els[i];
        if (!canvas._url) {
            return
        }
        var imgURL = canvas.toDataURL("image/png", 1);
        zip.file(canvas.name + '.png', imgURL.replace(/^data:image\/(png|jpg);base64,/, ""), { base64: true })
    }
    zip.generateAsync({ type: "blob" })
        .then(function (content) {
            var dlLink = document.createElement('a');
            // @ts-ignore
            dlLink.download = "custom-icons";
            dlLink.href = URL.createObjectURL(content);
            document.body.appendChild(dlLink);
            dlLink.click();
            document.body.removeChild(dlLink);
            URL.revokeObjectURL(dlLink.href)
        });
}
function saveAndroid() {
    var zip = new JSZip();
    const els = Array.prototype.slice.call(document.querySelectorAll(".android.icon-generate canvas"), 0)
    for (let i = 0; i < els.length; i++) {
        const canvas = els[i];
        if (!canvas._url) {
            return
        }
        var imgURL = canvas.toDataURL("image/png", 1);
        zip.file(canvas.name + '.png', imgURL.replace(/^data:image\/(png|jpg);base64,/, ""), { base64: true })
    }
    zip.generateAsync({ type: "blob" })
        .then(function (content) {
            var dlLink = document.createElement('a');
            // @ts-ignore
            dlLink.download = "android-icons";
            dlLink.href = URL.createObjectURL(content);
            document.body.appendChild(dlLink);
            dlLink.click();
            document.body.removeChild(dlLink);
            URL.revokeObjectURL(dlLink.href)
        });
}
function saveIos() {
    var zip = new JSZip();
    const els = Array.prototype.slice.call(document.querySelectorAll(".ios.icon-generate canvas"), 0)
    for (let i = 0; i < els.length; i++) {
        const canvas = els[i];
        if (!canvas._url) {
            return
        }
        var imgURL = canvas.toDataURL("image/png", 1);
        zip.file(canvas.name + '.png', imgURL.replace(/^data:image\/(png|jpg);base64,/, ""), { base64: true })
    }
    zip.generateAsync({ type: "blob" })
        .then(function (content) {
            var dlLink = document.createElement('a');
            // @ts-ignore
            dlLink.download = "ios-icons";
            dlLink.href = URL.createObjectURL(content);
            document.body.appendChild(dlLink);
            dlLink.click();
            document.body.removeChild(dlLink);
            URL.revokeObjectURL(dlLink.href)
        });
}

function saveAll() {
    var zip = new JSZip();
    const iosFolder = zip.folder("ios")
    if (iosFolder) {
        const els = Array.prototype.slice.call(document.querySelectorAll(".ios.icon-generate canvas"), 0)
        for (let i = 0; i < els.length; i++) {
            const canvas = els[i];
            if (!canvas._url) {
                return
            }
            var imgURL = canvas.toDataURL("image/png", 1);
            iosFolder.file(canvas.name + '.png', imgURL.replace(/^data:image\/(png|jpg);base64,/, ""), { base64: true })
        }
    }
    const androidFolder = zip.folder("android")
    if (androidFolder) {
        const els = Array.prototype.slice.call(document.querySelectorAll(".android.icon-generate canvas"), 0)
        for (let i = 0; i < els.length; i++) {
            const canvas = els[i];
            if (!canvas._url) {
                return
            }
            var imgURL = canvas.toDataURL("image/png", 1);
            androidFolder.file(canvas.name + '.png', imgURL.replace(/^data:image\/(png|jpg);base64,/, ""), { base64: true })
        }
    }
    const customFolder = zip.folder("custom")
    if (customFolder) {
        const els = Array.prototype.slice.call(document.querySelectorAll(".custom.icon-generate canvas"), 0)
        for (let i = 0; i < els.length; i++) {
            const canvas = els[i];
            if (!canvas._url) {
                return
            }
            var imgURL = canvas.toDataURL("image/png", 1);
            customFolder.file(canvas.name + '.png', imgURL.replace(/^data:image\/(png|jpg);base64,/, ""), { base64: true })
        }
    }

    zip.generateAsync({ type: "blob" })
        .then(function (content) {
            var dlLink = document.createElement('a');
            // @ts-ignore
            dlLink.download = "all-icons";
            dlLink.href = URL.createObjectURL(content);
            document.body.appendChild(dlLink);
            dlLink.click();
            document.body.removeChild(dlLink);
            URL.revokeObjectURL(dlLink.href)
        });
}
function click(e: MouseEvent) {
    const canvas = e.target as ExtendHTMLCanvasElement
    saveCanvas(canvas)
}
</script>
