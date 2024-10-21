import axios from '../axios'

export const apiGetPublisher = (id) => axios({
    url: `/publisher/${id}`,
    method: 'get'
})