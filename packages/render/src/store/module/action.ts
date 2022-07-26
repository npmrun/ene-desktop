import { defineStore } from "pinia"

interface IAction {
    icon: string
    title?: string
    path: string
}

const initTop = [
    {
        icon: "source", // 'files'
        title: "编辑器",
        path: "/home",
    },
]
const initBottom = [
    {
        icon: "setting",
        title: "编辑器",
        path: "/setting",
    },
]
export default defineStore("action", {
    state: (): { _top: IAction[]; _bottom: IAction[] } => ({
        _top: initTop,
        _bottom: initBottom,
    }),
    getters: {
        topActions: state => state._top,
        bottomActions: state => state._bottom,
    },
})
