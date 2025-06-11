import axios from '../axios'

export const apiPostRating = (data) => axios({
    url: `/rating/create`,
    method: 'post',
    data
})

export const apiGetRating = (pid) => axios({
    url: `rating?product=${pid}`,
    method: 'get'
})
