// @ts-ignore
import { createRouter, createWebHashHistory } from "vue-router";
import CreateConnection from "./windows/CreateConnectionDialog.vue";
import SelectConnectionWindow from "./windows/SelectConnectionWindow.vue";
import TopicDashboard from "./windows/TopicDashboard.vue";

const routes = [
    {
        path: "",
        name: "SelectConnectionWindow", component: SelectConnectionWindow
    },
    {
        path: "/create-connection-window",
        name: "CreateConnectionWindow", component: CreateConnection
    },
    {
        path: "/topic-dashboard",
        name: "TopicDashboard", component: TopicDashboard
    },
]

const router = createRouter({
    history: createWebHashHistory(),
    // @ts-ignore
    base: "/", routes
})

export default router