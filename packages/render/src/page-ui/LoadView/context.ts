import { createContext, useContext } from "@/hook/useContext"

const LoadViewToken = Symbol("load-view-token")

interface IContext {
    state: {
        alwaysShow: true,
        showIcon: true,
        loading: false,
        empty: false,
        error: false,
        emptyLayout: string,
        errorTitle: string,
        errorBtnText: string,
        errorSubTitle: string,
        loadingText: string,
        emptyText: string,
        emptySubText: string,
    }
}

export function createLoadView<T>(context: T) {
    createContext<T>(context, LoadViewToken)
}

export function useLoadView() {
    return useContext(LoadViewToken)
}