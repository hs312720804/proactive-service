import fetch from 'cseed-frame/services/_fetch'

export function getAnyliseVersionListAPI (params) { // 根据服务获取版本号列表
  return fetch({
    method: 'get',
    url: 'proactive_admin_api/interactify/analysis/listVersion',
    params
  })
}

export function getAnyliseTreeAPI (params) { // 根据版本id获取树结构转化率
  return fetch({
    method: 'get',
    url: 'proactive_admin_api/interactify/analysis/conversionRate',
    params
  })
}
