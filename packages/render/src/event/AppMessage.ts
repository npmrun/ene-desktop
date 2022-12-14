import { EventType } from "$Event/enumEvent"
import { useEvent } from "@/event/useEvent"

interface IRes {
    type: "tip" | "error"
    msg: string
}

interface IOpts {
    tip?: (str: string) => void
    error?: (errMsg: string) => void
}

export function useAppMessage(opts: IOpts) {
    const { on, off } = useEvent()
    function cb(ev: IRes) {
        if (ev.type === "tip") {
            opts.tip?.(ev.msg)
        }
        if (ev.type === "error") {
            opts.error?.(ev.msg)
        }
    }
    on(EventType.AppMessage, cb)
    onBeforeUnmount(() => {
        off(EventType.AppMessage, cb)
    })
}

/**
 * 显示在App底部的tip内容
 * @param msg 消息内容
 */
export function sendTip(msg: string) {
    const { emit } = useEvent()
    emit(EventType.AppMessage, { type: "tip", msg: msg })
}
