import Vue from 'vue'
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
        if (error == 404) {
            Vue.prototype.$message({
                type: "error",
                message: "接口不存在"
            });
            router.push('/Login')
        }
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

/**登录方法 */
export const Login = (params) => {
    return axios.get('api/Login/Login');
}

/**获取用户所有信息 */
export const getSysUsers = () => {
    return axios.get('api/SysUser/GetSysUsers')
}

/**根据用户id 获取用户信息 */
export const getSysUserById = (id) => {
    return axios.get('api/SysUser/GetByUserId', {
        params: {
            id: id
        }
    })
}

/**更新用户信息 */
export const updateSysUser = (params) => {
    return axios.put('api/SysUser/UpdateSysUser', params)
}

/**添加用户信息 */
export const addSysUser = (params) => {
    return axios.post('/api/SysUser/AddSysUser', params)
}
/**根据id删除用户信息 */
export const deleteSysUser = (id) => {
    return axios.delete('/api/SysUser/DeleteById', {
        params: {
            id: id
        }
    })
}

/**根据分页条件 获取用户信息 */
export const getUsersPage = (params) => {
    return axios.get('api/SysUser/GetUsersPage', {
        params: params
    })
}



/**获取角色信息 */
export const getSysRoles = () => {
    return axios.get('/api/SysRole/GetSysRoles')
}

/**根据id 获取角色信息 */
export const getSysRoleById = (id) => {
    return axios.get('/api/SysRole/GetSysRoleById', {
        params: {
            id: id
        }
    })
}
/**增加角色信息 */
export const addSysRole = (params) => {
    return axios.post('/api/SysRole/AddSysRole', params)
}
/**更新角色信息 */
export const updateSysRole = (params) => {
    return axios.put('/api/SysRole/UpdateSysRole', params)
}
/**根据 id 删除角色信息 */
export const deleteSysRole = (id) => {
    return axios.delete('/api/SysRole/DeleteById', {
        params: {
            id: id
        }
    })
}

/**分页查询 */
export const getSysRolesPage = (params) => {
    return axios.get('/api/SysRole/GetRolesPage', {
        params: params
    })
}




/**获取所有资源信息 */
export const getSysResoureces = () => {
    return axios.get('/api/SysResources/GetSysResourcess');
}

/**根据id 获取信息 */
export const getSysResoureceById = (id) => {
    return axios.get('/api/SysResources/GetSysResoureceById', {
        params: {
            id: id
        }
    })
}

/**添加资源信息 */
export const addSysResource = (params) => {
    return axios.post('/api/SysResources/AddSysResources', params)
}

/**更新资源信息 */
export const updateSysResource = (params) => {
    return axios.put('/api/SysResources/UpdateSysResources', params)
}

/**根据id删除资源信息 */
export const deleteSysResource = (id) => {
    return axios.delete('/api/SysResources/DeleteById', {
        params: {
            id: id
        }
    })
}

/**根据分页获取资源信息 */
export const getSysResourcesPage = (params) => {
    return axios.get('/api/SysResources/GetSysResourecesPage', {
        params: params

    })
}

