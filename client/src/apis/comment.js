import axios from '../axios'

export const apiPostComments = (data) => axios({
    url: `/comment/create`,
    method: 'post',
    data
})

export const apiGetComment = (pid) => axios({
    url: `/comment/product/${pid}`,
    method: 'get'
})