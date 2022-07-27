import mitt, { Emitter } from "mitt"
import Msg from "./Msg"

type Events = {
    "app-message"?: any
}

const Mitt: Emitter<Events> = mitt<Events>()

export { Mitt, Msg }
