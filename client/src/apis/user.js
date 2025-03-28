import axios from '../axios'

export const apiSendOTPCreateAccount = (data) => axios({
    url: `/user/SendOTPCreateAccount`,
    method: 'post',
    data
})
// ?email=${encodeURIComponent(data.email)}

// export const apiSendOTPCreateAccount = (username,email,phone,password) => axios({
//     url: `/user/SendOTPCreateAccount`,
//     method: 'get',
//     username,email,phone,password
// })

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

export const apiGetCurrent = () => axios({
    url: '/user/current',
    method: 'post'
})

export const apiGetUsers = (params) => axios({
    url: '/user?role=2',
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
    url: '/user/changePassword',
    method: 'put',
    data
})

export const apiUpdateUser1 = (data) => axios({
    url: '/user',
    method: 'put',
    data
})

export const apiOrder = (data) => axios({
    url: "/order/checkout",
    method: "post",
    data
})

export const apiCheckout = (id, data) => axios({
    url: `/cart/item/${id}/checkout`,
    method: "put",
    data
})

export const apiGetOrderUser = () => axios({
    url: "/order/getAllsByUser",
    method: "get"
})

export const apiGetAllOrder = () => axios({
    url: "/order/getAll",
    method: "get"
})

export const apiGetAllOrderByTime = (query) => axios({
    url: `/order/byTime${query}`,
    method: "get"
})

export const apiUpdateOrder = (data, oid) => axios({
    url: `/order/updateStatus/${oid}`,
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

export const apiGetAddress = () => axios({
    url: '/user/addresses',
    method: 'get',
})

export const apiCancelOrder = (id) => axios({
    url: `/order/${id}`,
    method: 'put',
})

export const apiForgotPassword = (email) => axios({
    url: `/user/forgotPassword?email=${email}`,
    method: 'get',
})

export const apiResetPassword = (data) => axios({
    url: `/user/resetPassword`,
    method: 'put',
    data
})

export const apiConfirmOrder = (id) => axios({
    url: `/order/confirmOrder/${id}`,
    method: 'put',
})

export const apiGetOrderById = (oid) => axios({
    url: "/order/" + oid,
    method: "get"
})

export const apiCreateMomoUrl = (id) => axios({
    url: '/order/payment-url/'+id,
    method: "get",
    withCredentials: true,
})

export const apiUpdateWishlist = (pid) => axios({
    url: `/user/${pid}/add-to-wishlist`,
    method: "post",
    withCredentials: true,
})

export const  apiRemoveProductInWishList = (pid) => axios({
    url: `/user/wishlist/${pid}`,
    method: "delete",
    withCredentials: true,
})

export const  apiGetWishList = () => axios({
    url: `/user/wishlist`,
    method: "get",
})

