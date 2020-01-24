import request from '@/utils/request'

export function fetchProductList(query) {
  return request({
    url: '/product/getProductList',
    method: 'get',
    params: query
  })
}

export function addProduct(data) {
  return request({
    url: '/product/addProduct',
    method: 'post',
    data
  })
}

export function updateProduct(data) {
  return request({
    url: '/product/updateProduct',
    method: 'post',
    data
  })
}

export function delProduct(data) {
  return request({
    url: '/product/deleteProduct',
    method: 'post',
    data
  })
}
