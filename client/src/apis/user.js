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