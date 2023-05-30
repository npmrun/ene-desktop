import { defineStore } from "pinia"

interface IPage {
    key: number | string,
    title: string,
    url: string
}

let id = 0
function getID() {
    return ++id
}

let topMenu = [
    { key: getID(), title: "浏览器", url: "/browser" },
    { key: getID(), title: "收藏家", url: `/bookmark` }
]

if (import.meta.env.DEV) {
    topMenu = topMenu.concat([
        { key: getID(), title: "Demo", url: "/test" },
        { key: getID(), title: "工具", url: "/home" },
        { key: getID(), title: "代码", url: `/collect` },
        { key: getID(), title: "代码片段", url: `/snippet` },
        { key: getID(), title: "编辑器示例", url: `/demo-filetree` },
        { key: getID(), title: "Demo-终端", url: `/demo-terminal` },
    ])
}

export const useGlobalStore = defineStore("global", {
    state: (): { topMenu: IPage[], bottomMenu: IPage[] } => ({
        topMenu: topMenu,
        bottomMenu: [
            { key: getID(), title: "设置", url: "/setting" },
        ]
    }),
    actions: {

    },
})
