import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/link/getLinkList',
    method: 'get',
    params: query
  })
}

export function addLink(data) {
  return request({
    url: '/link/addLink',
    method: 'post',
    data
  })
}

