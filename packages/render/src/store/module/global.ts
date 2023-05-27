import { defineStore } from "pinia"

interface IPage {
    key: number | string,
    title: string,
    url: string
}

export const useGlobalStore = defineStore("global", {
    state: (): { topMenu: IPage[], bottomMenu: IPage[] } => ({
        topMenu: [
            { key: 0, title: "浏览器", url: "/browser" },
            { key: 1, title: "工具", url: "/home" },
            { key: 2, title: "代码", url: `/collect` },
            { key: 3, title: "代码片段", url: `/snippet` },
            { key: 4, title: "收藏家", url: `/bookmark` },
            { key: 5, title: "编辑器示例", url: `/demo-filetree` },
            { key: 6, title: "Demo-终端", url: `/demo-terminal` },
        ],
        bottomMenu: [
            { key: 7, title: "设置", url: "/setting" },
        ]
    }),
    actions: {

    },
})
