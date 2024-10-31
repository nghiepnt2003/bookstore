import axios from '../axios'

export const apiGetPublisher = (id) => axios({
    url: `/publisher/${id}`,
    method: 'get'
})

export const apiGetPublishers = () => axios({
    url: '/publisher',
    method: 'get'
})

