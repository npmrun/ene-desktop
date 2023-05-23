import { App, ref } from 'vue'
import Component from './index.vue'
import params from './params'

Component.name = params.name
Component.install = function (app: App, option = {}) {
    app.component(params.name, Component)
}

export default Component
