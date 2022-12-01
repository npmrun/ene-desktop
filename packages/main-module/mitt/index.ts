import mitt, { Emitter } from "mitt"
import Msg from "./Msg"

type events = "client"

type Events = {
    "app-message"?: {
        event: events,
        msg?: string,
        data?: any
    }
    exit?: {
        code?: any
    }
    boot?: {
        argv: any
        cb?(...any): void
    }
}

const Mitt: Emitter<Events> = mitt<Events>()

export { Mitt, Msg }
