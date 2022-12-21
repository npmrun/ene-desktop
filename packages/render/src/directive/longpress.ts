import { Directive } from "vue"

type CustomElement = HTMLElement & {}

export default function (): Directive<any, any> {
    return {
        beforeMount(el: CustomElement, binding) {
            if (typeof binding.value !== "function") {
                throw "callback must be a function"
            }
            const handler = binding.value // 运行函数
            const ms = el.getAttribute("longpres:ms")
            let msNum = ms ? +ms : 600
            // 定义变量
            let pressTimer: ReturnType<typeof setTimeout> | null = null
            // 创建计时器（ 2秒后执行函数 ）
            let start = (e: MouseEvent | TouchEvent) => {
                if ((e as MouseEvent).button !== 0) {
                    return
                }
                if (pressTimer === null) {
                    pressTimer = setTimeout(() => {
                        handler(e)
                    }, msNum)
                }
            }
            // 取消计时器
            let cancel = (e: MouseEvent | TouchEvent) => {
                if (pressTimer !== null) {
                    clearTimeout(pressTimer)
                    pressTimer = null
                }
            }
            // 添加事件监听器
            el.addEventListener("mousedown", start)
            el.addEventListener("touchstart", start)
            // 取消计时器
            el.addEventListener("click", cancel)
            el.addEventListener("mouseout", cancel)
            el.addEventListener("touchend", cancel)
            el.addEventListener("touchcancel", cancel)
        },
    }
}
