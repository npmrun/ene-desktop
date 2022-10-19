import Page from "@/store/module/page"


export enum EPages {
    Home = "/home",
    Setting = "/setting",
    SettingTest = "/setting/test",
}

const Pages = {
    Home: "/home",
    Setting: "/setting",
    SettingTest: "/setting/test",
}

function usePages() {
    const router = useRouter()
    function navigateTo(key: keyof typeof Pages, parmas: string) {

    }
}
