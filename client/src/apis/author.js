import axios from '../axios'

export const apiGetAuthors = (params) => axios({
    url: `/author`,
    method: 'get',
    params
})

export const apiUpdateAuthor = (data, id) => axios({
    url:  `/author/${id}`,
    method: 'put',
    data
})
export const apiDeleteAuthor = (id) => axios({
    url: `/author/${id}`,
    method: 'delete',
})

export const apiCreateAuthor = (data) => axios({
    url: '/author/store' ,
    method: 'post',
    data
})