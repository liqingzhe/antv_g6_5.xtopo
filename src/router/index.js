import Vue from 'vue'
import VueRouter from 'vue-router'
import TreeTopo from '../views/TreeTopo.vue'
import MyTopo from '../views/topo/index.vue'

Vue.use(VueRouter)

const routes = [
    {
        path: '/',
        name: 'home',
        component: MyTopo
    },
    {
        path: '/topo',
        name: 'topoView',
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () => import(/* webpackChunkName: "about" */ '../views/TopoView.vue')
    },
    {
        path: '/treetopo',
        name: 'TreeTopo',
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: TreeTopo
    }

]

const router = new VueRouter({
    mode: 'history',
    base: process.env.BASE_URL,
    routes
})

export default router
