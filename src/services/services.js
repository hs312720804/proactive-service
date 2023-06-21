import fetch from 'cseed-frame/services/_fetch'

export function getServicesListAPI (params) {
  return fetch({
    method: 'get',
    url: 'proactive_admin_api/interactify/service/list',
    params
  })
}

export function addServicesAPI (data) {
  return fetch({
    method: 'post',
    url: 'proactive_admin_api/interactify/service/add',
    data
  })
}

export function deleteServicesAPI (params) {
  return fetch({
    method: 'delete',
    url: 'proactive_admin_api/interactify/service/del',
    params
  })
}

export function offlineServiceAPI (params) {
  return fetch({
    method: 'post',
    url: 'proactive_admin_api/interactify/service/offline',
    params
  })
}

export function getServiceAPI (params) {
  return fetch({
    method: 'get',
    url: 'proactive_admin_api/interactify/service/get',
    params
  })
}
