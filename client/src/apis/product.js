import axios from '../axios'

export const apiGetProducts = (params) => axios({
    url: '/product',
    method: 'get',
    params
})

export const apiGetProduct = (pid) => axios({
    url: '/product/' + pid,
    method: 'get'
})

export const apiGetAllBrand = () => axios({
    url: '/brand',
    method: 'get',
})
export const apiCreateProduct = (formData) => axios({
    url: '/product/store',
    method: 'post',
    data: formData,
})
export const apiGetProductsSearch = (params) => axios({
    url: '/product',
    method: 'get',
    params
})
export const apiUpdateProduct = (data, pid) => axios({
    url: '/product/' + pid,
    method: 'put',
    data
})

export const apiDeleteProduct = (pid) => axios({
    url: '/product/' + pid,
    method: 'delete',
})
export const apiGetInventories = () => axios({
    url: '/inventory/',
    method: 'get',
})
export const apiCreateInventory = (data) => axios({
    url: '/inventory/create',
    method: 'post',
    data
})
export const apiGetRecommendedProducts = (uid) => axios({
    url: '/product/recommendation/',
    method: 'get',
    withCredentials: true,
})
