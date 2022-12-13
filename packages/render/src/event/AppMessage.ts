import { EventType } from "$Event/enumEvent"
import { useEvent } from "@/event/useEvent"

interface IRes {
    type: "tip"
    msg: string
}

export function useAppMessage(cb: (ev: IRes) => void) {
    const { on, off } = useEvent()
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
