import Vue from 'vue'
import Router from 'vue-router'
import HelloWorld from '@/components/HelloWorld'
import Home from '@/Home'
import UserInfo from '@/components/UserInfo/UserInfo'
import RoleInfo from '@/components/Right/RoleInfo'
import MenuInfo from '@/components/Right/MenuInfo'
import Login from '@/components/Login'
Vue.use(Router)

export default new Router({
  routes: [{
    path: '/',
    redirect: '/Login'
  }, {
    path: '/Login',
    name: 'Login',
    component: Login,

  },

  {
    path: '/Home',
    name: 'Home',
    component: Home,
    redirect: '/HelloWorld',
    children: [
      {
        path: '/',
        name: 'HelloWorld',
        component: HelloWorld,

      },
      { path: '/UserInfo', component: UserInfo },
      { path: '/RoleInfo', component: RoleInfo },
      { path: '/MenuInfo', component: MenuInfo }

    ]
  }
  ]
})
