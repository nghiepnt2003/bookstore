import axios from '../axios'

export const apiGetPublisher = (id) => axios({
    url: `/publisher/${id}`,
    method: 'get'
})

export const apiGetPublishers = (params) => axios({
    url: '/publisher',
    method: 'get',
    params
})

export const apiDeletePublisher = () => axios({
    url: '/publisher',
    method: 'get'
})

export const apiUpdatePublisher = (data,id) => axios({
    url: `/publisher/${id}`,
    method: 'put',
    data
})
export const apiCreatePublisher = (data) => axios({
    url: '/publisher/store',
    method: 'post',
    data
})

