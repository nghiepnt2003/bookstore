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
// export const apiCreateProduct = (formData) => axios({
//     url: '/product/store', // Đường dẫn tới API
//     method: 'post',
//     data: formData,
//     headers: {
//         'Content-Type': 'multipart/form-data', // Đảm bảo gửi đúng kiểu dữ liệu
//     },
// })
// .then(response => response.data) // Trả về dữ liệu từ phản hồi
// .catch(error => {
//     console.error('Error creating product:', error);
//     throw error; // Ném lại lỗi để xử lý ở nơi gọi
// });
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
