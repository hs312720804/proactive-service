import fetch from 'cseed-frame/services/_fetch'

export function onlineVersionAPI (params) { // 上线服务交互
  return fetch({
    method: 'get',
    url: 'proactive_admin_api/interactify/node/online',
    params
  })
}
