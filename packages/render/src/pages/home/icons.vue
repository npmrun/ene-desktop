<template>
    <div class="icon-generate p-25px h-1/1 overflow-auto scrollbar">
        <div class="mb-10px">推荐1024x1024尺寸的图片,若非如此，则遵循短边全取，长边取中的原则</div>
        <input class="input !w-280px" type="text" v-model="netUrl" placeholder="请输入网络地址">
        <div class="buttons !inline-block ml-6px">
            <button class="button cursor-pointer is-info" @click="ok">确认</button>
            <button class="button cursor-pointer is-info">
                选择文件
                <input class="absolute block inset-0 opacity-0" type="file" @change="chooseFile">
            </button>
            <button class="button cursor-pointer is-info" @click="saveAll">保存所有</button>
            <button class="button cursor-pointer is-info" @click="reset">重置</button>
        </div>
        <div class="flex items-center">
            <input type="number" class="input !w-80px" v-model="aNum" placeholder="宽度">
            <span class="mx-6px">=</span>
            <input type="number" class="input !w-80px" v-model="bNum" placeholder="高度">
            <button class="button cursor-pointer is-info ml-6px" @click="add">添加</button>
        </div>
        <div class="mt-6px tags">
            <span class="tag is-warning is-medium" v-for="(item, index) in rArray">
                {{ item[0] }}x{{ item[1] }}
                <button class="delete is-small" @click="remove(index)"></button>
            </span>
        </div>
        <!-- https://blog.csdn.net/weixin_44670249/article/details/116790296?spm=1001.2101.3001.6650.5&utm_medium=distribute.pc_relevant.none-task-blog-2%7Edefault%7EBlogCommendFromBaidu%7ERate-5-116790296-blog-107604530.pc_relevant_3mothn_strategy_and_data_recovery&depth_1-utm_source=distribute.pc_relevant.none-task-blog-2%7Edefault%7EBlogCommendFromBaidu%7ERate-5-116790296-blog-107604530.pc_relevant_3mothn_strategy_and_data_recovery&utm_relevant_index=10 -->
        <div class="overflow-auto scrollbar" style="transform: scaleY(-1);">
            <div class="mt-15px flex items-start pt-10px" style="transform: scaleY(-1);" v-show="isRendered">
                <div class="canvas-wrapper" v-for="(item, index) in rArray" :key="index">
                    <canvas class="canvas" id="canvas" :data-width="item[0]" :data-height="item[1]" @click="click"></canvas>
                    <div class="bottom-0 left-0 right-0 pointer-events-none">{{ item[0] }}x{{ item[1] }}</div>
                </div>
            </div>
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

const isRendered = ref(false)
const netUrl = ref()
const rArray = ref<[number, number][]>([[120, 120], [180, 180], [512, 512], [1024, 1024]])
const aNum = ref()
const bNum = ref()

async function add() {
    if (aNum.value && bNum.value) {
        rArray.value.push([aNum.value, bNum.value])
        aNum.value = undefined
        bNum.value = undefined
        if (isRendered.value) {
            reset()
            toast("请重新选择图片")
        }
    }
}
function remove(index: number) {
    rArray.value.splice(index, 1)
    if (isRendered.value) {
        reset()
        toast("请重新选择图片")
    }
}

function reset() {
    const els = Array.prototype.slice.call(document.querySelectorAll(".icon-generate canvas"), 0)
    for (let i = 0; i < els.length; i++) {
        const canvas = els[i];
        clearCanvas(canvas)
    }
}

async function ok() {
    if (netUrl.value) {
        const img = netUrl.value // 'https://w.wallhaven.cc/full/m9/wallhaven-m9xyg8.jpg'
        isRendered.value = false
        const els = Array.prototype.slice.call(document.querySelectorAll(".icon-generate canvas"), 0)
        for (let i = 0; i < els.length; i++) {
            const el = els[i];
            await drawCanvas(el, img)
        }
        isRendered.value = true
    }
}
function chooseFile(e: Event) {
    const inputEl = e.target as HTMLInputElement
    if (inputEl && inputEl.files) {
        const file = inputEl.files[0]
        inputEl.value = ""
        var reader = new FileReader();
        reader.readAsArrayBuffer(file);
        isRendered.value = false
        reader.onload = async function (event) {
            if (event.target?.result) {
                let blob = new Blob([event.target.result], { type: file.type });
                const img = URL.createObjectURL(blob)
                const els = Array.prototype.slice.call(document.querySelectorAll(".icon-generate canvas"), 0)
                for (let i = 0; i < els.length; i++) {
                    const el = els[i];
                    await drawCanvas(el, img)
                }
                URL.revokeObjectURL(img)
                isRendered.value = true
            }
        }
    }
}
function loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        var img = new Image();
        img.setAttribute("crossOrigin", 'Anonymous')
        img.onload = function () {
            resolve(img)
        }
        img.onerror = function () {
            reject(img)
        }
        img.src = src;
    })
}
type ExtendHTMLCanvasElement = HTMLCanvasElement & {
    name?: string
    _url?: string
}
async function drawCanvas(canvas: ExtendHTMLCanvasElement, image: string) {
    const ctx = !!canvas.getContext && canvas.getContext('2d');
    if (ctx) {
        const img = await loadImage(image)
        const minValue = Math.min(img.width, img.height)
        const offsetX = minValue == img.height ? (img.width - img.height) / 2 : 0
        const offsetY = minValue == img.width ? (img.height - img.width) / 2 : 0
        canvas.width = canvas.dataset.width as unknown as number
        canvas.name = `icon-${canvas.dataset.width}x${canvas.dataset.height}`
        canvas._url = image
        canvas.height = canvas.dataset.height as unknown as number
        // ctx.save();
        ctx.beginPath();
        ctx.arc(canvas.width/2, canvas.height/2, canvas.width/2, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(img, offsetX, offsetY, minValue, minValue, 0, 0, canvas.width, canvas.height);
        // ctx.restore();
    }
}
async function clearCanvas(canvas: ExtendHTMLCanvasElement) {
    const ctx = !!canvas.getContext && canvas.getContext('2d');
    if (ctx) {
        delete canvas.name
        delete canvas._url
        isRendered.value = false
        ctx.clearRect(0, 0, canvas.width, canvas.height)
    }
}
function saveAll() {
    var zip = new JSZip();
    if (!isRendered.value) return
    const els = Array.prototype.slice.call(document.querySelectorAll(".icon-generate canvas"), 0)
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
            dlLink.download = "icons";
            dlLink.href = URL.createObjectURL(content);
            document.body.appendChild(dlLink);
            dlLink.click();
            document.body.removeChild(dlLink);
            URL.revokeObjectURL(dlLink.href)
        });
}
function click(e: MouseEvent) {
    const canvas = e.target as ExtendHTMLCanvasElement
    // @ts-ignore
    if (!canvas._url) {
        toast("请先选择图片生成图标")
        return
    }
    var imgURL = canvas.toDataURL("image/png", 1);
    var dlLink = document.createElement('a');
    // @ts-ignore
    dlLink.download = canvas.name;
    dlLink.href = imgURL;
    document.body.appendChild(dlLink);
    dlLink.click();
    document.body.removeChild(dlLink);
}
</script>