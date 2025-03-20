import axios from "../axios";

export const apiCreateDiscount = (data) => axios({
  url: '/discount',
  method: 'post',
  data,
  withCredentials: true,
})

export const apiApplyProductInDiscount = (productId,discountId,data) => axios({
  url: `/discount/apply/${productId}/${discountId}`,
  method: 'put',
  data,
  withCredentials: true,
})

export const apiGetProductInDiscount = (discountId) => axios({
  url: `/product/discount/${discountId}`,
  method: 'get',
  withCredentials: true,
})

export const apiGetDiscount = (discountId) => axios({
  url: `/discount/${discountId}`,
  method: 'get',
  withCredentials: true,
})

export const apiUpdateDiscount = (data, fid) => axios({
  url: '/discount/' + fid,
  method: 'put',
  data,
  withCredentials: true,
})

export const apiDeleteDiscount = (fid) => axios({
  url: '/discount/' + fid,
  method: 'delete',
  withCredentials: true
})

export const apiGetAllDiscounts = (page = 1, name = undefined, startDate = undefined, endDate = undefined) => axios({
  url: `/discount?page=${page}${name ? `&name=${name}` : ''}${startDate ? `&startDate=${startDate}&endDate=${endDate}` : ''}`,
  method: 'get',
  withCredentials: true
})

export const apiGetProductsWithDiscount = () => axios({
  url: `/product/discount`,
  method: 'get',
  withCredentials: true,
})