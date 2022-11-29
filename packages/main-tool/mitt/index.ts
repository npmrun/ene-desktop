import mitt, { Emitter } from "mitt"
import Msg from "./Msg"

type events = "app-warnning"
            | "app-exit"

type Events = {
    "app-message"?: {
        event: events,
        msg?: string,
        data?: any
    }
    boot?: {
        argv: any
        cb?(...any): void
    }
}

const Mitt: Emitter<Events> = mitt<Events>()

export { Mitt, Msg }
