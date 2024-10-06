import axios from '../axios'

export const apiGetCategories = () => axios({
    url: '/category/',
    method: 'get'
})

export const apiGetCategory = (id) => axios({
    url: `/category/${id}`,
    method: 'get'
})