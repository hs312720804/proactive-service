import fetch from 'cseed-frame/services/_fetch'

export function addServiceTimingAPI (data) { // 插入服务时机
  return fetch({
    method: 'post',
    url: 'proactive_admin_api/interactify/moment/add',
    data
  })
}

export function getServiceTimingDetail (params) { // 获取服务时机详情
  return fetch({
    method: 'get',
    url: 'proactive_admin_api/interactify/moment/get',
    params
  })
}

export function updateServiceTimingAPI (data) { // 更新服务时机
  return fetch({
    method: 'post',
    url: 'proactive_admin_api/interactify/moment/update',
    data
  })
}
