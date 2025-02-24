import Vue from 'vue'
import VueRouter from 'vue-router'
// import HomeView from '../views/HomeView.vue'
// import Test from '../components/test.vue'
// import Checkbox from '@/material/ph-checkbox.vue'
// import Radio from '@/material/ph-radio.vue'
// import Input from '@/material/ph-input.vue'
// import button from '@/material/ph-button.vue'
// import h1 from'@/material/ph-h1.vue'
// import textarea from'@/material/ph-textarea.vue'
import workspace from '@/components/workspace.vue'
import editpage from '@/components/editpage.vue'
import Userlogin from '@/components/login/userlogin.vue'
import Publish from '@/components/publish.vue'
import Preview from '@/components/preview.vue'
import test from '@/components/test.vue'

Vue.use(VueRouter)

const routes = [{
    path: '/',
    name: 'workspace',
    component: workspace
  },
  {
    path: '/editpage',
    name: 'editpage',
    component: editpage
  },
  {
    path: '/login',
    name: 'login',
    component: Userlogin
  },
  {
    path: '/publish',
    name: 'publish',
    component: Publish
  },
  {
    path: '/preview',
    name: 'preview',
    component: Preview
  },
  {
    path: '/QRcode',
    name: 'QRcode',
    component: (resolve) => require(['@/components/QRcode.vue'], resolve)
  },
  {
    path:'/test',
    name:'test',
    component: test
  }

]

const router = new VueRouter({
  routes
})

export default router