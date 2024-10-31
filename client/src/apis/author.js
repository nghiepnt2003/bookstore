import axios from '../axios'

export const apiGetAuthors = () => axios({
    url: `/author`,
    method: 'get'
})

export const apiUpdateAuthor = (data, uid) => axios({
    url: '/user/' + uid,
    method: 'put',
    data
})
export const apiDeleteAuthor = (uid) => axios({
    url: '/user/' + uid,
    method: 'delete',
})