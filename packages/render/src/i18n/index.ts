import { createI18n } from 'vue-i18n'
import messages from '@intlify/vite-plugin-vue-i18n/messages'

let locale = 'zh' 
const res = _agent.callSync("config.get")
locale = res.language

console.log(locale);
console.log(messages);

const i18n = createI18n({
    legacy: true,
    locale: locale,
    messages: messages,
})

export default i18n