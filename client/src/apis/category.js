import axios from '../axios'

export const apiUpdateCategory = (data, pcid) => axios({
    url: '/category/' + pcid,
    method: 'put',
    data
})
export const apiDeleteCategory = (pcid) => axios({
    url: '/category/' + pcid,
    method: 'delete',
})
export const apiCreateCategory = (data) => axios({
    url: '/category/store',
    method: 'post',
    data
})
