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
            { key: 4, title: "Demo-树", url: `/demo-filetree` },
            { key: 5, title: "Demo-终端", url: `/demo-terminal` },
        ],
        bottomMenu: [
            { key: 6, title: "设置", url: "/setting" },
        ]
    }),
    actions: {

    },
})
