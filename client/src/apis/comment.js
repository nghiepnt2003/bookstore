import axios from '../axios'

export const apiPostComments = (data) => axios({
    url: `/comment/create`,
    method: 'post',
    data
})