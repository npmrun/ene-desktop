import { EventType } from "$Event/enumEvent"
import { TinyEmitter } from "tiny-emitter"

const emitter = new TinyEmitter()

export function useEvent() {
    return {
        EventType,
        on(event: EventType, callback: Function, ctx?: any) {
            return emitter.on(event, callback, ctx)
        },
        off(event: EventType, callback?: Function | undefined) {
            return emitter.off(event, callback)
        },
        emit(event: EventType, ...args: any[]) {
            return emitter.emit(event, ...args)
        },
        once(event: EventType, callback: Function, ctx?: any) {
            return emitter.once(event, callback, ctx)
        },
    }
}
