import "virtual:windi.css"
import "virtual:windi-devtools"

import "virtual:svg-icons-register"
import "@/assets/style/common.less"
import "@/assets/style/common.scss"
import 'animate.css';

import { createApp } from "vue"
import App from "./App.vue"
import router from "@/router"
import pinia from "@/store"
import i18n from "@/i18n"
import directive from "@/directive"

import Vue3Toasity from "vue3-toastify"
import "vue3-toastify/dist/index.css"

const app = createApp(App)
app.use(Vue3Toasity, {
    hideProgressBar: true,
    autoClose: 3000,
})
app.use(directive)
app.use(pinia)
app.use(router)
app.use(i18n)
app.mount("#app")
