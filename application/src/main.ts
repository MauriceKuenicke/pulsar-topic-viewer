import { createApp } from "vue";
import "./styles.css";
import App from "./App.vue";
import router from "./router"
import VueApexCharts from "vue3-apexcharts";
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import '@mdi/font/css/materialdesignicons.min.css';
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

const vuetify = createVuetify({
    theme: {
        defaultTheme: 'darkTheme',
        themes: {
            darkTheme: {
                dark: true,
                colors: {
                    background: '#2f2f2f',
                    font: '#ffffff',
                    primary: '#C89B3C'
                }
            }
        }
    },
    components,
    directives,
})


createApp(App).use(VueApexCharts).use(router).use(vuetify).mount("#app");
