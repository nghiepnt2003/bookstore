import axios from '../axios'
export const apiGetBlogList = () => axios({
    url: '/blog/',
    method: 'get',
})
export const apiCreateBlog = (data) => axios({
    url: '/blog/store',
    method: 'post',
    data
})
export const apiGetMyBlogs = () => axios({
    url: '/blog/my-blogs',
    method: 'get',
})
export const apiUpdateBlog = (id, data) => axios({
    url: `/blog/${id}`,
    method: 'put',
    data
})
export const apiDeleteBlog = (id) => axios({
    url: `/blog/${id}/force`,
    method: 'delete',
})