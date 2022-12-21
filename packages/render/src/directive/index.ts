import { App, ref } from 'vue'
import loading from './Loading'
import longpress from './longpress'

export default {
    install(app: App) {
        app.use(loading)
        app.directive("longpress", longpress())
    },
}
