import axios from '../axios'

export const apiSendOTPCreateAccount = (data) => axios({
    url: `/user/SendOTPCreateAccount?email=${encodeURIComponent(data.email)}`,
    method: 'get',
    data
})

export const apiRegister = (data) => axios({
    url: '/user/register',
    method: 'post',
    data
})


export const apiLogin = (data) => axios({
    url: '/user/login',
    method: 'post',
    data
})

// export const apiFogotPassword = (data) => axios({
//     url: '/fogotpassword',
//     method: 'get',
//     data
// })

export const apiGetCurrent = () => axios({
    url: '/user/current',
    method: 'post'
})

export const apiGetUsers = (params) => axios({
    url: '/user',
    method: 'get',
    params
})

export const apiUpdateUser = (data, uid) => axios({
    url: '/user/' + uid,
    method: 'put',
    data
})
export const apiDeleteUser = (uid) => axios({
    url: '/user/' + uid,
    method: 'delete',
})

export const apiChangePassword = (data) => axios({
    url: '/user/customer/resetpassword',
    method: 'put',
    data
})

export const apiUpdateUser1 = (data) => axios({
    url: '/user/customer',
    method: 'put',
    data
})

export const apiOrder = (data) => axios({
    url: "/order/checkout",
    method: "post",
    data
})

export const apiGetOrderUser = () => axios({
    url: "/bill",
    method: "get"
})

export const apiGetAllOrder = () => axios({
    url: "/bill/admin",
    method: "get"
})

export const apiGetAllOrderByTime = (query) => axios({
    url: `/bill/list${query}`,
    method: "get"
})

export const apiUpdateOrder = (data, oid) => axios({
    url: `/bill/status/${oid}`,
    method: "put",
    data
})

export const apiUpdateCart = (data) => axios({
    url: '/cart/items',
    method: 'post',
    data
})

export const apiRemoveCart = (pid) => axios({
    url: '/cart/items/' + pid,
    method: 'delete',
})
export const apiGetUserCart = () => axios({
    url: '/cart',
    method: 'get',
})