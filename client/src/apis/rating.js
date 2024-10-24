import axios from '../axios'

export const apiPostRating = (params) => axios({
    url: `/rating/create`,
    method: 'post',
    params
})

export const apiGetRating = (pid) => axios({
    url: '/product/' + pid,
    method: 'get'
})