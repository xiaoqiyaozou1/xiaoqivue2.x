// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'

import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
Vue.use(ElementUI)


import './assets/global.css'
import less from 'less'
Vue.use(less)

//全局配置并使用axios
import axios from 'axios'
// 配置请求的跟路径
axios.defaults.baseURL = 'http://localhost:8081/'
// 在 request 拦截器中，展示进度条 NProgress.start()
axios.interceptors.request.use(config => {
  // console.log(config)
  //NProgress.start()
  config.headers.Authorization = window.sessionStorage.getItem('token')
  console.log(window.sessionStorage.getItem('token'))
  // 在最后必须 return config
  return config
})

// 在 response 拦截器中，隐藏进度条 NProgress.done()
// axios.interceptors.response.use(config => {
//   if (config.status!==200) {
//     // 刷新token

//     alert("用户无权限！");
//   }
//  // NProgress.done()
//   return config
// })
axios.interceptors.response.use(
  response => {
    //拦截响应，做统一处理 
    // if (response.data.code) {
    //   switch (response.data.code) {
    //     case 1002:
    //       store.state.isLogin = false
    //       router.replace({
    //         path: 'login',
    //         query: {
    //           redirect: router.currentRoute.fullPath
    //         }
    //       })
    //   }
    // }


    console.log(response.code)
    return response
  },
  //接口错误状态处理，也就是说无响应时的处理
  error => {
    var msg = "";
    if (error.response.status === 401) {
      msg = "未登录请登录"
      Vue.prototype.$message({
        type: "error",
        message: msg
      });
      router.push('/Login')
    }
    if (error.response.status === 403) {
      msg = "无权限"
      Vue.prototype.$message({
        type: "error",
        message: msg
      });
    }

    // alert(error.response.status)
    return Promise.reject(error.response.status) // 返回接口返回的错误信息
  })
Vue.prototype.$http = axios

Vue.config.productionTip = false
/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  render: h => h(App),
  mounted() {

  }
  // components: { App },
  // template: '<App/>'
})


router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  if (requiresAuth) {
    mgr.getRole().then(
      sucess => {
        if (to.meta.role == sucess) {
          next();
        } else {
          next('/accessdenied');
        }
      },
      err => {
        console.log(err);
      }
    );
  } else {
    next();
  }
});
